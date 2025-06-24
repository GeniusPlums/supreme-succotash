import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contests = pgTable("contests", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  prize: text("prize").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  totalParticipants: integer("total_participants").notNull().default(0),
});

export const questions = pgTable("questions", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  questionNumber: integer("question_number").notNull(),
  category: text("category").notNull(),
  questionText: text("question_text").notNull(),
  optionA: text("option_a").notNull(),
  optionB: text("option_b").notNull(),
  optionC: text("option_c").notNull(),
  votesA: integer("votes_a").notNull().default(30000),
  votesB: integer("votes_b").notNull().default(50000),
  votesC: integer("votes_c").notNull().default(70000),
  correctAnswer: text("correct_answer"), // A, B, or C - set by admin
});

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  name: text("name").notNull(),
  sessionId: text("session_id").notNull(),
  selections: jsonb("selections"), // Array of {questionId, selectedOption}
  totalPoints: integer("total_points").default(0),
  rank: integer("rank"),
  submittedAt: timestamp("submitted_at"),
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  contestId: integer("contest_id").notNull(),
  participantId: integer("participant_id").notNull(),
  rank: integer("rank").notNull(),
  points: integer("points").notNull(),
  correctPredictions: integer("correct_predictions").notNull(),
});

export const insertContestSchema = createInsertSchema(contests).omit({
  id: true,
  totalParticipants: true,
});

export const insertQuestionSchema = createInsertSchema(questions).omit({
  id: true,
  votesA: true,
  votesB: true,
  votesC: true,
  correctAnswer: true,
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  totalPoints: true,
  rank: true,
  submittedAt: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).omit({
  id: true,
});

export type Contest = typeof contests.$inferSelect;
export type Question = typeof questions.$inferSelect;
export type Participant = typeof participants.$inferSelect;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;

export type InsertContest = z.infer<typeof insertContestSchema>;
export type InsertQuestion = z.infer<typeof insertQuestionSchema>;
export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertLeaderboardEntry = z.infer<typeof insertLeaderboardSchema>;
