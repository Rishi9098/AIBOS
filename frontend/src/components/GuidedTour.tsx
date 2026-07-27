'use client';

import React, { useState } from 'react';
import { Play, ChevronRight, X, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

export interface TourStep {
  targetTitle: string;
  whatIsThisPage: string;
  whatHappensHere: string;
  whatHappensNext: string;
}

export interface GuidedTourProps {
  roleName: 'Candidate Student' | 'Evaluator' | 'Board Admin' | 'Super Admin';
  steps: TourStep[];
}

export default function GuidedTour({ roleName, steps }: GuidedTourProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const currentStep = steps[currentStepIndex];

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
      setIsActive(false);
      setCurrentStepIndex(0);
    }
  };

  if (!isActive) {
    return (
      <button
        onClick={() => setIsActive(true)}
        className="px-4 py-2 bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 flex items-center gap-2 transition"
      >
        <Play className="w-3.5 h-3.5 fill-white" />
        <span>Start Guided Tour ({roleName})</span>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-sky-500/40 rounded-3xl max-w-xl w-full p-6 space-y-6 shadow-2xl animate-in fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>Guided Tour: {roleName}</span>
                <span className="px-2 py-0.5 text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full font-bold">
                  STEP {currentStepIndex + 1} / {steps.length}
                </span>
              </h3>
              <p className="text-xs text-sky-400 font-mono mt-0.5">{currentStep.targetTitle}</p>
            </div>
          </div>

          <button
            onClick={() => setIsActive(false)}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-xs font-mono">
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-sky-400 font-bold flex items-center gap-1.5 font-sans">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>1. What is this page?</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">{currentStep.whatIsThisPage}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-teal-400 font-bold flex items-center gap-1.5 font-sans">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>2. What happens here?</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">{currentStep.whatHappensHere}</p>
          </div>

          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
            <div className="text-amber-400 font-bold flex items-center gap-1.5 font-sans">
              <ChevronRight className="w-3.5 h-3.5" />
              <span>3. What happens after this?</span>
            </div>
            <p className="text-slate-300 font-sans leading-relaxed">{currentStep.whatHappensNext}</p>
          </div>
        </div>

        {/* Footer Navigation Controls */}
        <div className="flex items-center justify-between border-t border-slate-800 pt-4">
          <span className="text-xs text-slate-500 font-mono">
            {currentStepIndex + 1} of {steps.length} Steps Completed
          </span>

          <div className="flex items-center gap-2">
            {currentStepIndex > 0 && (
              <button
                onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Previous Step
              </button>
            )}

            <button
              onClick={handleNext}
              className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-sky-500/20 transition flex items-center gap-1.5"
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish Guided Tour' : 'Next Step'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
