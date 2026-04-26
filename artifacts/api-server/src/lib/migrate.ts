import { pool } from "@workspace/db";
import { logger } from "./logger";

export async function runMigrations(): Promise<void> {
  logger.info("Running startup migrations…");

  await pool.query(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;

    CREATE TABLE IF NOT EXISTS users (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email       TEXT NOT NULL UNIQUE,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS magic_tokens (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ NOT NULL,
      used_at     TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token       TEXT NOT NULL UNIQUE,
      expires_at  TIMESTAMPTZ NOT NULL,
      revoked_at  TIMESTAMPTZ,
      created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS texts (
      id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title                       TEXT NOT NULL DEFAULT '',
      content                     TEXT NOT NULL DEFAULT '',
      phase                       INTEGER NOT NULL DEFAULT 1,
      total_phases                INTEGER NOT NULL DEFAULT 3,
      recall_pct                  INTEGER NOT NULL DEFAULT 0,
      phase_color                 TEXT NOT NULL DEFAULT '#818CF8',
      next_session_time           TEXT NOT NULL DEFAULT '',
      next_session_label          TEXT NOT NULL DEFAULT '',
      days_left                   INTEGER NOT NULL DEFAULT 0,
      consecutive_good_sessions   INTEGER NOT NULL DEFAULT 0,
      session_count_in_phase      INTEGER NOT NULL DEFAULT 0,
      created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text_id       UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      phase         INTEGER NOT NULL,
      score         INTEGER NOT NULL DEFAULT 0,
      completed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS deadlines (
      id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text_id          UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
      user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      deadline_date    DATE NOT NULL,
      mode             TEXT NOT NULL DEFAULT 'spaced',
      next_session_at  TIMESTAMPTZ,
      created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS consecutive_good_sessions INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS session_count_in_phase INTEGER NOT NULL DEFAULT 0;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS content_type TEXT NOT NULL DEFAULT 'passage';
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS my_character_name TEXT;
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS acronyms (
      id            SERIAL PRIMARY KEY,
      text_id       TEXT NOT NULL UNIQUE,
      acronym       TEXT NOT NULL,
      explanation   TEXT NOT NULL,
      status        TEXT NOT NULL DEFAULT 'pending',
      error_message TEXT,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS mode TEXT;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS next_review_due DATE;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS fsrs_stability FLOAT;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS fsrs_difficulty FLOAT;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS fsrs_reps INTEGER DEFAULT 0;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS fsrs_lapses INTEGER DEFAULT 0;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS fsrs_state INTEGER DEFAULT 0;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS fsrs_last_review TIMESTAMPTZ;
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS last_flash_date TIMESTAMPTZ;

    CREATE TABLE IF NOT EXISTS reviews (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      text_id       UUID NOT NULL REFERENCES texts(id) ON DELETE CASCADE,
      user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      rating        INTEGER NOT NULL,
      reviewed_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      next_due      DATE NOT NULL,
      stability     FLOAT NOT NULL DEFAULT 0,
      difficulty    FLOAT NOT NULL DEFAULT 0,
      interval_days INTEGER NOT NULL DEFAULT 0,
      created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    ALTER TABLE texts
      ADD COLUMN IF NOT EXISTS chunks JSONB;
    ALTER TABLE sessions
      ADD COLUMN IF NOT EXISTS chunk_index INTEGER;
  `);

  logger.info("Migrations complete");
}
