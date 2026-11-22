import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import HealingDashboard from './pages/HealingDashboard';
import VisualRegressionView from './pages/VisualRegressionView';
import { fetchStats } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('healing');
  const [stats, setStats] = useState({
    totalTests: 148,
    passedFirstAttempt: 139,
    healedAutomatically: 8,
    failedUnresolved: 1,
    flakinessRatePct: 0.67,
    avgExecutionTimeMs: 685,
    ciPassRatePct: 99.3
  });

  const refreshStats = () => {
    fetchStats().then(data => {
      if (data) setStats(data);
    });
  };

  useEffect(() => {
    refreshStats();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar stats={stats} />
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {activeTab === 'healing' && (
            <HealingDashboard onTestUpdated={refreshStats} />
          )}
          {activeTab === 'visual' && (
            <VisualRegressionView />
          )}
        </main>
      </div>
    </div>
  );
}
