'use client';

import React from 'react';
import { CheckCircle2, Bookmark, Circle } from 'lucide-react';

interface Question {
  id: string;
  question_order: number;
  allocated_marks: number;
}

interface QuestionNavProps {
  questions: Question[];
  currentIdx: number;
  answers: Record<string, any>;
  reviewFlags: Record<string, boolean>;
  onSelect: (idx: number) => void;
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
  questions,
  currentIdx,
  answers,
  reviewFlags,
  onSelect,
}) => {
  const answeredCount = Object.keys(answers).filter(k => !!answers[k]).length;

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
      <h3 className="font-semibold text-lg text-slate-100 flex items-center justify-between">
        <span>Question Palette</span>
        <span className="text-xs bg-slate-800 text-sky-400 px-2.5 py-1 rounded-full border border-sky-500/30">
          {answeredCount} / {questions.length} Solved
        </span>
      </h3>

      <div className="grid grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIdx;
          const isAnswered = !!answers[q.id];
          const isMarkedReview = !!reviewFlags[q.id];

          let btnBg = 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700';
          if (isCurrent) {
            btnBg = 'bg-sky-600 border-sky-400 text-white font-bold ring-2 ring-sky-400/50';
          } else if (isMarkedReview) {
            btnBg = 'bg-amber-500/20 border-amber-500/50 text-amber-400';
          } else if (isAnswered) {
            btnBg = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelect(idx)}
              className={`relative h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${btnBg}`}
            >
              <span className="text-sm">{idx + 1}</span>
              <span className="text-[10px] opacity-75">{q.allocated_marks}m</span>
              {isAnswered && !isCurrent && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
              )}
              {isMarkedReview && !isCurrent && (
                <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
            </button>
          );
        })}
      </div>

      <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-2 text-xs text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Answered</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Review</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-700" />
          <span>Pending</span>
        </div>
      </div>
    </div>
  );
};
