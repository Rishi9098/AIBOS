'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Save,
  Scale,
  Sparkles,
  ShieldCheck,
  Send,
  Building2,
  Users
} from 'lucide-react';

export default function AdminResultsPage() {
  const [examId, setExamId] = useState('ex_cbse_12_2026');
  const [graceMarks, setGraceMarks] = useState<number>(3.0);
  const [moderationReason, setModerationReason] = useState('Board approval for physics out-of-syllabus grace marks adjustment.');
  const [isProcessed, setIsProcessed] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const handleProcessResults = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessed(true);
    setTimeout(() => setIsProcessed(false), 3500);
  };

  const handlePublishBoardWide = () => {
    setIsPublished(true);
    setTimeout(() => setIsPublished(false), 3500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>Board Result Processing & Certification Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  MILESTONE 7
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Process subject marks, apply grace marks moderation, generate signed digital certificates, and publish board-wide results.
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            ← Back to Admin Console
          </Link>
        </div>

        {isProcessed && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Result Processing & CGPA Calculation completed for 1,250 candidates! Grace marks applied with audit history.</span>
          </div>
        )}

        {isPublished && (
          <div className="bg-sky-500/10 border border-sky-500/30 text-sky-400 p-4 rounded-2xl text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Results & Digital Marksheets Published Board-Wide! SMS & Email notification queues triggered.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Result Moderation & Processing Form (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleProcessResults} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <span>1. Result Moderation & Grace Marks Engine</span>
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Target Examination Code</label>
                  <input
                    type="text"
                    value={examId}
                    onChange={(e) => setExamId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sky-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Grace Marks Allocation (Max 5.0)</label>
                  <input
                    type="number"
                    step="0.5"
                    max={5.0}
                    min={0.0}
                    value={graceMarks}
                    onChange={(e) => setGraceMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Board Moderation Rationale</label>
                  <input
                    type="text"
                    value={moderationReason}
                    onChange={(e) => setModerationReason(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>Run Result Processing & Compute Merit Ranks</span>
              </button>
            </form>
          </div>

          {/* Right Column: Publication & Certificate Issuance (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl">
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Send className="w-4 h-4" />
                <span>2. Board Result Publication & Issuance</span>
              </h3>

              <p className="text-xs text-slate-400 leading-relaxed">
                Release finalized marks, CGPAs, digital marksheets, and pass certificates board-wide with digital signatures and QR verification URLs.
              </p>

              <button
                type="button"
                onClick={handlePublishBoardWide}
                className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Publish Board-Wide Results & Issue Digital Certificates</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
