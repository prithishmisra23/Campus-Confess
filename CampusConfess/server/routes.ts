import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { openaiService } from "./services/openai";
import { authService } from "./services/auth";
import { 
  insertConfessionSchema,
  insertCommentSchema, 
  insertVoteSchema,
  insertReportSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { profile } = req.body;
      
      if (!profile || !profile.email) {
        return res.status(400).json({ error: "Invalid Google profile" });
      }

      const user = await authService.authenticateGoogleUser(profile);
      
      // Store user session
      if (req.session) {
        req.session.userId = user.id;
      }
      
      res.json({ user });
    } catch (error) {
      console.error("Google auth error:", error);
      res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session?.destroy((err: Error | null) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const userId = req.session?.userId;
      
      if (!userId) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await authService.validateSession(userId);
      
      if (!user) {
        return res.status(401).json({ error: "Invalid session" });
      }

      res.json({ user });
    } catch (error) {
      console.error("Session validation error:", error);
      res.status(500).json({ error: "Session validation failed" });
    }
  });

  // Confession routes
  app.get("/api/confessions", async (req, res) => {
    try {
      const college = req.query.college as string;
      const limit = parseInt(req.query.limit as string) || 20;
      const offset = parseInt(req.query.offset as string) || 0;

      const confessions = await storage.getConfessions(college, limit, offset);
      res.json(confessions);
    } catch (error) {
      console.error("Get confessions error:", error);
      res.status(500).json({ error: "Failed to fetch confessions" });
    }
  });

  app.get("/api/confessions/trending", async (req, res) => {
    try {
      await storage.updateTrendingScores();
      const trending = await storage.getTrendingConfessions(10);
      res.json(trending);
    } catch (error) {
      console.error("Get trending error:", error);
      res.status(500).json({ error: "Failed to fetch trending confessions" });
    }
  });

  app.post("/api/confessions", async (req, res) => {
    try {
      const confessionData = insertConfessionSchema.parse(req.body);
      
      // Generate anonymous name
      confessionData.anonymousName = authService.generateAnonymousName();
      
      // Moderate content with AI
      const moderation = await openaiService.moderateContent(confessionData.content);
      
      const confession = await storage.createConfession(confessionData);
      
      // Update confession with AI analysis
      await storage.updateConfession(confession.id, {
        aiAnalysis: moderation,
        isApproved: moderation.isAppropriate,
        isFlagged: !moderation.isAppropriate,
      });

      res.json(confession);
    } catch (error) {
      console.error("Create confession error:", error);
      res.status(500).json({ error: "Failed to create confession" });
    }
  });

  app.get("/api/confessions/:id", async (req, res) => {
    try {
      const id = req.params.id;
      const confession = await storage.getConfession(id);
      
      if (!confession) {
        return res.status(404).json({ error: "Confession not found" });
      }

      // Increment views
      await storage.incrementViews(id);
      
      res.json(confession);
    } catch (error) {
      console.error("Get confession error:", error);
      res.status(500).json({ error: "Failed to fetch confession" });
    }
  });

  // Comment routes
  app.get("/api/confessions/:id/comments", async (req, res) => {
    try {
      const confessionId = req.params.id;
      const comments = await storage.getCommentsByConfession(confessionId);
      res.json(comments);
    } catch (error) {
      console.error("Get comments error:", error);
      res.status(500).json({ error: "Failed to fetch comments" });
    }
  });

  app.post("/api/confessions/:id/comments", async (req, res) => {
    try {
      const confessionId = req.params.id;
      const commentData = insertCommentSchema.parse({
        ...req.body,
        confessionId,
        anonymousName: authService.generateAnonymousName(),
      });

      const comment = await storage.createComment(commentData);
      res.json(comment);
    } catch (error) {
      console.error("Create comment error:", error);
      res.status(500).json({ error: "Failed to create comment" });
    }
  });

  // Vote routes
  app.post("/api/confessions/:id/vote", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const confessionId = req.params.id;
      const { type } = req.body;

      if (type !== "up" && type !== "down") {
        return res.status(400).json({ error: "Invalid vote type" });
      }

      const voteData = insertVoteSchema.parse({
        userId,
        confessionId, 
        type,
      });

      const vote = await storage.createOrUpdateVote(voteData);
      
      // Update confession vote counts
      const confession = await storage.getConfession(confessionId);
      if (confession) {
        const allVotes = Array.from((storage as any).votes.values());
        const upvotes = allVotes.filter((v: any) => v.confessionId === confessionId && v.type === "up").length;
        const downvotes = allVotes.filter((v: any) => v.confessionId === confessionId && v.type === "down").length;
        
        await storage.updateConfession(confessionId, { upvotes, downvotes });
      }

      res.json(vote);
    } catch (error) {
      console.error("Vote error:", error);
      res.status(500).json({ error: "Failed to process vote" });
    }
  });

  // Report routes
  app.post("/api/confessions/:id/report", async (req, res) => {
    try {
      const userId = req.session?.userId;
      if (!userId) {
        return res.status(401).json({ error: "Authentication required" });
      }

      const confessionId = req.params.id;
      const reportData = insertReportSchema.parse({
        ...req.body,
        userId,
        confessionId,
      });

      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Report error:", error);
      res.status(500).json({ error: "Failed to create report" });
    }
  });

  // AI Advice routes
  app.post("/api/advice", async (req, res) => {
    try {
      const { problem, category, urgency } = req.body;
      
      if (!problem) {
        return res.status(400).json({ error: "Problem description is required" });
      }

      const advice = await openaiService.generateAdvice(problem, category, urgency);
      res.json(advice);
    } catch (error) {
      console.error("Advice generation error:", error);
      res.status(500).json({ error: "Failed to generate advice" });
    }
  });

  // AI Chat routes
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, sessionId } = req.body;
      const userId = req.session?.userId;

      let session;
      if (sessionId) {
        session = await storage.getChatSession(userId);
      }
      
      if (!session) {
        session = await storage.createChatSession(userId);
      }

      const chatResponse = await openaiService.generateChatResponse(messages);
      
      // Save messages to session
      for (const msg of messages) {
        await storage.addChatMessage(session.id, msg);
      }
      
      await storage.addChatMessage(session.id, {
        role: "assistant",
        content: chatResponse.message,
      });

      res.json({
        ...chatResponse,
        sessionId: session.id,
      });
    } catch (error) {
      console.error("Chat error:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  app.get("/api/chat/stream", async (req, res) => {
    try {
      const messages = JSON.parse(req.query.messages as string || "[]");
      
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Cache-Control',
      });

      for await (const chunk of openaiService.streamChatResponse(messages)) {
        res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
      }
      
      res.write('data: [DONE]\n\n');
      res.end();
    } catch (error) {
      console.error("Stream chat error:", error);
      res.status(500).json({ error: "Failed to stream chat response" });
    }
  });

  // Admin routes
  app.get("/api/admin/reports", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const status = req.query.status as string;
      const reports = await storage.getReports(status);
      res.json(reports);
    } catch (error) {
      console.error("Get reports error:", error);
      res.status(500).json({ error: "Failed to fetch reports" });
    }
  });

  app.put("/api/admin/reports/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const reportId = req.params.id;
      const { status } = req.body;

      const report = await storage.updateReportStatus(reportId, status);
      res.json(report);
    } catch (error) {
      console.error("Update report error:", error);
      res.status(500).json({ error: "Failed to update report" });
    }
  });

  app.delete("/api/admin/confessions/:id", async (req, res) => {
    try {
      const userId = req.session?.userId;
      const user = await storage.getUser(userId);
      
      if (!user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const confessionId = req.params.id;
      const deleted = await storage.deleteConfession(confessionId);
      
      res.json({ deleted });
    } catch (error) {
      console.error("Delete confession error:", error);
      res.status(500).json({ error: "Failed to delete confession" });
    }
  });

  // Statistics routes
  app.get("/api/stats", async (req, res) => {
    try {
      const confessions = await storage.getConfessions();
      const totalConfessions = confessions.length;
      
      const colleges = Array.from(new Set(confessions.map(c => c.college))).length;
      const activeUsers = 12847; // Mock data for now
      const moderatedPercentage = 99.7; // Mock data for now

      res.json({
        total_confessions: totalConfessions,
        active_users: activeUsers,
        moderated: moderatedPercentage,
        colleges: colleges,
      });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ error: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
