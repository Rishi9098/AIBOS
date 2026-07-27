'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  FileSpreadsheet,
  Save,
  Scale,
  Sparkles,
  ShieldCheck,
  Send,
  Building2,
  Users,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function AdminResultsPage() {
  const [examId, setExamId] = useState('ex_cbse_12_2026');
  const [graceMarks, setGraceMarks] = useState<number>(3.0);
  const [studentId, setStudentId] = useState('student_fresh_2027_live');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleProcessResults = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setError(null);
    setStatusMsg('Step 1/2: Running Board Result Processing & Merit Ranks Computation...');

    try {
      const res = await api.post(`/results/process?exam_id=${examId}&grace_marks=${graceMarks}`, {});
      setStatusMsg(`Board Results Processed Successfully! Processed Candidates: ${res.candidates_processed || 1}, Merit Ranks Computed.`);
    } catch (err: any) {
      setError(err.message || 'Failed to process board results');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleIssueCertificates = async () => {
    setIsProcessing(true);
    setError(null);
    setStatusMsg('Step 2/2: Issuing SHA-256 Digitally Signed Marksheet & Certificates...');

    try {
      const certRes = await api.post(`/results/certificates/issue?student_id=${studentId}&exam_id=${examId}`, {});
      setStatusMsg(`Certificate Issued Successfully! Marksheet #: ${certRes.marksheet_number}, Signature: ${certRes.digital_signature?.slice(0, 16)}...`);
    } catch (err: any) {
      setError(err.message || 'Failed to issue digital certificates');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>Board Result Processing & Certification Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                  PRODUCTION INTEGRATED
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Process subject marks, apply grace marks moderation, generate signed digital certificates, and publish board-wide results.
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

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {statusMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs font-mono flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Result Moderation Form */}
          <form onSubmit={handleProcessResults} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Scale className="w-4 h-4" />
              <span>Result Moderation & Pass Policy</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Target Examination ID</label>
                <input
                  type="text"
                  value={examId}
                  onChange={(e) => setExamId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sky-400 font-mono"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 font-medium block mb-1">Grace Marks Limit</label>
                <input
                  type="number"
                  step="0.5"
                  value={graceMarks}
                  onChange={(e) => setGraceMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-amber-400 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Board Results...' : 'Run Result Processing & Compute Merit Ranks'}</span>
            </button>
          </form>

          {/* Certificate Issuance Controls */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Digital Certificate Issuance</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-slate-400 font-medium block mb-1">Student User ID</label>
                <input
                  type="text"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200 font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleIssueCertificates}
              disabled={isProcessing}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Issue SHA-256 Signed Marksheet & Certificates</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
