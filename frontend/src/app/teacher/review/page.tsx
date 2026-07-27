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
  Info
} from 'lucide-react';

export default function TeacherReviewPage() {
  const [selectedEvalId, setSelectedEvalId] = useState('eval_01');
  const [overrideMarks, setOverrideMarks] = useState<number>(4.5);
  const [comments, setComments] = useState('Candidate derived the formula correctly. Granted partial credit for diode polarities.');
  const [isSaved, setIsSaved] = useState(false);

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
    },
    {
      id: 'eval_02',
      candidateName: 'Aarav Gupta',
      rollNumber: 'CBSE-2026-90415',
      subject: 'Mathematics',
      questionText: 'Evaluate the definite integral: \\int_0^{\\pi} \\sin(x) dx',
      modelAnswer: 'Step 1: Anti-derivative is -cos(x). Step 2: [-cos(\\pi) - (-cos(0))] = 1 + 1 = 2.',
      studentAnswer: 'Anti-derivative of sin(x) is -cos(x). Evaluation from 0 to pi gives -cos(pi) + cos(0) = 1 + 1 = 2.',
      allocatedMarks: 5.0,
      aiMarks: 5.0,
      confidence: 0.96,
      moderationStatus: 'RANDOM_AUDIT',
      reasoning: 'Full match on anti-derivative and upper/lower bound substitution.',
      matchedConcepts: ['Anti-derivative calculation', 'Definite integral limits'],
      missingConcepts: [],
      matchedKeywords: ['cos', 'sin', 'integral', '2']
    }
  ];

  const currentEval = mockEvaluations.find((e) => e.id === selectedEvalId) || mockEvaluations[0];

  const handleSaveOverride = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
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
                <span>AIBOS Teacher Review & Moderation Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                  MILESTONE 4
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Inspect AI evaluation results, confidence metrics, extracted evidence, and execute audited mark overrides.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            ← Main Portal
          </Link>
        </div>

        {isSaved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Teacher Override recorded successfully! Audited in immutable evaluation history log.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Moderation Queue List (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Moderation Queue ({mockEvaluations.length} Pending)
            </h3>

            <div className="space-y-3">
              {mockEvaluations.map((item) => {
                const isSelected = item.id === selectedEvalId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setSelectedEvalId(item.id);
                      setOverrideMarks(item.aiMarks);
                    }}
                    className={`w-full text-left p-4 rounded-2xl border transition space-y-2 ${
                      isSelected
                        ? 'bg-sky-500/20 border-sky-400 text-slate-100 ring-2 ring-sky-400/30'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-200">{item.candidateName}</span>
                      <span className="font-mono text-sky-400 text-[11px]">{item.rollNumber}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-medium truncate">
                      {item.subject} • {item.questionText}
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className={`px-2 py-0.5 rounded font-mono font-semibold ${
                        item.moderationStatus === 'TEACHER_REVIEW_REQUIRED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}>
                        {item.moderationStatus}
                      </span>
                      <span className="font-mono font-bold text-slate-300">
                        AI Score: {item.aiMarks}/{item.allocatedMarks}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Evaluation & Evidence Inspection Pane (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
              {/* Candidate & Score Banner */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100">{currentEval.candidateName}</h2>
                  <p className="text-xs text-slate-400 font-mono">
                    Roll No: <span className="text-sky-400">{currentEval.rollNumber}</span> • Subject: <span className="text-slate-300 font-semibold">{currentEval.subject}</span>
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">AI Score</div>
                    <div className="text-base font-bold font-mono text-emerald-400">
                      {currentEval.aiMarks} / {currentEval.allocatedMarks}
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 px-3.5 py-2 rounded-xl text-center">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">Confidence</div>
                    <div className="text-base font-bold font-mono text-amber-400">
                      {Math.round(currentEval.confidence * 100)}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Question & Answers Comparison Grid */}
              <div className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Question Prompt:</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 font-medium">
                    {currentEval.questionText}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Student Answer:</span>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 leading-relaxed font-sans min-h-[100px]">
                      {currentEval.studentAnswer}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Model Answer (Rubric Reference):</span>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sky-300 leading-relaxed font-sans min-h-[100px]">
                      {currentEval.modelAnswer}
                    </div>
                  </div>
                </div>
              </div>

              {/* Extracted Evidence Box */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs">
                <h4 className="font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Extracted Evidence & Concept Breakdown</span>
                </h4>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium w-28">Matched Concepts:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentEval.matchedConcepts.map((c) => (
                        <span key={c} className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-[11px]">
                          ✓ {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {currentEval.missingConcepts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400 font-medium w-28">Missing Concepts:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentEval.missingConcepts.map((c) => (
                          <span key={c} className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-[11px]">
                            ✗ {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="pt-2 border-t border-slate-800/60">
                    <span className="text-slate-400 font-medium">Reasoning Explanation:</span>
                    <p className="text-slate-300 mt-0.5 italic">{currentEval.reasoning}</p>
                  </div>
                </div>
              </div>

              {/* Teacher Override Form */}
              <form onSubmit={handleSaveOverride} className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-200 text-xs uppercase tracking-wider flex items-center gap-2">
                  <Scale className="w-4 h-4 text-sky-400" />
                  <span>Teacher Override & Audit Rationale</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="text-slate-400 font-medium block mb-1">Overridden Final Marks</label>
                    <input
                      type="number"
                      step="0.5"
                      max={currentEval.allocatedMarks}
                      min={0}
                      value={overrideMarks}
                      onChange={(e) => setOverrideMarks(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sky-400 font-mono font-bold focus:outline-none focus:border-sky-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="text-slate-400 font-medium block mb-1">Teacher Rationale / Audit Comments</label>
                    <input
                      type="text"
                      value={comments}
                      onChange={(e) => setComments(e.target.value)}
                      placeholder="Explain justification for override..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-200 focus:outline-none focus:border-sky-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Confirm & Store Audited Teacher Override</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
