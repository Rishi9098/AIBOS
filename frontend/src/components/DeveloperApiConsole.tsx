'use client';

import React, { useState, useEffect } from 'react';
import { Terminal, ChevronUp, ChevronDown, Database, Code, Activity, CheckCircle2 } from 'lucide-react';

export interface ApiLogEntry {
  id: string;
  timestamp: string;
  actionName: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  endpoint: string;
  dbTables: string[];
  backendService: string;
  status: number;
}

// Global listener store for API logging
let listeners: Array<(entry: ApiLogEntry) => void> = [];

export function logApiExecution(entry: Omit<ApiLogEntry, 'id' | 'timestamp'>) {
  const fullEntry: ApiLogEntry = {
    ...entry,
    id: Math.random().toString(36).substring(2, 9),
    timestamp: new Date().toLocaleTimeString(),
  };
  listeners.forEach((l) => l(fullEntry));
}

export default function DeveloperApiConsole() {
  const [logs, setLogs] = useState<ApiLogEntry[]>([
    {
      id: 'init-1',
      timestamp: new Date().toLocaleTimeString(),
      actionName: 'System Readiness Verification',
      method: 'GET',
      endpoint: '/api/v1/ops/metrics',
      dbTables: ['ops_metrics', 'ai_model_registry'],
      backendService: 'app.api.v1.ops',
      status: 200,
    },
  ]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const handler = (entry: ApiLogEntry) => {
      setLogs((prev) => [entry, ...prev.slice(0, 19)]);
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter((l) => l !== handler);
    };
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-lg w-full font-mono text-xs shadow-2xl">
      {/* Header bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-slate-900 border border-slate-700 hover:bg-slate-800 text-sky-400 p-3 rounded-t-2xl flex items-center justify-between shadow-lg"
      >
        <div className="flex items-center gap-2 font-bold">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>AIBOS Live Backend Execution Inspector</span>
          <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/40">
            {logs.length} API Calls
          </span>
        </div>
        {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Panel Content */}
      {isOpen && (
        <div className="bg-slate-950/95 border-x border-b border-slate-800 backdrop-blur-md p-4 rounded-b-2xl max-h-64 overflow-y-auto space-y-3">
          {logs.map((log) => (
            <div key={log.id} className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-sans font-bold">{log.actionName}</span>
                <span className="text-[10px] text-slate-500">{log.timestamp}</span>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    log.method === 'GET'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                      : log.method === 'POST'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  }`}
                >
                  {log.method}
                </span>
                <span className="text-sky-300 font-bold break-all">{log.endpoint}</span>
                <span className="ml-auto text-emerald-400 font-bold">[{log.status}]</span>
              </div>

              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Database className="w-3 h-3 text-amber-400 shrink-0" />
                <span>DB Tables Updated: </span>
                <span className="text-amber-300 font-semibold">{log.dbTables.join(', ')}</span>
              </div>

              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <Code className="w-3 h-3 text-purple-400 shrink-0" />
                <span>Service Module: </span>
                <span className="text-purple-300">{log.backendService}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
