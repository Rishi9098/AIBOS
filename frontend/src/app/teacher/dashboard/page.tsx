'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileCheck, 
  BookOpen, 
  CheckCircle2, 
  LogOut, 
  Layers, 
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { getAuthUser, clearAuthSession } from '@/lib/api';

export default function TeacherDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser || !authUser.token) {
      router.push('/');
      return;
    }
    setUser(authUser);
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <FileCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Evaluator & Teacher Portal</h1>
              <p className="text-xs text-teal-400 font-mono">
                Authenticated Evaluator: <span className="text-slate-200 font-bold">{user?.username}</span>
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 text-[10px] font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full font-bold">
                100% TRACEABLE
              </span>
              <BookOpen className="w-5 h-5 text-teal-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Question Paper Builder</h3>
              <p className="text-xs text-slate-400 mt-1">
                Generate board exam questions strictly bound to approved NCERT textbook nodes with 100% reference traceability cards.
              </p>
            </div>

            <Link
              href="/teacher/builder"
              className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 block text-center"
            >
              <span>Open Question Builder</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full font-bold">
                EVALUATION QUEUE
              </span>
              <ShieldCheck className="w-5 h-5 text-sky-400" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-100">Teacher Moderation & Review Console</h3>
              <p className="text-xs text-slate-400 mt-1">
                Review LangGraph multi-agent AI evaluation scores, inspect evidence snippets, and override marks with mandatory comments.
              </p>
            </div>

            <Link
              href="/teacher/review"
              className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 block text-center"
            >
              <span>Open Moderation Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
