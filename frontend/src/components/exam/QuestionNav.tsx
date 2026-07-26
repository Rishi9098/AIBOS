'use client';

import React from 'react';
import { CheckCircle2, Bookmark, Eye, AlertCircle, Circle } from 'lucide-react';

interface Question {
  id: string;
  question_order: number;
  allocated_marks: number;
  section_name?: string;
}

interface QuestionNavProps {
  questions: Question[];
  currentIdx: number;
  answers: Record<string, any>;
  reviewFlags: Record<string, boolean>;
  visitedMap: Record<string, boolean>;
  skippedMap: Record<string, boolean>;
  onSelect: (idx: number) => void;
}

export const QuestionNav: React.FC<QuestionNavProps> = ({
  questions,
  currentIdx,
  answers,
  reviewFlags,
  visitedMap,
  skippedMap,
  onSelect,
}) => {
  const answeredCount = Object.keys(answers).filter(k => !!answers[k] && Object.values(answers[k]).some(v => !!v)).length;
  const flaggedCount = Object.keys(reviewFlags).filter(k => !!reviewFlags[k]).length;
  const visitedCount = Object.keys(visitedMap).filter(k => !!visitedMap[k]).length;
  const skippedCount = Object.keys(skippedMap).filter(k => !!skippedMap[k]).length;

  return (
    <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg text-slate-100">Question Palette</h3>
        <span className="text-xs bg-slate-900 border border-slate-800 text-sky-400 px-2.5 py-1 rounded-full font-mono">
          {answeredCount} / {questions.length} Solved
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2.5 max-h-80 overflow-y-auto pr-1">
        {questions.map((q, idx) => {
          const isCurrent = idx === currentIdx;
          const isAnswered = !!answers[q.id] && Object.values(answers[q.id]).some(v => !!v);
          const isFlagged = !!reviewFlags[q.id];
          const isVisited = !!visitedMap[q.id];
          const isSkipped = !!skippedMap[q.id] && !isAnswered;

          let btnStyle = 'bg-slate-950 border-slate-850 text-slate-400 hover:border-slate-700';

          if (isCurrent) {
            btnStyle = 'bg-sky-600 border-sky-400 text-white font-bold ring-2 ring-sky-400/50 shadow-lg shadow-sky-600/30';
          } else if (isFlagged) {
            btnStyle = 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-semibold';
          } else if (isAnswered) {
            btnStyle = 'bg-emerald-500/20 border-emerald-500/60 text-emerald-400 font-semibold';
          } else if (isSkipped) {
            btnStyle = 'bg-rose-500/20 border-rose-500/60 text-rose-400';
          } else if (isVisited) {
            btnStyle = 'bg-slate-800 border-slate-700 text-slate-200';
          }

          return (
            <button
              key={q.id}
              onClick={() => onSelect(idx)}
              className={`relative h-11 rounded-lg border flex flex-col items-center justify-center transition-all ${btnStyle}`}
            >
              <span className="text-sm">{idx + 1}</span>
              <span className="text-[10px] opacity-75 font-mono">{q.allocated_marks}m</span>
              
              {/* Corner Status Indicators */}
              {isAnswered && !isCurrent && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400" />
              )}
              {isFlagged && !isCurrent && (
                <span className="absolute top-1 left-1 w-2 h-2 rounded-full bg-amber-400" />
              )}
              {isSkipped && !isAnswered && !isCurrent && (
                <span className="absolute bottom-1 right-1 w-2 h-2 rounded-full bg-rose-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* 5 State Legend */}
      <div className="pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span>Answered ({answeredCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <span>Flagged ({flaggedCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
          <span>Skipped ({skippedCount})</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
          <span>Visited ({visitedCount})</span>
        </div>
      </div>
    </div>
  );
};
