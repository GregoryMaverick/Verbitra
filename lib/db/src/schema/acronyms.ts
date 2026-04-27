import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const acronyms = pgTable("acronyms", {
  id: serial("id").primaryKey(),
  textId: text("text_id").notNull().unique(),
  acronym: text("acronym").notNull(),
  explanation: text("explanation").notNull(),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertAcronymSchema = createInsertSchema(acronyms).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Acronym = typeof acronyms.$inferSelect;
export type InsertAcronym = z.infer<typeof insertAcronymSchema>;
