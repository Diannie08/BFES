# IESv2 - Authentication Web Application

## Setup Instructions

### 1. Environment Setup
1. Navigate to the `server` directory
2. Rename `.env.example` to `.env`
3. Update the `.env` file with your credentials:
   ```
   PORT=3000
   GOOGLE_CLIENT_ID=your_client_id_here
   GOOGLE_CLIENT_SECRET=your_client_secret_here
   MONGODB_URI=your_mongodb_uri_here
   SESSION_SECRET=your_session_secret_here
   ```

### 2. Install Dependencies

#### Backend Setup
```bash
# Install server dependencies
npm install

# Start the server
cd server
node index.js
```

#### Frontend Setup
```bash
# Install client dependencies
cd client
npm install

# Start the frontend application
npm start
```

The application should now be running with:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Features
- Google OAuth Authentication
- User Management
- Secure Session Handling

## Tech Stack
- Frontend: React.js
- Backend: Node.js, Express.js
- Database: MongoDB
- Authentication: Google OAuth
