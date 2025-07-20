# Quora Clone

A full-stack Q&A platform built with React, Node.js, Express, and MongoDB. Users can ask questions, provide answers, vote on content, and search for relevant discussions.

## Project Structure

This project is organized as a monorepo with separate client and server configurations:

```
├── client/         # React frontend application
├── server/         # Node.js backend API
└── README.md       # This file
```

## Features

- **User Authentication**: Secure registration and login system
- **Question Management**: Ask, view, and manage questions
- **Answer System**: Provide detailed answers to questions
- **Voting System**: Upvote/downvote questions and answers
- **Search Functionality**: Find relevant content easily
- **Responsive Design**: Works seamlessly across all devices
- **User Profiles**: Track your questions, answers, and reputation

## Tech Stack

### Frontend (Client)
- React 18 with TypeScript
- React Router for navigation
- Tailwind CSS for styling
- Axios for API calls
- Lucide React for icons
- Vite for development and building

### Backend (Server)
- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)

### Installation

1. Clone the repository
2. Install dependencies for both client and server:

   **For the client:**
   ```bash
   cd client
   npm install
   ```

   **For the server:**
   ```bash
   cd server
   npm install
   ```

3. Set up environment variables:
   - Navigate to the `server` directory
   - Copy `.env.example` to `.env` (if available) or create a new `.env` file
   - Update MongoDB connection string and JWT secret

4. Start MongoDB (if running locally)

5. Start the backend server:
   ```bash
   cd server
   npm run dev
   ```

6. In a new terminal, start the frontend development server:
   ```bash
   cd client
   npm run dev
   ```

7. Open your browser and navigate to `http://localhost:3000`

## Development

### Client Development
The client runs on port 3000 and includes a proxy configuration to forward API requests to the server on port 5000.

### Server Development
The server runs on port 5000 and provides RESTful API endpoints for the frontend.

### API Proxy
The client is configured with Vite proxy to forward `/api/*` requests to `http://localhost:5000`, eliminating CORS issues during development.

## Building for Production

### Client
```bash
cd client
npm run build
```

### Server
The server runs directly with Node.js:
```bash
cd server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
