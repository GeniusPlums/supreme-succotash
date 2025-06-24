import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertParticipantSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
