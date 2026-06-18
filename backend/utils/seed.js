const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');
const Agent = require('../models/Agent');
const Complaint = require('../models/Complaint');
const Message = require('../models/Message');
const Feedback = require('../models/Feedback');
const ActivityLog = require('../models/ActivityLog');

dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/complaint_system';

const seedData = async () => {
  try {
    await mongoose.connect(mongoUri);
    console.log('Connected to database for seeding...');

    // Clear all existing data
    await User.deleteMany();
    await Agent.deleteMany();
    await Complaint.deleteMany();
    await Message.deleteMany();
    await Feedback.deleteMany();
    await ActivityLog.deleteMany();

    console.log('Existing data cleared.');

    // 1. Create Admins
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@complaint.com',
      password: 'password123',
      phone: '1234567890',
      role: 'ADMIN',
      isApprovedAgent: true,
    });
    console.log('Admin seeded: admin@complaint.com / password123');

    // 2. Create Approved Agent
    const approvedAgentUser = await User.create({
      name: 'Sarah Connor',
      email: 'agent1@complaint.com',
      password: 'password123',
      phone: '9876543210',
      role: 'AGENT',
      isApprovedAgent: true,
    });
    await Agent.create({
      userId: approvedAgentUser._id,
      specialization: 'Billing & Subscriptions',
      activeComplaints: 1, // Set to 1 as we will assign a complaint below
    });
    console.log('Approved Agent seeded: agent1@complaint.com / password123');

    // 3. Create Unapproved Agent
    const unapprovedAgentUser = await User.create({
      name: 'John Doe',
      email: 'agent2@complaint.com',
      password: 'password123',
      phone: '5556667777',
      role: 'AGENT',
      isApprovedAgent: false,
    });
    await Agent.create({
      userId: unapprovedAgentUser._id,
      specialization: 'Technical Support',
      activeComplaints: 0,
    });
    console.log('Unapproved Agent seeded: agent2@complaint.com / password123');

    // 4. Create Standard User
    const standardUser = await User.create({
      name: 'Alex Mercer',
      email: 'user@complaint.com',
      password: 'password123',
      phone: '4443332222',
      role: 'USER',
      isApprovedAgent: true,
    });
    console.log('User seeded: user@complaint.com / password123');

    // 5. Seed some sample Complaints
    const complaint1 = await Complaint.create({
      userId: standardUser._id,
      category: 'Billing',
      title: 'Double Charge on Subscription Renewal',
      description: 'I was charged twice on my monthly renewal billing cycle. Please refund the secondary deduction of $29.99.',
      attachments: [],
      priority: 'HIGH',
      status: 'ASSIGNED',
      assignedAgent: approvedAgentUser._id,
      timeline: [
        {
          status: 'PENDING',
          updatedBy: standardUser._id,
          note: 'Complaint registered successfully.',
          timestamp: new Date(Date.now() - 3600000 * 24 * 2), // 2 days ago
        },
        {
          status: 'ASSIGNED',
          updatedBy: admin._id,
          note: 'Complaint assigned to Sarah Connor.',
          timestamp: new Date(Date.now() - 3600000 * 24), // 1 day ago
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    });

    const complaint2 = await Complaint.create({
      userId: standardUser._id,
      category: 'Technical',
      title: 'Dashboard loads slowly',
      description: 'The main dashboard takes more than 10 seconds to render data widgets.',
      attachments: [],
      priority: 'MEDIUM',
      status: 'PENDING',
      timeline: [
        {
          status: 'PENDING',
          updatedBy: standardUser._id,
          note: 'Complaint registered successfully.',
          timestamp: new Date(Date.now() - 3600000 * 4), // 4 hours ago
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 4),
    });

    const complaint3 = await Complaint.create({
      userId: standardUser._id,
      category: 'General',
      title: 'Request for custom integration docs',
      description: 'Can you provide the docs for third-party OAuth setup?',
      attachments: [],
      priority: 'LOW',
      status: 'RESOLVED',
      assignedAgent: approvedAgentUser._id,
      timeline: [
        {
          status: 'PENDING',
          updatedBy: standardUser._id,
          note: 'Complaint registered.',
          timestamp: new Date(Date.now() - 3600000 * 24 * 5),
        },
        {
          status: 'ASSIGNED',
          updatedBy: admin._id,
          note: 'Assigned to Sarah.',
          timestamp: new Date(Date.now() - 3600000 * 24 * 4),
        },
        {
          status: 'RESOLVED',
          updatedBy: approvedAgentUser._id,
          note: 'Sent documentation links via chat. Closed ticket.',
          timestamp: new Date(Date.now() - 3600000 * 24 * 3),
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 24 * 5),
    });

    // Seed feedback for resolved complaint
    await Feedback.create({
      complaintId: complaint3._id,
      userId: standardUser._id,
      rating: 5,
      comment: 'Excellent and swift response from Sarah Connor. Super helpful documents!',
      createdAt: new Date(Date.now() - 3600000 * 24 * 2),
    });

    // Seed some messages between User and Agent on complaint1
    await Message.create({
      complaintId: complaint1._id,
      senderId: standardUser._id,
      receiverId: approvedAgentUser._id,
      message: 'Hello, I have uploaded the statement showing the double billing.',
      timestamp: new Date(Date.now() - 3600000 * 2),
    });

    await Message.create({
      complaintId: complaint1._id,
      senderId: approvedAgentUser._id,
      receiverId: standardUser._id,
      message: 'Hi Alex, looking into this now. I will query the billing merchant logs.',
      timestamp: new Date(Date.now() - 3600000 * 1),
    });

    // Seed initial Activity Logs
    await ActivityLog.create([
      { userId: admin._id, action: 'LOGIN', details: 'Admin logged in', ipAddress: '127.0.0.1' },
      { userId: approvedAgentUser._id, action: 'REGISTER', details: 'Agent registered', ipAddress: '127.0.0.1' },
      { userId: standardUser._id, action: 'COMPLAINT_CREATED', details: `Complaint created: ${complaint1.title}`, ipAddress: '127.0.0.1' },
    ]);

    console.log('Database successfully seeded!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding failed: ', error);
    process.exit(1);
  }
};

seedData();
