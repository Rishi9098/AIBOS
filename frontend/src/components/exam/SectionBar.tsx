'use client';

import React from 'react';
import { Layers, Clock, Lock, CheckCircle2 } from 'lucide-react';

export interface ExamSectionItem {
  id: string;
  section_name: string;
  allocated_marks: number;
  total_questions: number;
  time_limit_minutes?: number;
  is_optional?: boolean;
  is_locked?: boolean;
}

interface SectionBarProps {
  sections: ExamSectionItem[];
  activeSectionId: string;
  onSelectSection: (sectionId: string) => void;
}

export const SectionBar: React.FC<SectionBarProps> = ({
  sections,
  activeSectionId,
  onSelectSection,
}) => {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-lg flex items-center justify-between gap-3 overflow-x-auto">
      <div className="flex items-center gap-2">
        <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
          <Layers className="w-4 h-4" />
        </div>
        <span className="text-xs font-bold text-slate-300 hidden sm:inline uppercase tracking-wider">
          Sections:
        </span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto flex-1">
        {sections.map((sec) => {
          const isActive = sec.id === activeSectionId;
          return (
            <button
              key={sec.id}
              type="button"
              disabled={sec.is_locked}
              onClick={() => onSelectSection(sec.id)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-medium transition flex items-center gap-2 whitespace-nowrap ${
                sec.is_locked
                  ? 'bg-slate-950 border-slate-850 text-slate-600 cursor-not-allowed'
                  : isActive
                  ? 'bg-sky-500/20 border-sky-400 text-sky-300 font-bold ring-2 ring-sky-400/30'
                  : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
              }`}
            >
              <span>{sec.section_name}</span>
              <span className="text-[10px] font-mono opacity-70 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                {sec.allocated_marks}m
              </span>

              {sec.is_locked && <Lock className="w-3 h-3 text-slate-600" />}
              {sec.is_optional && (
                <span className="text-[9px] bg-amber-500/20 text-amber-400 px-1 rounded font-mono">
                  OPTIONAL
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
