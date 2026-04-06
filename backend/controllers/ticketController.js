const Ticket = require('../models/Ticket');
const { validationResult } = require('express-validator');

// GET /api/tickets
exports.getTickets = async (req, res, next) => {
  try {
    const {
      status, severity, category, assignedTeam, source, isEscalated,
      search, sortBy = 'createdAt', sortOrder = 'desc',
      page = 1, limit = 20,
      dateFrom, dateTo
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;
    if (assignedTeam) filter.assignedTeam = assignedTeam;
    if (source) filter.source = source;
    if (isEscalated !== undefined) filter.isEscalated = isEscalated === 'true';

    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }

    if (search) {
      filter.$text = { $search: search };
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      Ticket.find(filter).sort(sort).skip(skip).limit(parseInt(limit)),
      Ticket.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: tickets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/:id
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const related = await Ticket.find({
      _id: { $ne: ticket._id },
      category: ticket.category,
      status: { $ne: 'Closed' }
    }).limit(5).select('ticketId title severity status createdAt');

    res.json({ success: true, data: ticket, related });
  } catch (err) {
    next(err);
  }
};

// POST /api/tickets
exports.createTicket = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const count = await Ticket.countDocuments();
    const ticketId = `TKT-${String(10000 + count + 1).padStart(5, '0')}`;

    const ticket = new Ticket({
      ...req.body,
      ticketId,
      timeline: [{
        actor: req.body.reportedBy || 'system',
        action: 'Ticket Created',
        details: `Ticket created via ${req.body.source || 'API'}`
      }]
    });

    // Auto-escalate P0 Critical tickets
    if (req.body.severity === 'P0 - Critical') {
      ticket.isEscalated = true;
      ticket.timeline.push({
        actor: 'system',
        action: 'Auto-Escalated',
        details: 'Automatically escalated due to P0 severity'
      });
    }

    await ticket.save();
    res.status(201).json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/tickets/:id
exports.updateTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    const allowedUpdates = ['status', 'severity', 'assignedTeam', 'assignedEngineer', 'isEscalated', 'resolutionNotes', 'tags'];
    const updates = {};

    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Add timeline event
    const timelineEvent = { actor: req.body.updatedBy || 'system', action: 'Updated', details: '' };
    const changedFields = Object.keys(updates);
    
    if (changedFields.includes('status')) {
      timelineEvent.action = `Status changed to ${updates.status}`;
      timelineEvent.details = req.body.notes || '';
      if (updates.status === 'Resolved') {
        updates.resolvedAt = new Date();
      }
      if (updates.status === 'In Progress' && !ticket.firstResponseAt) {
        updates.firstResponseAt = new Date();
      }
    }

    if (changedFields.includes('isEscalated') && updates.isEscalated) {
      timelineEvent.action = 'Escalated';
      timelineEvent.details = req.body.notes || 'Ticket escalated';
    }

    Object.assign(ticket, updates);
    ticket.timeline.push(timelineEvent);
    await ticket.save();

    res.json({ success: true, data: ticket });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/tickets/:id
exports.deleteTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOneAndDelete({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    res.json({ success: true, message: 'Ticket deleted' });
  } catch (err) {
    next(err);
  }
};

// GET /api/tickets/search
exports.searchTickets = async (req, res, next) => {
  try {
    const { q, category, status } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, error: 'Search query must be at least 2 characters' });
    }

    const filter = {};
    if (category) filter.category = category;
    if (status) filter.status = status;

    const results = await Ticket.find({
      ...filter,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { ticketId: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { affectedService: { $regex: q, $options: 'i' } }
      ]
    }).limit(20).select('ticketId title category severity status createdAt affectedService tags');

    res.json({ success: true, data: results, count: results.length });
  } catch (err) {
    next(err);
  }
};
