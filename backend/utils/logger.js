const ActivityLog = require('../models/ActivityLog');

/**
 * Log a user action to the database.
 * @param {string} userId - ID of the user performing the action
 * @param {string} action - Action category (e.g. 'LOGIN', 'COMPLAINT_CREATED')
 * @param {string} details - Detailed descriptive text
 * @param {Object} req - Express request object (optional, for fetching IP)
 */
const logActivity = async (userId, action, details, req = null) => {
  try {
    let ipAddress = 'unknown';
    if (req) {
      ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
    }

    await ActivityLog.create({
      userId: userId || null,
      action,
      details,
      ipAddress,
    });
  } catch (error) {
    console.error('Failed to log activity to database:', error.message);
  }
};

module.exports = { logActivity };
