import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer, setDoc, updateDoc, arrayUnion } from "firebase/firestore";
import firebaseConfigInternal from "../../firebase-applet-config.json";

// Prioritize environment variables for production (Vercel/Cloud Run)
const metaEnv = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: metaEnv.VITE_FIREBASE_API_KEY || firebaseConfigInternal.apiKey,
  authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfigInternal.authDomain,
  projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || firebaseConfigInternal.projectId,
  storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfigInternal.storageBucket,
  messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfigInternal.messagingSenderId,
  appId: metaEnv.VITE_FIREBASE_APP_ID || firebaseConfigInternal.appId,
  firestoreDatabaseId: metaEnv.VITE_FIREBASE_DATABASE_ID || (firebaseConfigInternal as any).firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
  useFetchStreams: false,
} as any, firebaseConfig.firestoreDatabaseId); /* CRITICAL: The app will break without this line */
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
    console.log(`[Queue] Action ${type} for ${collection} enqueued due to connectivity/domain issues.`);
  },

  async drainQueue() {
    // Attempt drain even if navigator.onLine is false, as it's unreliable.
    // The Firebase SDK will handle the actual connectivity check.
    const queue = this.getQueue();
    if (queue.length === 0) return;

    console.log(`[Queue] Attempting to drain ${queue.length} pending actions...`);
    const remaining: SyncAction[] = [];
    for (const action of queue) {
      try {
        if (action.type === SyncActionType.SET && action.docId) {
          await setDoc(doc(db, action.collection, action.docId), action.data, { merge: action.merge });
        } else if (action.type === SyncActionType.UPDATE && action.docId) {
          await updateDoc(doc(db, action.collection, action.docId), action.data);
        } else if (action.type === SyncActionType.DELETE && action.docId) {
          const { deleteDoc } = await import("firebase/firestore");
          await deleteDoc(doc(db, action.collection, action.docId));
        } else if (action.type === SyncActionType.ADD) {
          const { addDoc, collection } = await import("firebase/firestore");
          await addDoc(collection(db, action.collection), action.data);
        }
      } catch (err: any) {
        console.error(`[Queue] FAILED to process ${action.type} for ${action.collection} (ID: ${action.docId}):`, err.message);
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
  return !navigator.onLine || 
         code === 'unavailable' || 
         code === 'deadline-exceeded' ||
         code === 'resource-exhausted' ||
         code === 'auth/unauthorized-domain' || // Explicitly requested "domain" issues
         msg.includes('quota') ||
         msg.includes('exhausted') ||
         msg.includes('network') ||
         msg.includes('offline') ||
         msg.includes('domain') ||
         msg.includes('authorized domain');
};

export async function syncSetDoc(collectionName: string, docId: string, data: any, options: { merge?: boolean } = {}) {
  try {
    await setDoc(doc(db, collectionName, docId), data, options);
    SyncManager.drainQueue().catch(() => {});
  } catch (err: any) {
    if (isQueueableError(err)) {
      SyncManager.enqueue(SyncActionType.SET, collectionName, data, docId, options.merge);
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
    await updateDoc(doc(db, collectionName, docId), data);
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
