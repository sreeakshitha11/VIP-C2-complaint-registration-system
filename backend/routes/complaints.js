const express = require('express');
const { check } = require('express-validator');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validateFields } = require('../middleware/validator');

const router = express.Router();

router.use(protect); // All complaint routes require authentication

router.post(
  '/',
  authorize('USER'),
  upload.array('attachments', 5), // allow up to 5 files
  [
    check('title', 'Title is required').notEmpty(),
    check('description', 'Description is required').notEmpty(),
    check('category', 'Category is required').notEmpty(),
    validateFields,
  ],
  createComplaint
);

router.get('/', getComplaints);

router.get('/:id', getComplaintById);

router.put(
  '/:id/assign',
  authorize('ADMIN'),
  [
    check('agentId', 'Agent ID is required').isMongoId(),
    validateFields,
  ],
  assignComplaint
);

router.put(
  '/:id/status',
  authorize('AGENT', 'ADMIN'),
  [
    check('status', 'Status is required').notEmpty(),
    validateFields,
  ],
  updateComplaintStatus
);

module.exports = router;
