# Local Development Setup

This guide will help you run the academic research platform locally on your machine.

## Prerequisites

- Node.js 18+ installed
- Git

## Quick Start

1. **Clone and install dependencies:**
   ```bash
   git clone <your-repo>
   cd <project-folder>
   npm install
   ```

2. **Set up environment variables:**
   Copy the `.env` file and configure your API keys:
   ```bash
   cp .env .env.local
   ```

3. **Database Setup (Choose one option):**

### Option A: Free Neon Database (Recommended)

1. Visit [neon.tech](https://neon.tech) and create a free account
2. Create a new project/database
3. Copy the connection string from the dashboard
4. Add it to your `.env.local` file:
   ```
   DATABASE_URL=postgresql://[username]:[password]@[host]/[database]?sslmode=require
   ```

### Option B: Local PostgreSQL

1. Install PostgreSQL locally
2. Create a database:
   ```bash
   createdb thesis_study
   ```
3. Add to `.env.local`:
   ```
   DATABASE_URL=postgresql://localhost:5432/thesis_study
   ```

### Option C: Docker PostgreSQL

1. Run PostgreSQL in Docker:
   ```bash
   docker run --name thesis-postgres -e POSTGRES_PASSWORD=password -e POSTGRES_DB=thesis_study -p 5432:5432 -d postgres:14
   ```
2. Add to `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres:password@localhost:5432/thesis_study
   ```

4. **Push database schema:**
   ```bash
   npm run db:push
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5000`

## API Keys Required

- **OPENAI_API_KEY**: For AI-powered literature reviews and argument exploration
- **DATABASE_URL**: PostgreSQL database connection string

## Troubleshooting

### Database Connection Issues
- Ensure your DATABASE_URL is correctly formatted
- Check if the database server is running
- Verify network connectivity to remote databases

### OpenAI API Issues
- Ensure your API key is valid and has sufficient credits
- Check the OpenAI service status if requests fail

### Port Already in Use
- The app runs on port 5000 by default
- If the port is occupied, stop other services or modify the port in the code

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run db:push` - Push database schema changes
- `npm run check` - Type checking

## Project Structure

- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript schemas
- `/attached_assets` - Static assets

For more help, check the documentation or create an issue.