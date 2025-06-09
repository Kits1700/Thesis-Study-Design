import { participants, tasks, questionnaires, type Participant, type Task, type Questionnaire, type InsertParticipant, type InsertTask, type InsertQuestionnaire } from "@shared/schema";

export interface IStorage {
  // Participants
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipant(participantId: string): Promise<Participant | undefined>;
  updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined>;
  
  // Tasks
  createTask(task: InsertTask): Promise<Task>;
  getTasksByParticipant(participantId: string): Promise<Task[]>;
  updateTask(taskId: number, updates: Partial<Task>): Promise<Task | undefined>;
  
  // Questionnaires
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;
  getQuestionnairesByParticipant(participantId: string): Promise<Questionnaire[]>;
}

export class MemStorage implements IStorage {
  private participants: Map<string, Participant>;
  private tasks: Map<number, Task>;
  private questionnaires: Map<number, Questionnaire>;
  private participantIdCounter: number;
  private taskIdCounter: number;
  private questionnaireIdCounter: number;

  constructor() {
    this.participants = new Map();
    this.tasks = new Map();
    this.questionnaires = new Map();
    this.participantIdCounter = 1;
    this.taskIdCounter = 1;
    this.questionnaireIdCounter = 1;
  }

  async createParticipant(insertParticipant: InsertParticipant): Promise<Participant> {
    const id = this.participantIdCounter++;
    const participant: Participant = {
      ...insertParticipant,
      id,
      startTime: new Date(),
      completedAt: null,
      currentStep: insertParticipant.currentStep || "overview",
      studyData: insertParticipant.studyData || {},
    };
    this.participants.set(insertParticipant.participantId, participant);
    return participant;
  }

  async getParticipant(participantId: string): Promise<Participant | undefined> {
    return this.participants.get(participantId);
  }

  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const participant = this.participants.get(participantId);
    if (!participant) return undefined;
    
    const updated = { ...participant, ...updates };
    this.participants.set(participantId, updated);
    return updated;
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const task: Task = {
      id,
      participantId: insertTask.participantId,
      taskId: insertTask.taskId,
      taskType: insertTask.taskType,
      frictionType: insertTask.frictionType,
      topic: insertTask.topic ?? null,
      initialThoughts: insertTask.initialThoughts ?? null,
      counterarguments: insertTask.counterarguments ?? null,
      generatedContent: insertTask.generatedContent ?? {},
      startTime: new Date(),
      completedAt: null,
    };
    this.tasks.set(id, task);
    return task;
  }

  async getTasksByParticipant(participantId: string): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.participantId === participantId
    );
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task | undefined> {
    const task = this.tasks.get(taskId);
    if (!task) return undefined;
    
    const updated = { ...task, ...updates };
    this.tasks.set(taskId, updated);
    return updated;
  }

  async createQuestionnaire(insertQuestionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const id = this.questionnaireIdCounter++;
    const questionnaire: Questionnaire = {
      ...insertQuestionnaire,
      id,
      submittedAt: new Date(),
    };
    this.questionnaires.set(id, questionnaire);
    return questionnaire;
  }

  async getQuestionnairesByParticipant(participantId: string): Promise<Questionnaire[]> {
    return Array.from(this.questionnaires.values()).filter(
      (questionnaire) => questionnaire.participantId === participantId
    );
  }
}

export const storage = new MemStorage();
