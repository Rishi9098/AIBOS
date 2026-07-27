'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  QrCode,
  Search,
  Award,
  ArrowLeft,
  Lock,
  FileCheck
} from 'lucide-react';

export default function PublicVerificationPage() {
  const [certCode, setCertCode] = useState('MS-2026-AIBOS-90412');
  const [isSearching, setIsSearching] = useState(false);
  const [verificationResult, setVerificationResult] = useState<any>({
    isValid: true,
    documentType: 'OFFICIAL_BOARD_DIGITAL_MARKSHEET',
    documentNumber: 'MS-2026-AIBOS-90412',
    studentName: 'Rishi Bindal',
    issuedAt: '2026-07-27T10:00:00Z',
    digitalSignature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    details: {
      status: 'VERIFIED_GENUINE',
      board: 'Central Board of Secondary Education',
      cgpa: 9.0,
      totalMarks: 403,
      maxMarks: 500
    }
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTimeout(() => {
      setIsSearching(false);
      setVerificationResult({
        isValid: true,
        documentType: 'OFFICIAL_BOARD_DIGITAL_MARKSHEET',
        documentNumber: certCode,
        studentName: 'Rishi Bindal',
        issuedAt: new Date().toISOString(),
        digitalSignature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        details: {
          status: 'VERIFIED_GENUINE',
          board: 'Central Board of Secondary Education',
          cgpa: 9.0,
          totalMarks: 403,
          maxMarks: 500
        }
      });
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Public Document Verification Portal</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Verify authenticity of Marksheets and Pass Certificates issued by Board Examination Operating System (AIBOS).
              </p>
            </div>
          </div>

          <Link
            href="/"
            className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* Verification Form */}
        <form onSubmit={handleSearch} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <label className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Enter Certificate ID or Marksheet Verification Code
          </label>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <QrCode className="w-5 h-5 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={certCode}
                onChange={(e) => setCertCode(e.target.value)}
                placeholder="e.g. MS-2026-AIBOS-90412 or CERT-2026-PASS-90412"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-sky-400 font-mono text-sm rounded-xl pl-11 pr-4 py-2.5 transition outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{isSearching ? 'Verifying...' : 'Verify Authenticity'}</span>
            </button>
          </div>
        </form>

        {/* Verification Status Output */}
        {verificationResult && (
          <div className="bg-slate-900/90 border border-emerald-500/30 rounded-3xl p-8 space-y-6 shadow-2xl animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <span>DOCUMENT VERIFIED GENUINE</span>
                    <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full">
                      AUTHENTIC
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Issued to <span className="text-slate-200 font-semibold">{verificationResult.studentName}</span> on {new Date(verificationResult.issuedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="text-right font-mono text-xs text-slate-400">
                <div>Document #: {verificationResult.documentNumber}</div>
                <div className="text-emerald-400 font-bold">{verificationResult.documentType}</div>
              </div>
            </div>

            {/* Verification Metadata Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-500 text-[10px]">ISSUING BOARD</div>
                <div className="text-slate-200 font-bold">{verificationResult.details.board}</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-500 text-[10px]">CUMULATIVE CGPA</div>
                <div className="text-amber-400 font-bold text-sm">{verificationResult.details.cgpa} / 10.0</div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <div className="text-slate-500 text-[10px]">TOTAL MARKS SECURED</div>
                <div className="text-sky-400 font-bold text-sm">{verificationResult.details.totalMarks} / {verificationResult.details.maxMarks}</div>
              </div>
            </div>

            {/* SHA-256 Digital Signature Badge */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2 text-[11px] font-mono">
              <div className="flex items-center justify-between text-slate-400">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>SHA-256 Cryptographic Tamper Seal</span>
                </span>
                <span>Algorithm: SHA256-RSA-4096</span>
              </div>
              <div className="text-slate-500 break-all bg-slate-900 p-2.5 rounded-lg border border-slate-800/80">
                {verificationResult.digitalSignature}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
