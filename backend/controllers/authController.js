const User = require('../models/User');
const Agent = require('../models/Agent');
const jwt = require('jsonwebtoken');
const { logActivity } = require('../utils/logger');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret_key_123456', {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, specialization } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    // Set approval status for Agent role (needs Admin approval)
    // Admin user will have isApprovedAgent set to false, which doesn't matter since they are not agents.
    // User role is approved by default.
    // Agent role is approved: false by default.
    const isApprovedAgent = role === 'AGENT' ? false : true;

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone,
      role: role || 'USER',
      isApprovedAgent,
    });

    // If role is AGENT, create corresponding Agent record
    if (role === 'AGENT') {
      if (!specialization) {
        // Delete user if agent specialization is not provided (database integrity)
        await User.findByIdAndDelete(user._id);
        return res.status(400).json({
          success: false,
          message: 'Specialization is required for Agent registration',
        });
      }

      await Agent.create({
        userId: user._id,
        specialization,
        activeComplaints: 0,
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Log action
    await logActivity(user._id, 'REGISTER', `User registered with role: ${user.role}`, req);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApprovedAgent: user.isApprovedAgent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Check for user (include password field)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Generate token
    const token = generateToken(user._id);

    // Log action
    await logActivity(user._id, 'LOGIN', `User logged in successfully`, req);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApprovedAgent: user.isApprovedAgent,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user details
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isApprovedAgent: user.isApprovedAgent,
      },
    });
  } catch (error) {
    next(error);
  }
};
