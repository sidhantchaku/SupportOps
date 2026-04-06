const Ticket = require('../models/Ticket');

exports.getDashboardStats = async (req, res, next) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 86400000);

    const [
      totalOpen, totalEscalated, totalCritical,
      recentTickets, statusBreakdown, severityBreakdown,
      categoryBreakdown, teamBreakdown, dailyVolume,
      avgResponseTime, recurringIssues
    ] = await Promise.all([
      Ticket.countDocuments({ status: { $in: ['Open', 'In Progress', 'Escalated'] } }),
      Ticket.countDocuments({ isEscalated: true, status: { $nin: ['Resolved', 'Closed'] } }),
      Ticket.countDocuments({ severity: 'P0 - Critical', status: { $nin: ['Resolved', 'Closed'] } }),
      
      Ticket.countDocuments({ createdAt: { $gte: since } }),

      Ticket.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      Ticket.aggregate([
        { $group: { _id: '$severity', count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),

      Ticket.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ]),

      Ticket.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: { _id: '$assignedTeam', count: { $sum: 1 }, resolved: { $sum: { $cond: [{ $eq: ['$status', 'Resolved'] }, 1, 0] } } } },
        { $sort: { count: -1 } }
      ]),

      Ticket.aggregate([
        { $match: { createdAt: { $gte: since } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $in: ['$status', ['Resolved', 'Closed']] }, 1, 0] } },
          escalated: { $sum: { $cond: ['$isEscalated', 1, 0] } }
        }},
        { $sort: { _id: 1 } }
      ]),

      Ticket.aggregate([
        { $match: { firstResponseAt: { $exists: true }, createdAt: { $gte: since } } },
        { $project: {
          responseTimeMinutes: {
            $divide: [{ $subtract: ['$firstResponseAt', '$createdAt'] }, 60000]
          },
          severity: 1
        }},
        { $group: {
          _id: '$severity',
          avgMinutes: { $avg: '$responseTimeMinutes' },
          count: { $sum: 1 }
        }}
      ]),

      Ticket.find({ isRecurring: true, status: { $nin: ['Resolved', 'Closed'] } })
        .sort({ recurringCount: -1 })
        .limit(5)
        .select('ticketId title category recurringCount severity')
    ]);

    const resolvedInPeriod = await Ticket.aggregate([
      { $match: { resolvedAt: { $gte: since } } },
      { $project: {
        resolutionHours: {
          $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000]
        }
      }},
      { $group: {
        _id: null,
        avgHours: { $avg: '$resolutionHours' },
        count: { $sum: 1 }
      }}
    ]);

    res.json({
      success: true,
      data: {
        kpis: {
          totalOpen,
          totalEscalated,
          totalCritical,
          recentTickets,
          avgResolutionHours: resolvedInPeriod[0]?.avgHours ? Math.round(resolvedInPeriod[0].avgHours * 10) / 10 : null,
          resolvedInPeriod: resolvedInPeriod[0]?.count || 0
        },
        statusBreakdown,
        severityBreakdown,
        categoryBreakdown,
        teamBreakdown,
        dailyVolume,
        avgResponseTime,
        recurringIssues
      }
    });
  } catch (err) {
    next(err);
  }
};

exports.getInsights = async (req, res, next) => {
  try {
    const [
      topRecurring,
      escalationRate,
      categoryTrends,
      slowestResolution
    ] = await Promise.all([
      Ticket.find({ isRecurring: true })
        .sort({ recurringCount: -1 })
        .limit(10)
        .select('ticketId title category recurringCount severity status affectedService'),

      Ticket.aggregate([
        { $group: {
          _id: '$category',
          total: { $sum: 1 },
          escalated: { $sum: { $cond: ['$isEscalated', 1, 0] } }
        }},
        { $project: {
          category: '$_id',
          total: 1,
          escalated: 1,
          escalationRate: { $multiply: [{ $divide: ['$escalated', '$total'] }, 100] }
        }},
        { $sort: { escalationRate: -1 } },
        { $limit: 8 }
      ]),

      Ticket.aggregate([
        { $match: { createdAt: { $gte: new Date(Date.now() - 7 * 86400000) } } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),

      Ticket.aggregate([
        { $match: { resolvedAt: { $exists: true } } },
        { $project: {
          resolutionHours: { $divide: [{ $subtract: ['$resolvedAt', '$createdAt'] }, 3600000] },
          category: 1,
          severity: 1,
          ticketId: 1,
          title: 1
        }},
        { $sort: { resolutionHours: -1 } },
        { $limit: 5 }
      ])
    ]);

    res.json({
      success: true,
      data: {
        topRecurring,
        escalationRate,
        categoryTrends,
        slowestResolution
      }
    });
  } catch (err) {
    next(err);
  }
};
