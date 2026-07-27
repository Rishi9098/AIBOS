'use client';

import React, { useState } from 'react';
import {
  CheckSquare,
  Circle,
  Code,
  FileText,
  Volume2,
  Video,
  Grid,
  Image as ImageIcon,
  Table,
  SlidersHorizontal,
  Mic,
  Play,
  RotateCcw,
  Sparkles,
  MoveUp,
  MoveDown,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Hash
} from 'lucide-react';
import { MathEditor } from '../exam/MathEditor';
import { DiagramCanvas } from '../exam/DiagramCanvas';

export interface BasePluginProps {
  question: any;
  value: any;
  onChange: (val: any) => void;
  isReadOnly?: boolean;
}

// 1. MCQ Plugin
export const MCQPlugin: React.FC<BasePluginProps> = ({ question, value, onChange, isReadOnly }) => {
  const options = question.options || [
    { id: 'A', text: 'Option A: Diode conducts during positive half cycle' },
    { id: 'B', text: 'Option B: Diode conducts during negative half cycle' },
    { id: 'C', text: 'Option C: Current flows in opposite directions' },
    { id: 'D', text: 'Option D: No current flows through load resistor' }
  ];

  return (
    <div className="space-y-3 font-sans text-sm">
      {options.map((opt: any) => {
        const isSelected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={isReadOnly}
            onClick={() => onChange(opt.id)}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition-all ${
              isSelected
                ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-semibold ring-2 ring-sky-400/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <span className={`w-6 h-6 rounded-full border flex items-center justify-center font-mono text-xs ${
              isSelected ? 'bg-sky-500 text-white border-sky-400' : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}>
              {opt.id}
            </span>
            <span className="flex-1">{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
};

// 2. Multiple Select Plugin
export const MultiSelectPlugin: React.FC<BasePluginProps> = ({ question, value = [], onChange, isReadOnly }) => {
  const options = question.options || [
    { id: 'A', text: 'Diodes D1 and D2 are forward biased in positive half cycle' },
    { id: 'B', text: 'Diodes D3 and D4 are forward biased in negative half cycle' },
    { id: 'C', text: 'Output voltage is pulsating DC' },
    { id: 'D', text: 'Output frequency is half of input frequency' }
  ];

  const toggleOption = (id: string) => {
    if (isReadOnly) return;
    const currentList: string[] = Array.isArray(value) ? value : [];
    if (currentList.includes(id)) {
      onChange(currentList.filter((item) => item !== id));
    } else {
      onChange([...currentList, id]);
    }
  };

  return (
    <div className="space-y-3 text-sm">
      {options.map((opt: any) => {
        const isSelected = Array.isArray(value) && value.includes(opt.id);
        return (
          <button
            key={opt.id}
            type="button"
            disabled={isReadOnly}
            onClick={() => toggleOption(opt.id)}
            className={`w-full p-3.5 rounded-xl border text-left flex items-center gap-3 transition ${
              isSelected
                ? 'bg-sky-500/20 border-sky-400 text-sky-200 font-semibold ring-2 ring-sky-400/30'
                : 'bg-slate-950/80 border-slate-800 text-slate-300 hover:border-slate-700'
            }`}
          >
            <div className={`w-5 h-5 rounded border flex items-center justify-center ${
              isSelected ? 'bg-sky-500 border-sky-400 text-white' : 'bg-slate-900 border-slate-700'
            }`}>
              {isSelected && <CheckSquare className="w-3.5 h-3.5" />}
            </div>
            <span className="flex-1">{opt.text}</span>
          </button>
        );
      })}
    </div>
  );
};

// 3. True / False Plugin
export const TrueFalsePlugin: React.FC<BasePluginProps> = ({ value, onChange, isReadOnly }) => {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm font-semibold">
      <button
        type="button"
        disabled={isReadOnly}
        onClick={() => onChange('TRUE')}
        className={`p-4 rounded-2xl border flex items-center justify-center gap-2 transition ${
          value === 'TRUE'
            ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40'
            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
        }`}
      >
        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        <span>TRUE</span>
      </button>

      <button
        type="button"
        disabled={isReadOnly}
        onClick={() => onChange('FALSE')}
        className={`p-4 rounded-2xl border flex items-center justify-center gap-2 transition ${
          value === 'FALSE'
            ? 'bg-rose-500/20 border-rose-400 text-rose-300 ring-2 ring-rose-400/40'
            : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:border-slate-700'
        }`}
      >
        <XCircle className="w-5 h-5 text-rose-400" />
        <span>FALSE</span>
      </button>
    </div>
  );
};

// 4. Fill in the Blanks Plugin
export const FillInBlanksPlugin: React.FC<BasePluginProps> = ({ value = '', onChange, isReadOnly }) => {
  return (
    <div className="space-y-2">
      <label className="text-xs text-slate-400">Fill in the blank value:</label>
      <input
        type="text"
        disabled={isReadOnly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type missing word or phrase..."
        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-sky-500 font-sans"
      />
    </div>
  );
};

// 5. Short Answer Plugin
export const ShortAnswerPlugin: React.FC<BasePluginProps> = ({ value = '', onChange, isReadOnly }) => {
  return (
    <textarea
      disabled={isReadOnly}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Type brief solution (1-3 sentences)..."
      className="w-full min-h-[120px] bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed resize-none font-sans"
    />
  );
};

// 6. Long Answer / Essay Plugin
export const LongAnswerPlugin: React.FC<BasePluginProps> = ({ value = '', onChange, isReadOnly }) => {
  return (
    <textarea
      disabled={isReadOnly}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write comprehensive detailed explanation with bullet points and step-wise derivation..."
      className="w-full min-h-[240px] bg-slate-950/90 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed font-sans"
    />
  );
};

// 7. Numerical Answer Plugin
export const NumericalPlugin: React.FC<BasePluginProps> = ({ question, value = '', onChange, isReadOnly }) => {
  const tolerance = question.tolerance || '±0.05';
  return (
    <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl space-y-3 max-w-sm">
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span className="font-mono flex items-center gap-1">
          <Hash className="w-3.5 h-3.5 text-sky-400" />
          <span>Numeric Value</span>
        </span>
        <span className="bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded font-mono text-[11px]">
          Tolerance: {tolerance}
        </span>
      </div>
      <input
        type="number"
        step="any"
        disabled={isReadOnly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter numerical value (e.g. 3.14)"
        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-lg font-mono font-bold text-sky-400 focus:outline-none focus:border-sky-500"
      />
    </div>
  );
};

// 8. Matching Plugin
export const MatchingPlugin: React.FC<BasePluginProps> = ({ question, value = {}, onChange, isReadOnly }) => {
  const leftItems = question.left || ['1. Diode D1', '2. Capacitor Filter', '3. Transformer'];
  const rightOptions = question.right || ['A. Rectification', 'B. Ripple Reduction', 'C. Voltage Stepping'];

  const handleMatchChange = (left: string, right: string) => {
    if (isReadOnly) return;
    onChange({ ...value, [left]: right });
  };

  return (
    <div className="space-y-3 text-sm">
      <div className="text-xs text-slate-400 font-semibold mb-1">Match Column I with Column II:</div>
      {leftItems.map((item: string) => (
        <div key={item} className="flex items-center justify-between gap-4 bg-slate-950/80 border border-slate-800 p-3 rounded-xl">
          <span className="font-medium text-slate-200">{item}</span>
          <select
            disabled={isReadOnly}
            value={value[item] || ''}
            onChange={(e) => handleMatchChange(item, e.target.value)}
            className="bg-slate-900 border border-slate-700 text-sky-400 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none"
          >
            <option value="">Select Match...</option>
            {rightOptions.map((opt: string) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
};

// 9. Matrix Match Plugin
export const MatrixMatchPlugin: React.FC<BasePluginProps> = ({ question, value = {}, onChange, isReadOnly }) => {
  const rows = ['(A) P-N Junction', '(B) Zener Diode', '(C) Photodiode'];
  const cols = ['p', 'q', 'r', 's'];

  const toggleCell = (row: string, col: string) => {
    if (isReadOnly) return;
    const rowState: string[] = value[row] || [];
    const updated = rowState.includes(col) ? rowState.filter((c) => c !== col) : [...rowState, col];
    onChange({ ...value, [row]: updated });
  };

  return (
    <div className="overflow-x-auto bg-slate-950/90 border border-slate-800 p-4 rounded-2xl text-xs">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2 text-left text-slate-400">Component</th>
            {cols.map((col) => (
              <th key={col} className="p-2 text-center text-sky-400 font-mono">({col})</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row} className="border-t border-slate-800/60">
              <td className="p-2.5 font-medium text-slate-200">{row}</td>
              {cols.map((col) => {
                const isChecked = (value[row] || []).includes(col);
                return (
                  <td key={col} className="p-2.5 text-center">
                    <button
                      type="button"
                      disabled={isReadOnly}
                      onClick={() => toggleCell(row, col)}
                      className={`w-6 h-6 rounded border flex items-center justify-center mx-auto transition ${
                        isChecked ? 'bg-sky-500 border-sky-400 text-white font-bold' : 'bg-slate-900 border-slate-700'
                      }`}
                    >
                      {isChecked && '✓'}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// 10. Code Editor Plugin
export const ProgrammingCodePlugin: React.FC<BasePluginProps> = ({ value = '', onChange, isReadOnly }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-t-xl font-mono">
        <span className="flex items-center gap-1.5 text-sky-400">
          <Code className="w-4 h-4" />
          <span>Python / C++ Script Execution</span>
        </span>
        <span>UTF-8</span>
      </div>
      <textarea
        disabled={isReadOnly}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="# Write your code implementation here...&#10;def solution(n):&#10;    return n * 2"
        className="w-full min-h-[220px] bg-slate-950 border border-slate-800 rounded-b-xl p-4 font-mono text-xs text-emerald-400 focus:outline-none focus:border-sky-500 leading-relaxed resize-none"
      />
    </div>
  );
};

// 11. Audio Question Plugin
export const AudioQuestionPlugin: React.FC<BasePluginProps> = ({ value, onChange, isReadOnly }) => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <div className="bg-slate-950/90 border border-slate-800 p-5 rounded-2xl space-y-4">
      <div className="flex items-center gap-3 p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs">
        <button type="button" className="p-2 rounded-lg bg-sky-500 text-white">
          <Play className="w-4 h-4" />
        </button>
        <div className="flex-1 font-mono text-slate-300">Question_Audio_Prompt_01.mp3</div>
      </div>

      <div className="border-t border-slate-800 pt-3">
        <button
          type="button"
          disabled={isReadOnly}
          onClick={() => setIsRecording(!isRecording)}
          className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition ${
            isRecording
              ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
              : 'bg-slate-900 border-slate-700 text-slate-200 hover:border-slate-600'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>{isRecording ? 'Recording Voice Response...' : 'Record Audio Response'}</span>
        </button>
      </div>
    </div>
  );
};
