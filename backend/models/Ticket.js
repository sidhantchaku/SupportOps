const mongoose = require('mongoose');

const TimelineEventSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  actor: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String }
}, { _id: false });

const TicketSchema = new mongoose.Schema({
  ticketId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  category: {
    type: String,
    required: true,
    enum: [
      'API Failure',
      'Authentication / Login',
      'Payment Processing',
      'Data Sync Delay',
      'Dashboard / UI Bug',
      'Data Mismatch',
      'Performance Degradation',
      'Notification Failure',
      'Onboarding Issue',
      'Integration Error',
      'Rate Limiting',
      'Configuration Error',
      'Database Timeout',
      'Security Alert',
      'Billing Discrepancy'
    ]
  },
  severity: {
    type: String,
    required: true,
    enum: ['P0 - Critical', 'P1 - High', 'P2 - Medium', 'P3 - Low'],
    default: 'P2 - Medium'
  },
  status: {
    type: String,
    required: true,
    enum: ['Open', 'In Progress', 'Pending Review', 'Escalated', 'Resolved', 'Closed'],
    default: 'Open'
  },
  source: {
    type: String,
    enum: ['Email', 'Slack', 'API Monitor', 'Customer Portal', 'Internal Alert', 'PagerDuty', 'Zendesk'],
    default: 'Customer Portal'
  },
  assignedTeam: {
    type: String,
    enum: ['Platform', 'Payments', 'Auth', 'Data Pipeline', 'Frontend', 'Security', 'DevOps', 'Unassigned'],
    default: 'Unassigned'
  },
  assignedEngineer: {
    type: String,
    default: null
  },
  reportedBy: {
    type: String,
    required: true
  },
  affectedService: {
    type: String
  },
  affectedUsers: {
    type: Number,
    default: 0
  },
  environment: {
    type: String,
    enum: ['Production', 'Staging', 'Development'],
    default: 'Production'
  },
  tags: [{ type: String }],
  isEscalated: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringCount: {
    type: Number,
    default: 1
  },
  linkedTickets: [{ type: String }],
  firstResponseAt: { type: Date },
  resolvedAt: { type: Date },
  resolutionNotes: { type: String },
  timeline: [TimelineEventSchema],
  aiSummary: {
    summary: String,
    rootCause: String,
    suggestedSteps: [String],
    generatedAt: Date
  }
}, {
  timestamps: true
});

TicketSchema.index({ status: 1, severity: 1 });
TicketSchema.index({ category: 1 });
TicketSchema.index({ createdAt: -1 });
TicketSchema.index({ ticketId: 1 });
TicketSchema.index({ title: 'text', description: 'text', tags: 'text' });

TicketSchema.virtual('responseTimeMinutes').get(function() {
  if (this.firstResponseAt && this.createdAt) {
    return Math.round((this.firstResponseAt - this.createdAt) / 60000);
  }
  return null;
});

TicketSchema.virtual('resolutionTimeHours').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.round((this.resolvedAt - this.createdAt) / 3600000 * 10) / 10;
  }
  return null;
});

TicketSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Ticket', TicketSchema);
