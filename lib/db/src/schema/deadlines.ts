import { pgTable, text, date, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";
import { textsTable } from "./texts";

export const deadlinesTable = pgTable("deadlines", {
  id: uuid("id").primaryKey().defaultRandom(),
  textId: uuid("text_id")
    .notNull()
    .references(() => textsTable.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  deadlineDate: date("deadline_date").notNull(),
  mode: text("mode").notNull().default("spaced"),
  nextSessionAt: timestamp("next_session_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertDeadlineSchema = createInsertSchema(deadlinesTable).omit({
  id: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertDeadline = z.infer<typeof insertDeadlineSchema>;
export type Deadline = typeof deadlinesTable.$inferSelect;
