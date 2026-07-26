'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  BrainCircuit, 
  Award, 
  BarChart3, 
  FileCheck2, 
  Lock,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export default function HomePage() {
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500">
      {/* Header Navigation */}
      <nav className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-sky-500/20">
            A
          </div>
          <div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-sky-400 bg-clip-text text-transparent">
              AIBOS
            </span>
            <span className="text-xs text-sky-400 block font-mono font-medium -mt-1">
              AI Board Examination Operating System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/exam/demo-exam-1"
            className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-lg shadow-sky-600/30 transition flex items-center gap-2"
          >
            <span>Launch Exam Terminal Demo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Government & Enterprise Scale Digital Public Infrastructure</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-slate-100 leading-[1.15]">
            Replacing Traditional Board Exams with <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Autonomous AI Infrastructure</span>
          </h1>

          <p className="text-base text-slate-400 leading-relaxed">
            AIBOS manages the complete educational assessment lifecycle: Question Paper Generation, Secure Exam Delivery, AI Edge Proctoring, Multilingual OCR, Diagram Evaluation, and Digital Certificate Registry for over 10 million students.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-2xl font-bold text-sky-400 font-mono">500,000+</span>
              <p className="text-xs text-slate-400">Concurrent Proctored Sessions</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">14 Modules</span>
              <p className="text-xs text-slate-400">End-to-End Examination Ecosystem</p>
            </div>
          </div>
        </div>

        {/* Portal Portal Box */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">Portal Authentication</h2>
            <p className="text-xs text-slate-400">Select your institutional role to enter the secure portal.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              onClick={() => setRole('STUDENT')}
              className={`py-2 rounded-lg transition ${role === 'STUDENT' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Candidate
            </button>
            <button
              onClick={() => setRole('TEACHER')}
              className={`py-2 rounded-lg transition ${role === 'TEACHER' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Evaluator
            </button>
            <button
              onClick={() => setRole('ADMIN')}
              className={`py-2 rounded-lg transition ${role === 'ADMIN' ? 'bg-sky-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Board Admin
            </button>
          </div>

          {/* Form */}
          <form className="space-y-4 pt-2" onSubmit={(e) => e.preventDefault()}>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                {role === 'STUDENT' ? 'Roll Number / Candidate ID' : 'Institutional Username'}
              </label>
              <input
                type="text"
                placeholder={role === 'STUDENT' ? 'e.g. CBSE-2026-90412' : 'e.g. evaluator.admin'}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <Link
              href="/exam/demo-exam-1"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 block text-center"
            >
              <Lock className="w-4 h-4" />
              <span>Sign In to {role} Terminal</span>
            </Link>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-8 py-6 text-center text-xs text-slate-500">
        AI Board Examination Operating System (AIBOS) • Version 1.0.0 Enterprise • Digital Public Infrastructure Platform
      </footer>
    </div>
  );
}
