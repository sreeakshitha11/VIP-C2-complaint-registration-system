const express = require('express');
const { getUsers, updateProfile } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // Require JWT authentication for profile & users routes

router.get('/', authorize('ADMIN'), getUsers);
router.put('/profile', updateProfile);

module.exports = router;
