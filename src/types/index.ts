export type UserRole = "client" | "expert" | "both";

export type RequestStatus =
  | "pending"
  | "claimed"
  | "in_call"
  | "completed"
  | "cancelled"
  | "expired";

export type CallStatus = "connecting" | "active" | "ended";

export type ExpertStatus = "online" | "offline" | "in_call";

export type Community = {
  id: string;
  name: string;
  emoji: string;
  slug: string;
  active: boolean;
  expert_count?: number;
};

export type Profile = {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  role: UserRole;
  avatar_url?: string;
  wallet_balance: number; // in agorot
  created_at: string;
};

export type ExpertProfile = {
  id: string;
  user_id: string;
  community_id: string;
  bio?: string;
  skills: string[];
  rate_per_minute: number; // in agorot
  min_call_minutes: number;
  status: ExpertStatus;
  rating: number;
  total_calls: number;
  is_kyc_verified: boolean;
  payout_balance: number; // in agorot (80% of earned)
  profile?: Profile;
  community?: Community;
};

export type HelpRequest = {
  id: string;
  client_id: string;
  community_id: string;
  description: string;
  tags: string[];
  max_rate_per_minute: number; // in agorot
  status: RequestStatus;
  claimed_by?: string;
  call_id?: string;
  created_at: string;
  expires_at: string;
  client?: Profile;
  expert?: ExpertProfile;
};

export type Call = {
  id: string;
  request_id: string;
  client_id: string;
  expert_id: string;
  livekit_room: string;
  started_at?: string;
  ended_at?: string;
  duration_seconds?: number;
  total_charged: number; // in agorot
  expert_earned: number; // in agorot (80%)
  status: CallStatus;
  client_rating?: number;
  client_review?: string;
};

export type WalletTransaction = {
  id: string;
  user_id: string;
  amount: number; // in agorot, positive=credit, negative=debit
  type: "topup" | "call_charge" | "refund" | "bonus" | "payout";
  description: string;
  reference_id?: string;
  created_at: string;
};
