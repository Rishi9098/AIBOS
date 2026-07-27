'use client';

import React, { useState, useEffect } from 'react';
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
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { api } from '@/lib/api';

export default function CurriculumAdminPage() {
  const [selectedBoard, setSelectedBoard] = useState('CBSE-GOVT-2027-LIVE');
  const [selectedClass, setSelectedClass] = useState('12');
  const [selectedSubject, setSelectedSubject] = useState('Physics');

  const [textbookTitle, setTextbookTitle] = useState('NCERT Class 12 Physics Official Textbook');
  const [publisher, setPublisher] = useState('NCERT Official');
  const [edition, setEdition] = useState('2026-27 Government Edition');

  const [textbooks, setTextbooks] = useState<any[]>([]);
  const [knowledgeNodes, setKnowledgeNodes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const fetchKnowledgeGraph = async () => {
    try {
      const data = await api.get(`/curriculum/graph/${selectedSubject}`);
      setKnowledgeNodes(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error('Failed to load Knowledge Graph:', e);
    }
  };

  useEffect(() => {
    fetchKnowledgeGraph();
  }, [selectedSubject]);

  const handleUploadAndIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setStatusMsg('Step 1/2: Registering Official Textbook with Board Curriculum...');

    try {
      // 1. Upload textbook
      const tbRes = await api.post('/curriculum/textbooks/upload', {
        board_code: selectedBoard,
        class_level: selectedClass,
        subject: selectedSubject,
        title: textbookTitle,
        publisher: publisher,
        edition: edition
      });

      setStatusMsg('Step 2/2: Ingesting Chapter Chunks, OCR, and Knowledge Graph Nodes...');

      // 2. Trigger automated ingestion
      const ingestRes = await api.post(`/curriculum/textbooks/${tbRes.id}/ingest`, {});
      
      setTextbooks((prev) => [tbRes, ...prev]);
      setStatusMsg(`Ingestion Completed! Chunks Embedded: ${ingestRes.chunks_embedded}, Knowledge Nodes: ${ingestRes.knowledge_nodes_created}`);

      await fetchKnowledgeGraph();
    } catch (err: any) {
      setStatusMsg(`Ingestion Failure: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

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
                  PRODUCTION INTEGRATED
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Manage official textbook libraries, automated Knowledge Graph construction, and zero-external-knowledge curriculum guards.
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

        {/* Upload & Ingestion Form */}
        <form onSubmit={handleUploadAndIngest} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-bold text-teal-400 uppercase tracking-wider flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Upload & Ingest Official Textbook PDF</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="text-slate-400 font-medium block mb-1">Textbook Title</label>
              <input
                type="text"
                value={textbookTitle}
                onChange={(e) => setTextbookTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Publisher</label>
              <input
                type="text"
                value={publisher}
                onChange={(e) => setPublisher(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                required
              />
            </div>

            <div>
              <label className="text-slate-400 font-medium block mb-1">Edition</label>
              <input
                type="text"
                value={edition}
                onChange={(e) => setEdition(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-200"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition shadow-lg shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Ingesting PDF into Knowledge Graph...' : 'Ingest Textbook into Vector Knowledge Graph'}</span>
          </button>

          {statusMsg && (
            <div className="p-3 bg-slate-950 border border-teal-500/30 rounded-xl text-teal-400 font-mono text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}
        </form>

        {/* Live Knowledge Graph Hierarchy Display */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-sky-400 uppercase tracking-wider flex items-center gap-2">
            <GitBranch className="w-4 h-4" />
            <span>Live Knowledge Graph Hierarchy Nodes</span>
          </h3>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-3">
            {knowledgeNodes.map((node) => (
              <div key={node.knowledge_id || node.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between font-mono text-xs">
                <div className="space-y-1">
                  <div className="text-sky-400 font-bold flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-sky-500/20 text-sky-400 rounded-full text-[10px]">{node.node_type}</span>
                    <span>{node.title}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">Knowledge ID: {node.knowledge_id || node.id} • Page Ref: {node.page_reference || 12}</div>
                </div>

                <span className="px-2.5 py-1 bg-amber-500/20 text-amber-400 rounded-lg text-[11px] font-bold">
                  Bloom: {node.bloom_taxonomy_level || node.bloom}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
