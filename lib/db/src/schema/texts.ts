import { pgTable, text, integer, timestamp, uuid, real, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const textsTable = pgTable("texts", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  phase: integer("phase").notNull().default(1),
  totalPhases: integer("total_phases").notNull().default(3),
  recallPct: integer("recall_pct").notNull().default(0),
  phaseColor: text("phase_color").notNull().default("#818CF8"),
  nextSessionTime: text("next_session_time").notNull().default(""),
  nextSessionLabel: text("next_session_label").notNull().default(""),
  daysLeft: integer("days_left").notNull().default(0),
  consecutiveGoodSessions: integer("consecutive_good_sessions").notNull().default(0),
  sessionCountInPhase: integer("session_count_in_phase").notNull().default(0),
  contentType: text("content_type").notNull().default("passage"),
  myCharacterName: text("my_character_name"),
  mode: text("mode"),
  nextReviewDue: date("next_review_due"),
  fsrsStability: real("fsrs_stability"),
  fsrsDifficulty: real("fsrs_difficulty"),
  fsrsReps: integer("fsrs_reps").default(0),
  fsrsLapses: integer("fsrs_lapses").default(0),
  fsrsState: integer("fsrs_state").default(0),
  fsrsLastReview: timestamp("fsrs_last_review", { withTimezone: true }),
  lastFlashDate: timestamp("last_flash_date", { withTimezone: true }),
  chunks: jsonb("chunks"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTextSchema = createInsertSchema(textsTable).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertText = z.infer<typeof insertTextSchema>;
export type TextRow = typeof textsTable.$inferSelect;
