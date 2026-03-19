import { pgTable, text, integer, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  level: text("level").notNull().default("beginner"),
});

export const reflections = pgTable("reflections", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  content: text("content").notNull(),
  concept: text("concept").notNull(),
  createdAt: text("created_at").notNull(),
});

export const discussions = pgTable("discussions", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  author: text("author").notNull(),
  content: text("content").notNull(),
  likes: integer("likes").notNull().default(0),
  createdAt: text("created_at").notNull(),
});

export const quizResults = pgTable("quiz_results", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().default(1),
  concept: text("concept").notNull(),
  score: integer("score").notNull(),
  total: integer("total").notNull(),
  createdAt: text("created_at").notNull(),
});

export const insertReflectionSchema = createInsertSchema(reflections).omit({ id: true });
export const insertDiscussionSchema = createInsertSchema(discussions).omit({ id: true, likes: true });
export const insertQuizResultSchema = createInsertSchema(quizResults).omit({ id: true });

export type Reflection = typeof reflections.$inferSelect;
export type InsertReflection = z.infer<typeof insertReflectionSchema>;
export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type QuizResult = typeof quizResults.$inferSelect;
export type InsertQuizResult = z.infer<typeof insertQuizResultSchema>;
