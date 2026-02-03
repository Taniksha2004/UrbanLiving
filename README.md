# UrbanCircle - Complete Project Workflow

## 📋 Project Overview

UrbanCircle is a full-stack web application built with a **Node.js/Express backend** and a **React/TypeScript frontend**. The platform facilitates urban living by enabling users to manage properties, split bills, share services, and communicate with neighbors. It uses MongoDB for data persistence and Socket.io for real-time messaging.

---

## 🏗️ Project Architecture

### Tech Stack

**Backend:**
- Node.js + Express.js
- TypeScript
- MongoDB + Mongoose ODM
- Passport.js (Google OAuth 2.0)
- Socket.io (Real-time messaging)
- AWS S3 (File uploads)
- JWT Authentication

**Frontend:**
- React 18.3
- TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router v6 (Navigation)
- Socket.io Client (Real-time updates)
- Framer Motion (Animations)

---

## 📊 Database Schema Overview

The application uses the following MongoDB models:

1. **User Model** - Stores user account information (email, password/googleId, phone, userType)
2. **Profile Model** - Extended user information (avatar, bio, preferences)
3. **Property Model** - Real estate listings (address, rent, amenities, images)
4. **Service Model** - Shared services (wifi, parking, utilities, provider details)
5. **Bill Model** - Bill splitting records (amount, description, status, participants)
6. **Message Model** - Chat messages between users (content, sender, receiver, timestamp)
7. **RefreshToken Model** - JWT token management for session handling

---

## 🔐 Authentication Workflow

### Email/Password Registration & Login

1. **Sign Up Flow**
   - User fills registration form with email, password, phone, and userType (landlord/tenant)
   - Backend validates input using middleware in `validate.ts`
   - Password is hashed using bcrypt in `auth.service.ts`
   - User is created in MongoDB via `user.model.ts`
   - JWT access token and refresh token are generated via `jwt.ts` utility
   - User is redirected to dashboard

2. **Login Flow**
   - User submits email and password
   - Backend verifies password using bcrypt
   - Access token (15min) and refresh token (7 days) are generated
   - Tokens are sent to frontend and stored in localStorage
   - User gains authenticated access to protected routes

### Google OAuth 2.0 Integration

1. **Backend Configuration**
   - Passport.js configured with Google OAuth strategy in `config/passport.ts`
   - Environment variables: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`
   - User model updated to support optional password and googleId field

2. **Google Sign-In Process**
   - User clicks "Sign in with Google" button on login/signup page
   - Frontend redirects to `GET /auth/google` (initiates OAuth handshake)
   - Google login dialog appears
   - User authenticates with Google
   - Google redirects to `GET /auth/google/callback` with authorization code

3. **User Creation/Linking**
   - `findOrCreateUser()` function in auth.service.ts handles three scenarios:
     - **Returning user**: Finds existing user by googleId
     - **Existing email user**: Links googleId to existing email account
     - **New user**: Creates new user from Google profile data
   - JWT token is generated and returned via URL redirect
   - Frontend's AuthSuccess component captures token and saves to localStorage

4. **Protected Routes**
   - Middleware in `middlewares/auth.ts` validates JWT on every request
   - Expired tokens trigger refresh token flow
   - Invalid tokens return 401 Unauthorized

---

## 🚀 Backend API Workflow

### Server Initialization (`server.ts`)

1. Loads environment variables from `.env` file
2. Connects to MongoDB using Mongoose
3. Initializes Socket.io for real-time communication
4. Starts Express server on configured port

### Request Flow

```
HTTP Request → CORS Middleware → Express Middleware → Route Handler 
→ Validation Middleware → Auth Middleware → Controller → Service Layer 
→ MongoDB Query → Response
```

### Core Routes & Controllers

#### 1. **Authentication Routes** (`/auth`)
- `POST /auth/register` - Register new user with email/password
- `POST /auth/login` - Login with email/password
- `GET /auth/google` - Initiate Google OAuth
- `GET /auth/google/callback` - Google OAuth callback
- `POST /auth/refresh-token` - Refresh expired JWT token

**Controller**: `auth.controller.ts` handles request validation and delegates to `auth.service.ts`

#### 2. **User Routes** (`/users`)
- `GET /users/:id` - Get user profile
- `PUT /users/:id` - Update user information
- `DELETE /users/:id` - Delete user account

**Controller**: `user.controller.ts` manages user data operations

#### 3. **Property Routes** (`/api/properties`)
- `POST /api/properties` - Create new property listing
- `GET /api/properties` - Get all properties (with filters)
- `GET /api/properties/:id` - Get single property details
- `PUT /api/properties/:id` - Update property
- `DELETE /api/properties/:id` - Delete property

**Controller**: `property.controller.ts` handles CRUD operations for properties

#### 4. **Service Routes** (`/api/services`)
- `POST /api/services` - Create shared service
- `GET /api/services` - List available services
- `GET /api/services/:id` - Get service details
- `PUT /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

**Controller**: `service.controller.ts` manages shared services (wifi, parking, etc.)

#### 5. **Bill Routes** (`/api/bills`)
- `POST /api/bills` - Create bill for splitting
- `GET /api/bills` - Get all bills for user
- `GET /api/bills/:id` - Get bill details
- `PUT /api/bills/:id` - Update bill status
- `DELETE /api/bills/:id` - Delete bill

**Controller**: `bill.controller.ts` handles bill splitting logic

#### 6. **Message Routes** (`/api/messages`)
- `POST /api/messages` - Send message (via Socket.io)
- `GET /api/messages/:conversationId` - Get message history
- `DELETE /api/messages/:id` - Delete message

**Controller**: `message.controller.ts` manages chat messages

#### 7. **Profile Routes** (`/api/profiles`)
- `POST /api/profiles` - Create user profile
- `GET /api/profiles/:userId` - Get user profile
- `PUT /api/profiles/:userId` - Update profile with avatar
- `DELETE /api/profiles/:userId` - Delete profile

**Controller**: `profile.controller.ts` handles user profile data and avatar uploads

### Middleware Stack

1. **CORS Middleware** - Allows frontend to access backend API
2. **Body Parser** - Parses JSON and URL-encoded request bodies
3. **Passport Initialize** - Sets up authentication
4. **Authentication Middleware** (`auth.ts`) - Validates JWT tokens
5. **Role Middleware** (`role.middleware.ts`) - Checks user permissions
6. **Validation Middleware** (`validate.ts`) - Validates request data
7. **Error Handling** (`error.ts`) - Catches and formats errors

### File Upload Workflow (S3)

1. User uploads file (avatar, property image, etc.)
2. Multer middleware stores file temporarily in `uploads/` folder
3. `s3.service.ts` uploads file to AWS S3
4. S3 URL is stored in database
5. Temporary file is deleted from server

---

## 🎨 Frontend Application Workflow

### Application Initialization

1. **Entry Point** (`main.tsx`)
   - Renders React app into DOM
   - Mounts App component

2. **App Component** (`App.tsx`)
   - Sets up routing with React Router v6
   - Initializes context providers (Auth, Matches, Socket)
   - Defines protected and public routes

### Context Providers (State Management)

#### 1. **AuthContext** (`context/AuthContext.tsx`)
- Manages authentication state
- Stores user data and JWT tokens
- Handles login/logout/register operations
- Persists tokens in localStorage
- Provides auth status to entire app

#### 2. **SocketContext** (`context/SocketContext.tsx`)
- Manages Socket.io connection
- Handles real-time events (messages, notifications)
- Broadcasts user status updates

#### 3. **MatchesContext** (`context/MatchesContext.tsx`)
- Manages user matches/connections
- Stores relevant user data for matching algorithm

### Page Flow & Components

#### 1. **Home Page** (`HomePage.tsx`)
- Landing page with Spline 3D animation
- Displays app features
- CTA buttons for login/signup

#### 2. **Login Page** (`LoginPage.tsx`)
- Email/password login form
- "Sign in with Google" button
- Validates credentials via backend
- Stores JWT tokens on successful login

#### 3. **Sign Up Page** (`SignUpPage.tsx`)
- User registration form
- Collects email, password, phone, userType
- Validates input before submission
- "Sign up with Google" option

#### 4. **Auth Success** (`AuthSuccess.tsx`)
- Intermediary component for OAuth redirect
- Captures JWT token from URL
- Saves token to localStorage
- Redirects to dashboard

#### 5. **Dashboard Page** (`DashboardPage.tsx`)
- Main app hub after login
- Shows user summary and quick actions
- Navigation to other pages

#### 6. **Properties Page** (`PropertiesPage.tsx`)
- Browse all property listings
- Filter and search properties
- View property details
- Landlords can manage their listings

#### 7. **Add Property Page** (`AddPropertyPage.tsx`)
- Form to create new property listing
- Upload property images
- Set rent, amenities, description
- Save property to backend

#### 8. **Bill Split Page** (`BillSplitPage.tsx`)
- View bills user is involved in
- See bill split details and status
- Approve/reject bill splits

#### 9. **Add Bill Page** (`AddBillPage.tsx`)
- Create new bill for splitting
- Select participants
- Set amount and description
- Calculate split amounts

#### 10. **Chat Page** (`ChatPage.tsx`)
- Real-time messaging interface
- List of conversations
- Message history display
- Socket.io integration for live updates

#### 11. **Quick Basket Page** (`QuickBasketPage.tsx`)
- Summary of recent services/bills
- Quick action buttons

#### 12. **Home Match Page** (`HomeMatchPage.tsx`)
- Matching algorithm results
- Find compatible roommates/properties

#### 13. **My Listings Page** (`MyListingsPage.tsx`)
- View properties/services created by user
- Edit or delete listings

#### 14. **Settings Page** (`Settings.tsx`)
- User profile settings
- Password change
- Preferences configuration

### Protected Routes

Routes are protected using `ProtectedRoute.tsx` component:
```
- Only authenticated users can access
- Checks Auth context for valid JWT
- Redirects to login if not authenticated
```

### API Communication Workflow

1. **API Client** (`apiClient.ts`)
   - Axios instance with base configuration
   - Automatically adds JWT token to requests
   - Handles token refresh on 401 response
   - Centralized error handling

2. **Request/Response Flow**
   ```
   React Component → API Client (with JWT) → Backend Route 
   → Controller → Service → Database → Response → Context Update → UI Re-render
   ```

3. **Error Handling**
   - Network errors show user-friendly messages
   - 401 errors trigger login redirect
   - 403 errors show permission denied messages
   - Other errors display appropriate notifications

### Real-Time Features (Socket.io)

1. **Message Updates**
   - User sends message via Socket.io
   - Backend broadcasts to recipient
   - ChatPage receives update and displays new message
   - UI updates in real-time without refresh

2. **Presence Tracking**
   - User connects → backend tracks online status
   - User types indicator sent to recipient
   - User disconnects → status updated

---

## 🔄 Complete User Journey

### New User Journey

1. **Arrival** → User lands on HomePage
2. **Sign Up** → Fills form or uses Google OAuth
3. **Email Verification** → Account created in MongoDB
4. **Profile Creation** → Uploads avatar via AddProfilePage
5. **Browse Properties** → Views listings on PropertiesPage
6. **Create Listing** → Adds property via AddPropertyPage (if landlord)
7. **Connect** → Messages neighbors on ChatPage
8. **Split Bills** → Creates bill splits via BillSplitPage
9. **Dashboard** → Manages account on DashboardPage

### Returning User Journey

1. **Login** → Email/password or Google OAuth
2. **JWT Validation** → Token checked by auth middleware
3. **Dashboard Access** → ProtectedRoute verifies authentication
4. **Dashboard Display** → Shows personalized data
5. **Feature Access** → Browse, chat, split bills, manage properties
6. **Logout** → Tokens cleared from localStorage

---

## 📁 Project Directory Structure

```
UrbanCircle/
├── backend/
│   ├── src/
│   │   ├── config/          # Database, passport, environment config
│   │   ├── controllers/      # Request handlers
│   │   ├── middlewares/      # Auth, validation, error handling
│   │   ├── models/           # MongoDB schemas
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Business logic, S3 integration
│   │   ├── types/            # TypeScript type definitions
│   │   ├── utils/            # Utilities (JWT, logger, error handler)
│   │   ├── app.ts            # Express app configuration
│   │   └── server.ts         # Server entry point
│   ├── uploads/              # Temporary file storage
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── context/          # React Context providers
│   │   ├── pages/            # Page components
│   │   ├── apiClient.ts      # Axios instance
│   │   ├── App.tsx           # Main app component with routing
│   │   └── main.tsx          # React entry point
│   ├── public/               # Static assets
│   └── package.json
└── README.md
```

---

## ⚙️ Development & Deployment

### Running Locally

**Backend:**
```bash
cd backend
npm install
npm run dev
```
Runs on `http://localhost:3000` (or configured port)

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```
Runs on `http://localhost:5173` (Vite default)

### Environment Variables

**Backend (.env):**
```
MONGODB_URI=mongodb://...
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret
AWS_REGION=your_region
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

**Frontend (.env):**
```
VITE_API_BASE_URL=http://localhost:3000
```

### Build & Deploy

**Backend:**
```bash
npm run build
```

**Frontend:**
```bash
npm run build    # Creates optimized dist/ folder
npm run preview  # Preview production build
```

---

## 🔒 Security Features

1. **JWT Authentication** - Stateless token-based auth
2. **Password Hashing** - bcrypt with salt rounds
3. **CORS Protection** - Restricted to frontend domain
4. **SQL Injection Prevention** - MongoDB with parameterized queries
5. **Rate Limiting** - Can be added via express-rate-limit
6. **Environment Variables** - Sensitive data not in code
7. **OAuth 2.0** - Secure Google authentication

---

## 🐛 Error Handling

- Global error middleware catches all exceptions
- Validation middleware validates request data
- JWT middleware handles auth errors
- All errors formatted consistently for frontend
- Detailed logging for debugging

