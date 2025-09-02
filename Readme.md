# Event Tracker

A full-stack event management application with role-based authorization built using the MERN stack with TypeScript. Users can create, manage, and attend events with different permission levels based on their roles.

## Features

- User authentication with Firebase (Email/Password and Google OAuth)
- Role-based access control (Admin and User roles)
- Event CRUD operations with visibility controls (Public/Private)
- Event search and filtering functionality
- Pagination for efficient data loading
- Attendance management system
- Real-time form validation
- Responsive design

## Tech Stack

### Frontend
- **React 18** - JavaScript library for building user interfaces
- **TypeScript** - Static type checking
- **TanStack Query** - Data fetching and caching library
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Firebase SDK** - Authentication service
- **Zod** - TypeScript-first schema validation
- **React Hot Toast** - Notification system

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Static type checking
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Firebase Admin SDK** - Server-side authentication
- **Zod** - Runtime type validation and parsing
- **CORS** - Cross-origin resource sharing

## Key Libraries

### TanStack Query
- Automatic caching and background updates
- Built-in pagination with `keepPreviousData` option
- Optimistic updates for better user experience
- Query invalidation and refetching

### Zod Validation
- Client-side form validation with TypeScript inference
- Server-side API request validation
- Shared validation schemas between frontend and backend
- Runtime type safety

### Pagination
- Server-side pagination implementation
- Configurable page size and navigation
- Search query integration with pagination
- Efficient data loading for large datasets

## User Roles

### User Role
- View public events and own private events
- Create, update, and delete own events
- Join and leave public events
- Search and filter events

### Admin Role
- All user permissions
- View all events including private events
- Delete any event in the system
- Full administrative access

## Environment Variables

### Backend (.env)
```
PORT=5000
CLIENT_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/event-tracker
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour-Firebase-Private-Key-Here\n-----END PRIVATE KEY-----\n"
```

### Frontend (.env)
```
REACT_APP_API_BASE_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789012
REACT_APP_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
```

## Installation and Setup

### Prerequisites
- Node.js (version 16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- Firebase project with Authentication enabled

### Backend Setup
```bash
# Clone the repository
git clone <repository-url>
cd event-tracker-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Configure your environment variables

# Start development server
npm run dev
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd event-tracker-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Configure your environment variables

# Start development server
npm start
```

### Firebase Configuration
1. Create a new Firebase project at https://console.firebase.google.com
2. Enable Authentication and configure Email/Password and Google sign-in methods
3. Generate a service account key for backend authentication
4. Copy the web app configuration for frontend setup
5. Add authorized domains for production deployment

### Database Setup
1. Install MongoDB locally or create a MongoDB Atlas cluster
2. Create a database named 'event-tracker'
3. Update the MONGODB_URI in your backend environment variables

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register or sync user with backend
- `GET /api/auth/profile` - Get current user profile

### Events
- `GET /api/events` - Get paginated events list with search and filter options
- `POST /api/events` - Create a new event
- `GET /api/events/:id` - Get specific event details
- `PUT /api/events/:id` - Update event (creator or admin only)
- `DELETE /api/events/:id` - Delete event (admin only)
- `POST /api/events/:id/attend` - Join or leave an event

## Project Structure

```
event-tracker/
├── backend/
│   ├── server.ts
│   ├── types/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── validation/
└── frontend/
    └── src/
        ├── components/
        ├── pages/
        ├── contexts/
        ├── lib/
        ├── types/
        └── utils/
```

## Development Commands

### Backend
```bash
npm run dev        # Start development server with hot reload
npm run build      # Build TypeScript to JavaScript
npm start          # Start production server
```

### Frontend
```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run test suite
```

## Live Demo

Frontend: https://your-frontend-url.netlify.app
Backend API: https://your-backend-url.herokuapp.com

## License

This project is licensed under the MIT License.