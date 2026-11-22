import React, { useState } from 'react';
import { 
  Eye, 
  Layers, 
  CheckCircle, 
  XCircle, 
  Sliders, 
  RefreshCw, 
  ShieldCheck,
  AlertTriangle
} from 'lucide-react';

export default function VisualRegressionView() {
  const [tolerance, setTolerance] = useState(0.05);
  const [activeTab, setActiveTab] = useState('diff'); // baseline, current, diff
  const [approved, setApproved] = useState(false);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-wide flex items-center gap-2">
            <Eye className="w-5 h-5 text-emerald-400" />
            Pixelmatch Anti-Aliased Visual Regression Canvas
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated viewport screenshot comparison across CI builds with dynamic element masking.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setApproved(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-md transition flex items-center gap-1.5"
          >
            <CheckCircle className="w-3.5 h-3.5" />
            {approved ? 'Baseline Approved' : 'Approve Visual Baseline'}
          </button>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('baseline')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
              activeTab === 'baseline' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Baseline (Main Branch)
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
              activeTab === 'current' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Current (PR #249)
          </button>
          <button
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition ${
              activeTab === 'diff' ? 'bg-emerald-600 text-white font-semibold' : 'text-slate-400 hover:text-white'
            }`}
          >
            Pixel Diff Overlay (0.02% Shift)
          </button>
        </div>

        <div className="flex items-center space-x-4 text-xs">
          <div className="flex items-center space-x-2">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-300 font-mono">Pixel Tolerance:</span>
            <input
              type="range"
              min="0.01"
              max="0.20"
              step="0.01"
              value={tolerance}
              onChange={(e) => setTolerance(parseFloat(e.target.value))}
              className="w-24 accent-emerald-500 cursor-pointer"
            />
            <span className="font-mono text-emerald-400">{(tolerance * 100).toFixed(0)}%</span>
          </div>

          <div className="text-slate-500">|</div>

          <span className="font-mono text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Masking: 3 Dynamic Timestamps Masked
          </span>
        </div>
      </div>

      {/* Visual Canvas Mock Preview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 border-b border-slate-800 pb-3">
          <span>Viewport: 1440x900 • Target: /checkout/payment</span>
          <span>Difference: 142 Pixels (0.02%) • Status: PASS</span>
        </div>

        {/* Visual Simulated Mock Screen */}
        <div className="relative bg-slate-950 rounded-xl border border-slate-800 p-8 min-h-[380px] flex flex-col justify-between overflow-hidden">
          {/* Top Bar inside app */}
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-mono text-slate-400 pl-4">https://app.store.internal/checkout</span>
            </div>
            <div className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
              [MASKED REGION]
            </div>
          </div>

          {/* Checkout UI Mock */}
          <div className="grid grid-cols-2 gap-8 my-6">
            <div className="space-y-4">
              <div className="text-sm font-bold text-white">Payment Method & Shipping</div>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 space-y-2">
                <div className="h-3 w-40 bg-slate-800 rounded"></div>
                <div className="h-3 w-64 bg-slate-800 rounded"></div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold text-white">Order Summary ($142.50)</div>
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-800 space-y-3">
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span>
                  <span>$135.00</span>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Shipping</span>
                  <span>$7.50</span>
                </div>

                {/* The highlighted button where class mutated */}
                <div className="relative pt-2">
                  {activeTab === 'diff' && (
                    <div className="absolute -inset-1 bg-red-500/20 border-2 border-dashed border-red-500 rounded-lg animate-pulse pointer-events-none"></div>
                  )}
                  <button className="w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold shadow">
                    Complete Purchase ($142.50)
                  </button>
                  {activeTab === 'diff' && (
                    <div className="mt-1 text-[10px] font-mono text-red-400 text-center font-bold">
                      ▲ 1px padding shift detected via pixelmatch
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/80 pt-3">
            <span>Pixelmatch Diff Engine: OK</span>
            <span>Threshold Gate: &lt; 0.05% PASS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
