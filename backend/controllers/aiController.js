const Ticket = require('../models/Ticket');
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

exports.generateSummary = async (req, res, next) => {
  try {
    const ticket = await Ticket.findOne({
      $or: [{ ticketId: req.params.id }, { _id: req.params.id }]
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: 'Ticket not found' });
    }

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      // Return mock data when no API key
      const mockSummary = {
        summary: `This ${ticket.severity} ticket involves a ${ticket.category} issue affecting ${ticket.affectedService}. The issue was reported via ${ticket.source} and is currently ${ticket.status}. ${ticket.isRecurring ? `This is a recurring issue (seen ${ticket.recurringCount} times).` : ''} ${ticket.isEscalated ? 'The ticket has been escalated due to customer impact.' : ''}`,
        rootCause: `Based on the ticket description and category (${ticket.category}), the probable root cause involves: ${ticket.tags.slice(0, 3).join(', ')}. ${ticket.isRecurring ? 'The recurring nature suggests an underlying systemic issue that previous patches did not fully resolve.' : 'This appears to be an isolated incident.'}`,
        suggestedSteps: [
          `Verify ${ticket.affectedService} logs for error patterns matching reported symptoms`,
          `Check recent deployments to ${ticket.affectedService} (last 72 hours) for correlating changes`,
          `Review ${ticket.category === 'Database Timeout' ? 'database connection pool metrics' : ticket.category === 'API Failure' ? 'API gateway error rates and latency metrics' : 'service health dashboards'} for anomalies`,
          `If issue persists, engage ${ticket.assignedTeam} team lead for escalation path`,
          `Document resolution steps in ticket for future reference${ticket.isRecurring ? ' and update runbook to prevent recurrence' : ''}`
        ]
      };

      ticket.aiSummary = { ...mockSummary, generatedAt: new Date() };
      await ticket.save();
      return res.json({ success: true, data: ticket.aiSummary, source: 'mock' });
    }

    const prompt = `You are a senior support engineering analyst. Analyze this support ticket and provide a concise, technically precise response.

TICKET DETAILS:
- ID: ${ticket.ticketId}
- Title: ${ticket.title}
- Category: ${ticket.category}
- Severity: ${ticket.severity}
- Status: ${ticket.status}
- Affected Service: ${ticket.affectedService}
- Affected Users: ${ticket.affectedUsers}
- Source: ${ticket.source}
- Assigned Team: ${ticket.assignedTeam}
- Is Recurring: ${ticket.isRecurring} (${ticket.recurringCount} occurrences)
- Is Escalated: ${ticket.isEscalated}
- Tags: ${ticket.tags.join(', ')}

DESCRIPTION:
${ticket.description}

RECENT TIMELINE:
${ticket.timeline.slice(-3).map(e => `[${new Date(e.timestamp).toISOString()}] ${e.actor}: ${e.action} - ${e.details}`).join('\n')}

Respond with ONLY a valid JSON object (no markdown, no explanation) with this exact structure:
{
  "summary": "2-3 sentence executive summary of the issue and its impact",
  "rootCause": "Technical root cause analysis based on the description and tags",
  "suggestedSteps": ["step 1", "step 2", "step 3", "step 4", "step 5"]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    const responseText = message.content[0].text.trim();
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse AI response');
      }
    }

    ticket.aiSummary = { ...parsed, generatedAt: new Date() };
    await ticket.save();

    res.json({ success: true, data: ticket.aiSummary, source: 'claude' });
  } catch (err) {
    next(err);
  }
};

exports.getPatternAnalysis = async (req, res, next) => {
  try {
    const tickets = await Ticket.find({
      isRecurring: true,
      createdAt: { $gte: new Date(Date.now() - 30 * 86400000) }
    }).select('title category tags description severity').limit(15);

    if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_anthropic_api_key_here') {
      return res.json({
        success: true,
        data: {
          patterns: [
            { pattern: 'Authentication Service Instability', tickets: ['OAuth2 token refresh', 'LDAP timeout'], frequency: 'Weekly', riskLevel: 'High', recommendation: 'Auth service memory leak investigation needed — consider implementing circuit breaker pattern' },
            { pattern: 'Data Consistency Issues', tickets: ['CSV export mismatch', 'Replication lag', 'Data sync delays'], frequency: 'Bi-weekly', riskLevel: 'Medium', recommendation: 'Read preference standardization across services — all reads should go through single source of truth' },
            { pattern: 'Configuration/IaC Drift', tickets: ['Nginx body size', 'Feature flag misconfiguration', 'Rate limiter cache'], frequency: 'Monthly', riskLevel: 'Medium', recommendation: 'Implement automated IaC drift detection and config validation in CI/CD pipeline' }
          ]
        },
        source: 'mock'
      });
    }

    const prompt = `Analyze these recurring support tickets and identify systemic patterns:

${tickets.map(t => `- ${t.title} [${t.category}] Tags: ${t.tags.join(', ')}`).join('\n')}

Return ONLY valid JSON:
{
  "patterns": [
    {
      "pattern": "pattern name",
      "tickets": ["ticket title excerpts"],
      "frequency": "how often",
      "riskLevel": "High|Medium|Low",
      "recommendation": "actionable recommendation"
    }
  ]
}`;

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    const parsed = JSON.parse(message.content[0].text.trim().replace(/```json|```/g, ''));
    res.json({ success: true, data: parsed, source: 'claude' });
  } catch (err) {
    next(err);
  }
};
