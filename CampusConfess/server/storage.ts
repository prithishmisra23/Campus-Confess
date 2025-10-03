import { 
  type User, 
  type InsertUser,
  type Confession,
  type InsertConfession,
  type Comment,
  type InsertComment,
  type Vote,
  type InsertVote,
  type Report,
  type InsertReport,
  type ChatSession,
  type ChatMessage
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User | undefined>;

  // Confessions
  getConfessions(college?: string, limit?: number, offset?: number): Promise<Confession[]>;
  getConfession(id: string): Promise<Confession | undefined>;
  createConfession(confession: InsertConfession): Promise<Confession>;
  updateConfession(id: string, updates: Partial<Confession>): Promise<Confession | undefined>;
  deleteConfession(id: string): Promise<boolean>;
  getTrendingConfessions(limit?: number): Promise<Confession[]>;
  updateTrendingScores(): Promise<void>;
  incrementViews(id: string): Promise<void>;

  // Comments
  getCommentsByConfession(confessionId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;
  updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined>;

  // Votes
  getUserVote(userId: string, confessionId: string): Promise<Vote | undefined>;
  createOrUpdateVote(vote: InsertVote): Promise<Vote>;
  deleteVote(userId: string, confessionId: string): Promise<boolean>;

  // Reports
  getReports(status?: string): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  updateReportStatus(id: string, status: "pending" | "reviewed" | "dismissed"): Promise<Report | undefined>;

  // Chat Sessions
  getChatSession(userId: string): Promise<ChatSession | undefined>;
  createChatSession(userId?: string): Promise<ChatSession>;
  addChatMessage(sessionId: string, message: ChatMessage): Promise<ChatSession | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private confessions: Map<string, Confession>;
  private comments: Map<string, Comment>;
  private votes: Map<string, Vote>;
  private reports: Map<string, Report>;
  private chatSessions: Map<string, ChatSession>;

  constructor() {
    this.users = new Map();
    this.confessions = new Map();
    this.comments = new Map();
    this.votes = new Map();
    this.reports = new Map();
    this.chatSessions = new Map();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      avatarUrl: insertUser.avatarUrl || null,
      isPremium: false,
      isAdmin: false,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Confessions
  async getConfessions(college?: string, limit = 20, offset = 0): Promise<Confession[]> {
    let confessions = Array.from(this.confessions.values())
      .filter(c => c.isApproved && !c.isFlagged);
    
    if (college && college !== 'all') {
      confessions = confessions.filter(c => c.college === college);
    }

    return confessions
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime())
      .slice(offset, offset + limit);
  }

  async getConfession(id: string): Promise<Confession | undefined> {
    return this.confessions.get(id);
  }

  async createConfession(insertConfession: InsertConfession): Promise<Confession> {
    const id = randomUUID();
    const confession: Confession = {
      ...insertConfession,
      id,
      tags: insertConfession.tags || null,
      upvotes: 0,
      downvotes: 0,
      commentCount: 0,
      views: 0,
      isApproved: true,
      isFlagged: false,
      aiAnalysis: null,
      trendingScore: 0,
      createdAt: new Date(),
    };
    this.confessions.set(id, confession);
    return confession;
  }

  async updateConfession(id: string, updates: Partial<Confession>): Promise<Confession | undefined> {
    const confession = this.confessions.get(id);
    if (!confession) return undefined;
    
    const updatedConfession = { ...confession, ...updates };
    this.confessions.set(id, updatedConfession);
    return updatedConfession;
  }

  async deleteConfession(id: string): Promise<boolean> {
    return this.confessions.delete(id);
  }

  async getTrendingConfessions(limit = 10): Promise<Confession[]> {
    return Array.from(this.confessions.values())
      .filter(c => c.isApproved && !c.isFlagged)
      .sort((a, b) => (b.trendingScore || 0) - (a.trendingScore || 0))
      .slice(0, limit);
  }

  async updateTrendingScores(): Promise<void> {
    // Calculate trending scores based on engagement
    const confessions = Array.from(this.confessions.values());
    for (const confession of confessions) {
      const ageHours = (Date.now() - new Date(confession.createdAt!).getTime()) / (1000 * 60 * 60);
      const engagement = (confession.upvotes || 0) + (confession.commentCount || 0) + (confession.views || 0) * 0.1;
      const trendingScore = Math.round(engagement / Math.pow(ageHours + 1, 1.5) * 100);
      
      confession.trendingScore = trendingScore;
      this.confessions.set(confession.id, confession);
    }
  }

  async incrementViews(id: string): Promise<void> {
    const confession = this.confessions.get(id);
    if (confession) {
      confession.views = (confession.views || 0) + 1;
      this.confessions.set(id, confession);
    }
  }

  // Comments
  async getCommentsByConfession(confessionId: string): Promise<Comment[]> {
    return Array.from(this.comments.values())
      .filter(c => c.confessionId === confessionId)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = randomUUID();
    const comment: Comment = {
      ...insertComment,
      id,
      upvotes: 0,
      createdAt: new Date(),
    };
    this.comments.set(id, comment);
    
    // Increment comment count on confession
    const confession = this.confessions.get(insertComment.confessionId);
    if (confession) {
      confession.commentCount = (confession.commentCount || 0) + 1;
      this.confessions.set(confession.id, confession);
    }
    
    return comment;
  }

  async updateCommentUpvotes(id: string, upvotes: number): Promise<Comment | undefined> {
    const comment = this.comments.get(id);
    if (!comment) return undefined;
    
    comment.upvotes = upvotes;
    this.comments.set(id, comment);
    return comment;
  }

  // Votes
  async getUserVote(userId: string, confessionId: string): Promise<Vote | undefined> {
    return Array.from(this.votes.values()).find(
      v => v.userId === userId && v.confessionId === confessionId
    );
  }

  async createOrUpdateVote(insertVote: InsertVote): Promise<Vote> {
    const existingVote = await this.getUserVote(insertVote.userId, insertVote.confessionId);
    
    if (existingVote) {
      // Update existing vote
      const updatedVote: Vote = {
        ...existingVote,
        type: insertVote.type,
      };
      this.votes.set(existingVote.id, updatedVote);
      return updatedVote;
    } else {
      // Create new vote
      const id = randomUUID();
      const vote: Vote = {
        userId: insertVote.userId,
        confessionId: insertVote.confessionId,
        type: insertVote.type,
        id,
        createdAt: new Date(),
      };
      this.votes.set(id, vote);
      return vote;
    }
  }

  async deleteVote(userId: string, confessionId: string): Promise<boolean> {
    const vote = await this.getUserVote(userId, confessionId);
    if (vote) {
      return this.votes.delete(vote.id);
    }
    return false;
  }

  // Reports
  async getReports(status?: string): Promise<Report[]> {
    let reports = Array.from(this.reports.values());
    
    if (status) {
      reports = reports.filter(r => r.status === status);
    }
    
    return reports.sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = randomUUID();
    const report: Report = {
      ...insertReport,
      id,
      description: insertReport.description || null,
      status: "pending",
      createdAt: new Date(),
    };
    this.reports.set(id, report);
    return report;
  }

  async updateReportStatus(id: string, status: "pending" | "reviewed" | "dismissed"): Promise<Report | undefined> {
    const report = this.reports.get(id);
    if (!report) return undefined;
    
    report.status = status;
    this.reports.set(id, report);
    return report;
  }

  // Chat Sessions
  async getChatSession(userId: string): Promise<ChatSession | undefined> {
    return Array.from(this.chatSessions.values()).find(s => 
      (s.messages as ChatMessage[])?.find(m => (m as any).userId === userId)
    );
  }

  async createChatSession(userId?: string): Promise<ChatSession> {
    const id = randomUUID();
    const session: ChatSession = {
      id,
      userId: userId || null,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.chatSessions.set(id, session);
    return session;
  }

  async addChatMessage(sessionId: string, message: ChatMessage): Promise<ChatSession | undefined> {
    const session = this.chatSessions.get(sessionId);
    if (!session) return undefined;
    
    const messages = (session.messages as ChatMessage[]) || [];
    messages.push({
      ...message,
      timestamp: Date.now(),
    });
    
    session.messages = messages;
    session.updatedAt = new Date();
    this.chatSessions.set(sessionId, session);
    return session;
  }
}

export const storage = new MemStorage();
