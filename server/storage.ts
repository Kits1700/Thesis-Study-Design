import { participants, tasks, questionnaires, type Participant, type Task, type Questionnaire, type InsertParticipant, type InsertTask, type InsertQuestionnaire } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Participants
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipant(participantId: string): Promise<Participant | undefined>;
  updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined>;
  getAllParticipants(): Promise<Participant[]>;
  
  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTasksByParticipant(participantId: string): Promise<Task[]>;
  updateTask(taskId: number, updates: Partial<Task>): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  
  // Questionnaires
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;
  getQuestionnairesByParticipant(participantId: string): Promise<Questionnaire[]>;
  getAllQuestionnaires(): Promise<Questionnaire[]>;
}

export class DatabaseStorage implements IStorage {

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const [participant] = await db
      .insert(participants)
      .values(insertParticipant)
      .returning();
    return participant;
  }

  async getParticipant(participantId: string): Promise<Participant | undefined> {
    const [participant] = await db
      .select()
      .from(participants)
      .where(eq(participants.participantId, participantId));
    return participant || undefined;
  }

  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const [participant] = await db
      .update(participants)
      .set(updates)
      .where(eq(participants.participantId, participantId))
      .returning();
    return participant || undefined;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const [task] = await db
      .insert(tasks)
      .values(insertTask)
      .returning();
    return task;
  }

  async getTasksByParticipant(participantId: string): Promise<Task[]> {
    return await db
      .select()
      .from(tasks)
      .where(eq(tasks.participantId, participantId));
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task | undefined> {
    const [task] = await db
      .update(tasks)
      .set(updates)
      .where(eq(tasks.id, taskId))
      .returning();
    return task || undefined;
  }

  async createQuestionnaire(insertQuestionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const [questionnaire] = await db
      .insert(questionnaires)
      .values(insertQuestionnaire)
      .returning();
    return questionnaire;
  }

  async getQuestionnairesByParticipant(participantId: string): Promise<Questionnaire[]> {
    return await db
      .select()
      .from(questionnaires)
      .where(eq(questionnaires.participantId, participantId));
  }

  async getAllParticipants(): Promise<Participant[]> {
    return await db.select().from(participants);
  }

  async getAllTasks(): Promise<Task[]> {
    return await db.select().from(tasks);
  }

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    return await db.select().from(questionnaires);
  }
}

export const storage = new DatabaseStorage();
