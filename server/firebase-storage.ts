import { db } from './firebase';
import type { IStorage } from './storage';

// Firebase collection names
const COLLECTIONS = {
  PARTICIPANTS: 'participants',
  TASKS: 'tasks',
  QUESTIONNAIRES: 'questionnaires'
};

// Type definitions matching the existing schema
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

export type InsertParticipant = Omit<Participant, 'id'>;
export type InsertTask = Omit<Task, 'id'>;
export type InsertQuestionnaire = Omit<Questionnaire, 'id'>;

export class FirebaseStorage implements IStorage {
  // Participants
  async createParticipant(participant: InsertParticipant): Promise<Participant> {
    const docRef = await db.collection(COLLECTIONS.PARTICIPANTS).add({
      ...participant,
      startTime: new Date().toISOString(),
      completedAt: null,
      studyData: participant.studyData || {}
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Participant;
  }

  async getParticipant(participantId: string): Promise<Participant | undefined> {
    const snapshot = await db.collection(COLLECTIONS.PARTICIPANTS)
      .where('participantId', '==', participantId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Participant;
  }

  async updateParticipant(participantId: string, updates: Partial<Participant>): Promise<Participant | undefined> {
    const participant = await this.getParticipant(participantId);
    if (!participant) return undefined;
    
    await db.collection(COLLECTIONS.PARTICIPANTS).doc(participant.id).update(updates);
    
    const updatedDoc = await db.collection(COLLECTIONS.PARTICIPANTS).doc(participant.id).get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Participant;
  }

  async getAllParticipants(): Promise<Participant[]> {
    const snapshot = await db.collection(COLLECTIONS.PARTICIPANTS).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
  }

  // Tasks
  async createTask(task: InsertTask): Promise<Task> {
    const docRef = await db.collection(COLLECTIONS.TASKS).add({
      ...task,
      startTime: new Date().toISOString(),
      completedAt: null
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Task;
  }

  async getTasksByParticipant(participantId: string): Promise<Task[]> {
    const snapshot = await db.collection(COLLECTIONS.TASKS)
      .where('participantId', '==', participantId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  }

  async updateTask(taskId: number, updates: Partial<Task>): Promise<Task | undefined> {
    // Find task by taskId (not document ID)
    const snapshot = await db.collection(COLLECTIONS.TASKS)
      .where('taskId', '==', taskId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return undefined;
    
    const doc = snapshot.docs[0];
    await doc.ref.update(updates);
    
    const updatedDoc = await doc.ref.get();
    return { id: updatedDoc.id, ...updatedDoc.data() } as Task;
  }

  async getAllTasks(): Promise<Task[]> {
    const snapshot = await db.collection(COLLECTIONS.TASKS).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Task));
  }

  // Questionnaires
  async createQuestionnaire(questionnaire: InsertQuestionnaire): Promise<Questionnaire> {
    const docRef = await db.collection(COLLECTIONS.QUESTIONNAIRES).add({
      ...questionnaire,
      submittedAt: new Date().toISOString()
    });
    
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Questionnaire;
  }

  async getQuestionnairesByParticipant(participantId: string): Promise<Questionnaire[]> {
    const snapshot = await db.collection(COLLECTIONS.QUESTIONNAIRES)
      .where('participantId', '==', participantId)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Questionnaire));
  }

  async getAllQuestionnaires(): Promise<Questionnaire[]> {
    const snapshot = await db.collection(COLLECTIONS.QUESTIONNAIRES).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Questionnaire));
  }
}

export const storage = new FirebaseStorage();