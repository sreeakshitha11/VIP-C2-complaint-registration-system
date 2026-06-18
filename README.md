# ResolveIt | Online Complaint Registration & Management System

ResolveIt is a production-ready, secure, and role-based ticket tracking platform built using the MERN stack. It features real-time Socket.IO chat rooms between clients and service agents, email notifications, custom timeline progress, and interactive Admin charts.

---

## Technical Stack

- **Frontend**: React.js, React Router DOM, Axios, Material UI (MUI v5), Recharts, jsPDF, React Toastify, Context API.
- **Backend**: Node.js, Express.js, MongoDB + Mongoose, JWT Authentication, bcryptjs, Socket.IO, Nodemailer, Helmet, CORS, Multer.

---

## Directory Structure

```
complaint/
├── backend/
│   ├── config/          # Database connection, mail setups
│   ├── models/          # User, Agent, Complaint, Message, Feedback, ActivityLog
│   ├── controllers/     # MVC controller logic
│   ├── routes/          # Express route endpoints
│   ├── middleware/      # Auth gates, rate limiters, Multer uploads
│   ├── services/        # Mailer, Socket operations
│   ├── utils/           # Database seeding scripts
│   ├── uploads/         # Static storage folder for ticket attachments
│   └── server.js        # Server entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Navbars, Protected Route guards, Footers
│   │   ├── context/     # Auth, Socket, Theme (Light/Dark mode)
│   │   ├── pages/       # Home, Login, Register, Dashboards, ComplaintDetails
│   │   ├── index.css    # Layout resets and scrollbar styles
│   │   ├── App.jsx      # Navigation routing maps
│   │   └── main.jsx     # Vite React mount
│   ├── vite.config.js   # Dev API proxies
│   └── package.json     # Frontend dependencies
└── README.md
```

---

## Local Setup & Quickstart

### 1. Prerequisites
- **Node.js** (v18.0.0 or higher)
- **MongoDB** running locally on port `27017` OR a cloud **MongoDB Atlas** connection string.

### 2. Configure Backend Environment
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create or inspect the `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/complaint_system
   JWT_SECRET=complaint_system_jwt_secret_key_987654321
   JWT_EXPIRE=30d
   CLIENT_URL=http://localhost:5173
   
   # Optional SMTP (Gmail / Mailtrap, logs to console if empty)
   SMTP_HOST=
   SMTP_PORT=587
   SMTP_USER=
   SMTP_PASS=
   SMTP_FROM_NAME=Complaint System
   SMTP_FROM_EMAIL=noreply@complaint-system.com
   ```

### 3. Run Database Seeding
Execute the seed script to purge any existing collections and populate standard test profiles (Admin, Agent, User):
```bash
npm run seed
```

### 4. Start the Application
- **Backend**:
  ```bash
  cd backend
  npm run dev   # Runs Nodemon development server on port 5000
  ```
- **Frontend**:
  ```bash
  cd frontend
  npm run dev   # Runs Vite dev server on port 5173
  ```

---

## Test Accounts Credentials

All seeded test accounts use the password: `password123`

- 🛡️ **Admin User**: `admin@complaint.com`
- ⚙️ **Service Agent**: `agent1@complaint.com` (Specialization: Billing & Subscriptions)
- 👤 **Standard Client**: `user@complaint.com`

---

## Production Deployment Guide (Render + MongoDB Atlas)

### 1. MongoDB Atlas Setup
1. Create a free shared cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Network Access** and whitelist all IPs (`0.0.0.0/0`) for Render access.
3. Go to **Database Access** and create a user credential.
4. Retrieve your connection string (e.g., `mongodb+srv://<username>:<password>@cluster.mongodb.net/complaint_system?retryWrites=true&w=majority`).

### 2. Render Deployment (Two-Service Setup)

#### Service A: Backend API (Web Service)
1. Link your GitHub repository to Render.
2. Create a new **Web Service** pointing to your repo.
3. Set the **Root Directory** to `backend`.
4. Set the **Build Command** to `npm install`.
5. Set the **Start Command** to `npm start`.
6. Add the following **Environment Variables**:
   - `MONGO_URI`: (Your MongoDB Atlas connection string)
   - `JWT_SECRET`: (A secure random string)
   - `CLIENT_URL`: (The URL of your deployed React Frontend on Render/Vercel)
   - `NODE_ENV`: `production`

#### Service B: Frontend Client (Static Site)
1. Create a new **Static Site** pointing to your repo.
2. Set the **Root Directory** to `frontend`.
3. Set the **Build Command** to `npm run build`.
4. Set the **Publish Directory** to `dist`.
5. In Render Static Site configurations, add a rewrite rule to support React Router single-page refreshes:
   - **Source**: `/*`
   - **Destination**: `/index.html`
   - **Action**: Rewrite
