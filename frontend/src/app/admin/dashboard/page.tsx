'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  BookOpen, 
  FileText, 
  Award, 
  Activity, 
  Bot, 
  ShieldCheck, 
  Plus, 
  LogOut,
  Compass,
  KeyRound,
  GitBranch,
  Layers
} from 'lucide-react';
import { getAuthUser, clearAuthSession } from '@/lib/api';
import PageHelpPanel from '@/components/PageHelpPanel';
import GuidedTour from '@/components/GuidedTour';

export default function BoardAdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  const adminTourSteps = [
    {
      targetTitle: 'Board Administration Control Console',
      whatIsThisPage: 'This is the master control dashboard for State Education Board Administrators and System Auditors.',
      whatHappensHere: 'Admins oversee Curriculum Ingestion, Blueprint Rules, Question Paper Approvals, Exam Scheduling, Results Processing, & Operations.',
      whatHappensNext: 'Select any module below to manage specific examination lifecycle assets.',
    },
    {
      targetTitle: 'Curriculum & Textbook Ingestion Module',
      whatIsThisPage: 'Link to official NCERT textbook PDF upload and Knowledge Graph construction (/admin/curriculum).',
      whatHappensHere: 'Textbook PDFs are chunked, embedded into vector stores, and tagged to page numbers.',
      whatHappensNext: 'Teachers construct 100% traceable question papers from ingested textbook nodes.',
    },
  ];

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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Board Administration Control Console</h1>
              <p className="text-xs text-indigo-400 font-mono">
                Authenticated Administrator: <span className="text-slate-200 font-bold">{user?.username}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <GuidedTour roleName="Board Admin" steps={adminTourSteps} />

            <Link
              href="/explorer"
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-sky-400 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4" />
              <span>Explorer</span>
            </Link>

            <Link
              href="/admin/credentials"
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-amber-400 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <KeyRound className="w-4 h-4" />
              <span>Credentials</span>
            </Link>

            <Link
              href="/admin/hierarchy"
              className="px-3.5 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-indigo-400 text-xs font-semibold rounded-xl transition flex items-center gap-1.5"
            >
              <GitBranch className="w-4 h-4" />
              <span>Role Matrix</span>
            </Link>

            <Link
              href="/admin/exams/new"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule Exam</span>
            </Link>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* Page Help Panel */}
        <PageHelpPanel
          pageTitle="Board Administration Control Console"
          purpose="This central control console governs end-to-end examination operations for State Education Boards."
          userRole="Board Administrator & System Auditor"
          apisExecuted={['GET /api/v1/auth/me', 'GET /api/v1/ops/metrics']}
          dbTablesUpdated={['boards', 'exams', 'textbooks', 'blueprints', 'student_results']}
          nextStep="Schedule a new exam session or manage curriculum knowledge graph assets."
          consequenceIfSkipped="Exam lifecycles would stall, preventing candidate evaluation or result publication."
        />

        {/* Administration Portals Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <BookOpen className="w-6 h-6 text-teal-400" />
              <span className="text-xs font-mono text-teal-400">MILESTONE 9</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Curriculum & Textbooks</h3>
              <p className="text-xs text-slate-400 mt-1">Upload NCERT textbooks, trigger automated Knowledge Graph construction, and view vector nodes.</p>
            </div>
            <Link href="/admin/curriculum" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-teal-400 font-bold rounded-xl text-xs transition block text-center">
              Manage Curriculum →
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Layers className="w-6 h-6 text-indigo-400" />
              <span className="text-xs font-mono text-indigo-400">MILESTONE 3</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Rules & Blueprints</h3>
              <p className="text-xs text-slate-400 mt-1">Configure board pass marks, grace policies, difficulty distributions, and blueprint approvals.</p>
            </div>
            <Link href="/admin/blueprints" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-400 font-bold rounded-xl text-xs transition block text-center">
              Manage Blueprints →
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Award className="w-6 h-6 text-amber-400" />
              <span className="text-xs font-mono text-amber-400">MILESTONE 7</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Results & Certificates</h3>
              <p className="text-xs text-slate-400 mt-1">Process board results, apply grace marks moderation, compute CGPA/ranks, and issue signed marksheets.</p>
            </div>
            <Link href="/admin/results" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold rounded-xl text-xs transition block text-center">
              Process Board Results →
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Activity className="w-6 h-6 text-sky-400" />
              <span className="text-xs font-mono text-sky-400">MILESTONE 6</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">Operations & Pilot Readiness</h3>
              <p className="text-xs text-slate-400 mt-1">Review health probes, Prometheus metrics gauges, AI model registry status, and feature flags.</p>
            </div>
            <Link href="/admin/ops" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold rounded-xl text-xs transition block text-center">
              Operations Console →
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <Bot className="w-6 h-6 text-purple-400" />
              <span className="text-xs font-mono text-purple-400">MILESTONE 8</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">LangGraph Multi-Agent Inspector</h3>
              <p className="text-xs text-slate-400 mt-1">Inspect DAG node execution flows, agent latency metrics, and benchmark evaluation accuracy.</p>
            </div>
            <Link href="/admin/agents" className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-purple-400 font-bold rounded-xl text-xs transition block text-center">
              Agent Visual Inspector →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
