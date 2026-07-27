'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Scan,
  CheckCircle2,
  Edit3,
  Sparkles,
  FileImage,
  Code,
  Layers,
  ArrowRight,
  Save,
  CheckSquare
} from 'lucide-react';

export default function TeacherOCRReviewPage() {
  const [selectedRegionId, setSelectedRegionId] = useState('reg_02');
  const [editedText, setEditedText] = useState('पूर्ण तरंग रेक्टिफायर में चार डायोड होते हैं। positive half cycle में D1 और D2 कंडक्ट करते हैं।');
  const [isSaved, setIsSaved] = useState(false);

  const mockOCRRegions = [
    {
      id: 'reg_01',
      type: 'PARAGRAPH',
      bbox: { x: 50, y: 80, w: 800, h: 120 },
      rawText: 'Q1. Explain the working principle of a Full Wave Bridge Rectifier circuit. Detail diode conductances.',
      confidence: 0.96
    },
    {
      id: 'reg_02',
      type: 'HANDWRITING',
      bbox: { x: 50, y: 220, w: 850, h: 200 },
      rawText: 'पूर्ण तरंग रेक्टिफायर में चार डायोड होते हैं। positive half cycle में D1 और D2 कंडक्ट करते हैं।',
      confidence: 0.91
    },
    {
      id: 'reg_03',
      type: 'MATH_FORMULA',
      bbox: { x: 50, y: 440, w: 400, h: 80 },
      rawText: '\\int_0^{\\pi} \\sin(x) dx = -\\cos(\\pi) + \\cos(0) = 2',
      confidence: 0.98,
      latex: '\\int_0^{\\pi} \\sin(x) dx = 2'
    },
    {
      id: 'reg_04',
      type: 'DIAGRAM',
      bbox: { x: 500, y: 440, w: 380, h: 250 },
      rawText: 'Circuit Schematic: Bridge Rectifier Topology (D1, D2, D3, D4, RL)',
      confidence: 0.90,
      labels: ['D1', 'D2', 'D3', 'D4', 'Load Resistor RL']
    }
  ];

  const handleSaveCorrection = (e: React.FormEvent) => {
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
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Scan className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>AIBOS Multimodal OCR Review & Verification Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-purple-500/20 text-purple-400 border border-purple-500/30 rounded-full">
                  MILESTONE 5
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Inspect scanned answer sheets, verify handwriting & math LaTeX recognition, and correct OCR text before feeding into AI evaluation.
              </p>
            </div>
          </div>

          <Link
            href="/teacher/review"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            ← Teacher Evaluation Console
          </Link>
        </div>

        {isSaved && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 p-4 rounded-2xl text-xs flex items-center gap-2 font-medium animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>OCR Correction saved! Bounding box text updated and marked as teacher-verified (100% confidence).</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Scanned Answer Sheet Overlay Canvas (6 cols) */}
          <div className="lg:col-span-6 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <FileImage className="w-4 h-4 text-purple-400" />
                <span>Scanned Answer Sheet (Page 1 of 1)</span>
              </span>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                OCR Confidence: 94%
              </span>
            </div>

            {/* Bounding Box Visual Overlay Simulator */}
            <div className="relative bg-slate-950 border border-slate-800 rounded-2xl min-h-[480px] p-6 space-y-6 overflow-hidden">
              {mockOCRRegions.map((reg) => {
                const isSelected = reg.id === selectedRegionId;
                return (
                  <div
                    key={reg.id}
                    onClick={() => {
                      setSelectedRegionId(reg.id);
                      setEditedText(reg.rawText);
                    }}
                    className={`p-4 rounded-xl border cursor-pointer transition relative ${
                      isSelected
                        ? 'bg-purple-500/20 border-purple-400 ring-2 ring-purple-400/40'
                        : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px] mb-1 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-bold">
                        [{reg.type}]
                      </span>
                      <span className="text-slate-400">conf: {Math.round(reg.confidence * 100)}%</span>
                    </div>
                    <div className="text-xs text-slate-200 font-sans leading-relaxed">
                      {reg.rawText}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Extracted Payloads & Correction Form (6 cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 uppercase tracking-wider">
                <Edit3 className="w-4 h-4 text-purple-400" />
                <span>OCR Region Editor & Verification</span>
              </h3>

              {/* Editor Form */}
              <form onSubmit={handleSaveCorrection} className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Selected Region ID</label>
                  <input
                    type="text"
                    disabled
                    value={selectedRegionId}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-purple-400 font-mono"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Recognized Text / Devanagari Hindi / LaTeX</label>
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full min-h-[120px] bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-200 focus:outline-none focus:border-purple-500 font-sans leading-relaxed resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-purple-500 hover:bg-purple-400 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-purple-500/20 flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Save OCR Correction & Re-Normalize Payload</span>
                </button>
              </form>

              {/* Normalized Evaluation Payload Preview */}
              <div className="border-t border-slate-800 pt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-sky-400">
                    <Sparkles className="w-4 h-4" />
                    <span>Unified Normalized Representation</span>
                  </span>
                  <span className="text-[10px] font-mono bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
                    Evaluation Engine Compatible
                  </span>
                </div>

                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-emerald-400 leading-relaxed overflow-x-auto">
                  {JSON.stringify({
                    cleaned_text: "Q1. Explain Full Wave Bridge Rectifier... पूर्ण तरंग रेक्टिफायर में चार डायोड होते हैं।",
                    latex_formulas: ["\\int_0^{\\pi} \\sin(x) dx = 2"],
                    diagrams: [{ type: "CIRCUIT", labels: ["D1", "D2", "D3", "D4", "RL"] }],
                    confidence_summary: 0.94
                  }, null, 2)}
                </div>

                <Link
                  href="/teacher/review"
                  className="w-full mt-2 py-3 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold rounded-xl text-xs transition shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2"
                >
                  <span>Pass Unified Payload to AI Evaluation Platform</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
