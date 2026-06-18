const express = require('express');
const { check } = require('express-validator');
const { submitFeedback, getFeedbackByComplaint } = require('../controllers/feedbackController');
const { protect, authorize } = require('../middleware/auth');
const { validateFields } = require('../middleware/validator');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  authorize('USER'),
  [
    check('complaintId', 'Complaint ID is required').isMongoId(),
    check('rating', 'Rating is required and must be between 1 and 5').isInt({ min: 1, max: 5 }),
    check('comment', 'Comment is required').notEmpty(),
    validateFields,
  ],
  submitFeedback
);

router.get('/:complaintId', getFeedbackByComplaint);

module.exports = router;
