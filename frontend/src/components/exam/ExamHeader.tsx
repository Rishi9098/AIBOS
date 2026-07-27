'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Wifi,
  WifiOff,
  Battery,
  BatteryWarning,
  Save,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  ShieldCheck
} from 'lucide-react';
import { SaveStatus } from '@/hooks/useAutoSave';

interface ExamHeaderProps {
  examTitle: string;
  candidateName: string;
  rollNumber: string;
  secondsRemaining: number;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  skippedCount: number;
  visitedCount: number;
  notVisitedCount: number;
  saveStatus: SaveStatus;
  isOnline: boolean;
  onOpenSubmitModal: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  examTitle,
  candidateName,
  rollNumber,
  secondsRemaining,
  totalQuestions,
  answeredCount,
  flaggedCount,
  skippedCount,
  visitedCount,
  notVisitedCount,
  saveStatus,
  isOnline,
  onOpenSubmitModal,
}) => {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean | null>(null);

  // Monitor Battery API
  useEffect(() => {
    if (typeof window !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(battery.charging);

        battery.addEventListener('levelchange', () => {
          setBatteryLevel(Math.round(battery.level * 100));
        });
        battery.addEventListener('chargingchange', () => {
          setIsCharging(battery.charging);
        });
      });
    }
  }, []);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeCritical = secondsRemaining < 300; // Under 5 mins
  const readinessPercentage = Math.round((answeredCount / Math.max(totalQuestions, 1)) * 100);

  return (
    <header className="bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-6 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Exam Info & Candidate */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="p-2.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>{examTitle}</span>
              <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider bg-sky-500/20 text-sky-400 border border-sky-500/30 rounded-full">
                LIVE EXAM
              </span>
            </h1>
            <p className="text-xs text-slate-400 flex items-center gap-2 font-mono mt-0.5">
              <span>{candidateName}</span>
              <span className="text-slate-600">•</span>
              <span className="text-sky-400">{rollNumber}</span>
            </p>
          </div>
        </div>

        {/* Center Metrics & Auto Save Status */}
        <div className="flex items-center gap-4 bg-slate-950/70 border border-slate-800/80 px-4 py-2 rounded-xl text-xs">
          {/* Answer Progress */}
          <div className="flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Progress</div>
              <div className="font-bold text-slate-200">
                {answeredCount}/{totalQuestions} ({readinessPercentage}%)
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Auto Save Status */}
          <div className="flex items-center gap-2">
            <Save className={`w-4 h-4 ${saveStatus === 'saving' ? 'animate-spin text-amber-400' : saveStatus === 'saved' ? 'text-emerald-400' : 'text-slate-400'}`} />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Auto Save</div>
              <div className="font-semibold text-slate-300 capitalize">
                {saveStatus === 'saving' ? (
                  <span className="text-amber-400">Saving...</span>
                ) : saveStatus === 'saved' ? (
                  <span className="text-emerald-400">Saved</span>
                ) : saveStatus === 'offline-queued' ? (
                  <span className="text-amber-400 font-mono">Queued</span>
                ) : saveStatus === 'error' ? (
                  <span className="text-rose-400 font-mono">Failed</span>
                ) : (
                  'Synced'
                )}
              </div>
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          {/* Network Status */}
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-4 h-4 text-emerald-400" />
            ) : (
              <WifiOff className="w-4 h-4 text-rose-400 animate-pulse" />
            )}
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Network</div>
              <div className={`font-semibold ${isOnline ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isOnline ? 'Online' : 'Offline Mode'}
              </div>
            </div>
          </div>

          {/* Battery Status if available */}
          {batteryLevel !== null && (
            <>
              <div className="h-6 w-px bg-slate-800" />
              <div className="flex items-center gap-2">
                {batteryLevel <= 20 && !isCharging ? (
                  <BatteryWarning className="w-4 h-4 text-rose-400 animate-bounce" />
                ) : (
                  <Battery className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Battery</div>
                  <div className={`font-semibold font-mono ${batteryLevel <= 20 && !isCharging ? 'text-rose-400 font-bold' : 'text-slate-300'}`}>
                    {batteryLevel}% {isCharging ? '⚡' : ''}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Right: Timer & Submit Action */}
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-xl border flex items-center gap-2 font-mono font-bold text-sm ${
            isTimeCritical
              ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 animate-pulse'
              : 'bg-slate-950 border-slate-800 text-amber-400'
          }`}>
            <Clock className="w-4 h-4" />
            <span>{formatTime(secondsRemaining)}</span>
          </div>

          <button
            type="button"
            onClick={onOpenSubmitModal}
            className="px-4 py-2 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white text-xs font-semibold rounded-xl transition-all shadow-lg shadow-sky-500/20 active:scale-95 flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Submit Exam</span>
          </button>
        </div>
      </div>
    </header>
  );
};
