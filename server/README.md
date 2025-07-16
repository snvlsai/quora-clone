# Quora Clone Server

Backend API server for the Quora Clone application built with Node.js, Express, and MongoDB.

## Features

- User authentication with JWT
- Question and answer management
- Voting system for questions and answers
- Search functionality
- User profile and statistics
- RESTful API design

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update MongoDB connection string and JWT secret

4. Start the server:
   ```bash
   npm run dev  # Development mode with auto-restart
   npm start    # Production mode
   ```

The server will start on port 5000 by default.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Questions
- `GET /api/questions` - Get all questions
- `GET /api/questions/:id` - Get single question
- `POST /api/questions` - Create new question
- `POST /api/questions/:id/vote` - Vote on question
- `POST /api/questions/:id/answers` - Add answer to question
- `POST /api/questions/:questionId/answers/:answerId/vote` - Vote on answer

### Users
- `GET /api/users/stats` - Get user statistics
- `GET /api/users/questions` - Get user's questions

### Search
- `GET /api/search?q=query` - Search questions

## Environment Variables

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `PORT` - Server port (default: 5000)

## Project Structure

```
server/
├── models/         # MongoDB models
├── routes/         # API routes
├── middleware/     # Custom middleware
├── index.js        # Server entry point
└── package.json    # Dependencies and scripts
```