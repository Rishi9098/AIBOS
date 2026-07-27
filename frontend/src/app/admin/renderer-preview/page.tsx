'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, Eye, CheckCircle2, Sparkles, Sliders } from 'lucide-react';
import { UniversalQuestionRenderer } from '@/components/renderers/UniversalQuestionRenderer';

export default function RendererPreviewPage() {
  const [selectedType, setSelectedType] = useState('MCQ');
  const [responseValue, setResponseValue] = useState<any>(null);

  const sampleQuestions: Record<string, any> = {
    MCQ: {
      id: 'q_mcq_1',
      question_type: 'MCQ',
      question_text: 'Identify the state of matter with fixed volume but variable shape.',
      options: [
        { id: 'A', text: 'Solid' },
        { id: 'B', text: 'Liquid' },
        { id: 'C', text: 'Gas' },
        { id: 'D', text: 'Plasma' }
      ]
    },
    MULTIPLE_SELECT: {
      id: 'q_ms_1',
      question_type: 'MULTIPLE_SELECT',
      question_text: 'Which of the following are vector quantities? (Select all that apply)',
      options: [
        { id: 'A', text: 'Velocity' },
        { id: 'B', text: 'Speed' },
        { id: 'C', text: 'Acceleration' },
        { id: 'D', text: 'Force' }
      ]
    },
    TRUE_FALSE: {
      id: 'q_tf_1',
      question_type: 'TRUE_FALSE',
      question_text: 'Snell’s Law of Refraction states that ratio of sin(i) to sin(r) is constant for a pair of media.'
    },
    NUMERICAL: {
      id: 'q_num_1',
      question_type: 'NUMERICAL',
      question_text: 'Calculate the focal length of a convex lens with power +5.0 Diopters in meters.',
      tolerance: '±0.01'
    },
    MATCHING: {
      id: 'q_match_1',
      question_type: 'MATCHING',
      question_text: 'Match the SI physical units with their derived quantities:',
      left: ['1. Tesla', '2. Farad', '3. Henry'],
      right: ['A. Capacitance', 'B. Magnetic Flux Density', 'C. Inductance']
    },
    MATRIX_MATCH: {
      id: 'q_matrix_1',
      question_type: 'MATRIX_MATCH',
      question_text: 'Match components in Column I with properties in Column II:'
    },
    MATHEMATICAL_EQUATION: {
      id: 'q_math_1',
      question_type: 'MATHEMATICAL_EQUATION',
      question_text: 'Derive the definite integral formula for magnetic field intensity inside a solenoid.'
    },
    DIAGRAM_DRAWING: {
      id: 'q_diag_1',
      question_type: 'DIAGRAM_DRAWING',
      question_text: 'Draw the circuit diagram of a Full Wave Bridge Rectifier showing diode polarities.'
    },
    PROGRAMMING_CODE: {
      id: 'q_code_1',
      question_type: 'PROGRAMMING_CODE',
      question_text: 'Write a Python function to compute the Fibonacci sequence up to N terms.'
    },
    AUDIO_QUESTION: {
      id: 'q_audio_1',
      question_type: 'AUDIO_QUESTION',
      question_text: 'Listen to the audio clip below and record your oral summary.'
    }
  };

  const currentQuestion = sampleQuestions[selectedType] || sampleQuestions['MCQ'];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
              <Layers className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Universal Question Renderer Preview Gallery</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Test and interact with all 23 pluggable question type renderers in real time.
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Question Type Selector */}
          <div className="lg:col-span-4 bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-3 shadow-xl">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Select Question Type Plugin
            </h3>

            <div className="space-y-1.5 font-mono text-xs max-h-[500px] overflow-y-auto pr-1">
              {[
                'MCQ',
                'MULTIPLE_SELECT',
                'TRUE_FALSE',
                'NUMERICAL',
                'MATCHING',
                'MATRIX_MATCH',
                'MATHEMATICAL_EQUATION',
                'DIAGRAM_DRAWING',
                'PROGRAMMING_CODE',
                'AUDIO_QUESTION'
              ].map((qType) => (
                <button
                  key={qType}
                  type="button"
                  onClick={() => {
                    setSelectedType(qType);
                    setResponseValue(null);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition flex items-center justify-between ${
                    selectedType === qType
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span>{qType}</span>
                  {selectedType === qType && <Eye className="w-3.5 h-3.5 text-purple-400" />}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Live Interactive Renderer Box */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <span className="px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-mono font-bold rounded-full">
                  PLUGIN: {selectedType}
                </span>
                <span className="text-xs text-slate-500 font-mono">Live Universal Renderer</span>
              </div>

              {/* Universal Question Renderer Instance */}
              <UniversalQuestionRenderer
                question={currentQuestion}
                value={responseValue}
                onChange={(val) => setResponseValue(val)}
              />
            </div>

            {/* Response Serialized State Drawer */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 space-y-2">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Serialized Candidate Response Payload
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-xs font-mono text-emerald-400 min-h-[60px] overflow-x-auto">
                {JSON.stringify(responseValue, null, 2) || 'null (No response selected yet)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
