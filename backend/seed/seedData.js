require('dotenv').config();
const mongoose = require('mongoose');
const Ticket = require('../models/Ticket');

const connectDB = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/supportops');
  console.log('MongoDB connected for seeding');
};

const engineers = ['alex.chen@supportops.io', 'priya.sharma@supportops.io', 'marcus.lee@supportops.io', 'sarah.kim@supportops.io', 'dev.patel@supportops.io'];
const reporters = ['customer_api_monitor', 'alice@acmecorp.com', 'bob@techventures.io', 'carol@startupxyz.com', 'david@enterprise.net', 'eva@globalretail.com', 'frank@fintech.io', 'grace@cloudplatform.com', 'henry@saascompany.com', 'irene@marketplace.io'];

function randomFrom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function daysAgo(n) { return new Date(Date.now() - n * 86400000); }
function hoursAgo(n) { return new Date(Date.now() - n * 3600000); }

const ticketTemplates = [
  {
    title: 'OAuth2 token refresh endpoint returning 500 intermittently',
    description: 'Users are reporting that after ~1 hour sessions expire, the token refresh call to /auth/v2/token/refresh returns HTTP 500 with no body. This is affecting approximately 2000 active sessions. Error appears correlated with high memory usage on auth-service pods. Restart temporarily resolves but recurs every 4-6 hours.',
    category: 'Authentication / Login',
    severity: 'P0 - Critical',
    assignedTeam: 'Auth',
    affectedService: 'auth-service v2.4.1',
    affectedUsers: 2000,
    tags: ['oauth2', 'token-refresh', 'auth-service', 'memory-leak'],
    isRecurring: true,
    recurringCount: 7,
    source: 'PagerDuty'
  },
  {
    title: 'Stripe webhook events not processed - payment status stuck in pending',
    description: 'Since 14:30 UTC, Stripe webhook events for payment.succeeded and payment.failed are not being acknowledged. The webhook processor queue has 4,200+ unprocessed events. Orders placed in this window show "Payment Pending" in customer portal despite successful charges. Revenue impact: ~$180K in unconfirmed transactions.',
    category: 'Payment Processing',
    severity: 'P0 - Critical',
    assignedTeam: 'Payments',
    affectedService: 'payment-webhook-processor',
    affectedUsers: 4200,
    tags: ['stripe', 'webhook', 'payment-stuck', 'queue-overflow'],
    isRecurring: false,
    source: 'API Monitor'
  },
  {
    title: 'Analytics dashboard showing incorrect metrics for date range filters',
    description: 'The date range filter on the main analytics dashboard is off by one day when timezone is set to UTC-5 or earlier. Users in US timezones see yesterday\'s data when selecting "Today". The aggregation query appears to use server UTC time without converting to user locale. Confirmed on Firefox and Chrome.',
    category: 'Dashboard / UI Bug',
    severity: 'P2 - Medium',
    assignedTeam: 'Frontend',
    affectedService: 'analytics-dashboard v3.1',
    affectedUsers: 850,
    tags: ['timezone', 'date-filter', 'analytics', 'off-by-one'],
    isRecurring: true,
    recurringCount: 3,
    source: 'Customer Portal'
  },
  {
    title: 'Data pipeline sync delayed by 6+ hours for enterprise tier accounts',
    description: 'Enterprise accounts with >100K records are experiencing data sync delays exceeding 6 hours. The ETL job that runs every 15 minutes appears to be timing out at the transformation stage. Smaller accounts (Standard tier) are unaffected. Root cause suspected in the new N+1 query introduced in data-pipeline v4.2.0 deployed 3 days ago.',
    category: 'Data Sync Delay',
    severity: 'P1 - High',
    assignedTeam: 'Data Pipeline',
    affectedService: 'etl-pipeline v4.2.0',
    affectedUsers: 45,
    tags: ['etl', 'n+1-query', 'enterprise', 'sync-delay', 'timeout'],
    isRecurring: false,
    source: 'Internal Alert'
  },
  {
    title: 'REST API rate limiter incorrectly throttling authenticated enterprise clients',
    description: 'Multiple enterprise customers report HTTP 429 responses despite being within their contracted limits. Investigation shows the rate limiter is applying the free-tier limit (100 req/min) to some enterprise accounts. Issue appears to be a cache invalidation bug where the tier lookup is serving stale data after plan upgrades.',
    category: 'Rate Limiting',
    severity: 'P1 - High',
    assignedTeam: 'Platform',
    affectedService: 'api-gateway v1.8.3',
    affectedUsers: 12,
    tags: ['rate-limit', 'api-gateway', 'cache-bug', 'enterprise'],
    isRecurring: true,
    recurringCount: 5,
    source: 'Email'
  },
  {
    title: 'User login failures spiking - LDAP integration returning connection timeout',
    description: 'SSO-enabled accounts (primarily Fortune 500 customers) are unable to log in. LDAP connection pool is exhausted. Logs show: "LDAPConnectionTimeoutError: connect ETIMEDOUT 10.0.1.45:389". This affects 3 enterprise customers using Active Directory integration. Break-glass local auth still works.',
    category: 'Authentication / Login',
    severity: 'P1 - High',
    assignedTeam: 'Auth',
    affectedService: 'ldap-connector v2.1',
    affectedUsers: 320,
    tags: ['sso', 'ldap', 'active-directory', 'connection-pool'],
    isRecurring: false,
    source: 'Slack'
  },
  {
    title: 'Invoice generation producing incorrect line items after subscription upgrade',
    description: 'Customers who upgraded from Pro to Enterprise in the last billing cycle are receiving invoices with duplicate line items. The proration calculation appears to be double-counting the per-seat charge. Affected customers: 23. Finance team has flagged potential compliance risk. Manual corrections have been applied but root cause not resolved.',
    category: 'Billing Discrepancy',
    severity: 'P1 - High',
    assignedTeam: 'Payments',
    affectedService: 'billing-service v2.9.1',
    affectedUsers: 23,
    tags: ['invoice', 'proration', 'subscription-upgrade', 'billing-bug'],
    isRecurring: false,
    source: 'Email'
  },
  {
    title: 'API response time degraded >2000ms on /v2/reports/generate endpoint',
    description: 'The report generation endpoint latency has increased from p95: 450ms to p95: 2800ms over the last 48 hours. No code changes deployed in this window. DB query analysis shows a missing index on the reports collection after the schema migration last Tuesday. EXPLAIN output attached. MongoDB collections affected: reports, report_metadata.',
    category: 'Performance Degradation',
    severity: 'P1 - High',
    assignedTeam: 'Platform',
    affectedService: 'reporting-api v3.0',
    affectedUsers: 0,
    tags: ['latency', 'missing-index', 'mongodb', 'reports-api'],
    isRecurring: false,
    source: 'API Monitor'
  },
  {
    title: 'Email notifications for weekly digest not delivered since Tuesday',
    description: 'The weekly digest emails scheduled for Tuesday 9AM UTC were not sent to approximately 18,000 subscribers. SendGrid delivery logs show zero attempts - the job was enqueued but appears to have been dropped from the message queue. Redis queue shows 0 items but expected 18K. Potential Redis eviction event.',
    category: 'Notification Failure',
    severity: 'P2 - Medium',
    assignedTeam: 'Platform',
    affectedService: 'notification-service v1.4',
    affectedUsers: 18000,
    tags: ['email', 'sendgrid', 'redis', 'queue-eviction', 'digest'],
    isRecurring: true,
    recurringCount: 2,
    source: 'Internal Alert'
  },
  {
    title: 'Salesforce CRM integration sync creating duplicate contact records',
    description: 'The bidirectional Salesforce sync introduced in the v5.0 release is creating duplicate Contact records when the same user is updated within a 30-second window. The deduplication logic appears to have a race condition. Salesforce orgs of 3 enterprise customers now have 15-25% duplicate contamination.',
    category: 'Integration Error',
    severity: 'P1 - High',
    assignedTeam: 'Platform',
    affectedService: 'crm-sync-service v5.0',
    affectedUsers: 0,
    tags: ['salesforce', 'deduplication', 'race-condition', 'crm-sync'],
    isRecurring: false,
    source: 'Email'
  },
  {
    title: 'Real-time dashboard charts not updating - WebSocket connection drops after 60s',
    description: 'The live dashboard charts stop receiving updates after exactly 60 seconds. Browser DevTools show WebSocket connection closing with code 1001 (going away). The issue appeared after upgrading nginx proxy to 1.24. Load balancer keepalive timeout is likely misconfigured. Both Firefox and Chrome affected on all tested networks.',
    category: 'Dashboard / UI Bug',
    severity: 'P2 - Medium',
    assignedTeam: 'DevOps',
    affectedService: 'websocket-gateway v2.2',
    affectedUsers: 1200,
    tags: ['websocket', 'nginx', 'keepalive', 'dashboard', 'realtime'],
    isRecurring: false,
    source: 'Customer Portal'
  },
  {
    title: 'New user onboarding flow - signup confirmation email not received',
    description: '15-20% of new user registrations are not receiving the confirmation email. Signup completes successfully, account is created, but email verification link never arrives. Primarily affects Gmail and Outlook addresses. Hotmail addresses appear unaffected. SPF/DKIM records verified correct. Potential IP reputation issue with MX provider.',
    category: 'Onboarding Issue',
    severity: 'P2 - Medium',
    assignedTeam: 'Platform',
    affectedService: 'user-registration-service',
    affectedUsers: 340,
    tags: ['onboarding', 'email-verification', 'deliverability', 'spf-dkim'],
    isRecurring: true,
    recurringCount: 4,
    source: 'Customer Portal'
  },
  {
    title: 'CSV export data mismatches API response for same query parameters',
    description: 'Customers are reporting that the CSV export from the UI produces different row counts and values compared to querying the same data via REST API. Difference is approximately 3-5% of records. Suspected: the export uses a different DB replica with eventual consistency lag, while the API reads from primary. Both endpoints should use the same read preference.',
    category: 'Data Mismatch',
    severity: 'P2 - Medium',
    assignedTeam: 'Data Pipeline',
    affectedService: 'export-service v2.1',
    affectedUsers: 89,
    tags: ['csv-export', 'data-consistency', 'replica-lag', 'read-preference'],
    isRecurring: true,
    recurringCount: 6,
    source: 'Customer Portal'
  },
  {
    title: 'Security: Possible unauthorized API access detected from anomalous IP range',
    description: 'SIEM alert triggered: 3,400 API requests in 5 minutes from IP block 185.234.x.x (flagged as Tor exit nodes). Requests are using valid API keys belonging to customer acc_847291. All requests are read-only (GET /v2/users and GET /v2/transactions). Customer notified. API keys rotated. Forensic investigation ongoing.',
    category: 'Security Alert',
    severity: 'P0 - Critical',
    assignedTeam: 'Security',
    affectedService: 'api-gateway v1.8.3',
    affectedUsers: 1,
    tags: ['security', 'tor', 'api-abuse', 'key-rotation', 'siem'],
    isRecurring: false,
    isEscalated: true,
    source: 'API Monitor'
  },
  {
    title: 'Database connection pool exhausted during peak traffic window',
    description: 'Every weekday between 9-10AM UTC, the primary Postgres connection pool (max: 200) reaches exhaustion. Queries begin queueing and eventually timeout after 30s. Application logs: "too many connections" from pg driver. Analysis: 40+ background job workers each hold 5 idle connections. Connection pooling (PgBouncer) not yet deployed.',
    category: 'Database Timeout',
    severity: 'P1 - High',
    assignedTeam: 'DevOps',
    affectedService: 'postgres-primary',
    affectedUsers: 0,
    tags: ['postgres', 'connection-pool', 'pgbouncer', 'background-jobs'],
    isRecurring: true,
    recurringCount: 12,
    source: 'Internal Alert'
  },
  {
    title: 'GraphQL API returning partial data for nested relationship queries',
    description: 'Complex GraphQL queries with 3+ levels of nested relationships are silently returning null for leaf nodes when the depth exceeds the resolver batch size. Error is not surfaced to the client. N+1 loader issue introduced in graphql-core 3.2.1 upgrade. DataLoader batching appears disabled for the affected resolvers.',
    category: 'API Failure',
    severity: 'P2 - Medium',
    assignedTeam: 'Platform',
    affectedService: 'graphql-gateway v1.3',
    affectedUsers: 230,
    tags: ['graphql', 'dataloader', 'n+1', 'nested-queries', 'null-response'],
    isRecurring: false,
    source: 'API Monitor'
  },
  {
    title: 'Multi-region data replication lag causing stale reads in EU datacenter',
    description: 'EU region customers reading data that was written in US-East are seeing 8-15 second stale reads. Normal replication lag is <500ms. AWS DMS task shows replication queue depth growing. Network analysis shows EU-to-US bandwidth contention between 10AM-2PM UTC. Temporary fix: route EU critical reads to US-East primary.',
    category: 'Data Sync Delay',
    severity: 'P1 - High',
    assignedTeam: 'Data Pipeline',
    affectedService: 'aws-dms-replication',
    affectedUsers: 1500,
    tags: ['multi-region', 'replication-lag', 'aws-dms', 'eu-datacenter'],
    isRecurring: false,
    source: 'Internal Alert'
  },
  {
    title: 'Misconfigured feature flag causing new checkout flow to A/B test in production',
    description: '8% of production traffic was accidentally routed to the incomplete v2 checkout flow due to a feature flag misconfiguration in LaunchDarkly. The new flow lacks address validation and crashed on international addresses. Estimated 200 failed checkout attempts before flag corrected. Flag rollout was intended for staging only.',
    category: 'Configuration Error',
    severity: 'P1 - High',
    assignedTeam: 'Frontend',
    affectedService: 'checkout-service v2-beta',
    affectedUsers: 200,
    tags: ['feature-flag', 'launchdarkly', 'checkout', 'misconfiguration'],
    isRecurring: false,
    source: 'PagerDuty'
  },
  {
    title: 'Mobile SDK push notifications failing on iOS 17.2+ devices',
    description: 'Since Apple released iOS 17.2, push notifications via the mobile SDK are silently failing. The APNs provider API is returning "BadDeviceToken" errors for ~35% of iOS token registrations. Analysis: iOS 17.2 rotates push tokens on app reinstall and background-refresh changes invalidate existing tokens faster. SDK needs to re-register on every app launch.',
    category: 'Notification Failure',
    severity: 'P2 - Medium',
    assignedTeam: 'Platform',
    affectedService: 'mobile-sdk v4.1',
    affectedUsers: 8900,
    tags: ['ios', 'push-notification', 'apns', 'token-rotation', 'mobile'],
    isRecurring: false,
    source: 'Customer Portal'
  },
  {
    title: 'Bulk import API failing with 413 for files above 2MB despite 50MB limit',
    description: 'The bulk CSV import endpoint advertises 50MB file size limit in documentation, but nginx proxy is rejecting payloads above 2MB with 413 Request Entity Too Large. The application-level limit is correctly set but nginx client_max_body_size was not updated when the limit was raised 3 months ago. Infrastructure as code drift issue.',
    category: 'Configuration Error',
    severity: 'P2 - Medium',
    assignedTeam: 'DevOps',
    affectedService: 'bulk-import-api',
    affectedUsers: 67,
    tags: ['nginx', 'file-upload', '413-error', 'client-max-body-size', 'iac-drift'],
    isRecurring: false,
    source: 'Email'
  }
];

const statuses = ['Open', 'In Progress', 'Pending Review', 'Escalated', 'Resolved', 'Closed'];
const statusWeights = [0.20, 0.25, 0.10, 0.10, 0.20, 0.15];

function pickWeighted(items, weights) {
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    sum += weights[i];
    if (r <= sum) return items[i];
  }
  return items[items.length - 1];
}

function generateTicketId(index) {
  return `TKT-${String(10000 + index).padStart(5, '0')}`;
}

async function seed() {
  await connectDB();
  await Ticket.deleteMany({});
  console.log('Cleared existing tickets');

  const tickets = [];
  let idCounter = 1;

  // Generate 80 realistic tickets spread over 90 days
  for (let i = 0; i < 80; i++) {
    const template = ticketTemplates[i % ticketTemplates.length];
    const daysBack = randomInt(0, 90);
    const createdAt = daysAgo(daysBack);
    const status = pickWeighted(statuses, statusWeights);
    
    const isResolved = status === 'Resolved' || status === 'Closed';
    const resolvedAt = isResolved ? new Date(createdAt.getTime() + randomInt(1, 72) * 3600000) : null;
    const firstResponseAt = new Date(createdAt.getTime() + randomInt(5, 240) * 60000);
    const isEscalated = status === 'Escalated' || template.isEscalated || (template.severity === 'P0 - Critical' && Math.random() > 0.4);
    
    const timeline = [
      { timestamp: createdAt, actor: template.reportedBy || randomFrom(reporters), action: 'Ticket Created', details: `Ticket submitted via ${template.source}` },
      { timestamp: firstResponseAt, actor: randomFrom(engineers), action: 'First Response', details: 'Initial investigation started. Acknowledged and triaged.' }
    ];

    if (status === 'In Progress' || status === 'Pending Review' || isResolved) {
      timeline.push({ timestamp: new Date(firstResponseAt.getTime() + randomInt(30, 120) * 60000), actor: randomFrom(engineers), action: 'Status Updated', details: `Moved to ${status}` });
    }
    if (isEscalated) {
      timeline.push({ timestamp: new Date(firstResponseAt.getTime() + randomInt(60, 180) * 60000), actor: randomFrom(engineers), action: 'Escalated', details: 'Escalated to senior engineering team due to customer impact' });
    }
    if (isResolved && resolvedAt) {
      timeline.push({ timestamp: resolvedAt, actor: randomFrom(engineers), action: 'Resolved', details: 'Issue resolved and verified in production' });
    }

    const slight_variation = i > ticketTemplates.length - 1;
    
    tickets.push({
      ticketId: generateTicketId(idCounter++),
      title: slight_variation ? template.title + (Math.random() > 0.7 ? ' [FOLLOW-UP]' : '') : template.title,
      description: template.description,
      category: template.category,
      severity: template.severity,
      status,
      source: template.source,
      assignedTeam: template.assignedTeam,
      assignedEngineer: status !== 'Open' ? randomFrom(engineers) : null,
      reportedBy: randomFrom(reporters),
      affectedService: template.affectedService,
      affectedUsers: template.affectedUsers + randomInt(-50, 100),
      environment: 'Production',
      tags: template.tags,
      isEscalated,
      isRecurring: template.isRecurring || false,
      recurringCount: template.recurringCount || 1,
      linkedTickets: [],
      firstResponseAt,
      resolvedAt,
      resolutionNotes: isResolved ? `Issue identified and patched. Monitoring for 24 hours. Root cause: ${template.tags.slice(0, 2).join(', ')}.` : null,
      timeline,
      createdAt,
      updatedAt: resolvedAt || firstResponseAt
    });
  }

  await Ticket.insertMany(tickets);
  console.log(`✓ Seeded ${tickets.length} tickets`);
  
  const summary = {
    total: tickets.length,
    byStatus: {},
    bySeverity: {},
    byCategory: {}
  };
  
  tickets.forEach(t => {
    summary.byStatus[t.status] = (summary.byStatus[t.status] || 0) + 1;
    summary.bySeverity[t.severity] = (summary.bySeverity[t.severity] || 0) + 1;
    summary.byCategory[t.category] = (summary.byCategory[t.category] || 0) + 1;
  });
  
  console.log('\n📊 Seed Summary:');
  console.log('By Status:', summary.byStatus);
  console.log('By Severity:', summary.bySeverity);
  console.log('\n✅ Database seeded successfully');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
