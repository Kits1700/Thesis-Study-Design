import { pgTable, text, serial, integer, boolean, jsonb, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const participants = pgTable("participants", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id").notNull().unique(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
  currentStep: text("current_step").notNull().default("overview"),
  studyData: jsonb("study_data").notNull().default({}),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id").notNull(),
  taskId: integer("task_id").notNull(),
  taskType: text("task_type").notNull(), // "literature_review" | "argument_exploration"
  frictionType: text("friction_type").notNull(), // "full_ai" | "selective_friction"
  topic: text("topic"),
  initialThoughts: text("initial_thoughts"),
  counterarguments: text("counterarguments"),
  generatedContent: jsonb("generated_content").default({}),
  startTime: timestamp("start_time").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

export const questionnaires = pgTable("questionnaires", {
  id: serial("id").primaryKey(),
  participantId: text("participant_id").notNull(),
  taskId: integer("task_id").notNull(),
  responses: jsonb("responses").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const insertParticipantSchema = createInsertSchema(participants).omit({
  id: true,
  startTime: true,
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  startTime: true,
});

export const insertQuestionnaireSchema = createInsertSchema(questionnaires).omit({
  id: true,
  submittedAt: true,
});

export type InsertParticipant = z.infer<typeof insertParticipantSchema>;
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type InsertQuestionnaire = z.infer<typeof insertQuestionnaireSchema>;

export type Participant = typeof participants.$inferSelect;
export type Task = typeof tasks.$inferSelect;
export type Questionnaire = typeof questionnaires.$inferSelect;
