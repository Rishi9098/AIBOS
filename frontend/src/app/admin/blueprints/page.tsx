'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { FileSpreadsheet, CheckCircle2, AlertCircle, Save, Layers, Sparkles, Scale, RefreshCw } from 'lucide-react';

export default function BlueprintsPage() {
  const [code, setCode] = useState('CBSE-12-PHY-2026-BP');
  const [title, setTitle] = useState('Class 12 Senior Secondary Physics Examination Blueprint');
  const [subject, setSubject] = useState('Physics');
  const [classLevel, setClassLevel] = useState('12');
  const [totalMarks, setTotalMarks] = useState(100);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [status, setStatus] = useState('APPROVED');

  // Distributions
  const [easyRatio, setEasyRatio] = useState(0.3);
  const [medRatio, setMedRatio] = useState(0.5);
  const [hardRatio, setHardRatio] = useState(0.2);

  const [validationResult, setValidationResult] = useState<any | null>(null);

  const runValidation = () => {
    const totalDiff = Number((easyRatio + medRatio + hardRatio).toFixed(2));
    const isValid = Math.abs(totalDiff - 1.0) <= 0.05 && totalMarks > 0 && totalQuestions > 0;
    const errors: string[] = [];

    if (Math.abs(totalDiff - 1.0) > 0.05) {
      errors.push(`Difficulty distribution sum must equal 1.0 (currently ${totalDiff})`);
    }
    if (totalMarks <= 0) {
      errors.push('Total marks must be greater than 0');
    }

    setValidationResult({
      is_valid: isValid,
      errors,
      difficulty_sum: totalDiff,
      checked_at: new Date().toLocaleTimeString()
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Blueprint Engine & Validator Wizard</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Define structural breakdown, Bloom's taxonomy mappings, chapter weightages, and validate consistency.
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

        {/* Validation Result Box */}
        {validationResult && (
          <div className={`p-5 rounded-2xl border text-xs space-y-2 ${
            validationResult.is_valid
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center justify-between font-bold text-sm">
              <div className="flex items-center gap-2">
                {validationResult.is_valid ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-400" />
                )}
                <span>{validationResult.is_valid ? 'Blueprint Validated Successfully' : 'Blueprint Validation Failed'}</span>
              </div>
              <span className="font-mono text-[11px] opacity-80">Checked at {validationResult.checked_at}</span>
            </div>
            {!validationResult.is_valid && validationResult.errors.length > 0 && (
              <ul className="list-disc list-inside space-y-1 text-rose-300 pl-2">
                {validationResult.errors.map((err: string, i: number) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Blueprint Builder Form */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>Blueprint Structural Parameters</span>
            </h3>

            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold rounded-full">
              STATUS: {status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Blueprint Code</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Blueprint Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-sans focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Total Allocated Marks</label>
              <input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Total Question Count</label>
              <input
                type="number"
                value={totalQuestions}
                onChange={(e) => setTotalQuestions(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-200 font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Difficulty Distribution */}
          <div className="border-t border-slate-800/80 pt-4 space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Normalized Difficulty Distribution
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <label className="text-slate-400 font-medium block mb-1">Easy Proportion (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={easyRatio}
                  onChange={(e) => setEasyRatio(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-emerald-400 font-mono"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <label className="text-slate-400 font-medium block mb-1">Medium Proportion (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={medRatio}
                  onChange={(e) => setMedRatio(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sky-400 font-mono"
                />
              </div>

              <div className="bg-slate-950 border border-slate-800 p-3 rounded-xl">
                <label className="text-slate-400 font-medium block mb-1">Hard Proportion (0.0 - 1.0)</label>
                <input
                  type="number"
                  step="0.05"
                  value={hardRatio}
                  onChange={(e) => setHardRatio(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-rose-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
            <button
              type="button"
              onClick={runValidation}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Validate Blueprint Consistency</span>
            </button>

            <button
              type="button"
              onClick={runValidation}
              className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition shadow-lg shadow-amber-500/20 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Save & Publish Blueprint</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
