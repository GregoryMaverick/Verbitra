import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

// Why this table exists:
// We want a simple place to store user feedback submitted from the app.
// This is intentionally NOT gated behind auth — users can send feedback
// without creating an account. When they are signed in, we store `userId`
// so you can trace feedback to a specific account for debugging.
export const feedbackTable = pgTable("feedback", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Optional: set when the request is authenticated.
  userId: uuid("user_id"),

  // Optional: the email the user typed in the form (not the auth email).
  email: text("email"),

  // Required: the feedback message.
  message: text("message").notNull(),

  // Optional diagnostics to help reproduce issues quickly.
  appVersion: text("app_version"),
  platform: text("platform"),
  osVersion: text("os_version"),

  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type FeedbackInsert = typeof feedbackTable.$inferInsert;
export type Feedback = typeof feedbackTable.$inferSelect;

