'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Award,
  CheckCircle2,
  Download,
  QrCode,
  ShieldCheck,
  FileSpreadsheet,
  Star,
  ExternalLink,
  BookOpen,
  ArrowLeft
} from 'lucide-react';

export default function StudentResultsPage() {
  const [resultData, setResultData] = useState({
    candidateName: 'Rishi Bindal',
    rollNumber: 'CBSE-2026-90412',
    schoolName: 'Delhi Public School, R.K. Puram',
    boardName: 'Central Board of Secondary Education',
    academicYear: '2025-2026',
    percentage: 88.5,
    cgpa: 9.0,
    grade: 'A2',
    division: 'FIRST DIVISION WITH DISTINCTION',
    passStatus: 'PASS',
    stateRank: 1,
    districtRank: 1,
    schoolRank: 1,
    marksheetNumber: 'MS-2026-AIBOS-90412',
    digitalSignature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    subjects: [
      { code: '042', name: 'Physics', theory: 49, practical: 21, total: 70, max: 100, grade: 'B1' },
      { code: '041', name: 'Mathematics', theory: 56, practical: 24, total: 80, max: 100, grade: 'A2' },
      { code: '043', name: 'Chemistry', theory: 52, practical: 23, total: 75, max: 100, grade: 'A2' },
      { code: '301', name: 'English Core', theory: 62, practical: 26, total: 88, max: 100, grade: 'A1' },
      { code: '083', name: 'Computer Science', theory: 68, practical: 27, total: 95, max: 100, grade: 'A1' }
    ]
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>Official Digital Grade Card & Marksheet</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full">
                  VERIFIED
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {resultData.boardName} • Academic Session {resultData.academicYear}
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Main Portal</span>
          </Link>
        </div>

        {/* Overview Result Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">Result Status</div>
            <div className="text-2xl font-bold text-emerald-400 font-mono flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6" />
              <span>{resultData.passStatus}</span>
            </div>
            <div className="text-[11px] text-slate-500">{resultData.division}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">Cumulative Percentage</div>
            <div className="text-2xl font-bold text-sky-400 font-mono">{resultData.percentage}%</div>
            <div className="text-[11px] text-slate-500">Overall Grade: {resultData.grade}</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">Cumulative CGPA</div>
            <div className="text-2xl font-bold text-amber-400 font-mono">{resultData.cgpa} / 10.0</div>
            <div className="text-[11px] text-slate-500">10-Point Scale</div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-2">
            <div className="text-xs text-slate-400 font-medium">State Rank</div>
            <div className="text-2xl font-bold text-purple-400 font-mono flex items-center gap-1.5">
              <Star className="w-5 h-5 text-purple-400 fill-purple-400/20" />
              <span>Rank #{resultData.stateRank}</span>
            </div>
            <div className="text-[11px] text-slate-500">State Topper Merit List</div>
          </div>
        </div>

        {/* Digital Marksheet Table Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-100">{resultData.candidateName}</h2>
              <p className="text-xs text-slate-400 font-mono">
                Roll No: <span className="text-sky-400">{resultData.rollNumber}</span> • School: <span className="text-slate-300">{resultData.schoolName}</span>
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/verify?code=${resultData.marksheetNumber}`}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-sky-400 border border-sky-500/30 text-xs font-semibold rounded-xl transition flex items-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                <span>Verify QR Signature</span>
              </Link>

              <button
                type="button"
                onClick={() => alert("Downloading Cryptographically Signed PDF Marksheet...")}
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Signed PDF</span>
              </button>
            </div>
          </div>

          {/* Subject Breakdown Table */}
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                  <th className="p-3">Code</th>
                  <th className="p-3">Subject Name</th>
                  <th className="p-3">Theory</th>
                  <th className="p-3">Practical / IA</th>
                  <th className="p-3">Total Marks</th>
                  <th className="p-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {resultData.subjects.map((sub) => (
                  <tr key={sub.code} className="border-t border-slate-800/60 font-sans hover:bg-slate-950/50">
                    <td className="p-3 font-mono text-sky-400">{sub.code}</td>
                    <td className="p-3 font-semibold text-slate-200">{sub.name}</td>
                    <td className="p-3 font-mono text-slate-300">{sub.theory}</td>
                    <td className="p-3 font-mono text-slate-300">{sub.practical}</td>
                    <td className="p-3 font-mono font-bold text-emerald-400">{sub.total} / {sub.max}</td>
                    <td className="p-3 font-mono font-bold text-amber-400">{sub.grade}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Cryptographic Verification Footer */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-[11px] font-mono">
            <div className="flex items-center justify-between text-slate-400">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>Digital Marksheet Authentication Token</span>
              </span>
              <span>No: {resultData.marksheetNumber}</span>
            </div>
            <div className="text-slate-500 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
              SHA-256 Signature: {resultData.digitalSignature}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
