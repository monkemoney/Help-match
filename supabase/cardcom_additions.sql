-- Run this after schema.sql
-- Alters reference_id to text (Cardcom transaction IDs are numeric strings)
alter table public.wallet_transactions
  alter column reference_id type text using reference_id::text;

-- credit_wallet: atomically credit user wallet and record transaction
-- Called by Cardcom webhook (via service role key)
create or replace function public.credit_wallet(
  p_user_id uuid,
  p_amount integer,         -- in agorot
  p_reference_id text,
  p_description text
)
returns void language plpgsql security definer as $$
begin
  -- Credit balance
  update public.profiles
  set wallet_balance = wallet_balance + p_amount,
      updated_at = now()
  where id = p_user_id;

  -- Record transaction
  insert into public.wallet_transactions (user_id, amount, type, description, reference_id)
  values (p_user_id, p_amount, 'topup', p_description, p_reference_id);
end;
$$;
