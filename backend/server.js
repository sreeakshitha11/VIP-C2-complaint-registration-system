const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');

// Load env vars
dotenv.config();

// Connect to Database
const connectDB = require('./config/db');
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io configuration
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
  },
});

// Setup Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allows static uploads access from other origins
}));
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use('/api', limiter);

// Serve uploads as static resources
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const userRoutes = require('./routes/users');
const agentRoutes = require('./routes/agents');
const chatRoutes = require('./routes/chat');
const feedbackRoutes = require('./routes/feedback');
const analyticsRoutes = require('./routes/analytics');

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/analytics', analyticsRoutes);

// Root Endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the Online Complaint Registration & Management API',
  });
});

// Global Error Handler
const errorHandler = require('./middleware/error');
app.use(errorHandler);

// Socket.io real-time connection handler
io.on('connection', (socket) => {
  console.log(`Connected: Socket user [${socket.id}]`);

  // User joins a complaint specific room
  socket.on('joinRoom', ({ complaintId }) => {
    socket.join(complaintId);
    console.log(`Socket user [${socket.id}] joined Room [${complaintId}]`);
  });

  // Handle incoming messages
  socket.on('sendMessage', async ({ complaintId, senderId, receiverId, message }) => {
    try {
      const Message = require('./models/Message');
      const newMessage = await Message.create({
        complaintId,
        senderId,
        receiverId,
        message,
      });

      // Populate sender name and role for instant chat UI updates
      const populatedMessage = await Message.findById(newMessage._id).populate(
        'senderId',
        'name role'
      );

      // Broadcast message to all users in the specific room
      io.to(complaintId).emit('message', populatedMessage);
    } catch (error) {
      console.error('Socket message save failed: ', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`Disconnected: Socket user [${socket.id}]`);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;

// Handle listen errors (e.g., EADDRINUSE) with a clear message
server.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the process using this port or set a different PORT environment variable.`);
    process.exit(1);
  }
  console.error('Server error:', err);
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
