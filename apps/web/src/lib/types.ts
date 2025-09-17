export type Vote = {
  id: string; // = userId
  userId: string; // PK
  choice: "yes" | "no";
  createdAt: string; // ISO
};

export type VotesSummary = {
  total: number;
  yes: number;
  no: number;
  ratioYes: number;
  votes: Vote[];
};

export type SessionUser = {
  id: string;
  name: string;
  email?: string;
  provider: "github" | "local";
} | null;
