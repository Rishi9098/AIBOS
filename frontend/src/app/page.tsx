'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  BrainCircuit, 
  Award, 
  Lock,
  Sparkles,
  ArrowRight,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { setAuthSession } from '@/lib/api';

export default function HomePage() {
  const router = useRouter();
  const [role, setRole] = useState<'STUDENT' | 'TEACHER' | 'SUPER_ADMIN'>('STUDENT');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter username and password.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const formData = new URLSearchParams();
      formData.append('username', username);
      formData.append('password', password);

      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData.toString(),
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || 'Authentication failed. Please check credentials.');
      }

      const data = await res.json();
      setAuthSession(data.access_token, data.role, data.user_id, data.username);

      if (data.role === 'STUDENT') {
        router.push('/candidate/dashboard');
      } else if (data.role === 'TEACHER' || data.role === 'EVALUATOR') {
        router.push('/teacher/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setIsLoading(false);
    }
  };

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
          <a
            href="/verify"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold transition flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Public Certificate Verification Portal</span>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-8 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center flex-1">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-xs font-medium">
            <Sparkles className="w-4 h-4" />
            <span>Government Board Examination Operating System</span>
          </div>

          <h1 className="text-5xl font-black tracking-tight text-slate-100 leading-[1.15]">
            Replacing Traditional Board Exams with <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-emerald-400 bg-clip-text text-transparent">Autonomous AI Infrastructure</span>
          </h1>

          <p className="text-base text-slate-400 leading-relaxed">
            AIBOS manages the complete educational assessment lifecycle: Textbook Ingestion, Blueprint Rules, Traceable Question Paper Generation, Secure Candidate Delivery, Multilingual OCR, LangGraph AI Evaluation, Teacher Moderation, and Verified Digital Certificates.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-2xl font-bold text-sky-400 font-mono">100% Traceable</span>
              <p className="text-xs text-slate-400">Textbook Knowledge Grounding</p>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
              <span className="text-2xl font-bold text-emerald-400 font-mono">96.8% Accuracy</span>
              <p className="text-xs text-slate-400">LangGraph Multi-Agent Evaluation</p>
            </div>
          </div>
        </div>

        {/* Portal Authentication Box */}
        <div className="glass-panel p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-100">Portal Authentication</h2>
            <p className="text-xs text-slate-400">Select your role and authenticate with your institutional credentials.</p>
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-3 gap-2 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 text-xs font-medium">
            <button
              type="button"
              onClick={() => setRole('STUDENT')}
              className={`py-2 rounded-lg transition ${role === 'STUDENT' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Candidate
            </button>
            <button
              type="button"
              onClick={() => setRole('TEACHER')}
              className={`py-2 rounded-lg transition ${role === 'TEACHER' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Evaluator
            </button>
            <button
              type="button"
              onClick={() => setRole('SUPER_ADMIN')}
              className={`py-2 rounded-lg transition ${role === 'SUPER_ADMIN' ? 'bg-sky-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Board Admin
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4 pt-2" onSubmit={handleLogin}>
            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">
                {role === 'STUDENT' ? 'Roll Number / Candidate ID' : 'Institutional Username'}
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={role === 'STUDENT' ? 'e.g. student_fresh_2027_live' : 'e.g. cbse_super_admin_2027_v6'}
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300 block mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-sky-500"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Authenticate & Enter {role} Portal</span>
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 px-8 py-6 text-center text-xs text-slate-500">
        AI Board Examination Operating System (AIBOS) • Production Pilot Infrastructure
      </footer>
    </div>
  );
}
