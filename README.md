# SupportOps Assistant

A full-stack support operations dashboard for tracking tickets, escalations, and recurring issues.

---

## Overview

SupportOps Assistant helps support and operations teams manage issues end to end:
- Create and update tickets
- Prioritize by severity and status
- Track escalations and recurring failures
- Analyze trends through dashboard and insights views
- Search historical incidents quickly

---

## Features

### Ticket Management
- Create, read, update, and delete tickets
- Filter and sort by severity, status, category, source, and team
- Timeline tracking for ticket status changes
- Linked/related ticket support

### Analytics
- Daily ticket volume (created, resolved, escalated)
- Severity breakdown
- Category distribution
- Team workload and resolution rates
- 7/30/90 day filters

### Insights
- Recurring issue detection
- Escalation rate by category
- Slowest resolution tracking
- Recent category trend snapshots

### Search
- Full-text search across ticket title/description/service/tags
- Category and status filters

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB, Mongoose |
| Charts | Recharts |
| Routing | React Router v6 |
| HTTP Client | Axios |

---

## Project Structure

```text
supportops-assistant/
├── api/
│   └── [...path].js
├── backend/
│   ├── app.js
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── seed/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── utils/
│   └── vite.config.js
├── package.json
└── vercel.json
```

---

## API Overview

### Tickets

| Method | Endpoint |
|---|---|
| GET | `/api/tickets` |
| GET | `/api/tickets/:id` |
| POST | `/api/tickets` |
| PATCH | `/api/tickets/:id` |
| DELETE | `/api/tickets/:id` |
| GET | `/api/tickets/search?q=` |

### Analytics

| Method | Endpoint |
|---|---|
| GET | `/api/analytics/dashboard?days=30` |
| GET | `/api/analytics/insights` |

## Environment Variables

Backend (`backend/.env`):

```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017/supportops
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

---

## Scripts

Root:

```bash
npm run dev:backend
npm run dev:frontend
npm run seed
npm run build
```

Backend:

```bash
npm run dev
npm run seed
```

Frontend:

```bash
npm run dev
npm run build
```

---

## Seed Data

The seed script inserts sample tickets across common support categories (auth, API, data sync, performance, billing, and integration issues) so dashboard charts and analytics are populated.

---

## Author

Arpan Narula  
GitHub: https://github.com/ArpanNarula
