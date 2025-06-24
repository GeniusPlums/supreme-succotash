# AuctoGames Opinion Contest Platform

## Overview

AuctoGames is a sports opinion contest platform built as a full-stack web application. The platform allows users to participate in live opinion contests by selecting their predictions on sports-related questions and competing for prizes. The application features a mobile-first design with real-time leaderboards and contest management capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **UI Components**: Radix UI with shadcn/ui component library
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js server
- **Database**: PostgreSQL with Drizzle ORM (migrated from in-memory storage)
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Session Management**: Session-based authentication using localStorage
- **API Design**: RESTful API endpoints
- **Data Persistence**: Full PostgreSQL integration with automatic initialization

### Development Environment
- **Platform**: Replit with Node.js 20, Web, and PostgreSQL 16 modules
- **Development Server**: Vite dev server with Express middleware
- **Hot Reload**: Vite HMR with runtime error overlay

## Key Components

### Database Schema
The application uses four main tables:
- **Contests**: Stores contest information including name, description, prize, timing, and participant counts
- **Questions**: Stores contest questions with multiple choice options and vote counts
- **Participants**: Stores user participation data including selections and scores
- **Leaderboard**: Stores calculated rankings and points for participants

### Core Features
1. **Contest Participation**: Users can join active contests and make predictions
2. **Question Selection**: Interactive UI for selecting 5 out of 11 sports questions
3. **Real-time Voting**: Questions display current vote counts for each option
4. **Leaderboard System**: Automatic calculation and display of participant rankings
5. **Admin Panel**: Interface for setting correct answers and calculating final scores
6. **Mobile-Optimized**: Responsive design with mobile-first approach

### API Endpoints
- `GET /api/contest` - Retrieve active contest information
- `GET /api/contest/:id/questions` - Get questions for a specific contest
- `POST /api/contest/:id/join` - Join a contest
- `POST /api/participant/:id/selections` - Submit user selections
- `GET /api/contest/:id/leaderboard` - Retrieve contest leaderboard
- `POST /api/admin/contest/:id/answers` - Set correct answers (admin)
- `POST /api/admin/contest/:id/calculate` - Calculate final scores (admin)

## Data Flow

1. **User Entry**: Users access the landing page and navigate to active contests
2. **Contest Join**: Users join contests with auto-generated session IDs
3. **Question Selection**: Users select 5 questions from 11 available options
4. **Prediction Submission**: User selections are stored with their participant record
5. **Admin Processing**: Administrators set correct answers and trigger score calculation
6. **Leaderboard Update**: System calculates points based on correct predictions and updates rankings
7. **Results Display**: Final leaderboard shows participant rankings and scores

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Database ORM and query builder
- **@tanstack/react-query**: Server state management
- **@radix-ui/react-***: UI component primitives
- **tailwindcss**: Utility-first CSS framework
- **wouter**: Lightweight routing library

### Development Dependencies
- **vite**: Build tool and development server
- **typescript**: Type checking and compilation
- **tsx**: TypeScript execution for server development
- **esbuild**: Production server bundling

## Deployment Strategy

### Production Build
- **Client**: Vite builds React application to `dist/public`
- **Server**: esbuild bundles Express server to `dist/index.js`
- **Database**: Drizzle migrations applied via `npm run db:push`

### Replit Configuration
- **Auto-deployment**: Configured for autoscale deployment target
- **Port Mapping**: Local port 5000 mapped to external port 80
- **Environment**: PostgreSQL 16 module provides database connectivity
- **Development**: Hot reload with file watching and automatic restart

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string (required)
- `NODE_ENV`: Environment mode (development/production)

## Changelog

Changelog:
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.