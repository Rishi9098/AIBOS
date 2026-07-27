'use client';

import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Database, Code, ArrowRight, ShieldAlert, UserCheck } from 'lucide-react';

export interface HelpPanelProps {
  pageTitle: string;
  purpose: string;
  userRole: string;
  apisExecuted: string[];
  dbTablesUpdated: string[];
  nextStep: string;
  consequenceIfSkipped: string;
}

export default function PageHelpPanel({
  pageTitle,
  purpose,
  userRole,
  apisExecuted,
  dbTablesUpdated,
  nextStep,
  consequenceIfSkipped,
}: HelpPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-slate-900/90 border border-sky-500/30 rounded-3xl p-6 shadow-xl space-y-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Educational Guide: {pageTitle}</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full font-bold">
                PAGE AUDIT INFO
              </span>
            </h3>
            <p className="text-xs text-slate-400">Click to expand/collapse architectural breakdown for government auditors.</p>
          </div>
        </div>
        {isOpen ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
      </button>

      {isOpen && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-2 border-t border-slate-800">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sky-400 font-bold flex items-center gap-1.5 font-sans text-xs">
                <HelpCircle className="w-3.5 h-3.5" />
                <span>1. Purpose & Overview</span>
              </div>
              <p className="text-slate-300 font-sans leading-relaxed text-xs">{purpose}</p>
            </div>

            <div className="space-y-1">
              <div className="text-teal-400 font-bold flex items-center gap-1.5 font-sans text-xs">
                <UserCheck className="w-3.5 h-3.5" />
                <span>2. Primary User Role</span>
              </div>
              <p className="text-slate-200 font-semibold">{userRole}</p>
            </div>

            <div className="space-y-1">
              <div className="text-purple-400 font-bold flex items-center gap-1.5 font-sans text-xs">
                <Code className="w-3.5 h-3.5" />
                <span>3. Backend REST APIs Executed</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-0.5">
                {apisExecuted.map((api, idx) => (
                  <li key={idx} className="text-purple-300">{api}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-amber-400 font-bold flex items-center gap-1.5 font-sans text-xs">
                <Database className="w-3.5 h-3.5" />
                <span>4. Database Tables Updated</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {dbTablesUpdated.map((tbl, idx) => (
                  <span key={idx} className="px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 text-[11px]">
                    {tbl}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-emerald-400 font-bold flex items-center gap-1.5 font-sans text-xs">
                <ArrowRight className="w-3.5 h-3.5" />
                <span>5. Next Workflow Step</span>
              </div>
              <p className="text-slate-200 font-sans text-xs">{nextStep}</p>
            </div>

            <div className="space-y-1">
              <div className="text-rose-400 font-bold flex items-center gap-1.5 font-sans text-xs">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>6. Consequence If Skipped</span>
              </div>
              <p className="text-rose-300 font-sans leading-relaxed text-xs">{consequenceIfSkipped}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
