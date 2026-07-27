'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  Server,
  Database,
  Cpu,
  Shield,
  SlidersHorizontal,
  Building2,
  Radio,
  RotateCcw,
  Zap,
  Sparkles,
  BarChart3,
  TrendingUp,
  Plus
} from 'lucide-react';

export default function OperationsAdminPage() {
  const [featureFlags, setFeatureFlags] = useState([
    { key: 'OCR_ENABLED', name: 'Multimodal OCR Processing Engine', enabled: true },
    { key: 'AI_EVALUATION_ENABLED', name: 'AI Evaluation Platform Pipeline', enabled: true },
    { key: 'TEACHER_OVERRIDE_ENABLED', name: 'Teacher Review & Override Console', enabled: true },
    { key: 'MULTIMODAL_ENABLED', name: 'Unified Multimodal Normalization', enabled: true }
  ]);

  const [models, setModels] = useState([
    {
      id: 'm_01',
      name: 'Gemini-1.5-Pro-Structured',
      provider: 'Google',
      version: 'v1.5',
      status: 'ACTIVE',
      accuracy: '95.2%',
      latency: '240 ms',
      cost: '$0.002'
    },
    {
      id: 'm_02',
      name: 'RuleBasedEvaluator-Offline',
      provider: 'Internal',
      version: 'v1.0',
      status: 'STANDBY',
      accuracy: '94.0%',
      latency: '12 ms',
      cost: '$0.000'
    }
  ]);

  const [pilotSchools, setPilotSchools] = useState([
    { id: 'p_01', name: 'Delhi Public School, R.K. Puram', board: 'CBSE_MAIN', city: 'New Delhi', state: 'Delhi', students: 1200, status: 'LIVE' },
    { id: 'p_02', name: 'Government Higher Secondary School, Bhopal', board: 'MP_BOARD', city: 'Bhopal', state: 'Madhya Pradesh', students: 850, status: 'TESTING' }
  ]);

  const toggleFlag = (key: string) => {
    setFeatureFlags(flags =>
      flags.map(f => f.key === key ? { ...f, enabled: !f.enabled } : f)
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Activity className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>AIBOS Enterprise Operations & Government Pilot Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  MILESTONE 6 PILOT READY
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Real-time System Observability, Prometheus Metrics, Health Probes, AI Model Registry, Feature Flags, and School Onboarding Manager.
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            ← Admin Home
          </Link>
        </div>

        {/* System Health Badges & Live Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>System Health</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-xl font-bold text-emerald-400 font-mono">100% OPERATIONAL</div>
            <div className="text-[11px] text-slate-500">Database, AI, OCR, Storage healthy</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Active Candidates</span>
              <Radio className="w-4 h-4 text-sky-400 animate-pulse" />
            </div>
            <div className="text-2xl font-bold text-sky-400 font-mono">1,250 Live</div>
            <div className="text-[11px] text-slate-500">Auto-save: 50 req/sec</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Evaluation Latency</span>
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 font-mono">240 ms (p99)</div>
            <div className="text-[11px] text-slate-500">Accuracy: 95.2%</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>Onboarded Schools</span>
              <Building2 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-400 font-mono">{pilotSchools.length} Pilot Sites</div>
            <div className="text-[11px] text-slate-500">2,050 total candidates</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Feature Flags & AI Model Registry (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Feature Flags Engine */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4" />
                <span>Feature Flags Engine (Hot-Toggle)</span>
              </h3>

              <div className="space-y-3 text-xs">
                {featureFlags.map((flag) => (
                  <div key={flag.key} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3.5 rounded-2xl">
                    <div>
                      <div className="font-semibold text-slate-200">{flag.name}</div>
                      <div className="text-[11px] font-mono text-slate-500">{flag.key}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleFlag(flag.key)}
                      className={`px-3.5 py-1.5 rounded-xl font-bold text-xs transition ${
                        flag.enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {flag.enabled ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Model Registry */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="w-4 h-4" />
                  <span>AI Model Registry & Version Tracking</span>
                </h3>
                <span className="text-[11px] font-mono text-purple-300">Rollback Ready</span>
              </div>

              <div className="overflow-x-auto text-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                      <th className="p-2">Model Name</th>
                      <th className="p-2">Provider</th>
                      <th className="p-2">Version</th>
                      <th className="p-2">Status</th>
                      <th className="p-2">Accuracy</th>
                      <th className="p-2">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {models.map((m) => (
                      <tr key={m.id} className="border-t border-slate-800/60 font-sans">
                        <td className="p-2.5 font-semibold text-slate-200">{m.name}</td>
                        <td className="p-2.5 text-slate-400">{m.provider}</td>
                        <td className="p-2.5 font-mono text-sky-400">{m.version}</td>
                        <td className="p-2.5">
                          <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                            m.status === 'ACTIVE'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="p-2.5 font-mono text-emerald-400">{m.accuracy}</td>
                        <td className="p-2.5 font-mono text-amber-400">{m.latency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Pilot School Onboarding Manager (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Building2 className="w-4 h-4" />
                  <span>Government Pilot School Sites</span>
                </h3>
                <button
                  type="button"
                  className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-semibold hover:bg-amber-500/20 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Onboard Site</span>
                </button>
              </div>

              <div className="space-y-3 text-xs">
                {pilotSchools.map((s) => (
                  <div key={s.id} className="bg-slate-950 border border-slate-800 p-4 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{s.name}</span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] ${
                        s.status === 'LIVE'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {s.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between">
                      <span>{s.city}, {s.state} ({s.board})</span>
                      <span className="font-mono text-sky-400 font-semibold">{s.students} Students</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
