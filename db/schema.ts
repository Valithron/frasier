import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const quotes = sqliteTable("frasier_quotes", {
  id: text("id").primaryKey(),
  body: text("body").notNull(),
  speakers: text("speakers").notNull(),
  season: integer("season").notNull(),
  episode: integer("episode").notNull(),
  title: text("title").notNull().default(""),
  favorite: integer("favorite", { mode: "boolean" }).notNull().default(false),
  queued: integer("queued", { mode: "boolean" }).notNull().default(false),
  postedAt: text("posted_at"),
  notes: text("notes"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
  deletedAt: text("deleted_at"),
  revision: integer("revision").notNull().default(1),
  deviceId: text("device_id"),
});

