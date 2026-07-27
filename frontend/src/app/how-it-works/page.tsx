'use client';

import React from 'react';
import Link from 'next/link';
import { 
  BookOpen, 
  GitBranch, 
  Sparkles, 
  ShieldCheck, 
  Bot, 
  UserCheck, 
  Award, 
  QrCode, 
  ArrowLeft,
  CheckCircle2,
  Lock,
  Database,
  Code
} from 'lucide-react';
import PageHelpPanel from '@/components/PageHelpPanel';
import RouteGuard from '@/components/RouteGuard';

export default function HowItWorksPage() {
  return (
    <RouteGuard allowedRoles={['BOARD_ADMIN', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 space-y-10">
        <div className="max-w-6xl mx-auto space-y-10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-slate-100 tracking-tight">
                  How AIBOS Works — Educational Architecture Explainer
                </h1>
                <p className="text-xs text-sky-400 font-mono mt-0.5">
                  Technical guide for Board Officials, School Principals, Evaluators, & Government Auditors
                </p>
              </div>
            </div>

            <Link
              href="/admin/dashboard"
              className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Admin Dashboard</span>
            </Link>
          </div>

          {/* Page Help Panel */}
          <PageHelpPanel
            pageTitle="How AIBOS Works (System Architecture)"
            purpose="This educational page breaks down the complete technical lifecycle of AIBOS—from PDF textbook ingestion down to public QR code certificate verification."
            userRole="First-Time Users, Board Officials, & Technical Auditors"
            apisExecuted={['POST /api/v1/curriculum/textbooks/upload', 'POST /api/v1/evaluation/evaluate', 'GET /api/v1/results/verify/{code}']}
            dbTablesUpdated={['knowledge_graph_nodes', 'textbooks', 'student_submissions', 'digital_certificates']}
            nextStep="Log in via the Main Portal and explore the AIBOS System Explorer (/explorer)."
            consequenceIfSkipped="Users might misunderstand the zero-hallucination guarantees or role boundaries of AIBOS."
          />

          {/* Section 1: Textbook Knowledge Graph Ingestion */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-teal-500/20 text-teal-400 rounded-xl">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">1. How Textbooks Become a Vector Knowledge Graph</h2>
                <p className="text-xs text-slate-400">Automated ingestion of official NCERT textbook PDFs</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When a Board Administrator uploads an official textbook PDF, AIBOS executes an OCR pipeline to extract text, mathematical formulas, and diagrams into chapter chunks. These chunks are embedded using high-dimensional vector embeddings and parsed into a hierarchical Knowledge Graph. Every concept node is tagged with chapter titles, page references, and Bloom's taxonomy levels.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-teal-400 font-bold block">1. PDF OCR Processing</span>
                <span className="text-slate-400 text-[11px]">Extracts raw text & equations</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-sky-400 font-bold block">2. Vector Embedding</span>
                <span className="text-slate-400 text-[11px]">Text-Embedding-004 vectors</span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <span className="text-amber-400 font-bold block">3. Knowledge Nodes</span>
                <span className="text-slate-400 text-[11px]">Tagged to NCERT Page #s</span>
              </div>
            </div>
          </div>

          {/* Section 2: Zero LLM Hallucination Guarantee */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">2. Why AI Cannot Hallucinate (100% Traceability)</h2>
                <p className="text-xs text-slate-400">Strict grounding to official board curriculum nodes</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Traditional AI models suffer from hallucinations when generating exam questions from general web knowledge. AIBOS enforces a zero-external-knowledge system prompt guard: Every generated question, rubric, and model answer must be 100% derived from retrieved textbook vector nodes. Each question carries an immutable <strong>Textbook Reference Card</strong> listing the exact Knowledge ID and NCERT page reference.
            </p>
          </div>

          {/* Section 3: LangGraph 13-Agent Evaluation Engine */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">3. How LangGraph Multi-Agent Evaluation Works</h2>
                <p className="text-xs text-slate-400">13 specialized AI agents executing in a Directed Acyclic Graph (DAG)</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              When a student submits an answer script, AIBOS does not rely on a single prompt call. It invokes a 13-agent LangGraph workflow:
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs pt-2">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-purple-400 font-bold block">1. Evaluation Planner</span>
                <span className="text-slate-400 text-[11px]">Deconstructs question parts</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-sky-400 font-bold block">2. Multimodal OCR</span>
                <span className="text-slate-400 text-[11px]">Transcribes handwriting</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-emerald-400 font-bold block">3. Rubric Matcher</span>
                <span className="text-slate-400 text-[11px]">Matches key concepts</span>
              </div>
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                <span className="text-amber-400 font-bold block">4. Confidence Scorer</span>
                <span className="text-slate-400 text-[11px]">Routes low confidence to human</span>
              </div>
            </div>
          </div>

          {/* Section 4: Teacher Human Moderation & Verification */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">4. Why Human Teachers Still Moderate AI Scores</h2>
                <p className="text-xs text-slate-400">Human-in-the-loop oversight for fair grading</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              AI is an assistant, not the sole authority. Whenever the Confidence Aggregator agent returns a confidence score below 85%, or when random quality control sampling triggers, the submission is routed to the <strong>Teacher Moderation Queue</strong>. Evaluators inspect evidence snippets, model answers, and student responses, and can submit human score overrides with mandatory comments.
            </p>
          </div>

          {/* Section 5: SHA-256 Digital Certificates & Public QR Verification */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-4 shadow-xl">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-2 bg-sky-500/20 text-sky-400 rounded-xl">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-100">5. Digital Marksheets & Public QR Verification</h2>
                <p className="text-xs text-slate-400">Cryptographically tamper-proof certificate issuance</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              After board result processing computes subject totals, CGPA, and state merit ranks, AIBOS generates digitally signed marksheets. Each document includes an ECDSA-P256 SHA-256 digital signature and a unique QR verification code. Anyone (employers, universities, government agencies) can query the <strong>Public Verification Portal</strong> (`/verify`) to confirm authenticity instantly.
            </p>
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
