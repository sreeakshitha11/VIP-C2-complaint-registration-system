const Feedback = require('../models/Feedback');
const Complaint = require('../models/Complaint');
const { logActivity } = require('../utils/logger');

// @desc    Submit feedback for a resolved complaint
// @route   POST /api/feedback
// @access  Private (User only)
exports.submitFeedback = async (req, res, next) => {
  try {
    const { complaintId, rating, comment } = req.body;

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a rating between 1 and 5',
      });
    }

    // Check if complaint exists
    const complaint = await Complaint.findById(complaintId);
    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    // Verify ownership
    if (complaint.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You can only submit feedback for your own complaints',
      });
    }

    // Verify complaint is resolved
    if (complaint.status !== 'RESOLVED') {
      return res.status(400).json({
        success: false,
        message: 'You can only submit feedback for resolved complaints',
      });
    }

    // Check if feedback already exists
    const feedbackExists = await Feedback.findOne({ complaintId });
    if (feedbackExists) {
      return res.status(400).json({
        success: false,
        message: 'Feedback has already been submitted for this complaint',
      });
    }

    // Create feedback
    const feedback = await Feedback.create({
      complaintId,
      userId: req.user.id,
      rating,
      comment,
    });

    // Log action
    await logActivity(req.user.id, 'FEEDBACK_SUBMITTED', `Submitted rating ${rating} for complaint ${complaintId}`, req);

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get feedback for a complaint
// @route   GET /api/feedback/:complaintId
// @access  Private
exports.getFeedbackByComplaint = async (req, res, next) => {
  try {
    const { complaintId } = req.params;

    const feedback = await Feedback.findOne({ complaintId })
      .populate('userId', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'No feedback found for this complaint',
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    next(error);
  }
};
