// In-memory storage implementation for the academic research platform
// This eliminates database setup complexity while maintaining full functionality

export interface Participant {
  id: string;
  participantId: string;
  currentStep: string;
  startTime: string;
  completedAt: string | null;
  studyData: any;
}

export interface Task {
  id: string;
  participantId: string;
  taskId: number;
  taskType: string;
  frictionType: string;
  topic: string | null;
  initialThoughts: string | null;
  counterarguments: string | null;
  generatedContent: any;
  prompts: any;
  startTime: string;
  completedAt: string | null;
}

export interface Questionnaire {
  id: string;
  participantId: string;
  taskId: number;
  responses: any;
  submittedAt: string;
}

export type InsertParticipant = Omit<Participant, 'id' | 'startTime'>;
export type InsertTask = Omit<Task, 'id' | 'startTime'>;
export type InsertQuestionnaire = Omit<Questionnaire, 'id' | 'submittedAt'>;

export interface IStorage {
  createParticipant(participant: InsertParticipant): Promise<Participant>;
  getParticipant(participantId: string): Promise<Participant | undefined>;
  updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined>;
  getAllParticipants(): Promise<Participant[]>;
  
  createTask(task: InsertTask): Promise<Task>;
  getTasksByParticipant(participantId: string): Promise<Task[]>;
  updateTask(taskId: number, updates: Partial<Task>): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  
  createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire>;
  getQuestionnairesByParticipant(participantId: string): Promise<Questionnaire[]>;
  getAllQuestionnaires(): Promise<Questionnaire[]>;
}

class MemoryStorage implements IStorage {
  private participants: Participant[] = [];
  private tasks: Task[] = [];
  private questionnaires: Questionnaire[] = [];
  private idCounter = 1;

  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const newParticipant: Participant = {
      id: (this.idCounter++).toString(),
      ...participant,
      startTime: new Date().toISOString(),
      completedAt: null
    };
    this.participants.push(newParticipant);
    console.log(`Created participant: ${newParticipant.participantId}`);
    return newParticipant;
  }

  async getParticipant(participantId: string): Promise<Participant | undefined> {
    return this.participants.find(p => p.participantId === participantId);
  }

  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const index = this.participants.findIndex(p => p.participantId === participantId);
    if (index === -1) return undefined;
    
    this.participants[index] = { ...this.participants[index], ...updates };
    return this.participants[index];
  }

  async getAllParticipants(): Promise<Participant[]> {
    return [...this.participants];
  }

  async createTask(task: InsertTask): Promise<Task> {
    const newTask: Task = {
      id: (this.idCounter++).toString(),
      ...task,
      startTime: new Date().toISOString(),
      completedAt: null
    };
    this.tasks.push(newTask);
    console.log(`Created task ${newTask.taskId} for participant: ${newTask.participantId}`);
    return newTask;
  }

  async getTasksByParticipant(participantId: string): Promise<Task[]> {
    return this.tasks.filter(t => t.participantId === participantId);
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task | undefined> {
    const index = this.tasks.findIndex(t => t.taskId === taskId);
    if (index === -1) return undefined;
    
    this.tasks[index] = { ...this.tasks[index], ...updates };
    return this.tasks[index];
  }

  async getAllTasks(): Promise<Task[]> {
    return [...this.tasks];
  }

  async createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const newQuestionnaire: Questionnaire = {
      id: (this.idCounter++).toString(),
      ...questionnaire,
      submittedAt: new Date().toISOString()
    };
    this.questionnaires.push(newQuestionnaire);
    console.log(`Created questionnaire for task ${newQuestionnaire.taskId}, participant: ${newQuestionnaire.participantId}`);
    return newQuestionnaire;
  }

  async getQuestionnairesByParticipant(participantId: string): Promise<Questionnaire[]> {
    return this.questionnaires.filter(q => q.participantId === participantId);
  }

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    return [...this.questionnaires];
  }
}

export const storage = new MemoryStorage();