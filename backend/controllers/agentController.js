const User = require('../models/User');
const Agent = require('../models/Agent');
const { logActivity } = require('../utils/logger');

// @desc    Get all agents with active complaints metrics
// @route   GET /api/agents
// @access  Private (Admin only)
exports.getAgents = async (req, res, next) => {
  try {
    // Find all users with AGENT role
    const agents = await User.find({ role: 'AGENT' }).sort({ createdAt: -1 });

    // Populate specialization and active complaints for each agent
    const agentsWithDetails = await Promise.all(
      agents.map(async (agentUser) => {
        const agentProfile = await Agent.findOne({ userId: agentUser._id });
        return {
          id: agentUser._id,
          name: agentUser.name,
          email: agentUser.email,
          phone: agentUser.phone,
          isApprovedAgent: agentUser.isApprovedAgent,
          createdAt: agentUser.createdAt,
          specialization: agentProfile ? agentProfile.specialization : 'N/A',
          activeComplaints: agentProfile ? agentProfile.activeComplaints : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: agentsWithDetails.length,
      data: agentsWithDetails,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve or Reject an Agent
// @route   PUT /api/agents/:id/approve
// @access  Private (Admin only)
exports.approveAgent = async (req, res, next) => {
  try {
    const { approve } = req.body; // Expects a boolean true/false

    const agentUser = await User.findOne({ _id: req.params.id, role: 'AGENT' });
    if (!agentUser) {
      return res.status(404).json({
        success: false,
        message: 'Agent not found',
      });
    }

    agentUser.isApprovedAgent = approve === true;
    await agentUser.save();

    // Log action
    await logActivity(
      req.user.id,
      approve ? 'AGENT_APPROVED' : 'AGENT_DISAPPROVED',
      `Agent ${agentUser.name} (${agentUser.email}) approval status updated to ${approve}`,
      req
    );

    res.status(200).json({
      success: true,
      message: `Agent ${agentUser.name} has been ${approve ? 'approved' : 'disapproved'} successfully.`,
      data: agentUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get list of approved & available agents (for assignment)
// @route   GET /api/agents/available
// @access  Private (Admin only)
exports.getAvailableAgents = async (req, res, next) => {
  try {
    const approvedAgentUsers = await User.find({ role: 'AGENT', isApprovedAgent: true });
    
    const availableAgents = await Promise.all(
      approvedAgentUsers.map(async (user) => {
        const profile = await Agent.findOne({ userId: user._id });
        return {
          id: user._id,
          name: user.name,
          specialization: profile ? profile.specialization : 'General',
          activeComplaints: profile ? profile.activeComplaints : 0,
        };
      })
    );

    res.status(200).json({
      success: true,
      data: availableAgents,
    });
  } catch (error) {
    next(error);
  }
};
