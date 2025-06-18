# Local Development Setup

## Prerequisites

1. **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)

## Quick Setup (No Database Required)

### 1. Install Dependencies

```bash
# Install dependencies
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```env
# OpenAI Configuration (required for AI features)
OPENAI_API_KEY=your_openai_api_key_here

# Development Settings
NODE_ENV=development
PORT=5000
```

### 3. Start Development Server

```bash
# Start the full application
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5000
- **API**: http://localhost:5000/api

## Getting API Keys

### OpenAI API Key (Required)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Navigate to API Keys section
4. Create a new secret key
5. Copy the key to your `.env` file

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and stores
├── server/                # Express backend
│   ├── db.ts             # Database connection
│   ├── openai.ts         # AI generation logic
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage interface
├── shared/
│   └── schema.ts         # Database schema
└── package.json          # Dependencies and scripts
```

## Available Scripts

```bash
# Development
npm run dev              # Start development server

# Database
npm run db:push          # Push schema changes to database
npm run db:studio        # Open database studio (if available)

# Production
npm run build            # Build for production
npm start                # Start production server
```

## Features

### Task Types
- **Task 1**: General literature review generation
- **Task 2**: Literature review with specific paper abstracts and citations
- **Task 3**: Argument exploration with multiple perspectives

### Study Components
- Participant management
- Task completion tracking
- Questionnaire responses
- Comprehensive data export
- Admin dashboard for data analysis

## Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL status
pg_ctl status

# Restart PostgreSQL (macOS with Homebrew)
brew services restart postgresql

# Windows
net start postgresql-x64-14
```

### Port Already in Use
```bash
# Find process using port 5000
lsof -i :5000

# Kill the process
kill -9 <PID>
```

### Missing Dependencies
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
```

## Development Tips

1. **Hot Reload**: The development server automatically reloads on code changes
2. **Database Changes**: Run `npm run db:push` after modifying `shared/schema.ts`
3. **API Testing**: Use tools like Postman or curl to test API endpoints
4. **Logs**: Check the console for detailed error messages and debug information

## Production Deployment

For production deployment, ensure:
1. Set `NODE_ENV=production`
2. Use a production PostgreSQL instance
3. Configure proper environment variables
4. Run `npm run build` before starting

## Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify all environment variables are set correctly
3. Ensure PostgreSQL is running and accessible
4. Confirm the OpenAI API key is valid and has credits