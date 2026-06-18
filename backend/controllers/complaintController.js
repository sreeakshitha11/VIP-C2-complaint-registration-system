const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Agent = require('../models/Agent');
const { sendEmail } = require('../services/mailService');
const { logActivity } = require('../utils/logger');

// @desc    Create a new complaint
// @route   POST /api/complaints
// @access  Private (User only)
exports.createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;

    // Check if attachments exist in request files
    const attachments = req.files ? req.files.map((file) => file.filename) : [];

    const complaint = await Complaint.create({
      userId: req.user.id,
      title,
      description,
      category,
      priority: priority || 'LOW',
      status: 'PENDING',
      attachments,
      timeline: [
        {
          status: 'PENDING',
          updatedBy: req.user.id,
          note: 'Complaint registered successfully.',
        },
      ],
    });

    // Log action
    await logActivity(req.user.id, 'COMPLAINT_CREATED', `Complaint ID: ${complaint._id}`, req);

    // Send notification email to user
    await sendEmail({
      to: req.user.email,
      subject: `Complaint Registered Successfully: ${complaint.title}`,
      text: `Hello ${req.user.name},\n\nYour complaint titled "${complaint.title}" has been registered successfully. You can track its status using ID: ${complaint._id}.\n\nBest regards,\nComplaint Registration Team`,
    });

    res.status(201).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all complaints (with role-based access & filtering)
// @route   GET /api/complaints
// @access  Private
exports.getComplaints = async (req, res, next) => {
  try {
    let query = {};

    // Role-based visibility
    if (req.user.role === 'USER') {
      query.userId = req.user.id;
    } else if (req.user.role === 'AGENT') {
      query.assignedAgent = req.user.id;
    }
    // ADMIN sees everything

    // Filter parameters
    if (req.query.status) {
      query.status = req.query.status;
    }
    if (req.query.priority) {
      query.priority = req.query.priority;
    }
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Search query parameter
    if (req.query.search) {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } },
      ];
    }

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedAgent', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      data: complaints,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single complaint details
// @route   GET /api/complaints/:id
// @access  Private
exports.getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedAgent', 'name email phone')
      .populate('timeline.updatedBy', 'name role');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Authorization check
    if (
      req.user.role === 'USER' &&
      complaint.userId._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint',
      });
    }

    if (
      req.user.role === 'AGENT' &&
      (!complaint.assignedAgent || complaint.assignedAgent._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this complaint',
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign an Agent to a complaint
// @route   PUT /api/complaints/:id/assign
// @access  Private (Admin only)
exports.assignComplaint = async (req, res, next) => {
  try {
    const { agentId } = req.body;

    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Verify assigned user is actually an approved AGENT
    const agentUser = await User.findOne({ _id: agentId, role: 'AGENT' });
    if (!agentUser) {
      return res.status(400).json({
        success: false,
        message: 'Selected user is not an agent',
      });
    }

    if (!agentUser.isApprovedAgent) {
      return res.status(400).json({
        success: false,
        message: 'Selected agent has not been approved yet',
      });
    }

    // Manage Agent Active Complaint stats
    // Decrement previous agent count if already assigned and moving
    if (complaint.assignedAgent) {
      await Agent.updateOne(
        { userId: complaint.assignedAgent },
        { $inc: { activeComplaints: -1 } }
      );
    }

    // Increment new agent count
    await Agent.updateOne(
      { userId: agentId },
      { $inc: { activeComplaints: 1 } }
    );

    // Update complaint
    complaint.assignedAgent = agentId;
    complaint.status = 'ASSIGNED';
    complaint.timeline.push({
      status: 'ASSIGNED',
      updatedBy: req.user.id,
      note: `Complaint assigned to agent ${agentUser.name}.`,
    });

    await complaint.save();

    // Log action
    await logActivity(req.user.id, 'COMPLAINT_ASSIGNED', `Assigned complaint ${complaint._id} to Agent ${agentUser.name}`, req);

    // Send email notifications
    const complaintOwner = await User.findById(complaint.userId);
    if (complaintOwner) {
      await sendEmail({
        to: complaintOwner.email,
        subject: `Agent Assigned to Your Complaint: ${complaint.title}`,
        text: `Hello ${complaintOwner.name},\n\nAn agent (${agentUser.name}) has been assigned to look into your complaint: "${complaint.title}".\n\nBest regards,\nComplaint Registration Team`,
      });
    }

    await sendEmail({
      to: agentUser.email,
      subject: `New Complaint Assigned: ${complaint.title}`,
      text: `Hello ${agentUser.name},\n\nYou have been assigned to handle a new complaint:\n\nTitle: ${complaint.title}\nCategory: ${complaint.category}\nPriority: ${complaint.priority}\n\nPlease review it inside your dashboard.\n\nBest regards,\nComplaint Management Admin`,
    });

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint status
// @route   PUT /api/complaints/:id/status
// @access  Private (Agent and Admin only)
exports.updateComplaintStatus = async (req, res, next) => {
  try {
    const { status, note } = req.body;

    if (!['ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status transition value',
      });
    }

    let complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Agent authorization check: agent can only update status if assigned
    if (
      req.user.role === 'AGENT' &&
      (!complaint.assignedAgent || complaint.assignedAgent.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to edit this complaint status',
      });
    }

    const previousStatus = complaint.status;
    complaint.status = status;
    complaint.timeline.push({
      status,
      updatedBy: req.user.id,
      note: note || `Status updated to ${status}.`,
    });

    // If changing to resolved or rejected, decrement active complaint count for the agent
    const isFinalStatus = ['RESOLVED', 'REJECTED'].includes(status);
    const wasFinalStatus = ['RESOLVED', 'REJECTED'].includes(previousStatus);

    if (complaint.assignedAgent) {
      if (isFinalStatus && !wasFinalStatus) {
        await Agent.updateOne(
          { userId: complaint.assignedAgent },
          { $inc: { activeComplaints: -1 } }
        );
      } else if (!isFinalStatus && wasFinalStatus) {
        // Re-opened/Moved back to active
        await Agent.updateOne(
          { userId: complaint.assignedAgent },
          { $inc: { activeComplaints: 1 } }
        );
      }
    }

    await complaint.save();

    // Log action
    await logActivity(req.user.id, 'COMPLAINT_STATUS_UPDATED', `Updated complaint ${complaint._id} status to ${status}`, req);

    // Send email notification to user
    const complaintOwner = await User.findById(complaint.userId);
    if (complaintOwner) {
      await sendEmail({
        to: complaintOwner.email,
        subject: `Complaint Status Update: ${complaint.title}`,
        text: `Hello ${complaintOwner.name},\n\nThe status of your complaint "${complaint.title}" has been updated to "${status}".\nNote from processor: ${note || 'No notes added'}\n\nBest regards,\nComplaint Registration Team`,
      });
    }

    res.status(200).json({
      success: true,
      data: complaint,
    });
  } catch (error) {
    next(error);
  }
};
