import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Analytics from './pages/Analytics';
import Insights from './pages/Insights';
import SearchPage from './pages/Search';
import { analyticsAPI } from './services/api';

export default function App() {
  const [sidebarStats, setSidebarStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await analyticsAPI.getDashboard({ days: 30 });
        setSidebarStats(res.data.kpis);
      } catch {}
    };
    fetchStats();
    const interval = setInterval(fetchStats, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex min-h-screen bg-surface-950">
      <Sidebar stats={sidebarStats} />
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/tickets/:id" element={<TicketDetail />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/search" element={<SearchPage />} />
        </Routes>
      </main>
    </div>
  );
}
