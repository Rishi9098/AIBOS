'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline-queued';

interface UseAutoSaveOptions<T> {
  saveFn: (data: T) => Promise<void>;
  delayMs?: number;
  maxRetries?: number;
  onSuccess?: () => void;
  onError?: (err: Error) => void;
}

export function useAutoSave<T>({
  saveFn,
  delayMs = 5000,
  maxRetries = 3,
  onSuccess,
  onError,
}: UseAutoSaveOptions<T>) {
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  const pendingDataRef = useRef<T | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const retryCountRef = useRef(0);
  const isSavingRef = useRef(false);

  const executeSave = useCallback(async (data: T) => {
    if (isSavingRef.current) return;
    isSavingRef.current = true;
    setStatus('saving');

    try {
      await saveFn(data);
      setStatus('saved');
      setLastSavedTime(new Date());
      retryCountRef.current = 0;
      pendingDataRef.current = null;
      if (onSuccess) onSuccess();
    } catch (err: any) {
      if (!navigator.onLine) {
        setStatus('offline-queued');
      } else if (retryCountRef.current < maxRetries) {
        retryCountRef.current += 1;
        setStatus('error');
        // Retry with exponential backoff
        setTimeout(() => {
          executeSave(data);
        }, Math.pow(2, retryCountRef.current) * 1000);
      } else {
        setStatus('error');
        if (onError) onError(err instanceof Error ? err : new Error(String(err)));
      }
    } finally {
      isSavingRef.current = false;
    }
  }, [saveFn, maxRetries, onSuccess, onError]);

  const triggerSave = useCallback((data: T, immediate = false) => {
    pendingDataRef.current = data;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (immediate) {
      executeSave(data);
    } else {
      setStatus('idle');
      timerRef.current = setTimeout(() => {
        if (pendingDataRef.current !== null) {
          executeSave(pendingDataRef.current);
        }
      }, delayMs);
    }
  }, [delayMs, executeSave]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return {
    status,
    lastSavedTime,
    triggerSave,
    saveNow: (data: T) => triggerSave(data, true),
  };
}
