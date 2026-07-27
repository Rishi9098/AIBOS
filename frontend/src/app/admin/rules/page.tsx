'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SlidersHorizontal, Save, CheckCircle2, AlertCircle, Shield, Clock, Award, Calculator, Camera } from 'lucide-react';

export default function RulesConfiguratorPage() {
  const [boardCode, setBoardCode] = useState('CBSE_CLASS_12');
  const [ruleName, setRuleName] = useState('CBSE Senior Secondary Physics Exam Rules 2026');
  const [duration, setDuration] = useState(180);
  const [totalMarks, setTotalMarks] = useState(100);
  const [passingMarks, setPassingMarks] = useState(33);
  const [negativeMarking, setNegativeMarking] = useState(false);
  const [negativeRatio, setNegativeRatio] = useState(0.25);
  const [calculatorAllowed, setCalculatorAllowed] = useState(false);
  const [sciCalculatorAllowed, setSciCalculatorAllowed] = useState(false);
  const [drawingEnabled, setDrawingEnabled] = useState(true);
  const [equationEditorEnabled, setEquationEditorEnabled] = useState(true);
  const [cameraRequired, setCameraRequired] = useState(true);
  const [micRequired, setMicRequired] = useState(true);
  const [fullscreenMandatory, setFullscreenMandatory] = useState(true);
  const [pwdExtraTime, setPwdExtraTime] = useState(0.33);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
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
            href="/admin"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            ← Back to Admin Console
          </Link>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>Examination Rules updated successfully! Stored in DDL configuration database.</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Basic Identifiers */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span>1. Board & Rule Identification</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Rule Code Identifier</label>
                <input
                  type="text"
                  value={boardCode}
                  onChange={(e) => setBoardCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Rule Profile Title</label>
                <input
                  type="text"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-sans focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Timing & Marks Policy */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>2. Duration & Scoring Policies</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Exam Duration (Minutes)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Passing Marks Criteria</label>
                <input
                  type="number"
                  value={passingMarks}
                  onChange={(e) => setPassingMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-slate-800/60 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <div>
                  <div className="font-semibold text-slate-200">Negative Marking</div>
                  <div className="text-[11px] text-slate-500">Deduct marks for incorrect answers</div>
                </div>
                <input
                  type="checkbox"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 accent-amber-500 cursor-pointer"
                />
              </div>

              {negativeMarking && (
                <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl flex items-center justify-between">
                  <label className="text-slate-400 font-medium">Deduction Ratio</label>
                  <input
                    type="number"
                    step="0.05"
                    value={negativeRatio}
                    onChange={(e) => setNegativeRatio(Number(e.target.value))}
                    className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-400 font-mono"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Allowed Candidate Tools */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              <span>3. Permitted Examination Tools</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <div>
                  <div className="font-semibold text-slate-200">Basic Calculator Tool</div>
                  <div className="text-[11px] text-slate-500">Standard arithmetic calculator in terminal</div>
                </div>
                <input
                  type="checkbox"
                  checked={calculatorAllowed}
                  onChange={(e) => setCalculatorAllowed(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-500 accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3.5 rounded-xl">
                <div>
                  <div className="font-semibold text-slate-200">Vector Drawing Canvas (`Fabric.js`)</div>
                  <div className="text-[11px] text-slate-500">Allow candidates to sketch diagrams</div>
                </div>
                <input
                  type="checkbox"
                  checked={drawingEnabled}
                  onChange={(e) => setDrawingEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-500 accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Security & Lockdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span>4. AI Proctoring & Security Lockdown Policy</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="font-semibold text-slate-200">Webcam Required</span>
                <input
                  type="checkbox"
                  checked={cameraRequired}
                  onChange={(e) => setCameraRequired(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="font-semibold text-slate-200">Microphone Required</span>
                <input
                  type="checkbox"
                  checked={micRequired}
                  onChange={(e) => setMicRequired(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <span className="font-semibold text-slate-200">Fullscreen Mandatory</span>
                <input
                  type="checkbox"
                  checked={fullscreenMandatory}
                  onChange={(e) => setFullscreenMandatory(e.target.checked)}
                  className="w-4 h-4 accent-rose-500 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-2xl text-xs transition shadow-xl shadow-sky-500/20 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save & Deploy Examination Rules Configuration</span>
          </button>
        </form>
      </div>
    </div>
  );
}
