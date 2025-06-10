# Local Development Setup

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   Create a `.env` file in the project root:
   ```
   OPENAI_API_KEY=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
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Access the application:**
   Open your browser to `http://localhost:5000`

## What's Included

- **In-Memory Storage**: No database setup required - all data persists during the session
- **AI-Powered Features**: Literature review and argument exploration using OpenAI
- **Admin Dashboard**: View and analyze study data at `/admin`
- **Participant Interface**: Complete study workflow with task progression

## Port Configuration

The application automatically configures ports for local development:
- **Development**: Uses `localhost:5000` 
- **Production**: Uses `0.0.0.0:5000`

If port 5000 is occupied, set a custom port:
```bash
PORT=3000 npm run dev
```

## Features

### For Participants
- Generate unique participant IDs
- Complete study tasks with AI assistance
- Submit questionnaire responses
- Track progress through study phases

### For Researchers
- View all participant data at `/admin`
- Export study responses at `/responses`
- Monitor real-time study progress
- Access comprehensive analytics

## Troubleshooting

### Port Already in Use
```bash
# Kill process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port
PORT=3001 npm run dev
```

### OpenAI API Issues
Ensure your API key has sufficient credits and is properly formatted in the `.env` file.

## Data Persistence

Data is stored in memory during the session. For persistent storage across server restarts, consider upgrading to a database solution like Firebase or PostgreSQL.

The current in-memory approach is ideal for:
- Development and testing
- Short-term research studies
- Prototype validation
- Educational demonstrations