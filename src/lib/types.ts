export type Role = "member" | "admin";

export type Member = {
  id: string;
  email: string;
  full_name: string;
  nickname: string | null;
  role: Role;
  is_active: boolean;
  /** True zolang er enkel een plaatshouder-adres is en er geen mail heen mag. */
  email_pending: boolean;
  created_at: string;
};

export type Season = {
  id: string;
  name: string;
  target_amount: number;
  starts_on: string;
  ends_on: string;
  is_active: boolean;
};

export type Result = {
  id: string;
  member_id: string;
  season_id: string;
  played_on: string;
  venue: string;
  tournament: string | null;
  finish_position: number | null;
  buyin: number;
  cashout: number;
  profit: number;
  contribution: number;
  is_paid: boolean;
  note: string | null;
  created_at: string;
};

export type ResultWithMember = Result & {
  members: Pick<Member, "id" | "full_name" | "nickname"> | null;
};

export type LeaderboardRow = {
  season_id: string;
  member_id: string;
  display_name: string;
  full_name: string;
  entries: number;
  cashes: number;
  contributed: number;
  paid: number | null;
  profit: number;
  buyin: number;
  last_played: string | null;
};

export type SeasonTotals = {
  season_id: string;
  name: string;
  target_amount: number;
  starts_on: string;
  ends_on: string;
  is_active: boolean;
  contributions: number;
  contributions_received: number;
  profit: number;
  entries: number;
  contributors: number;
};

export type ClubTotals = {
  pot: number;
  openstaand: number;
  ontvangen: number;
  leden: number;
};

export type MemberLedger = {
  member_id: string;
  display_name: string;
  full_name: string;
  is_active: boolean;
  role: Role;
  ontvangen: number;
  openstaand: number;
  bijgedragen: number;
  correcties: number;
  verbruikt: number;
  aandeel: number;
};

export type MemberAdjustment = {
  id: string;
  member_id: string;
  amount: number;
  kind: "startsaldo" | "correctie";
  reason: string;
  is_paid: boolean;
  created_by: string | null;
  created_at: string;
};

export type Activity = {
  id: string;
  name: string;
  happened_on: string;
  total_cost: number;
  note: string | null;
  created_at: string;
  participants: number;
  uit_de_pot: number;
};

export type ActivityCharge = {
  activity_id: string;
  member_id: string;
  amount: number;
};

export type NotificationKind = "nieuwe_cash" | "like" | "reactie";

export type NotificationItem = {
  id: string;
  member_id: string;
  kind: NotificationKind;
  is_read: boolean;
  created_at: string;
  result_id: string | null;
  actor_id: string | null;
  actor_name: string | null;
  cashout: number | null;
  buyin: number | null;
  contribution: number | null;
  played_on: string | null;
  tournament: string | null;
  venue: string | null;
  comment_body: string | null;
};

export type FeedItem = {
  id: string;
  member_id: string;
  season_id: string;
  played_on: string;
  venue: string;
  tournament: string | null;
  finish_position: number | null;
  buyin: number;
  cashout: number;
  profit: number;
  contribution: number;
  is_paid: boolean;
  note: string | null;
  created_at: string;
  full_name: string;
  display_name: string;
  like_count: number;
  comment_count: number;
};

export type ResultComment = {
  id: string;
  result_id: string;
  member_id: string;
  body: string;
  created_at: string;
  members: Pick<Member, "id" | "full_name" | "nickname"> | null;
};

export type ProposalStatus = "open" | "gekozen" | "gesloten";

export type Proposal = {
  id: string;
  season_id: string;
  title: string;
  description: string | null;
  estimated_cost: number | null;
  status: ProposalStatus;
  created_at: string;
  created_by: string | null;
  author: string | null;
  votes: number;
};
