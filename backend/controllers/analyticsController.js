const User = require('../models/User');
const Complaint = require('../models/Complaint');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get system-wide analytics (Admin only)
// @route   GET /api/analytics
// @access  Private (Admin only)
exports.getAdminAnalytics = async (req, res, next) => {
  try {
    // Basic counts
    const totalUsers = await User.countDocuments({ role: 'USER' });
    const totalAgents = await User.countDocuments({ role: 'AGENT' });
    const totalComplaints = await Complaint.countDocuments({});
    
    // Status breakdowns
    const pendingComplaints = await Complaint.countDocuments({ status: 'PENDING' });
    const assignedComplaints = await Complaint.countDocuments({ status: 'ASSIGNED' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'IN_PROGRESS' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'RESOLVED' });
    const rejectedComplaints = await Complaint.countDocuments({ status: 'REJECTED' });

    // Category breakdown aggregation
    const categoryBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          value: '$count',
          _id: 0,
        },
      },
    ]);

    // Priority breakdown aggregation
    const priorityBreakdown = await Complaint.aggregate([
      {
        $group: {
          _id: '$priority',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          name: '$_id',
          value: '$count',
          _id: 0,
        },
      },
    ]);

    // Monthly trend aggregation (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1); // Set to start of month
    
    const monthlyTrend = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1,
        },
      },
    ]);

    // Formatting monthly trend for charts (e.g. "Jan 2026")
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const formattedMonthlyTrend = monthlyTrend.map(item => {
      const label = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      return {
        month: label,
        complaints: item.count,
      };
    });

    // Recent activity logs (last 10 events)
    const recentLogs = await ActivityLog.find({})
      .populate('userId', 'name email role')
      .sort({ timestamp: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalUsers,
          totalAgents,
          totalComplaints,
          pendingComplaints,
          assignedComplaints,
          inProgressComplaints,
          resolvedComplaints,
          rejectedComplaints,
        },
        charts: {
          categoryBreakdown,
          priorityBreakdown,
          monthlyTrend: formattedMonthlyTrend,
        },
        recentLogs,
      },
    });
  } catch (error) {
    next(error);
  }
};
