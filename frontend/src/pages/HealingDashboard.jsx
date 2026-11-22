import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  Wrench, 
  AlertTriangle, 
  Play, 
  GitPullRequest, 
  Code, 
  Clock, 
  RefreshCw, 
  Plus, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { fetchTestRuns, triggerHealingSimulation, applyPatch } from '../services/api';

export default function HealingDashboard({ onTestUpdated }) {
  const [runs, setRuns] = useState([]);
  const [selectedPatch, setSelectedPatch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testCaseName, setTestCaseName] = useState('Submit Billing Invoice');
  const [brokenSelector, setBrokenSelector] = useState('button#btn-invoice-submit-v1');
  const [targetElement, setTargetElement] = useState('Primary Invoice Button');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadRuns();
  }, []);

  const loadRuns = async () => {
    const data = await fetchTestRuns();
    setRuns(data);
  };

  const handleTrigger = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await triggerHealingSimulation({ testCaseName, brokenSelector, targetElement });
      setIsModalOpen(false);
      await loadRuns();
      setNotification({
        type: 'success',
        text: `Selector healed with ${(res.similarityScore * 100).toFixed(1)}% AST DOM confidence!`
      });
      if (onTestUpdated) onTestUpdated();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleApply = async (testId) => {
    await applyPatch(testId);
    setNotification({
      type: 'success',
      text: `Git patch for ${testId} committed to pull request branch!`
    });
    await loadRuns();
    setTimeout(() => setNotification(null), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Alert */}
      {notification && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/40 rounded-xl flex items-center justify-between text-xs text-emerald-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Self-Healed Tests</span>
            <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><Wrench className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            {runs.length} <span className="text-sm font-normal text-slate-400">Healed</span>
          </div>
          <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
            <span>● 0 CI Pipeline Failures</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Mean Similarity Score</span>
            <span className="p-2 bg-blue-500/10 text-blue-400 rounded-lg"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            94.2%
          </div>
          <div className="text-[11px] text-slate-400 mt-1">DOM Tree & ARIA Cosine Match</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Flakiness Reduction</span>
            <span className="p-2 bg-purple-500/10 text-purple-400 rounded-lg"><CheckCircle className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            91.4%
          </div>
          <div className="text-[11px] text-purple-400 mt-1">Quarantined False Alarms</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Avg Execution Time</span>
            <span className="p-2 bg-amber-500/10 text-amber-400 rounded-lg"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl font-bold text-white mt-2 font-mono">
            685 <span className="text-sm font-normal text-slate-400">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">Playwright Headless Chrome</div>
        </div>
      </div>

      {/* Main Healed Runs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-400" />
              Autonomous Self-Healing Test Runs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              When UI selectors break due to dynamic classes or DOM changes, AST semantic similarity recovers the element instantly.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={loadRuns}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
              title="Refresh Test Runs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Simulate Broken Locator
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-slate-400 uppercase font-mono border-b border-slate-800 text-[11px]">
              <tr>
                <th className="py-3 px-4">Test Case & ID</th>
                <th className="py-3 px-4">Broken Reason</th>
                <th className="py-3 px-4">Original vs Healed Locator</th>
                <th className="py-3 px-4">DOM Match</th>
                <th className="py-3 px-4">Status & CI</th>
                <th className="py-3 px-4 text-right">Git Patch</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {runs.map((run) => (
                <tr key={run.testId} className="hover:bg-slate-800/40 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-white flex items-center gap-2">
                      {run.testCaseName}
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {run.testId}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      Suite: {run.suite} • {run.executionTimeMs}ms
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-300">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                      {run.brokenReason}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 space-y-1 font-mono text-[11px]">
                    <div className="text-red-400/90 line-through truncate max-w-xs">
                      {run.originalSelector}
                    </div>
                    <div className="text-emerald-400 font-semibold flex items-center gap-1 truncate max-w-xs">
                      <ArrowRight className="w-3 h-3 shrink-0" />
                      {run.healedSelector}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="h-full rounded-full bg-emerald-500"
                          style={{ width: `${run.similarityScore * 100}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] text-emerald-400 font-bold">
                        {(run.similarityScore * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle className="w-2.5 h-2.5" />
                        {run.status}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500">
                        {run.ciRunId}
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => setSelectedPatch(run.gitPatch)}
                        className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs transition flex items-center gap-1 font-mono"
                      >
                        <Code className="w-3 h-3 text-emerald-400" />
                        <span>Diff</span>
                      </button>
                      <button
                        onClick={() => handleApply(run.testId)}
                        className="px-2.5 py-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded text-xs transition flex items-center gap-1 font-mono"
                      >
                        <GitPullRequest className="w-3 h-3" />
                        <span>PR</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Git Patch Modal */}
      {selectedPatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Suggested Git Patch (PR Automated Fix)</h3>
                  <p className="text-xs text-slate-400">Permanent locator replacement patch</p>
                </div>
              </div>
              <button onClick={() => setSelectedPatch(null)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed select-all">
                {selectedPatch}
              </pre>
              <button
                onClick={() => setSelectedPatch(null)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trigger Broken Locator Simulation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Simulate Broken Element Locator</h3>
                  <p className="text-xs text-slate-400">Trigger Playwright AST DOM recovery</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>

            <form onSubmit={handleTrigger} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Test Case Name</label>
                <input
                  type="text"
                  value={testCaseName}
                  onChange={(e) => setTestCaseName(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Simulated Broken CSS/XPath Selector</label>
                <input
                  type="text"
                  value={brokenSelector}
                  onChange={(e) => setBrokenSelector(e.target.value)}
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-red-400 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Element Role</label>
                <input
                  type="text"
                  value={targetElement}
                  onChange={(e) => setTargetElement(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-800/40 rounded-xl border border-slate-700/60 text-[11px] text-slate-400">
                The engine will evaluate the simulated DOM tree, match ARIA landmarks, and synthesize a resilient <span className="text-emerald-400 font-mono font-semibold">data-testid</span> selector.
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Wrench className="w-4 h-4" />
                  {loading ? 'Analyzing DOM Tree & Healing...' : 'Execute Self-Healing Pass'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
