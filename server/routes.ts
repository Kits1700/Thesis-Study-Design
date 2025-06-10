import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParticipantSchema, insertTaskSchema, insertQuestionnaireSchema } from "@shared/schema";
import { generateLiteratureReview, generateArgumentExploration } from "./openai";
import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "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"
});

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

  // Streaming literature review generation
  app.post("/api/generate/literature-review/stream", async (req, res) => {
    try {
      const { topic, participantId, taskId } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      const systemPrompt = "You are an expert academic researcher. Generate comprehensive, well-structured literature reviews that synthesize current research, identify gaps, and provide scholarly insights. Format your response as HTML with proper headings and structure.";
      const userPrompt = `Generate a comprehensive academic literature review on: "${topic}". 

Requirements:
- Include introduction, theoretical foundations, current research landscape, methodological approaches, key findings, research gaps, and conclusion
- Use proper academic tone and structure
- Include realistic citations and references (you may create plausible academic citations)
- Format as HTML with h3, h4, p, ul, li tags
- Aim for approximately 800-1000 words
- Provide scholarly analysis and synthesis of the field`;

      // Store prompts in task if provided
      if (participantId && taskId) {
        try {
          const existingTask = await storage.getTasksByParticipant(participantId);
          const task = existingTask.find(t => t.taskId === taskId);
          if (task) {
            await storage.updateTask(task.id, {
              prompts: {
                systemPrompt,
                userPrompt,
                timestamp: new Date().toISOString()
              }
            });
          }
        } catch (error) {
          console.error('Failed to store prompts:', error);
        }
      }

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content: fullContent, partial: true })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ content: fullContent, done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  });

  // Streaming argument exploration generation
  app.post("/api/generate/argument-exploration/stream", async (req, res) => {
    try {
      const { topic, initialThoughts, counterarguments, participantId, taskId } = req.body;
      if (!topic) {
        return res.status(400).json({ message: "Topic is required" });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.setHeader('Access-Control-Allow-Origin', '*');

      let userContext = "";
      if (initialThoughts) {
        userContext += `\n\nBuild upon these initial thoughts from the user: "${initialThoughts}"`;
      }
      if (counterarguments) {
        userContext += `\n\nAddress and explore these counterarguments provided by the user: "${counterarguments}"`;
      }

      const systemPrompt = "You are an expert critical thinking facilitator and academic researcher. Generate balanced, nuanced argument explorations that examine multiple perspectives, consider various stakeholders, and provide thoughtful analysis. Format your response as HTML with proper headings and structure.";
      const userPrompt = `Explore multiple perspectives and arguments on the topic: "${topic}".${userContext}

Requirements:
- Examine at least 3 different perspectives or viewpoints
- Analyze potential benefits and drawbacks
- Consider contextual factors that influence the debate
- Provide balanced analysis without taking a definitive stance
- Include synthesis and recommendations for decision-making
- Format as HTML with h3, h4, h5, p, ul, li, ol tags
- Aim for approximately 700-900 words
- Encourage critical thinking and nuanced understanding`;

      // Store prompts in task if provided
      if (participantId && taskId) {
        try {
          const existingTask = await storage.getTasksByParticipant(participantId);
          const task = existingTask.find(t => t.taskId === taskId);
          if (task) {
            await storage.updateTask(task.id, {
              prompts: {
                systemPrompt,
                userPrompt,
                userInputs: { topic, initialThoughts, counterarguments },
                timestamp: new Date().toISOString()
              }
            });
          }
        } catch (error) {
          console.error('Failed to store prompts:', error);
        }
      }

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: userPrompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
        stream: true,
      });

      let fullContent = "";
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          fullContent += content;
          res.write(`data: ${JSON.stringify({ content: fullContent, partial: true })}\n\n`);
        }
      }

      res.write(`data: ${JSON.stringify({ content: fullContent, done: true })}\n\n`);
      res.end();
    } catch (error: any) {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
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
      // Transform final questionnaire data to match schema
      const { participantId, responses } = req.body;
      const questionnaireData = {
        participantId,
        taskId: 999, // Use special ID for final questionnaire
        responses: responses,
      };
      
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

  // Admin endpoints to view all data
  app.get("/api/admin/participants", async (req, res) => {
    try {
      const allParticipants = await storage.getAllParticipants();
      res.json(allParticipants);
    } catch (error: any) {
      console.error("Error fetching all participants:", error);
      res.status(500).json({ 
        message: "Failed to fetch participants",
        error: error.message 
      });
    }
  });

  app.get("/api/admin/tasks", async (req, res) => {
    try {
      const allTasks = await storage.getAllTasks();
      res.json(allTasks);
    } catch (error: any) {
      console.error("Error fetching all tasks:", error);
      res.status(500).json({ 
        message: "Failed to fetch tasks",
        error: error.message 
      });
    }
  });

  app.get("/api/admin/questionnaires", async (req, res) => {
    try {
      const allQuestionnaires = await storage.getAllQuestionnaires();
      res.json(allQuestionnaires);
    } catch (error: any) {
      console.error("Error fetching all questionnaires:", error);
      res.status(500).json({ 
        message: "Failed to fetch questionnaires",
        error: error.message 
      });
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
