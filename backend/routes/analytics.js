const express = require('express');
const { getAdminAnalytics } = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, authorize('ADMIN'), getAdminAnalytics);

module.exports = router;
