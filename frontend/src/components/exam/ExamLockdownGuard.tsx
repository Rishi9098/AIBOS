'use client';

import React, { useEffect, useState } from 'react';
import { AlertOctagon, ShieldAlert, X } from 'lucide-react';
import { examStorage } from '@/lib/examStorage';

interface ExamLockdownGuardProps {
  onViolation: (eventType: string, details: any) => void;
  children: React.ReactNode;
}

export const ExamLockdownGuard: React.FC<ExamLockdownGuardProps> = ({
  onViolation,
  children
}) => {
  const [warningMessage, setWarningMessage] = useState<string | null>(null);

  useEffect(() => {
    // 1. Prevent Right Click / Context Menu
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      triggerWarning('RIGHT_CLICK_ATTEMPT', 'Right click is disabled during the proctored examination.');
    };

    // 2. Prevent Copy / Cut / Paste
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      triggerWarning('CLIPBOARD_ATTEMPT', `Clipboard ${e.type.toUpperCase()} operation is disabled.`);
    };

    // 3. Prevent DevTools & Refresh Hotkeys (F12, Ctrl+Shift+I, Cmd+Alt+I, Ctrl+R)
    const handleKeyDown = (e: KeyboardEvent) => {
      const isF12 = e.key === 'F12';
      const isInspect = (e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'C' || e.key === 'c');
      const isRefresh = (e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R');

      if (isF12 || isInspect) {
        e.preventDefault();
        triggerWarning('DEVTOOLS_HOTKEY', 'Developer Tools inspection is locked.');
      } else if (isRefresh) {
        e.preventDefault();
        triggerWarning('REFRESH_HOTKEY', 'Browser refresh is restricted during exam execution.');
      }
    };

    // 4. Intercept Tab Switch / Visibility Change
    const handleVisibility = () => {
      if (document.hidden) {
        triggerWarning('TAB_SWITCH', 'Tab switch or window defocus detected by AI Proctor.');
      }
    };

    // 5. Intercept Before Unload / Refresh
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Warning: Leaving or refreshing the page will terminate your active exam session.';
      return e.returnValue;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopyPaste);
    document.addEventListener('cut', handleCopyPaste);
    document.addEventListener('paste', handleCopyPaste);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopyPaste);
      document.removeEventListener('cut', handleCopyPaste);
      document.removeEventListener('paste', handleCopyPaste);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  const triggerWarning = (eventType: string, message: string) => {
    setWarningMessage(message);
    examStorage.logActivity(eventType, { message, timestamp: new Date().toISOString() });
    onViolation(eventType, { message });

    setTimeout(() => {
      setWarningMessage(null);
    }, 4000);
  };

  return (
    <div className="relative min-h-screen">
      {/* Lockdown Warning Banner Overlay */}
      {warningMessage && (
        <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full px-4 animate-bounce">
          <div className="bg-rose-950/95 border border-rose-500/60 text-rose-200 p-4 rounded-2xl shadow-2xl backdrop-blur-md flex items-start gap-3">
            <ShieldAlert className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs space-y-1">
              <h4 className="font-bold text-sm text-rose-100 flex items-center justify-between">
                <span>Security Lockdown Alert</span>
                <span className="font-mono text-[10px] bg-rose-900/80 px-2 py-0.5 rounded text-rose-300">Logged</span>
              </h4>
              <p className="leading-relaxed">{warningMessage}</p>
            </div>
            <button
              onClick={() => setWarningMessage(null)}
              className="text-rose-400 hover:text-rose-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {children}
    </div>
  );
};
