'use client';

import React from 'react';
import { History, RotateCcw, Clock, CheckCircle, X } from 'lucide-react';

export interface VersionItem {
  versionNumber: number;
  timestamp: string;
  answerData: any;
  reason?: string;
}

interface VersionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  questionId: string;
  versions: VersionItem[];
  onRevertToVersion: (version: VersionItem) => void;
}

export const VersionHistoryDrawer: React.FC<VersionHistoryDrawerProps> = ({
  isOpen,
  onClose,
  questionId,
  versions,
  onRevertToVersion,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex justify-end">
      <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col p-6 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2 text-sky-400">
            <History className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-100">Answer Revision History</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-200 rounded-lg bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-slate-400 mt-3">
          Every edit is cryptographically revisioned and timestamped. Select a prior version to inspect or revert.
        </p>

        {/* Versions List */}
        <div className="flex-1 overflow-y-auto my-4 space-y-3 pr-1">
          {versions.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-xs">
              No version history available for this question yet.
            </div>
          ) : (
            versions.map((ver, idx) => (
              <div
                key={ver.versionNumber}
                className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 space-y-2 hover:border-slate-700 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/20">
                    v{ver.versionNumber} {idx === versions.length - 1 ? '(Current)' : ''}
                  </span>
                  <span className="text-slate-500 flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3 h-3" />
                    {new Date(ver.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800/80 rounded-lg p-2.5 text-xs font-mono text-slate-300 max-h-24 overflow-y-auto">
                  {typeof ver.answerData?.text === 'string'
                    ? ver.answerData.text
                    : JSON.stringify(ver.answerData)}
                </div>

                {ver.reason && (
                  <div className="text-[11px] text-slate-400 font-sans italic">
                    Reason: {ver.reason}
                  </div>
                )}

                {idx !== versions.length - 1 && (
                  <button
                    type="button"
                    onClick={() => onRevertToVersion(ver)}
                    className="w-full mt-1 py-1.5 px-3 bg-slate-800 hover:bg-sky-500/20 hover:border-sky-500/40 border border-slate-700 text-sky-400 text-xs rounded-lg font-medium transition flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Revert to Version {ver.versionNumber}</span>
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            Close History Drawer
          </button>
        </div>
      </div>
    </div>
  );
};
