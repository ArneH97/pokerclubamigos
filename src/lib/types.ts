export type Role = "member" | "admin";

export type Member = {
  id: string;
  email: string;
  full_name: string;
  nickname: string | null;
  role: Role;
  is_active: boolean;
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
  pot: number;
  pot_paid: number;
  profit: number;
  entries: number;
  contributors: number;
};
