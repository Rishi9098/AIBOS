'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  GitBranch, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  User, 
  Activity, 
  Database, 
  Code, 
  Lock, 
  ArrowLeft 
} from 'lucide-react';
import PageHelpPanel from '@/components/PageHelpPanel';

export default function RoleHierarchyAdminPage() {
  const [selectedRole, setSelectedRole] = useState<'SUPER_ADMIN' | 'BOARD_ADMIN' | 'SCHOOL' | 'TEACHER' | 'EVALUATOR' | 'STUDENT'>('SUPER_ADMIN');

  const roleDetails = {
    SUPER_ADMIN: {
      title: 'Super Administrator',
      scope: 'Global System Infrastructure & Security Governance',
      responsibilities: [
        'Root system installation and master configuration',
        'Board Administrator creation and master credential provisioning',
        'Prometheus metrics, liveness health probes, and OIDC auth provider management',
        'Global feature flag toggles and LLM model registry maintenance'
      ],
      permissions: ['ALL_PERMISSIONS', 'MANAGE_BOARDS', 'MANAGE_CREDENTIALS', 'OPS_OVERRIDE'],
      accessibleModules: ['/admin/credentials', '/admin/ops', '/admin/agents', '/admin/dashboard'],
      apisUsed: ['POST /api/v1/auth/credentials', 'GET /api/v1/ops/metrics', 'POST /api/v1/ops/feature-flags'],
      dbTables: ['users', 'roles', 'permissions', 'ops_metrics', 'ai_model_registry', 'audit_logs']
    },
    BOARD_ADMIN: {
      title: 'Board Administrator',
      scope: 'State Education Board Examination Lifecycle Management',
      responsibilities: [
        'Textbook library upload, OCR chunking, and Knowledge Graph ingestion',
        'Blueprint rules policy configuration and question paper approvals',
        'Exam session scheduling, candidate assignment, and center allocations',
        'Board-wide result processing, grace marks moderation, and certificate signing'
      ],
      permissions: ['MANAGE_CURRICULUM', 'MANAGE_BLUEPRINTS', 'MANAGE_EXAMS', 'PROCESS_RESULTS'],
      accessibleModules: ['/admin/curriculum', '/admin/blueprints', '/admin/exams/new', '/admin/results'],
      apisUsed: ['POST /api/v1/curriculum/textbooks/upload', 'POST /api/v1/exams/', 'POST /api/v1/results/process'],
      dbTables: ['textbooks', 'knowledge_graph_nodes', 'blueprints', 'exams', 'student_results']
    },
    SCHOOL: {
      title: 'School Administrator / Principal',
      scope: 'Institutional Center & Student Roster Onboarding',
      responsibilities: [
        'School candidate roster bulk imports',
        'Exam center infrastructure verification',
        'Distributing student roll numbers and candidate login credentials',
        'Downloading institutional grade marksheets and school merit rank lists'
      ],
      permissions: ['READ_SCHOOL_ROSTER', 'IMPORT_STUDENTS', 'VIEW_SCHOOL_RESULTS'],
      accessibleModules: ['/admin/credentials', '/student/results'],
      apisUsed: ['POST /api/v1/auth/credentials', 'GET /api/v1/results/student/{id}'],
      dbTables: ['schools', 'candidate_profiles', 'student_results']
    },
    TEACHER: {
      title: 'Teacher / Paper Setter',
      scope: 'Textbook Reference Grounded Question Generation',
      responsibilities: [
        'Querying textbook vector nodes for zero-hallucination question drafting',
        'Generating 100% textbook reference traceability cards',
        'Reviewing model answer rubrics and difficulty distributions',
        'Submitting question papers for board official approval'
      ],
      permissions: ['GENERATE_QUESTIONS', 'VIEW_TRACEABILITY_CARDS', 'DRAFT_EXAMS'],
      accessibleModules: ['/teacher/builder', '/teacher/dashboard'],
      apisUsed: ['POST /api/v1/curriculum/questions/generate', 'GET /curriculum/questions/traceability/{id}'],
      dbTables: ['questions', 'knowledge_graph_nodes', 'textbooks']
    },
    EVALUATOR: {
      title: 'Evaluator / Moderation Official',
      scope: 'LangGraph AI Evaluation Audit & Human Score Overrides',
      responsibilities: [
        'Inspecting multi-agent evaluation evidence snippets and rubrics',
        'Auditing low-confidence candidate answer scores',
        'Submitting human score overrides with mandatory comments',
        'Escalating candidate anomalies to the board review panel'
      ],
      permissions: ['VIEW_EVALUATION_QUEUE', 'OVERRIDE_EVALUATION_SCORE', 'SUBMIT_COMMENTS'],
      accessibleModules: ['/teacher/review', '/teacher/dashboard'],
      apisUsed: ['GET /api/v1/evaluation/evaluations', 'POST /api/v1/evaluation/override'],
      dbTables: ['evaluations', 'teacher_overrides', 'ai_evidence', 'rubrics']
    },
    STUDENT: {
      title: 'Candidate Student',
      scope: 'Secure Board Examination Delivery & Digital Certificate Access',
      responsibilities: [
        'Authenticating into timed candidate assessment terminal sessions',
        'Answering theoretical, mathematical (LaTeX), and diagram questions',
        'Autosaving answer scripts with ECDSA-P256 SHA-256 cryptographic signatures',
        'Viewing official digital marksheets and sharing QR verification links'
      ],
      permissions: ['TAKE_EXAM', 'SUBMIT_ANSWERS', 'VIEW_OWN_RESULT'],
      accessibleModules: ['/candidate/dashboard', '/exam/[id]', '/student/results', '/verify'],
      apisUsed: ['GET /api/v1/exams/', 'POST /api/v1/exams/submit', 'GET /api/v1/results/verify/{code}'],
      dbTables: ['student_submissions', 'exam_answers', 'student_results', 'digital_certificates']
    }
  };

  const currentRole = roleDetails[selectedRole];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <GitBranch className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>Role Relationship & Governance Permissions Matrix</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 rounded-full font-bold">
                  RBAC AUDIT MATRIX
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Explore hierarchical relationships, RBAC permission assignments, accessible modules, and DB schema tables for all 6 roles.
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
          pageTitle="Role Relationship & Governance Matrix"
          purpose="This page visualizes the operational hierarchy tree and Role-Based Access Control (RBAC) boundaries across Super Admins, Board Admins, Schools, Teachers, Evaluators, and Students."
          userRole="Government Auditors, System Administrators, & Security Personnel"
          apisExecuted={['GET /api/v1/auth/roles', 'GET /api/v1/auth/permissions']}
          dbTablesUpdated={['roles', 'permissions', 'user_roles']}
          nextStep="Configure specific user credentials using the Credential Generation Console."
          consequenceIfSkipped="Roles could be misconfigured, leading to unauthorized access across administrative modules."
        />

        {/* Hierarchy Diagram Selector Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {(['SUPER_ADMIN', 'BOARD_ADMIN', 'SCHOOL', 'TEACHER', 'EVALUATOR', 'STUDENT'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`p-4 rounded-2xl border text-xs font-bold font-mono transition text-center ${
                selectedRole === r
                  ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900/90 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Selected Role Detail Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">{currentRole.title}</h2>
              <p className="text-xs text-indigo-400 font-mono mt-0.5">Governance Scope: {currentRole.scope}</p>
            </div>
            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 font-mono text-xs font-bold rounded-full border border-indigo-500/40">
              {selectedRole}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
            {/* Responsibilities */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Primary Governance Responsibilities</h3>
              <ul className="space-y-2">
                {currentRole.responsibilities.map((resp, i) => (
                  <li key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-slate-300 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                    <span>{resp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Permissions */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Granted RBAC Security Permissions</h3>
              <div className="flex flex-wrap gap-2">
                {currentRole.permissions.map((perm, i) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-xl font-mono text-xs font-bold">
                    {perm}
                  </span>
                ))}
              </div>

              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider pt-2">Accessible Frontend Modules</h3>
              <div className="flex flex-wrap gap-2">
                {currentRole.accessibleModules.map((mod, i) => (
                  <Link key={i} href={mod} className="px-3 py-1.5 bg-sky-500/10 text-sky-400 hover:underline border border-sky-500/30 rounded-xl font-mono text-xs font-bold">
                    {mod}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Technical Implementation Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono pt-4 border-t border-slate-800">
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-purple-400 font-bold flex items-center gap-1.5">
                <Code className="w-4 h-4" />
                <span>Backend REST APIs Executed</span>
              </div>
              <ul className="list-disc list-inside text-slate-300 space-y-1">
                {currentRole.apisUsed.map((api, i) => (
                  <li key={i}>{api}</li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <div className="text-amber-400 font-bold flex items-center gap-1.5">
                <Database className="w-4 h-4" />
                <span>Affected Database Schema Tables</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {currentRole.dbTables.map((tbl, i) => (
                  <span key={i} className="px-2 py-1 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 text-[11px]">
                    {tbl}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
