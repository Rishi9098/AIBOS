'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Save, CheckCircle2, AlertCircle, Shield, Clock, Award, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';

export default function RulesConfiguratorPage() {
  const [boardCode, setBoardCode] = useState('CBSE-GOVT-2027-LIVE');
  const [ruleName, setRuleName] = useState('CBSE Senior Secondary Physics Exam Rules 2026');
  const [duration, setDuration] = useState(180);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(33);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeRatio, setNegativeRatio] = useState(0.25);
  
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setStatusMsg(null);

    try {
      // Post rules to backend rules endpoint
      const res = await api.post('/rules-blueprints/rules', {
        board_code: boardCode,
        rule_name: ruleName,
        duration_minutes: duration,
        total_marks: totalMarks,
        passing_percentage: passingMarks,
        negative_marking_enabled: negativeMarking,
        negative_marking_ratio: negativeRatio,
        allow_scientific_calculator: false
      });

      setStatusMsg(`Exam Rules Saved Successfully! Rule ID: ${res.id || 'RULE-2027'}`);
    } catch (err: any) {
      setError(err.message || 'Failed to save examination rules to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <SlidersHorizontal className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Board Exam Rules Configurator</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Configure evaluation, timing, scoring, accessibility, and security policies for any education board.
              </p>
            </div>
          </div>

          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMsg && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2 font-mono">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <form onSubmit={handleSave} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Board Code</label>
              <input
                type="text"
                value={boardCode}
                onChange={(e) => setBoardCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sky-400 font-mono"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Rule Policy Name</label>
              <input
                type="text"
                value={ruleName}
                onChange={(e) => setRuleName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 font-semibold"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Exam Duration (Mins)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-emerald-400 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Total Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sky-400 font-mono font-bold"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Passing %</label>
              <input
                type="number"
                value={passingMarks}
                onChange={(e) => setPassingMarks(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-amber-400 font-mono font-bold"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{isSubmitting ? 'Persisting Exam Rules...' : 'Save & Enforce Exam Rules Policy'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
