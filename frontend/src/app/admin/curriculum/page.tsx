'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  GitBranch,
  Upload,
  CheckCircle2,
  FileText,
  Search,
  Sparkles,
  Layers,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';

export default function CurriculumAdminPage() {
  const [selectedBoard, setSelectedBoard] = useState('CBSE');
  const [selectedClass, setSelectedClass] = useState('12');
  const [selectedSubject, setSelectedSubject] = useState('Physics');

  const [textbooks, setTextbooks] = useState([
    { id: 'tb_01', title: 'NCERT Class 12 Physics Part I', publisher: 'NCERT', edition: '2025-26 Edition', chapters: 8, status: 'OFFICIALLY_APPROVED', notif: 'NOTIF-2026-NCERT-001' },
    { id: 'tb_02', title: 'NCERT Class 12 Physics Part II', publisher: 'NCERT', edition: '2025-26 Edition', chapters: 7, status: 'OFFICIALLY_APPROVED', notif: 'NOTIF-2026-NCERT-002' }
  ]);

  const [knowledgeGraphNodes, setKnowledgeGraphNodes] = useState([
    { id: 'KB-CBSE-12-PHY-CH01-T01', type: 'TOPIC', title: 'Electric Charge & Coulomb Law', page: 12, bloom: 'APPLY' },
    { id: 'KB-CBSE-12-PHY-CH01-C01', type: 'CONCEPT', title: 'Permittivity of Free Space (eps_0)', page: 14, bloom: 'UNDERSTAND' },
    { id: 'KB-CBSE-12-PHY-CH01-LO1', type: 'LEARNING_OUTCOME', title: 'LO-CBSE-PHY-12-01: Derivation of Coulomb Force', page: 15, bloom: 'APPLY' }
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-teal-500/10 border border-teal-500/20 text-teal-400">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
                <span>Curriculum Intelligence & Textbook Knowledge Console</span>
                <span className="px-2.5 py-0.5 text-xs font-mono bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-full">
                  MILESTONE 9
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage official textbook libraries, automated Knowledge Graph construction, and zero-external-knowledge curriculum guards.
              </p>
            </div>
          </div>

          <Link
            href="/admin"
            className="px-4 py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
          >
            ← Admin Console
          </Link>
        </div>

        {/* Board Selection Controls */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <div>
              <label className="text-slate-500 font-medium block text-[11px] mb-1">Target Board</label>
              <select
                value={selectedBoard}
                onChange={(e) => setSelectedBoard(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-teal-400 font-mono font-bold"
              >
                <option value="CBSE">CBSE (Central Board)</option>
                <option value="ICSE">ICSE / CISCE</option>
                <option value="STATE_UP">UP State Board</option>
                <option value="MAHARASHTRA">Maharashtra State Board</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block text-[11px] mb-1">Class Level</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sky-400 font-mono font-bold"
              >
                <option value="12">Class 12th</option>
                <option value="10">Class 10th</option>
              </select>
            </div>

            <div>
              <label className="text-slate-500 font-medium block text-[11px] mb-1">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-amber-400 font-mono font-bold"
              >
                <option value="Physics">Physics (042)</option>
                <option value="Mathematics">Mathematics (041)</option>
                <option value="Chemistry">Chemistry (043)</option>
                <option value="Biology">Biology (044)</option>
              </select>
            </div>
          </div>

          <button
            type="button"
            onClick={() => alert("Uploading new official NCERT Textbook PDF...")}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Official Textbook PDF</span>
          </button>
        </div>

        {/* Textbook Library & Knowledge Graph Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Official Textbook Library (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>Official Textbook Library</span>
            </h3>

            <div className="space-y-4">
              {textbooks.map((tb) => (
                <div key={tb.id} className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-100">{tb.title}</h4>
                    <span className="px-2.5 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                      {tb.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400">
                    <div>Publisher: <span className="text-slate-200">{tb.publisher}</span></div>
                    <div>Edition: <span className="text-slate-200">{tb.edition}</span></div>
                    <div>Notification #: <span className="text-sky-400">{tb.notif}</span></div>
                    <div>Total Chapters: <span className="text-amber-400">{tb.chapters}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Knowledge Graph Hierarchy (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              <span>Curriculum Knowledge Graph Explorer</span>
            </h3>

            <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl space-y-3 shadow-xl">
              {knowledgeGraphNodes.map((node) => (
                <div key={node.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-1.5 font-mono text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-teal-400 font-bold">{node.id}</span>
                    <span className="px-2 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 text-[10px] rounded">
                      {node.type}
                    </span>
                  </div>

                  <div className="text-slate-200 font-sans font-semibold text-sm">{node.title}</div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Page Ref: <span className="text-sky-400">Page {node.page}</span></span>
                    <span>Bloom Taxonomy: <span className="text-amber-400">{node.bloom}</span></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
