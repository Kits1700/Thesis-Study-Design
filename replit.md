# Academic Research Study Platform

## Overview
This is a research study platform designed to investigate the effects of friction in Human-LLM interactions. The application conducts controlled experiments where participants complete literature review and argument exploration tasks with different levels of AI assistance to understand how reflective pauses influence user engagement and critical thinking.

## System Architecture
The application follows a modern full-stack architecture:

**Frontend**: React-based single-page application with TypeScript
- Built with Vite for fast development and optimized builds
- Uses Tailwind CSS for styling with shadcn/ui component library
- State management through Zustand with persistence
- TanStack Query for server-state management
- Wouter for lightweight client-side routing

**Backend**: Express.js server with TypeScript
- RESTful API design for all data operations
- Modular route handling with middleware support
- OpenAI integration for AI-powered content generation
- Dual storage options: in-memory (development) and PostgreSQL (production)

**Database**: Flexible storage architecture
- Development: In-memory storage with session persistence
- Production: PostgreSQL with Drizzle ORM
- Neon.tech recommended for cloud PostgreSQL hosting

## Key Components

### Frontend Architecture
- **Pages**: Study workflow, admin dashboard, response viewer
- **Components**: Task interfaces, questionnaires, progress tracking
- **State Management**: Centralized study state with local persistence
- **UI Library**: shadcn/ui components with consistent design system

### Backend Architecture
- **API Routes**: Participant management, task handling, response collection
- **OpenAI Integration**: Literature review and argument generation
- **Storage Layer**: Abstracted interface supporting multiple backends
- **Middleware**: Request logging, error handling, CORS support

### Data Models
```typescript
Participant {
  id: string
  participantId: string
  currentStep: string
  startTime: string
  completedAt: string | null
  studyData: object
}

Task {
  id: string
  participantId: string
  taskId: number
  taskType: "literature_review" | "argument_exploration"
  frictionType: "full_ai" | "selective_friction"
  topic: string
  generatedContent: object
  completedAt: string | null
}

Questionnaire {
  id: string
  participantId: string
  taskId: number
  responses: object
  submittedAt: string
}
```

## Data Flow

### Study Workflow
1. **Participant Registration**: Unique ID generation and session initialization
2. **Pre-Study Questionnaire**: Demographic and baseline data collection
3. **Task Selection**: Randomized task order assignment
4. **Task Execution**: 
   - Literature Review: Topic selection → AI-generated content → Review
   - Argument Exploration: Initial thoughts → AI assistance → Refinement
5. **Post-Task Questionnaires**: Experience and perception measurement
6. **Final Questionnaire**: Overall study feedback
7. **Data Export**: Comprehensive data package generation

### AI Integration Flow
- **Literature Review**: Topic → OpenAI API → Structured review generation
- **Argument Exploration**: Initial position → OpenAI API → Counter-argument generation
- **Friction Implementation**: Selective prompting vs. immediate access patterns

## External Dependencies

### Core Technologies
- **React 18+**: Frontend framework with hooks and context
- **Express.js**: Backend server framework
- **TypeScript**: Type-safe development across the stack
- **Tailwind CSS**: Utility-first styling framework

### Third-Party Services
- **OpenAI API**: GPT-based content generation (required)
- **Neon.tech**: Managed PostgreSQL hosting (recommended)
- **Drizzle ORM**: Type-safe database operations

### UI/UX Libraries
- **shadcn/ui**: Accessible component library
- **Radix UI**: Primitive component foundation
- **Lucide React**: Icon system
- **TanStack Query**: Server state management

## Deployment Strategy

### Development Environment
- **In-Memory Storage**: No database setup required
- **Port Configuration**: Auto-detects available ports (default: 5000)
- **Hot Reload**: Vite HMR for frontend, tsx for backend
- **Environment Variables**: `.env` file for API keys

### Production Deployment
- **Replit Autoscale**: Containerized deployment platform
- **Database Migration**: Automatic schema deployment with Drizzle
- **Build Process**: Vite production build + esbuild server bundle
- **Environment Configuration**: Production-specific settings

### Build Commands
```bash
# Development
npm run dev

# Production Build
npm run build

# Production Start
npm run start

# Database Operations
npm run db:push
```

## Changelog
- July 17, 2025. Task order finalized: non-friction tasks (1-2) first, friction tasks (3-4) second
- July 8, 2025. Task order changed: friction tasks (1-2) first, non-friction tasks (3-4) second
- June 30, 2025. Task order reverted: non-friction tasks (1-2) first, friction tasks (3-4) second
- June 24, 2025. Initial setup

## User Preferences
Preferred communication style: Simple, everyday language.