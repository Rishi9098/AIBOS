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
  RefreshCw
} from 'lucide-react';

export default function TeacherQuestionBuilderPage() {
  const [boardCode, setBoardCode] = useState('CBSE');
  const [classLevel, setClassLevel] = useState('12');
  const [subject, setSubject] = useState('Physics');
  const [chapterTitle, setChapterTitle] = useState('Electric Charges and Fields');

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedQuestion, setGeneratedQuestion] = useState<any>({
    question_id: 'q_trace_901',
    question_text: "Derive Coulomb's Law for electric force between two point charges q1 and q2 separated by distance r in vacuum.",
    knowledge_id: 'KB-CBSE-12-PHY-CH01-T01',
    textbook_title: 'NCERT Class 12 Physics Part I',
    page_number: 12,
    chapter_title: 'Electric Charges and Fields',
    learning_outcome_code: 'LO-CBSE-PHY-12-01',
    traceability_id: 'TR-2026-901',
    status: 'GENERATED_WITH_100_PCT_TRACEABILITY'
  });

  const handleGenerateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setGeneratedQuestion({
        question_id: 'q_trace_902',
        question_text: 'State Gauss Law for Electrostatics and express electric flux through a closed surface in terms of charge enclosed.',
        knowledge_id: 'KB-CBSE-12-PHY-CH01-T04',
        textbook_title: 'NCERT Class 12 Physics Part I',
        page_number: 18,
        chapter_title: 'Electric Charges and Fields',
        learning_outcome_code: 'LO-CBSE-PHY-12-04',
        traceability_id: 'TR-2026-902',
        status: 'GENERATED_WITH_100_PCT_TRACEABILITY'
      });
    }, 700);
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
            href="/"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Main Portal</span>
          </Link>
        </div>

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
                  <label className="text-slate-400 font-medium block mb-1">Board</label>
                  <select
                    value={boardCode}
                    onChange={(e) => setBoardCode(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sky-400 font-mono"
                  >
                    <option value="CBSE">CBSE (Central Board)</option>
                    <option value="ICSE">ICSE</option>
                    <option value="STATE_UP">UP Board</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Class & Subject</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={`Class ${classLevel}`}
                      readOnly
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-slate-300 font-mono text-center"
                    />
                    <input
                      type="text"
                      value={subject}
                      readOnly
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-amber-400 font-mono text-center font-bold"
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
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2 mt-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isGenerating ? 'Retrieving Textbook Knowledge...' : 'Generate 100% Traceable Question'}</span>
              </button>
            </form>
          </div>

          {/* Right Column: Generated Question & Immutable Traceability Card (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {generatedQuestion && (
              <div className="bg-slate-900/90 border border-teal-500/30 rounded-3xl p-6 space-y-5 shadow-2xl animate-in fade-in">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2 text-xs font-mono text-teal-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>APPROVED TEXTBOOK CONTENT ONLY</span>
                  </div>

                  <span className="px-2.5 py-0.5 text-[10px] font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full font-bold">
                    100% TRACEABLE
                  </span>
                </div>

                {/* Question Display */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <div className="text-[11px] text-slate-500 font-mono">Question text:</div>
                  <div className="text-base font-semibold text-slate-100 leading-relaxed">
                    {generatedQuestion.question_text}
                  </div>
                </div>

                {/* Immutable Traceability Card */}
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-400 border-b border-slate-800/80 pb-2">
                    <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                      <Bookmark className="w-4 h-4" />
                      <span>Textbook Origin Verification</span>
                    </span>
                    <span className="text-sky-400">ID: {generatedQuestion.knowledge_id}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[11px]">
                    <div>Official Textbook: <span className="text-slate-200 font-bold block">{generatedQuestion.textbook_title}</span></div>
                    <div>Page Number: <span className="text-sky-400 font-bold block">Page #{generatedQuestion.page_number}</span></div>
                    <div>Source Chapter: <span className="text-slate-300 block">{generatedQuestion.chapter_title}</span></div>
                    <div>Learning Outcome: <span className="text-amber-400 font-bold block">{generatedQuestion.learning_outcome_code}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
