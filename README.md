# IEEE Execom Event - Mind Mashup Game

A real-time multiplayer quiz game built with Next.js, Socket.IO, and MongoDB.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB running locally or MongoDB Atlas connection string
- npm or yarn

### Environment Setup

1. **Create environment files:**

   **Client (.env.local):**
   ```bash
   MONGODB_URI=mongodb://localhost:27017/ieee-game
   NEXT_PUBLIC_SERVER_URL=http://localhost:3001
   ```

   **Server (.env):**
   ```bash
   MONGODB_URI=mongodb://localhost:27017/ieee-game
   PORT=3001
   ```

2. **Install dependencies:**
   ```bash
   # Install client dependencies
   cd client
   npm install

   # Install server dependencies  
   cd ../server
   npm install
   ```

3. **Start the servers:**
   ```bash
   # Start the Socket.IO server (in server directory)
   npm start

   # Start the Next.js client (in client directory, new terminal)
   npm run dev
   ```

4. **Access the application:**
   - Client: http://localhost:3000
   - Server: http://localhost:3001

## 🏗️ Project Structure

```
├── client/                 # Next.js frontend
│   ├── src/
│   │   ├── app/           # App router pages
│   │   ├── components/    # Reusable components
│   │   ├── lib/          # Utilities and database
│   │   └── modals/       # Mongoose models
│   └── package.json
├── server/                # Socket.IO backend
│   ├── models/           # Mongoose schemas
│   ├── utils/            # Questions data
│   └── index.js          # Main server file
└── README.md
```

## 🔧 Issues Fixed

The following issues were identified and resolved:

1. **Missing Environment Variables**: Created example environment files
2. **Commented-out Models**: Fixed Group.js, Participant.js, and Answer.js models
3. **Import Path Mismatches**: Fixed API routes to import from `@/modals/` instead of `@/models/`
4. **Incorrect Questions Import**: Replaced server import with client-side questions array
5. **Unnecessary Dependencies**: Removed server-side packages from client dependencies
6. **Model Inconsistencies**: Aligned client and server model schemas

## 🎮 Game Features

- Real-time multiplayer gameplay
- Multiple question categories (Tech Riddles, Math, Logic, etc.)
- Proctor mode for game management
- Live leaderboard updates
- Socket.IO for real-time communication

## 🛠️ Development

### Adding New Questions
Edit `client/src/lib/questions.ts` to add new question sets.

### Database Models
- **Group**: Manages game sessions and participants
- **Participant**: Player information and scores
- **Answer**: Tracks player responses and scoring

### API Routes
- `/api/start`: Player registration
- `/api/groups`: Group management and login
- `/api/submit`: Answer submission
- `/api/leaderboard`: Score rankings

## 🐛 Troubleshooting

1. **MongoDB Connection Error**: Ensure MongoDB is running and connection string is correct
2. **Socket Connection Issues**: Check if server is running on port 3001
3. **Import Errors**: Verify all model files are properly exported
4. **Build Errors**: Clear `.next` folder and reinstall dependencies

## 📝 License

This project is for IEEE Execom Event use.
