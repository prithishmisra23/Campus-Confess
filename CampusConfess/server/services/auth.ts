import { storage } from "../storage";
import type { User, InsertUser } from "@shared/schema";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  college: string;
  avatarUrl?: string;
  isPremium: boolean;
  isAdmin: boolean;
}

export class AuthService {
  async authenticateGoogleUser(googleProfile: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  }): Promise<AuthUser> {
    const existingUser = await storage.getUserByEmail(googleProfile.email);
    
    if (existingUser) {
      return {
        id: existingUser.id,
        email: existingUser.email,
        name: existingUser.name,
        college: existingUser.college,
        avatarUrl: existingUser.avatarUrl || undefined,
        isPremium: existingUser.isPremium || false,
        isAdmin: existingUser.isAdmin || false,
      };
    }

    // Extract college from email domain
    const emailDomain = googleProfile.email.split('@')[1];
    const college = this.getCollegeFromDomain(emailDomain);
    
    const newUser: InsertUser = {
      email: googleProfile.email,
      name: googleProfile.name,
      college,
      avatarUrl: googleProfile.picture,
    };

    const user = await storage.createUser(newUser);
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      avatarUrl: user.avatarUrl || undefined,
      isPremium: user.isPremium || false,
      isAdmin: user.isAdmin || false,
    };
  }

  private getCollegeFromDomain(domain: string): string {
    const collegeMap: Record<string, string> = {
      'srmist.edu.in': 'SRM University',
      'srm.edu.in': 'SRM University',
      'du.ac.in': 'Delhi University',
      'iitd.ac.in': 'IIT Delhi',
      'amity.edu': 'Amity University',
      'vit.ac.in': 'VIT University',
      'bits-pilani.ac.in': 'BITS Pilani',
      'jadavpuruniversity.in': 'Jadavpur University',
    };

    // Check for exact domain matches first
    for (const [emailDomain, collegeName] of Object.entries(collegeMap)) {
      if (domain.includes(emailDomain)) {
        return collegeName;
      }
    }

    // Check for common educational domains
    if (domain.includes('.edu') || domain.includes('.ac.in')) {
      return 'Other';
    }

    // Default for non-educational emails
    return 'Other';
  }

  async validateSession(userId: string): Promise<AuthUser | null> {
    const user = await storage.getUser(userId);
    
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      college: user.college,
      avatarUrl: user.avatarUrl || undefined,
      isPremium: user.isPremium || false,
      isAdmin: user.isAdmin || false,
    };
  }

  generateAnonymousName(): string {
    const adjectives = [
      'Anonymous', 'Mysterious', 'Secret', 'Hidden', 'Quiet', 'Shy', 'Bold', 'Brave', 'Wise', 'Curious',
      'Thoughtful', 'Hopeful', 'Dreamy', 'Creative', 'Artistic', 'Musical', 'Sporty', 'Academic', 'Social', 'Friendly'
    ];
    
    const animals = [
      'Panda', 'Tiger', 'Eagle', 'Bear', 'Wolf', 'Fox', 'Owl', 'Lion', 'Butterfly', 'Dolphin',
      'Phoenix', 'Dragon', 'Unicorn', 'Rabbit', 'Deer', 'Falcon', 'Shark', 'Turtle', 'Penguin', 'Koala'
    ];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    
    return `${adjective} ${animal}`;
  }
}

export const authService = new AuthService();
