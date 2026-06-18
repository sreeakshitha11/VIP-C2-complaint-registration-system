const Message = require('../models/Message');
const Complaint = require('../models/Complaint');

// @desc    Get chat history for a complaint
// @route   GET /api/chat/:complaintId
// @access  Private
exports.getChatHistory = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    // Check if complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Authorization check: User must be creator, assigned agent, or Admin
    if (req.user.role === 'USER' && complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access chat history for this complaint',
      });
    }

    if (
      req.user.role === 'AGENT' &&
      (!complaint.assignedAgent || complaint.assignedAgent.toString() !== req.user.id)
    ) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access chat history for this complaint',
      });
    }

    // Get messages
    const messages = await Message.find({ complaintId })
      .populate('senderId', 'name role')
      .sort({ timestamp: 1 });

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};
