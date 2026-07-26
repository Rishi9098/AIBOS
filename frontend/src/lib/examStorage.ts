/**
 * IndexedDB Local Storage Manager for Production Exam Resilience
 */

const DB_NAME = 'AIBOS_Exam_Storage';
const DB_VERSION = 1;

export interface OfflineSyncItem {
  id?: number;
  question_id: string;
  answer_data: any;
  timestamp: string;
}

export interface ActivityLogItem {
  id?: number;
  event_type: string;
  event_details: any;
  timestamp: string;
}

class ExamStorageManager {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private openDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported'));
        return;
      }

      const req = window.indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = (e: any) => {
        const db = e.target.result;
        if (!db.objectStoreNames.contains('session_state')) {
          db.createObjectStore('session_state', { keyPath: 'exam_id' });
        }
        if (!db.objectStoreNames.contains('offline_queue')) {
          db.createObjectStore('offline_queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('activity_logs')) {
          db.createObjectStore('activity_logs', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('answer_versions')) {
          db.createObjectStore('answer_versions', { keyPath: 'id', autoIncrement: true });
        }
      };

      req.onsuccess = (e: any) => resolve(e.target.result);
      req.onerror = (e: any) => reject(e.target.error);
    });

    return this.dbPromise;
  }

  async saveSessionState(examId: string, state: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('session_state', 'readwrite');
      const store = tx.objectStore('session_state');
      store.put({ exam_id: examId, ...state, updated_at: new Date().toISOString() });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getSessionState(examId: string): Promise<any | null> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('session_state', 'readonly');
      const store = tx.objectStore('session_state');
      const req = store.get(examId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  async addOfflineSyncItem(questionId: string, answerData: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_queue', 'readwrite');
      const store = tx.objectStore('offline_queue');
      store.add({
        question_id: questionId,
        answer_data: answerData,
        timestamp: new Date().toISOString()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getOfflineSyncItems(): Promise<OfflineSyncItem[]> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_queue', 'readonly');
      const store = tx.objectStore('offline_queue');
      const req = store.getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  async clearOfflineSyncItems(): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_queue', 'readwrite');
      const store = tx.objectStore('offline_queue');
      store.clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async logActivity(eventType: string, details: any): Promise<void> {
    const db = await this.openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('activity_logs', 'readwrite');
      const store = tx.objectStore('activity_logs');
      store.add({
        event_type: eventType,
        event_details: details,
        timestamp: new Date().toISOString()
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const examStorage = new ExamStorageManager();
