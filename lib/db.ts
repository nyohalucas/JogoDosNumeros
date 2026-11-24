import { neon } from "@neondatabase/serverless";

export type Difficulty = "facil" | "medio" | "dificil";

export interface RankingEntry {
  id: number;
  player_name: string;
  difficulty: Difficulty;
  attempts: number;
  secret_number: number;
  created_at: string;
}

export function getSql() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return null;
  }
  return neon(databaseUrl);
}

let tableInitialized = false;

export async function ensureRankingsTable() {
  const sql = getSql();
  if (!sql) return false;
  if (tableInitialized) return true;

  await sql`
    CREATE TABLE IF NOT EXISTS rankings (
      id SERIAL PRIMARY KEY,
      player_name VARCHAR(60) NOT NULL,
      difficulty VARCHAR(10) NOT NULL CHECK (difficulty IN ('facil', 'medio', 'dificil')),
      attempts INTEGER NOT NULL CHECK (attempts > 0),
      secret_number INTEGER NOT NULL,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_rankings_diff_attempts
    ON rankings (difficulty, attempts ASC, created_at ASC)
  `;

  tableInitialized = true;
  return true;
}
