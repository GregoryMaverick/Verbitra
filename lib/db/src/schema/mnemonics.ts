import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const mnemonics = pgTable("mnemonics", {
  id: serial("id").primaryKey(),
  textId: text("text_id").notNull().unique(),
  content: text("content").notNull(),
  mnemonicType: text("mnemonic_type").notNull(),
  status: text("status").notNull().default("pending"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertMnemonicSchema = createInsertSchema(mnemonics).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Mnemonic = typeof mnemonics.$inferSelect;
export type InsertMnemonic = z.infer<typeof insertMnemonicSchema>;
