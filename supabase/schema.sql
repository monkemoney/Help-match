-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================
-- PROFILES
-- ============================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  phone text,
  role text not null default 'client' check (role in ('client', 'expert', 'both')),
  avatar_url text,
  wallet_balance integer not null default 0, -- in agorot
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', 'משתמש'),
    coalesce(new.raw_user_meta_data->>'role', 'client')
  );
  -- Give welcome bonus
  insert into public.wallet_transactions (user_id, amount, type, description)
  values (new.id, 5000, 'bonus', 'בונוס הצטרפות');
  update public.profiles set wallet_balance = 5000 where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- COMMUNITIES
-- ============================================
create table public.communities (
  id text primary key,
  name text not null,
  emoji text not null,
  slug text not null unique,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

insert into public.communities (id, name, emoji, slug, active) values
  ('ai-vibe-coding', 'AI & Vibe Coding', '🤖', 'ai-vibe-coding', true),
  ('shopify', 'Shopify', '🛒', 'shopify', false),
  ('figma', 'Figma & Design', '🎨', 'figma', false),
  ('notion', 'Notion & Productivity', '📊', 'notion', false);

-- ============================================
-- EXPERT PROFILES
-- ============================================
create table public.expert_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  community_id text references public.communities(id) not null,
  bio text,
  skills text[] not null default '{}',
  rate_per_minute integer not null default 1000, -- in agorot (10 ₪)
  min_call_minutes integer not null default 3,
  status text not null default 'offline' check (status in ('online', 'offline', 'in_call')),
  rating numeric(3,2) not null default 5.00,
  total_calls integer not null default 0,
  is_kyc_verified boolean not null default false,
  payout_balance integer not null default 0, -- in agorot
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.expert_profiles enable row level security;

create policy "Anyone can view expert profiles" on public.expert_profiles
  for select using (true);

create policy "Experts can update their own profile" on public.expert_profiles
  for update using (auth.uid() = user_id);

create policy "Users can insert their own expert profile" on public.expert_profiles
  for insert with check (auth.uid() = user_id);

-- ============================================
-- HELP REQUESTS
-- ============================================
create table public.help_requests (
  id uuid default uuid_generate_v4() primary key,
  client_id uuid references public.profiles(id) not null,
  community_id text references public.communities(id) not null,
  description text not null,
  tags text[] not null default '{}',
  max_rate_per_minute integer not null, -- in agorot
  status text not null default 'pending'
    check (status in ('pending', 'claimed', 'in_call', 'completed', 'cancelled', 'expired')),
  claimed_by uuid references public.expert_profiles(id),
  call_id uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '5 minutes')
);

alter table public.help_requests enable row level security;

create policy "Clients can view their own requests" on public.help_requests
  for select using (auth.uid() = client_id);

create policy "Experts can view pending requests in their community" on public.help_requests
  for select using (
    status = 'pending' and
    exists (
      select 1 from public.expert_profiles
      where user_id = auth.uid() and community_id = help_requests.community_id
    )
  );

create policy "Clients can insert requests" on public.help_requests
  for insert with check (auth.uid() = client_id);

create policy "Clients can cancel their own requests" on public.help_requests
  for update using (auth.uid() = client_id and status = 'pending');

-- ============================================
-- CALLS
-- ============================================
create table public.calls (
  id uuid default uuid_generate_v4() primary key,
  request_id uuid references public.help_requests(id) not null unique,
  client_id uuid references public.profiles(id) not null,
  expert_id uuid references public.expert_profiles(id) not null,
  livekit_room text not null,
  started_at timestamptz,
  ended_at timestamptz,
  duration_seconds integer,
  total_charged integer not null default 0, -- in agorot
  expert_earned integer not null default 0, -- in agorot (80%)
  status text not null default 'connecting' check (status in ('connecting', 'active', 'ended')),
  client_rating integer check (client_rating between 1 and 5),
  client_review text,
  created_at timestamptz not null default now()
);

alter table public.calls enable row level security;

create policy "Participants can view their calls" on public.calls
  for select using (
    auth.uid() = client_id or
    exists (select 1 from public.expert_profiles where id = expert_id and user_id = auth.uid())
  );

create policy "System can insert calls" on public.calls
  for insert with check (auth.uid() = client_id);

create policy "Participants can update their calls" on public.calls
  for update using (
    auth.uid() = client_id or
    exists (select 1 from public.expert_profiles where id = expert_id and user_id = auth.uid())
  );

-- ============================================
-- WALLET TRANSACTIONS
-- ============================================
create table public.wallet_transactions (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  amount integer not null, -- positive=credit, negative=debit (agorot)
  type text not null check (type in ('topup', 'call_charge', 'refund', 'bonus', 'payout')),
  description text not null,
  reference_id uuid,
  created_at timestamptz not null default now()
);

alter table public.wallet_transactions enable row level security;

create policy "Users can view their own transactions" on public.wallet_transactions
  for select using (auth.uid() = user_id);

-- ============================================
-- CLAIM REQUEST FUNCTION (race-condition safe)
-- ============================================
create or replace function public.claim_request(
  request_id uuid,
  expert_user_id uuid
)
returns json language plpgsql security definer as $$
declare
  expert_rec public.expert_profiles;
  req public.help_requests;
  new_call public.calls;
  room_name text;
begin
  -- Lock the request row
  select * into req from public.help_requests
  where id = request_id and status = 'pending' and expires_at > now()
  for update skip locked;

  if not found then
    raise exception 'Request not available';
  end if;

  -- Get expert
  select * into expert_rec from public.expert_profiles
  where user_id = expert_user_id;

  if not found then
    raise exception 'Expert profile not found';
  end if;

  -- Check expert rate is within budget
  if expert_rec.rate_per_minute > req.max_rate_per_minute then
    raise exception 'Expert rate exceeds client budget';
  end if;

  -- Create LiveKit room name
  room_name := 'call-' || request_id::text;

  -- Create the call record
  insert into public.calls (
    request_id, client_id, expert_id, livekit_room, status
  ) values (
    request_id, req.client_id, expert_rec.id, room_name, 'connecting'
  ) returning * into new_call;

  -- Update request status
  update public.help_requests
  set status = 'claimed', claimed_by = expert_rec.id, call_id = new_call.id
  where id = request_id;

  -- Set expert status to in_call
  update public.expert_profiles set status = 'in_call' where id = expert_rec.id;

  return json_build_object('call_id', new_call.id, 'room', room_name);
end;
$$;

-- ============================================
-- REALTIME
-- ============================================
alter publication supabase_realtime add table public.help_requests;
alter publication supabase_realtime add table public.calls;
alter publication supabase_realtime add table public.expert_profiles;
