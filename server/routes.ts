import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParticipantSchema, insertQuestionSchema, insertContestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get active contest
  app.get("/api/contest", async (req, res) => {
    try {
      const contest = await storage.getActiveContest();
      if (!contest) {
        return res.status(404).json({ error: "No active contest found" });
      }
      res.json(contest);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contest" });
    }
  });

  // Get questions for contest
  app.get("/api/contest/:contestId/questions", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const questions = await storage.getQuestionsByContest(contestId);
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // Join contest (create participant)
  app.post("/api/contest/:contestId/join", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const { name, sessionId } = req.body;
      
      // Check if participant already exists
      const existing = await storage.getParticipantBySession(sessionId);
      if (existing) {
        return res.json(existing);
      }

      const participantData = {
        contestId,
        name: name || `Player_${Math.random().toString(36).substr(2, 6)}`,
        sessionId,
        selections: null
      };

      const participant = await storage.createParticipant(participantData);
      
      await storage.updateContestParticipants(contestId, 1);
      
      res.json(participant);
    } catch (error) {
      console.error('Join contest error:', error);
      res.status(500).json({ error: "Failed to join contest" });
    }
  });

  // Submit selections
  app.post("/api/participant/:participantId/selections", async (req, res) => {
    try {
      const participantId = parseInt(req.params.participantId);
      const { selections } = req.body;

      if (!Array.isArray(selections) || selections.length !== 5) {
        return res.status(400).json({ error: "Must select exactly 5 questions" });
      }

      await storage.updateParticipantSelections(participantId, selections);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to submit selections" });
    }
  });

  // Get participant by session
  app.get("/api/participant/session/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const participant = await storage.getParticipantBySession(sessionId);
      
      if (!participant) {
        return res.status(404).json({ error: "Participant not found" });
      }
      
      res.json(participant);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch participant" });
    }
  });

  // Get leaderboard
  app.get("/api/contest/:contestId/leaderboard", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const leaderboard = await storage.getLeaderboard(contestId);
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
  });

  // Admin: Update correct answers
  app.post("/api/admin/contest/:contestId/answers", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      const { answers } = req.body; // Array of {questionId, correctAnswer}

      if (!Array.isArray(answers)) {
        return res.status(400).json({ error: "Answers must be an array" });
      }

      await storage.bulkUpdateAnswers(answers);
      await storage.updateLeaderboard(contestId);
      
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to update answers" });
    }
  });

  // Admin: Calculate scores
  app.post("/api/admin/contest/:contestId/calculate", async (req, res) => {
    try {
      const contestId = parseInt(req.params.contestId);
      await storage.updateLeaderboard(contestId);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to calculate scores" });
    }
  });

  // CMS Authentication middleware
  const cmsAuth = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const token = authHeader.substring(7);
    // Simple token validation (you could enhance this with JWT)
    if (token !== 'cms_authenticated_token_2024') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    
    next();
  };

  // CMS Login
  app.post("/api/cms/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      // Simple authentication (you can enhance this with database storage)
      if (username === 'admin' && password === 'cms2024!') {
        res.json({ 
          success: true, 
          token: 'cms_authenticated_token_2024',
          message: 'Login successful'
        });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Login failed' });
    }
  });

  // CMS Token verification
  app.get("/api/cms/verify", cmsAuth, async (req, res) => {
    res.json({ valid: true });
  });

  // CMS: Get all contests
  app.get("/api/cms/contests", cmsAuth, async (req, res) => {
    try {
      const contests = await storage.getAllContests();
      res.json(contests);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch contests" });
    }
  });

  // CMS: Create contest
  app.post("/api/cms/contests", cmsAuth, async (req, res) => {
    try {
      const contestData = insertContestSchema.parse(req.body);
      const contest = await storage.createContest(contestData);
      res.json(contest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid contest data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create contest" });
    }
  });

  // CMS: Update contest
  app.put("/api/cms/contests/:id", cmsAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const contestData = insertContestSchema.partial().parse(req.body);
      const contest = await storage.updateContest(id, contestData);
      res.json(contest);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid contest data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update contest" });
    }
  });

  // CMS: Get all questions
  app.get("/api/cms/questions", cmsAuth, async (req, res) => {
    try {
      const questions = await storage.getAllQuestions();
      res.json(questions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch questions" });
    }
  });

  // CMS: Create question
  app.post("/api/cms/questions", cmsAuth, async (req, res) => {
    try {
      const questionData = insertQuestionSchema.parse(req.body);
      const question = await storage.createQuestion(questionData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid question data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to create question" });
    }
  });

  // CMS: Update question
  app.put("/api/cms/questions/:id", cmsAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const questionData = insertQuestionSchema.partial().parse(req.body);
      const question = await storage.updateQuestion(id, questionData);
      res.json(question);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid question data", details: error.errors });
      }
      res.status(500).json({ error: "Failed to update question" });
    }
  });

  // CMS: Delete question
  app.delete("/api/cms/questions/:id", cmsAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteQuestion(id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete question" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
