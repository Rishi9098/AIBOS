'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  SlidersHorizontal,
  FileSpreadsheet,
  Layers,
  Sparkles,
  Eye,
  CheckCircle2,
  Settings,
  BookOpen,
  Scale
} from 'lucide-react';

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>AIBOS Board Administration Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                  MILESTONE 3 READY
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Configure Examination Rules, Architectural Blueprints, Sections, and Question Renderers for any board.
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            ← Main Portal
          </Link>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">Registered Boards</div>
            <div className="text-2xl font-bold text-sky-400 font-mono">CBSE / ICSE / MP</div>
            <div className="text-[11px] text-slate-500">Multi-board profiles active</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">Exam Rules Engine</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono">26+ Policies</div>
            <div className="text-[11px] text-slate-500">No code changes required</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">Exam Blueprints</div>
            <div className="text-2xl font-bold text-amber-400 font-mono">v1.0 Approved</div>
            <div className="text-[11px] text-slate-500">4-Stage approval workflow</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">Question Renderers</div>
            <div className="text-2xl font-bold text-purple-400 font-mono">23 Types</div>
            <div className="text-[11px] text-slate-500">Pluggable renderer plugins</div>
          </div>
        </div>

        {/* Administration Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Rules Engine Configurator */}
          <Link
            href="/admin/rules"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-sky-500/40 p-6 rounded-3xl transition-all shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 group-hover:scale-110 transition-transform">
                <SlidersHorizontal className="w-6 h-6" />
              </div>
              <span className="text-xs text-sky-400 font-semibold group-hover:translate-x-1 transition-transform">
                Configure Rules →
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-sky-400 transition">
                Exam Rules Engine Configurator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Edit exam duration, passing marks, negative marking ratios, calculator permissions, PwD extra time ratios, late entry rules, and security policies.
              </p>
            </div>
          </Link>

          {/* Card 2: Blueprint Engine & Validator */}
          <Link
            href="/admin/blueprints"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/40 p-6 rounded-3xl transition-all shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 group-hover:scale-110 transition-transform">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <span className="text-xs text-amber-400 font-semibold group-hover:translate-x-1 transition-transform">
                Open Blueprint Builder →
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition">
                Blueprint Engine & Consistency Validator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Define chapter weightages, difficulty distributions, Bloom's taxonomy mappings, section structures, and run automated consistency checks.
              </p>
            </div>
          </Link>

          {/* Card 3: Question Renderer Preview */}
          <Link
            href="/admin/renderer-preview"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-purple-500/40 p-6 rounded-3xl transition-all shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
                <Layers className="w-6 h-6" />
              </div>
              <span className="text-xs text-purple-400 font-semibold group-hover:translate-x-1 transition-transform">
                Preview All 23 Types →
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-purple-400 transition">
                Universal Question Renderer Preview
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Interactive preview suite for MCQ, True/False, Numerical, MathLive equations, Fabric.js diagrams, Code editor, Matrix match, and audio/video prompt types.
              </p>
            </div>
          </Link>

          {/* Card 4: Exam Execution Simulator */}
          <Link
            href="/exam/physics-101"
            className="group bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 p-6 rounded-3xl transition-all shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
                <Eye className="w-6 h-6" />
              </div>
              <span className="text-xs text-emerald-400 font-semibold group-hover:translate-x-1 transition-transform">
                Launch Candidate Terminal →
              </span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition">
                Candidate Terminal Simulator
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mt-1">
                Experience the live candidate exam terminal driven dynamically by stored rules, section bars, auto-save hooks, and cryptographic submission.
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
