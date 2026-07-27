'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileCheck,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Bookmark,
  ShieldCheck,
  Award,
  Layers,
  ArrowLeft,
  RefreshCw,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function TeacherQuestionBuilderPage() {
  const [boardCode, setBoardCode] = useState('CBSE-GOVT-2027-LIVE');
  const [classLevel, setClassLevel] = useState('12');
  const [subject, setSubject] = useState('Physics');
  const [chapterTitle, setChapterTitle] = useState('Electric Charges and Fields');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>(null);
  const [traceabilityCard, setTraceabilityCard] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);

    try {
      // 1. Call backend API for traceable question generation
      const res = await api.post('/curriculum/questions/generate', {
        board_code: boardCode,
        class_level: classLevel,
        subject: subject,
        chapter_title: chapterTitle
      });

      setGeneratedQuestion(res);

      // 2. Fetch immutable traceability card payload
      if (res.question_id) {
        const trace = await api.get(`/curriculum/questions/traceability/${res.question_id}`);
        setTraceabilityCard(trace);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate question paper from textbook knowledge.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>Teacher Question Paper Builder</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full">
                  100% TEXTBOOK TRACEABLE
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Generate official board exam questions strictly bound to approved NCERT textbooks—Zero external LLM hallucination.
              </p>
            </div>
          </div>

          <Link
            href="/teacher/dashboard"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Question Generation Controls (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleGenerateQuestion} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>Textbook Curriculum Parameters</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Board Code</label>
                  <input
                    type="text"
                    value={boardCode}
                    onChange={(e) => setBoardCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sky-400 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Class & Subject</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={classLevel}
                      onChange={(e) => setClassLevel(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-300 font-mono text-center"
                      required
                    />
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-400 font-mono text-center font-bold"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Target Chapter</label>
                  <input
                    type="text"
                    value={chapterTitle}
                    onChange={(e) => setChapterTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Querying Backend Knowledge Engine...' : 'Generate 100% Traceable Question'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Generated Question & Immutable Traceability Card (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {generatedQuestion ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="text-sm font-bold text-slate-100">Traceable Question Generated</span>
                  </div>
                  <span className="px-2.5 py-0.5 text-[11px] font-mono bg-teal-500/20 text-teal-400 rounded-full font-bold">
                    {generatedQuestion.status}
                  </span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-xs text-slate-400 font-mono">Question Text:</div>
                  <p className="text-sm font-semibold text-slate-100">{generatedQuestion.question_text}</p>
                </div>

                {/* Traceability Payload */}
                <div className="bg-slate-950 p-5 rounded-2xl border border-teal-500/30 space-y-3 font-mono text-xs">
                  <div className="text-teal-400 font-bold flex items-center gap-2 border-b border-slate-800 pb-2">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Immutable Textbook Reference Card</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-slate-300">
                    <div>Knowledge ID: <span className="text-sky-400 font-bold">{generatedQuestion.knowledge_id}</span></div>
                    <div>Page Reference: <span className="text-amber-400 font-bold">Page #{generatedQuestion.page_number}</span></div>
                    <div>Textbook: <span className="text-slate-200">{generatedQuestion.textbook_title}</span></div>
                    <div>Learning Outcome: <span className="text-emerald-400 font-bold">{generatedQuestion.learning_outcome_code}</span></div>
                  </div>

                  {traceabilityCard && (
                    <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 space-y-1">
                      <div>Prompt Version: <span className="text-sky-400">{traceabilityCard.prompt_version}</span></div>
                      <div>Model: <span className="text-slate-200">{traceabilityCard.model_name}</span></div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
                <Bookmark className="w-8 h-8 text-slate-700 mx-auto" />
                <p className="text-sm text-slate-400">Click "Generate 100% Traceable Question" to invoke the backend Curriculum Generator API.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
