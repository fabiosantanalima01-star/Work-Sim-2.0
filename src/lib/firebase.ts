import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, doc, getDocFromServer, setDoc } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

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

export interface SyncAction {
  id: string;
  collection: string;
  docId: string;
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

  enqueue(collection: string, docId: string, data: any, merge: boolean = true) {
    const action: SyncAction = {
      id: Math.random().toString(36).substring(2, 11),
      collection,
      docId,
      data,
      merge,
      timestamp: Date.now()
    };
    const queue = this.getQueue();
    // Prevent duplicate pending updates for same doc - keep only latest
    const filtered = queue.filter(a => !(a.collection === collection && a.docId === docId));
    filtered.push(action);
    this.saveQueue(filtered);
  },

  async drainQueue() {
    if (!navigator.onLine) return;
    const queue = this.getQueue();
    if (queue.length === 0) return;

    const remaining: SyncAction[] = [];
    for (const action of queue) {
      try {
        await setDoc(doc(db, action.collection, action.docId), action.data, { merge: action.merge });
      } catch (err) {
        remaining.push(action);
      }
    }
    this.saveQueue(remaining);
  }
};

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => SyncManager.drainQueue());
}

export async function syncSetDoc(collectionName: string, docId: string, data: any, options: { merge?: boolean } = {}) {
  try {
    await setDoc(doc(db, collectionName, docId), data, options);
    SyncManager.drainQueue().catch(() => {});
  } catch (err: any) {
    const isNetworkError = !navigator.onLine || 
                           err.code === 'unavailable' || 
                           err.message?.toLowerCase().includes('network') ||
                           err.message?.toLowerCase().includes('offline');

    if (isNetworkError) {
      SyncManager.enqueue(collectionName, docId, data, options.merge);
    } else {
      throw err;
    }
  }
}

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
