# CampusConfess.ai

## Overview

CampusConfess.ai is an anonymous college confession platform that enables students to share confessions, thoughts, and experiences within their college communities. The platform features AI-powered content moderation, sentiment analysis, an AI counselor chatbot, and real-time engagement through voting and commenting systems. Built with a focus on anonymity and community safety, it supports multiple colleges and includes trending algorithms, admin moderation tools, and various gamification features.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching
- Shadcn UI component library built on Radix UI primitives
- Tailwind CSS for utility-first styling with custom design tokens

**Design System:**
- Dark-themed UI with glassmorphism effects
- Custom color palette featuring purple/violet primary colors and pink accents
- Responsive design supporting mobile and desktop layouts
- CSS variables for theming with HSL color values

**Component Structure:**
- Page components in `client/src/pages/` (Home, Admin, NotFound)
- Reusable UI components from Shadcn in `client/src/components/ui/`
- Feature components (ConfessionCard, AIChatbot, AdminDashboard, etc.)
- Centralized routing through App.tsx using Wouter's Switch/Route

**State Management Approach:**
- Server state managed by React Query with automatic caching and refetching
- Authentication state managed through AuthContext provider
- Session-based authentication with cookies
- Query invalidation for real-time data updates after mutations

### Backend Architecture

**Technology Stack:**
- Node.js with Express.js framework
- TypeScript for type safety across the stack
- Session-based authentication using express-session with MemoryStore
- Drizzle ORM for type-safe database operations

**API Design:**
- RESTful API endpoints organized in `server/routes.ts`
- Route categories: Authentication (`/api/auth/*`), Confessions (`/api/confessions/*`), Admin (`/api/admin/*`), Chat (`/api/chat`)
- JSON request/response format
- Session middleware for user authentication
- Error handling with appropriate HTTP status codes

**Authentication Flow:**
- Google OAuth integration for user authentication
- Session storage using MemoryStore (production should use persistent storage)
- Email domain parsing to determine user's college affiliation
- Role-based access control (regular users vs admin users)

**Data Layer:**
- Abstract storage interface defined in `server/storage.ts`
- In-memory implementation for development
- Designed to be swappable with database-backed implementations
- Supports Users, Confessions, Comments, Votes, Reports, and Chat Sessions

### Database Schema

**Technology:**
- PostgreSQL as the primary database
- Drizzle ORM with Drizzle Kit for migrations
- Schema defined in `shared/schema.ts` using Drizzle's table definitions
- Zod schemas generated from Drizzle tables for runtime validation

**Core Tables:**
1. **Users Table:**
   - UUID primary key
   - Email (unique), name, college, avatar URL
   - Premium and admin flags
   - Timestamp tracking

2. **Confessions Table:**
   - UUID primary key
   - Content, college, anonymous name
   - Tags array for categorization
   - Engagement metrics (upvotes, downvotes, comment count, views)
   - Moderation flags (isApproved, isFlagged)
   - AI analysis JSON field
   - Trending score for algorithmic ranking
   - Timestamp tracking

3. **Comments Table:**
   - UUID primary key
   - Foreign key to confession
   - Anonymous name for privacy
   - Upvote counter
   - Timestamp tracking

4. **Votes Table:**
   - Tracks user voting behavior
   - Prevents duplicate votes
   - Type field for up/down votes

5. **Reports Table:**
   - User-submitted content reports
   - Reason and status tracking
   - Admin review workflow

6. **Chat Tables:**
   - Sessions and messages for AI counselor
   - Conversation history tracking

**Data Relationships:**
- Users can create multiple confessions (anonymous)
- Confessions can have multiple comments and votes
- Users can submit reports on confessions
- Chat sessions linked to users with message history

### External Dependencies

**AI Services:**
- OpenAI GPT-5 API integration via `openai` npm package
- Services in `server/services/openai.ts`:
  - Content moderation and safety filtering
  - Sentiment analysis for confessions
  - AI counselor chatbot for mental health support
  - Advice generation based on user problems

**Database:**
- Neon Database (serverless PostgreSQL) via `@neondatabase/serverless`
- Connection pooling and edge-ready deployment
- Environment variable `DATABASE_URL` for connection string

**Session Management:**
- `express-session` for server-side session handling
- `memorystore` for development (should be replaced with `connect-pg-simple` for production PostgreSQL-backed sessions)
- Secure cookie configuration with httpOnly and secure flags

**UI Component Libraries:**
- Radix UI primitives for accessible, unstyled components
- Extensive component set (dialog, dropdown, popover, etc.)
- Form handling with React Hook Form and Zod resolvers
- Date utilities via `date-fns`

**Development Tools:**
- Replit-specific plugins for development (cartographer, dev banner, runtime error overlay)
- TypeScript with strict mode enabled
- Path aliases for cleaner imports (@/, @shared/, @assets/)
- Hot module replacement via Vite

**Build and Deployment:**
- Vite for frontend bundling
- esbuild for server bundling
- Separate development and production modes
- Static file serving in production
- Environment-specific configurations