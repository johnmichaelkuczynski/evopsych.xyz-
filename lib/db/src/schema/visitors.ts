import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

// One row per unique browser (anonymous visitor id stored in a long-lived
// cookie). Powers the owner-only unique-visitor counter and the anonymous
// AI-usage cap that triggers the login gate.
export const visitorsTable = pgTable("visitors", {
  id: serial("id").primaryKey(),
  visitorId: text("visitor_id").notNull().unique(),
  firstSeenAt: timestamp("first_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  lastSeenAt: timestamp("last_seen_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  visitCount: integer("visit_count").notNull().default(1),
  // Cumulative characters of AI-generated output served to this visitor while
  // signed out. Once past the free cap, AI endpoints demand login.
  aiCharsUsed: integer("ai_chars_used").notNull().default(0),
});

export type Visitor = typeof visitorsTable.$inferSelect;
