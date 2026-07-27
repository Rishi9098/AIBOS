'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Compass, 
  User, 
  UserCheck, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  Database, 
  Code, 
  Bot, 
  Cpu, 
  ArrowLeft,
  CheckCircle2,
  Sparkles
} from 'lucide-react';
import PageHelpPanel from '@/components/PageHelpPanel';

export default function SystemExplorerPage() {
  const [activeTab, setActiveTab] = useState<'STUDENT' | 'TEACHER' | 'BOARD' | 'ADMIN'>('STUDENT');

  const journeyData = {
    STUDENT: {
      title: 'Candidate Student Assessment Journey',
      description: 'How a student registers, takes secure timed board exams, views LangGraph evaluation status, and downloads verified marksheets.',
      steps: [
        {
          stepNumber: 1,
          name: 'Portal Authentication & Candidate Login',
          uiPage: '/',
          apiEndpoint: 'POST /api/v1/auth/login',
          dbTables: ['users', 'candidate_profiles'],
          agents: ['AuthAgent'],
          aiModels: ['Passlib-Bcrypt'],
          nextStep: 'Candidate Student Terminal Dashboard',
        },
        {
          stepNumber: 2,
          name: 'Active & Scheduled Exam Discovery',
          uiPage: '/candidate/dashboard',
          apiEndpoint: 'GET /api/v1/exams/',
          dbTables: ['exams', 'exam_schedules'],
          agents: ['ScheduleLookupAgent'],
          aiModels: ['N/A (Database Query)'],
          nextStep: 'Interactive Exam Terminal Session',
        },
        {
          stepNumber: 3,
          name: 'Answer Script Autosave & Submissions',
          uiPage: '/exam/ex_cbse_12_2026',
          apiEndpoint: 'POST /api/v1/exams/submit',
          dbTables: ['student_submissions', 'exam_answers'],
          agents: ['ChecksumVerificationAgent'],
          aiModels: ['ECDSA-P256 Digital Signer'],
          nextStep: 'LangGraph Multi-Agent AI Evaluation',
        },
        {
          stepNumber: 4,
          name: 'Digital Marksheet & Rank Retrieval',
          uiPage: '/student/results',
          apiEndpoint: 'GET /api/v1/results/student/{id}',
          dbTables: ['student_results', 'merit_ranks'],
          agents: ['RankCalculatorAgent'],
          aiModels: ['N/A (Result Registry)'],
          nextStep: 'Public QR Code Certificate Verification',
        },
      ],
    },
    TEACHER: {
      title: 'Teacher & Evaluator Moderation Journey',
      description: 'How teachers generate zero-hallucination question papers bound to NCERT textbooks and moderate AI evaluation scores.',
      steps: [
        {
          stepNumber: 1,
          name: 'Textbook Grounded Question Builder',
          uiPage: '/teacher/builder',
          apiEndpoint: 'POST /api/v1/curriculum/questions/generate',
          dbTables: ['questions', 'knowledge_graph_nodes', 'textbooks'],
          agents: ['QuestionClassificationAgent', 'CurriculumGroundingAgent'],
          aiModels: ['Gemini-1.5-Pro', 'Text-Embedding-004'],
          nextStep: 'Immutable Textbook Reference Card Generation',
        },
        {
          stepNumber: 2,
          name: 'AI Evidence & Rubric Inspection Queue',
          uiPage: '/teacher/review',
          apiEndpoint: 'GET /api/v1/evaluation/evaluations',
          dbTables: ['evaluations', 'rubrics', 'ai_evidence'],
          agents: ['RubricAgent', 'EvidenceAgent'],
          aiModels: ['Multimodal OCR Engine'],
          nextStep: 'Teacher Score Override & Comment Submission',
        },
        {
          stepNumber: 3,
          name: 'Human Evaluator Score Override',
          uiPage: '/teacher/review',
          apiEndpoint: 'POST /api/v1/evaluation/override',
          dbTables: ['teacher_overrides', 'evaluations'],
          agents: ['ModerationAgent'],
          aiModels: ['N/A (Teacher Override Audit)'],
          nextStep: 'Board Result Processing & Grace Moderation',
        },
      ],
    },
    BOARD: {
      title: 'Board Administrator Operations Journey',
      description: 'How state education boards ingest textbooks, define exam rules, approve question papers, schedule exams, and publish results.',
      steps: [
        {
          stepNumber: 1,
          name: 'Textbook Knowledge Graph Ingestion',
          uiPage: '/admin/curriculum',
          apiEndpoint: 'POST /api/v1/curriculum/textbooks/{id}/ingest',
          dbTables: ['textbooks', 'chapter_chunks', 'knowledge_graph_nodes'],
          agents: ['OCRAgent', 'KnowledgeGraphAgent'],
          aiModels: ['Gemini-1.5-Pro', 'Text-Embedding-004'],
          nextStep: 'Exam Blueprint & Pass Policy Configuration',
        },
        {
          stepNumber: 2,
          name: 'Exam Session Creation & Scheduling',
          uiPage: '/admin/exams/new',
          apiEndpoint: 'POST /api/v1/exams/',
          dbTables: ['exams', 'exam_questions'],
          agents: ['BlueprintValidationAgent'],
          aiModels: ['N/A (Database Engine)'],
          nextStep: 'Candidate Student Assessment Session',
        },
        {
          stepNumber: 3,
          name: 'Result Processing & Grace Marks Moderation',
          uiPage: '/admin/results',
          apiEndpoint: 'POST /api/v1/results/process',
          dbTables: ['student_results', 'merit_ranks'],
          agents: ['ResultValidationAgent'],
          aiModels: ['N/A (Rank Aggregator)'],
          nextStep: 'Digital Certificate Issuance',
        },
        {
          stepNumber: 4,
          name: 'Digitally Signed Certificate Issuance',
          uiPage: '/admin/results',
          apiEndpoint: 'POST /api/v1/results/certificates/issue',
          dbTables: ['digital_certificates', 'verification_registry'],
          agents: ['CryptoSignerAgent'],
          aiModels: ['ECDSA-P256 / SHA-256'],
          nextStep: 'Public Verification Portal',
        },
      ],
    },
    ADMIN: {
      title: 'Super Admin & Infrastructure Readiness Journey',
      description: 'How system installation, Prometheus observability, AI model registries, and pilot school onboarding are managed.',
      steps: [
        {
          stepNumber: 1,
          name: 'Super Admin Installation & Credential Provisioning',
          uiPage: '/admin/credentials',
          apiEndpoint: 'POST /api/v1/auth/credentials',
          dbTables: ['users', 'roles', 'permissions'],
          agents: ['AuthProvisionerAgent'],
          aiModels: ['Bcrypt Hasher'],
          nextStep: 'Board Administrator Creation',
        },
        {
          stepNumber: 2,
          name: 'Prometheus & Liveness Health Observability',
          uiPage: '/admin/ops',
          apiEndpoint: 'GET /api/v1/ops/metrics',
          dbTables: ['ops_metrics', 'health_probes'],
          agents: ['MetricsCollectorAgent'],
          aiModels: ['Prometheus Exporter'],
          nextStep: 'LangGraph Multi-Agent Execution Inspection',
        },
        {
          stepNumber: 3,
          name: 'LangGraph 13-Agent Visual Inspector',
          uiPage: '/admin/agents',
          apiEndpoint: 'POST /api/v1/langgraph/graph/run',
          dbTables: ['langgraph_executions', 'agent_logs'],
          agents: ['MasterEvaluationDAG'],
          aiModels: ['Gemini-1.5-Pro', 'RuleBasedEvaluator'],
          nextStep: 'Production Pilot Readiness Approval',
        },
      ],
    },
  };

  const currentJourney = journeyData[activeTab];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Compass className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>AIBOS Interactive System Explorer</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full font-bold">
                  GOVERNMENT ARCHITECTURE AUDITOR
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore end-to-end user journeys mapped directly to UI pages, backend REST APIs, database tables, and AI models.
              </p>
            </div>
          </div>

          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Admin Dashboard</span>
          </Link>
        </div>

        {/* Page Help Panel */}
        <PageHelpPanel
          pageTitle="AIBOS System Explorer"
          purpose="This interactive explorer maps the complete operational journey of Candidates, Teachers, Board Administrators, and Super Administrators across UI pages, backend REST APIs, DB tables, and AI agents."
          userRole="Government Auditors, Board Officials, & Solution Architects"
          apisExecuted={['GET /api/v1/ops/metrics', 'GET /api/v1/auth/roles']}
          dbTablesUpdated={['users', 'exams', 'evaluations', 'student_results', 'ops_metrics']}
          nextStep="Click on any journey tab below to inspect specific workflow nodes and executed APIs."
          consequenceIfSkipped="Auditors would lack visual traceability mapping user actions to exact database schema tables and REST endpoints."
        />

        {/* Tab Buttons */}
        <div className="grid grid-cols-4 gap-3 bg-slate-900/80 p-2 rounded-2xl border border-slate-800 font-sans text-xs font-bold">
          <button
            onClick={() => setActiveTab('STUDENT')}
            className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'STUDENT' ? 'bg-sky-600 text-white shadow-lg shadow-sky-600/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Student Journey</span>
          </button>

          <button
            onClick={() => setActiveTab('TEACHER')}
            className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'TEACHER' ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Teacher Journey</span>
          </button>

          <button
            onClick={() => setActiveTab('BOARD')}
            className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'BOARD' ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Board Journey</span>
          </button>

          <button
            onClick={() => setActiveTab('ADMIN')}
            className={`py-3 rounded-xl transition flex items-center justify-center gap-2 ${
              activeTab === 'ADMIN' ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Super Admin Journey</span>
          </button>
        </div>

        {/* Journey Header */}
        <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-2">
          <h2 className="text-xl font-bold text-slate-100">{currentJourney.title}</h2>
          <p className="text-xs text-slate-400 leading-relaxed">{currentJourney.description}</p>
        </div>

        {/* Step Breakdown Cards */}
        <div className="space-y-6">
          {currentJourney.steps.map((step) => (
            <div key={step.stepNumber} className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 rounded-3xl p-6 space-y-4 shadow-xl transition">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center font-bold font-mono text-sm">
                    #{step.stepNumber}
                  </div>
                  <h3 className="text-base font-bold text-slate-100">{step.name}</h3>
                </div>
                <Link href={step.uiPage} className="text-xs font-mono text-sky-400 hover:underline">
                  Open Page ({step.uiPage}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Code className="w-3 h-3 text-purple-400" />
                    <span>BACKEND API ENDPOINT</span>
                  </div>
                  <div className="text-purple-300 font-bold">{step.apiEndpoint}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Database className="w-3 h-3 text-amber-400" />
                    <span>DATABASE TABLES</span>
                  </div>
                  <div className="text-amber-300 font-bold">{step.dbTables.join(', ')}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Bot className="w-3 h-3 text-emerald-400" />
                    <span>LANGGRAPH AGENTS</span>
                  </div>
                  <div className="text-emerald-300 font-bold">{step.agents.join(', ')}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                  <div className="text-slate-500 text-[10px] flex items-center gap-1">
                    <Cpu className="w-3 h-3 text-sky-400" />
                    <span>AI MODELS / UTILS</span>
                  </div>
                  <div className="text-sky-300 font-bold">{step.aiModels.join(', ')}</div>
                </div>
              </div>

              <div className="text-xs text-slate-400 font-sans flex items-center gap-2 pt-2 border-t border-slate-800">
                <ArrowRight className="w-4 h-4 text-sky-400" />
                <span>Next Workflow Step: <strong className="text-slate-200">{step.nextStep}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
