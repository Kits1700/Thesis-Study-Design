import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParticipantSchema, insertTaskSchema, insertQuestionnaireSchema } from "@shared/schema";
import { generateLiteratureReview, generateArgumentExploration } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Create or get participant
  app.post("/api/participant", async (req, res) => {
    try {
      const participantData = insertParticipantSchema.parse(req.body);
      
      // Check if participant already exists
      const existing = await storage.getParticipant(participantData.participantId);
      if (existing) {
        return res.json(existing);
      }
      
      const participant = await storage.createParticipant(participantData);
      res.json(participant);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get participant
  app.get("/api/participant/:id", async (req, res) => {
    try {
      const participant = await storage.getParticipant(req.params.id);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      res.json(participant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update participant
  app.patch("/api/participant/:id", async (req, res) => {
    try {
      const participant = await storage.updateParticipant(req.params.id, req.body);
      if (!participant) {
        return res.status(404).json({ message: "Participant not found" });
      }
      res.json(participant);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create task
  app.post("/api/task", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.json(task);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get tasks by participant
  app.get("/api/tasks/:participantId", async (req, res) => {
    try {
      const tasks = await storage.getTasksByParticipant(req.params.participantId);
      res.json(tasks);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update task
  app.patch("/api/task/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const task = await storage.updateTask(taskId, req.body);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate literature review
  app.post("/api/generate/literature-review", async (req, res) => {
    try {
      const { topic } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const review = await generateLiteratureReview(topic);
      res.json({ content: review });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Generate argument exploration
  app.post("/api/generate/argument-exploration", async (req, res) => {
    try {
      const { topic, initialThoughts, counterarguments } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }
      
      const exploration = await generateArgumentExploration(topic, initialThoughts, counterarguments);
      res.json({ content: exploration });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Submit questionnaire
  app.post("/api/questionnaire", async (req, res) => {
    try {
      const questionnaireData = insertQuestionnaireSchema.parse(req.body);
      const questionnaire = await storage.createQuestionnaire(questionnaireData);
      res.json(questionnaire);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Submit final questionnaire
  app.post("/api/questionnaire/final", async (req, res) => {
    try {
      const questionnaireData = insertQuestionnaireSchema.parse(req.body);
      const questionnaire = await storage.createQuestionnaire(questionnaireData);
      res.json(questionnaire);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get questionnaires by participant
  app.get("/api/questionnaires/:participantId", async (req, res) => {
    try {
      const questionnaires = await storage.getQuestionnairesByParticipant(req.params.participantId);
      res.json(questionnaires);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Export study data
  app.get("/api/export/:participantId", async (req, res) => {
    try {
      const participantId = req.params.participantId;
      const participant = await storage.getParticipant(participantId);
      const tasks = await storage.getTasksByParticipant(participantId);
      const questionnaires = await storage.getQuestionnairesByParticipant(participantId);
      
      const exportData = {
        participant,
        tasks,
        questionnaires,
        exportedAt: new Date().toISOString(),
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=study_data_${participantId}.json`);
      res.json(exportData);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
