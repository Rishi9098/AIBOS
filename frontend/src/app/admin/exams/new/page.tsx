'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, BookOpen, Clock, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';

export default function CreateExamPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('Physics');
  const [totalMarks, setTotalMarks] = useState(70);
  const [durationMinutes, setDurationMinutes] = useState(180);
  const [startTime, setStartTime] = useState('2026-07-27T10:00:00Z');
  const [endTime, setEndTime] = useState('2026-07-27T13:00:00Z');
  
  const [questionId, setQuestionId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) {
      setError('Please provide an exam title.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      // If questionId is not specified, auto-generate a traceable question paper first
      let targetQId = questionId;
      if (!targetQId) {
        const qRes = await api.post('/curriculum/questions/generate', {
          board_code: 'CBSE-GOVT-2027-LIVE',
          class_level: '12',
          subject: subject,
          chapter_title: 'Electric Charges and Fields'
        });
        targetQId = qRes.question_id;
      }

      const examPayload = {
        title,
        subject,
        total_marks: totalMarks,
        duration_minutes: durationMinutes,
        start_time: startTime,
        end_time: endTime,
        blueprint_config: { mode: 'PRODUCTION' },
        questions: [
          {
            question_id: targetQId,
            question_order: 1,
            allocated_marks: 5,
            section_name: 'Section A'
          }
        ]
      };

      const res = await api.post('/exams/', examPayload);
      setSuccessMsg(`Exam Created Successfully! Exam ID: ${res.id}`);
      setTimeout(() => router.push('/admin/dashboard'), 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to create exam session');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Plus className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-100">Schedule New Examination Session</h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Create and publish an official board examination session backed by backend database persistence.
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

        {successMsg && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-emerald-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleCreateExam} className="bg-slate-900/90 border border-slate-800 rounded-3xl p-8 space-y-6 shadow-2xl">
          <div className="space-y-4 text-xs">
            <div>
              <label className="text-slate-300 font-medium block mb-1">Examination Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. CBSE Senior Secondary Class 12 Physics Board Examination 2026-27"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 font-semibold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Subject</label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-amber-400 font-bold"
                >
                  <option value="Physics">Physics</option>
                  <option value="Mathematics">Mathematics</option>
                  <option value="Chemistry">Chemistry</option>
                  <option value="Biology">Biology</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Total Marks</label>
                <input
                  type="number"
                  value={totalMarks}
                  onChange={(e) => setTotalMarks(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sky-400 font-mono font-bold"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-emerald-400 font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Start Time (UTC)</label>
                <input
                  type="text"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono text-[11px]"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">End Time (UTC)</label>
                <input
                  type="text"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-300 font-mono text-[11px]"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{isLoading ? 'Creating Examination Session...' : 'Publish Official Examination Session'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
