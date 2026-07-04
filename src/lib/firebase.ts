/// <reference types="vite/client" />
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import firebaseConfigInternal from "../../firebase-applet-config.json";

// Helper to sanitize environment variables and fall back to internal config if invalid/empty
const sanitizeEnv = (val: any): string | undefined => {
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim();
  if (!trimmed || trimmed === "undefined" || trimmed === "null" || trimmed.startsWith("{{") || trimmed.startsWith("__")) {
    return undefined;
  }
  return trimmed;
};

const sanitizeApiKey = (val: any): string | undefined => {
  const sanitized = sanitizeEnv(val);
  if (!sanitized) return undefined;
  // All valid Firebase/Google API keys start with "AIzaSy"
  if (!sanitized.startsWith("AIzaSy")) {
    return undefined;
  }
  return sanitized;
};

// Prioritize environment variables for production (Vercel/Cloud Run)
const firebaseConfig = {
  apiKey: sanitizeApiKey(import.meta.env.VITE_FIREBASE_API_KEY) || firebaseConfigInternal.apiKey,
  authDomain: sanitizeEnv(import.meta.env.VITE_FIREBASE_AUTH_DOMAIN) || firebaseConfigInternal.authDomain,
  projectId: sanitizeEnv(import.meta.env.VITE_FIREBASE_PROJECT_ID) || firebaseConfigInternal.projectId,
  storageBucket: sanitizeEnv(import.meta.env.VITE_FIREBASE_STORAGE_BUCKET) || firebaseConfigInternal.storageBucket,
  messagingSenderId: sanitizeEnv(import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID) || firebaseConfigInternal.messagingSenderId,
  appId: sanitizeEnv(import.meta.env.VITE_FIREBASE_APP_ID) || firebaseConfigInternal.appId,
  firestoreDatabaseId: sanitizeEnv(import.meta.env.VITE_FIREBASE_DATABASE_ID) || (firebaseConfigInternal as any).firestoreDatabaseId,
};

console.log("Firebase debug - raw VITE_FIREBASE_API_KEY:", import.meta.env.VITE_FIREBASE_API_KEY);
console.log("Firebase debug - internal apiKey:", firebaseConfigInternal.apiKey);
console.log("Firebase debug - resolved apiKey:", firebaseConfig.apiKey);

const app = initializeApp(firebaseConfig);
export const db = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== "(default)"
  ? initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    } as any, firebaseConfig.firestoreDatabaseId)
  : initializeFirestore(app, {
      experimentalForceLongPolling: true,
      useFetchStreams: false,
    } as any);
export const auth = getAuth();

/**
 * ENHANCED SYNC: LocalStorage Queue Manager
 */
const STORAGE_KEY = "simulabor_sync_queue";

export enum SyncActionType {
  SET = "SET",
  DELETE = "DELETE",
  ADD = "ADD",
  UPDATE = "UPDATE"
}

export interface SyncAction {
  id: string;
  type: SyncActionType;
  collection: string;
  docId?: string; // Optional for ADD
  data: any;
  merge?: boolean;
  timestamp: number;
}

let isQuotaExceededInternal = false;

export function checkQuotaExceeded(): boolean {
  try {
    return isQuotaExceededInternal || localStorage.getItem("firebase_quota_exceeded") === "true";
  } catch {
    return isQuotaExceededInternal;
  }
}

export function setQuotaExceeded(exceeded: boolean) {
  isQuotaExceededInternal = exceeded;
  try {
    if (exceeded) {
      localStorage.setItem("firebase_quota_exceeded", "true");
    } else {
      localStorage.removeItem("firebase_quota_exceeded");
    }
  } catch (e) {
    console.error("Failed to write quota state to localStorage", e);
  }
  
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("firebase-quota-exceeded", { detail: exceeded }));
  }
}

export function computeStudentDiff(baseline: any, current: any): any {
  if (!baseline) return current;
  const diff: any = {};
  let hasChanges = false;

  const keys = Object.keys(current);
  for (const key of keys) {
    if (key === "id") continue;
    const valCurrent = current[key];
    const valBaseline = baseline[key];

    const changed = JSON.stringify(valCurrent) !== JSON.stringify(valBaseline);
    if (changed) {
      diff[key] = valCurrent;
      hasChanges = true;
    }
  }

  if (hasChanges) {
    if (current.id) {
      diff.id = current.id;
    }
    return diff;
  }
  return null;
}

export const SyncManager = {
  getQueue(): SyncAction[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  },

  saveQueue(queue: SyncAction[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error("Sync Error:", e);
    }
  },

  getBaselines(): Record<string, any> {
    try {
      const raw = localStorage.getItem("simulabor_sync_baselines");
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  },

  getBaseline(collection: string, docId: string): any {
    return this.getBaselines()[`${collection}/${docId}`] || null;
  },

  setBaseline(collection: string, docId: string, data: any, overwrite: boolean = false) {
    try {
      const baselines = this.getBaselines();
      const key = `${collection}/${docId}`;
      if (overwrite) {
        baselines[key] = data;
      } else {
        const existing = baselines[key] || {};
        baselines[key] = { ...existing, ...data };
      }
      localStorage.setItem("simulabor_sync_baselines", JSON.stringify(baselines));
    } catch (e) {
      console.error("Failed to save baseline", e);
    }
  },

  enqueue(type: SyncActionType, collection: string, data: any, docId?: string, merge: boolean = true) {
    const action: SyncAction = {
      id: Math.random().toString(36).substring(2, 11),
      type,
      collection,
      docId,
      data,
      merge,
      timestamp: Date.now()
    };
    const queue = this.getQueue();
    // Prevent duplicate pending updates for same doc - keep only latest for SET
    let filtered = queue;
    if (type === SyncActionType.SET && docId) {
       filtered = queue.filter(a => !(a.type === SyncActionType.SET && a.collection === collection && a.docId === docId));
    }
    filtered.push(action);
    this.saveQueue(filtered);
    
    // Notify user or log
    console.log(`[Queue] Action ${type} for ${collection} enqueued due to connectivity/domain/quota issues.`);
  },

  async drainQueue() {
    // If quota is active, we completely pause automatic attempts to avoid spamming the console
    if (checkQuotaExceeded()) {
      console.log("[Queue] Sync queue draining paused: Firestore Daily Free Write Quota Exceeded. Safely keeping updates in offline storage.");
      return;
    }

    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[Queue] Attempting to drain ${queue.length} pending actions...`);
    const remaining: SyncAction[] = [];
    for (const action of queue) {
      try {
        if (action.type === SyncActionType.SET && action.docId) {
          let dataToSend = action.data;
          let finalMerge = action.merge;
          if (action.collection === "students") {
            const baseline = this.getBaseline(action.collection, action.docId);
            const diff = computeStudentDiff(baseline, action.data);
            if (diff === null) {
              console.log(`[Queue Diff-Sync] No changes for student ${action.docId}. Skipping.`);
              continue;
            }
            dataToSend = diff;
            finalMerge = true; // Always force merge true for student diffs
            console.log(`[Queue Diff-Sync] Syncing diff for student ${action.docId}:`, Object.keys(diff));
          }
          await setDoc(doc(db, action.collection, action.docId), dataToSend, { merge: finalMerge });
          if (action.collection === "students") {
            this.setBaseline(action.collection, action.docId, action.data);
          }
        } else if (action.type === SyncActionType.UPDATE && action.docId) {
          let dataToSend = action.data;
          if (action.collection === "students") {
            const baseline = this.getBaseline(action.collection, action.docId);
            const diff = computeStudentDiff(baseline, action.data);
            if (diff === null) {
              console.log(`[Queue Diff-Sync] No changes for student ${action.docId}. Skipping.`);
              continue;
            }
            dataToSend = diff;
            console.log(`[Queue Diff-Sync] Syncing diff update for student ${action.docId}:`, Object.keys(diff));
          }
          await updateDoc(doc(db, action.collection, action.docId), dataToSend);
          if (action.collection === "students") {
            this.setBaseline(action.collection, action.docId, action.data);
          }
        } else if (action.type === SyncActionType.DELETE && action.docId) {
          const { deleteDoc } = await import("firebase/firestore");
          await deleteDoc(doc(db, action.collection, action.docId));
        } else if (action.type === SyncActionType.ADD) {
          const { addDoc, collection } = await import("firebase/firestore");
          await addDoc(collection(db, action.collection), action.data);
        }
      } catch (err: any) {
        console.error(`[Queue] FAILED to process ${action.type} for ${action.collection} (ID: ${action.docId}):`, err.message);
        
        // Check if failed due to quota limit during drainage
        const msg = err.message?.toLowerCase() || "";
        const code = err.code || "";
        if (code === "resource-exhausted" || msg.includes("quota") || msg.includes("exhausted")) {
          setQuotaExceeded(true);
          console.warn("[Queue] Pausing remaining queue processing due to quota exhaustion.");
          remaining.push(action);
          // Append the rest of the queue without executing to keep it intact
          const index = queue.indexOf(action);
          if (index !== -1) {
            remaining.push(...queue.slice(index + 1));
          }
          break;
        }
        
        remaining.push(action);
      }
    }
    this.saveQueue(remaining);
    if (remaining.length === 0) {
      console.log("[Queue] All pending actions synchronized successfully.");
    } else {
      console.warn(`[Queue] Still ${remaining.length} items in queue.`);
    }
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => SyncManager.drainQueue());
  // Periodic check every 30 seconds
  setInterval(() => SyncManager.drainQueue(), 30000);
}

const isQueueableError = (err: any) => {
  const msg = err.message?.toLowerCase() || "";
  const code = err.code || "";
  const isQuota = code === 'resource-exhausted' || 
                  msg.includes('quota') || 
                  msg.includes('exhausted') ||
                  msg.includes('free daily write units');
  if (isQuota) {
    setQuotaExceeded(true);
  }
  return !navigator.onLine || 
         code === 'unavailable' || 
         code === 'deadline-exceeded' ||
         code === 'resource-exhausted' ||
         code === 'auth/unauthorized-domain' || // Explicitly requested "domain" issues
         isQuota ||
         msg.includes('network') ||
         msg.includes('offline') ||
         msg.includes('domain') ||
         msg.includes('authorized domain');
};

export async function syncSetDoc(collectionName: string, docId: string, data: any, options: { merge?: boolean } = {}) {
  try {
    let dataToSend = data;
    let finalOptions = options;
    if (collectionName === "students") {
      const baseline = SyncManager.getBaseline(collectionName, docId);
      const diff = computeStudentDiff(baseline, data);
      if (diff === null) {
        console.log(`[Diff-Sync] No changes detected for student ${docId}. Skipping Firestore setDoc.`);
        return;
      }
      dataToSend = diff;
      console.log(`[Diff-Sync] Sending setDoc diff for student ${docId}:`, Object.keys(diff));
      // Force merge: true for students collection to prevent erasing fields when writing diffs
      finalOptions = { ...options, merge: true };
    }

    await setDoc(doc(db, collectionName, docId), dataToSend, finalOptions);

    if (collectionName === "students") {
      SyncManager.setBaseline(collectionName, docId, data);
    }
    SyncManager.drainQueue().catch(() => {});
  } catch (err: any) {
    if (isQueueableError(err)) {
      SyncManager.enqueue(SyncActionType.SET, collectionName, data, docId, options.merge || (collectionName === "students" ? true : false));
    } else {
      throw err;
    }
  }
}

export async function syncAddDoc(collectionName: string, data: any) {
  try {
    const { addDoc, collection } = await import("firebase/firestore");
    await addDoc(collection(db, collectionName), data);
    SyncManager.drainQueue().catch(() => {});
  } catch (err: any) {
    if (isQueueableError(err)) {
      SyncManager.enqueue(SyncActionType.ADD, collectionName, data);
    } else {
      throw err;
    }
  }
}

export async function syncDeleteDoc(collectionName: string, docId: string) {
  try {
    const { deleteDoc } = await import("firebase/firestore");
    await deleteDoc(doc(db, collectionName, docId));
    SyncManager.drainQueue().catch(() => {});
  } catch (err: any) {
    if (isQueueableError(err)) {
      SyncManager.enqueue(SyncActionType.DELETE, collectionName, {}, docId);
    } else {
      throw err;
    }
  }
}

export async function syncUpdateDoc(collectionName: string, docId: string, data: any) {
  try {
    let dataToSend = data;
    if (collectionName === "students") {
      const baseline = SyncManager.getBaseline(collectionName, docId);
      const diff = computeStudentDiff(baseline, data);
      if (diff === null) {
        console.log(`[Diff-Sync] No changes detected for student ${docId}. Skipping Firestore updateDoc.`);
        return;
      }
      dataToSend = diff;
      console.log(`[Diff-Sync] Sending updateDoc diff for student ${docId}:`, Object.keys(diff));
    }

    await updateDoc(doc(db, collectionName, docId), dataToSend);

    if (collectionName === "students") {
      SyncManager.setBaseline(collectionName, docId, data);
    }
    SyncManager.drainQueue().catch(() => {});
  } catch (err: any) {
    if (isQueueableError(err)) {
      SyncManager.enqueue(SyncActionType.UPDATE, collectionName, data, docId);
    } else {
      throw err;
    }
  }
}

export { arrayUnion };

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, "test", "connection"));
    console.log("Firebase system connection verified.");
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes("the client is offline")) {
        console.warn("Please check your Firebase configuration. Client is offline.");
      } else {
        console.warn("Firebase connection initialization check: offline mode or temporary latency details:", error.message);
      }
    } else {
      console.warn("Firebase connection initialization check: unexpected offline/connection state.");
    }
  }
}

testConnection();
