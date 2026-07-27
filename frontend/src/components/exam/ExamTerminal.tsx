'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Lock,
  Copy,
  ArrowRight,
  Check,
  Wifi,
  WifiOff,
  History
} from 'lucide-react';
import { QuestionNav } from './QuestionNav';
import { MathEditor } from './MathEditor';
import { DiagramCanvas } from './DiagramCanvas';
import { ExamLockdownGuard } from './ExamLockdownGuard';
import { ExamHeader } from './ExamHeader';
import { VersionHistoryDrawer, VersionItem } from './VersionHistoryDrawer';
import { useAutoSave, SaveStatus } from '@/hooks/useAutoSave';
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
  const [isOnline, setIsOnline] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<SubmissionReceipt | null>(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  // Version History state
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false);
  const [versionHistoryMap, setVersionHistoryMap] = useState<Record<string, VersionItem[]>>({});

  const currentQ = exam.exam_questions[currentIdx];

  // 1. Session Recovery Engine from IndexedDB on Mount
  useEffect(() => {
    async function recoverSession() {
      try {
        const savedSession = await examStorage.getSessionState(exam.id);
        if (savedSession) {
          if (savedSession.answers) setAnswers(savedSession.answers);
          if (savedSession.reviewFlags) setReviewFlags(savedSession.reviewFlags);
          if (savedSession.visitedMap) setVisitedMap(savedSession.visitedMap);
          if (savedSession.skippedMap) setSkippedMap(savedSession.skippedMap);
          if (typeof savedSession.currentIdx === 'number') setCurrentIdx(savedSession.currentIdx);
          if (typeof savedSession.secondsRemaining === 'number') setSecondsRemaining(savedSession.secondsRemaining);
        }
      } catch (err) {
        console.error('Failed to recover IndexedDB session:', err);
      }
    }
    recoverSession();
  }, [exam.id]);

  // 2. Network Connectivity Listener
  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true);
      await examStorage.logActivity('NETWORK_ONLINE', { timestamp: new Date().toISOString() });
      // Flush offline queue if needed
      const offlineItems = await examStorage.getOfflineSyncItems();
      if (offlineItems.length > 0) {
        await examStorage.clearOfflineSyncItems();
      }
    };

    const handleOffline = async () => {
      setIsOnline(false);
      await examStorage.logActivity('NETWORK_OFFLINE', { timestamp: new Date().toISOString() });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // 3. AutoSave Hook Integration
  const performSave = useCallback(async (dataToSave: {
    answers: Record<string, any>;
    reviewFlags: Record<string, boolean>;
    visitedMap: Record<string, boolean>;
    skippedMap: Record<string, boolean>;
    currentIdx: number;
    secondsRemaining: number;
  }) => {
    // Save to IndexedDB local cache first (works offline & online)
    await examStorage.saveSessionState(exam.id, dataToSave);

    if (!navigator.onLine) {
      await examStorage.addOfflineSyncItem(
        currentQ?.question.id || '',
        dataToSave.answers[currentQ?.question.id] || {}
      );
      throw new Error('Offline - queued in IndexedDB');
    }
  }, [exam.id, currentQ]);

  const { status: autoSaveStatus, triggerSave, saveNow } = useAutoSave({
    saveFn: performSave,
    delayMs: 3000,
  });

  // Track Question Visited State
  useEffect(() => {
    if (!currentQ) return;
    setVisitedMap((prev) => {
      if (prev[currentQ.question.id]) return prev;
      const updated = { ...prev, [currentQ.question.id]: true };
      triggerSave({ answers, reviewFlags, visitedMap: updated, skippedMap, currentIdx, secondsRemaining });
      return updated;
    });
  }, [currentIdx, currentQ]);

  // Exam Countdown Timer
  useEffect(() => {
    if (secondsRemaining <= 0 || receipt) return;
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleFinalSubmit(); // Auto Submit on timer expiry
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [secondsRemaining, receipt]);

  // Update Answer for Current Question with Version History Tracking
  const updateCurrentAnswer = (key: 'text' | 'math' | 'diagram', value: string) => {
    if (!currentQ) return;
    const qId = currentQ.question.id;
    const prevAnswer = answers[qId] || {};
    const updatedAnswer = { ...prevAnswer, [key]: value };

    const newAnswers = { ...answers, [qId]: updatedAnswer };
    setAnswers(newAnswers);

    // Track Version History
    const currentVersions = versionHistoryMap[qId] || [];
    const newVer: VersionItem = {
      versionNumber: currentVersions.length + 1,
      timestamp: new Date().toISOString(),
      answerData: updatedAnswer,
      reason: `Edit in ${key} input field`
    };

    setVersionHistoryMap((prev) => ({
      ...prev,
      [qId]: [...currentVersions, newVer]
    }));

    // Trigger debounced auto-save
    triggerSave({ answers: newAnswers, reviewFlags, visitedMap, skippedMap, currentIdx, secondsRemaining });
  };

  // Toggle Review Flag
  const toggleReviewFlag = () => {
    if (!currentQ) return;
    const qId = currentQ.question.id;
    const newFlags = { ...reviewFlags, [qId]: !reviewFlags[qId] };
    setReviewFlags(newFlags);
    saveNow({ answers, reviewFlags: newFlags, visitedMap, skippedMap, currentIdx, secondsRemaining });
  };

  // Toggle Skipped State
  const toggleSkipped = () => {
    if (!currentQ) return;
    const qId = currentQ.question.id;
    const newSkipped = { ...skippedMap, [qId]: !skippedMap[qId] };
    setSkippedMap(newSkipped);
    saveNow({ answers, reviewFlags, visitedMap, skippedMap: newSkipped, currentIdx, secondsRemaining });
  };

  // Question Navigation Handlers
  const handleNavNext = () => {
    if (currentIdx < exam.exam_questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      saveNow({ answers, reviewFlags, visitedMap, skippedMap, currentIdx: nextIdx, secondsRemaining });
    }
  };

  const handleNavPrev = () => {
    if (currentIdx > 0) {
      const prevIdx = currentIdx - 1;
      setCurrentIdx(prevIdx);
      saveNow({ answers, reviewFlags, visitedMap, skippedMap, currentIdx: prevIdx, secondsRemaining });
    }
  };

  // Revert to Version
  const handleRevertVersion = (version: VersionItem) => {
    if (!currentQ) return;
    const qId = currentQ.question.id;
    const restoredAnswer = version.answerData;

    const newAnswers = { ...answers, [qId]: restoredAnswer };
    setAnswers(newAnswers);

    setVersionHistoryMap((prev) => ({
      ...prev,
      [qId]: [
        ...(prev[qId] || []),
        {
          versionNumber: (prev[qId]?.length || 0) + 1,
          timestamp: new Date().toISOString(),
          answerData: restoredAnswer,
          reason: `Reverted to version v${version.versionNumber}`
        }
      ]
    }));

    saveNow({ answers: newAnswers, reviewFlags, visitedMap, skippedMap, currentIdx, secondsRemaining });
    setHistoryDrawerOpen(false);
  };

  // Final Exam Submission Handler
  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 1. AES-256 Client Payload Encryption
      const payloadToEncrypt = {
        exam_id: exam.id,
        roll_number: rollNumber,
        timestamp: new Date().toISOString(),
        answers
      };
      const encrypted = await encryptAnswerPayload(payloadToEncrypt);

      // 2. Submit to API / Backend
      const res = await onSubmit(answers, encrypted);
      if (res) {
        setReceipt(res);
        setShowSubmitModal(false);
      }
    } catch (err) {
      console.error('Exam submission failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tab Switch / Warning Event Handler
  const handleSecurityWarning = async (eventType: string, details: any) => {
    if (eventType === 'TAB_SWITCH') {
      setTabSwitchCount((prev) => prev + 1);
    }
    await examStorage.logActivity(eventType, details);
  };

  // Counts for Header & Modal
  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k] && (answers[k].text || answers[k].math || answers[k].diagram)
  ).length;
  const flaggedCount = Object.values(reviewFlags).filter(Boolean).length;
  const skippedCount = Object.values(skippedMap).filter(Boolean).length;
  const visitedCount = Object.values(visitedMap).filter(Boolean).length;
  const notVisitedCount = Math.max(0, exam.exam_questions.length - visitedCount);

  // If exam has been submitted, show Verification Receipt Screen
  if (receipt) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-mono font-semibold uppercase tracking-wider">
              🛡️ AES-256 Encrypted & Signed
            </span>
            <h2 className="text-2xl font-bold text-slate-100">Examination Submitted Successfully</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Your answer script has been sealed and transmitted to the AIBOS Multi-Agent AI Evaluation Bus.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 text-left space-y-3 font-sans text-xs">
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Candidate Name</span>
              <span className="font-semibold text-slate-200">{studentName}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Roll Number</span>
              <span className="font-mono text-sky-400">{rollNumber}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Exam Title</span>
              <span className="font-medium text-slate-300">{exam.title}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Questions Solved</span>
              <span className="font-mono text-emerald-400 font-bold">{answeredCount} of {exam.exam_questions.length}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800/60">
              <span className="text-slate-500">Submission Timestamp</span>
              <span className="font-mono text-slate-300">{new Date(receipt.submitted_at).toLocaleString()}</span>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 font-medium block mb-1">SHA-256 Immutable Checksum</span>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-sky-400 flex items-center justify-between gap-2 overflow-x-auto">
                <span className="truncate">{receipt.hash_chain_checksum}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(receipt.hash_chain_checksum);
                    setCopiedHash(true);
                    setTimeout(() => setCopiedHash(false), 2000);
                  }}
                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                >
                  {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[11px] text-slate-400 font-medium block mb-1">ECDSA Digital Signature</span>
              <div className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-[11px] text-emerald-400">
                {receipt.digital_signature}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => window.location.href = '/'}
            className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-sky-500/20"
          >
            Return to Portal Dashboard →
          </button>
        </div>
      </div>
    );
  }

  const currentAnswer = answers[currentQ?.question.id] || {};

  return (
    <ExamLockdownGuard onViolation={handleSecurityWarning}>
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none">
        {/* Top Production Header Bar */}
        <ExamHeader
          examTitle={exam.title}
          candidateName={studentName}
          rollNumber={rollNumber}
          secondsRemaining={secondsRemaining}
          totalQuestions={exam.exam_questions.length}
          answeredCount={answeredCount}
          flaggedCount={flaggedCount}
          skippedCount={skippedCount}
          visitedCount={visitedCount}
          notVisitedCount={notVisitedCount}
          saveStatus={autoSaveStatus}
          isOnline={isOnline}
          onOpenSubmitModal={() => setShowSubmitModal(true)}
        />

        {/* Security Warning Banner if Tab Switch Detected */}
        {tabSwitchCount > 0 && (
          <div className="bg-amber-500/10 border-b border-amber-500/30 px-6 py-2 flex items-center justify-between text-xs text-amber-400">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 animate-bounce" />
              <span>Proctor Warning: Tab switch / Window blur event detected ({tabSwitchCount} occurrences logged).</span>
            </div>
            <span className="font-mono text-[10px] bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30">
              AUDIT LOGGED
            </span>
          </div>
        )}

        {/* Main Terminal Workspace */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Area: Question Prompt & Multi-Modal Answer Workspace (8 cols) */}
          <div className="lg:col-span-8 space-y-6 flex flex-col">
            {/* Question Box */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/20">
                    Question {currentIdx + 1} of {exam.exam_questions.length}
                  </span>
                  {currentQ?.section_name && (
                    <span className="text-slate-400 bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                      {currentQ.section_name}
                    </span>
                  )}
                  <span className="text-slate-500">•</span>
                  <span className="text-slate-400 font-mono">
                    {currentQ?.allocated_marks || 5} Marks
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleReviewFlag}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition ${
                      reviewFlags[currentQ?.question.id]
                        ? 'bg-amber-500/20 border-amber-400 text-amber-400'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{reviewFlags[currentQ?.question.id] ? 'Flagged' : 'Flag for Review'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHistoryDrawerOpen(true)}
                    className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-sky-400 hover:border-sky-500/40 text-xs flex items-center gap-1"
                    title="View Answer Revision History"
                  >
                    <History className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline font-mono">v{versionHistoryMap[currentQ?.question.id]?.length || 1}</span>
                  </button>
                </div>
              </div>

              {/* Question Text Prompt */}
              <div className="text-slate-100 text-base leading-relaxed font-sans font-medium">
                {currentQ?.question.question_text || "Explain the working principle of a Full Wave Bridge Rectifier circuit. Detail the role of p-n junction diodes during positive and negative half cycles of the input AC signal."}
              </div>
            </div>

            {/* Answer Input Workspace */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl flex-1 flex flex-col">
              {/* Input Mode Selector Tabs */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab('text')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'text'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-md shadow-sky-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <FileText className="w-4 h-4" />
                    <span>Text Answer</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('math')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'math'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-md shadow-sky-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Sigma className="w-4 h-4" />
                    <span>Math & Formula Editor</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setActiveTab('diagram')}
                    className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition ${
                      activeTab === 'diagram'
                        ? 'bg-sky-500/20 border-sky-400 text-sky-400 shadow-md shadow-sky-500/10'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Paintbrush className="w-4 h-4" />
                    <span>Vector Diagram Canvas</span>
                  </button>
                </div>

                <div className="text-[11px] text-slate-500 font-mono">
                  Auto-Save Active ⚡
                </div>
              </div>

              {/* Active Tab Input Area */}
              <div className="flex-1 flex flex-col">
                {activeTab === 'text' && (
                  <textarea
                    value={currentAnswer.text || ''}
                    onChange={(e) => updateCurrentAnswer('text', e.target.value)}
                    placeholder="Type your structured solution here..."
                    className="w-full flex-1 min-h-[260px] bg-slate-950/80 border border-slate-800 rounded-xl p-4 text-slate-200 text-sm focus:outline-none focus:border-sky-500/80 leading-relaxed font-sans resize-none"
                  />
                )}

                {activeTab === 'math' && (
                  <MathEditor
                    value={currentAnswer.math || ''}
                    onChange={(mathVal) => updateCurrentAnswer('math', mathVal)}
                  />
                )}

                {activeTab === 'diagram' && (
                  <DiagramCanvas
                    initialData={currentAnswer.diagram}
                    onChange={(canvasData) => updateCurrentAnswer('diagram', canvasData)}
                  />
                )}
              </div>

              {/* Bottom Navigation Control Bar */}
              <div className="flex items-center justify-between border-t border-slate-800 pt-4 mt-auto">
                <button
                  type="button"
                  onClick={handleNavPrev}
                  disabled={currentIdx === 0}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition disabled:opacity-40"
                >
                  ← Previous Question
                </button>

                <button
                  type="button"
                  onClick={toggleSkipped}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${
                    skippedMap[currentQ?.question.id]
                      ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                      : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-300'
                  }`}
                >
                  {skippedMap[currentQ?.question.id] ? 'Marked as Skipped' : 'Skip for Later'}
                </button>

                <button
                  type="button"
                  onClick={handleNavNext}
                  disabled={currentIdx === exam.exam_questions.length - 1}
                  className="px-5 py-2 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition disabled:opacity-40 shadow-lg shadow-sky-500/20"
                >
                  Next Question →
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: 5-State Question Navigation Palette (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <QuestionNav
              questions={exam.exam_questions}
              currentIdx={currentIdx}
              answers={answers}
              reviewFlags={reviewFlags}
              skippedMap={skippedMap}
              visitedMap={visitedMap}
              onSelect={(idx: number) => {
                setCurrentIdx(idx);
                saveNow({ answers, reviewFlags, visitedMap, skippedMap, currentIdx: idx, secondsRemaining });
              }}
            />
          </div>
        </main>

        {/* Version History Drawer Modal */}
        <VersionHistoryDrawer
          isOpen={historyDrawerOpen}
          onClose={() => setHistoryDrawerOpen(false)}
          questionId={currentQ?.question.id || ''}
          versions={versionHistoryMap[currentQ?.question.id] || []}
          onRevertToVersion={handleRevertVersion}
        />

        {/* Pre-Submission Pre-Check Checklist Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                <div className="p-2.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Lock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-100">Submission Pre-Check & Seal</h3>
                  <p className="text-xs text-slate-400">Verify your examination summary before final submission.</p>
                </div>
              </div>

              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3 font-mono text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Total Questions</span>
                  <span className="text-slate-200 font-bold">{exam.exam_questions.length}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Answered Questions</span>
                  <span className="text-emerald-400 font-bold">{answeredCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Flagged Questions</span>
                  <span className="text-amber-400 font-bold">{flaggedCount}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Skipped Questions</span>
                  <span className="text-rose-400 font-bold">{skippedCount}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Security Audit Warnings</span>
                  <span className="text-slate-300 font-bold">{tabSwitchCount} Warnings</span>
                </div>
              </div>

              {flaggedCount > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>You have {flaggedCount} flagged questions. You can still submit or review them.</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Return to Exam
                </button>

                <button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white text-xs font-semibold rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Cryptographically Sealing...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirm & Lock Submission</span>
                    </>
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
