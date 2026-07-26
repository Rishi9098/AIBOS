'use client';

import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  ShieldCheck, 
  Save, 
  Send, 
  Bookmark, 
  FileText, 
  Sigma, 
  Paintbrush, 
  AlertTriangle,
  CheckCircle2,
  Eye,
  Lock,
  Copy,
  ArrowRight,
  Sparkles,
  Check,
  Wifi,
  WifiOff,
  RefreshCw
} from 'lucide-react';
import { QuestionNav } from './QuestionNav';
import { MathEditor } from './MathEditor';
import { DiagramCanvas } from './DiagramCanvas';
import { ExamLockdownGuard } from './ExamLockdownGuard';
import { examStorage } from '@/lib/examStorage';
import { encryptAnswerPayload } from '@/lib/crypto';

interface Question {
  id: string;
  question_order: number;
  allocated_marks: number;
  section_name?: string;
  question: {
    id: string;
    subject: string;
    chapter: string;
    bloom_level: string;
    question_type: string;
    question_text: string;
  };
}

interface ExamData {
  id: string;
  title: string;
  subject: string;
  total_marks: number;
  duration_minutes: number;
  exam_questions: Question[];
}

export interface SubmissionReceipt {
  submission_id: string;
  exam_id: string;
  student_id: string;
  status: string;
  submitted_at: string;
  hash_chain_checksum: string;
  digital_signature: string;
  total_answered: number;
}

interface ExamTerminalProps {
  exam: ExamData;
  studentName?: string;
  rollNumber?: string;
  onSubmit: (answers: Record<string, any>, encryptedPayload?: any) => Promise<SubmissionReceipt | null>;
}

export const ExamTerminal: React.FC<ExamTerminalProps> = ({
  exam,
  studentName = "Rishi Bindal",
  rollNumber = "CBSE-2026-90412",
  onSubmit
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [reviewFlags, setReviewFlags] = useState<Record<string, boolean>>({});
  const [visitedMap, setVisitedMap] = useState<Record<string, boolean>>({});
  const [skippedMap, setSkippedMap] = useState<Record<string, boolean>>({});
  const [activeTab, setActiveTab] = useState<'text' | 'math' | 'diagram'>('text');
  const [secondsRemaining, setSecondsRemaining] = useState(exam.duration_minutes * 60);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'offline'>('saved');
  const [isOnline, setIsOnline] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  const currentQ = exam.exam_questions[currentIdx];

  // 1. Crash/Recovery Engine: Load session state from IndexedDB on mount
  useEffect(() => {
    async function recoverSession() {
      try {
        const cachedState = await examStorage.getSessionState(exam.id);
        if (cachedState) {
          if (cachedState.answers) setAnswers(cachedState.answers);
          if (cachedState.reviewFlags) setReviewFlags(cachedState.reviewFlags);
          if (cachedState.visitedMap) setVisitedMap(cachedState.visitedMap);
          if (cachedState.skippedMap) setSkippedMap(cachedState.skippedMap);
          if (cachedState.secondsRemaining) setSecondsRemaining(cachedState.secondsRemaining);
          if (cachedState.currentIdx !== undefined) setCurrentIdx(cachedState.currentIdx);
        }
      } catch (err) {
        console.warn("IndexedDB recovery error:", err);
      }
    }
    recoverSession();
  }, [exam.id]);

  // 2. Online/Offline Network Monitor
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. Mark current question as visited
  useEffect(() => {
    if (!currentQ) return;
    setVisitedMap((prev) => ({ ...prev, [currentQ.id]: true }));
  }, [currentIdx, currentQ]);

  // 4. Timer Countdown & Auto Submit on Expiration
  useEffect(() => {
    if (receipt) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [answers, receipt]);

  // 5. Periodic Session Auto-Save to IndexedDB & Server
  useEffect(() => {
    if (receipt) return;
    const autoSaveInterval = setInterval(async () => {
      try {
        await examStorage.saveSessionState(exam.id, {
          answers,
          reviewFlags,
          visitedMap,
          skippedMap,
          secondsRemaining,
          currentIdx
        });
      } catch (e) {
        console.error("Auto save error:", e);
      }
    }, 3000);
    return () => clearInterval(autoSaveInterval);
  }, [exam.id, answers, reviewFlags, visitedMap, skippedMap, secondsRemaining, currentIdx, receipt]);

  const formatTime = (secs: number) => {
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${hrs > 0 ? hrs + ':' : ''}${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleAnswerChange = (field: 'text' | 'math' | 'diagram', val: any) => {
    setSaveStatus('saving');
    const existing = answers[currentQ.id] || {};
    const updatedAnswer = { ...existing, [field]: val };
    const updatedAnswers = { ...answers, [currentQ.id]: updatedAnswer };
    setAnswers(updatedAnswers);

    // If text/math/diagram is cleared, update skipped map
    const hasValue = Object.values(updatedAnswer).some(v => !!v);
    setSkippedMap((prev) => ({ ...prev, [currentQ.id]: !hasValue }));

    // IndexedDB offline queueing if offline
    if (!isOnline) {
      examStorage.addOfflineSyncItem(currentQ.id, updatedAnswer);
      setSaveStatus('offline');
    } else {
      setTimeout(() => {
        setSaveStatus('saved');
      }, 400);
    }
  };

  const toggleReviewFlag = () => {
    setReviewFlags((prev) => ({
      ...prev,
      [currentQ.id]: !prev[currentQ.id]
    }));
  };

  const handleLockdownViolation = (eventType: string, details: any) => {
    if (eventType === 'TAB_SWITCH') {
      setTabSwitchCount((prev) => prev + 1);
    }
  };

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Encrypt answer payload with client-side AES-256-GCM
      const encrypted = await encryptAnswerPayload(answers);
      const res = await onSubmit(answers, encrypted);
      if (res) {
        setReceipt(res);
      }
    } catch (err) {
      console.error("Submission failed:", err);
    } finally {
      setIsSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const copyChecksum = () => {
    if (receipt?.hash_chain_checksum) {
      navigator.clipboard.writeText(receipt.hash_chain_checksum);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    }
  };

  // Calculations for Pre-submission validation checklist
  const totalQuestions = exam.exam_questions.length;
  const answeredCount = Object.keys(answers).filter(k => !!answers[k] && Object.values(answers[k]).some(v => !!v)).length;
  const flaggedCount = Object.keys(reviewFlags).filter(k => !!reviewFlags[k]).length;
  const unansweredCount = totalQuestions - answeredCount;

  if (receipt) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 selection:bg-emerald-500">
        <div className="glass-panel max-w-2xl w-full p-8 rounded-3xl border border-slate-800 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 text-white shadow-xl shadow-emerald-500/30 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>AES-256 Encrypted & Signed</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
              Examination Submitted Successfully
            </h1>
            <p className="text-sm text-slate-400">
              Your answer script has been sealed and transmitted to the AIBOS Multi-Agent AI Evaluation Bus.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Candidate Name</span>
              <span className="font-semibold text-slate-200">{studentName}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Roll Number</span>
              <span className="font-mono text-sky-400 font-medium">{rollNumber}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Exam Title</span>
              <span className="font-medium text-slate-200">{exam.title}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Questions Solved</span>
              <span className="font-semibold text-emerald-400">{receipt.total_answered} of {totalQuestions}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <span className="text-slate-400">Submission Timestamp</span>
              <span className="font-mono text-slate-300">{new Date(receipt.submitted_at).toLocaleString()}</span>
            </div>

            <div className="space-y-1 pt-1">
              <span className="text-slate-400 block">SHA-256 Immutable Checksum</span>
              <div className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-sky-400 break-all">
                <span className="flex-1">{receipt.hash_chain_checksum}</span>
                <button
                  onClick={copyChecksum}
                  className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition"
                  title="Copy Checksum"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-slate-400 block">ECDSA Digital Signature</span>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 font-mono text-[11px] text-emerald-400 truncate">
                {receipt.digital_signature}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="/"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-sky-500/25 transition flex items-center justify-center gap-2 text-center"
            >
              <span>Return to Portal Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ExamLockdownGuard onViolation={handleLockdownViolation}>
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-sky-500">
        {/* Top Secure Header */}
        <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 font-bold text-lg text-white">
              A
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-lg leading-snug">{exam.title}</h1>
              <p className="text-xs text-slate-400 flex items-center gap-2">
                <span>{exam.subject}</span>
                <span>•</span>
                <span className="text-sky-400 font-medium">{studentName} ({rollNumber})</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-6">
            {/* Connectivity Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs ${
              isOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
            }`}>
              {isOnline ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
              <span>{isOnline ? 'Online Sync' : 'Offline Mode (Local Queue)'}</span>
            </div>

            {/* Proctoring Status Pill */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs">
              <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-slate-300">Lockdown Active</span>
              {tabSwitchCount > 0 && (
                <span className="ml-1 bg-rose-500/20 text-rose-400 border border-rose-500/40 px-1.5 py-0.5 rounded font-mono text-[10px]">
                  {tabSwitchCount} Warnings
                </span>
              )}
            </div>

            {/* Auto-save status */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Save className={`w-4 h-4 ${saveStatus === 'saving' ? 'text-amber-400 animate-spin' : saveStatus === 'offline' ? 'text-rose-400' : 'text-emerald-400'}`} />
              <span>{saveStatus === 'saving' ? 'Saving...' : saveStatus === 'offline' ? 'Queued Offline' : 'Auto-saved'}</span>
            </div>

            {/* Timer Display */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-950/60 border border-sky-500/40 text-sky-400 font-mono font-bold text-lg shadow-inner">
              <Clock className="w-5 h-5 text-sky-400" />
              <span>{formatTime(secondsRemaining)}</span>
            </div>

            {/* Submit Button */}
            <button
              id="submit-exam-btn"
              onClick={() => setShowSubmitModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold text-sm hover:brightness-110 shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit Exam</span>
            </button>
          </div>
        </header>

        {/* Main Workspace Body */}
        <div className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question & Answer Column (3 Cols) */}
          <main className="lg:col-span-3 space-y-6">
            {/* Question Meta Banner */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-sky-500/10 text-sky-400 border border-sky-500/30 rounded-lg text-xs font-semibold">
                    Question {currentIdx + 1} of {totalQuestions}
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                    {currentQ.question.bloom_level} Taxonomy
                  </span>
                  <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs font-medium">
                    {currentQ.question.question_type}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-emerald-400">{currentQ.allocated_marks} Marks</span>
                  <button
                    onClick={toggleReviewFlag}
                    className={`p-2 rounded-lg border text-xs flex items-center gap-1.5 transition ${
                      reviewFlags[currentQ.id] 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' 
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className="w-4 h-4" />
                    <span>{reviewFlags[currentQ.id] ? 'Flagged' : 'Flag Question'}</span>
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <div className="text-base text-slate-100 leading-relaxed font-sans pt-1">
                {currentQ.question.question_text}
              </div>
            </div>

            {/* Response Editor Workspace */}
            <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-4">
              {/* Input Mode Selector */}
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('text')}
                  className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                    activeTab === 'text' 
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>Text Response</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('math')}
                  className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                    activeTab === 'math' 
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sigma className="w-4 h-4" />
                  <span>Math Formula</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('diagram')}
                  className={`px-4 py-2 rounded-xl text-xs font-medium flex items-center gap-2 transition ${
                    activeTab === 'diagram' 
                      ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30' 
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Paintbrush className="w-4 h-4" />
                  <span>Diagram Canvas</span>
                </button>
              </div>

              {/* Active Editor Rendering */}
              {activeTab === 'text' && (
                <textarea
                  value={answers[currentQ.id]?.text || ''}
                  onChange={(e) => handleAnswerChange('text', e.target.value)}
                  placeholder="Type your structured explanation here..."
                  rows={8}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 font-sans text-sm focus:outline-none focus:border-sky-500 leading-relaxed"
                />
              )}

              {activeTab === 'math' && (
                <MathEditor
                  value={answers[currentQ.id]?.math || ''}
                  onChange={(latex) => handleAnswerChange('math', latex)}
                />
              )}

              {activeTab === 'diagram' && (
                <DiagramCanvas
                  initialData={answers[currentQ.id]?.diagram}
                  onChange={(canvasData) => handleAnswerChange('diagram', canvasData)}
                />
              )}
            </div>

            {/* Navigation Controls */}
            <div className="flex items-center justify-between">
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx((prev) => prev - 1)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-800 text-sm font-medium transition"
              >
                Previous Question
              </button>

              <button
                disabled={currentIdx === totalQuestions - 1}
                onClick={() => setCurrentIdx((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-sky-600 text-white hover:bg-sky-500 text-sm font-medium transition shadow-lg shadow-sky-600/20"
              >
                Next Question
              </button>
            </div>
          </main>

          {/* Sidebar Question Navigation (1 Col) */}
          <aside className="space-y-6">
            <QuestionNav
              questions={exam.exam_questions}
              currentIdx={currentIdx}
              answers={answers}
              reviewFlags={reviewFlags}
              visitedMap={visitedMap}
              skippedMap={skippedMap}
              onSelect={(idx) => setCurrentIdx(idx)}
            />
          </aside>
        </div>

        {/* Pre-Submission Validation & Confirmation Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="glass-panel max-w-lg w-full p-6 rounded-2xl border border-slate-800 space-y-4 shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>

              <div className="text-center space-y-1">
                <h3 className="text-xl font-bold text-slate-100">Submission Pre-Check & Confirmation</h3>
                <p className="text-xs text-slate-400">
                  Verify your response statistics before final cryptographic locking.
                </p>
              </div>

              {/* Pre-submission Summary Checklist */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Total Exam Questions</span>
                  <span className="font-bold text-slate-200">{totalQuestions}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Answered Questions</span>
                  <span className="font-bold text-emerald-400">{answeredCount}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Flagged Questions</span>
                  <span className="font-bold text-amber-400">{flaggedCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Unanswered / Skipped Questions</span>
                  <span className={`font-bold ${unansweredCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                    {unansweredCount}
                  </span>
                </div>
              </div>

              {unansweredCount > 0 && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Warning: You have {unansweredCount} unanswered questions remaining.</span>
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  disabled={isSubmitting}
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-800 disabled:opacity-50"
                >
                  Return to Exam
                </button>

                <button
                  id="confirm-submit-btn"
                  disabled={isSubmitting}
                  onClick={handleFinalSubmit}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span>Confirm & Lock Exam</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </ExamLockdownGuard>
  );
};
