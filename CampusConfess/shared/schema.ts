import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  college: text("college").notNull(),
  avatarUrl: text("avatar_url"),
  isPremium: boolean("is_premium").default(false),
  isAdmin: boolean("is_admin").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const confessions = pgTable("confessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  content: text("content").notNull(),
  college: text("college").notNull(),
  anonymousName: text("anonymous_name").notNull(),
  tags: text("tags").array().default([]),
  upvotes: integer("upvotes").default(0),
  downvotes: integer("downvotes").default(0),
  commentCount: integer("comment_count").default(0),
  views: integer("views").default(0),
  isApproved: boolean("is_approved").default(true),
  isFlagged: boolean("is_flagged").default(false),
  aiAnalysis: jsonb("ai_analysis"),
  trendingScore: integer("trending_score").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  confessionId: varchar("confession_id").notNull(),
  content: text("content").notNull(),
  anonymousName: text("anonymous_name").notNull(),
  upvotes: integer("upvotes").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const votes = pgTable("votes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  confessionId: varchar("confession_id").notNull(),
  type: text("type").$type<"up" | "down">().notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reports = pgTable("reports", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  confessionId: varchar("confession_id").notNull(),
  userId: varchar("user_id").notNull(),
  reason: text("reason").notNull(),
  description: text("description"),
  status: text("status").$type<"pending" | "reviewed" | "dismissed">().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  messages: jsonb("messages").default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertConfessionSchema = createInsertSchema(confessions).omit({
  id: true,
  upvotes: true,
  downvotes: true,
  commentCount: true,
  views: true,
  isApproved: true,
  isFlagged: true,
  aiAnalysis: true,
  trendingScore: true,
  createdAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  upvotes: true,
  createdAt: true,
});

export const insertVoteSchema = createInsertSchema(votes).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  status: true,
  createdAt: true,
});

export const insertChatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.number().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertConfession = z.infer<typeof insertConfessionSchema>;
export type Confession = typeof confessions.$inferSelect;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;
export type InsertVote = z.infer<typeof insertVoteSchema>;
export type Vote = typeof votes.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type ChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;

// Enums
export const colleges = [
  "SRM University",
  "Delhi University", 
  "IIT Delhi",
  "Amity University",
  "Jadavpur University",
  "VIT University",
  "BITS Pilani",
  "Other"
] as const;

export const confessionCategories = [
  "crush",
  "relationships", 
  "academics",
  "career",
  "mental_health",
  "family",
  "social",
  "general"
] as const;
