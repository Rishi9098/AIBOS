'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Save,
  Scale,
  Award,
  Sparkles,
  ShieldCheck,
  History,
  Info,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TeacherReviewPage() {
  const [selectedEvalId, setSelectedEvalId] = useState('eval_01');
  const [overrideMarks, setOverrideMarks] = useState<number>(4.5);
  const [comments, setComments] = useState('Candidate derived the formula correctly. Granted partial credit for diode polarities.');
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockEvaluations = [
    {
      id: 'eval_01',
      candidateName: 'Rishi Bindal',
      rollNumber: 'CBSE-2026-90412',
      subject: 'Physics',
      questionText: 'Explain the working principle of a Full Wave Bridge Rectifier circuit. Detail diode conductances during positive and negative half cycles.',
      modelAnswer: 'A Full Wave Bridge Rectifier uses 4 diodes. During positive half cycle D1 and D2 conduct. During negative half cycle D3 and D4 conduct. Output is unidirectional DC.',
      studentAnswer: 'A Full Wave Bridge Rectifier uses four diodes arranged in a bridge. D1 and D2 conduct in positive half cycle. D3 and D4 conduct in negative half cycle. Output is unidirectional DC current.',
      allocatedMarks: 5.0,
      aiMarks: 4.0,
      confidence: 0.72,
      moderationStatus: 'TEACHER_REVIEW_REQUIRED',
      reasoning: 'Matched 3/4 concepts. Missing explicit mention of load resistor current direction.',
      matchedConcepts: ['Bridge topology', 'Positive half cycle conduction', 'Unidirectional output'],
      missingConcepts: ['Load resistor current direction'],
      matchedKeywords: ['diodes', 'D1', 'D2', 'D3', 'D4', 'unidirectional']
    }
  ];

  const currentEval = mockEvaluations[0];

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setStatusMsg(null);

    try {
      // Call backend Teacher Override API
      const res = await api.post('/evaluation/override', {
        evaluation_id: selectedEvalId,
        human_score: overrideMarks,
        reason: comments,
        evaluator_id: 'EVALUATOR-TEACHER-901'
      });

      setStatusMsg(`Teacher Override Submitted Successfully! Updated Score: ${res.final_score || overrideMarks}`);
    } catch (err: any) {
      setError(err.message || 'Failed to submit teacher override to backend.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>Teacher Moderation & Review Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full font-bold">
                  PRODUCTION INTEGRATED
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Inspect AI evaluation evidence, model answers, matched concepts, and submit teacher human overrides.
              </p>
            </div>
          </div>

          <Link
            href="/teacher/dashboard"
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Teacher Dashboard</span>
          </Link>
        </div>

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {/* Evaluation Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="text-xs font-bold text-slate-300 font-mono">Candidate Answer Payload</span>
                <span className="px-2.5 py-0.5 text-[10px] font-mono bg-amber-500/20 text-amber-400 rounded-full font-bold">
                  Confidence: 72%
                </span>
              </div>
              <p className="text-sm font-medium text-slate-200">{currentEval.studentAnswer}</p>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <span className="text-xs font-bold text-teal-400 font-mono">AI Reasoning & Evidence Matrix</span>
              <p className="text-xs text-slate-400">{currentEval.reasoning}</p>
            </div>
          </div>

          {/* Override Form */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleSaveOverride} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
              <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                <Scale className="w-4 h-4" />
                <span>Submit Teacher Override</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Human Override Score (Max: 5.0)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={overrideMarks}
                    onChange={(e) => setOverrideMarks(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-emerald-400 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Mandatory Evaluator Comments</label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-sky-600/20 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving Override to Backend...' : 'Submit Override & Update Grade'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
