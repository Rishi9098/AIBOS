'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  FileText, 
  Award, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  LogOut, 
  BookOpen, 
  ShieldCheck,
  Play
} from 'lucide-react';
import { api, getAuthUser, clearAuthSession } from '@/lib/api';
import PageHelpPanel from '@/components/PageHelpPanel';
import GuidedTour from '@/components/GuidedTour';
import RouteGuard from '@/components/RouteGuard';

export default function CandidateDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [exams, setExams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const candidateTourSteps = [
    {
      targetTitle: 'Candidate Student Assessment Terminal',
      whatIsThisPage: 'This is the student candidate dashboard listing upcoming, live, and completed board examination sessions.',
      whatHappensHere: 'Candidates select active exams, review instructions, and enter timed assessment terminals.',
      whatHappensNext: 'After taking the exam, candidate submissions are evaluated by the 13-agent LangGraph AI DAG.',
    },
    {
      targetTitle: 'Digital Marksheet & Result Portal',
      whatIsThisPage: 'Link to the student digital grade card registry (/student/results).',
      whatHappensHere: 'Students view subject marks, cumulative CGPA, state merit ranks, and download signed marksheets.',
      whatHappensNext: 'Students share public QR verification links with universities or employers.',
    },
  ];

  useEffect(() => {
    const authUser = getAuthUser();
    if (!authUser || !authUser.token) {
      router.push('/');
      return;
    }
    setUser(authUser);

    // Fetch published exams from backend
    api.get('/exams/')
      .then((data) => setExams(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Failed to load exams:', err))
      .finally(() => setIsLoading(false));
  }, [router]);

  const handleLogout = () => {
    clearAuthSession();
    router.push('/');
  };

  return (
    <RouteGuard allowedRoles={['STUDENT', 'SUPER_ADMIN']}>
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-8 space-y-8">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-sky-500/20">
                A
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-100">Candidate Student Terminal</h1>
                <p className="text-xs text-sky-400 font-mono">
                  Authenticated Candidate: <span className="text-slate-200 font-bold">{user?.username}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <GuidedTour roleName="Candidate Student" steps={candidateTourSteps} />

              <Link
                href="/student/results"
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-sky-400 text-xs font-semibold rounded-xl transition flex items-center gap-2"
              >
                <Award className="w-4 h-4" />
                <span>My Digital Marksheet</span>
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold rounded-xl transition flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Page Help Panel */}
          <PageHelpPanel
            pageTitle="Candidate Student Dashboard"
            purpose="This dashboard presents active board examinations assigned to the candidate student by the state board administration."
            userRole="Candidate Student"
            apisExecuted={['GET /api/v1/exams/', 'GET /api/v1/auth/me']}
            dbTablesUpdated={['exams', 'student_submissions']}
            nextStep="Click 'Start Examination Terminal' to enter the timed assessment session."
            consequenceIfSkipped="The candidate would be unable to take published board examinations or submit answer scripts."
          />

          {/* Live & Scheduled Examinations */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" />
              <span>Active & Scheduled Board Examinations</span>
            </h2>

            {isLoading ? (
              <div className="p-8 text-center text-slate-400 text-xs font-mono">Loading active exams from backend...</div>
            ) : exams.length === 0 ? (
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-sm text-slate-300 font-medium">No published exams found for your session.</p>
                <p className="text-xs text-slate-500">Board administrators will publish exams according to the academic schedule.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {exams.map((exam) => (
                  <div key={exam.id} className="bg-slate-900/90 border border-slate-800 hover:border-sky-500/40 p-6 rounded-3xl space-y-4 transition shadow-xl">
                    <div className="flex items-center justify-between">
                      <span className="px-3 py-1 text-[10px] font-mono bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full font-bold">
                        {exam.status || 'PUBLISHED'}
                      </span>
                      <span className="text-xs font-mono text-amber-400 font-bold">{exam.total_marks} Marks</span>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold text-slate-100">{exam.title}</h3>
                      <p className="text-xs text-slate-400 font-mono mt-1">Subject: {exam.subject} • Duration: {exam.duration_minutes} Minutes</p>
                    </div>

                    <Link
                      href={`/exam/${exam.id}`}
                      className="w-full py-3 bg-gradient-to-r from-sky-500 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 block text-center"
                    >
                      <Play className="w-4 h-4 fill-white inline" />
                      <span>Start Examination Terminal</span>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </RouteGuard>
  );
}
