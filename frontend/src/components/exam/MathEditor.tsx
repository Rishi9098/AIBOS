'use client';

import React, { useState } from 'react';
import { Sigma, Code2 } from 'lucide-react';

interface MathEditorProps {
  value: string;
  onChange: (latex: string) => void;
}

export const MathEditor: React.FC<MathEditorProps> = ({ value, onChange }) => {
  const [latexInput, setLatexInput] = useState(value || '');

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setLatexInput(val);
    onChange(val);
  };

  const insertSymbol = (sym: string) => {
    const newVal = latexInput + sym;
    setLatexInput(newVal);
    onChange(newVal);
  };

  const quickSymbols = [
    { label: 'Fraction', sym: '\\frac{a}{b}' },
    { label: 'Power', sym: 'x^{2}' },
    { label: 'Integral', sym: '\\int_{a}^{b} f(x)dx' },
    { label: 'Square Root', sym: '\\sqrt{x}' },
    { label: 'Sum', sym: '\\sum_{i=1}^{n}' },
    { label: 'Pi', sym: '\\pi' },
    { label: 'Theta', sym: '\\theta' },
    { label: 'Infinity', sym: '\\infty' },
  ];

  return (
    <div className="space-y-3 bg-slate-900/90 border border-slate-800 p-4 rounded-xl">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
          <Sigma className="w-4 h-4 text-sky-400" />
          <span>LaTeX Equation Builder</span>
        </label>
        <span className="text-[11px] text-slate-500 font-mono">MathLive / KaTeX standard</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {quickSymbols.map((s, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => insertSymbol(s.sym)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 rounded text-xs font-mono transition"
          >
            {s.label}
          </button>
        ))}
      </div>

      <textarea
        value={latexInput}
        onChange={handleTextChange}
        placeholder="Type LaTeX math expressions (e.g. \int_0^\infty e^{-x^2} dx)..."
        rows={3}
        className="w-full p-3 bg-slate-950 border border-slate-800 rounded-lg text-slate-100 font-mono text-sm focus:outline-none focus:border-sky-500"
      />

      {latexInput && (
        <div className="p-3 bg-slate-950/60 border border-slate-800/80 rounded-lg">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider block mb-1">Live LaTeX Render Preview</span>
          <div className="text-lg text-sky-400 font-serif">
            {latexInput}
          </div>
        </div>
      )}
    </div>
  );
};
