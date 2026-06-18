const express = require('express');
const { getAgents, approveAgent, getAvailableAgents } = require('../controllers/agentController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);
router.use(authorize('ADMIN')); // All agent routing requires Admin privileges

router.get('/', getAgents);
router.get('/available', getAvailableAgents);
router.put('/:id/approve', approveAgent);

module.exports = router;
