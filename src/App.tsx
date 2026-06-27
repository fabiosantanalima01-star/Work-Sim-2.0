/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Student, Challenge, Badge, CareerPhase, SquadLog } from "./types";
import {
  CBOS_DATA,
  CAREER_PHASES,
  CHALLENGES_DATA,
  INITIAL_STUDENTS,
  BADGES_DATA,
} from "./data";
import ManualCalculator from "./components/ManualCalculator";
import InteractiveCalendar from "./components/InteractiveCalendar";
import CRMValidatorModal from "./components/CRMValidatorModal";
import MatrixIntro from "./components/MatrixIntro";
import SandboxMode from "./components/SandboxMode";
import ProfessorCockpit from "./components/ProfessorCockpit";
import InteractiveSeveranceGrid from "./components/InteractiveSeveranceGrid";
import ChatWindow from "./components/ChatWindow";
import StudentChatWindow from "./components/StudentChatWindow";
import CareerProgress from "./components/CareerProgress";
import HiringModal from "./components/HiringModal";
import MatrixBackground from "./components/MatrixBackground";
import StudentMetricsTab from "./components/StudentMetricsTab";
import LinguajarTranslator from "./components/LinguajarTranslator";
import DesempenhoPessoal from "./components/DesempenhoPessoal";
import RankingTab from "./components/RankingTab";
import BadgesTab from "./components/BadgesTab";
import TournamentTab from "./components/TournamentTab";
import ProfileProgressRing from "./components/ProfileProgressRing";
import WorkContractModal from "./components/WorkContractModal";
import NavigationTop from "./components/NavigationTop";
import { gerarCartaoPonto, getPointParamsForChallenge, getFichaFinanceiraDataForChallenge } from "./utils/timecard";
import { t, translateChallenge, translateModuleName, CHALLENGE_TRANSLATIONS } from "./utils/translations";
import { exportTRCTToPDF } from "./utils/pdfExport";
import { MatrixRain } from "./components/MatrixRain";
import { BADGE_DEFINITIONS } from "./badges";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

import QRScanner from "./components/QRScanner";

// Firebase Integration Client
import { db, auth, syncSetDoc, syncAddDoc, syncDeleteDoc, syncUpdateDoc, arrayUnion, OperationType, handleFirestoreError } from "./lib/firebase";
import { onAuthStateChanged, signInWithPopup, signOut, GoogleAuthProvider } from "firebase/auth";
import { collection, doc, setDoc, onSnapshot, deleteDoc, query, where, addDoc, getDocs } from "firebase/firestore";

import { motion, AnimatePresence } from "motion/react";
import {
  ShieldAlert,
  Award,
  Briefcase,
  BookOpen,
  Search,
  Download,
  Upload,
  Loader2,
  UserCheck,
  Bell,
  Calculator,
  SlidersHorizontal,
  Sparkles,
  LogIn,
  Terminal,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  User,
  ListFilter,
  Camera,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  LogOut,
  Volume2,
  VolumeX,
  Copy,
  PlusCircle,
  Lock,
  Unlock,
  Send,
  ReceiptText,
  HelpCircle,
  Clock,
  CheckSquare,
  Printer,
  TrendingUp,
  Sun,
  Moon,
  Languages,
  Menu,
  X,
  Timer,
  FileDown,
  Trophy,
  Users,
  Cloud,
  Database,
  RefreshCw,
  Zap,
  LayoutGrid,
  Mail,
  ShieldCheck,
} from "lucide-react";

import { formatBadgeName } from "./utils/nameFormatter";

// Utility to strip undefined values which are not allowed by Firestore setDoc
const sanitizeForFirestore = (data: any) => {
  if (!data) return data;
  return JSON.parse(JSON.stringify(data, (key, value) => (value === undefined ? null : value)));
};

export default function App() {
  // --- Infinite Loop Protection Ref ---
  const syncLoopCounterRef = useRef({ count: 0, lastReset: Date.now() });
  const lastFirestoreSyncedRef = useRef<Record<string, Student>>({});

  // --- CORE STATE (Moved to top to prevent ReferenceErrors) ---
  const [students, setStudents] = useState<Student[]>(() => {
    try {
      const cached = localStorage.getItem("worksim_students");
      return cached ? JSON.parse(cached) : INITIAL_STUDENTS;
    } catch (e) {
      console.error("Local storage students error", e);
      return INITIAL_STUDENTS;
    }
  });

  const [activeStudentId, setActiveStudentId] = useState<string | null>(() => {
    try {
      const cached = localStorage.getItem("worksim_active_student_id");
      if (!cached) return null;
      
      // Match checking
      const studentsRaw = localStorage.getItem("worksim_students");
      const currentStudents: Student[] = studentsRaw ? JSON.parse(studentsRaw) : INITIAL_STUDENTS;
      let matched = currentStudents.find((s) => s.id === cached);
      if (matched) {
        return cached;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const [firebaseUser, setFirebaseUser] = useState<any>(null);

  const [onboardingFinished, setOnboardingFinished] = useState<boolean>(() => {
    try {
      return localStorage.getItem("worksim_onboarding_finished") === "true";
    } catch (e) {
      return false;
    }
  });

  const activeStudent = students.find((s) => s.id === activeStudentId) || null;
  const isProfessorOrAdmin =
    (activeStudent?.matricula === "ADM2026") ||
    firebaseUser?.email?.toLowerCase() === "fabiosantanalima01@gmail.com";

  // --- OTHER STATES ---
  const appLoadedAt = useRef(Date.now());
  const [activeBroadcast, setActiveBroadcast] = useState<{ id: string, text: string } | null>(null);
  const loginBroadcastRef = useRef(false);

  const [customChallenges, setCustomChallenges] = useState<Challenge[]>(() => {
    try {
      const cached = localStorage.getItem("worksim_custom_challenges");
      return cached ? JSON.parse(cached) : [];
    } catch (e) {
      console.error("Local storage challenges error", e);
      return [];
    }
  });

  // --- Reset Admin Stats logic as requested via prompt ---
  useEffect(() => {
    const hasBeenReset = localStorage.getItem("worksim_admin_reset_2026_06_24_v3");
    if (!hasBeenReset && isProfessorOrAdmin) {
      const admStudentIndex = students.findIndex(s => s.id === "adm" || s.matricula === "ADM2026");
      if (admStudentIndex !== -1) {
        const resetStudents = [...students];
        resetStudents[admStudentIndex] = {
          ...resetStudents[admStudentIndex],
          xp: 0,
          precisao: 0.0,
          faseAtual: 0,
          respostasDesafios: {},
          saidasTela: 0,
          badges: [],
          // Preserve password if it already exists, otherwise allow Google sync
          senha: resetStudents[admStudentIndex].senha || ""
        };
        setStudents(resetStudents);
        localStorage.setItem("worksim_admin_reset_2026_06_24_v3", "true");
        // Also ensure Firestore is updated if syncing
        if (firebaseUser) {
          syncSetDoc("students", resetStudents[admStudentIndex].id, sanitizeForFirestore(resetStudents[admStudentIndex]), { merge: true }).catch(console.error);
        }
      }
    }
  }, [isProfessorOrAdmin, students, setStudents, firebaseUser]);

  const [squadLogs, setSquadLogs] = useState<SquadLog[]>(() => {
    const cached = localStorage.getItem("worksim_squad_logs");
    return cached ? JSON.parse(cached) : [];
  });

  const [isExportingIndividualQR, setIsExportingIndividualQR] = useState<boolean>(false);
  const [isBadgeFlipping, setIsBadgeFlipping] = useState<boolean>(false);
  const [isBadgePhotoModalOpen, setIsBadgePhotoModalOpen] = useState<boolean>(false);
  const [badgePhoto, setBadgePhoto] = useState<string | null>(() => localStorage.getItem("worksim_badge_photo"));
  const photoInputRef = useRef<HTMLInputElement>(null);

  const handleBadgePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert(appLanguage === "en" ? "Image must be under 2MB" : "A imagem deve ter no máximo 2MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const photoData = reader.result as string;
        setBadgePhoto(photoData);
        
        // Persist to Firestore if we have a logged-in student
        if (activeStudent) {
          try {
            await syncSetDoc("students", activeStudent.id, { foto: photoData }, { merge: true });
          } catch (err) {
            console.error("Error saving photo to Firestore:", err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDownloadBadge = async () => {
    if (!activeStudent) return;
    setIsBadgeFlipping(true);
    setIsExportingIndividualQR(true);
    
    // Play a "mechanical" or "success" sound for the flip start
    playSoundEffect("success");
    
    // Wait for the flip to reveal data (revealing "back" of badge briefly)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    try {
      const { exportIndividualBadgePDF } = await import("./utils/qrExporter");
      await exportIndividualBadgePDF(activeStudent, badgePhoto || undefined, appLanguage);
      playSoundEffect("success");
    } catch (err) {
      console.error(err);
      playSoundEffect("failure");
    } finally {
      // Flip back after a short delay
      setTimeout(() => {
        setIsBadgeFlipping(false);
        setIsExportingIndividualQR(false);
      }, 500);
    }
  };

  useEffect(() => {
    localStorage.setItem("worksim_custom_challenges", JSON.stringify(customChallenges));
  }, [customChallenges]);

  useEffect(() => {
    if (badgePhoto) localStorage.setItem("worksim_badge_photo", badgePhoto);
    else localStorage.removeItem("worksim_badge_photo");
  }, [badgePhoto]);

  useEffect(() => {
    localStorage.setItem("worksim_squad_logs", JSON.stringify(squadLogs));
  }, [squadLogs]);

  const allChallenges = [...CHALLENGES_DATA, ...customChallenges];

  const [completedChallenges, setCompletedChallenges] = useState<string[]>(
    () => {
      try {
        const cached = localStorage.getItem("worksim_completed_challenges");
        return cached ? JSON.parse(cached) : [];
      } catch (e) {
        console.error("Local storage completed challenges error", e);
        return [];
      }
    },
  );

  // Tracking current selected career module
  const [selectedPhaseId, setSelectedPhaseId] = useState<number>(0);
  const [selectedChallengeId, setSelectedChallengeId] = useState<string | null>(
    null,
  );
  const [challengeStartTime, setChallengeStartTime] = useState<number>(Date.now());

  // Reset challenge start time on active challenge change
  useEffect(() => {
    setChallengeStartTime(Date.now());
    
    // Maintain focus on the challenge viewer when it changes
    if (selectedChallengeId) {
      const viewer = document.getElementById("active-challenge-viewer");
      if (viewer) {
        // If it's already in view, don't jump too much, but ensure we are at the top of the card
        const rect = viewer.getBoundingClientRect();
        if (rect.top < 0 || rect.top > window.innerHeight * 0.8) {
          viewer.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      }
    }
  }, [selectedChallengeId]);

  const [severanceSelections, setSeveranceSelections] = useState<Record<string, Record<string, boolean>>>({});

  const [showMatrixIntro, setShowMatrixIntro] = useState<boolean>(false);
  const [isFirebaseSyncing, setIsFirebaseSyncing] = useState<boolean>(false);
  const [firebaseSyncError, setFirebaseSyncError] = useState<string | null>(null);

  const [isStudentChatOpen, setIsStudentChatOpen] = useState<boolean>(false);
  const [hasInitialStudentsLoaded, setHasInitialStudentsLoaded] = useState<boolean>(false);
  const [hasUnreadStudentChat, setHasUnreadStudentChat] = useState<boolean>(false);
  const [chatNotifications, setChatNotifications] = useState<{
    id: string;
    studentId: string;
    studentName: string;
    text: string;
    timestamp: string;
  }[]>([]);
  const [openChats, setOpenChats] = useState<string[]>([]);

  // Monitor Auth state change
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return unsubscribe;
  }, []);

  // Auto-login when firebaseUser is authenticated and matches a student record
  useEffect(() => {
    if (firebaseUser && firebaseUser.email && !activeStudentId) {
      const userEmail = firebaseUser.email.toLowerCase();
      const matched = students.find(s => s.email?.toLowerCase() === userEmail) || 
                      INITIAL_STUDENTS.find(s => s.email?.toLowerCase() === userEmail);
      if (matched) {
        setActiveStudentId(matched.id);
        setSelectedPhaseId(matched.faseAtual);
        setOnboardingFinished(true);
      } else if (userEmail === "fabiosantanalima01@gmail.com") {
        setActiveStudentId("adm");
        setOnboardingFinished(true);
      }
    }
  }, [firebaseUser, students, activeStudentId]);

  // Sync / Listen to Students from Firestore
  useEffect(() => {
    setIsFirebaseSyncing(true);
    const unsubscribe = onSnapshot(
      collection(db, "students"),
      (snapshot) => {
        const remoteStudents = snapshot.docs.map(doc => ({
          ...(doc.data() as Student),
          id: doc.id
        }));

        remoteStudents.forEach((remote) => {
          const oldData = lastFirestoreSyncedRef.current[remote.id];
          
          // Detect peer progress for notifications
          if (oldData && remote.id !== activeStudentId) {
            // New phase reached
            if (remote.faseAtual > oldData.faseAtual) {
              setAlerts((prev) => [
                {
                  id: Date.now() + Math.random(),
                  from: "Progressão Global",
                  text: `🔥 O aluno ${remote.nomeCompleto} (Matrícula ${remote.matricula}) acaba de subir para a FASE ${remote.faseAtual}!`,
                  time: "Agora",
                  type: "success"
                },
                ...prev
              ]);
              if (audioEnabled) playSoundEffect("success");
            }
            // Significant XP gain
            else if (remote.xp > oldData.xp + 50) {
               setAlerts((prev) => [
                {
                  id: Date.now() + Math.random(),
                  from: "Conquista Live",
                  text: `⭐ ${remote.nomeCompleto} ganhou +${remote.xp - oldData.xp} XP no Simulador!`,
                  time: "Agora",
                  type: "info"
                },
                ...prev
              ]);
            }
          }
          
          lastFirestoreSyncedRef.current[remote.id] = remote;
        });

        setStudents((localStudents) => {
          if (remoteStudents.length === 0) {
            return localStudents;
          }
          
          // Merge logic: Start with local students to preserve them
          const merged = [...localStudents];

          remoteStudents.forEach((remote) => {
            const localIdx = merged.findIndex((s) => s.id === remote.id);
            if (localIdx === -1) {
              // New student from remote
              merged.push(remote);
            } else {
              // Update existing student
              const local = merged[localIdx];

              // Handle notifications/chat for others
              if (remote.id !== activeStudentId) {
                if (isProfessorOrAdmin) {
                  const remoteMsgCount = remote.mensagensChat?.length || 0;
                  const localMsgCount = local.mensagensChat?.length || 0;
                  if (remoteMsgCount > localMsgCount) {
                    const lastMsg = remote.mensagensChat?.[remoteMsgCount - 1];
                    if (lastMsg && lastMsg.remetente !== "Professor" && lastMsg.remetente !== "Sistema") {
                      playSoundEffect(remote.soundTheme || "bip");
                      if (!openChats.includes(remote.id)) {
                        setChatNotifications((prev) => {
                          if (prev.some(n => n.id === lastMsg.id)) return prev;
                          return [...prev, {
                            id: lastMsg.id || `${Date.now()}-${Math.random()}`,
                            studentId: remote.id,
                            studentName: remote.nomeCompleto,
                            text: lastMsg.texto,
                            timestamp: lastMsg.timestamp,
                          }];
                        });
                      }
                    }
                  }
                }
                merged[localIdx] = remote;
              } else {
                // Handle chat for active student
                const remoteMsgCount = remote.mensagensChat?.length || 0;
                const localMsgCount = local.mensagensChat?.length || 0;
                if (remoteMsgCount > localMsgCount) {
                  const lastRemoteMsg = (remote.mensagensChat || [])[remoteMsgCount - 1];
                  if (lastRemoteMsg && lastRemoteMsg.remetente === "Professor") {
                    playSoundEffect("bip");
                    if (!isStudentChatOpen) setHasUnreadStudentChat(true);
                  }
                }
                
                merged[localIdx] = {
                  ...local,
                  ...remote,
                  xp: Math.max(local.xp || 0, remote.xp || 0),
                  faseAtual: Math.max(local.faseAtual || 0, remote.faseAtual || 0),
                  precisao: remote.precisao !== undefined ? remote.precisao : local.precisao,
                  respostasDesafios: {
                    ...(local.respostasDesafios || {}),
                    ...(remote.respostasDesafios || {}),
                  },
                  badges: Array.from(new Set([...(local.badges || []), ...(remote.badges || [])])),
                  // Synchronize password: if remote has it, use it; otherwise keep local
                  senha: remote.hasOwnProperty("senha") && remote.senha ? remote.senha : local.senha,
                  // Improved chat merge: preserve local messages if they are more recent/longer
                  mensagensChat: (remote.mensagensChat?.length || 0) >= (local.mensagensChat?.length || 0)
                    ? remote.mensagensChat
                    : local.mensagensChat,
                };
              }
            }
          });

          return merged;
        });
        setHasInitialStudentsLoaded(true);
        setIsFirebaseSyncing(false);
      },
      (error) => {
        console.error("Firestore onSnapshot error:", error);
        setFirebaseSyncError(error.message);
        setHasInitialStudentsLoaded(true);
        setIsFirebaseSyncing(false);
      }
    );

    return unsubscribe;
  }, [firebaseUser, activeStudentId, isProfessorOrAdmin, isStudentChatOpen]);

  // Sync / Listen to Custom Challenges from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "custom_challenges"),
      (snapshot) => {
        const remoteChallenges: Challenge[] = [];
        snapshot.forEach((doc) => {
          remoteChallenges.push(doc.data() as Challenge);
        });

        if (remoteChallenges.length > 0) {
          setCustomChallenges((localChallenges) => {
            const merged = [...localChallenges];
            remoteChallenges.forEach((remote) => {
              const idx = merged.findIndex((c) => c.id === remote.id);
              if (idx === -1) {
                merged.push(remote);
              } else {
                merged[idx] = remote;
              }
            });
            return merged;
          });
        }
      },
      (error) => {
        console.error("Firestore custom_challenges error:", error);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  // Sync / Listen to Feedbacks from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "feedbacks"),
      (snapshot) => {
        const remoteFeedbacks: any[] = [];
        snapshot.forEach((doc) => {
          remoteFeedbacks.push(doc.data());
        });

        if (remoteFeedbacks.length > 0) {
          // Sort reverse-chronologically by id
          remoteFeedbacks.sort((a, b) => b.id.localeCompare(a.id));
          setVeteranFeedbacks(remoteFeedbacks);
        } else {
          // Seed the sample if empty
          const sampleFb = {
            id: "fb-sample-1",
            veteranName: "Carlos Souza (Amostra)",
            veteranUser: "CARLOSVET",
            category: "Falha técnica em um cálculo de TRCT (Fase 3)",
            text: "Verifiquei que no Desafio 3.2 a contagem do DSR sobre as horas extras não bate com um centavo de arredondamento. Favor conferir no roteiro técnico se é para truncar ou arredondar.",
            timestamp: "27/05/2026, 14:15",
            emailTo: "fabiosantanalima01@gmail.com",
            status: "Lido"
          };
          syncSetDoc("feedbacks", sampleFb.id, sanitizeForFirestore(sampleFb)).catch((err) =>
            console.error("Erro ao semear feedback de amostra:", err)
          );
        }
      },
      (error) => {
        console.error("Firestore feedbacks sync error:", error);
      }
    );

    return unsubscribe;
  }, [firebaseUser]);

  // Daily Reset Check: reset bathroom breaks and screen exits each new day
  useEffect(() => {
    if (!activeStudentId) return;
    const activeStudent = students.find((s) => s.id === activeStudentId);
    if (!activeStudent) return;
    const todayISO = new Date().toISOString().split("T")[0];
    if (activeStudent.ultimaDataAcesso !== todayISO) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === activeStudentId) {
            return {
              ...s,
              ultimaDataAcesso: todayISO,
              pausasBanheiroUsadas: 0,
              saidasTela: 0,
              recuperadoDeBloqueio: false,
              tempoAcumuladoXP: 0,
              casosResolvidosNoCiclo: 0,
            };
          }
          return s;
        })
      );
    }
  }, [activeStudentId]);

  const syncQueueRef = useRef<{
    critical: Record<string, Student>;
    telemetry: Record<string, Student>;
  }>({ critical: {}, telemetry: {} });

  const syncTimersRef = useRef<{
    critical: any;
    telemetry: any;
  }>({ critical: null, telemetry: null });

  const processSyncQueue = useCallback((type: 'critical' | 'telemetry') => {
    if (!firebaseUser && !activeStudentId) return;
    const queue = syncQueueRef.current[type];
    const studentIds = Object.keys(queue);
    if (studentIds.length === 0) return;

    // Check for stable and battery-friendly network connection
    const isOnline = navigator.onLine;
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const isSlowConnection = connection && (connection.saveData || ['slow-2g', '2g'].includes(connection.effectiveType));
    const isStableNetwork = isOnline && !isSlowConnection;

    if (!isStableNetwork) {
      console.warn(`[Sync] Network offline or unstable. Postponing ${type} sync to save battery and traffic.`);
      // Postpone with longer wait time
      const delay = type === 'critical' ? 5000 : 45000;
      if (syncTimersRef.current[type]) {
        clearTimeout(syncTimersRef.current[type]);
      }
      syncTimersRef.current[type] = setTimeout(() => {
        processSyncQueue(type);
      }, delay);
      return;
    }

    studentIds.forEach(id => {
      const s = queue[id];
      lastFirestoreSyncedRef.current[s.id] = s;
      syncSetDoc("students", s.id, sanitizeForFirestore(s), { merge: true })
        .then(() => setFirebaseSyncError(null))
        .catch((err: any) => {
          if (err.code !== 'permission-denied') {
            console.error(`Error syncing ${type} data for student:`, id, err);
            setFirebaseSyncError(err.message || String(err));
          }
        });
    });

    // Clear queue after processing
    syncQueueRef.current[type] = {};
    syncTimersRef.current[type] = null;
  }, [firebaseUser, activeStudentId]);

  const queueSync = useCallback((student: Student, type: 'critical' | 'telemetry') => {
    syncQueueRef.current[type][student.id] = student;
    
    // Aggressive debounce: 2.5 seconds for critical changes, 35 seconds for telemetry to optimize traffic and battery
    const delay = type === 'critical' ? 2500 : 35000;
    
    if (syncTimersRef.current[type]) {
      clearTimeout(syncTimersRef.current[type]);
    }
    syncTimersRef.current[type] = setTimeout(() => {
      processSyncQueue(type);
    }, delay);
  }, [processSyncQueue]);

  // Handle immediate flushing when connection becomes stable/online
  useEffect(() => {
    const handleOnline = () => {
      console.log("[Sync] Device returned online. Flushes scheduled for pending sync queues.");
      if (Object.keys(syncQueueRef.current.critical).length > 0) {
        processSyncQueue('critical');
      }
      if (Object.keys(syncQueueRef.current.telemetry).length > 0) {
        processSyncQueue('telemetry');
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [processSyncQueue]);

  // Push local changes of students to Firestore with priority debouncing
  useEffect(() => {
    if (!firebaseUser && !activeStudentId) return;

    students.forEach((s) => {
      const synced = lastFirestoreSyncedRef.current[s.id];
      if (!synced) {
        // Initial sync if missing in remote cache
        lastFirestoreSyncedRef.current[s.id] = s;
        syncSetDoc("students", s.id, sanitizeForFirestore(s), { merge: true }).catch(console.error);
        return;
      }

      // Check for CRITICAL changes
      const isCriticalDiff = (
        synced.xp !== s.xp ||
        synced.faseAtual !== s.faseAtual ||
        synced.cargo !== s.cargo ||
        synced.senha !== s.senha ||
        synced.status !== s.status ||
        synced.precisao !== s.precisao ||
        JSON.stringify(synced.respostasDesafios || {}) !== JSON.stringify(s.respostasDesafios || {}) ||
        synced.xpAntecedente !== s.xpAntecedente ||
        synced.unlockedChallenges?.length !== s.unlockedChallenges?.length
      );

      // Check for TELEMETRY / NON-CRITICAL changes
      const isTelemetryDiff = (
        JSON.stringify(synced.duvidasHistorico || []) !== JSON.stringify(s.duvidasHistorico || []) ||
        JSON.stringify(synced.mensagensChat || []) !== JSON.stringify(s.mensagensChat || []) ||
        synced.saidasTela !== s.saidasTela ||
        synced.isTyping !== s.isTyping ||
        synced.profIsTyping !== s.profIsTyping ||
        synced.timeId !== s.timeId ||
        synced.timeLider !== s.timeLider ||
        synced.timeViceLider !== s.timeViceLider ||
        synced.chamadaNumero !== s.chamadaNumero ||
        synced.streakFasesAutonomas !== s.streakFasesAutonomas
      );

      const isSelf = s.id === activeStudentId;
      if (isSelf || isProfessorOrAdmin) {
        if (isCriticalDiff) {
          queueSync(s, 'critical');
        } else if (isTelemetryDiff) {
          queueSync(s, 'telemetry');
        }
      }
    });
  }, [students, firebaseUser, activeStudentId, isProfessorOrAdmin, queueSync]);

  const handleFirebaseGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    setIsFirebaseSyncing(true);
    setFirebaseSyncError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      playSoundEffect("success");
      
      // Attempt to auto-login if email matches a student record
      const userEmail = result.user.email;
      if (userEmail) {
        // If students list is empty or doesn't have the email, we might need to wait for sync 
        // or check INITIAL_STUDENTS directly as a fallback
        const matched = students.find(s => s.email === userEmail) || INITIAL_STUDENTS.find(s => s.email === userEmail);
        if (matched) {
          setActiveStudentId(matched.id);
          setSelectedPhaseId(matched.faseAtual);
          setOnboardingFinished(true);
          
          // Force a sync of this student to Firestore if it's missing
          if (!students.find(s => s.id === matched.id)) {
            setStudents(prev => prev.some(s => s.id === matched.id) ? prev : [...prev, matched]);
            // Ensure the matched student from INITIAL_STUDENTS is pushed to Firestore immediately
            syncSetDoc("students", matched.id, sanitizeForFirestore(matched), { merge: true }).catch(console.error);
          }
        } else if (userEmail === "fabiosantanalima01@gmail.com") {
          // Special case for admin if not in list
          const adminStub = INITIAL_STUDENTS.find(s => s.id === "adm") || {
             id: "adm",
             nomeCompleto: "Professor Fábio",
             matricula: "ADM2026",
             email: userEmail,
             xp: 0,
             precisao: 100,
             faseAtual: 8,
             status: "Ativo",
             senha: "" // Ensure no password for Google admin
          } as any;
          
          setActiveStudentId(adminStub.id);
          setStudents(prev => {
             // Explicitly clear password for admin in state to fix local persistence issue
             const updated = prev.map(s => (s.id === "adm" || s.matricula === "ADM2026") ? { ...s, senha: "", email: userEmail } : s);
             if (!updated.some(s => s.id === adminStub.id)) {
                return [...updated, adminStub];
             }
             return updated;
          });
          setOnboardingFinished(true);
          // Sync admin stub to Firestore
          syncSetDoc("students", adminStub.id, sanitizeForFirestore(adminStub), { merge: true }).catch(console.error);
          
          // AUTO-SYNC ALL STUDENTS if it's the professor and they just logged in
          const syncAll = async () => {
             const syncPromises = students.map(s => 
               syncSetDoc("students", s.id, sanitizeForFirestore(s), { merge: true })
             );
             await Promise.all(syncPromises);
             console.log("Professor auto-sync complete");
          };
          syncAll().catch(console.error);
        } else {
          // AUTO-REGISTER NEW STUDENT (Fixes black screen for unknown Google logins)
          const newId = result.user.uid;
          const newMatricula = `RH-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
          const newStudent: Student = {
            id: newId,
            nomeCompleto: result.user.displayName || "Novo Aluno(a)",
            matricula: newMatricula,
            email: userEmail,
            xp: 0,
            precisao: 0,
            faseAtual: 0,
            status: "Ativo",
            sala: "Online",
            cargo: "Estudante",
            mensagensChat: [],
            respostasDesafios: {},
            badges: [],
            ultimaDataAcesso: new Date().toISOString().split("T")[0],
          } as any;
          
          setActiveStudentId(newId);
          setStudents(prev => [...prev, newStudent]);
          setOnboardingFinished(true);
          syncSetDoc("students", newId, sanitizeForFirestore(newStudent), { merge: true }).catch(console.error);
          
          // Show Matrix Intro for new students
          setShowMatrixIntro(true);
        }
      }
    } catch (err: any) {
      console.error("Firebase Login error:", err);
      setFirebaseSyncError(err.message || String(err));
      
      if (err.code === "auth/popup-closed-by-user") {
        setLoginErrorMessage("A janela de login do Google foi fechada antes de completar o processo. No Edge/Safari, certifique-se de que popups são permitidos e o bloqueio de rastreamento não está no 'Estrito'.");
      } else if (err.code === "auth/unauthorized-domain") {
         const currentHost = window.location.hostname;
         alert(`ERRO DE DOMÍNIO: O domínio "${currentHost}" não está autorizado no Firebase Authentication.
         
Para resolver:
1. Vá ao Firebase Console (https://console.firebase.google.com)
2. Acesse Authentication -> Settings -> Authorized Domains
3. Adicione "${currentHost}" à lista.
4. Tente novamente.`);
      } else {
         setLoginErrorMessage("Erro ao conectar com Google: " + (err.message || String(err)));
         alert("Erro ao conectar com Google: " + (err.message || String(err)));
      }
      playSoundEffect("failure");
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  const handleFirebaseLogout = async () => {
    setIsFirebaseSyncing(true);
    try {
      await signOut(auth);
      playSoundEffect("success");
      // Also trigger local logout to clear session states and avoid ghost local data
      handleLogout();
    } catch (err: any) {
      console.error(err);
      setFirebaseSyncError(err.message || String(err));
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Login Gate inputs
  const [inputMatricula, setInputMatricula] = useState<string>("");
  const [inputNome, setInputNome] = useState<string>("");
  const [inputPassword, setInputPassword] = useState<string>("");
  const [loginErrorMessage, setLoginErrorMessage] = useState<string>("");
  const [isActivatingNewAccount, setIsActivatingNewAccount] =
    useState<boolean>(false);
  const [loginStep, setLoginStep] = useState<"matricula" | "password" | "activation">("matricula");
  const [showQRScanner, setShowQRScanner] = useState<boolean>(false);
  const [isExportingQR, setIsExportingQR] = useState<boolean>(false);

  const handleQRCodeScanned = (data: string) => {
    setShowQRScanner(false);
    setLoginErrorMessage("");
    
    try {
      let scannedMatricula = "";
      let scannedNome = "";

      // Try parsing as JSON first
      if (data.startsWith("{") && data.endsWith("}")) {
        const parsed = JSON.parse(data);
        if (parsed.matricula) scannedMatricula = parsed.matricula;
        if (parsed.nome) scannedNome = parsed.nome;
      } else {
        // Try formats like "MATRICULA;NOME" or "MATRICULA|NOME"
        const separators = [";", "|", ":"];
        let separatorFound = false;
        for (const sep of separators) {
          if (data.includes(sep)) {
            const parts = data.split(sep);
            scannedMatricula = parts[0].trim();
            if (parts[1]) {
              scannedNome = parts[1].trim();
            }
            separatorFound = true;
            break;
          }
        }
        if (!separatorFound) {
          scannedMatricula = data.trim();
        }
      }

      const targetMatriculaStr = scannedMatricula.trim().toUpperCase();
      const targetMatricula = targetMatriculaStr === "ADM" ? "ADM2026" : targetMatriculaStr;

      // Match checking
      let matched = students.find((s) => s.matricula === targetMatricula);
      if (!matched && targetMatricula === "ADM2026") {
        const adminBase = INITIAL_STUDENTS.find((s) => s.matricula === "ADM2026");
        if (adminBase) {
          setStudents((prev) => {
            if (!prev.some((p) => p.matricula === "ADM2026")) {
              return [...prev, adminBase];
            }
            return prev;
          });
          matched = adminBase;
        }
      }

      if (matched) {
        // QR login now always requires password confirmation for security
        setInputMatricula(targetMatricula);
        if (scannedNome) setInputNome(scannedNome);
        
        if (matched.status === "Ativo" && matched.senha) {
          setLoginStep("password");
          setIsActivatingNewAccount(false);
          setLoginErrorMessage("Crachá identificado. Confirme sua senha de acesso.");
          playSoundEffect("success");
        } else {
          // If not active or no password, fall back to setting inputs and showing activation flow
          if (!matched.senha) {
            setLoginStep("activation");
            setIsActivatingNewAccount(true);
          } else {
            setLoginStep("password");
            setIsActivatingNewAccount(false);
          }
          
          setLoginErrorMessage("Acesso via QR identificado. Por favor, " + (!matched.senha ? "ative sua conta definindo uma senha." : "confirme sua senha de acesso."));
          playSoundEffect("success");
        }
      } else {
        // If not found, check if it's a veteran trying to self-register
        const veteranCount = students.filter(s => s.isVeterano).length;
        if (veteranCount < 10) {
          setInputMatricula(scannedMatricula);
          if (scannedNome) setInputNome(scannedNome);
          setLoginStep("activation");
          setIsActivatingNewAccount(true);
          setLoginErrorMessage("Matrícula não pré-enrolada. Identificado como potencial novo Veterano (Vaga disponível: " + (10 - veteranCount) + ").");
          playSoundEffect("success");
        } else {
          setLoginErrorMessage("Matrícula escaneada por QR não localizada no banco de dados e limite de ingressos (veteranos) atingido.");
          playSoundEffect("failure");
        }
      }
      
    } catch (e) {
      console.error("QR Code parse error", e);
      setInputMatricula(data.trim());
      setLoginErrorMessage("Erro ao ler código QR. Certifique-se de usar um crachá de acesso válido.");
      playSoundEffect("failure");
    }
  };

  // Veteran testing state engines
  const [isVeteranTab, setIsVeteranTab] = useState<boolean>(false);
  const [isVeteranRegister, setIsVeteranRegister] = useState<boolean>(false);
  const [veteranNome, setVeteranNome] = useState<string>("");
  const [veteranUsuario, setVeteranUsuario] = useState<string>("");
  const [veteranSenha, setVeteranSenha] = useState<string>("");

  // Persisted Veteran Feedback Email Simulator
  const [veteranFeedbacks, setVeteranFeedbacks] = useState<any[]>(() => {
    const cached = localStorage.getItem("worksim_veteran_feedbacks");
    return cached ? JSON.parse(cached) : [
      {
        id: "fb-sample-1",
        veteranName: "Carlos Souza (Amostra)",
        veteranUser: "CARLOSVET",
        category: "Falha técnica em um cálculo de TRCT (Fase 3)",
        text: "Verifiquei que no Desafio 3.2 a contagem do DSR sobre as horas extras não bate com um centavo de arredondamento. Favor conferir no roteiro técnico se é para truncar ou arredondar.",
        timestamp: "27/05/2026, 14:15",
        emailTo: "fabiosantanalima01@gmail.com",
        status: "Lido"
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem("worksim_veteran_feedbacks", JSON.stringify(veteranFeedbacks));
  }, [veteranFeedbacks]);

  const handleSetVeteranFeedbacks = async (action: any) => {
    let nextValue: any[];
    if (typeof action === "function") {
      nextValue = action(veteranFeedbacks);
    } else {
      nextValue = action;
    }

    if (firebaseUser) {
      // 1. Detect deleted items
      const deleted = veteranFeedbacks.filter(
        (prevItem) => !nextValue.some((nextItem) => nextItem.id === prevItem.id)
      );
      for (const fb of deleted) {
        try {
          await syncDeleteDoc("feedbacks", fb.id);
        } catch (err) {
          console.error("Erro ao deletar feedback no Firestore:", err);
        }
      }

      // 2. Detect added or modified items
      const updatedOrAdded = nextValue.filter((nextItem) => {
        const prevItem = veteranFeedbacks.find((p) => p.id === nextItem.id);
        return !prevItem || JSON.stringify(prevItem) !== JSON.stringify(nextItem);
      });
      for (const fb of updatedOrAdded) {
        try {
          await syncSetDoc("feedbacks", fb.id, sanitizeForFirestore(fb));
        } catch (err) {
          console.error("Erro ao salvar feedback no Firestore:", err);
        }
      }
    }

    setVeteranFeedbacks(nextValue);
  };

  const [veteranFeedbackFilter, setVeteranFeedbackFilter] = useState<string>("Todos");

  // Audio configuration
  const [audioEnabled, setAudioEnabled] = useState<boolean>(true);

  // Day / Night Theme selector: "dark" or "light"
  const [themeMode, setThemeMode] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("worksim_theme_mode");
    return (saved as "dark" | "light") || "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    root.classList.remove("theme-light", "theme-dark");
    body.classList.remove("theme-light", "theme-dark");
    const themeClass = themeMode === "light" ? "theme-light" : "theme-dark";
    root.classList.add(themeClass);
    body.classList.add(themeClass);
  }, [themeMode]);

  const toggleThemeMode = () => {
    const nextTheme = themeMode === "dark" ? "light" : "dark";
    setThemeMode(nextTheme);
    localStorage.setItem("worksim_theme_mode", nextTheme);
  };

  // Current active interactive view within the main workstation
  const [currentTab, setCurrentTab] = useState<
    "challenges" | "metrics" | "sandbox" | "professor" | "feedback" | "linguajar" | "desempenho" | "ranking" | "badges"
  >("challenges");

  const [linguajarMode, setLinguajarMode] = useState<"formal" | "gira">(() => {
    const saved = localStorage.getItem("worksim_linguajar");
    return (saved as "formal" | "gira") || "formal";
  });

  // Map linguajarMode internally: "formal" -> Portuguese ("pt"), "gira" -> English ("en")
  const appLanguage: "pt" | "en" = linguajarMode === "gira" ? "en" : "pt";
  const setAppLanguage = (lang: "pt" | "en") => {
    const mode = lang === "en" ? "gira" : "formal";
    setLinguajarMode(mode);
    localStorage.setItem("worksim_linguajar", mode);
  };

  const [translatedChallengesCache, setTranslatedChallengesCache] = useState<Record<string, any>>({});
  const [isTranslatingChallenge, setIsTranslatingChallenge] = useState<boolean>(false);

  // Dynamic AI translation hook for Phase -1 (f-1) challenges when English (gira) mode is active
  useEffect(() => {
    if (appLanguage !== "en" || !selectedChallengeId) return;
    const rawChallenge = allChallenges.find((c) => c.id === selectedChallengeId);
    if (!rawChallenge || rawChallenge.fase !== -1) return;

    // Check if already in cache
    if (translatedChallengesCache[selectedChallengeId]) return;

    // Fetch translation on-the-fly
    setIsTranslatingChallenge(true);
    fetch("/api/translate-challenge", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ challenge: rawChallenge })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Translation request failed");
        return res.json();
      })
      .then((data) => {
        // Construct the translated challenge structure
        const translated = {
          ...rawChallenge,
          titulo: data.titulo,
          queixa: data.queixa,
          focoTecnico: data.focoTecnico,
          opcoes: rawChallenge.opcoes ? rawChallenge.opcoes.map((opt) => {
            const foundOpt = data.opcoes?.find((o: any) => o.id === opt.id);
            return {
              ...opt,
              texto: foundOpt ? foundOpt.texto : opt.texto
            };
          }) : [],
          gabarito: rawChallenge.gabarito ? {
            ...rawChallenge.gabarito,
            valoresCorretos: rawChallenge.gabarito.valoresCorretos ? {
              ...rawChallenge.gabarito.valoresCorretos,
              justificativa: data.justificativa || rawChallenge.gabarito.valoresCorretos.justificativa
            } : undefined
          } : undefined
        };

        setTranslatedChallengesCache((prev) => ({
          ...prev,
          [selectedChallengeId]: translated
        }));
      })
      .catch((err) => {
        console.error("Failed to translate challenge, using local fallback:", err);
        const fallback = translateChallenge(rawChallenge, "en");
        setTranslatedChallengesCache((prev) => ({
          ...prev,
          [selectedChallengeId]: fallback
        }));
      })
      .finally(() => {
        setIsTranslatingChallenge(false);
      });
  }, [selectedChallengeId, appLanguage, allChallenges, translatedChallengesCache]);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Focus Mode (minimizes/collapses left navigation panel)
  const [isFocusedMode, setIsFocusedMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem("worksim_focused_mode") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleFocusedMode = () => {
    setIsFocusedMode((prev) => {
      const next = !prev;
      localStorage.setItem("worksim_focused_mode", next ? "true" : "false");
      return next;
    });
  };

  // Sidebar Collapsed state (persisted)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try {
      return localStorage.getItem("worksim_sidebar_collapsed") === "true";
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("worksim_sidebar_collapsed", next ? "true" : "false");
      return next;
    });
  };

  // Sidebar ranking expansion state (persisted)
  const [isSidebarRankingExpanded, setIsSidebarRankingExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem("worksim_sidebar_ranking_expanded");
    return saved !== "false"; // default to true
  });
  const setSidebarRankingExpanded = (val: boolean) => {
    setIsSidebarRankingExpanded(val);
    localStorage.setItem("worksim_sidebar_ranking_expanded", val ? "true" : "false");
  };

  const [isGridCollapsed, setIsGridCollapsed] = useState<boolean>(true);

  // Selected CRM check properties
  const [activeCrmCheck, setActiveCrmCheck] = useState<{
    medico: string;
    crm: string;
  } | null>(null);
  const [showHiringModal, setShowHiringModal] = useState<boolean>(false);
  const [matrixCountdown, setMatrixCountdown] = useState<number | null>(null);
  const [completedPhaseTransition, setCompletedPhaseTransition] = useState<{
    from: number;
    to: number;
  } | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });
  const [showStreakCelebration, setShowStreakCelebration] = useState<boolean>(false);
  const [showDoubtPopup, setShowDoubtPopup] = useState<boolean>(false);
  const [doubtTextValue, setDoubtTextValue] = useState<string>("");

  // Sorting students dynamically for the sidebar ranking widget
  const sortStudentsForLeaderboard = (a: Student, b: Student): number => {
    if (b.xp !== a.xp) {
      return b.xp - a.xp;
    }
    if (a.timeId && b.timeId && a.timeId === b.timeId) {
      if (a.timeLider && !b.timeLider) return -1;
      if (b.timeLider && !a.timeLider) return 1;
      if (a.timeViceLider && !b.timeViceLider) return -1;
      if (b.timeViceLider && !a.timeViceLider) return 1;
      const numA = parseInt(a.chamadaNumero || "99", 10);
      const numB = parseInt(b.chamadaNumero || "99", 10);
      return numA - numB;
    }
    const numA = parseInt(a.chamadaNumero || "99", 10);
    const numB = parseInt(b.chamadaNumero || "99", 10);
    if (numA !== numB) {
      return numA - numB;
    }
    return a.nomeCompleto.localeCompare(b.nomeCompleto);
  };

  const sortedLeaderboardStudents = [...students].sort(sortStudentsForLeaderboard);

  // Computing rank indexes
  const getRankedLeaderboardStudents = () => {
    let currentRankCounter = 1;
    return sortedLeaderboardStudents.map((stu, index, arr) => {
      if (index > 0) {
        const prev = arr[index - 1];
        const sameXP = stu.xp === prev.xp;
        const sameTeam = stu.timeId && prev.timeId && stu.timeId === prev.timeId;
        if (!sameXP && !sameTeam) {
          currentRankCounter = index + 1;
        }
      }
      return {
        student: stu,
        rank: currentRankCounter
      };
    });
  };

  const rankedLeaderboardStudents = getRankedLeaderboardStudents();

  // TRCT Interactive User Calculations Worksheets (Phase 3 Challenges)
  const [trctSaldoInput, setTrctSaldoInput] = useState<string>("");
  const [trctAvisoInput, setTrctAvisoInput] = useState<string>("");
  const [trctDecimoInput, setTrctDecimoInput] = useState<string>("");
  const [trctFeriasInput, setTrctFeriasInput] = useState<string>("");
  const [trctMultaInput, setTrctMultaInput] = useState<string>("");
  const [crisisInputs, setCrisisInputs] = useState<Record<string, string>>({
    salario: "",
    mediaHe: "",
    insalubridade: "",
    periculosidade: "",
    horasExtras: "",
    adicionalNoturno: "",
    comissoes: "",
    dsrHe: "",
    inss: "",
    irrf: "",
    vt: "",
    faltasDesconto: "",
    salarioFamilia: "",
    baseFgts: "",
    fgts: "",
  });
  const handleInputChange = (field: string, val: string) => {
    setCrisisInputs((prev) => ({
      ...prev,
      [field]: val,
    }));
  };
  const [trctResultMsg, setTrctResultMsg] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Dedicated helper to parse Brazilian decimal strings safely
  const [dismissedWarningCount, setDismissedWarningCount] = useState<number>(0);
  const [warningFontSizeMultiplier, setWarningFontSizeMultiplier] = useState<number>(() => {
    const saved = localStorage.getItem("worksim_warning_font_size");
    return saved ? parseFloat(saved) : 1.25;
  });
  const updateWarningFontSize = (multiplier: number) => {
    const nextSize = Math.max(0.9, Math.min(2.0, multiplier));
    setWarningFontSizeMultiplier(nextSize);
    localStorage.setItem("worksim_warning_font_size", nextSize.toString());
  };
  const openChat = (student: Student) => {
    if (openChats.includes(student.id)) {
      // If already open, just clear notifications for safety
      setChatNotifications(prev => prev.filter(n => n.studentId !== student.id));
      return;
    }
    const newChats = [...openChats, student.id];
    if (newChats.length > 3) newChats.shift();
    setOpenChats(newChats);
    // Clear notification for this student when window is opened
    setChatNotifications(prev => prev.filter(n => n.studentId !== student.id));
  };
  const closeChat = (studentId: string) => {
    setOpenChats(openChats.filter((id) => id !== studentId));
  };
  const handleTypingChange = (studentId: string, isTyping: boolean, remetente: "Professor" | "Estudante") => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            [remetente === "Professor" ? "profIsTyping" : "isTyping"]: isTyping,
          };
        }
        return s;
      })
    );
  };
  const handleSendChatMessage = (studentId: string, text: string) => {
    if (!text.trim()) return;
    
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR");
    const newMsg = {
      id: `${Date.now()}-${Math.random()}`,
      remetente: "Professor",
      texto: text.trim(),
      timestamp: timeStr,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );
    playSoundEffect("success");

    // Sync via arrayUnion to Firestore
    if (firebaseUser) {
      syncUpdateDoc("students", studentId, {
        mensagensChat: arrayUnion(newMsg)
      }).catch(console.error);
    }
  };

  const handleSendStudentChatMessage = (studentId: string, text: string) => {
    if (!text.trim()) return;
    const now = new Date();
    const timeStr = now.toLocaleTimeString("pt-BR");
    const mId = `${Date.now()}-${Math.random()}`;
    const newMsg = {
      id: mId,
      remetente: activeStudent?.nomeCompleto || "Estudante",
      texto: text.trim(),
      timestamp: timeStr,
    };

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          return {
            ...s,
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );
    playSoundEffect("success");

    // Sync via arrayUnion
    if (firebaseUser) {
      syncUpdateDoc("students", studentId, {
        mensagensChat: arrayUnion(newMsg)
      }).catch(console.error);
    }

    // Add alert notification for professor
    const targetStudent = students.find(x => x.id === studentId);
    if (targetStudent) {
      setChatNotifications((prev) => [
        ...prev,
        {
          id: mId,
          studentId: targetStudent.id,
          studentName: targetStudent.nomeCompleto,
          text: text.trim(),
          timestamp: timeStr,
        }
      ]);
    }

    // Push alert on Professor console
    const studName = targetStudent?.nomeCompleto || "Estudante";
    setAlerts((prevAlerts) => [
      {
        id: Date.now(),
        from: `IntraChat: ${studName}`,
        text: `Enviou mensagem direta no Chat Online: "${text.trim().substring(0, 40)}${text.trim().length > 40 ? "..." : ""}"`,
        time: "Agora",
      },
      ...prevAlerts,
    ]);

    // Telemetry log
    if (activeStudent) {
      syncAddDoc("logs", {
        studentId: activeStudent.id,
        studentName: activeStudent.nomeCompleto,
        type: "chat-message",
        from: `IntraChat: ${activeStudent.nomeCompleto}`,
        text: `Enviou mensagem direta no Chat Online: "${text.trim().substring(0, 40)}${text.trim().length > 40 ? "..." : ""}"`,
        timestamp: Date.now()
      }).catch(console.error);
    }
  };

  const handleTabChange = (tab: typeof currentTab) => {
    setCurrentTab(tab);
    setIsMobileMenuOpen(false);
  };

  const handleResetStudentFocus = (studentId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString("pt-BR");
          const newMsg = {
            id: `${Date.now()}-${Math.random()}`,
            remetente: "Sistema",
            texto: `SISTEMA 🛠️: O Professor/Monitoria desbloqueou esta estação às ${timeStr}. O histórico de XP e desafios foi preservado (Auditoria: -5%). ATENÇÃO: Tolerância esgotada! Qualquer nova saída resultará em bloqueio imediato.`,
            timestamp: timeStr,
          };
          return {
            ...s,
            saidasTela: 0,
            focoStatus: "Ativo",
            tentativaFraude: 0,
            contaBloqueada: false,
            recuperadoDeBloqueio: true, // Loss of all focus tolerance
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );

    // Persist focus reset to Firestore
    syncSetDoc("students", studentId, {
      saidasTela: 0,
      focoStatus: "Ativo",
      tentativaFraude: 0,
      contaBloqueada: false,
      recuperadoDeBloqueio: true
    }, { merge: true }).catch(err => handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`));

    playSoundEffect("success");
  };
  const parseFormattedDecimal = (val: string) => {
    if (!val) return 0;
    const trimmed = val.trim();
    if (trimmed === "" || trimmed === "-") return 0;
    const cleanSymbol = trimmed.replace(/R\$\s?/g, "");
    if (cleanSymbol.includes(",")) {
      const clean = cleanSymbol.replace(/\./g, "").replace(",", ".");
      const num = parseFloat(clean);
      return isNaN(num) ? 0 : num;
    }
    const num = parseFloat(cleanSymbol);
    return isNaN(num) ? 0 : num;
  };

  const calcTotalVencimentos = () => {
    return (
      parseFormattedDecimal(crisisInputs.salario || "0") +
      parseFormattedDecimal(crisisInputs.mediaHe || "0") +
      parseFormattedDecimal(crisisInputs.insalubridade || "0") +
      parseFormattedDecimal(crisisInputs.periculosidade || "0") +
      parseFormattedDecimal(crisisInputs.horasExtras || "0") +
      parseFormattedDecimal(crisisInputs.adicionalNoturno || "0") +
      parseFormattedDecimal(crisisInputs.comissoes || "0") +
      parseFormattedDecimal(crisisInputs.dsrHe || "0") +
      parseFormattedDecimal(crisisInputs.salarioFamilia || "0")
    );
  };

  const calcTotalDescontos = () => {
    return (
      parseFormattedDecimal(crisisInputs.inss || "0") +
      parseFormattedDecimal(crisisInputs.irrf || "0") +
      parseFormattedDecimal(crisisInputs.vt || "0") +
      parseFormattedDecimal(crisisInputs.faltasDesconto || "0")
    );
  };

  const calcNetLiquido = () => {
    return calcTotalVencimentos() - calcTotalDescontos();
  };

  // Selected MCQ option state
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [challengeFeedback, setChallengeFeedback] = useState<{
    isCorrect: boolean;
    text: string;
    article: string;
  } | null>(null);
  const [activeAttachmentTab, setActiveAttachmentTab] = useState<
    "atestado" | "obito"
  >("atestado");
  const [phase3Tab, setPhase3Tab] = useState<
    "caso" | "contrato" | "remuneracao" | "holerite" | "ponto" | "atestados"
  >("caso");

  const phaseChallenges = useMemo(() => {
    return allChallenges
      .filter((c) => c.fase === selectedPhaseId)
      .map((c) => {
        if (appLanguage === "en" && c.fase === -1) {
          const hasDictionary = !!CHALLENGE_TRANSLATIONS[c.id];
          if (!hasDictionary && translatedChallengesCache[c.id]) {
            const cached = translatedChallengesCache[c.id];
            return {
              ...cached,
              titulo: (cached.titulo || "").toUpperCase(),
              focoTecnico: (cached.focoTecnico || "").toUpperCase(),
            };
          }
        }
        return translateChallenge(c, appLanguage);
      });
  }, [allChallenges, selectedPhaseId, appLanguage, translatedChallengesCache]);

  const rawActiveChallenge =
    allChallenges.find((c) => c.id === selectedChallengeId) || null;
  
  const activeChallenge = useMemo(() => {
    if (!rawActiveChallenge) return null;
    
    // 1. Get dictionary translation
    const dictTranslated = translateChallenge(rawActiveChallenge, appLanguage);
    
    // 2. For Phase -1, if English is active but not in dictionary, allow AI cache
    if (appLanguage === "en" && rawActiveChallenge.fase === -1) {
      // If we have an AI translation in cache, and it's not already in the hardcoded dictionary
      // (Dictionary is always preferred for precision)
      const hasDictionary = !!CHALLENGE_TRANSLATIONS[rawActiveChallenge.id];
      if (!hasDictionary && translatedChallengesCache[rawActiveChallenge.id]) {
        const cached = translatedChallengesCache[rawActiveChallenge.id];
        return {
          ...cached,
          titulo: (cached.titulo || "").toUpperCase(),
          focoTecnico: (cached.focoTecnico || "").toUpperCase(),
        };
      }
    }
    
    return dictTranslated;
  }, [rawActiveChallenge, appLanguage, translatedChallengesCache]);

  // Active progression time constraints (3 min inactivity block + 10 min 10XP tracking)
  const [inactivitySeconds, setInactivitySeconds] = useState<number>(0);
  const [isScreenBlocked, setIsScreenBlocked] = useState<boolean>(false);

  // Alert Inbox notifications
  const [alerts, setAlerts] = useState<
    { id: number; from: string; text: string; time: string }[]
  >([
    {
      id: 1,
      from: "Marcos (Gerente de Gente & Gestão)",
      text: "Bem-vindo à Global Logística S.A.!",
      time: "Agora",
    },
    {
      id: 2,
      from: "Alerta de e-Social",
      text: "Processamentos da folha integrados com o FGTS Digital.",
      time: "1 min atrás",
    },
  ]);

  // --- REAL-TIME TEAM POINT AND PROGRESS SYNCHRONIZATION ENGINE ---
  useEffect(() => {
    // Infinite Loop Protection Check
    const now = Date.now();
    const loop = syncLoopCounterRef.current;
    if (now - loop.lastReset > 2000) {
      loop.count = 0;
      loop.lastReset = now;
    }
    loop.count++;
    if (loop.count > 40) {
      console.warn("Real-time sync engine: Infinite loop protection activated! Halting updates to prevent freeze.");
      return;
    }

    let changed = false;

    // 1. Group students by squad (exclude those without timeId)
    const squads: Record<string, Student[]> = {};
    students.forEach((s) => {
      if (s.timeId) {
        const cleanMachine = s.timeId.trim().toUpperCase();
        if (!squads[cleanMachine]) {
          squads[cleanMachine] = [];
        }
        squads[cleanMachine].push(s);
      }
    });

    const updatedStudents = [...students];

    // 2. Process each squad to match alignment
    Object.entries(squads).forEach(([machineId, partners]) => {
      if (partners.length <= 1) {
        return;
      }

      // Check if any partners already have an xpAntecedente
      const withAntecedente = partners.filter(
        (p) => p.xpAntecedente !== undefined && p.xpAntecedente !== null
      );

      // Calculate current maximum group-earned XP
      let maxGroupEarnedXp = 0;
      if (withAntecedente.length > 0) {
        maxGroupEarnedXp = Math.max(0, ...withAntecedente.map((p) => p.xp - (p.xpAntecedente || 0)));
      }

      // Find max phase and union of replies
      const maxFase = Math.max(...partners.map((p) => p.faseAtual || 0));
      const allRespostas: Record<string, boolean> = {};
      partners.forEach((p) => {
        if (p.respostasDesafios) {
          Object.entries(p.respostasDesafios).forEach(([key, val]) => {
            if (val === true || allRespostas[key] === undefined) {
              allRespostas[key] = val === true;
            }
          });
        }
      });
      const maxTempo = Math.max(...partners.map((p) => p.tempoAtivoSegundos || 0));

      partners.forEach((p) => {
        const idx = updatedStudents.findIndex((st) => st.id === p.id);
        if (idx !== -1) {
          const original = updatedStudents[idx];

          // Determine or initialize xpAntecedente
          let antValue = original.xpAntecedente;
          if (antValue === undefined || antValue === null) {
            antValue = Math.max(0, original.xp - maxGroupEarnedXp);
          }

          // Calculate correct synchronized XP: antecedent + maximum group earned XP
          const targetXP = antValue + maxGroupEarnedXp;

          const answersChanged =
            JSON.stringify(original.respostasDesafios) !== JSON.stringify(allRespostas);

          if (
            original.xp !== targetXP ||
            original.faseAtual !== maxFase ||
            original.xpAntecedente !== antValue ||
            answersChanged
          ) {
            changed = true;
            updatedStudents[idx] = {
              ...original,
              xpAntecedente: antValue,
              xp: targetXP,
              faseAtual: maxFase,
              respostasDesafios: allRespostas,
              tempoAtivoSegundos: maxTempo,
            };
          }
        }
      });
    });

    if (changed) {
      setStudents(updatedStudents);
    }
  }, [students]);

  // Sync to localStorage on status mutations (debounced to prevent unnecessary writes on every keystroke)
  useEffect(() => {
    const handler = setTimeout(() => {
      localStorage.setItem("worksim_students", JSON.stringify(students));
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [students]);

  // Test Student 24h Reset (Ana and Daniel)
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    const lastReset = localStorage.getItem("worksim_test_reset_2026_06_14");
    
    if (lastReset !== today) {
      setStudents((prev) => {
        let changed = false;
        const updated = prev.map((s) => {
          if (s.matricula === "011B2026RH" || s.matricula === "041B2026RH") {
            changed = true;
            return {
              ...s,
              xp: 0,
              precisao: 0.0,
              faseAtual: 0,
              respostasDesafios: {},
              saidasTela: 0,
              badges: [],
              tempoAtivoSegundos: 0
            };
          }
          return s;
        });
        if (changed) {
          localStorage.setItem("worksim_test_reset_2026_06_14", today);
          return updated;
        }
        return prev;
      });
    }
  }, []);

  useEffect(() => {
    if (activeStudentId) {
      localStorage.setItem("worksim_active_student_id", activeStudentId);
    } else {
      localStorage.removeItem("worksim_active_student_id");
    }
    setDismissedWarningCount(0);
  }, [activeStudentId]);

  useEffect(() => {
    localStorage.setItem(
      "worksim_completed_challenges",
      JSON.stringify(completedChallenges),
    );
  }, [completedChallenges]);

  useEffect(() => {
    localStorage.setItem(
      "worksim_onboarding_finished",
      onboardingFinished ? "true" : "false",
    );
  }, [onboardingFinished]);

  // Broadcast listener
  useEffect(() => {
    const q = query(
      collection(db, "broadcasts"), 
      where("timestamp", ">", Date.now() - 30000)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const data = change.doc.data();
          // Only show broadcasts that happened after the app was loaded
          // Avoid showing my own broadcast to myself if I just logged in
          if (data.studentId !== activeStudentId && data.timestamp >= appLoadedAt.current - 2000) {
            setActiveBroadcast({ id: change.doc.id, text: data.text });
            setTimeout(() => {
              setActiveBroadcast(null);
            }, 3000);
          }
        }
      });
    }, (error) => {
      console.warn("Broadcast listener encountered a permission issue or error:", error.message);
    });
    return unsubscribe;
  }, [activeStudentId, firebaseUser]);

  // Trigger login broadcast
  useEffect(() => {
    if (onboardingFinished && activeStudent && firebaseUser && !loginBroadcastRef.current) {
      loginBroadcastRef.current = true;
      const text = `${activeStudent.nomeCompleto} (${activeStudent.cargo || "Estudante"}) acabou de entrar no Simulador! 🚀`;
      syncAddDoc("broadcasts", {
        text,
        studentId: activeStudent.id,
        timestamp: Date.now()
      }).catch(err => {
        if (err.code === 'permission-denied') {
          console.warn("Silent failure: Cannot broadcast login without Firebase permission.");
        } else {
          console.error("Error broadcasting login:", err);
        }
      });
    }
  }, [onboardingFinished, activeStudent?.id, firebaseUser]);

  // Sync completedChallenges with activeStudent's solved answers (respostasDesafios)
  useEffect(() => {
    if (activeStudent) {
      const studentAnswers = Object.entries(
        activeStudent.respostasDesafios || {},
      )
        .filter(([_, val]) => val === true)
        .map(([key, _]) => key);

      setCompletedChallenges(studentAnswers);
    } else {
      setCompletedChallenges([]);
    }
  }, [activeStudentId, JSON.stringify(activeStudent?.respostasDesafios || {})]);

  // Helper to determine if a student has successfully "passed" a phase based on user's new strict rules
  const checkIfPassedPhase = (s: Student, phaseId: number): boolean => {
    if (!s) return false;
    const phaseChallenges = allChallenges.filter((c) => c.fase === phaseId);
    if (phaseChallenges.length === 0) return true;

    // Must have attempted ALL challenges in the phase
    const allAttempted = phaseChallenges.every((c) => s.respostasDesafios?.[c.id] !== undefined);
    if (!allAttempted) return false;

    // Veterans and Admins pass just by finishing (no percentage required)
    const isSpecial = s.isVeterano || s.id === "adm" || s.matricula === "ADM2026"; 
    if (isSpecial) return true;

    // Use minimum accuracy from phase config
    const phaseConfig = CAREER_PHASES.find(p => p.id === phaseId);
    const minAccuracy = phaseConfig?.precisaoMinima || 70;

    const correctCount = phaseChallenges.filter((c) => s.respostasDesafios?.[c.id] === true).length;
    const accuracy = (correctCount / phaseChallenges.length) * 100;
    return accuracy >= minAccuracy;
  };

  // Compute if Phase 0 (Pré-seleção) is completed with 100% and meets passing criteria
  const phase0ChallengeIds = [
    "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "0.10",
    "0.11", "0.12", "0.13", "0.14", "0.15", "0.16", "0.17", "0.18", "0.19", "0.20", "0.21"
  ];
  const completedPhase0Count = phase0ChallengeIds.filter((id) =>
    completedChallenges.includes(id),
  ).length;
  
  const isPhase0Passed = activeStudent ? checkIfPassedPhase(activeStudent, 0) : false;
  const isPhase0Complete_100 = isProfessorOrAdmin || isPhase0Passed;

  // Trigger Hiring Modal automatically when the student finishes all Phase 0 challenges
  useEffect(() => {
    if (
      activeStudent &&
      activeStudent.faseAtual === 0 &&
      completedPhase0Count === phase0ChallengeIds.length
    ) {
      setShowHiringModal(true);
    } else {
      setShowHiringModal(false);
    }
  }, [activeStudent, completedPhase0Count]);

  // Rigorous Phase Navigation Lock for Students
  // A phase N is unlocked ONLY if Phase N-1 has been "passed" (100% completed & >= 70% accuracy for normals)
  // Phase -1 is ALWAYS unlocked for everyone as a review tool.
  const maxAllowedPhase = activeStudent?.faseAtual ?? 0;
  const unlockedPhasesList = useMemo(() => {
    // Admin profile always has everything
    if (activeStudent?.id === "adm" || activeStudent?.matricula === "ADM2026") return [-1, 0, 1, 2, 3, 4, 5, 6, 7];
    
    if (!activeStudent) return [-1];
    
    const unlocked = [-1]; // Phase 0 and 1 are explicitly blocked for all other students/rooms
    for (let phaseId = 0; phaseId < 8; phaseId++) {
      if (phaseId === 0 || phaseId === 1) continue;
      if (phaseId <= maxAllowedPhase || checkIfPassedPhase(activeStudent, phaseId - 1)) {
        unlocked.push(phaseId);
      }
    }
    return unlocked;
  }, [isProfessorOrAdmin, maxAllowedPhase, allChallenges, completedChallenges, activeStudent]);

  const isCurrentPhaseLocked = useMemo(() => {
    return !unlockedPhasesList.includes(selectedPhaseId);
  }, [unlockedPhasesList, selectedPhaseId]);

  // Automatically fall back to Phase -1 if the current selected phase is locked
  useEffect(() => {
    if (!isProfessorOrAdmin && isCurrentPhaseLocked && selectedPhaseId !== -1) {
      setSelectedPhaseId(-1);
    }
  }, [isCurrentPhaseLocked, selectedPhaseId, isProfessorOrAdmin]);

  const precedingPhasesData = useMemo(() => {
    if (!activeStudent) return [];
    const list: any[] = [];
    
    for (let pId = 0; pId < selectedPhaseId; pId++) {
      const phaseConfig = CAREER_PHASES.find(p => p.id === pId);
      if (!phaseConfig) continue;
      
      const phaseChallengesList = allChallenges.filter((c) => c.fase === pId);
      const total = phaseChallengesList.length;
      const attempted = phaseChallengesList.filter((c) => activeStudent.respostasDesafios?.[c.id] !== undefined).length;
      const correct = phaseChallengesList.filter((c) => activeStudent.respostasDesafios?.[c.id] === true).length;
      const accuracy = total > 0 ? (correct / total) * 100 : 100;
      const minAccuracy = phaseConfig.precisaoMinima || 70;
      
      const isSpecial = activeStudent.isVeterano || activeStudent.id === "adm" || activeStudent.matricula === "ADM2026";
      const meetsAccuracy = isSpecial || accuracy >= minAccuracy;
      const meetsAttempted = attempted === total;
      const isPassed = meetsAccuracy && meetsAttempted;
      
      list.push({
        id: pId,
        cargo: phaseConfig.cargo,
        moduloTecnico: phaseConfig.moduloTecnico,
        focoPrincipal: phaseConfig.focoPrincipal,
        total,
        attempted,
        correct,
        accuracy,
        minAccuracy,
        isPassed,
        isSpecial,
        meetsAccuracy,
        meetsAttempted
      });
    }
    return list;
  }, [activeStudent, selectedPhaseId, allChallenges]);

  // --- SECURITY MONITORING (ANTI-FRAUD) ---
  const handleSecurityViolation = useCallback(async (type: string) => {
    if (!activeStudent || isProfessorOrAdmin) return;

    // Play alert sound if possible
    playSoundEffect("unauthorized");

    const isExempt = activeStudent.id === "STU-1C-10-1782358045698-r6f" || activeStudent.matricula === "1C102026RH" || activeStudent.faseAtual === -1 || selectedPhaseId === -1;
    if (isExempt) {
      alert(appLanguage === "pt"
        ? "AVISO: Atividade suspeita ou tentativa de inspecionar código detectada. Por favor, evite este comportamento."
        : "WARNING: Suspicious activity or inspect element attempt detected. Please avoid this behavior."
      );
      return;
    }

    const newFraudCount = (activeStudent.tentativaFraude || 0) + 1;
    const isBlocking = newFraudCount >= 3;

    const incidentMessage = `[ALERTA DE SEGURANÇA] Tentativa de inspeção de código detectada (${type}). Progresso zerado automaticamente.`;
    
    const updatedStudent = {
      ...activeStudent,
      xp: 0,
      tentativaFraude: newFraudCount,
      contaBloqueada: isBlocking,
      saidasTela: (activeStudent.saidasTela || 0) + 10, // Massive penalty to telemetry
    };

    // Update locally
    setStudents(prev => prev.map(s => s.id === activeStudent.id ? updatedStudent : s));
    
    // Log to Telemetry
    try {
      await syncAddDoc("logs", {
        studentId: activeStudent.id,
        studentName: activeStudent.nomeCompleto,
        type: "focus-loss",
        action: "FRAUD_DETECTED",
        details: incidentMessage,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      handleFirestoreError(e, OperationType.CREATE, "logs");
    }

    // Update Firestore
    try {
      await syncSetDoc("students", activeStudent.id, {
        xp: 0,
        tentativaFraude: newFraudCount,
        contaBloqueada: isBlocking,
        saidasTela: (activeStudent.saidasTela || 0) + 10
      }, { merge: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `students/${activeStudent.id}`);
    }

    alert(appLanguage === "pt" 
      ? "FRAUDE DETECTADA: Tentativa de violar o simulador. Seu XP foi zerado e o professor foi notificado." 
      : "FRAUD DETECTED: Attempt to breach simulator. Your XP has been reset and the professor notified."
    );
  }, [activeStudent, isProfessorOrAdmin, appLanguage, db, selectedPhaseId]);

  useEffect(() => {
    // If logged in as admin/professor, allow DevTools for debugging
    if (activeStudent && isProfessorOrAdmin) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12") {
        e.preventDefault();
        if (activeStudent) handleSecurityViolation("F12 Key");
      }
      // Ctrl+Shift+I / Cmd+Opt+I
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.key === "J" || e.key === "j" || e.key === "C" || e.key === "c")) {
        e.preventDefault();
        if (activeStudent) handleSecurityViolation("DevTools Shortcut");
      }
      // Ctrl+U / Cmd+Opt+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u")) {
        e.preventDefault();
        if (activeStudent) handleSecurityViolation("View Source Request");
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("contextmenu", handleContextMenu);
    };
  }, [activeStudent, isProfessorOrAdmin, handleSecurityViolation]);

  // --- STUDENT COPY & SELECTION PROTECTION ---
  useEffect(() => {
    // Normal logged-in students (not professors, not veterinarians) cannot copy or select text
    const isNormalStudent = activeStudent && !isProfessorOrAdmin && !activeStudent.isVeterano;

    if (isNormalStudent) {
      document.body.classList.add("no-copy-select");

      const preventDefaultBehavior = (e: Event) => {
        e.preventDefault();
      };

      const handleKeyDownCopy = (e: KeyboardEvent) => {
        // Prevent Ctrl+C / Cmd+C / Ctrl+X / Cmd+X
        if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "C" || e.key === "x" || e.key === "X")) {
          e.preventDefault();
        }
      };

      window.addEventListener("copy", preventDefaultBehavior as any);
      window.addEventListener("cut", preventDefaultBehavior as any);
      window.addEventListener("selectstart", preventDefaultBehavior);
      window.addEventListener("keydown", handleKeyDownCopy);

      return () => {
        document.body.classList.remove("no-copy-select");
        window.removeEventListener("copy", preventDefaultBehavior as any);
        window.removeEventListener("cut", preventDefaultBehavior as any);
        window.removeEventListener("selectstart", preventDefaultBehavior);
        window.removeEventListener("keydown", handleKeyDownCopy);
      };
    } else {
      document.body.classList.remove("no-copy-select");
    }
  }, [activeStudent, isProfessorOrAdmin]);

  // --- STUDENT SCREENSHOT PROTECTION (OPTION 1 & OPTION 4) ---
  const [isScreenObscured, setIsScreenObscured] = useState<boolean>(false);

  useEffect(() => {
    const isNormalStudent = activeStudent && !isProfessorOrAdmin && !activeStudent.isVeterano;
    if (!isNormalStudent) {
      setIsScreenObscured(false);
      return;
    }

    // Option 4: Function to wipe clipboard
    const wipeClipboard = () => {
      try {
        const warningMsg = appLanguage === "en"
          ? "Warning: Screenshots and text copying are strictly prohibited on the test simulator."
          : "Aviso: Capturas de tela (printscreen) e cópias de texto são estritamente proibidas no simulador de testes.";
        
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(warningMsg).catch(() => {});
        } else {
          // Fallback textarea method for browser compatibility
          const textarea = document.createElement("textarea");
          textarea.value = warningMsg;
          textarea.style.position = "fixed";
          textarea.style.opacity = "0";
          document.body.appendChild(textarea);
          textarea.select();
          document.execCommand("copy");
          document.body.removeChild(textarea);
        }
      } catch (err) {
        // Silent catch
      }
    };

    // Option 1: Blur when page loses focus or visibility state changes
    const handleFocusLoss = () => {
      setIsScreenObscured(true);
      wipeClipboard();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        setIsScreenObscured(true);
        wipeClipboard();
      } else {
        setIsScreenObscured(false);
      }
    };

    const handleFocus = () => setIsScreenObscured(false);

    // Option 4: Detect Print Screen key
    const handleKeyUpScreen = (e: KeyboardEvent) => {
      if (e.key === "PrintScreen") {
        e.preventDefault();
        setIsScreenObscured(true);
        wipeClipboard();
        alert(appLanguage === "pt"
          ? "CAPTURA DE TELA BLOQUEADA: Capturas de tela são proibidas neste simulador para garantir a integridade da prova."
          : "SCREENSHOT BLOCKED: Screenshots are prohibited on this simulator to guarantee exam integrity."
        );
      }
    };

    window.addEventListener("blur", handleFocusLoss);
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("keyup", handleKeyUpScreen);

    return () => {
      window.removeEventListener("blur", handleFocusLoss);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("keyup", handleKeyUpScreen);
    };
  }, [activeStudent, isProfessorOrAdmin, appLanguage]);
  // --- END SECURITY ---

  const handleSignContract = async () => {
    if (!activeStudent) return;
    
    // Persist to overall students state
    setStudents(prev => prev.map(s => s.id === activeStudent.id ? { ...s, contratoAssinado: true } : s));
    
    // Persist to Firestore
    try {
      await syncSetDoc("students", activeStudent.id, { contratoAssinado: true }, { merge: true });
      playSoundEffect("success");
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${activeStudent.id}`);
    }
  };

  const currentPhaseProgress = useMemo(() => {
    if (!activeStudent) return 0;
    const phaseId = activeStudent.faseAtual;
    const phaseChallenges = allChallenges.filter((c) => c.fase === phaseId);
    if (phaseChallenges.length === 0) return 0;
    
    const completedInPhase = phaseChallenges.filter((c) => completedChallenges.includes(c.id)).length;
    return (completedInPhase / phaseChallenges.length) * 100;
  }, [activeStudent, allChallenges, completedChallenges]);

  // Guarantee that Laboratório (sandbox) is only accessible in Phase 2 or higher
  useEffect(() => {
    if (
      activeStudent &&
      currentTab === "sandbox" &&
      !isProfessorOrAdmin &&
      maxAllowedPhase < 2
    ) {
      setCurrentTab("challenges");
    }
  }, [currentTab, activeStudent, isProfessorOrAdmin, maxAllowedPhase]);

  // Synchronize active attachment tab based on current challenge
  useEffect(() => {
    if (activeChallenge?.empregado.certidaoObito) {
      setActiveAttachmentTab("obito");
    } else {
      setActiveAttachmentTab("atestado");
    }
  }, [selectedChallengeId, activeChallenge]);

  // Synthesis chimes for success/error soundscapes
  const playSoundEffect = (type: "success" | "failure" | "bip" | "unauthorized" | string) => {
    if (!audioEnabled) return;
    try {
      const audioCtx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      
      const playNote = (freq: number, startTime: number, duration: number, oscType: OscillatorType = "sine", volume = 0.06) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.type = oscType;
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(volume, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      if (type === "success") {
        playNote(523.25, audioCtx.currentTime, 0.5, "sine");
        playNote(659.25, audioCtx.currentTime + 0.1, 0.4, "sine");
        playNote(783.99, audioCtx.currentTime + 0.2, 0.3, "sine");
      } else if (type === "failure" || type === "unauthorized") {
        const oscType = "sawtooth";
        if (type === "unauthorized") {
          playNote(110.0, audioCtx.currentTime, 0.6, oscType);
          playNote(82.41, audioCtx.currentTime + 0.2, 0.4, oscType);
        } else {
          playNote(220.0, audioCtx.currentTime, 0.6, oscType);
          playNote(146.83, audioCtx.currentTime + 0.15, 0.45, oscType);
        }
      } else if (type === "bip" || type === "default") {
        playNote(440.0, audioCtx.currentTime, 0.1, "triangle", 0.04);
      } else if (type === "electronic") {
        playNote(880.0, audioCtx.currentTime, 0.05, "square", 0.02);
        playNote(1760.0, audioCtx.currentTime + 0.05, 0.05, "square", 0.02);
      } else if (type === "organic") {
        playNote(349.23, audioCtx.currentTime, 0.8, "sine", 0.05); // F4
        playNote(440.0, audioCtx.currentTime + 0.15, 0.6, "sine", 0.04); // A4
      } else if (type === "classic") {
        playNote(659.25, audioCtx.currentTime, 0.3, "sine", 0.05); // E5
        playNote(659.25, audioCtx.currentTime + 0.4, 0.3, "sine", 0.05);
      } else if (type === "cyber") {
        playNote(200.0, audioCtx.currentTime, 0.1, "sawtooth", 0.05);
        playNote(400.0, audioCtx.currentTime + 0.05, 0.1, "sawtooth", 0.03);
        playNote(800.0, audioCtx.currentTime + 0.1, 0.1, "sawtooth", 0.02);
      } else if (type === "mellow") {
        playNote(261.63, audioCtx.currentTime, 1.2, "sine", 0.06); // C4
      }
    } catch (e) {
      console.log("Audio blocked by context permissions", e);
    }
  };

  // --- Automatic Badge Awarding Logic ---
  useEffect(() => {
    if (!activeStudent) return;

    const currentBadges = activeStudent.badges || [];
    const unlockedBadgeIds: string[] = [];

    BADGE_DEFINITIONS.forEach((def) => {
      const { isUnlocked } = def.checkUnlock(activeStudent, activeStudent.respostasDesafios || {});
      if (isUnlocked) {
        unlockedBadgeIds.push(def.id);
      }
    });

    // Check if there are any NEW badges
    const hasNewBadges = unlockedBadgeIds.some(id => !currentBadges.includes(id));
    
    if (hasNewBadges) {
      // Merge unique IDs
      const nextBadges = Array.from(new Set([...currentBadges, ...unlockedBadgeIds]));
      
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === activeStudentId) {
            return {
              ...s,
              badges: nextBadges,
            };
          }
          return s;
        })
      );
      
      // Optionally play a sound for NEW badges specifically
      const newBadgeCount = unlockedBadgeIds.filter(id => !currentBadges.includes(id)).length;
      if (newBadgeCount > 0) {
        playSoundEffect("success");
      }
    }
  }, [activeStudent?.xp, activeStudent?.precisao, JSON.stringify(activeStudent?.respostasDesafios || {}), activeStudent?.saidasTela, activeStudent?.streakFasesAutonomas]);

  // --- Active Progress Progression & Timer Hooks ---
  // Reset inactivity timer on major user interactions
  useEffect(() => {
    if (!activeStudentId || isScreenBlocked) return;

    const handleUserAction = () => {
      setInactivitySeconds(0);
    };

    window.addEventListener("mousedown", handleUserAction);
    window.addEventListener("keydown", handleUserAction);
    window.addEventListener("touchstart", handleUserAction);
    window.addEventListener("scroll", handleUserAction);

    return () => {
      window.removeEventListener("mousedown", handleUserAction);
      window.removeEventListener("keydown", handleUserAction);
      window.removeEventListener("touchstart", handleUserAction);
      window.removeEventListener("scroll", handleUserAction);
    };
  }, [activeStudentId, isScreenBlocked]);

  // Main 1-second active training tick
  useEffect(() => {
    if (!activeStudentId || !onboardingFinished) return;

    const intervalId = setInterval(() => {
      if (isScreenBlocked) return;

      if (activeStudentId === "adm" || activeStudent?.matricula === "ADM2026") {
        setInactivitySeconds(0);
        return;
      }

      // We read the latest students snapshot to see if they are paused
      setStudents((current) => {
        const activeS = current.find((x) => x.id === activeStudentId);
        
        // If they are paused, do not increment inactivity or any seconds!
        if (activeS?.pausaAtiva) {
          setInactivitySeconds(0);
          return current;
        }

        // Otherwise, run standard inactivity check
        setInactivitySeconds((prev) => {
          const next = prev + 1;
          if (next >= 180) {
            // 3 minutes exceeded! Trigger block and break active XP accumulator
            setIsScreenBlocked(true);
            playSoundEffect("failure");

            // Post alert
            setAlerts((prevAlerts) => [
              {
                id: Date.now(),
                from: "Monitor de Tempo de Atividade",
                text: "Sua seção de treinamento foi interrompida devido a inatividade prolongada (3+ minutos). Auditoria Automática: -5% XP e acumulador de tempo resetado.",
                time: "Agora",
              },
              ...prevAlerts,
            ]);

            // Apply Audit Penalty for Inactivity
            setStudents(prev => prev.map(s => {
              if (s.id === activeStudentId) {
                return {
                  ...s,
                  xp: Math.max(0, Math.round(s.xp * 0.95)),
                  tempoAcumuladoXP: 0,
                  casosResolvidosNoCiclo: 0,
                };
              }
              return s;
            }));

            return 180;
          }
          return next;
        });

        return current.map((s) => {
          if (s.id === activeStudentId) {
            const prevTotal = s.tempoAtivoSegundos || 0;
            const prevAccum = s.tempoAcumuladoXP || 0;

            const nextTotal = prevTotal + 1;
            const nextAccum = prevAccum + 1;

            if (nextAccum >= 600) {
              const solvedCount = s.casosResolvidosNoCiclo || 0;
              if (solvedCount > 0) {
                // Earned 10XP since they resolved cases
                playSoundEffect("success");

                setAlerts((prevAlerts) => [
                  {
                    id: Date.now(),
                    from: "Plano de Progressão de Cargos",
                    text: `Parabéns! Você completou 10 minutos de treinamento ativo de RH, resolveu ${solvedCount} ${solvedCount === 1 ? "caso" : "casos"} e recebeu +10 XP!`,
                    time: "Agora",
                  },
                  ...prevAlerts,
                ]);

                return {
                  ...s,
                  tempoAtivoSegundos: nextTotal,
                  tempoAcumuladoXP: 0,
                  casosResolvidosNoCiclo: 0,
                  xp: s.xp + 10,
                };
              } else {
                // Penalty! Staid active but solved absolute zero cases
                playSoundEffect("failure");

                setAlerts((prevAlerts) => [
                  {
                    id: Date.now(),
                    from: "Monitor de Tempo de Atividade",
                    text: "Penalidade aplicada! Você permaneceu 10 minutos ativo mexendo na tela, mas não resolveu nenhum caso de RH. -30 XP descontados por ócio de treinamento.",
                    time: "Agora",
                  },
                  ...prevAlerts,
                ]);

                return {
                  ...s,
                  tempoAtivoSegundos: nextTotal,
                  tempoAcumuladoXP: 0,
                  casosResolvidosNoCiclo: 0,
                  xp: Math.max(0, s.xp - 30),
                };
              }
            }

            return {
              ...s,
              tempoAtivoSegundos: nextTotal,
              tempoAcumuladoXP: nextAccum,
            };
          }
          return s;
        });
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [activeStudentId, onboardingFinished, isScreenBlocked, isProfessorOrAdmin]);

  // Real-time window focus and visibility status monitoring for students
  useEffect(() => {
    if (!activeStudentId || isScreenBlocked || activeStudentId === "adm" || activeStudent?.matricula === "ADM2026") return;

    let isOutOfFocus = false;

    const recordFocusLoss = () => {
      if (isOutOfFocus) return; // Prevent duplicate triggers

      setStudents((current) => {
        const student = current.find((s) => s.id === activeStudentId);
        const isExempt = student?.id === "STU-1C-10-1782358045698-r6f" || student?.matricula === "1C102026RH" || student?.faseAtual === -1 || selectedPhaseId === -1;
        if (!student || ((student.saidasTela || 0) >= 7 && !isExempt)) {
          return current; // already locked out or n/a
        }

        isOutOfFocus = true;
        return current.map((s) => {
          if (s.id === activeStudentId) {
            if (s.focoStatus === "Fora da Tela") return s;

            const isExempt = s.id === "STU-1C-10-1782358045698-r6f" || s.matricula === "1C102026RH" || s.faseAtual === -1 || selectedPhaseId === -1;
            const totalLosses = s.recuperadoDeBloqueio ? (isExempt ? Math.min(6, s.saidasTela || 0) : 7) : (s.saidasTela || 0) + 1;
            const isBlocked = !isExempt && totalLosses >= 7;
            const finalLosses = isExempt ? Math.min(6, totalLosses) : totalLosses;
            const now = new Date();
            const timeStr = now.toLocaleTimeString("pt-BR");

            const newMsg = {
              id: `${Date.now()}-${Math.random()}`,
              remetente: "Sistema",
              texto: isBlocked
                ? (s.recuperadoDeBloqueio
                    ? `SISTEMA 🔒: SESSÃO BLOQUEADA às ${timeStr}. Saída de tela detectada pós-desbloqueio (TOLERÂNCIA ZERO). Auditoria Sancionada: -5% XP e acumulador resetado.`
                    : `SISTEMA 🔒: SESSÃO BLOQUEADA às ${timeStr}. Limite de ${totalLosses} saídas excedido. Auditoria Sancionada: -5% XP e acumulador resetado.`)
                : `SISTEMA 🚫: O aluno minimizou a aba ou trocou de tela às ${timeStr} (Saídas detectadas: ${finalLosses}).`,
              timestamp: timeStr,
            };

            return {
              ...s,
              focoStatus: "Fora da Tela",
              saidasTela: finalLosses,
              mensagensChat: [...(s.mensagensChat || []), newMsg],
              ...(isBlocked ? {
                xp: Math.max(0, Math.round(s.xp * 0.95)),
                tempoAcumuladoXP: 0,
                casosResolvidosNoCiclo: 0,
              } : {}),
            };
          }
          return s;
        });
      });
    };

    const recordFocusGain = () => {
      if (!isOutOfFocus) return;

      setStudents((current) => {
        const student = current.find((s) => s.id === activeStudentId);
        const isExempt = student?.id === "STU-1C-10-1782358045698-r6f" || student?.matricula === "1C102026RH" || student?.faseAtual === -1 || selectedPhaseId === -1;
        if (!student || ((student.saidasTela || 0) >= 7 && !isExempt)) {
          isOutOfFocus = false;
          return current; // no focus gains if locked out!
        }

        isOutOfFocus = false;
        return current.map((s) => {
          if (s.id === activeStudentId) {
            if (s.focoStatus === "Ativo") return s;

            const now = new Date();
            const timeStr = now.toLocaleTimeString("pt-BR");

            const newMsg = {
              id: `${Date.now()}-${Math.random()}`,
              remetente: "Sistema",
              texto: `SISTEMA ✅: Foco recuperado pelo aluno às ${timeStr}.`,
              timestamp: timeStr,
            };

            return {
              ...s,
              focoStatus: "Ativo",
              mensagensChat: [...(s.mensagensChat || []), newMsg],
            };
          }
          return s;
        });
      });
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordFocusLoss();
      } else if (document.visibilityState === "visible") {
        recordFocusGain();
      }
    };

    const handleWindowBlur = () => {
      recordFocusLoss();
    };

    const handleWindowFocus = () => {
      recordFocusGain();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);
    };
  }, [activeStudentId, isScreenBlocked, isProfessorOrAdmin, selectedPhaseId]);

  // Heartbeat to signal that the active student is actually online
  useEffect(() => {
    if (!activeStudentId) return;

    const sendHeartbeat = () => {
      syncSetDoc("students", activeStudentId, { lastSeen: Date.now() }, { merge: true }).catch(console.error);
    };

    // Send immediately on mount or login
    sendHeartbeat();

    const interval = setInterval(sendHeartbeat, 15000);
    return () => clearInterval(interval);
  }, [activeStudentId]);

  // Proactively zero the XP of Professor Fábio (fabiosantanalima01@gmail.com) on load if requested
  useEffect(() => {
    if (!activeStudentId) return;
    const targetId = activeStudentId;
    const currentStudentObj = students.find(s => s.id === targetId);
    if (currentStudentObj && currentStudentObj.email === "fabiosantanalima01@gmail.com" && currentStudentObj.xp > 0) {
      setStudents(prev => prev.map(s => s.id === targetId ? { ...s, xp: 0 } : s));
      syncSetDoc("students", targetId, { xp: 0 }, { merge: true }).catch(console.error);
      console.log("XP of admin zeroed as requested!");
    }
  }, [activeStudentId, students]);

  // Student Activation workflow
  const handleActivationOrLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorMessage("");

    if (inputMatricula.includes("@")) {
      setLoginErrorMessage("Matrícula inválida. Para entrar com seu e-mail, clique no botão 'Sincronizar Conta Google' acima.");
      playSoundEffect("failure");
      return;
    }

    const targetMatriculaStr = inputMatricula.trim().toUpperCase();
    const targetMatricula =
      targetMatriculaStr === "ADM" ? "ADM2026" : targetMatriculaStr;
    const targetNome = inputNome.trim();

    // Match checking
    let matched = students.find((s) => s.matricula === targetMatricula);

    const handleNotFoundMatricula = (matricula: string) => {
      // Check if veteran self-registration is allowed
      const veteranCount = students.filter(s => s.isVeterano).length;
      if (veteranCount < 20) { // Increased limit slightly
        setLoginStep("activation");
        setIsActivatingNewAccount(true);
        setLoginErrorMessage("Matrícula não localizada no grid. Iniciando pré-cadastro de Veterano.");
      } else {
        setLoginErrorMessage(
          "Matrícula não localizada! O ingresso de novos alunos sem cadastro prévio atingiu o limite.",
        );
        playSoundEffect("failure");
      }
    };
    
    // Direct Firestore Check - Authoritative source of truth for all logins
    if (loginStep === "matricula") {
      setIsFirebaseSyncing(true);
      const checkRemote = async () => {
        try {
          const q = query(collection(db, "students"), where("matricula", "==", targetMatricula));
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const remoteDoc = snapshot.docs[0];
            const remoteData = { ...(remoteDoc.data() as Student), id: remoteDoc.id };
            
            // Update local state with the absolute latest remote data
            setStudents(prev => {
              const filtered = prev.filter(s => s.id !== remoteData.id);
              return [...filtered, remoteData];
            });
            
            matched = remoteData;

            // Bypass password for the Professor if logged into Google correctly
            if (targetMatricula === "ADM2026" && firebaseUser?.email === "fabiosantanalima01@gmail.com") {
              setActiveStudentId(remoteData.id);
              setSelectedPhaseId(remoteData.faseAtual);
              setOnboardingFinished(true);
              playSoundEffect("success");
              setIsFirebaseSyncing(false);
              return true;
            }

            if (!remoteData.senha) {
              setLoginStep("activation");
              setIsActivatingNewAccount(true);
            } else {
              setLoginStep("password");
              setIsActivatingNewAccount(false);
            }
            setIsFirebaseSyncing(false);
            return true;
          }
          return false;
        } catch (err) {
          console.error("Remote check failed:", err);
          setIsFirebaseSyncing(false);
          return false;
        }
      };

      checkRemote().then(found => {
        if (!found) {
          // If not found in Firestore, check if they are in INITIAL_STUDENTS
          const localMatch = INITIAL_STUDENTS.find(s => s.matricula === targetMatricula);
          if (localMatch) {
            setStudents(prev => {
              if (!prev.some(s => s.id === localMatch.id)) {
                return [...prev, localMatch];
              }
              return prev;
            });
            
            if (!localMatch.senha) {
              setLoginStep("activation");
              setIsActivatingNewAccount(true);
            } else {
              setLoginStep("password");
              setIsActivatingNewAccount(false);
            }
          } else {
            // Not in INITIAL_STUDENTS and not in Firestore, so handle veteran signup
            handleNotFoundMatricula(targetMatricula);
          }
        }
        setIsFirebaseSyncing(false);
      });
      return;
    }

    if (loginStep === "activation") {
      if (matched && matched.senha) {
        setLoginErrorMessage("Esta matrícula já foi ativada. Por favor, entre com sua senha ou solicite reset ao Professor.");
        setLoginStep("password");
        setIsActivatingNewAccount(false);
        playSoundEffect("failure");
        return;
      }

      if (!targetNome) {
        setLoginErrorMessage(
          "Por favor, preencha o seu nome completo para validação cadastral.",
        );
        return;
      }
      if (!inputPassword || inputPassword.length < 4) {
        setLoginErrorMessage(
          "Defina sua chave pessoal de acesso (mínimo de 4 dígitos).",
        );
        return;
      }

      if (matched) {
        // Activate existing student
        if (matched.senha) {
          setLoginErrorMessage("Segurança: Esta conta já possui senha. Use o login padrão.");
          setLoginStep("password");
          return;
        }

        const updatedStudent = {
          ...matched,
          nomeCompleto: targetNome,
          senha: inputPassword,
          status: "Ativo" as const,
          dispositivoVinculado: "Chrome-Agent-PC04",
          email: firebaseUser?.email || matched.email,
        };

        setStudents((prev) =>
          prev.map((s) => (s.matricula === targetMatricula ? updatedStudent : s))
        );
        
        // Sync to Firestore universally
        syncSetDoc("students", updatedStudent.id, sanitizeForFirestore(updatedStudent), { merge: true }).catch(console.error);

        setActiveStudentId(matched.id);
      } else {
        // Create new Veteran student
        // Final check for duplicate matricula in current list
        const isDuplicate = students.some(s => s.matricula === targetMatricula);
        if (isDuplicate) {
          setLoginErrorMessage("Erro: Esta matrícula já está em uso no sistema.");
          setLoginStep("matricula");
          return;
        }

        const newVetId = `vet-${Date.now()}`;
        const newVeteran: Student = {
          id: newVetId,
          nomeCompleto: targetNome,
          matricula: targetMatricula,
          sala: "Veteranos",
          ano: 2026,
          cargo: "Testador Veterano",
          xp: 0,
          precisao: 100.0,
          faseAtual: 0,
          status: "Ativo",
          senha: inputPassword,
          isVeterano: true,
          respostasDesafios: {},
        };
        setStudents((prev) => [...prev, newVeteran]);
        
        // Sync to Firestore universally
        syncSetDoc("students", newVeteran.id, sanitizeForFirestore(newVeteran)).catch(console.error);

        setActiveStudentId(newVetId);
      }
      
      setSelectedPhaseId(0);
      setShowMatrixIntro(true);
      playSoundEffect("success");
    } else if (loginStep === "password" && matched) {
      // Validate password
      const isProfessorBypass = matched.matricula === "ADM2026" && firebaseUser?.email === "fabiosantanalima01@gmail.com";
      
      if ((matched.senha && inputPassword === matched.senha) || isProfessorBypass) {
        setActiveStudentId(matched.id);
        setSelectedPhaseId(matched.faseAtual);
        setOnboardingFinished(true);
        playSoundEffect("success");
      } else {
        setLoginErrorMessage("Senha incorreta! Verifique seus dados ou solicite reset ao Professor.");
        playSoundEffect("failure");
      }
    }
  };

  // Veteran Login and Registration Flow
  const handleVeteranAccess = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginErrorMessage("");

    const targetNome = veteranNome.trim();
    const targetUsuario = veteranUsuario.trim().toUpperCase();
    const targetSenha = veteranSenha.trim();

    if (!targetUsuario) {
      setLoginErrorMessage("Por favor, preencha o seu nome de usuário / login.");
      playSoundEffect("failure");
      return;
    }

    if (!targetSenha || targetSenha.length < 4) {
      setLoginErrorMessage("A senha do veterano deve conter no mínimo 4 caracteres.");
      playSoundEffect("failure");
      return;
    }

    if (isVeteranRegister) {
      // Registration Mode
      if (!targetNome) {
        setLoginErrorMessage("Por favor, preencha o seu nome completo.");
        playSoundEffect("failure");
        return;
      }

      const veteranCount = students.filter(s => s.isVeterano).length;
      if (veteranCount >= 10) {
        setLoginErrorMessage("O limite de 10 ingressos para veteranos já foi atingido.");
        playSoundEffect("failure");
        return;
      }

      const alreadyExists = students.some(
        (s) => s.matricula === targetUsuario,
      );
      if (alreadyExists) {
        setLoginErrorMessage(
          `O Usuário/Matrícula "${targetUsuario}" já está cadastrado no sistema!`,
        );
        playSoundEffect("failure");
        return;
      }

      const newVetId = `vet-${Date.now()}`;
      const newVeteran: Student = {
        id: newVetId,
        nomeCompleto: targetNome,
        matricula: targetUsuario,
        sala: "Veteranos",
        ano: 2026,
        cargo: "Testador Veterano",
        xp: 0,
        precisao: 100.0,
        faseAtual: 0,
        status: "Ativo",
        senha: targetSenha,
        isVeterano: true,
        respostasDesafios: {},
        mensagensChat: [
          {
            id: `${Date.now()}-welcome`,
            remetente: "Sistema",
            texto: "Bem-vindo ao portal de homologação para veteranos! Todo o seu progresso de testes será salvo localmente.",
            timestamp: new Date().toLocaleTimeString("pt-BR"),
          },
        ],
      };

      setStudents((prev) => [...prev, newVeteran]);
      setActiveStudentId(newVetId);
      setSelectedPhaseId(0);
      setShowMatrixIntro(true); // show the matrix dropping effect for veterans too!
      playSoundEffect("success");
    } else {
      // Login Mode
      const matched = students.find((s) => s.matricula === targetUsuario);
      if (!matched) {
        setLoginErrorMessage(
          "Acesso de veterano não localizado! Crie seu cadastro usando a aba de registro abaixo.",
        );
        playSoundEffect("failure");
        return;
      }

      if (!matched.senha || matched.senha !== targetSenha) {
        setLoginErrorMessage("Senha incorreta para esta conta de Veterano!");
        playSoundEffect("failure");
        return;
      }

      // Allow login
      setActiveStudentId(matched.id);
      setSelectedPhaseId(matched.faseAtual);
      setOnboardingFinished(true);
      playSoundEffect("success");
    }
  };

  // Quick Login Simulation Bypass Action
  const handleQuickLogin = (matricula: string) => {
    playSoundEffect("success");
    setLoginErrorMessage("");
    const targetMatricula = matricula.trim().toUpperCase();

    let matched = students.find((s) => s.matricula === targetMatricula);
    if (!matched) {
      const baseProto = INITIAL_STUDENTS.find(
        (s) => s.matricula === targetMatricula,
      );
      if (baseProto) {
        setStudents((prev) => {
          if (!prev.some((p) => p.matricula === targetMatricula)) {
            return [...prev, baseProto];
          }
          return prev;
        });
        matched = baseProto;
      }
    }

    if (matched) {
      // Force status to active so they bypass onboarding flow/barriers directly
      if (matched.status === "Aguardando Ativação") {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.matricula === targetMatricula) {
              return {
                ...s,
                status: "Ativo",
                nomeCompleto:
                  s.nomeCompleto === "Recruta de Admissão"
                    ? "Eliane Vasconcelos"
                    : s.nomeCompleto,
              };
            }
            return s;
          }),
        );
      }

      setActiveStudentId(matched.id);
      setSelectedPhaseId(matched.faseAtual);
      setOnboardingFinished(true);
    }
  };

  const handleLogout = () => {
    setActiveStudentId(null);
    setOnboardingFinished(false);
    setShowMatrixIntro(false);
    setCompletedChallenges([]);
    setSelectedChallengeId(null);
    setInactivitySeconds(0);
    setIsScreenBlocked(false);
  };

  // Add new students discovered or processed in OCR
  const handleAddStudentsFromOCR = async (newStudents: Student[]) => {
    setStudents((prev) => {
      // Avoid duplicated matricula items
      const filteredNew = newStudents.filter(
        (ns) => !prev.some((p) => p.matricula === ns.matricula),
      );
      
      // Save locally first
      const updated = [...prev, ...filteredNew];
      localStorage.setItem("worksim_students", JSON.stringify(updated));

      // Sync to Firestore if logged in
      if (firebaseUser) {
        filteredNew.forEach((student) => {
          syncSetDoc("students", student.id, sanitizeForFirestore(student)).catch(console.error);
        });
      }

      return updated;
    });
  };

  const handleDeleteStudents = async (studentIds: string[]) => {
    if (studentIds.length === 0) return;

    if (!isProfessorOrAdmin) {
      alert(appLanguage === "pt" ? "Acesso negado: Você não tem permissão para apagar alunos." : "Access denied: You do not have permission to delete students.");
      return;
    }

    const deletableIds = studentIds.filter(id => {
      const isAdminEmail = firebaseUser?.email?.toLowerCase() === "fabiosantanalima01@gmail.com";
      if (isAdminEmail) return true; 
      
      const student = students.find(s => s.id === id);
      const isProtected = INITIAL_STUDENTS.some(s => s.id === id) || 
                          student?.matricula === "ADM2026" || 
                          student?.id === "adm" ||
                          student?.matricula === "PROF2026";
      return !isProtected;
    });
    
    if (deletableIds.length === 0) {
      alert(appLanguage === "pt" 
        ? "Atenção: Os alunos selecionados são protegidos (Daniel, Ana ou Professor) e não podem ser removidos."
        : "Attention: Selected students are protected (Daniel, Ana or Professor) and cannot be removed.");
      return;
    }

    // Confirmation for individual delete or bulk
    const msg = deletableIds.length === 1 
      ? (appLanguage === "pt" ? `Deseja apagar o aluno selecionado?` : `Delete selected student?`)
      : (appLanguage === "pt" ? `Deseja apagar os ${deletableIds.length} alunos selecionados?` : `Delete ${deletableIds.length} students?`);

    if (!window.confirm(msg)) return;

    setStudents(prev => {
      const remaining = prev.filter(s => !deletableIds.includes(s.id));
      localStorage.setItem("worksim_students", JSON.stringify(remaining));
      return remaining;
    });

    if (db && firebaseUser) {
      try {
        const deletePromises = deletableIds.map(id => syncDeleteDoc("students", id));
        await Promise.all(deletePromises);
      } catch (e) {
        console.error("[App] Erro ao deletar estudantes do servidor", e);
      }
    }

    alert(appLanguage === "pt" 
      ? `Sucesso: ${deletableIds.length} aluno(s) removido(s) com sucesso.` 
      : `Success: ${deletableIds.length} student(s) successfully removed.`);
  };

  const handleManualSyncToFirestore = async () => {
    if (!firebaseUser) {
      handleFirebaseGoogleLogin();
      return;
    }

    setIsFirebaseSyncing(true);
    try {
      const syncPromises = students.map(s => 
        syncSetDoc("students", s.id, sanitizeForFirestore(s), { merge: true })
      );
      await Promise.all(syncPromises);
      alert("SINCRONIZAÇÃO COMPLETA: Todos os alunos da lista local foram enviados com sucesso para a Nuvem Firestore. Agora outros usuários logados verão a mesma lista.");
    } catch (err: any) {
      console.error(err);
      alert(`ERRO NA SINCRONIZAÇÃO (${err.code || "unknown"}): ${err.message || "Verifique sua conexão ou permissões."}`);
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  const handleDownloadCheatSheet = () => {
    if (!activeStudent) return;

    const doc = new jsPDF();
    const studentName = activeStudent.nomeCompleto || "Estudante";
    const isEn = appLanguage === "en";
    const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "pt-BR");

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text(
      isEn ? "Review Answer Key - Incorrect Challenges" : "Gabarito de Revisão - Desafios Errados",
      14,
      20
    );
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      isEn
        ? `Student: ${studentName} | ID: ${activeStudent.matricula}`
        : `Aluno: ${studentName} | Matrícula: ${activeStudent.matricula}`,
      14,
      28
    );
    doc.text(
      isEn ? `Issue Date: ${dateStr}` : `Data de Emissão: ${dateStr}`,
      14,
      33
    );
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 36, 196, 36);

    // Identify incorrect challenges
    const respuestas = activeStudent.respostasDesafios || {};
    // We include challenges where value is explicitly false (wrong)
    const incorrectChallengeIds = Object.keys(respuestas).filter(id => respuestas[id] === false);

    if (incorrectChallengeIds.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      doc.text(
        isEn
          ? "Congratulations! You have no recorded errors so far."
          : "Parabéns! Você não possui erros registrados até o momento.",
        14,
        45
      );
    } else {
      const dataRows: any[] = [];
      
      incorrectChallengeIds.forEach((id) => {
        const challenge = CHALLENGES_DATA.find(c => c.id === id);
        if (challenge) {
          const ch = isEn
            ? ((challenge.fase === -1 && translatedChallengesCache[challenge.id])
                ? translatedChallengesCache[challenge.id]
                : translateChallenge(challenge, "en"))
            : challenge;

          const fase = CAREER_PHASES.find(p => p.id === challenge.fase);
          let faseNome = "";
          if (isEn) {
            if (challenge.fase === -1) {
              faseNome = "Review Simulation";
            } else {
              const moduloName = translateModuleName(challenge.fase, fase?.moduloTecnico || "", "en");
              faseNome = `Phase ${challenge.fase}: ${moduloName}`;
            }
          } else {
            faseNome = fase ? fase.cargo : `Fase ${challenge.fase}`;
          }
          
          const titleText = ch.titulo || challenge.titulo;
          const queixaText = ch.queixa || challenge.queixa;
          const justificativaText = ch.gabarito?.valoresCorretos?.justificativa || challenge.gabarito?.valoresCorretos?.justificativa || (isEn ? "See manual." : "Consulte o manual para mais detalhes.");

          dataRows.push([
            { content: `${titleText}\n(${faseNome})`, styles: { fontStyle: 'bold' } },
            queixaText,
            justificativaText
          ]);
        }
      });

      autoTable(doc, {
        startY: 40,
        head: isEn
          ? [['Challenge / Phase', 'Question / Complaint', 'Official Answer / Explanation']]
          : [['Desafio / Fase', 'Questão / Queixa', 'Gabarito Explicativo']],
        body: dataRows,
        theme: 'grid',
        headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 70 },
          2: { cellWidth: 75 }
        }
      });
    }

    doc.save(isEn ? `Review_Errors_${activeStudent.matricula}.pdf` : `Revisao_Erros_${activeStudent.matricula}.pdf`);
    playSoundEffect("success");
  };

  const handleSendCheatSheetEmail = async (providedEmail?: string) => {
    if (!activeStudent) return;
    
    const email = providedEmail || activeStudent.email;
    const isEn = appLanguage === "en";
    
    if (!email) {
      const userEmail = prompt(
        isEn
          ? "Enter your email for the answer key backup:"
          : "Informe seu email para backup do gabarito:"
      );
      if (userEmail && userEmail.includes("@")) {
        // Save email to student
        const updatedStudent = { ...activeStudent, email: userEmail };
        setStudents(prev => prev.map(s => s.id === activeStudent.id ? updatedStudent : s));
        handleSendCheatSheetEmail(userEmail);
      } else if (userEmail) {
        alert(isEn ? "Invalid email." : "Email inválido.");
      }
      return;
    }

    // Generate PDF as data URL
    const doc = new jsPDF();
    const studentName = activeStudent.nomeCompleto || "Estudante";
    const dateStr = new Date().toLocaleDateString(isEn ? "en-US" : "pt-BR");

    doc.setFontSize(18);
    doc.setTextColor(0, 51, 102);
    doc.text(
      isEn ? "Review Answer Key - Incorrect Challenges" : "Gabarito de Revisão - Desafios Errados",
      14,
      20
    );
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      isEn
        ? `Student: ${studentName} | ID: ${activeStudent.matricula}`
        : `Aluno: ${studentName} | Matrícula: ${activeStudent.matricula}`,
      14,
      28
    );
    doc.text(
      isEn ? `Issue Date: ${dateStr}` : `Data de Emissão: ${dateStr}`,
      14,
      33
    );
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 36, 196, 36);

    const respuestas = activeStudent.respostasDesafios || {};
    const incorrectChallengeIds = Object.keys(respuestas).filter(id => respuestas[id] === false);

    if (incorrectChallengeIds.length === 0) {
      alert(
        isEn
          ? "You have no recorded errors to send."
          : "Você não possui erros registrados para enviar."
      );
      return;
    }

    const dataRows: any[] = [];
    incorrectChallengeIds.forEach((id) => {
      const challenge = CHALLENGES_DATA.find(c => c.id === id);
      if (challenge) {
        const ch = isEn
          ? ((challenge.fase === -1 && translatedChallengesCache[challenge.id])
              ? translatedChallengesCache[challenge.id]
              : translateChallenge(challenge, "en"))
          : challenge;

        const fase = CAREER_PHASES.find(p => p.id === challenge.fase);
        let faseNome = "";
        if (isEn) {
          if (challenge.fase === -1) {
            faseNome = "Review Simulation";
          } else {
            const moduloName = translateModuleName(challenge.fase, fase?.moduloTecnico || "", "en");
            faseNome = `Phase ${challenge.fase}: ${moduloName}`;
          }
        } else {
          faseNome = fase ? fase.cargo : `Fase ${challenge.fase}`;
        }

        const titleText = ch.titulo || challenge.titulo;
        const queixaText = ch.queixa || challenge.queixa;
        const justificativaText = ch.gabarito?.valoresCorretos?.justificativa || challenge.gabarito?.valoresCorretos?.justificativa || (isEn ? "See manual." : "Consulte o manual.");

        dataRows.push([
          { content: `${titleText}\n(${faseNome})`, styles: { fontStyle: 'bold' } },
          queixaText,
          justificativaText
        ]);
      }
    });

    autoTable(doc, {
      startY: 40,
      head: isEn
        ? [['Challenge / Phase', 'Question / Complaint', 'Official Answer / Explanation']]
        : [['Desafio / Fase', 'Questão / Queixa', 'Gabarito Explicativo']],
      body: dataRows,
      theme: 'grid',
      headStyles: { fillColor: [0, 51, 102], textColor: [255, 255, 255] },
      styles: { fontSize: 9 }
    });

    const pdfBase64 = doc.output('datauristring');

    try {
      const response = await fetch("/api/send-cheat-sheet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          studentName: activeStudent.nomeCompleto,
          pdfBase64,
          matricula: activeStudent.matricula,
          lang: appLanguage
        })
      });

      if (response.ok) {
        const toast = document.createElement("div");
        toast.className = "fixed bottom-5 right-5 z-[20000] bg-emerald-500 text-slate-950 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce font-sans font-black border border-emerald-400 text-xs";
        toast.innerHTML = isEn
          ? `<span>✓ Answer key sent to ${email}!</span>`
          : `<span>✓ Gabarito enviado para ${email}!</span>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 4000);
        playSoundEffect("success");
      } else {
        const error = await response.json();
        alert(isEn ? `Error: ${error.error}` : `Erro: ${error.error}`);
      }
    } catch (err) {
      alert(
        isEn
          ? "Error connecting to the email server."
          : "Erro ao conectar com o servidor de email."
      );
    }
  };

  const handleDeleteAllStudents = async () => {
    if (!isProfessorOrAdmin) return;
    
    if (!window.confirm("LIMPEZA GERAL: Você deseja apagar TODOS os novos cadastros? Daniel e Ana Paula serão preservados como base. Deseja continuar?")) {
      return;
    }

    // 1. Reset local state to INITIAL_STUDENTS baseline
    setStudents(INITIAL_STUDENTS);
    localStorage.setItem("worksim_students", JSON.stringify(INITIAL_STUDENTS));
    localStorage.removeItem("worksim_folhas_pdfs"); 

    // 2. Delete from Firestore (excluding base students)
    if (firebaseUser) {
      try {
        const deletePromises: Promise<void>[] = [];
        const studentSnapshot = await getDocs(collection(db, "students"));
        const baseIds = INITIAL_STUDENTS.map(s => s.id);
        const baseMatriculas = INITIAL_STUDENTS.map(s => s.matricula);

        studentSnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!baseIds.includes(docSnap.id) && !baseMatriculas.includes(data.matricula)) {
            deletePromises.push(syncDeleteDoc("students", docSnap.id));
          }
        });

        // 2b. Delete Other Logs/Data
        const otherCollections = ["broadcasts", "feedbacks", "custom_challenges"];
        for (const collName of otherCollections) {
          const snapshot = await getDocs(collection(db, collName));
          snapshot.forEach(docSnap => {
            deletePromises.push(syncDeleteDoc(collName, docSnap.id));
          });
        }

        await Promise.all(deletePromises);
        alert("Banco de dados limpo com sucesso! Alunos de teste e logs de sistema removidos. Base original preservada.");
      } catch (e) {
        console.error("Erro ao limpar Firestore", e);
        alert("Erro ao tentar limpar o banco de dados. Verifique o console.");
      }
    }
  };

  const handleSyncAllStudents = async () => {
    if (!firebaseUser) {
      alert("Para sincronizar com a Nuvem, você precisa primeiro estar logado com sua conta Google.");
      handleFirebaseGoogleLogin();
      return;
    }

    if (!isProfessorOrAdmin || firebaseUser.email?.toLowerCase() !== "fabiosantanalima01@gmail.com") {
      alert(`Ação restrita: Apenas o Professor (fabiosantanalima01@gmail.com) pode realizar a sincronização global do banco de dados. Sua conta atual é: ${firebaseUser.email}`);
      return;
    }
    
    setIsFirebaseSyncing(true);
    setFirebaseSyncError(null);
    try {
      const syncPromises = students.map(s => 
        syncSetDoc("students", s.id, sanitizeForFirestore(s), { merge: true })
      );
      await Promise.all(syncPromises);
      alert("SINCRONIZAÇÃO COMPLETA: Todos os alunos da lista local foram enviados com sucesso para a Nuvem Firestore. Agora outros usuários logados verão a mesma lista.");
      playSoundEffect("success");
    } catch (err: any) {
      console.error("Sync all error:", err);
      setFirebaseSyncError(err.message || String(err));
      alert("Erro na sincronização: " + (err.message || String(err)));
      playSoundEffect("failure");
    } finally {
      setIsFirebaseSyncing(false);
    }
  };

  // Auto unlock special squad PCs
  const handleUnlockSquadMachine = (machineId: string) => {
    setAlerts((prev) => [
      {
        id: Date.now(),
        from: "Professor/Monitoria (Onboarding)",
        text: `Chave bypass de Squad para Célula ativa no [${machineId}].`,
        time: "Agora",
      },
      ...prev,
    ]);
  };

  const handleAssignSquad = (machineId: string, studentIds: string[]) => {
    const cleanMachine = machineId.trim().toUpperCase();
    if (!cleanMachine) return;

    setStudents((prev) => {
      // Find what the squad's maximum group earned points are right now
      const currentSquadStudents = prev.filter(s => s.timeId === cleanMachine);
      const withAntecedente = currentSquadStudents.filter(
        (p) => p.xpAntecedente !== undefined && p.xpAntecedente !== null
      );
      let maxGroupEarnedXp = 0;
      if (withAntecedente.length > 0) {
        maxGroupEarnedXp = Math.max(0, ...withAntecedente.map((p) => p.xp - (p.xpAntecedente || 0)));
      }

      return prev.map((s) => {
        if (studentIds.includes(s.id)) {
          const antValue = Math.max(0, s.xp - maxGroupEarnedXp);
          return { ...s, timeId: cleanMachine, xpAntecedente: antValue };
        } else if (s.timeId === cleanMachine) {
          return { ...s, timeId: undefined, xpAntecedente: undefined };
        }
        return s;
      });
    });

    setSquadLogs((prev) => {
      const filtered = prev.filter((log) => log.machineId !== cleanMachine);
      if (studentIds.length === 0) return filtered;
      const now = new Date();
      const timestamp = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      return [
        {
          id: `squad-${Date.now()}`,
          machineId: cleanMachine,
          studentIds,
          timestamp,
        },
        ...filtered,
      ];
    });

    const names = students.filter((s) => studentIds.includes(s.id)).map((s) => s.nomeCompleto).join(", ");
    setAlerts((prev) => [
      {
        id: Date.now(),
        from: "Mainframe Células",
        text: `Célula de trabalho [${cleanMachine}] autorizada e vinculada à equipe: [${names || "Individual / Vazio"}].`,
        time: "Agora",
      },
      ...prev,
    ]);
  };

  const handleRemoveSquad = (machineId: string) => {
    const cleanMachine = machineId.trim().toUpperCase();
    setStudents((prev) => {
      return prev.map((s) => {
        if (s.timeId === cleanMachine) {
          return { ...s, timeId: undefined, xpAntecedente: undefined };
        }
        return s;
      });
    });

    setSquadLogs((prev) => prev.filter((log) => log.machineId !== cleanMachine));

    setAlerts((prev) => [
      {
        id: Date.now(),
        from: "Mainframe Células",
        text: `Célula de trabalho [${cleanMachine}] desvinculada e liberada pelo docente.`,
        time: "Agora",
      },
      ...prev,
    ]);
  };

  const handleAddStudentToSquad = (machineId: string, studentId: string) => {
    const cleanMachine = machineId.trim().toUpperCase();
    setStudents((prev) => {
      // Find what the squad's maximum group earned points are right now
      const currentSquadStudents = prev.filter(s => s.timeId === cleanMachine);
      const withAntecedente = currentSquadStudents.filter(
        (p) => p.xpAntecedente !== undefined && p.xpAntecedente !== null
      );
      let maxGroupEarnedXp = 0;
      if (withAntecedente.length > 0) {
        maxGroupEarnedXp = Math.max(0, ...withAntecedente.map((p) => p.xp - (p.xpAntecedente || 0)));
      }

      return prev.map((s) => {
        if (s.id === studentId) {
          const antValue = Math.max(0, s.xp - maxGroupEarnedXp);
          return { ...s, timeId: cleanMachine, xpAntecedente: antValue };
        }
        return s;
      });
    });

    setSquadLogs((prev) => {
      const existingLog = prev.find((log) => log.machineId === cleanMachine);
      const now = new Date();
      const timestamp = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

      if (existingLog) {
        if (existingLog.studentIds.includes(studentId)) return prev;
        if (existingLog.studentIds.length >= 4) return prev;
        return prev.map((log) => {
          if (log.machineId === cleanMachine) {
            return {
              ...log,
              studentIds: [...log.studentIds, studentId],
              timestamp,
            };
          }
          return log;
        });
      } else {
        return [
          {
            id: `squad-${Date.now()}`,
            machineId: cleanMachine,
            studentIds: [studentId],
            timestamp,
          },
          ...prev,
        ];
      }
    });

    const targetName = students.find((s) => s.id === studentId)?.nomeCompleto || "Estudante";
    setAlerts((prev) => [
      {
        id: Date.now(),
        from: "Mainframe Células",
        text: `Aluno [${targetName}] adicionado à célula de trabalho compartilhada [${cleanMachine}].`,
        time: "Agora",
      },
      ...prev,
    ]);
  };

  const handleAddCustomChallengeByProfessor = async (challenge: Challenge, targetStudentId: string | "ALL") => {
    // 1. Check uniqueness and inject to customChallenges
    const isConflict = customChallenges.some(c => c.id === challenge.id) || CHALLENGES_DATA.some(c => c.id === challenge.id);
    let finalId = challenge.id;
    if (isConflict) {
      finalId = `SCEN-${Date.now()}`;
    }
    const finalChallenge = {
      ...challenge,
      id: finalId,
    };

    setCustomChallenges(prev => [...prev, finalChallenge]);

    // Push the custom challenge template to Firebase Firestore if logged in
    if (auth.currentUser) {
      try {
        await syncSetDoc("custom_challenges", finalId, sanitizeForFirestore(finalChallenge));
      } catch (err) {
        console.error("Failed to push custom challenge to Firestore:", err);
      }
    }

    // 2. Map and notify students
    setStudents(prevStudents => {
      const updated = prevStudents.map(student => {
        if (targetStudentId === "ALL" || student.id === targetStudentId) {
          const timeStr = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
          const newMsg = {
            id: `sys-cust-${Date.now()}-${Math.random()}`,
            remetente: "Sistema",
            texto: `🎯 NOVO CENÁRIO DIRECIONADO: O Professor/Monitoria atribuiu a você o desafio de treinamento especial "${finalChallenge.titulo}" (${finalChallenge.focoTecnico}). Peso: +${finalChallenge.xpRecompensa} XP. Acesse-o imediatamente na aba de Desafios da Fase ${finalChallenge.fase}!`,
            timestamp: timeStr
          };
          
          return {
            ...student,
            faseAtual: Math.max(student.faseAtual, finalChallenge.fase),
            mensagensChat: [...(student.mensagensChat || []), newMsg],
          };
        }
        return student;
      });

      // Synchronize in batch to Firestore if logged in
      if (auth.currentUser) {
        updated.forEach(async (s) => {
          try {
            await syncSetDoc("students", s.id, sanitizeForFirestore(s));
          } catch (err) {
            console.error("Failed to sync targeted student to Firestore during custom scenario push:", err);
          }
        });
      }

      return updated;
    });

    // If the active student is a target, immediately select it!
    if (activeStudentId && (targetStudentId === "ALL" || activeStudentId === targetStudentId)) {
      setSelectedPhaseId(finalChallenge.fase);
      setSelectedChallengeId(finalChallenge.id);
      playSoundEffect("bip");
    }
  };

  // Promote student's current phase (and update career title)
  const handlePromoteStudent = (studentId: string, nextPhase: number) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const correspondingPhase = CAREER_PHASES.find(
            (p) => p.id === nextPhase,
          );
          return {
            ...s,
            faseAtual: nextPhase,
            cargo: correspondingPhase?.cargo || s.cargo,
            status: "Ativo" as const,
          };
        }
        return s;
      }),
    );

    // If active student is currently updated/promoted, live update their active views
    if (activeStudentId === studentId) {
      setSelectedPhaseId(nextPhase);
    }
  };

  const handleUpdateStudent = async (studentId: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, ...updates } : s));
    
    try {
      await syncSetDoc("students", studentId, updates, { merge: true });
      if (updates.soundTheme) {
        playSoundEffect(updates.soundTheme);
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `students/${studentId}`);
    }
  };

  // Update simulation elapsed active session seconds
  const handleUpdateSimulationTime = (seconds: number) => {
    if (!activeStudentId) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          return {
            ...s,
            tempoAtivoSegundos: seconds,
          };
        }
        return s;
      })
    );
    playSoundEffect("success");
  };

  // Start bathroom break pause
  const handleStartBathroomPause = () => {
    if (!activeStudentId || isScreenBlocked) return;
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const used = s.pausasBanheiroUsadas || 0;
          if (used >= 3) return s;
          
          const now = new Date();
          const timeStr = now.toLocaleTimeString("pt-BR");
          const newMsg = {
            id: `${Date.now()}-${Math.random()}`,
            remetente: "Sistema",
            texto: `SISTEMA 🚽: O aluno entrou em pausa para banheiro às ${timeStr} (Pausa ${used + 1} de 3). O tempo ativo e o timer de ociosidade foram congelados com segurança.`,
            timestamp: timeStr,
          };
          
          return {
            ...s,
            pausaAtiva: "banheiro",
            pauseStartTime: Date.now(),
            pausasBanheiroUsadas: used + 1,
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );
    playSoundEffect("success");
  };

  const handleStartDoubtPause = () => {
    if (!activeStudentId || isScreenBlocked) return;
    setShowDoubtPopup(true);
  };

  const handleConfirmDoubtPause = (pergunta: string) => {
    if (!pergunta.trim() || !activeStudentId) return;
    
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString("pt-BR");
          
          const newDoubt = {
            id: `${Date.now()}-${Math.random()}`,
            pergunta: pergunta.trim(),
            resolvida: false,
            timestamp: timeStr,
            faseId: selectedPhaseId,
          };
          
          const newMsg = {
            id: `${Date.now()}-${Math.random()}`,
            remetente: "Sistema",
            texto: `SISTEMA ❓: DÚVIDA ENVIADA às ${timeStr}. Estação pausada aguardando avaliação do Professor/Monitoria: "${pergunta.trim()}"`,
            timestamp: timeStr,
          };
          
          return {
            ...s,
            pausaAtiva: "duvida",
            pauseStartTime: Date.now(),
            duvidaPendenteTexto: pergunta.trim(),
            duvidasHistorico: [...(s.duvidasHistorico || []), newDoubt],
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );
    setShowDoubtPopup(false);
    setDoubtTextValue("");
    playSoundEffect("success");
    
    setAlerts((prevAlerts) => [
      {
        id: Date.now(),
        from: "Central de Dúvidas CLT",
        text: `Sua dúvida técnica foi disparada para a mesa do Professor/Monitoria. Carregando atendimento presencial...`,
        time: "Agora",
      },
      ...prevAlerts,
    ]);
  };

  const handleCancelPause = () => {
    if (!activeStudentId) return;

    // Deduct pause duration from challenge timer
    const activeStudent = students.find((s) => s.id === activeStudentId);
    if (activeStudent?.pauseStartTime) {
      const duration = Date.now() - activeStudent.pauseStartTime;
      setChallengeStartTime((prev) => prev + duration);
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString("pt-BR");
          const newMsg = {
            id: `${Date.now()}-${Math.random()}`,
            remetente: "Sistema",
            texto: `SISTEMA ▶: Pausa encerrada às ${timeStr}. Estação reativada e cronômetros retomados.`,
            timestamp: timeStr,
          };
          return {
            ...s,
            pausaAtiva: null,
            pauseStartTime: undefined,
            duvidaPendenteTexto: undefined,
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );
    playSoundEffect("success");
  };

  // Clear doubt counter limits and history
  const handleResetDoubtCounter = (studentId: string) => {
    // Deduct pause duration if resetting during an active pause
    if (studentId === activeStudentId) {
      const activeStudent = students.find((s) => s.id === activeStudentId);
      if (activeStudent?.pauseStartTime) {
        const duration = Date.now() - activeStudent.pauseStartTime;
        setChallengeStartTime((prev) => prev + duration);
      }
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString("pt-BR");
          const newMsg = {
            id: `${Date.now()}-reset-doubts`,
            remetente: "Sistema",
            texto: `SISTEMA 🔄: Seus contadores de dúvidas corporativas foram reiniciados pelo Professor/Monitoria. Primeira dúvida volta a conceder +15 XP!`,
            timestamp: timeStr,
          };
          return {
            ...s,
            contagemDuvidasDia: 0,
            duvidaPendenteTexto: undefined,
            pausaAtiva: null,
            pauseStartTime: undefined,
            duvidasHistorico: [],
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );
    playSoundEffect("success");
  };

  // Reset/Zero current logged-in user's XP
  const handleZeroOwnXP = () => {
    if (!activeStudentId) return;
    if (window.confirm(appLanguage === "en" ? "Are you sure you want to reset your XP to 0?" : "Tem certeza que deseja zerar seu XP para 0?")) {
      setStudents((prev) =>
        prev.map((s) => {
          if (s.id === activeStudentId) {
            const now = new Date();
            const timeStr = now.toLocaleTimeString("pt-BR");
            const newMsg = {
              id: `${Date.now()}-reset-xp`,
              remetente: "Sistema",
              texto: `SISTEMA 🌟: Seu XP foi zerado com sucesso conforme sua solicitação direta.`,
              timestamp: timeStr,
            };
            return {
              ...s,
              xp: 0,
              mensagensChat: [...(s.mensagensChat || []), newMsg],
            };
          }
          return s;
        })
      );
      syncSetDoc("students", activeStudentId, { xp: 0 }, { merge: true }).catch(console.error);
      playSoundEffect("success");
    }
  };

  // Answer doubt from Cockpit (Professor/Monitoria Desk)
  const handleAnswerDoubt = (studentId: string, doubtId: string, answerText: string) => {
    // Deduct pause duration when answer is given
    if (studentId === activeStudentId) {
      const activeStudent = students.find((s) => s.id === activeStudentId);
      if (activeStudent?.pauseStartTime) {
        const duration = Date.now() - activeStudent.pauseStartTime;
        setChallengeStartTime((prev) => prev + duration);
      }
    }

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === studentId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString("pt-BR");
          
          // Calculate how many doubts have been resolved so far
          const resolvedCount = s.duvidasHistorico?.filter(d => d.resolvida).length || 0;
          const bonusXp = resolvedCount === 0 ? 15 : resolvedCount === 1 ? 10 : resolvedCount === 2 ? 5 : 3;
          
          // Map history to set this doubt as resolved
          const updatedHistory = (s.duvidasHistorico || []).map((d) => {
            if (d.id === doubtId || (!d.resolvida && d.id === "fallback")) {
              return {
                ...d,
                resolvida: true,
                resposta: answerText,
                timestampSolucao: timeStr,
              };
            }
            return d;
          });

          const newMsg = {
            id: `${Date.now()}-doubt-solved`,
            remetente: "Professor/Monitoria",
            texto: `💡 RESPOSTA DO PROFESSOR/MONITORIA: "${answerText}" (+${bonusXp} XP concedidos por empenho e iniciativa!)`,
            timestamp: timeStr,
          };

          return {
            ...s,
            xp: s.xp + bonusXp,
            pausaAtiva: null,
            pauseStartTime: undefined,
            duvidaPendenteTexto: undefined,
            duvidasHistorico: updatedHistory,
            mensagensChat: [...(s.mensagensChat || []), newMsg],
          };
        }
        return s;
      })
    );

    // Also trigger global alert
    setAlerts((prevAlerts) => [
      {
        id: Date.now(),
        from: "Mesa do Professor/Monitoria",
        text: `Dúvida técnica de Aluno resolvida com sucesso! Atendimento concluído.`,
        time: "Agora",
      },
      ...prevAlerts,
    ]);

    playSoundEffect("success");
  };

  // Fetch active stage challenge context
  const isAlreadyAttempted =
    activeChallenge !== null &&
    activeStudent?.respostasDesafios?.[activeChallenge.id] !== undefined;
  const hasSucceeded =
    activeChallenge !== null &&
    activeStudent?.respostasDesafios?.[activeChallenge.id] === true;

  // Unlocking rule of CRM Check: Allowed from Caso 1.15 index upwards
  const currentChIndexInPhase = activeChallenge
    ? phaseChallenges.findIndex((c) => c.id === activeChallenge.id)
    : 0;
  const isCrmCheckUnlocked =
    selectedPhaseId > 1 ||
    (selectedPhaseId === 1 && currentChIndexInPhase >= 15);

  const calculateBonusXp = (): number => {
    const elapsedSeconds = (Date.now() - challengeStartTime) / 1000;
    const elapsedMinutes = elapsedSeconds / 60;
    if (elapsedMinutes < 2) {
      return 2;
    } else if (elapsedMinutes < 3) {
      return 1;
    }
    return 0;
  };

  const selectPreviousChallenge = () => {
    if (!selectedChallengeId) return;
    const idx = phaseChallenges.findIndex((c) => c.id === selectedChallengeId);
    if (idx > 0) {
      setSelectedChallengeId(phaseChallenges[idx - 1].id);
      resetChallengeStates();
    }
  };

  const selectNextChallenge = () => {
    if (!selectedChallengeId) return;
    const idx = phaseChallenges.findIndex((c) => c.id === selectedChallengeId);
    if (idx < phaseChallenges.length - 1) {
      setSelectedChallengeId(phaseChallenges[idx + 1].id);
      resetChallengeStates();
    } else {
      // Last question of the phase! Check if the phase is completed and passed
      if (activeStudent) {
        const hasPassed = checkIfPassedPhase(activeStudent, selectedPhaseId);
        if (hasPassed) {
          const nextPhaseId = selectedPhaseId + 1;
          const phaseExists = CAREER_PHASES.some((p) => p.id === nextPhaseId);
          if (phaseExists && activeStudentId) {
            // Trigger the beautiful phase transition overlay!
            setCompletedPhaseTransition({ from: selectedPhaseId, to: nextPhaseId });

            // Promote the student to next phase
            handlePromoteStudent(activeStudentId, nextPhaseId);
            
            // Select the first challenge of the new phase
            const nextPhaseChallenges = allChallenges.filter((c) => c.fase === nextPhaseId);
            if (nextPhaseChallenges.length > 0) {
              setSelectedChallengeId(nextPhaseChallenges[0].id);
            } else {
              setSelectedChallengeId(null);
            }
            resetChallengeStates();
            
            // Sound and alert notification
            playSoundEffect("success");
            setAlerts((prevAlerts) => [
              {
                id: Date.now(),
                from: "Sistema de DP",
                text: activeStudent.isVeterano 
                  ? `AVANÇO (VETERANO)! Iniciando Fase ${nextPhaseId}!`
                  : `PROMOÇÃO! Você concluiu a Fase ${selectedPhaseId} e foi promovido para a Fase ${nextPhaseId}!`,
                time: "Agora",
              },
              ...prevAlerts,
            ]);
          } else {
            // No next phase exists (they completed everything!)
            playSoundEffect("success");
            setAlerts((prevAlerts) => [
              {
                id: Date.now(),
                from: "Sistema de DP",
                text: `🏆 PARABÉNS! Você concluiu todas as etapas do Simulador!`,
                time: "Agora",
              },
              ...prevAlerts,
            ]);
          }
        } else {
          // Not passed yet!
          playSoundEffect("failure");
          
          const phaseChallengesList = allChallenges.filter((c) => c.fase === selectedPhaseId);
          const attemptedCount = phaseChallengesList.filter((c) => activeStudent.respostasDesafios?.[c.id] !== undefined).length;
          const totalCount = phaseChallengesList.length;
          
          let alertText = "";
          if (attemptedCount < totalCount) {
            alertText = `⚠️ ATIVIDADE PENDENTE: Você ainda não respondeu todos os ${totalCount} desafios desta fase. (${attemptedCount}/${totalCount} respondidos)`;
          } else {
            const correctCount = phaseChallengesList.filter((c) => activeStudent.respostasDesafios?.[c.id] === true).length;
            const accuracy = (correctCount / totalCount) * 100;
            alertText = `⚠️ REQUISITO NÃO ATINGIDO: Você precisa de no mínimo 70% de acerto para liberar a próxima fase! Sua precisão atual é de ${accuracy.toFixed(1)}%.`;
          }
          
          setAlerts((prevAlerts) => [
            {
              id: Date.now(),
              from: "Sistema de DP",
              text: alertText,
              time: "Agora",
            },
            ...prevAlerts,
          ]);
        }
      }
    }
  };

  useEffect(() => {
    setMatrixCountdown(null);
  }, [hasSucceeded, selectedPhaseId]);

  const resetChallengeStates = () => {
    setSelectedOptionId(null);
    setChallengeFeedback(null);
    setTrctSaldoInput("");
    setTrctAvisoInput("");
    setTrctDecimoInput("");
    setTrctFeriasInput("");
    setTrctMultaInput("");
    setCrisisInputs({
      salario: "",
      mediaHe: "",
      insalubridade: "",
      periculosidade: "",
      horasExtras: "",
      adicionalNoturno: "",
      comissoes: "",
      dsrHe: "",
      inss: "",
      irrf: "",
      vt: "",
      faltasDesconto: "",
      salarioFamilia: "",
      baseFgts: "",
      fgts: "",
    });
    setTrctResultMsg(null);
  };

  const evaluatePhaseCompletionAndStreaks = (
    updatedStudent: Student,
    submittedChallengeId: string,
    wasCorrectSubmit: boolean
  ): { student: Student; sideEffects?: { type: string; payload?: any }[] } => {
    const currentPhaseId = selectedPhaseId;

    // Phase -1 is a review phase, no promotions or streaks logic applies
    if (currentPhaseId === -1) {
      return { student: updatedStudent };
    }

    const phaseChallengesList = allChallenges.filter((c) => c.fase === currentPhaseId);
    
    // Check if ALL challenges of this current phase have been answered (either correctly or incorrectly)
    const allAnswered = phaseChallengesList.every((c) => {
      if (c.id === submittedChallengeId) return true;
      return updatedStudent.respostasDesafios?.[c.id] !== undefined;
    });

    // Only process if ALL phase challenges are now completed (and weren't all completed previously)
    const previouslyCompletedCount = phaseChallengesList.filter(
      (c) => c.id !== submittedChallengeId && updatedStudent.respostasDesafios?.[c.id] !== undefined
    ).length;
    
    const isJustCompletingPhase = allAnswered && previouslyCompletedCount === phaseChallengesList.length - 1;

    let sideEffects: { type: string; payload?: any }[] = [];

    if (isJustCompletingPhase) {
      // 1. Check local accuracy for THIS phase
      const correctInPhase = phaseChallengesList.filter((c) => {
        if (c.id === submittedChallengeId) return wasCorrectSubmit;
        return updatedStudent.respostasDesafios?.[c.id] === true;
      }).length;
      
      const accuracyInPhase = phaseChallengesList.length > 0 ? (correctInPhase / phaseChallengesList.length) * 100 : 0;
      
      // 2. Check if student asked any doubts in THIS phase
      const doubtsInPhaseCount = (updatedStudent.duvidasHistorico || []).filter(
        (d) => d.faseId === currentPhaseId
      ).length;

      const isAutonomousAwesome = accuracyInPhase >= 95 && doubtsInPhaseCount === 0;
      
      let finalXp = updatedStudent.xp;
      let streakValue = updatedStudent.streakFasesAutonomas || 0;
      let chatMsgs = [...(updatedStudent.mensagensChat || [])];
      
      const timeStr = new Date().toLocaleTimeString("pt-BR");

      if (isAutonomousAwesome) {
        // Calculate the base XP gained from this phase's challenges:
        const phaseBaseXp = phaseChallengesList.reduce((acc, c) => {
          const correct = c.id === submittedChallengeId ? wasCorrectSubmit : updatedStudent.respostasDesafios?.[c.id] === true;
          return acc + (correct ? c.xpRecompensa : 0);
        }, 0);

        // Double the XP! (add extra phaseBaseXp)
        finalXp += phaseBaseXp;
        streakValue += 1;

        chatMsgs.push({
          id: `${Date.now()}-autonomous`,
          remetente: "Sistema",
          texto: `🎉 EXCELÊNCIA OPERACIONAL AUTÔNOMA! Você concluiu a Fase ${currentPhaseId} com precisão de ${accuracyInPhase.toFixed(1)}% sem tirar dúvidas presenciais. Seu XP ganho nesta fase foi DOBRADO (+${phaseBaseXp} XP extra adicionados!).`,
          timestamp: timeStr,
        });

        sideEffects.push({ type: 'alert', payload: { id: Date.now() + 1, from: "DP Autônomo CLT", text: `XP DOBRADO na Fase ${currentPhaseId}! Autonomia exemplar e precisão impecável!`, time: "Agora" } });

        if (streakValue >= 3) {
          finalXp += 250;
          chatMsgs.push({
            id: `${Date.now()}-streak3`,
            remetente: "Sistema",
            texto: `🔥 STREAK IMPERÁVEL! Parabéns! Você completou 3 fases consecutivas em plena autonomia com acertos >95% sem suporte! Você recebeu uma bonificação de +250 XP! A Monitoria orgulha-se de sua proficiência!`,
            timestamp: timeStr,
          });
          sideEffects.push({ type: 'sound', payload: 'success' });
          sideEffects.push({ type: 'streakCelebration', payload: true });
        }
      } else {
        streakValue = 0;
        chatMsgs.push({
          id: `${Date.now()}-phasecompleted`,
          remetente: "Sistema",
          texto: `🏁 Fase ${currentPhaseId} Concluída! Você operou com ${accuracyInPhase.toFixed(1)}% de precisão nesta etapa e utilizou suporte presencial para tirar dúvidas. Continue estudando!`,
          timestamp: timeStr,
        });
      }

      const nextPhaseId = currentPhaseId + 1;
      const phaseExists = CAREER_PHASES.some((p) => p.id === nextPhaseId);

      const hasPassedThisPhase = checkIfPassedPhase(updatedStudent, currentPhaseId);

      if (hasPassedThisPhase && phaseExists) {
        // Automatic Transition Trigger
        const nextPhaseChallenges = allChallenges.filter((c) => c.fase === nextPhaseId);
        sideEffects.push({ 
          type: 'phaseTransition', 
          payload: { 
            from: currentPhaseId, 
            to: nextPhaseId,
            nextPhaseChallenges
          } 
        });

        // Add Success Alert for precision
        sideEffects.push({
          type: 'alert',
          payload: {
            id: Date.now() + 1,
            from: "Sistema de Carreira",
            text: `✅ FASE ${currentPhaseId} SUPERADA! Você atingiu ${accuracyInPhase.toFixed(1)}% de precisão. Promoção para ${CAREER_PHASES.find(p => p.id === nextPhaseId)?.cargo} homologada com sucesso!`,
            time: "Agora"
          }
        });

        if (updatedStudent.isVeterano) {
          chatMsgs.push({
            id: `${Date.now()}-passed-progression`,
            remetente: "Sistema",
            texto: `🎓 CONCLUÍDO (VETERANO): Você completou todos os testes da Fase ${currentPhaseId}. Prossiga clicando em "Próximo" para avançar de fase!`,
            timestamp: timeStr,
          });
        } else {
          chatMsgs.push({
            id: `${Date.now()}-passed-progression`,
            remetente: "Sistema",
            texto: `🎉 REQUISITO ATINGIDO! Você concluiu a Fase ${currentPhaseId} com ${accuracyInPhase.toFixed(1)}% de aproveitamento técnico e foi aprovado para a próxima etapa. Avance requisitando a Próxima Questão!`,
            timestamp: timeStr,
          });
        }
      } else if (!hasPassedThisPhase && phaseExists) {
        // Add Failure Alert for precision
        sideEffects.push({
          type: 'alert',
          payload: {
            id: Date.now() + 2,
            from: "Sistema de Carreira",
            text: `❌ REQUISITO NÃO ATINGIDO: Precisão de ${accuracyInPhase.toFixed(1)}% é insuficiente. O mínimo para a Fase ${currentPhaseId} é ${CAREER_PHASES.find(p => p.id === currentPhaseId)?.precisaoMinima}%.`,
            time: "Agora"
          }
        });

        if (!updatedStudent.isVeterano) {
          chatMsgs.push({
            id: `${Date.now()}-failed-progression`,
            remetente: "Sistema",
            texto: `⚠️ REQUISITO NÃO ATINGIDO: Para avançar para a Fase ${nextPhaseId}, você precisa de no mínimo 70% de aproveitamento técnico nesta etapa. Sua precisão foi de ${accuracyInPhase.toFixed(1)}%. Revise os conceitos com a Monitoria.`,
            timestamp: timeStr,
          });
        }
      }

      const finalStudent = {
        ...updatedStudent,
        xp: finalXp,
        streakFasesAutonomas: streakValue,
        mensagensChat: chatMsgs,
      };

      if (hasPassedThisPhase && phaseExists) {
        finalStudent.faseAtual = nextPhaseId;
        finalStudent.cargo = CAREER_PHASES.find((p) => p.id === nextPhaseId)?.cargo || finalStudent.cargo;
      }

      return {
        student: finalStudent,
        sideEffects
      };
    }

    return { student: updatedStudent };
  };

  const applySideEffects = (sideEffects: { type: string; payload?: any }[]) => {
    sideEffects.forEach((effect) => {
      switch (effect.type) {
        case 'alert':
          setAlerts((prev) => [effect.payload, ...prev]);
          break;
        case 'sound':
          playSoundEffect(effect.payload);
          break;
        case 'streakCelebration':
          setShowStreakCelebration(effect.payload);
          break;
        case 'phaseTransition':
          // Start the transition overlay and updates
          setCompletedPhaseTransition({ from: effect.payload.from, to: effect.payload.to });
          setSelectedPhaseId(effect.payload.to);
          
          if (effect.payload.nextPhaseChallenges.length > 0) {
            setSelectedChallengeId(effect.payload.nextPhaseChallenges[0].id);
          } else {
            setSelectedChallengeId(null);
          }
          resetChallengeStates();
          
          // Flash a success sound immediately
          playSoundEffect("success");
          break;
      }
    });
  };

  // Trigger evaluation feedback loops
  const handleCheckChallengeMCQ = () => {
    if (!activeChallenge || !selectedOptionId) return;

    const isCorrect =
      selectedOptionId === activeChallenge.gabarito.respostaEsperadaId;
    
    const elapsedSeconds = Math.round((Date.now() - challengeStartTime) / 1000);

    if (isCorrect) {
      const bonus = calculateBonusXp();
      playSoundEffect("success");
      setChallengeFeedback({
        isCorrect: true,
        text: `Excelente escolha! ${activeChallenge.gabarito.valoresCorretos?.justificativa || "Seu diagnóstico contábil-legal foi cirúrgico."}${bonus > 0 ? ` (Bônus de tempo: +${bonus} XP!)` : ""}`,
        article: activeChallenge.gabarito.artigoLegal,
      });

      // Update student metrics
      if (
        activeStudentId &&
        !completedChallenges.includes(activeChallenge.id)
      ) {
        setCompletedChallenges((prev) => [...prev, activeChallenge.id]);
        
        let targetSideEffects: { type: string; payload?: any }[] = [];
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === activeStudentId) {
              const newXp = s.xp + activeChallenge.xpRecompensa + bonus;

              const updatedRespostas = {
                ...(s.respostasDesafios || {}),
                [activeChallenge.id]: true,
              };
              const correctCount = Object.entries(updatedRespostas).filter(
                ([_, val]) => val === true,
              ).length;
              const attemptedCount = Object.keys(updatedRespostas).length;
              const newPrecisao =
                attemptedCount > 0
                  ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                  : 100.0;

              const resolvedStudentMap = {
                ...s,
                xp: newXp,
                precisao: newPrecisao,
                respostasDesafios: updatedRespostas,
                temposRespostas: {
                  ...(s.temposRespostas || {}),
                  [activeChallenge.id]: elapsedSeconds,
                },
                casosResolvidosNoCiclo: (s.casosResolvidosNoCiclo || 0) + 1,
              };

              const result = evaluatePhaseCompletionAndStreaks(resolvedStudentMap, activeChallenge.id, true);
              if (result.sideEffects) targetSideEffects = result.sideEffects;
              return result.student;
            }
            return s;
          }),
        );
        if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
      }
    } else {
      playSoundEffect("failure");
      setChallengeFeedback({
        isCorrect: false,
        text: `Opção incorreta! Você gerou uma brecha legal ou passivo trabalhista que compromete as contas da empresa. Este caso foi encerrado e não pode ser refeito.`,
        article: activeChallenge.gabarito.artigoLegal,
      });

      // Update student metrics - Register error, cannot redo
      if (activeStudentId) {
        let targetSideEffects: { type: string; payload?: any }[] = [];
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === activeStudentId) {
              const updatedRespostas = {
                ...(s.respostasDesafios || {}),
                [activeChallenge.id]: false,
              };
              const correctCount = Object.entries(updatedRespostas).filter(
                ([_, val]) => val === true,
              ).length;
              const attemptedCount = Object.keys(updatedRespostas).length;
              const newPrecisao =
                attemptedCount > 0
                  ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                  : 100.0;

              const incorrectStudentMap = {
                ...s,
                precisao: newPrecisao,
                respostasDesafios: updatedRespostas,
                temposRespostas: {
                  ...(s.temposRespostas || {}),
                  [activeChallenge.id]: elapsedSeconds,
                },
              };

              const result = evaluatePhaseCompletionAndStreaks(incorrectStudentMap, activeChallenge.id, false);
              if (result.sideEffects) targetSideEffects = result.sideEffects;
              return result.student;
            }
            return s;
          }),
        );
        if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
      }
    }
  };

  // Evaluate interactive severance grid (Phase 5 Challenges)
  const handleCheckChallengeSeverances = (
    isCorrect: boolean,
    feedbackText: string,
    article: string,
    selectedMap: Record<string, boolean>
  ) => {
    if (!activeChallenge) return;

    // Save selection
    setSeveranceSelections((prev) => ({
      ...prev,
      [activeChallenge.id]: selectedMap,
    }));

    const elapsedSeconds = Math.round((Date.now() - challengeStartTime) / 1000);

    if (isCorrect) {
      const bonus = calculateBonusXp();
      playSoundEffect("success");
      setChallengeFeedback({
        isCorrect: true,
        text: `Excelente! ${feedbackText}${bonus > 0 ? ` (Bônus de tempo: +${bonus} XP!)` : ""}`,
        article: article,
      });

      // Update student metrics
      if (
        activeStudentId &&
        !completedChallenges.includes(activeChallenge.id)
      ) {
        setCompletedChallenges((prev) => [...prev, activeChallenge.id]);
        let targetSideEffects: { type: string; payload?: any }[] = [];
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === activeStudentId) {
              const newXp = s.xp + activeChallenge.xpRecompensa + bonus;

              const updatedRespostas = {
                ...(s.respostasDesafios || {}),
                [activeChallenge.id]: true,
              };
              const correctCount = Object.entries(updatedRespostas).filter(
                ([_, val]) => val === true,
              ).length;
              const attemptedCount = Object.keys(updatedRespostas).length;
              const newPrecisao =
                attemptedCount > 0
                  ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                  : 100.0;

              const resolvedStudentMap = {
                ...s,
                xp: newXp,
                precisao: newPrecisao,
                respostasDesafios: updatedRespostas,
                temposRespostas: {
                  ...(s.temposRespostas || {}),
                  [activeChallenge.id]: elapsedSeconds,
                },
                casosResolvidosNoCiclo: (s.casosResolvidosNoCiclo || 0) + 1,
              };

              const result = evaluatePhaseCompletionAndStreaks(resolvedStudentMap, activeChallenge.id, true);
              if (result.sideEffects) targetSideEffects = result.sideEffects;
              return result.student;
            }
            return s;
          })
        );
        if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
      }
    } else {
      playSoundEffect("failure");
      setChallengeFeedback({
        isCorrect: false,
        text: feedbackText,
        article: article,
      });

      // Update student metrics - Register failure
      if (
        activeStudentId &&
        !completedChallenges.includes(activeChallenge.id)
      ) {
        let targetSideEffects: { type: string; payload?: any }[] = [];
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === activeStudentId) {
              const updatedRespostas = {
                ...(s.respostasDesafios || {}),
                [activeChallenge.id]: false,
              };
              const correctCount = Object.entries(updatedRespostas).filter(
                ([_, val]) => val === true,
              ).length;
              const attemptedCount = Object.keys(updatedRespostas).length;
              const newPrecisao =
                attemptedCount > 0
                  ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                  : 100.0;

              const incorrectStudentMap = {
                ...s,
                precisao: newPrecisao,
                respostasDesafios: updatedRespostas,
                temposRespostas: {
                  ...(s.temposRespostas || {}),
                  [activeChallenge.id]: elapsedSeconds,
                },
              };

              const result = evaluatePhaseCompletionAndStreaks(incorrectStudentMap, activeChallenge.id, false);
              if (result.sideEffects) targetSideEffects = result.sideEffects;
              return result.student;
            }
            return s;
          })
        );
        if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
      }
    }
  };

  // Evaluate TRCT Form calculation worksheet (Phase 3 Challenges)
  const handleCheckTRCTWorksheet = () => {
    if (!activeChallenge) return;
    const gab = activeChallenge.gabarito.valoresCorretos;
    if (!gab) return;

    const elapsedSeconds = Math.round((Date.now() - challengeStartTime) / 1000);

    // Convert string inputs to safe floats supporting both standard decimals and Brazilian localization with thousands separators
    const parseFormattedFloat = (val: string) => {
      if (!val) return 0;
      const trimmed = val.trim();
      if (trimmed === "" || trimmed === "-") return 0;
      const cleanSymbol = trimmed.replace(/R\$\s?/g, "");
      if (cleanSymbol.includes(",")) {
        const clean = cleanSymbol.replace(/\./g, "").replace(",", ".");
        const num = parseFloat(clean);
        return isNaN(num) ? 0 : num;
      }
      const num = parseFloat(cleanSymbol);
      return isNaN(num) ? 0 : num;
    };

    if (activeChallenge.fase === 3) {
      // Phase 3 granular checks for all 15 manual calculations
      const userVals = {
        salario: parseFormattedFloat(crisisInputs.salario || "0"),
        mediaHe: parseFormattedFloat(crisisInputs.mediaHe || "0"),
        insalubridade: parseFormattedFloat(crisisInputs.insalubridade || "0"),
        periculosidade: parseFormattedFloat(crisisInputs.periculosidade || "0"),
        horasExtras: parseFormattedFloat(crisisInputs.horasExtras || "0"),
        adicionalNoturno: parseFormattedFloat(
          crisisInputs.adicionalNoturno || "0",
        ),
        comissoes: parseFormattedFloat(crisisInputs.comissoes || "0"),
        dsrHe: parseFormattedFloat(crisisInputs.dsrHe || "0"),
        inss: parseFormattedFloat(crisisInputs.inss || "0"),
        irrf: parseFormattedFloat(crisisInputs.irrf || "0"),
        vt: parseFormattedFloat(crisisInputs.vt || "0"),
        faltasDesconto: parseFormattedFloat(crisisInputs.faltasDesconto || "0"),
        salarioFamilia: parseFormattedFloat(crisisInputs.salarioFamilia || "0"),
        baseFgts: parseFormattedFloat(crisisInputs.baseFgts || "0"),
        fgts: parseFormattedFloat(crisisInputs.fgts || "0"),
      };

      const fieldsToCheck = [
        { key: "salario", label: "Salário Proporcional" },
        { key: "mediaHe", label: "Média Horas Extras" },
        { key: "insalubridade", label: "Adicional de Insalubridade" },
        { key: "periculosidade", label: "Adicional de Periculosidade" },
        { key: "horasExtras", label: "Horas Extras do Mês" },
        { key: "adicionalNoturno", label: "Adicional Noturno" },
        { key: "comissoes", label: "Comissões" },
        { key: "dsrHe", label: "Reflexos DSR s/ HE e Adicionais" },
        { key: "inss", label: "Desconto INSS" },
        { key: "irrf", label: "Desconto IRRF" },
        { key: "vt", label: "Desconto Vale-Transporte" },
        { key: "faltasDesconto", label: "Desconto Faltas & DSR" },
        { key: "salarioFamilia", label: "Salário-Família" },
        { key: "baseFgts", label: "Base de Cálculo do FGTS" },
        { key: "fgts", label: "Depósito FGTS (8%)" },
      ];

      const errors: string[] = [];
      fieldsToCheck.forEach((f) => {
        const exp = (gab as any)[f.key] || 0;
        const user = (userVals as any)[f.key];
        const diff = Math.abs(user - exp);
        if (diff > 0.05) {
          errors.push(
            `• ${f.label}: Lançado R$ ${user.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}. Esperado R$ ${exp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}.`,
          );
        }
      });

      if (errors.length === 0) {
        const bonus = calculateBonusXp();
        playSoundEffect("success");
        setTrctResultMsg({
          type: "success",
          text: `✓ PARABÉNS! Seu demonstrativo de Holerite de Crise bateu perfeitamente com a apuração legal do Ministério do Trabalho! Justificativa: ${gab.justificativa}${bonus > 0 ? ` (Bônus de tempo: +${bonus} XP!)` : ""}`,
        });

        // Complete challenge
        if (
          activeStudentId &&
          !completedChallenges.includes(activeChallenge.id)
        ) {
          setCompletedChallenges((prev) => [...prev, activeChallenge.id]);
          let targetSideEffects: { type: string; payload?: any }[] = [];
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id === activeStudentId) {
                const updatedRespostas = {
                  ...(s.respostasDesafios || {}),
                  [activeChallenge.id]: true,
                };
                const correctCount = Object.entries(updatedRespostas).filter(
                  ([_, val]) => val === true,
                ).length;
                const attemptedCount = Object.keys(updatedRespostas).length;
                const newPrecisao =
                  attemptedCount > 0
                    ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                    : 100.0;

                const resolvedStudentMap = {
                  ...s,
                  xp: s.xp + activeChallenge.xpRecompensa + bonus,
                  precisao: newPrecisao,
                  respostasDesafios: updatedRespostas,
                  temposRespostas: {
                    ...(s.temposRespostas || {}),
                    [activeChallenge.id]: elapsedSeconds,
                  },
                  casosResolvidosNoCiclo: (s.casosResolvidosNoCiclo || 0) + 1,
                };
                const result = evaluatePhaseCompletionAndStreaks(resolvedStudentMap, activeChallenge.id, true);
                if (result.sideEffects) targetSideEffects = result.sideEffects;
                return result.student;
              }
              return s;
            }),
          );
          if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
        }
      } else {
        playSoundEffect("failure");
        setTrctResultMsg({
          type: "error",
          text: `❌ ERRO DE APURAÇÃO! Os seguintes campos possuem divergência matemática com o encargo legal:\n\n${errors.slice(0, 5).join("\n")}${errors.length > 5 ? `\n• ...e mais ${errors.length - 5} divergências.` : ""}\n\nEspelho de Cálculo: Calcule com mais atenção utilizando a Calculadora de Apoio CLIPS e alterte os decimais nos campos apropriados.`,
        });

        // Update student metrics - Register failure, cannot redo.
        if (activeStudentId) {
          let targetSideEffects: { type: string; payload?: any }[] = [];
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id === activeStudentId) {
                const updatedRespostas = {
                  ...(s.respostasDesafios || {}),
                  [activeChallenge.id]: false,
                };
                const correctCount = Object.entries(updatedRespostas).filter(
                  ([_, val]) => val === true,
                ).length;
                const attemptedCount = Object.keys(updatedRespostas).length;
                const newPrecisao =
                  attemptedCount > 0
                    ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                    : 100.0;

                const incorrectStudentMap = {
                  ...s,
                  precisao: newPrecisao,
                  respostasDesafios: updatedRespostas,
                  temposRespostas: {
                    ...(s.temposRespostas || {}),
                    [activeChallenge.id]: elapsedSeconds,
                  },
                };
                const result = evaluatePhaseCompletionAndStreaks(incorrectStudentMap, activeChallenge.id, false);
                if (result.sideEffects) targetSideEffects = result.sideEffects;
                return result.student;
              }
              return s;
            }),
          );
          if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
        }
      }
    } else {
      // Fallback/standard TRCT checks for non-Phase 3 calculations if any
      const saldoUser = parseFormattedFloat(trctSaldoInput);
      const avisoUser = parseFormattedFloat(trctAvisoInput);
      const decimoUser = parseFormattedFloat(trctDecimoInput);
      const feriasUser = parseFormattedFloat(trctFeriasInput);

      const saldoExp = gab.saldo || 0;
      const avisoExp = gab.aviso || 0;
      const decimoExp = gab.decimoTerceiro || 0;
      const feriasExp = gab.ferias || 0;

      const saldoDiff = Math.abs(saldoUser - saldoExp);
      const avisoDiff = Math.abs(avisoUser - avisoExp);
      const decimoDiff = Math.abs(decimoUser - decimoExp);
      const feriasDiff = Math.abs(feriasUser - feriasExp);

      if (
        (isNaN(saldoUser) ? saldoExp === 0 : saldoDiff < 2.0) &&
        (isNaN(avisoUser) ? avisoExp === 0 : avisoDiff < 2.0) &&
        (isNaN(decimoUser) ? decimoExp === 0 : decimoDiff < 2.0) &&
        (isNaN(feriasUser) ? feriasExp === 0 : feriasDiff < 2.0)
      ) {
        const bonus = calculateBonusXp();
        playSoundEffect("success");
        setTrctResultMsg({
          type: "success",
          text: `✓ PARABÉNS! Seu demonstrativo de TRCT bateu perfeitamente com a apuração legal do Ministério do Trabalho! ${gab.justificativa}${bonus > 0 ? ` (Bônus de tempo: +${bonus} XP!)` : ""}`,
        });

        // Complete challenge
        if (
          activeStudentId &&
          !completedChallenges.includes(activeChallenge.id)
        ) {
          setCompletedChallenges((prev) => [...prev, activeChallenge.id]);
          let targetSideEffects: { type: string; payload?: any }[] = [];
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id === activeStudentId) {
                const updatedRespostas = {
                  ...(s.respostasDesafios || {}),
                  [activeChallenge.id]: true,
                };
                const correctCount = Object.entries(updatedRespostas).filter(
                  ([_, val]) => val === true,
                ).length;
                const attemptedCount = Object.keys(updatedRespostas).length;
                const newPrecisao =
                  attemptedCount > 0
                    ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                    : 100.0;

                const resolvedStudentMap = {
                  ...s,
                  xp: s.xp + activeChallenge.xpRecompensa + bonus,
                  precisao: newPrecisao,
                  respostasDesafios: updatedRespostas,
                  temposRespostas: {
                    ...(s.temposRespostas || {}),
                    [activeChallenge.id]: elapsedSeconds,
                  },
                  casosResolvidosNoCiclo: (s.casosResolvidosNoCiclo || 0) + 1,
                };
                const result = evaluatePhaseCompletionAndStreaks(resolvedStudentMap, activeChallenge.id, true);
                if (result.sideEffects) targetSideEffects = result.sideEffects;
                return result.student;
              }
              return s;
            }),
          );
          if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
        }
      } else {
        playSoundEffect("failure");
        setTrctResultMsg({
          type: "error",
          text: `❌ ERRO DE APURAÇÃO! Os valores lançados diferem da jurisprudência legal e do saldo base apurado. Este caso foi encerrado com erro e não pode ser refeito.`,
        });

        // Update student metrics - Register failure, cannot redo.
        if (activeStudentId) {
          let targetSideEffects: { type: string; payload?: any }[] = [];
          setStudents((prev) =>
            prev.map((s) => {
              if (s.id === activeStudentId) {
                const updatedRespostas = {
                  ...(s.respostasDesafios || {}),
                  [activeChallenge.id]: false,
                };
                const correctCount = Object.entries(updatedRespostas).filter(
                  ([_, val]) => val === true,
                ).length;
                const attemptedCount = Object.keys(updatedRespostas).length;
                const newPrecisao =
                  attemptedCount > 0
                    ? Number(((correctCount / attemptedCount) * 100).toFixed(1))
                    : 100.0;

                const incorrectStudentMap = {
                  ...s,
                  precisao: newPrecisao,
                  respostasDesafios: updatedRespostas,
                  temposRespostas: {
                    ...(s.temposRespostas || {}),
                    [activeChallenge.id]: elapsedSeconds,
                  },
                };
                const result = evaluatePhaseCompletionAndStreaks(incorrectStudentMap, activeChallenge.id, false);
                if (result.sideEffects) targetSideEffects = result.sideEffects;
                return result.student;
              }
              return s;
            }),
          );
          if (targetSideEffects.length > 0) applySideEffects(targetSideEffects);
        }
      }
    }
  };

   // Safety fallback: if the student is lost from memory while onboarding is "finished", force logout
  // (Only if not in intro and after a short delay to allow syncs to complete)
  useEffect(() => {
    if (onboardingFinished && !activeStudent && !showMatrixIntro) {
      const timeout = setTimeout(() => {
        // Re-check after 1s to allow Firebase sync or state updates
        if (onboardingFinished && !activeStudent && !showMatrixIntro) {
          console.warn("Session integrity lost: Active student not found. Returning to login.");
          setOnboardingFinished(false);
          setActiveStudentId(null);
          if (firebaseUser) {
            signOut(auth).catch(console.error);
          }
        }
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [onboardingFinished, activeStudent, showMatrixIntro]);

  // Auto select first challenge of selected phase
  useEffect(() => {
    if (phaseChallenges.length > 0) {
      setSelectedChallengeId(phaseChallenges[0].id);
      resetChallengeStates();
    } else {
      setSelectedChallengeId(null);
    }
  }, [selectedPhaseId, activeStudentId]);

  return (
    <>
      {/* SCREENSHOT & FOCUS LOSS BLUR OVERLAY */}
      {isScreenObscured && (
        <div 
          onClick={() => setIsScreenObscured(false)}
          className="fixed inset-0 z-[99999] backdrop-blur-2xl bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center select-none cursor-pointer"
        >
          <div className="max-w-md bg-slate-900 border border-amber-500/20 rounded-2xl p-8 space-y-6 shadow-2xl animate-fade-in text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center animate-pulse">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-amber-500 tracking-tight font-sans">
                {appLanguage === "en" ? "SCREEN PROTECTION ACTIVE" : "PROTEÇÃO DE TELA ATIVA"}
              </h2>
              <p className="text-xs text-gray-400 font-mono">
                {appLanguage === "en" 
                  ? "SYSTEM INTEGRITY & SECURITY MONITORING" 
                  : "MONITORAMENTO DE INTEGRIDADE E SEGURANÇA"}
              </p>
            </div>

            <p className="text-sm text-gray-200 leading-relaxed font-sans">
              {appLanguage === "en"
                ? "This simulator contains confidential and restricted content. The screen has been obscured because the window lost focus or a screenshot command was detected."
                : "Este simulador contém conteúdo restrito e confidencial. A tela foi ocultada porque a janela perdeu o foco ou um comando de captura de tela foi detectado."}
            </p>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsScreenObscured(false);
              }}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-amber-500/20 active:scale-95 cursor-pointer font-sans"
            >
              {appLanguage === "en" ? "Click to resume" : "Clique para retomar"}
            </button>
          </div>
        </div>
      )}

      <div
        id="worksim-rh-main-app"
        className={`min-h-screen bg-bg-primary text-text-primary selection:bg-accent-primary/30 relative overflow-hidden flex flex-col print:hidden ${themeMode === "light" ? "theme-light" : "theme-dark"}`}
      >
      {/* Upper Matrix style linear grid line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-primary via-indigo-600 to-accent-error opacity-40" />

      {/* Background ambient lighting blobs */}
      <div className="absolute top-[-10%] right-[-10%] w-[450px] h-[450px] rounded-full bg-accent-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[450px] h-[450px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* MATRIX SEQUENCE DE POSSE FOR TRANSITIONS */}
      <AnimatePresence>
        {showMatrixIntro && activeStudent && (
          <MatrixIntro
            studentName={activeStudent.nomeCompleto}
            matricula={activeStudent.matricula}
            onComplete={() => {
              setShowMatrixIntro(false);
              setOnboardingFinished(true);
            }}
          />
        )}
      </AnimatePresence>

      {/* --- LEVEL 1: LOGIN/ACTIVATION BARRIER GATE --- */}
      {(!onboardingFinished || !activeStudent) && !showMatrixIntro && (
        <div
          id="login-gate"
          className="min-h-screen flex items-center justify-center p-4"
          style={{
            boxShadow: `
              inset 0 0 60px color-mix(in srgb, var(--accent-primary) 15%, transparent),
              inset 0 0 20px color-mix(in srgb, var(--accent-primary) 10%, transparent)
            `,
          }}
        >
          <div className="w-full max-w-md glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl relative space-y-6">
            {/* Theme Toggle - Centered Top in Login Gate */}
            <div className="flex justify-center z-20">
              {!hasInitialStudentsLoaded && (
                <div className="absolute top-0 left-0 right-0 p-2 text-center bg-emerald-500/10 border-b border-emerald-500/20 animate-pulse">
                  <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-widest flex items-center justify-center gap-2">
                    <RefreshCw className="w-3 h-3 animate-spin" /> Conectando ao WorkSIM Grid Global...
                  </span>
                </div>
              )}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-white/10 shadow-md">
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode("light");
                    localStorage.setItem("worksim_theme_mode", "light");
                  }}
                  className={`px-3 py-1 rounded text-[9px] font-mono font-bold transition-all flex items-center cursor-pointer ${
                    themeMode === "light"
                      ? "bg-amber-500 text-slate-950 shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Modo Dia (Claro)"
                >
                  <Sun className="w-2.5 h-2.5 mr-1" />
                  <span>DIA</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setThemeMode("dark");
                    localStorage.setItem("worksim_theme_mode", "dark");
                  }}
                  className={`px-3 py-1 rounded text-[9px] font-mono font-bold transition-all flex items-center cursor-pointer ${
                    themeMode === "dark"
                      ? "bg-accent-primary text-slate-950 shadow-sm"
                      : "text-gray-400 hover:text-white"
                  }`}
                  title="Modo Noite (Escuro)"
                >
                  <Moon className="w-2.5 h-2.5 mr-1" />
                  <span>NOITE</span>
                </button>
              </div>
            </div>

            <div className="text-center relative select-none">
              <h1 className="text-3xl font-sans font-black text-white mt-4 uppercase tracking-tighter leading-tight">
                Simulador Acadêmico de<br/>
                <span className="text-accent-primary">Legislação de RH</span>
              </h1>
              <p className="text-[10px] text-text-secondary mt-2 font-mono uppercase tracking-widest opacity-70">
                Mestre Fábio Santana Lima • Alta Performance
              </p>
            </div>

            {/* NEW: Google Login option on Login Gate */}
            {!firebaseUser && (
              <div className="space-y-3">
                <div className="text-center">
                  <p className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter mb-1">
                    Já tem conta vinculada ou é Professor?
                  </p>
                </div>
                <button
                  type="button"
                onClick={handleFirebaseGoogleLogin}
                disabled={isFirebaseSyncing}
                className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-xl transition-all group cursor-pointer"
              >
                <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" className="w-4 h-4">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Acessar via Nuvem</span>
                  <span className="text-xs font-bold text-white group-hover:text-accent-primary transition-colors">Sincronizar Conta Google</span>
                </div>
                {isFirebaseSyncing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-accent-primary ml-auto mr-2" />}
              </button>
              </div>
            )}

            {/* Main Tabs Selection on Login Gate */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5">
              <button
                type="button"
                onClick={() => {
                  setIsVeteranTab(false);
                  setLoginErrorMessage("");
                }}
                className={`flex-1 text-center py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  !isVeteranTab
                    ? "bg-emerald-650 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🏫 Alunos/Professor
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsVeteranTab(true);
                  setLoginErrorMessage("");
                }}
                className={`flex-1 text-center py-2 text-xs font-sans font-bold uppercase rounded-lg transition-all cursor-pointer ${
                  isVeteranTab
                    ? "bg-emerald-650 text-white shadow-md"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                🎖️ Portal Veterano
              </button>
            </div>

            {/* Error alerts widget */}
            {loginErrorMessage && (
              <div
                id="login-error-toast"
                className="p-3 bg-rose-950/30 border border-accent-error/20 rounded-xl text-xs text-accent-error flex items-center gap-2 font-mono"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{loginErrorMessage}</span>
              </div>
            )}

            {!isVeteranTab ? (
              <>
                {showQRScanner && (
                  <QRScanner 
                    onScan={handleQRCodeScanned} 
                    onClose={() => setShowQRScanner(false)} 
                  />
                )}
                <div className="text-center mb-2">
                   <p className="text-[9px] text-gray-500 font-mono uppercase tracking-tighter">
                     Acesso via Matrícula (Novos Alunos)
                   </p>
                </div>
                <form onSubmit={handleActivationOrLogin} className="space-y-4">
                  {/* Matrix registration ID field */}
                  <div className={`space-y-1 ${loginStep !== "matricula" ? "opacity-60 pointer-events-none" : ""}`}>
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-mono text-text-secondary block uppercase">
                        Código de Matrícula RH
                      </label>
                      {loginStep === "matricula" && (
                        <button
                          type="button"
                          onClick={() => setShowQRScanner(true)}
                          className="flex items-center gap-1.5 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg transition-all border border-indigo-500/20 text-[9px] font-black uppercase tracking-wider"
                        >
                          <Camera className="w-3 h-3" />
                          Escanear QR
                        </button>
                      )}
                    </div>
                    <input
                      id="login-matricula-input"
                      name="username"
                      autoComplete="username"
                      type="text"
                      required
                      readOnly={loginStep !== "matricula"}
                      value={inputMatricula}
                      onChange={(e) => setInputMatricula(e.target.value)}
                      placeholder="Ex: 011B2026RH"
                      className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20 text-accent-primary font-mono text-center tracking-wider"
                    />
                  </div>

                  {loginStep === "activation" && (
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-text-secondary block uppercase">
                        Seu Nome Completo
                      </label>
                      <input
                        id="login-name-input"
                        name="name"
                        type="text"
                        required
                        value={inputNome}
                        onChange={(e) => setInputNome(e.target.value)}
                        placeholder="Ex: Ana Souza"
                        className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20 text-gray-200"
                      />
                    </div>
                  )}

                  {loginStep !== "matricula" && (
                    <div className="space-y-1">
                      <label className="text-xs font-mono text-text-secondary block uppercase">
                        {loginStep === "activation" ? "Definir Senha de Acesso" : "Sua Senha de Acesso"}
                      </label>
                      <input
                        id="login-password-input"
                        name="password"
                        autoComplete={loginStep === "activation" ? "new-password" : "current-password"}
                        type="password"
                        required
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder={loginStep === "activation" ? "Mínimo 4 dígitos" : "****"}
                        className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-accent-primary focus:outline-none focus:ring-1 focus:ring-accent-primary/20 text-gray-200 text-center"
                      />
                    </div>
                  )}

                  <div className="flex gap-2">
                    {loginStep !== "matricula" && (
                      <button
                        type="button"
                        onClick={() => {
                          setLoginStep("matricula");
                          setIsActivatingNewAccount(false);
                          setLoginErrorMessage("");
                          setInputPassword("");
                        }}
                        className="flex-shrink-0 px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-400 rounded-xl transition-all cursor-pointer"
                        title="Voltar"
                      >
                        <ArrowRight className="w-4 h-4 rotate-180" />
                      </button>
                    )}
                    <button
                      id="login-submit-btn"
                      type="submit"
                      className="flex-1 bg-emerald-650 hover:bg-emerald-600 text-white font-sans font-bold text-xs uppercase p-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-101"
                    >
                      <LogIn className="w-4 h-4" />
                      {loginStep === "matricula" 
                        ? "Verificar Matrícula" 
                        : loginStep === "activation" 
                          ? "Ativar e Entrar" 
                          : "Entrar no Simulador"}
                    </button>
                  </div>
                </form>

                <div className="border-t border-white/5 pt-4 text-center">
                  <p className="text-[10px] text-gray-500 font-mono uppercase tracking-tighter">
                    Acesso pessoal e intransferível. Não compartilhe suas credenciais.
                  </p>
                </div>
              </>
            ) : (
              <>
                <form onSubmit={handleVeteranAccess} className="space-y-4">
                  {isVeteranRegister ? (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-text-secondary block uppercase">
                          Seu Nome Completo
                        </label>
                        <input
                          id="vet-register-nome"
                          name="name"
                          type="text"
                          required
                          value={veteranNome}
                          onChange={(e) => setVeteranNome(e.target.value)}
                          placeholder="Ex: Carlos de Souza"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-gray-250 font-sans"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-text-secondary block uppercase">
                          Defina seu Login (Nome de Usuário)
                        </label>
                        <input
                          id="vet-register-user"
                          name="username"
                          autoComplete="username"
                          type="text"
                          required
                          value={veteranUsuario}
                          onChange={(e) => setVeteranUsuario(e.target.value)}
                          placeholder="Ex: CARLOSTESTER"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-emerald-400 font-mono text-center tracking-wider uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-text-secondary block uppercase">
                          Defina sua Senha
                        </label>
                        <input
                          id="vet-register-senha"
                          name="password"
                          autoComplete="new-password"
                          type="password"
                          required
                          value={veteranSenha}
                          onChange={(e) => setVeteranSenha(e.target.value)}
                          placeholder="Mínimo 4 caracteres"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-gray-200 text-center"
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs font-mono text-text-secondary block uppercase">
                          Seu Login (Nome de Usuário)
                        </label>
                        <input
                          id="vet-login-user"
                          name="username"
                          autoComplete="username"
                          type="text"
                          required
                          value={veteranUsuario}
                          onChange={(e) => setVeteranUsuario(e.target.value)}
                          placeholder="Ex: CARLOSTESTER"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-emerald-400 font-mono text-center tracking-wider uppercase"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-mono text-text-secondary block uppercase">
                          Sua Senha de Acesso
                        </label>
                        <input
                          id="vet-login-senha"
                          name="password"
                          autoComplete="current-password"
                          type="password"
                          required
                          value={veteranSenha}
                          onChange={(e) => setVeteranSenha(e.target.value)}
                          placeholder="Digite sua senha cadastrada"
                          className="w-full bg-slate-950/60 border border-white/10 rounded-lg py-2.5 px-3 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/20 text-gray-200 text-center"
                        />
                      </div>
                    </>
                  )}

                  <button
                    id="veteran-submit-btn"
                    type="submit"
                    className="w-full bg-emerald-650 hover:bg-emerald-600 text-white font-sans font-bold text-xs uppercase p-3 rounded-xl shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 hover:scale-101"
                  >
                    <LogIn className="w-4 h-4 text-emerald-400" />
                    {isVeteranRegister
                      ? "Finalizar Cadastro de Veterano"
                      : "Entrar como Veterano (Modo Teste)"}
                  </button>
                </form>

                <div className="border-t border-white/5 pt-4 text-center">
                  <button
                    id="toggle-veteran-mode-btn"
                    onClick={() => {
                      setIsVeteranRegister(!isVeteranRegister);
                      setLoginErrorMessage("");
                    }}
                    className="text-xs text-emerald-400 hover:text-white transition-colors cursor-pointer"
                  >
                    {isVeteranRegister
                      ? "Já possui conta de Veterano? Faça Login"
                      : "Ainda não tem conta de Veterano? Cadastre-se gratuitamente"}
                  </button>
                </div>
              </>
            )}

            {/* Security Note / Scalability Assurance */}
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-3 flex items-center gap-3 animate-fade-in">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Cloud className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-tight">Infraestrutura Escalável</span>
                <span className="text-[9px] text-text-secondary leading-tight">Sistema preparado para múltiplos acessos simultâneos sem quedas de performance.</span>
              </div>
            </div>

            {/* Copyright Section (Login Screen) */}
            <div className="mt-8 pt-4 border-t border-white/5 opacity-60 hover:opacity-100 transition-opacity">
              <p className="text-[8px] text-gray-400 leading-relaxed font-sans text-center px-4">
                © 2026 Fábio Santana Lima. Todos os direitos reservados.
                <br />
                <span className="animate-pulse text-white font-black uppercase tracking-widest mt-1 inline-block">O usuário compreende que a estrutura de 8 fases, o roteiro pedagógico e o método de avaliação são de propriedade exclusiva do criador. O uso indevido da metodologia e das dinâmicas das 8 fases deste simulador constitui violação de direitos autorais.</span>
              </p>
            </div>

            {/* Isolated Highlighted Version (Only Login Gate) */}
            <div className="pt-4 flex justify-center">
              <span className="text-[11px] font-mono font-bold text-slate-500 tracking-[0.3em] uppercase">
                Versão v7.27.2026
              </span>
            </div>
          </div>
        </div>
      )}

      {/* --- LEVEL 2: IMMERSIVE WORKSTATION DASHBOARD --- */}
      {onboardingFinished && activeStudent && (
        <div
          id="mainframe-workstation"
          className="flex-1 flex flex-col min-h-0 relative"
        >
          <NavigationTop 
            currentTab={currentTab}
            onTabChange={(tab: any) => {
              setCurrentTab(tab);
              setIsMobileMenuOpen(false);
            }}
            themeMode={themeMode}
            onToggleTheme={toggleThemeMode}
            appLanguage={appLanguage}
            isProfessorOrAdmin={isProfessorOrAdmin}
            maxAllowedPhase={maxAllowedPhase}
            isFocusedMode={isFocusedMode}
            onToggleFocus={handleToggleFocusedMode}
            isSidebarCollapsed={isSidebarCollapsed}
            onToggleSidebar={handleToggleSidebarCollapse}
            isMobileMenuOpen={isMobileMenuOpen}
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />

          <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
            {/* Mobile overlay backdrop */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}

          {/* A. LEFT STATUS & MONITORING SIDEBAR */}
          <aside 
            id="sidebar-main-panel"
            className={`fixed inset-y-0 left-0 z-50 bg-slate-900 border-r border-white/10 flex flex-col flex-shrink-0 transform transition-all duration-300 ease-in-out md:sticky md:top-16 md:transform-none md:z-auto md:bg-slate-950/20 md:backdrop-blur-sm md:border-white/5 h-[calc(100vh-64px)] overflow-y-auto scrollbar-thin ${
              isSidebarCollapsed ? "w-64 p-4 md:w-0 md:overflow-hidden md:p-0 md:items-center" : "w-64 p-4"
            } ${
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
            } ${isFocusedMode ? "hidden md:hidden shadow-none border-none shrink-0" : ""}`}
          >
            <div className={`space-y-6 ${isSidebarCollapsed ? "w-full md:overflow-hidden" : ""}`}>
              {/* Logo / Title Banner - Pruned */}
              <div className="flex items-center justify-between min-w-[50px]">
                {!isSidebarCollapsed ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] text-accent-primary font-mono font-bold uppercase tracking-widest leading-tight">IDENTIFICAÇÃO</span>
                    <span className="text-[11px] text-gray-400 font-medium">Estação de Trabalho</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center w-full">
                    <Terminal className="w-5 h-5 text-accent-primary animate-pulse" />
                  </div>
                )}

                <div className="flex items-center gap-1.5 animate-fade-in">
                  {/* Minimize Button when expanded */}
                  {!isSidebarCollapsed && (
                    <button
                      type="button"
                      onClick={handleToggleSidebarCollapse}
                      className="hidden md:flex w-7 h-7 rounded-lg bg-slate-950 hover:bg-slate-800 border border-white/5 hover:border-white/20 transition-all cursor-pointer items-center justify-center text-gray-400 hover:text-white animate-fade-in"
                      title={appLanguage === "en" ? "Collapse Sidebar" : "Recolher Menu"}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                  )}

                  {/* Close button inside Drawer, absolute on mobile */}
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="md:hidden w-7 h-7 rounded-lg bg-slate-950 hover:bg-rose-950 border border-white/5 hover:border-rose-500/40 transition-all cursor-pointer flex items-center justify-center focus:outline-none text-rose-450"
                    title="Fechar Menu"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Logged in digital badge - Moved higher up */}
              {!isSidebarCollapsed ? (
                <div className="relative w-full" style={{ perspective: "1000px" }}>
                  <motion.div
                    animate={{ rotateY: isBadgeFlipping ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative"
                  >
                    {/* FRONT SIDE (Standard Badge UI) */}
                    <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-3 relative group backface-hidden" style={{ backfaceVisibility: "hidden" }}>
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded uppercase">
                          Filtro {activeStudent.faseAtual}
                        </span>
                        <span className="text-[10px] text-text-secondary select-none">
                          Mapeado
                        </span>
                      </div>

                      {/* Embedded scanline horizontal highlight */}
                      <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-primary/20" />

                      <div className="flex items-center gap-3">
                        <ProfileProgressRing progress={currentPhaseProgress} size={42} strokeWidth={2.5}>
                          <div className="w-full h-full bg-slate-850 flex items-center justify-center font-bold text-[11px] text-accent-primary">
                            {activeStudent.nomeCompleto.substring(0, 2).toUpperCase()}
                          </div>
                        </ProfileProgressRing>
                        
                        <div className="flex-1 min-w-0">
                          <h3
                            id="sidebar-student-name"
                            className="text-xs font-bold text-gray-200 uppercase tracking-tight block truncate"
                          >
                            {formatBadgeName(activeStudent.nomeCompleto)}
                          </h3>
                          <span className="text-[10px] text-text-secondary font-mono block">
                            MAT: {activeStudent.matricula}
                          </span>
                          <span className="text-[11px] text-accent-primary font-bold mt-0.5 block">
                            {CAREER_PHASES.find((p) => p.id === activeStudent.faseAtual)
                              ?.cargo || "Estagiário"}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-2 flex justify-between items-center text-xs font-mono">
                        <div className="flex items-center gap-1.5">
                          <span className="text-text-secondary">Seu Score:</span>
                          <button
                            onClick={handleZeroOwnXP}
                            className="text-[9px] px-1 py-0.5 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 hover:border-rose-500/30 transition-all font-sans cursor-pointer"
                            title={appLanguage === "en" ? "Reset your XP to 0" : "Zerar seu XP para 0"}
                          >
                            {appLanguage === "en" ? "Reset" : "Zerar"}
                          </button>
                        </div>
                        <motion.span
                          key={activeStudent.xp}
                          id="sidebar-student-xp"
                          initial={{ scale: 1 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ duration: 0.3 }}
                          className="text-accent-warning font-bold flex items-center gap-0.5"
                        >
                          🌟 {activeStudent.xp} XP
                        </motion.span>
                      </div>

                      {/* Crachá Section - Access granted after signing contract or for Professor */}
                      {(activeStudent.contratoAssinado || isProfessorOrAdmin) && (
                        <div className="border-t border-white/10 pt-3 mt-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] text-text-secondary uppercase font-bold tracking-tight flex items-center gap-1.5">
                              <ShieldAlert className="w-3 h-3 text-accent-primary" /> Identificação Oficial
                            </span>
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setIsBadgePhotoModalOpen(true)}
                                className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 ${badgePhoto ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-white/5 border-white/10 text-gray-400 hover:text-white"}`}
                                title={appLanguage === "en" ? "Configure Photo" : "Configurar Foto"}
                              >
                                <Camera className="w-2.5 h-2.5" />
                                {badgePhoto && <span className="text-[8px] font-bold">OK</span>}
                              </button>
                            </div>
                          </div>
                          
                          <button
                            type="button"
                            onClick={handleDownloadBadge}
                            disabled={isExportingIndividualQR}
                            className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all font-bold text-[10px] shadow-lg uppercase tracking-wider ${
                              isExportingIndividualQR
                                ? "bg-slate-800 border-white/5 text-gray-500 cursor-not-allowed"
                                : "bg-emerald-500 border-emerald-400 text-slate-950 hover:brightness-110 active:scale-95"
                            }`}
                          >
                            {isExportingIndividualQR ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <FileDown className="w-3.5 h-3.5" />
                            )}
                            {isExportingIndividualQR 
                              ? (appLanguage === "en" ? "Generating..." : "Gerando...") 
                              : (appLanguage === "en" ? "Download My Badge" : "Gerar Meu Crachá")}
                          </button>
                        </div>
                      )}
                    </div>

                    {/* BACK SIDE (Official Mini Preview) */}
                    <div 
                      className="absolute inset-0 glass-panel p-4 rounded-xl border border-accent-primary/30 bg-slate-900 backface-hidden flex flex-col justify-between overflow-hidden shadow-2xl"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <div className="bg-accent-primary h-6 -mx-4 -mt-4 rounded-t-xl flex items-center px-4 justify-between">
                        <span className="text-[8px] font-black text-slate-950 uppercase tracking-tighter">WorkSim Access Card</span>
                        <ShieldCheck className="w-3 h-3 text-slate-950" />
                      </div>
                      
                      <div className="flex gap-3 mt-2">
                        <div className="w-12 h-16 border border-white/10 rounded bg-slate-950 flex items-center justify-center overflow-hidden shrink-0">
                          {badgePhoto ? (
                            <img src={badgePhoto} className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-6 h-6 text-white/10" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="text-[10px] font-bold text-white truncate leading-tight uppercase">
                            {formatBadgeName(activeStudent.nomeCompleto)}
                          </div>
                          <div className="text-[8px] text-accent-primary font-mono font-bold">{activeStudent.matricula}</div>
                          <div className="text-[7px] text-gray-400 uppercase leading-tight font-medium italic">{activeStudent.cargo || "Estagiário"}</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-end mt-2">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-glow shadow-emerald-500/50" />
                            <span className="text-[7px] font-mono font-bold text-emerald-400">STATUS: AUTHENTICATED</span>
                          </div>
                          <div className="flex items-center gap-1">
                             <ShieldCheck className="w-2.5 h-2.5 text-accent-primary" />
                             <span className="text-[6px] text-accent-primary/80 font-bold uppercase tracking-tighter">Official Corporate ID</span>
                          </div>
                        </div>
                        <div className="w-12 h-12 bg-white p-1 rounded-lg shadow-inner">
                          <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${activeStudent.matricula}`} 
                            className="w-full h-full"
                            alt="Badge QR"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              ) : (
                <div className="relative w-full flex flex-col items-center" style={{ perspective: "1000px" }}>
                  <motion.div
                    animate={{ rotateY: isBadgeFlipping ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 100, damping: 15 }}
                    style={{ transformStyle: "preserve-3d" }}
                    className="relative w-full flex flex-col items-center"
                  >
                    {/* FRONT SIDE (Original) */}
                    <div className="flex flex-col items-center gap-2 p-2 bg-slate-950/40 rounded-xl border border-white/5 w-full font-mono text-center backface-hidden" style={{ backfaceVisibility: "hidden" }} title={`${activeStudent.nomeCompleto} - MAT: ${activeStudent.matricula}`}>
                      <span className="text-[8px] font-bold text-accent-primary bg-accent-primary/10 px-1.5 py-0.5 rounded uppercase">
                        F{activeStudent.faseAtual}
                      </span>
                      <ProfileProgressRing progress={currentPhaseProgress} size={36} strokeWidth={2.5}>
                        <div className="w-full h-full bg-slate-850 flex items-center justify-center font-bold text-[10px] text-accent-primary">
                          {activeStudent.nomeCompleto.substring(0, 2).toUpperCase()}
                        </div>
                      </ProfileProgressRing>
                      <span className="text-[9px] text-amber-400 font-bold block">
                        <motion.span
                          key={activeStudent.xp}
                          initial={{ opacity: 0.5 }}
                          animate={{ opacity: 1 }}
                        >
                          {activeStudent.xp}XP
                        </motion.span>
                      </span>
                      
                      {(activeStudent.contratoAssinado || isProfessorOrAdmin) && (
                        <button
                          type="button"
                          onClick={handleDownloadBadge}
                          disabled={isExportingIndividualQR}
                          className="w-10 h-10 rounded-xl bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/30 text-emerald-500 hover:text-slate-950 flex items-center justify-center transition-all animate-pulse shadow-glow shadow-emerald-500/20"
                          title={appLanguage === "en" ? "Download Access Badge" : "Baixar Crachá de Acesso"}
                        >
                          {isExportingIndividualQR ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <FileDown className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* BACK SIDE (Mini Collapsed Preview) */}
                    <div 
                      className="absolute inset-0 bg-slate-900 rounded-xl border border-accent-primary/30 flex flex-col items-center justify-center gap-1 backface-hidden shadow-2xl"
                      style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                      <div className="w-8 h-8 bg-white p-0.5 rounded shadow-inner">
                        <img 
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${activeStudent.matricula}`} 
                          className="w-full h-full"
                          alt="Mini QR"
                        />
                      </div>
                      <ShieldCheck className="w-3 h-3 text-accent-primary" />
                      <span className="text-[6px] font-mono text-emerald-400 font-bold uppercase tracking-tighter">AUTH OK</span>
                    </div>
                  </motion.div>
                </div>
              )}

              {/* MOBILE ONLY NAVIGATION MENU */}
              {!isSidebarCollapsed && (
                <div className="lg:hidden space-y-2 border-t border-white/5 pt-4 animate-fade-in">
                  <span className="text-[10px] text-accent-primary font-mono font-bold uppercase tracking-widest leading-tight block mb-2 px-1">
                    {appLanguage === "en" ? "Navigation Menu" : "Menu de Navegação"}
                  </span>
                  <div className="space-y-1">
                    {[
                      { id: "challenges", label: appLanguage === "en" ? "Challenges" : "Desafios Ativos", icon: BookOpen, color: "text-accent-primary" },
                      { id: "linguajar", label: appLanguage === "en" ? "CLT Translator" : "Tradutor CLT", icon: Languages, color: "text-sky-400" },
                      { id: "metrics", label: appLanguage === "en" ? "e-Social Graph" : "Gráfico e-Social", icon: TrendingUp, color: "text-emerald-400" },
                      { id: "desempenho", label: appLanguage === "en" ? "Performance" : "Desempenho", icon: Timer, color: "text-indigo-400" },
                      { id: "badges", label: appLanguage === "en" ? "Badges" : "Insígnias", icon: Award, color: "text-purple-400" },
                      { id: "ranking", label: appLanguage === "en" ? "Ranking" : "Ranking & Equipes", icon: Trophy, color: "text-amber-500" },
                    ].map((tab) => {
                      const IconComponent = tab.icon;
                      const isActive = currentTab === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setCurrentTab(tab.id as any);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                            isActive 
                              ? "text-white bg-white/10 border border-white/20 shadow-lg" 
                              : "text-text-secondary hover:text-white hover:bg-white/5"
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 ${tab.color}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}

                    {/* Special Tabs */}
                    {(isProfessorOrAdmin || maxAllowedPhase >= 2) && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTab("sandbox");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                          currentTab === "sandbox" ? "text-white bg-white/10 border border-white/20 shadow-lg" : "text-text-secondary hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <SlidersHorizontal className="w-4 h-4 text-accent-primary" />
                        <span>{appLanguage === "en" ? "Tech Lab" : "Laboratório Técnico"}</span>
                      </button>
                    )}

                    {isProfessorOrAdmin && (
                      <button
                        type="button"
                        onClick={() => {
                          setCurrentTab("professor");
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-3 cursor-pointer ${
                          currentTab === "professor" ? "text-white bg-white/10 border border-white/20 shadow-lg" : "text-text-secondary hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <Terminal className="w-4 h-4 text-accent-warning" />
                        <span>{appLanguage === "en" ? "Cockpit" : "Professor"}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Expand Button when collapsed */}
              {isSidebarCollapsed && (
                <div className="flex justify-center w-full py-1 animate-fade-in">
                  <button
                    type="button"
                    onClick={handleToggleSidebarCollapse}
                    className="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-850 border border-white/5 hover:border-accent-primary/50 transition-all cursor-pointer flex items-center justify-center text-accent-primary hover:text-white"
                    title={appLanguage === "en" ? "Expand Sidebar" : "Expandir Menu"}
                  >
                    <ChevronRight className="w-5 h-5 text-accent-primary" />
                  </button>
                </div>
              )}

              {/* Gamified Active Progress HUD */}
              {!isSidebarCollapsed ? (
                <div className="glass-panel p-4 rounded-xl border border-white/5 space-y-4 font-mono text-left relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap className="w-12 h-12 text-accent-primary" />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-accent-primary font-black uppercase tracking-[0.2em] flex items-center gap-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-accent-primary animate-pulse"></div>
                      Activity Monitor
                    </span>
                    <span className="text-[10px] text-gray-500">Live 24/7</span>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-gray-400">
                        <span>Tempo em Treinamento</span>
                        <Timer className="w-3 h-3 text-blue-400" />
                      </div>
                      <div className="text-lg font-black text-white tracking-tighter">
                        {(() => {
                          const totalSec = activeStudent.tempoAtivoSegundos || 0;
                          const hrs = Math.floor(totalSec / 3600);
                          const mins = Math.floor((totalSec % 3600) / 60);
                          const secs = totalSec % 60;
                          return hrs > 0
                            ? `${hrs}h ${String(mins).padStart(2, "0")}m`
                            : `${mins}m ${String(secs).padStart(2, "0")}s`;
                        })()}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center text-[9px] uppercase font-bold text-gray-400">
                        <span>Eficiência Operacional</span>
                        <Zap className="w-3 h-3 text-amber-500" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-slate-950 rounded-full overflow-hidden border border-white/5 p-[1px]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${activeStudent.precisao}%` }}
                            className="h-full bg-gradient-to-r from-accent-primary to-blue-600 rounded-full" 
                          />
                        </div>
                        <span className="text-white font-black text-xs">{activeStudent.precisao.toFixed(1)}%</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-white/5 space-y-2">
                      <div className="flex justify-between items-center bg-slate-900/50 rounded-lg p-2 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] text-gray-500 uppercase font-bold">Inatividade</span>
                          <span className={`text-xs font-black font-mono ${180 - inactivitySeconds <= 60 ? "text-rose-500 animate-pulse" : "text-emerald-400"}`}>
                            {(() => {
                              const rem = Math.max(0, 180 - inactivitySeconds);
                              const remMins = Math.floor(rem / 60);
                              const remSecs = rem % 60;
                              return `${String(remMins).padStart(2, "0")}:${String(remSecs).padStart(2, "0")}`;
                            })()}
                          </span>
                        </div>
                        <div className="h-6 w-[1px] bg-white/5" />
                        <div className="flex flex-col items-end">
                          <span className="text-[8px] text-gray-500 uppercase font-bold">Casos</span>
                          <span className="text-xs font-black text-white">{activeStudent.casosResolvidosNoCiclo || 0}</span>
                        </div>
                      </div>

                      {/* Cheat Sheet Download Button */}
                      <button
                        type="button"
                        onClick={handleDownloadCheatSheet}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer font-bold text-[10px] group"
                        title={appLanguage === "en" ? "Download Explanatory Answer Key for Incorrect Challenges (PDF)" : "Baixar Gabarito Explicativo dos Desafios Errados (PDF)"}
                      >
                        <FileDown className="w-3.5 h-3.5 group-hover:animate-bounce" />
                        <span>{appLanguage === "en" ? "CHEAT SHEET (PDF)" : "SISTEMA DE COLA (PDF)"}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSendCheatSheetEmail()}
                        className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all cursor-pointer font-bold text-[10px] group"
                        title={appLanguage === "en" ? "Send Explanatory Answer Key by Email" : "Enviar Gabarito Explicativo por Email"}
                      >
                        <Mail className="w-3.5 h-3.5 group-hover:scale-110" />
                        <span>{appLanguage === "en" ? "SEND TO EMAIL" : "ENVIAR PARA EMAIL"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3 items-center py-4 bg-slate-950/40 rounded-xl border border-white/5 group">
                  <div className="relative">
                    <Clock className="w-5 h-5 text-accent-primary animate-spin" style={{ animationDuration: "10s" }} />
                    <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 border border-slate-900"></div>
                  </div>
                  <div className="flex flex-col items-center gap-0.5">
                    <Zap className="w-4 h-4 text-amber-500" />
                    <span className="text-[9px] font-black text-white">{activeStudent.precisao.toFixed(0)}%</span>
                  </div>
                </div>
              )}

              {/* CONTROLE DE PAUSAS OPERACIONAIS E APOIO CLT */}
              {activeStudentId !== "adm" && activeStudent && !isSidebarCollapsed && (
                <div id="student-pause-controls-deck" className="bg-slate-950/50 p-3 rounded-lg border border-white/5 space-y-2 text-left animate-fade-in">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 justify-between">
                    <span className="text-[9px] text-accent-primary font-mono font-bold uppercase block flex items-center gap-1">
                      <span>⏸️</span> Pausas & Apoio CLT
                    </span>
                    <span className="text-[8.5px] px-1 py-0.2 rounded bg-slate-900 border border-white/10 font-mono text-emerald-400 font-bold uppercase">
                      Sem Penalidade
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 pt-1 font-sans text-[10.5px]">
                    <div className="grid grid-cols-2 gap-2">
                      {/* Bathroom break button */}
                      <button
                        type="button"
                        disabled={(activeStudent.pausasBanheiroUsadas || 0) >= 3}
                        onClick={handleStartBathroomPause}
                        className={`flex flex-col items-center justify-center p-2 rounded-lg border text-center font-bold tracking-tight transition-all cursor-pointer ${
                          (activeStudent.pausasBanheiroUsadas || 0) >= 3
                            ? "border-rose-950/40 bg-zinc-950/25 text-gray-500 cursor-not-allowed opacity-50"
                            : "border-indigo-500/20 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/40 text-indigo-400 hover:shadow-[0_0_8px_rgba(99,102,241,0.15)]"
                        }`}
                        title="Pausa pessoal física para banheiro (timers congelados)"
                      >
                        <span className="text-[12px] mb-0.5">🚽 Banheiro</span>
                        <span className="text-[8px] font-mono text-gray-400 font-normal">
                          {(activeStudent.pausasBanheiroUsadas || 0)}/3 Usadas
                        </span>
                      </button>

                      {/* Doubt query button (Physical) */}
                      <button
                        type="button"
                        onClick={handleStartDoubtPause}
                        className="flex flex-col items-center justify-center p-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/40 text-emerald-400 text-center font-bold tracking-tight transition-all cursor-pointer hover:shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                        title="Pausa física presencial. Levante-se e dirija-se à mesa do Professor/Monitoria (timers congelados)"
                      >
                        <span className="text-[12px] mb-0.5">🚶‍♂️ Ir ao Prof.</span>
                        <span className="text-[8px] font-mono text-emerald-450 font-normal">
                          Dúvida Física
                        </span>
                      </button>
                    </div>

                    {/* IntraChat Online button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIsStudentChatOpen(true);
                        setHasUnreadStudentChat(false);
                        playSoundEffect("success");
                      }}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg border transition-all cursor-pointer font-sans relative ${
                        hasUnreadStudentChat 
                          ? "border-sky-400 bg-sky-500/20 text-white shadow-[0_0_15px_rgba(56,189,248,0.3)] animate-pulse" 
                          : "border-sky-500/20 bg-sky-500/10 hover:bg-sky-500/20 hover:border-sky-500/50 text-sky-400 hover:shadow-[0_0_8px_rgba(56,189,248,0.15)]"
                      }`}
                      title="Abrir IntraChat online com Professor/Monitoria"
                    >
                      {hasUnreadStudentChat && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500"></span>
                        </span>
                      )}
                      <span className="text-xs">💬</span>
                      <span className="text-[10.5px]">IntraChat Direto (Sem Pausa)</span>
                    </button>
                    {hasUnreadStudentChat && !isSidebarCollapsed && (
                      <p className="text-[8px] font-mono text-sky-400 text-center animate-bounce mt-1">NOVA MENSAGEM DO PROFESSOR!</p>
                    )}
                  </div>
                </div>
              )}
                        {/* Dynamic Chat notification board with Marcos */}
              {!isSidebarCollapsed ? (
                <div className="bg-slate-950/50 p-3 rounded-lg border border-white/5 space-y-2 animate-fade-in">
                  <div className="flex items-center gap-1.5 border-b border-white/5 pb-1.5 justify-between">
                    <span className="text-[9px] text-accent-primary font-mono font-bold uppercase block">
                      Estação de Marcos (Gestor)
                    </span>
                    <span className="w-1.5 h-1.5 bg-accent-primary rounded-full animate-ping" />
                  </div>
                  <p className="text-[11px] text-text-secondary font-sans leading-relaxed">
                    "Sua matrícula foi integrada ao e-Social. Use a calculadora
                    lateral para analisar os erros!"
                    <br />
                    <span className="text-indigo-400 font-mono mt-1 inline-block">
                      Chave: marcos.gerente / clt2026
                    </span>
                  </p>
                </div>
              ) : (
                <div 
                  className="p-2 bg-slate-950/40 rounded-lg border border-white/5 text-center cursor-pointer transition-all hover:bg-slate-900 relative mx-auto" 
                  title='Estação de Marcos (Gestor): "Sua matrícula foi integrada ao e-Social. Use a calculadora lateral para analisar os erros!" (marcos.gerente / clt2026)'
                  onClick={() => handleTabChange("challenges")}
                >
                  <span className="text-base">👔</span>
                  <span className="absolute top-1 right-1 flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent-primary"></span>
                  </span>
                </div>
              )}

              {/* LIVE PEER PROGRESS FEED */}
              {!isSidebarCollapsed && (
                <div className="border-t border-white/5 pt-3 animate-fade-in mb-2">
                  <div className="flex items-center justify-between px-1.5 mb-2">
                    <div className="flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-indigo-400 animate-pulse" />
                      <span className="text-[9px] font-mono font-bold uppercase text-indigo-400 tracking-wider">
                        {appLanguage === "en" ? "Peer Live Status" : "Monitoria em Tempo Real"}
                      </span>
                    </div>
                    <span className="text-[8px] font-mono text-gray-600">
                      {students.filter(s => s.id !== 'adm' && s.id !== 'professor' && s.focoStatus === "Ativo" && s.lastSeen && (Date.now() - s.lastSeen) < 35000).length} Online
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto px-1 custom-scrollbar">
                    {students
                      .filter(s => s.id !== activeStudentId && s.id !== 'adm' && s.id !== 'professor')
                      .sort((a, b) => {
                        const aOnline = a.focoStatus === "Ativo" && a.lastSeen && (Date.now() - a.lastSeen) < 35000;
                        const bOnline = b.focoStatus === "Ativo" && b.lastSeen && (Date.now() - b.lastSeen) < 35000;
                        if (aOnline && !bOnline) return -1;
                        if (!aOnline && bOnline) return 1;
                        return (b.xp || 0) - (a.xp || 0);
                      })
                      .slice(0, 4)
                      .map(s => {
                        const isOnline = s.focoStatus === "Ativo" && s.lastSeen && (Date.now() - s.lastSeen) < 35000;
                        return (
                          <div key={s.id} className="bg-slate-950/40 p-2 rounded-lg border border-white/5 flex flex-col gap-1 hover:border-indigo-500/30 transition-all">
                            <div className="flex justify-between items-center gap-2">
                              <div className="flex items-center gap-1.5 truncate">
                                <div className={`w-1 h-1 rounded-full ${isOnline ? 'bg-emerald-500 shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-gray-700'}`}></div>
                                <span className="text-[10px] text-gray-200 font-bold truncate">{s.nomeCompleto.split(' ')[0]}</span>
                              </div>
                              <span className="text-[9px] text-amber-400 font-mono font-bold shrink-0">{s.xp} XP</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[8px] text-gray-500 font-mono uppercase tracking-tighter">
                                Fase {s.faseAtual} • {s.sala}
                              </span>
                              <span className={`text-[8px] font-mono ${isOnline ? 'text-emerald-500 font-bold' : 'text-gray-600'}`}>
                                {isOnline ? 'ONLINE' : 'AUSENTE'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    }
                    {students.filter(s => s.id !== activeStudentId && s.id !== 'adm' && s.id !== 'professor').length === 0 && (
                      <p className="text-[9px] text-gray-600 font-mono text-center py-2 italic">Aguardando conexões...</p>
                    )}
                  </div>
                </div>
              )}

              {/* EXPANDABLE/COLLAPSIBLE REAL-TIME LEADERBOARD WIDGET */}
              {!isSidebarCollapsed ? (
                <div className="border-t border-white/5 pt-3 animate-fade-in mt-auto pb-4">
                  <button
                    type="button"
                    onClick={() => setSidebarRankingExpanded(!isSidebarRankingExpanded)}
                    className="w-full flex items-center justify-between px-1.5 py-1 text-xs font-mono font-bold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors cursor-pointer select-none"
                  >
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                      <span>
                        {appLanguage === "en" ? "Live Rankings" : "Ranking Alunos"}
                      </span>
                    </span>
                    <span className="text-[9.5px] text-gray-500 bg-white/5 px-1.5 py-0.2 rounded hover:text-white">
                      {isSidebarRankingExpanded ? (appLanguage === "en" ? "Collapse" : "Recolher") : (appLanguage === "en" ? "Expand" : "Expandir")}
                    </span>
                  </button>

                  {!isSidebarRankingExpanded ? (
                    /* COLLAPSED BAR ASPECT ("Apenas como barra") */
                    <div
                      onClick={() => setSidebarRankingExpanded(true)}
                      className="mt-2 bg-slate-950/40 hover:bg-slate-950/60 border border-white/5 rounded-xl p-2.5 cursor-pointer transition-all flex items-center justify-around gap-1 hover:border-amber-450/20 shadow-inner select-none animate-fade-in"
                      title={appLanguage === "en" ? "Click to expand standard leaderboard" : "Clique para ver o placar completo!"}
                    >
                      {rankedLeaderboardStudents.slice(0, 3).map((item, index) => {
                        let fireClass = "";
                        let suffixEmoji = "";
                        if (item.rank === 1) { fireClass = "fire-level-1"; suffixEmoji = "👑🔥"; }
                        else if (item.rank === 2) { fireClass = "fire-level-2"; suffixEmoji = "🔥"; }
                        else if (item.rank === 3) { fireClass = "fire-level-3"; suffixEmoji = "🔥"; }

                        // Get short name representation
                        const nameParts = item.student.nomeCompleto.split(" ");
                        const displayName = nameParts.length > 1 ? `${nameParts[0]} ${nameParts[1][0]}.` : nameParts[0];
                        const isS = item.student.id === activeStudentId;

                        return (
                          <div key={item.student.id} className="flex items-center gap-1 shrink-0">
                            <span className="text-[10px] font-bold font-mono text-gray-500">
                              {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
                            </span>
                            <span className={`text-[10px] truncate max-w-[65px] h-[15px] block ${fireClass} ${isS ? "underline decoration-cyan-400" : ""}`} title={item.student.nomeCompleto}>
                              {displayName}
                            </span>
                            <span className="text-[7.5px] font-mono text-gray-400">({item.student.xp})</span>
                            {index < 2 && <span className="text-white/5 font-mono select-none">|</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* DETAILED EXPANDED MINILIST MODULE */
                    <div id="sidebar-ranking-expanded" className="mt-2 bg-slate-950/25 border border-white/5 rounded-xl p-2 space-y-1.5 animate-fade-in max-h-[220px] overflow-y-auto w-full">
                      {rankedLeaderboardStudents.slice(0, 5).map((item) => {
                        const s = item.student;
                        const isS = s.id === activeStudentId;
                        let fireClass = "";
                        let rankEmoji = "";
                        
                        if (item.rank === 1) { fireClass = "fire-level-1"; rankEmoji = "👑"; }
                        else if (item.rank === 2) { fireClass = "fire-level-2"; rankEmoji = "🔥"; }
                        else if (item.rank === 3) { fireClass = "fire-level-3"; rankEmoji = "🔥"; }

                        return (
                          <div
                            key={s.id}
                            className={`p-1.5 rounded-lg flex items-center justify-between gap-2 border transition-all ${
                              isS 
                                ? "self-student-glow" 
                                : "bg-transparent border-transparent hover:bg-white/5"
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate">
                              <span className="text-[10px] font-bold font-mono text-text-secondary w-4 flex-shrink-0">
                                {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : item.rank === 3 ? "🥉" : `${item.rank}º`}
                              </span>
                              <div className="truncate flex flex-col font-sans">
                                {item.rank === 1 ? (
                                  <span className={`${fireClass} text-[11px] font-black truncate`}>
                                    {rankEmoji} {s.nomeCompleto} {rankEmoji}
                                  </span>
                                ) : item.rank === 2 ? (
                                  <span className={`${fireClass} text-[11px] font-bold truncate`}>
                                    {rankEmoji} {s.nomeCompleto}
                                  </span>
                                ) : item.rank === 3 ? (
                                  <span className={`${fireClass} text-[10.5px] font-medium truncate`}>
                                    {s.nomeCompleto} {rankEmoji}
                                  </span>
                                ) : (
                                  <span className="text-gray-100 text-[10.5px] truncate">
                                    {s.nomeCompleto}
                                  </span>
                                )}
                                <span className="text-[8px] text-text-secondary font-mono tracking-tighter">
                                  {s.sala} • {s.matricula}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center gap-0.5 text-[10px] font-mono text-amber-400 font-bold flex-shrink-0">
                              <span>{s.xp}</span>
                              <span className="text-[8px] text-yellow-500">XP</span>
                            </div>
                          </div>
                        );
                      })}
                      {rankedLeaderboardStudents.length > 5 && (
                        <div className="pt-1.5 text-center border-t border-white/5">
                          <button
                            type="button"
                            onClick={() => handleTabChange("ranking")}
                            className="text-[8.5px] tracking-widest font-bold uppercase font-mono text-cyan-400 hover:text-cyan-300 pointer-events-auto cursor-pointer"
                          >
                            {appLanguage === "en" ? "View Full Placar →" : "Consultar Placar Integral →"}
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="border-t border-white/5 pt-2 flex flex-col items-center gap-1.5 w-full">
                  <button
                    type="button"
                    onClick={() => handleTabChange("ranking")}
                    className="p-1.5 rounded hover:bg-white/5 text-amber-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center justify-center"
                    title={appLanguage === "en" ? "View Live Rankings" : "Ranking de Alunos"}
                  >
                    <Trophy className="w-4 h-4 text-amber-500 animate-pulse" />
                  </button>
                  <div className="flex flex-col gap-1 text-[9px] font-mono text-text-secondary text-center">
                    {rankedLeaderboardStudents.slice(0, 3).map((item) => (
                      <span key={item.student.id} title={`${item.rank}º: ${item.student.nomeCompleto} (${item.student.xp} XP)`}>
                        {item.rank === 1 ? "🥇" : item.rank === 2 ? "🥈" : "🥉"}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Audio Toggle & Logout system button at bottom */}
            <div className="space-y-2 border-t border-white/5 pt-4 w-full">
              {!isSidebarCollapsed ? (
                <button
                  id="toggle-audio-btn"
                  type="button"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="w-full text-left text-xs text-text-secondary hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {audioEnabled ? (
                    <>
                      <Volume2 className="w-4 h-4 text-accent-primary" />
                      <span>Audio Cues [On]</span>
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-4 h-4" />
                      <span>Audio Muted [Off]</span>
                    </>
                  )}
                </button>
              ) : (
                <div className="flex justify-center w-full">
                  <button
                    type="button"
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className="p-1.5 rounded hover:bg-white/5 text-text-secondary hover:text-gray-100 transition-all cursor-pointer"
                    title={audioEnabled ? "Audio Cues: On" : "Audio Cues: Off"}
                  >
                    {audioEnabled ? <Volume2 className="w-4 h-4 text-accent-primary" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              )}

              {/* Firebase Cloud Sync Control Panel */}
              {!isSidebarCollapsed ? (
                <div className="py-2.5 border-y border-white/5 my-1.5 w-full">
                  {!firebaseUser ? (
                    <button
                      id="firebase-login-btn"
                      type="button"
                      onClick={handleFirebaseGoogleLogin}
                      disabled={isFirebaseSyncing}
                      className="w-full text-left text-xs text-text-secondary hover:text-white transition-colors flex items-center justify-between pointer-events-auto cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <Cloud className="w-4 h-4 text-cyan-500 animate-pulse" />
                        <span>Nuvem: Sincronizar Google</span>
                      </div>
                      {isFirebaseSyncing && <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-1 rounded-lg bg-emerald-500/5 border border-emerald-550/10 p-2 text-[10px] font-mono select-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Database className="w-3.5 h-3.5" />
                          <span className="font-black text-[9px] uppercase tracking-wider">
                            {isProfessorOrAdmin ? "Nuvem: Professor" : "Nuvem: Acadêmico"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={handleFirebaseLogout}
                          className="text-[8px] text-gray-400 hover:text-rose-400 transition-colors uppercase font-bold cursor-pointer"
                        >
                          Sair
                        </button>
                      </div>
                      <div className="text-[9px] text-gray-300 truncate font-sans text-left">
                        {firebaseUser.email}
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleManualSyncToFirestore}
                        disabled={isFirebaseSyncing}
                        className="mt-1.5 flex items-center justify-center gap-1.5 py-1 px-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded border border-emerald-500/20 transition-all text-[9px] font-bold uppercase cursor-pointer disabled:opacity-50"
                      >
                        <Upload className="w-3 h-3" />
                        {isFirebaseSyncing ? "Sincronizando..." : "Enviar Dados p/ Nuvem"}
                      </button>

                      {firebaseSyncError && (
                        <div className="text-[8px] text-rose-400 mt-1 leading-relaxed text-left">
                          Aviso: {firebaseSyncError.substring(0, 40)}...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex justify-center border-y border-white/5 py-2 my-1 w-full">
                  {!firebaseUser ? (
                    <button
                      type="button"
                      onClick={handleFirebaseGoogleLogin}
                      disabled={isFirebaseSyncing}
                      className="p-1.5 rounded hover:bg-white/5 text-cyan-400 cursor-pointer"
                      title="Nuvem: Sincronizar Google"
                    >
                      <Cloud className="w-4 h-4 text-cyan-500 animate-pulse" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleFirebaseLogout}
                      className="p-1.5 rounded bg-emerald-500/10 hover:bg-rose-500/15 text-emerald-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title={`Nuvem Ativa: ${firebaseUser.email}. Clique para Sair.`}
                    >
                      <Database className="w-4 h-4 text-emerald-400" />
                    </button>
                  )}
                </div>
              )}

              {!isSidebarCollapsed ? (
                <button
                  id="logout-btn"
                  type="button"
                  onClick={() => {
                    setConfirmModal({
                      isOpen: true,
                      title: "Desconectar Conta",
                      description: "Tem certeza de que deseja se desconectar? Qualquer progresso não salvo/testado nesta sessão poderá ser perdido.",
                      onConfirm: firebaseUser ? handleFirebaseLogout : handleLogout
                    });
                  }}
                  className="w-full text-left text-xs text-accent-error hover:text-white transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Desconectar Conta</span>
                </button>
              ) : (
                <div className="flex justify-center w-full">
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmModal({
                        isOpen: true,
                        title: "Desconectar Conta",
                        description: "Tem certeza de que deseja se desconectar? Qualquer progresso não salvo/testado nesta sessão poderá ser perdido.",
                        onConfirm: firebaseUser ? handleFirebaseLogout : handleLogout
                      });
                    }}
                    className="p-1.5 rounded hover:bg-rose-500/15 text-accent-error hover:text-white transition-all cursor-pointer"
                    title="Desconectar Conta"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Copyright Section */}
              {!isSidebarCollapsed && (
                <div className="pt-4 border-t border-white/5 space-y-2 opacity-60 hover:opacity-100 transition-opacity">
                  <p className="text-[8px] text-gray-400 leading-relaxed font-sans text-center px-1">
                    © 2026 Fábio Santana Lima. Todos os direitos reservados.
                    <br />
                    <span className="animate-pulse text-white font-black uppercase tracking-widest mt-1 inline-block">O usuário compreende que a estrutura de 8 fases, o roteiro pedagógico e o método de avaliação são de propriedade exclusiva do criador. O uso indevido da metodologia e das dinâmicas das 8 fases deste simulador constitui violação de direitos autorais.</span>
                  </p>
                </div>
              )}
            </div>
          </aside>

          {/* B. CENTER PIECE: THE ACTIVE TAB DYNAMICAL LAYOUT */}
          <main className="flex-1 p-3.5 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6">
            {/* HEADER METRIC BANNER */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-950/20 p-3.5 sm:p-4 rounded-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-accent-primary/10 px-3 py-1 text-[10px] font-mono rounded-bl text-accent-primary uppercase font-bold tracking-widest hidden sm:block">
                {activeStudent?.timeId 
                  ? `ESTAÇÃO ATIVA ${activeStudent.timeId} — SQUAD LOGÍSTICA`
                  : "ESTAÇÃO INDIVIDUAL — LOGÍSTICA"
                }
              </div>
              <div>
                <span className="text-[10px] font-mono text-text-secondary uppercase select-none block">
                  {appLanguage === "en" ? "🎯 DP Career Target Track" : "🎯 Trilha de Trampo do DP"}
                </span>
                <h2 className="text-lg font-sans font-bold text-white tracking-tight animate-fade-in">
                  {currentTab === "challenges" &&
                    (appLanguage === "en" 
                      ? `🔥 Active Case: ${translateModuleName(selectedPhaseId, CAREER_PHASES.find((p) => p.id === selectedPhaseId)?.moduloTecnico || "", "en")}`
                      : `Módulo Ativo: ${CAREER_PHASES.find((p) => p.id === selectedPhaseId)?.moduloTecnico}`)}
                  {currentTab === "linguajar" && 
                    (appLanguage === "en" ? "💬 CLT Bilingual Terms & Official Glossary" : "Tradutor e Dicionário CLT Oficial")}
                  {currentTab === "metrics" && 
                    (appLanguage === "en" ? "📊 Average XP & e-Social Analytics Progress" : "Métricas Governamentais e-Social")}
                  {currentTab === "desempenho" && 
                    (appLanguage === "en" ? "⏱️ Screen Time Monitor & Productivity History" : "Evolução de Produtividade & Desempenho Pessoal")}
                  {currentTab === "badges" && 
                    (appLanguage === "en" ? "🎖️ Professional Compliance Badges & Milestones" : "Insígnias de Honra e Marcos de Conformidade")}
                  {currentTab === "ranking" && 
                    (appLanguage === "en" ? "🏆 Real-Time Team Placar & Stations" : "Placar de Líderes & Estações de Simulador")}
                  {currentTab === "sandbox" &&
                    (appLanguage === "en" ? "🧪 Laboratory of HR Regulations & Rules Sandbox" : "Laboratório Técnico Paramétrico de RH")}
                  {currentTab === "professor" &&
                    (appLanguage === "en" ? "Professor's Control Board (Onboarding / Management)" : "Área do Mestre (Gestor Onboarding Automatizado)")}
                </h2>
              </div>

              {/* Linear phase slider quick-actions */}
              {currentTab === "challenges" && (
                <div className="flex flex-wrap gap-1.5 font-mono text-xs items-center">
                  {CAREER_PHASES.map((ph) => {
                    const isPhUnlocked = unlockedPhasesList.includes(ph.id);
                    return (
                      <button
                        id={`fast-phase-nav-${ph.id}`}
                        key={ph.id}
                        onClick={() => {
                          setSelectedPhaseId(ph.id);
                          setCurrentTab("challenges");
                        }}
                        className={`py-1 px-2.5 rounded text-[10px] uppercase font-bold transition-all select-none flex items-center gap-1 cursor-pointer ${
                          selectedPhaseId === ph.id
                            ? "bg-accent-primary text-bg-primary shadow-[0_0_8px_rgba(0,229,255,0.3)]"
                            : isPhUnlocked
                              ? "bg-slate-900 text-gray-300 hover:bg-slate-800 hover:text-white"
                              : "bg-black/40 text-gray-500 hover:text-rose-400 hover:border-rose-500/30 border border-white/5"
                        }`}
                        title={
                          isPhUnlocked
                            ? `Acessar Fase ${ph.id}: ${ph.cargo}`
                            : `Fase ${ph.id} Bloqueada: Clique para ver os requisitos de conclusão da Fase ${ph.id - 1} (${CAREER_PHASES.find(p => p.id === ph.id - 1)?.precisaoMinima}% de precisão).`
                        }
                      >
                        {!isPhUnlocked && <span className="text-[9px]">🔒</span>}F
                        {ph.id}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>



            {/* TAB CONTENTS ROUTER */}
            {currentTab === "challenges" && (
              <div className="space-y-6">
                {isCurrentPhaseLocked ? (
                  <div className="glass-panel p-6 sm:p-10 rounded-2xl border border-rose-500/10 bg-slate-950/40 space-y-8 animate-fade-in text-left relative overflow-hidden shadow-2xl">
                    {/* Background faint red glow */}
                    <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-rose-500/5 blur-3xl pointer-events-none" />
                    
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-white/5 pb-6">
                      <div className="p-4 bg-rose-500/10 rounded-2xl text-rose-400 border border-rose-500/25 shadow-lg shadow-rose-500/5 shrink-0 flex items-center justify-center">
                        <Lock className="w-10 h-10 animate-pulse" />
                      </div>
                      <div className="space-y-2 text-center sm:text-left">
                        <div className="text-[10px] font-mono text-rose-400 font-extrabold uppercase tracking-widest bg-rose-500/10 px-2.5 py-1 rounded-full inline-block">
                          {appLanguage === "en" ? "STAGE LOCKED" : "CARGO BLOQUEADO"}
                        </div>
                        <h3 className="text-xl sm:text-2xl font-sans font-black text-gray-100 uppercase tracking-tight">
                          {CAREER_PHASES.find(p => p.id === selectedPhaseId)?.cargo || `Fase ${selectedPhaseId}`}
                        </h3>
                        <p className="text-xs sm:text-sm text-text-secondary max-w-2xl leading-relaxed">
                          {appLanguage === "en"
                            ? "To assume this role and unlock these challenges, you must meet all the regulatory requirements of the previous career phases."
                            : "Para assumir este cargo e desbloquear estes desafios, você precisa cumprir todos os requisitos regulamentares das fases anteriores do plano de cargos."}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-xs font-mono text-gray-400 font-extrabold uppercase tracking-widest flex items-center gap-2">
                        <span>●</span> {appLanguage === "en" ? "REQUIRED PROGRESS CHECKLIST" : "CHECKLIST DE REQUISITOS PENDENTES"}
                      </h4>

                      <div className="grid grid-cols-1 gap-4">
                        {precedingPhasesData.map((phase) => {
                          const missingChallenges = phase.total - phase.attempted;
                          
                          return (
                            <div 
                              key={phase.id} 
                              className={`p-5 rounded-2xl border transition-all ${
                                phase.isPassed
                                  ? "bg-emerald-950/10 border-emerald-500/15"
                                  : "bg-slate-900/60 border-white/5 shadow-inner"
                              }`}
                            >
                              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                                <div className="space-y-1 text-left">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-mono font-bold text-gray-400">
                                      Fase {phase.id}
                                    </span>
                                    <span className="text-gray-600">•</span>
                                    <span className="text-sm font-sans font-extrabold text-gray-200">
                                      {phase.cargo}
                                    </span>
                                    {phase.isPassed ? (
                                      <span className="text-[9px] font-mono font-bold uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                        {appLanguage === "en" ? "Passed" : "Aprovado"}
                                      </span>
                                    ) : (
                                      <span className="text-[9px] font-mono font-bold uppercase bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded border border-amber-500/20">
                                        {appLanguage === "en" ? "Pending" : "Pendente"}
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-xs text-text-secondary">
                                    Módulo: <strong className="text-gray-300">{phase.moduloTecnico}</strong> — {phase.focoPrincipal}
                                  </p>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto items-stretch sm:items-center">
                                  {/* Progress bar Completion */}
                                  <div className="space-y-1.5 shrink-0 sm:w-36">
                                    <div className="flex justify-between text-[10px] font-mono">
                                      <span className="text-gray-400 uppercase font-bold">
                                        {appLanguage === "en" ? "COMPLETION" : "RESOLUÇÃO"}
                                      </span>
                                      <span className={phase.meetsAttempted ? "text-emerald-400 font-bold" : "text-amber-500 font-bold"}>
                                        {phase.attempted}/{phase.total}
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${phase.meetsAttempted ? "bg-emerald-500" : "bg-amber-500"}`}
                                        style={{ width: `${phase.total > 0 ? (phase.attempted / phase.total) * 100 : 100}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Progress bar Accuracy */}
                                  <div className="space-y-1.5 shrink-0 sm:w-36">
                                    <div className="flex justify-between text-[10px] font-mono">
                                      <span className="text-gray-400 uppercase font-bold">
                                        {appLanguage === "en" ? "ACCURACY" : "PRECISÃO"}
                                      </span>
                                      <span className={phase.meetsAccuracy ? "text-emerald-400 font-bold" : "text-rose-500 font-bold"}>
                                        {phase.accuracy.toFixed(0)}% / {phase.minAccuracy}%
                                      </span>
                                    </div>
                                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full transition-all duration-500 ${phase.meetsAccuracy ? "bg-emerald-500" : "bg-rose-500"}`}
                                        style={{ width: `${Math.min(100, phase.accuracy)}%` }}
                                      />
                                    </div>
                                  </div>

                                  {/* Action CTA for the stage */}
                                  <div className="flex items-center justify-end shrink-0 lg:w-40">
                                    {phase.isPassed ? (
                                      <div className="text-emerald-400 text-xs font-sans font-bold flex items-center gap-1 bg-emerald-500/5 px-3 py-1.5 rounded-lg border border-emerald-500/10">
                                        <CheckCircle2 className="w-4 h-4" /> {appLanguage === "en" ? "Ready" : "Concluído"}
                                      </div>
                                    ) : (
                                      <button
                                        onClick={() => setSelectedPhaseId(phase.id)}
                                        className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-slate-100 font-sans font-bold uppercase text-[10px] tracking-wider rounded-xl cursor-pointer hover:shadow-[0_0_12px_rgba(245,158,11,0.2)] transition-all flex items-center justify-center gap-1.5"
                                      >
                                        <span>{appLanguage === "en" ? "Resolve Phase" : "Resolver Pendências"}</span>
                                        <ArrowRight className="w-3 h-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Alert details explanation for pending phase */}
                              {!phase.isPassed && (
                                <div className="mt-3 p-3 bg-rose-500/5 border border-rose-500/10 rounded-xl text-left text-xs text-rose-300 font-sans leading-relaxed space-y-1">
                                  <p className="font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-rose-400">
                                    <AlertTriangle className="w-3.5 h-3.5" /> 
                                    {appLanguage === "en" ? "Actionable requirements:" : "Exigências regulatórias não cumpridas:"}
                                  </p>
                                  <ul className="list-disc list-inside space-y-1 text-gray-300 text-[11px]">
                                    {!phase.meetsAttempted && (
                                      <li>
                                        {appLanguage === "en" 
                                          ? `You must answer all challenges. Missing ${missingChallenges} challenge(s) to complete.` 
                                          : `Você deve responder a todos os cenários da trilha. Falta(m) ${missingChallenges} desafio(s).`}
                                      </li>
                                    )}
                                    {!phase.meetsAccuracy && (
                                      <li>
                                        {appLanguage === "en" 
                                          ? `Average score is ${phase.accuracy.toFixed(1)}%. The official minimum requirement is ${phase.minAccuracy}%.` 
                                          : `Precisão média atual é de ${phase.accuracy.toFixed(1)}%. O exigido regulamentar é de no mínimo ${phase.minAccuracy}%.`}
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Main Challenge focus panel (width 2 cols) */}
                <div className="xl:col-span-2 space-y-4">
                  {selectedPhaseId === 0 && (
                    <div id="phase0-exam-grade-banner" className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 border border-cyan-500/20 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg animate-fade-in border-dashed">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow">📝</span>
                        <div className="text-left">
                          <h4 className="text-xs font-mono text-cyan-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                            <span>●</span> Nota de Avaliação de Onboarding
                          </h4>
                          <p className="text-[11px] text-gray-300 mt-0.5">Calculada em tempo real com base nos seus acertos nos {phase0ChallengeIds.length} módulos da Fase 0.</p>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 bg-cyan-950/60 border border-cyan-500/35 px-4 py-1.5 rounded-xl shadow-inner shrink-0 group hover:border-[#00E5FF]/40 transition-all select-none">
                        <span className="text-[10px] text-cyan-400/85 font-mono font-bold uppercase tracking-wider">Nota Prova F0:</span>
                        <span className="text-xl font-mono font-black text-[#00E5FF] tracking-tight">
                          {((completedPhase0Count / phase0ChallengeIds.length) * 10).toFixed(1)}
                        </span>
                        <span className="text-[10px] text-cyan-400 font-mono">/ 10</span>
                      </div>
                    </div>
                  )}

                  {selectedPhaseId === 0 &&
                    completedPhase0Count === phase0ChallengeIds.length &&
                    activeStudent?.faseAtual === 0 && (
                      <div className="p-5 bg-indigo-950/40 border border-accent-primary/35 rounded-2xl text-left space-y-3 shadow-lg shadow-accent-primary/5 animate-fade-in">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-accent-primary/10 rounded-lg text-accent-primary">
                            <Sparkles className="w-5 h-5" />
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-gray-100 font-sans font-bold text-sm uppercase tracking-tight flex items-center gap-2">
                              <span>✓</span> PRÉ-SELEÇÃO CONCLUÍDA (100%)!
                            </h4>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              Você superou todos os desafios de admissão com
                              precisão regulamentar perfeita. Seus dados foram
                              encaminhados para homologação do{" "}
                              <strong className="text-accent-primary">
                                Professor/Monitoria
                              </strong>
                              .
                            </p>
                            <p className="text-xs text-accent-warning font-mono font-medium flex items-center gap-1.5 mt-2 bg-accent-warning/5 p-2 rounded border border-accent-warning/10">
                              <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                              Aguarde a CONTRATAÇÃO Oficial do Mestre na Área do
                              Professor para se tornar Estagiário de RH e
                              desbloquear a Fase 1 (Holerite e Contracheque)!
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {/* Phase empty indicator fallback */}
                  {phaseChallenges.length === 0 ? (
                    <div className="p-12 text-center glass-panel rounded-2xl border border-white/5 space-y-2">
                      <HelpCircle className="w-8 h-8 text-accent-warning mx-auto animate-pulse" />
                      <p className="font-mono text-xs text-text-secondary">
                        Nenhum desafio correspondente carregado para este cargo.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Sub phase navigation items */}
                      <div className="flex justify-between items-center bg-slate-950/40 p-3 rounded-xl border border-white/5">
                        <button
                          id="prev-challenge-btn"
                          onClick={selectPreviousChallenge}
                          className="text-xs font-mono text-accent-primary hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {appLanguage === "en" ? "◀ Previous" : "◀ Anterior"}
                        </button>

                        <span
                          id="challenge-paginator-text"
                          className="text-xs font-mono text-text-secondary font-bold"
                        >
                          {appLanguage === "en" ? "CHALLENGE" : "DESAFIO"} {activeChallenge ? activeChallenge.id : "-"} (
                          {phaseChallenges.findIndex(
                            (c) => c.id === selectedChallengeId,
                          ) + 1}{" "}
                          / {phaseChallenges.length})
                        </span>

                        <button
                          id="next-challenge-btn"
                          onClick={selectNextChallenge}
                          className="text-xs font-mono text-accent-primary hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {appLanguage === "en" ? "Next ▶" : "Próximo ▶"}
                        </button>
                      </div>

                      {/* Discrete Challenge Navigation Grid */}
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center justify-between px-1">
                          <button 
                            onClick={() => setIsGridCollapsed(!isGridCollapsed)}
                            className="text-[9px] font-mono text-text-secondary hover:text-accent-primary transition-colors flex items-center gap-1.5 uppercase tracking-wider font-bold cursor-pointer"
                          >
                            <LayoutGrid className="w-3 h-3" />
                            {appLanguage === "en" ? (isGridCollapsed ? "Show Navigation Grid" : "Hide Navigation Grid") : (isGridCollapsed ? "Mostrar Grade de Navegação" : "Ocultar Grade de Navegação")}
                          </button>
                          {!isGridCollapsed && (
                            <div className="flex items-center gap-3 text-[8px] font-mono text-text-secondary uppercase">
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                                <span>OK</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-1.5 h-1.5 rounded-full bg-accent-primary"></div>
                                <span>Ativo</span>
                              </div>
                            </div>
                          )}
                        </div>

                        {!isGridCollapsed && (
                          <div className="bg-slate-900/40 border border-white/5 rounded-xl p-2 animate-fade-in">
                            <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 gap-1.5">
                              {phaseChallenges.map((ch, idx) => {
                                const isDone = completedChallenges.includes(ch.id);
                                const isActive = selectedChallengeId === ch.id;
                                return (
                                  <button
                                    key={ch.id}
                                    onClick={() => setSelectedChallengeId(ch.id)}
                                    className={`group relative h-7 rounded border transition-all flex items-center justify-center cursor-pointer ${
                                      isActive
                                        ? "bg-accent-primary/20 border-accent-primary shadow-[0_0_8px_rgba(0,229,255,0.2)]"
                                        : isDone
                                          ? "bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50"
                                          : "bg-slate-950/60 border-white/5 hover:border-white/20"
                                    }`}
                                    title={`${ch.id}: ${ch.titulo}`}
                                  >
                                    <span className={`text-[9px] font-mono font-bold ${isActive ? "text-accent-primary" : isDone ? "text-emerald-400" : "text-gray-400"}`}>
                                      {idx + 1}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {activeChallenge && (
                        <div
                          id="active-challenge-viewer"
                          className="glass-panel rounded-2xl border border-white/5 p-4 sm:p-6 space-y-4 sm:space-y-6 relative overflow-hidden"
                        >
                          {isTranslatingChallenge ? (
                            <div className="space-y-6 py-12 flex flex-col items-center justify-center text-center animate-pulse">
                              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4" />
                              <p className="text-sm font-mono text-gray-300">Translating challenge into English using AI...</p>
                            </div>
                          ) : (
                            <>
                              {/* Top row indicators */}
                          <div className="flex flex-col md:flex-row justify-between border-b border-white/5 pb-4 gap-2">
                            <div>
                              {activeChallenge.bloco && (
                                <span className="text-[10px] font-mono text-accent-primary uppercase tracking-widest bg-accent-primary/10 px-2.5 py-0.5 rounded mr-2 font-bold select-none">
                                  Bloco {activeChallenge.bloco}
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
                                {activeChallenge.tipo}
                              </span>
                              <h3
                                id="challenge-headline"
                                className="text-lg font-sans font-extrabold text-gray-100 mt-1 uppercase tracking-tight"
                              >
                                {activeChallenge.id} - {activeChallenge.titulo}
                              </h3>
                            </div>

                            <div className="flex gap-3 text-right text-xs font-mono">
                              <div>
                                <span className="text-[10px] text-text-secondary block font-bold">
                                  RECOMPENSA
                                </span>
                                <span className="text-accent-warning font-bold">
                                  +{activeChallenge.xpRecompensa} XP
                                </span>
                              </div>
                              <div>
                                <span className="text-[10px] text-text-secondary block font-bold">
                                  ARTIGO
                                </span>
                                <span className="text-gray-300 font-semibold">
                                  {activeChallenge.focoTecnico}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Employee Grievance Bubble with prompt-styled quotes - Now displayed first */}
                          <div className="space-y-2">
                            <span className="text-xs font-mono text-accent-primary uppercase tracking-widest block font-bold text-left">
                              Reclamação ou Dúvida do Funcionário:
                            </span>
                            <blockquote className="p-4 bg-slate-950/85 rounded-xl border border-white/10 font-sans italic text-sm md:text-base leading-relaxed text-gray-200 text-left relative">
                              "{activeChallenge.queixa}"
                            </blockquote>
                          </div>

                          {/* Phase 3, 4 & 5 Tabs Navigation */}
                          {(activeChallenge.fase === 3 || activeChallenge.fase === 4 || activeChallenge.fase === 5) && (
                            <div className="space-y-4 mt-2">
                              {/* Operational Crisis Alert Banner */}
                              <div className="bg-rose-950/40 border border-rose-500/30 rounded-xl p-4 flex flex-col md:flex-row items-start gap-3 text-left animate-pulse">
                                <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg shrink-0">
                                  <AlertTriangle className="w-5 h-5" />
                                </div>
                                <div className="space-y-1">
                                  <h4 className="text-rose-400 font-sans font-bold text-xs uppercase tracking-wider">
                                    🚨 INCIDENTE CRÍTICO: BACKEND CLOUD FORA DO
                                    AR (DOWNTIME COPRIME)
                                  </h4>
                                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                                    O integrador do e-Social e de cálculos
                                    rescisórios automáticos falhou devido a uma
                                    instabilidade nacional. Vários funcionários
                                    estão de prontidão exigindo as homologações
                                    e impressões manuais de seus termos (TRCT).
                                    Use os anexos de{" "}
                                    <strong>Contrato de Trabalho</strong> e{" "}
                                    <strong>Ficha Financeira</strong> acima para
                                    auditar os vínculos e a{" "}
                                    <strong>Calculadora de Apoio CLIPS</strong>{" "}
                                    à direita para calcular os valores na unha!
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 border-b border-white/10 mb-6">
                                <button
                                  onClick={() => setPhase3Tab("caso")}
                                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${phase3Tab === "caso" ? "border-b-2 border-accent-primary text-accent-primary bg-accent-primary/5" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}
                                >
                                  {isAlreadyAttempted
                                    ? "Caso (Encerrado)"
                                    : "Caso Prático & TRCT"}
                                </button>
                                <button
                                  onClick={() => setPhase3Tab("contrato")}
                                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${phase3Tab === "contrato" ? "border-b-2 border-accent-primary text-accent-primary bg-accent-primary/5" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}
                                >
                                  Contrato de Trab.
                                </button>
                                <button
                                  onClick={() => setPhase3Tab("remuneracao")}
                                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${phase3Tab === "remuneracao" ? "border-b-2 border-accent-primary text-accent-primary bg-accent-primary/5" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}
                                >
                                  Ficha Financeira
                                </button>
                                <button
                                  onClick={() => setPhase3Tab("holerite")}
                                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${phase3Tab === "holerite" ? "border-b-2 border-accent-primary text-accent-primary bg-accent-primary/5" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}
                                >
                                  Holerite (Gestão)
                                </button>
                                <button
                                  onClick={() => setPhase3Tab("ponto")}
                                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${phase3Tab === "ponto" ? "border-b-2 border-accent-primary text-accent-primary bg-accent-primary/5" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}
                                >
                                  Folha de Ponto
                                </button>
                                <button
                                  onClick={() => setPhase3Tab("atestados")}
                                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all ${phase3Tab === "atestados" ? "border-b-2 border-accent-primary text-accent-primary bg-accent-primary/5" : "text-gray-400 hover:text-gray-200 hover:bg-white/5"}`}
                                >
                                  Atestados & Anexos
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Render Content Based on Tabs (or standard view for phase 0-2 and simple MCQ) */}
                          {((activeChallenge.fase < 3) ||
                            phase3Tab === "caso") && (
                            <div className="mt-4">
                              {/* Split view: Employee bio card versus Employee Grievance/Medical Cert */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Employer Card */}
                                <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-3 font-mono text-sm text-left relative overflow-hidden">
                                  <span className="text-xs text-accent-primary uppercase font-bold block border-b border-white/5 pb-1">
                                    Cadastro Geral do Empregado (e-Social)
                                  </span>

                                  <div className="space-y-1.5 mt-2 text-text-secondary">
                                    <div className="flex justify-between">
                                      <span>Nome:</span>
                                      <span className="text-gray-200 font-bold">
                                        {activeChallenge.empregado.nome}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>CBO / Função:</span>
                                      <span className="text-gray-300">
                                        {activeChallenge.empregado.cbo}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Salário Base:</span>
                                      <span className="text-emerald-400 font-bold">
                                        R${" "}
                                        {activeChallenge.empregado.salarioBase.toLocaleString(
                                          "pt-BR",
                                          { minimumFractionDigits: 2 },
                                        )}
                                      </span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span>Admissão:</span>
                                      <span className="text-gray-300">
                                        {activeChallenge.empregado.dataAdmissao}
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {/* Medical Certificate Card if applicable */}
                                {activeChallenge.empregado.detalhesAtestado &&
                                activeChallenge.fase !== 3 ? (
                                  <div className="bg-slate-950/40 p-4 rounded-xl border border-accent-warning/20 space-y-3 font-mono text-sm text-left relative">
                                    <span className="text-xs text-accent-warning uppercase font-bold block border-b border-white/5 pb-1">
                                      Atestado Médico Anexado
                                    </span>
                                    <div className="space-y-1.5 mt-2 text-text-secondary">
                                      <div className="flex justify-between">
                                        <span>Médico:</span>
                                        <span className="text-gray-200">
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.medico
                                          }
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Inscrição:</span>
                                        <span className="text-accent-primary font-bold">
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.crm
                                          }
                                        </span>
                                      </div>
                                      <div className="flex justify-between">
                                        <span>Período:</span>
                                        <span className="text-gray-300">
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.diasAfastados
                                          }{" "}
                                          Dias
                                        </span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                        <span>CID Código:</span>
                                        <span className="text-emerald-500 font-bold bg-emerald-950/40 px-1.5 py-0.2 rounded text-xs">
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.cid
                                          }
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  activeChallenge.fase !== 3 && (
                                    <div className="bg-slate-950/10 p-4 rounded-xl border border-white/3 flex items-center justify-center">
                                      <span className="text-xs text-gray-500 font-mono text-center">
                                        Nenhum atestado médico anexo a este
                                        processo.
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>

                              {activeChallenge.fase === 3 ? (
                                <div className="bg-slate-950/60 p-6 rounded-xl border border-accent-primary/20 space-y-4 text-left font-sans mt-6">
                                  <div className="flex items-center gap-2 text-accent-primary">
                                    <AlertTriangle className="w-5 h-5 animate-bounce" />
                                    <h4 className="font-bold text-xs font-mono uppercase tracking-wider">
                                      REGIME DE CONTINGÊNCIA ATIVO
                                    </h4>
                                  </div>
                                  <p className="text-xs text-gray-300 leading-relaxed">
                                    Esta folha de pagamento exige a apuração
                                    integral de{" "}
                                    <strong>15 variáveis financeiras</strong>. O
                                    cálculo de saldo, médias, adicionais,
                                    descontos e tributos (INSS/IRRF/FGTS) está
                                    sob sua responsabilidade.
                                  </p>
                                  <div className="bg-white/5 border border-white/10 p-4 rounded-lg space-y-2">
                                    <span className="text-[10px] text-text-secondary font-mono tracking-widest block uppercase">
                                      Fluxo de Trabalho Recomendado:
                                    </span>
                                    <ol className="text-xs space-y-1.5 text-gray-400 font-mono list-decimal pl-4">
                                      <li>
                                        Revise as regras em{" "}
                                        <strong className="text-accent-primary">
                                          Contrato de Trab.
                                        </strong>
                                      </li>
                                      <li>
                                        Confira a produção em{" "}
                                        <strong className="text-accent-primary">
                                          Ficha Financeira
                                        </strong>
                                      </li>
                                      <li>
                                        Verifique as horas trabalhadas na{" "}
                                        <strong className="text-accent-primary">
                                          Folha de Ponto
                                        </strong>
                                      </li>
                                      <li>
                                        Acesse o{" "}
                                        <strong className="text-accent-primary">
                                          Holerite (Gestão)
                                        </strong>{" "}
                                        para preencher a planilha
                                      </li>
                                    </ol>
                                  </div>
                                  <button
                                    onClick={() => setPhase3Tab("holerite")}
                                    className="w-full bg-accent-primary text-bg-primary hover:bg-white text-xs font-bold uppercase py-2.5 rounded-lg font-mono transition-all flex items-center justify-center gap-2"
                                  >
                                    Ir para Planilha de Holerite (Gestão) &rarr;
                                  </button>
                                </div>
                              ) : activeChallenge.fase === 5 ? (
                                <div className="mt-6 border-t border-white/10 pt-4">
                                  <InteractiveSeveranceGrid
                                    activeChallenge={activeChallenge}
                                    isAlreadyAttempted={isAlreadyAttempted}
                                    hasSucceeded={hasSucceeded}
                                    savedSelection={severanceSelections[activeChallenge.id]}
                                    appLanguage={appLanguage}
                                    onSubmit={(isCorrect, feedbackText, article, selectedMap) => {
                                      handleCheckChallengeSeverances(isCorrect, feedbackText, article, selectedMap);
                                    }}
                                  />
                                </div>
                              ) : (
                                /* STANDARD CHANNELS MCQ LIST */
                                <div className="space-y-4 border-t border-white/10 pt-4 mt-6">
                                  <span className="text-xs font-mono text-accent-primary uppercase tracking-widest block font-bold text-left">
                                    {isAlreadyAttempted
                                      ? (appLanguage === "en" ? "Answered Diagnosis:" : "Diagnóstico Respondido:")
                                      : (appLanguage === "en" ? "Choose the Correct Legal Diagnosis:" : "Escolha o Diagnóstico Legal Correto:")}
                                  </span>

                                  <div className="space-y-2.5">
                                    {activeChallenge.opcoes?.map((opt) => (
                                      <button
                                        id={`challenge-option-btn-${opt.id}`}
                                        key={opt.id}
                                        type="button"
                                        onClick={() => {
                                          if (!isAlreadyAttempted) {
                                            setSelectedOptionId(opt.id);
                                          }
                                        }}
                                        disabled={isAlreadyAttempted}
                                        className={`w-full p-4 rounded-xl border font-sans text-sm text-left transition-all relative flex items-start gap-3 ${
                                          selectedOptionId === opt.id ||
                                          (isAlreadyAttempted &&
                                            hasSucceeded &&
                                            opt.id ===
                                              activeChallenge.gabarito
                                                .respostaEsperadaId)
                                            ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-300 font-medium"
                                            : isAlreadyAttempted &&
                                                !hasSucceeded &&
                                                selectedOptionId === opt.id
                                              ? "bg-rose-950/20 border-rose-500/40 text-accent-error font-medium"
                                              : "bg-slate-950/40 border-white/5 hover:border-white/11 text-gray-300 disabled:cursor-not-allowed"
                                        }`}
                                      >
                                        <span
                                          className={`w-5 h-5 rounded-full border flex-shrink-0 flex items-center justify-center text-xs font-mono ${
                                            selectedOptionId === opt.id ||
                                            (isAlreadyAttempted &&
                                              hasSucceeded &&
                                              opt.id ===
                                                activeChallenge.gabarito
                                                  .respostaEsperadaId)
                                              ? "border-emerald-500 bg-emerald-500 text-bg-primary font-bold"
                                              : isAlreadyAttempted &&
                                                  !hasSucceeded &&
                                                  selectedOptionId === opt.id
                                                ? "border-rose-500 bg-rose-500 text-white font-bold"
                                                : "border-gray-500"
                                          }`}
                                        >
                                          {opt.id.charAt(opt.id.length - 1)}
                                        </span>
                                        <span className="leading-relaxed">
                                          {opt.texto}
                                        </span>
                                      </button>
                                    ))}
                                  </div>

                                  {/* Original button removed - moved to footer */}

                                  {(challengeFeedback ||
                                    isAlreadyAttempted) && (
                                    <div
                                      id="mcq-result-feedback"
                                      className={`p-4 rounded-xl border text-sm leading-relaxed text-left ${
                                        (challengeFeedback?.isCorrect ??
                                        hasSucceeded)
                                          ? "bg-emerald-950/25 border-emerald-500/20 text-emerald-400"
                                          : "bg-rose-950/25 border-rose-500/20 text-accent-error"
                                      }`}
                                    >
                                      <span className="font-bold block uppercase mb-1 text-xs">
                                        {(challengeFeedback?.isCorrect ??
                                        hasSucceeded)
                                          ? appLanguage === "en" ? "✓ LEGAL DIAGNOSIS CORRECT (COMPLETED)!" : "✓ DIAGNÓSTICO CORRETO (CONCLUÍDO)!"
                                          : appLanguage === "en" ? "✕ CASE CLOSED WITH ERROR!" : "✕ DESAFIO ENCERRADO COM ERRO!"}
                                      </span>
                                      <p className="text-gray-100">
                                        {challengeFeedback?.text ||
                                          (hasSucceeded
                                            ? activeChallenge.gabarito
                                                .valoresCorretos
                                                ?.justificativa ||
                                              appLanguage === "en" ? "Excellent choice! Your accounting-legal diagnosis was surgical." : "Excelente escolha! Seu diagnóstico contábil-legal foi cirúrgico."
                                            : appLanguage === "en" ? "Incorrect option! You made a major DP error and generated a labor liability that compromises the company's accounts. This case is closed and cannot be retried." : "Opção incorreta! Você cometeu um erro grave de DP e gerou um passivo trabalhista que compromete as contas da empresa. Este caso foi encerrado e não pode ser refeito.")}
                                      </p>
                                      <span className="text-xs text-text-secondary font-mono mt-2 block">
                                        {appLanguage === "en" ? "Legal Grounds: " : "Fundamentação: "}{" "}
                                        {challengeFeedback?.article ||
                                          activeChallenge.gabarito.artigoLegal}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {/* TAB RENDERERS FOR PHASE 3, 4 & 5 */}
                          {(activeChallenge.fase === 3 || activeChallenge.fase === 4 || activeChallenge.fase === 5) &&
                            phase3Tab === "contrato" && (
                              <div className="bg-slate-950/40 p-6 rounded-xl border border-white/5 font-mono text-sm animate-fade-in text-left mt-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent-primary/5 rounded-bl-full pointer-events-none"></div>
                                <h4 className="text-accent-primary font-bold mb-4 border-b border-white/10 pb-2 uppercase tracking-wide flex items-center gap-2">
                                  <FileText className="w-4 h-4" /> Resumo do
                                  Contrato de Trabalho
                                </h4>
                                <div className="space-y-4 text-gray-300 text-xs">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <span className="text-gray-500 block">
                                        Empregado(a)
                                      </span>
                                      <span className="font-bold">
                                        {activeChallenge.empregado.nome}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        CBO / Ocupação
                                      </span>
                                      <span className="font-bold">
                                        {activeChallenge.empregado.cbo}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-3 gap-4">
                                    <div>
                                      <span className="text-gray-500 block">
                                        Data de Admissão
                                      </span>
                                      <span>
                                        {activeChallenge.empregado.dataAdmissao}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Salário Base
                                      </span>
                                      <span className="text-emerald-400 font-bold">
                                        R${" "}
                                        {activeChallenge.empregado.salarioBase.toLocaleString(
                                          "pt-BR",
                                          { minimumFractionDigits: 2 },
                                        )}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-gray-500 block">
                                        Jornada
                                      </span>
                                      <span>
                                        {activeChallenge.empregado.jornada ||
                                          "44h/semana"}
                                      </span>
                                    </div>
                                  </div>

                                  <div className="border-t border-white/10 pt-4 mt-2">
                                    <h5 className="font-bold text-gray-200 mb-2 uppercase text-[10px] tracking-widest">
                                      Adicionais Regulamentares e Condições:
                                    </h5>
                                    <ul className="space-y-2">
                                      {activeChallenge.empregado.outrasSomas ? (
                                        <li className="flex items-start gap-2 bg-slate-900/50 p-2 rounded">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-200">
                                            {
                                              activeChallenge.empregado
                                                .outrasSomas
                                            }
                                          </span>
                                        </li>
                                      ) : (
                                        <>
                                          <li className="flex items-start gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-400">
                                              Sem adicional de Periculosidade
                                              aplicável.
                                            </span>
                                          </li>
                                          <li className="flex items-start gap-2">
                                            <div className="w-3.5 h-3.5 rounded-full border border-gray-600 flex items-center justify-center mt-0.5 flex-shrink-0">
                                              <div className="w-1.5 h-1.5 bg-gray-600 rounded-full"></div>
                                            </div>
                                            <span className="text-gray-400">
                                              Atividade não classificada como
                                              insalubre (sem laudo).
                                            </span>
                                          </li>
                                        </>
                                      )}
                                      <li className="flex items-start gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary mt-0.5 flex-shrink-0" />
                                        <span className="text-gray-400">
                                          Optante por Vale Transporte (Lei Nº
                                          7.418/85). Desconto padronizado de 6%.
                                        </span>
                                      </li>
                                      {activeChallenge.empregado.dependentes > 0 && (
                                        <li className="flex items-start gap-2">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary mt-0.5 flex-shrink-0" />
                                          <span className="text-gray-400">
                                            {activeChallenge.gabarito.valoresCorretos?.bruto > 1980.38 ? (
                                              <span className="text-rose-400 font-bold decoration-rose-500/50 line-through">
                                                Inelegível para Salário-Família (Remuneração R$ {activeChallenge.gabarito.valoresCorretos.bruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} &gt; Teto R$ 1.980,38).
                                              </span>
                                            ) : (
                                              `Elegível para Quota de Salário-Família (${activeChallenge.empregado.dependentes} dependentes) conforme teto previdenciário vigente (R$ 1.980,38).`
                                            )}
                                          </span>
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              </div>
                            )}

                          {(activeChallenge.fase === 3 || activeChallenge.fase === 4 || activeChallenge.fase === 5) &&
                            phase3Tab === "remuneracao" && (
                              <div className="bg-slate-950/40 p-6 rounded-xl border border-white/5 font-mono text-sm animate-fade-in text-left mt-4 relative overflow-hidden">
                                <h4 className="text-emerald-400 font-bold mb-1 border-b border-white/10 pb-2 uppercase tracking-wide flex items-center gap-2">
                                  <FileText className="w-4 h-4" /> FICHA FINANCEIRA (MEDIDAS E MÉDIAS DE VERBAS)
                                </h4>
                                <p className="text-gray-400 text-xs mb-4">
                                  Demonstrativo de vencimentos históricos dos últimos 12 meses (ou período desde a admissão) para fins de apuração de médias de adicionais e variáveis legais.
                                </p>

                                <div className="overflow-x-auto border border-white/10 rounded">
                                  <table className="w-full text-center text-xs">
                                    <thead className="bg-white/5 text-gray-400">
                                      <tr>
                                        <th className="p-2 text-left border-r border-white/5">
                                          Competência
                                        </th>
                                        <th className="p-2 border-r border-white/5 text-right pr-4">
                                          Salário Base
                                        </th>
                                        <th className="p-2 border-r border-white/5 text-right pr-4">
                                          {activeChallenge.id === "3.2" || activeChallenge.id === "3.6" || activeChallenge.id === "3.9" ? "Comissões (R$)" : "H.E. (R$)"}
                                        </th>
                                        <th className="p-2 border-r border-white/5 text-right pr-4">
                                          Adicionais
                                        </th>
                                        <th className="p-2 text-emerald-400 text-right pr-4">
                                          Remuneração Bruta
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                                      {(() => {
                                        const list = getFichaFinanceiraDataForChallenge(activeChallenge);
                                        const isCommissionEmp = activeChallenge.id === "3.2" || activeChallenge.id === "3.6" || activeChallenge.id === "3.9";

                                        const totalHE = list.reduce((acc, curr) => acc + curr.horasExtrasVal, 0);
                                        const mediaHE = totalHE / list.length;

                                        const totalAdicionais = list.reduce((acc, curr) => acc + curr.adicionaisVal, 0);
                                        const mediaAdicionais = totalAdicionais / list.length;

                                        return (
                                          <>
                                            {list.map((item, idx) => (
                                              <tr key={idx} className="hover:bg-white/5 transition-colors">
                                                <td className="p-2 text-left font-bold border-r border-white/5 text-gray-400 font-mono">
                                                  {item.competencia}
                                                </td>
                                                <td className="p-2 border-r border-white/5 text-right pr-4">
                                                  R$ {item.salarioBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-2 border-r border-white/5 text-right pr-4 text-sky-400 font-semibold">
                                                  R$ {item.horasExtrasVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-2 border-r border-white/5 text-right pr-4">
                                                  R$ {item.adicionaisVal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="p-2 text-emerald-400 text-right pr-4 font-bold">
                                                  R$ {item.remuneracaoBruta.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                </td>
                                              </tr>
                                            ))}
                                            <tr className="bg-white/5 border-t border-white/10 font-bold text-gray-100 text-left">
                                              <td colSpan={5} className="p-3">
                                                <div className="flex flex-col sm:flex-row gap-6 text-xs text-gray-300">
                                                  <div>
                                                    Média de {isCommissionEmp ? "Comissões" : "Horas Extras"} ({list.length} {list.length === 1 ? "mês" : "meses"}):{" "}
                                                    <strong className="text-sky-400 text-sm">
                                                      R$ {mediaHE.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                    </strong>
                                                  </div>
                                                  <div>
                                                    Média de Adicionais ({list.length} {list.length === 1 ? "mês" : "meses"}):{" "}
                                                    <strong className="text-gray-200 text-sm">
                                                      R$ {mediaAdicionais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                                                    </strong>
                                                    {activeChallenge.empregado.outrasSomas?.includes("30%") && " (Periculosidade de 30% inclusa)"}
                                                  </div>
                                                </div>
                                              </td>
                                            </tr>
                                          </>
                                        );
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                          {(activeChallenge.fase === 3 || activeChallenge.fase === 4 || activeChallenge.fase === 5) &&
                            phase3Tab === "ponto" && (
                              <div className="bg-slate-950/40 p-6 rounded-xl border border-white/5 font-mono text-sm animate-fade-in text-left mt-4 relative overflow-hidden">
                                <h4 className="text-accent-primary font-bold mb-1 border-b border-white/10 pb-2 uppercase tracking-wide flex items-center gap-2">
                                  <Clock className="w-4 h-4" /> ESPELHO DE PONTO MENSAL (CONTROLE DE FREQUÊNCIA)
                                </h4>
                                <p className="text-gray-400 text-xs mb-4">
                                  Registro de marcação diária de entrada e saída para apuração de faltas, atrasos e tempos adicionais (Sem valores monetários).
                                </p>

                                <div className="overflow-x-auto border border-white/10 rounded">
                                  <table className="w-full text-center text-xs">
                                    <thead className="bg-white/5 text-gray-400">
                                      <tr>
                                        <th className="p-2 text-left border-r border-white/5">Dia</th>
                                        <th className="p-2 border-r border-white/5">Entrada 1</th>
                                        <th className="p-2 border-r border-white/5">Saída 1</th>
                                        <th className="p-2 border-r border-white/5">Entrada 2</th>
                                        <th className="p-2 border-r border-white/5">Saída 2</th>
                                        <th className="p-2 border-r border-white/5">Horas Extras</th>
                                        <th className="p-2 text-left">Ocorrência</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5 text-gray-300">
                                      {(() => {
                                        const pointParams = getPointParamsForChallenge(activeChallenge);
                                        const pointList = gerarCartaoPonto(pointParams);

                                        const sumMinutes = (col: "extDiurna" | "extNoturna") => {
                                          let totMin = 0;
                                          pointList.forEach((p) => {
                                            const val = p[col];
                                            if (val && val !== "--:--") {
                                              const [h, m] = val.split(":").map(Number);
                                              totMin += h * 60 + m;
                                            }
                                          });
                                          const hrs = Math.floor(totMin / 60);
                                          const mins = totMin % 60;
                                          return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
                                        };

                                        const totalDiurna = sumMinutes("extDiurna");
                                        const totalNoturna = sumMinutes("extNoturna");
                                        const totalAbsences = pointList.filter(
                                          (p) => p.ocorrencia === "Falta Injustificada"
                                        ).length;

                                        return (
                                          <>
                                            {pointList.map((p, idx) => {
                                              const isFalta = p.ocorrencia === "Falta Injustificada";
                                              const isAtraso = p.ocorrencia.includes("Atraso");
                                              const hasExtrasVal = p.extDiurna !== "--:--" || p.extNoturna !== "--:--";

                                              let extraTimeStr = "--:--";
                                              if (p.extDiurna !== "--:--" && p.extNoturna === "--:--") {
                                                extraTimeStr = p.extDiurna;
                                              } else if (p.extNoturna !== "--:--" && p.extDiurna === "--:--") {
                                                extraTimeStr = `${p.extNoturna} (Not.)`;
                                              } else if (p.extDiurna !== "--:--" && p.extNoturna !== "--:--") {
                                                extraTimeStr = `${p.extDiurna} + ${p.extNoturna} (N)`;
                                              }

                                              let rowBg = "";
                                              if (isFalta) rowBg = "bg-rose-950/15";
                                              else if (hasExtrasVal) rowBg = "bg-emerald-950/15";
                                              else if (isAtraso) rowBg = "bg-amber-950/10";
                                              else if (
                                                p.ocorrencia.includes("Domingo") ||
                                                p.ocorrencia.includes("Sábado")
                                              )
                                                rowBg = "bg-slate-900/20";

                                              return (
                                                <tr
                                                  key={idx}
                                                  className={`${rowBg} hover:bg-white/5 transition-colors`}
                                                >
                                                  <td className="p-2 text-left font-bold border-r border-white/5">
                                                    {p.data}
                                                  </td>
                                                  <td className="p-2 border-r border-white/5">
                                                    {p.entrada1}
                                                  </td>
                                                  <td className="p-2 border-r border-white/5">
                                                    {p.saida1}
                                                  </td>
                                                  <td className="p-2 border-r border-white/5">
                                                    {p.entrada2}
                                                  </td>
                                                  <td className="p-2 border-r border-white/5">
                                                    {p.saida2}
                                                  </td>
                                                  <td className="p-2 text-emerald-400 border-r border-white/5 font-semibold">
                                                    {extraTimeStr}
                                                  </td>
                                                  <td
                                                    className={`p-2 text-[10px] text-left ${isFalta ? "text-rose-400 font-bold" : isAtraso ? "text-amber-400 font-bold" : "text-gray-400"}`}
                                                  >
                                                    {p.ocorrencia}
                                                  </td>
                                                </tr>
                                              );
                                            })}
                                            <tr className="bg-white/5 border-t border-white/10 font-bold text-gray-100 text-left">
                                              <td colSpan={5} className="p-3 text-right text-gray-400 border-r border-white/5">
                                                TOTAIS DE PERMANÊNCIA E FREQUÊNCIA:
                                              </td>
                                              <td className="p-3 text-emerald-400 text-center border-r border-white/5">
                                                {totalDiurna !== "00:00" || totalNoturna !== "00:00" ? (
                                                  <span className="flex flex-col text-[10px]">
                                                    <span>Diurna: {totalDiurna}</span>
                                                    {totalNoturna !== "00:00" && <span>Noturna: {totalNoturna}</span>}
                                                  </span>
                                                ) : (
                                                  "00:00"
                                                )}
                                              </td>
                                              <td className="p-3 text-amber-500 text-[10px] font-semibold font-mono">
                                                <div className="flex flex-col gap-1">
                                                  <span>Faltas Injustificadas: {totalAbsences}</span>
                                                  <span>Atrasos Acumulados: {pointParams.atrasos_minutos} min</span>
                                                </div>
                                              </td>
                                            </tr>
                                          </>
                                        );
                                      })()}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                          {(activeChallenge.fase === 3 || activeChallenge.fase === 4 || activeChallenge.fase === 5) &&
                            phase3Tab === "holerite" && (
                              <div className="bg-slate-900 border border-white/15 p-6 rounded-2xl animate-fade-in text-left mt-4 text-gray-100 space-y-6">
                                <div className="border-b border-white/15 pb-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div>
                                    <h3 className="text-lg font-sans font-black text-accent-primary uppercase tracking-wider flex items-center gap-2">
                                      <ReceiptText className="w-5 h-5 text-accent-primary" /> DEMONSTRATIVO DE PAGAMENTO (HOLERITE DE CRISRES)
                                    </h3>
                                    <p className="text-gray-400 text-xs text-sans">
                                      Preencha as rubricas de vencimentos e descontos do empregado com base na legislação e nas médias apuradas.
                                    </p>
                                  </div>
                                  <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-white/10 font-mono text-xs text-gray-300">
                                    <span className="text-gray-500">Mês Ref:</span> <span className="text-amber-400 font-bold">{getPointParamsForChallenge(activeChallenge).mes_referencia}</span>
                                  </div>
                                </div>

                                {/* Employee Banner info */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 bg-slate-950/60 p-4 rounded-xl border border-white/5 font-mono text-xs text-gray-300">
                                  <div>
                                    <span className="text-gray-500 block">Colaborador:</span>
                                    <span className="text-white font-bold">{activeChallenge.empregado.nome}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">Salário Contratual:</span>
                                    <span className="text-white font-bold">R$ {activeChallenge.empregado.salarioBase?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">Admissão:</span>
                                    <span className="text-white font-bold">{activeChallenge.empregado.dataAdmissao}</span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 block">Jornada Semanal:</span>
                                    <span className="text-white font-bold">{activeChallenge.empregado.jornada || "44 horas"}</span>
                                  </div>
                                </div>

                                {/* Form Layout */}
                                <form onSubmit={(e) => { e.preventDefault(); handleCheckTRCTWorksheet(); }} className="space-y-6">
                                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* 1. Proventos (Vencimentos) */}
                                    <div className="space-y-4">
                                      <div className="text-sm font-bold uppercase tracking-wider text-emerald-400 border-b border-emerald-500/20 pb-1.5 flex items-center justify-between">
                                        <span>Proventos (Vencimentos)</span>
                                        <span className="text-xs text-gray-500 font-mono lowercase">rubricas e valores de crédito</span>
                                      </div>

                                      <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5 space-y-3">
                                        {/* Row 1: Salário Proporcional & Média de Horas Extras */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">1. Salário Proporcional / Base</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.salario}
                                              onChange={(e) => handleInputChange("salario", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">2. Média Horas Extras</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.mediaHe}
                                              onChange={(e) => handleInputChange("mediaHe", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 2: Insalubridade & Periculosidade */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">3. Adicional Insalubridade</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.insalubridade}
                                              onChange={(e) => handleInputChange("insalubridade", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">4. Adicional Periculosidade</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.periculosidade}
                                              onChange={(e) => handleInputChange("periculosidade", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 3: Horas Extras do Mês & Adicional Noturno */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">5. Horas Extras do Mês (50%/100%)</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.horasExtras}
                                              onChange={(e) => handleInputChange("horasExtras", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">6. Adicional Noturno</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.adicionalNoturno}
                                              onChange={(e) => handleInputChange("adicionalNoturno", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 4: Comissões & Reflexo DSR s/ HE e Vars */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">7. Comissões / Prêmios</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.comissoes}
                                              onChange={(e) => handleInputChange("comissoes", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">8. Reflexos DSR s/ HE e Adic.</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.dsrHe}
                                              onChange={(e) => handleInputChange("dsrHe", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 5: Salário Família */}
                                        <div>
                                          <label className="block text-[11px] text-gray-400 mb-1 font-mono">9. Salário-Família</label>
                                          <input
                                            type="text"
                                            value={crisisInputs.salarioFamilia}
                                            onChange={(e) => handleInputChange("salarioFamilia", e.target.value)}
                                            placeholder="R$ 0,00"
                                            className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                          />
                                        </div>
                                      </div>
                                    </div>

                                    {/* 2. Descontos, Bases & FGTS */}
                                    <div className="space-y-4">
                                      <div className="text-sm font-bold uppercase tracking-wider text-rose-400 border-b border-rose-500/20 pb-1.5 flex items-center justify-between">
                                        <span>Descontos & Encargos</span>
                                        <span className="text-xs text-gray-500 font-mono lowercase">descontos legais e fgts</span>
                                      </div>

                                      <div className="bg-slate-950/20 p-4 rounded-xl border border-white/5 space-y-3">
                                        {/* Row 1: INSS & IRRF */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">10. Desconto INSS</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.inss}
                                              onChange={(e) => handleInputChange("inss", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">11. Desconto IRRF</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.irrf}
                                              onChange={(e) => handleInputChange("irrf", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 2: Vale-Transporte & Desconto Faltas & DSR perdidos */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">12. Desconto Vale-Transporte</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.vt}
                                              onChange={(e) => handleInputChange("vt", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">13. Desconto Faltas & DSR Perdidos</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.faltasDesconto}
                                              onChange={(e) => handleInputChange("faltasDesconto", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-rose-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                        </div>

                                        {/* Row 3: Base de Cálculo FGTS & Depósito FGTS (8%) */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-white/5">
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">14. Base de Cálculo do FGTS</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.baseFgts}
                                              onChange={(e) => handleInputChange("baseFgts", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                          <div>
                                            <label className="block text-[11px] text-gray-400 mb-1 font-mono">15. Depósito FGTS (8%)</label>
                                            <input
                                              type="text"
                                              value={crisisInputs.fgts}
                                              onChange={(e) => handleInputChange("fgts", e.target.value)}
                                              placeholder="R$ 0,00"
                                              className="w-full bg-slate-950 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-sky-300 focus:outline-none focus:ring-1 focus:ring-accent-primary"
                                            />
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Totals Summary */}
                                  <div className="bg-slate-950 border border-white/10 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center font-mono text-xs">
                                    <div className="space-y-1">
                                      <span className="text-gray-500 block text-[10px]">TOTAL CRÉDITOS (PROVENTOS):</span>
                                      <span className="text-emerald-400 text-sm font-bold">R$ {calcTotalVencimentos().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="space-y-1 border-y sm:border-y-0 sm:border-x border-white/10 py-2 sm:py-0">
                                      <span className="text-gray-500 block text-[10px]">TOTAL DEDUÇÕES (DESCONTOS):</span>
                                      <span className="text-rose-400 text-sm font-bold">R$ {calcTotalDescontos().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                    <div className="space-y-1">
                                      <span className="text-gray-500 block text-[10px]">VALOR LÍQUIDO A RECEBER:</span>
                                      <span className="text-white text-base font-black">R$ {calcNetLiquido().toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                    </div>
                                  </div>

                                  {/* Feedback messages */}
                                  {trctResultMsg && (
                                    <div className={`p-4 rounded-xl border text-xs leading-relaxed font-sans ${
                                      trctResultMsg.type === "success" 
                                        ? "bg-emerald-950/40 border-emerald-500/20 text-emerald-300 animate-pulse"
                                        : "bg-rose-950/40 border-rose-500/20 text-rose-300 whitespace-pre-wrap"
                                    }`}>
                                      {trctResultMsg.text}
                                    </div>
                                  )}

                                  {/* Success state - Show on-screen beautiful original physical Brazilian Holerite paystub */}
                                  {trctResultMsg && trctResultMsg.type === "success" && (() => {
                                    const gab = activeChallenge?.gabarito?.valoresCorretos;
                                    if (!gab) return null;

                                    const rubricsList = [];
                                    if (gab.salario > 0) {
                                      const refLabel = activeChallenge.id === "3.6" ? "15 Dias" : activeChallenge.id === "3.8" ? "04 Dias" : "30 Dias";
                                      rubricsList.push({ cod: "101", desc: "SALÁRIO BASE PROPORCIONAL", ref: refLabel, vencimento: gab.salario, desconto: 0 });
                                    }
                                    if (gab.mediaHe > 0) {
                                      rubricsList.push({ cod: "115", desc: "MÉDIA HORAS EXTRAS (12M)", ref: "Média", vencimento: gab.mediaHe, desconto: 0 });
                                    }
                                    if (gab.insalubridade > 0) {
                                      rubricsList.push({ cod: "135", desc: "ADICIONAL DE INSALUBRIDADE", ref: "40% s/ SM", vencimento: gab.insalubridade, desconto: 0 });
                                    }
                                    if (gab.periculosidade > 0) {
                                      rubricsList.push({ cod: "140", desc: "ADICIONAL DE PERICULOSIDADE", ref: "30.00%", vencimento: gab.periculosidade, desconto: 0 });
                                    }
                                    if (gab.horasExtras > 0) {
                                      rubricsList.push({ cod: "150", desc: "HORAS EXTRAS REALIZADAS", ref: "Apuradas", vencimento: gab.horasExtras, desconto: 0 });
                                    }
                                    if (gab.adicionalNoturno > 0) {
                                      rubricsList.push({ cod: "160", desc: "ADICIONAL NOTURNO (CLT)", ref: "20% Not.", vencimento: gab.adicionalNoturno, desconto: 0 });
                                    }
                                    if (gab.comissoes > 0) {
                                      rubricsList.push({ cod: "180", desc: "COMISSÕES S/ TAREFAS ACORDADAS", ref: "Comis.", vencimento: gab.comissoes, desconto: 0 });
                                    }
                                    if (gab.dsrHe > 0) {
                                      rubricsList.push({ cod: "190", desc: "REFLEXOS DSR S/ HE E VARIAVEIS", ref: "Lei 605", vencimento: gab.dsrHe, desconto: 0 });
                                    }
                                    if (gab.salarioFamilia > 0) {
                                      rubricsList.push({ cod: "210", desc: "SALÁRIO-FAMÍLIA (PREVIDÊNCIA)", ref: activeChallenge.id === "3.6" ? "3 Cotas" : "1 Cota", vencimento: gab.salarioFamilia, desconto: 0 });
                                    }
                                    if (gab.inss > 0) {
                                      rubricsList.push({ cod: "501", desc: "CONTRIBUIÇÃO PREVIDENCIÁRIA INSS", ref: `${((gab.inss / gab.bruto) * 100).toFixed(1)}%`, vencimento: 0, desconto: gab.inss });
                                    }
                                    if (gab.irrf > 0) {
                                      rubricsList.push({ cod: "502", desc: "IMPOSTO DE RENDA RETIDO IRRF", ref: "Tabela", vencimento: 0, desconto: gab.irrf });
                                    }
                                    if (gab.vt > 0) {
                                      rubricsList.push({ cod: "510", desc: "DESCONTO VALE-TRANSPORTE (LEI)", ref: "6.00%", vencimento: 0, desconto: gab.vt });
                                    }
                                    if (gab.faltasDesconto > 0) {
                                      rubricsList.push({ cod: "520", desc: "DESCONTO DE FALTAS E DSR PERDIDO", ref: "Dias/DSR", vencimento: 0, desconto: gab.faltasDesconto });
                                    }

                                    const padCount = Math.max(9 - rubricsList.length, 0);
                                    const paddedList = [
                                      ...rubricsList,
                                      ...Array(padCount).fill({ cod: "", desc: "", ref: "", vencimento: 0, desconto: 0 })
                                    ];

                                    const sumVencimentos = rubricsList.reduce((acc, current) => acc + current.vencimento, 0);
                                    const sumDescontos = rubricsList.reduce((acc, current) => acc + current.desconto, 0);
                                    const valLiquido = sumVencimentos - sumDescontos;

                                    return (
                                      <div className="bg-white border-2 border-slate-300 p-6 rounded-xl text-slate-900 font-sans shadow-lg max-w-4xl mx-auto space-y-4 overflow-hidden mt-4 relative animate-fade-in">
                                        <div className="absolute top-0 right-0 p-2 text-[8px] font-mono select-none text-slate-400 font-bold tracking-widest uppercase opacity-20 transform rotate-12">
                                          Original CLT Applet
                                        </div>
                                        <div className="flex justify-between items-center border-b border-slate-400 pb-3">
                                          <div>
                                            <h4 className="font-bold text-sm tracking-wide text-slate-900 uppercase">CRISRES Soluções Trabalhistas S/A</h4>
                                            <p className="text-[10px] text-slate-500 font-mono">CNPJ: 14.882.341/0001-02 | Rua da Consolidação, 1500 - São Paulo/SP</p>
                                          </div>
                                          <div className="text-right border-l-2 border-slate-300 pl-4 bg-slate-50 p-2 rounded">
                                            <span className="font-sans font-black block uppercase text-[11px] text-slate-800 tracking-wider">Recibo de Pagamento de Salário</span>
                                            <span className="text-[10px] font-mono text-slate-600">Referência: <strong className="text-slate-900 font-bold">{getPointParamsForChallenge(activeChallenge).mes_referencia}</strong></span>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-2 bg-slate-50 p-2.5 rounded border border-slate-200 text-[10px] text-slate-700">
                                          <div>
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">Cód.</span>
                                            <span className="font-bold text-slate-900 font-mono">000{activeChallenge.id.replace(".", "")}</span>
                                          </div>
                                          <div className="col-span-2">
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">Funcionário</span>
                                            <span className="font-bold text-slate-900 text-xs">{activeChallenge.empregado.nome}</span>
                                          </div>
                                          <div>
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">Admissão</span>
                                            <span className="font-bold text-slate-900 font-mono">{activeChallenge.empregado.dataAdmissao}</span>
                                          </div>
                                          <div className="col-span-2 border-t border-slate-200 pt-1.5">
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">Cargo</span>
                                            <span className="font-semibold text-slate-900">{activeChallenge.empregado.cbo.split(" (")[0]}</span>
                                          </div>
                                          <div className="border-t border-slate-200 pt-1.5">
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">CBO</span>
                                            <span className="font-mono text-slate-900">{activeChallenge.empregado.cbo.match(/\(([^)]+)\)/)?.[1] || "—"}</span>
                                          </div>
                                          <div className="border-t border-slate-200 pt-1.5">
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">Jornada</span>
                                            <span className="font-semibold text-slate-900">{activeChallenge.empregado.jornada || "44 horas"}</span>
                                          </div>
                                        </div>

                                        <div className="border border-slate-300 rounded overflow-hidden">
                                          <table className="w-full text-[11px] font-mono border-collapse">
                                            <thead>
                                              <tr className="bg-slate-100 text-[9px] font-sans font-extrabold uppercase border-b border-slate-300 text-slate-700 text-left">
                                                <th className="p-2 border-r border-slate-200 w-[10%] text-center">Cód</th>
                                                <th className="p-2 border-r border-slate-200 w-[45%]">Descrição</th>
                                                <th className="p-2 border-r border-slate-200 w-[15%] text-center">Referência</th>
                                                <th className="p-2 border-r border-slate-200 w-[15%] text-right pr-3">Vencimentos</th>
                                                <th className="p-2 w-[15%] text-right pr-3">Descontos</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-250 bg-white">
                                              {paddedList.map((row, idx) => (
                                                <tr key={idx} className="h-6 hover:bg-slate-50 transition-colors">
                                                  <td className="p-1 border-r border-slate-200 text-center text-slate-500 text-[10px]">{row.cod}</td>
                                                  <td className="p-1 border-r border-slate-200 text-slate-800 text-[10px] pl-2 font-sans font-medium">{row.desc}</td>
                                                  <td className="p-1 border-r border-slate-200 text-center text-slate-600 text-[10px]">{row.ref}</td>
                                                  <td className="p-1 border-r border-slate-200 text-right pr-3 text-emerald-700 font-semibold">{row.vencimento > 0 ? row.vencimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}</td>
                                                  <td className="p-1 text-right pr-3 text-rose-700 font-semibold">{row.desconto > 0 ? row.desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 text-center border-t border-slate-300 pt-4">
                                          <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">Total Proventos</span>
                                            <span className="text-emerald-700 font-bold font-mono text-xs">R$ {sumVencimentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                          </div>
                                          <div className="bg-slate-50 p-2 rounded border border-slate-200">
                                            <span className="text-[9px] text-slate-400 font-sans block uppercase font-bold">Total Descontos</span>
                                            <span className="text-rose-700 font-bold font-mono text-xs">R$ {sumDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                          </div>
                                          <div className="bg-emerald-50 p-2 rounded border border-emerald-200">
                                            <span className="text-[9px] text-emerald-600 font-sans block uppercase font-extrabold">Líquido a Receber</span>
                                            <span className="text-emerald-950 font-black font-mono text-sm">R$ {valLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                          </div>
                                        </div>

                                        <div className="grid grid-cols-4 gap-1 p-2 rounded border border-slate-200 bg-slate-50 font-mono text-[9px] text-slate-600 text-center select-none">
                                          <div>
                                            <span className="block text-[8px] text-slate-400 uppercase font-sans">Salário Contratual</span>
                                            <span className="font-semibold text-slate-700">R$ {activeChallenge.empregado.salarioBase?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                          </div>
                                          <div>
                                            <span className="block text-[8px] text-slate-400 uppercase font-sans">Base Contr. INSS</span>
                                            <span className="font-semibold text-slate-700">R$ {gab.baseFgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                          </div>
                                          <div>
                                            <span className="block text-[8px] text-slate-400 uppercase font-sans">Base Cálc. FGTS</span>
                                            <span className="font-semibold text-slate-700">R$ {gab.baseFgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                          </div>
                                          <div>
                                            <span className="block text-[8px] text-slate-400 uppercase font-sans">FGTS do Mês (8%)</span>
                                            <span className="font-bold text-slate-900">R$ {gab.fgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                          </div>
                                        </div>

                                        <div className="border-t border-dashed border-slate-300 pt-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-500">
                                          <div className="text-left leading-relaxed max-w-sm">
                                            <p className="font-bold text-slate-700">VALOR JURÍDICO RECONHECIDO</p>
                                            <p className="text-[9px]">Declaro ter recebido a importância líquida discriminada neste recibo de pagamento.</p>
                                          </div>
                                          <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-200 pl-4 pt-2 sm:pt-0">
                                            <p className="font-mono text-slate-700">___/___/______   ____________________________________</p>
                                            <p className="text-[8px] uppercase tracking-wider text-center mr-6">Data & Assinatura do Funcionário</p>
                                          </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2 print:hidden w-full sm:w-auto">
                                          <button
                                            type="button"
                                            onClick={() => window.print()}
                                            className="bg-slate-900 hover:bg-slate-800 text-white font-sans font-bold text-xs uppercase px-4 py-2.5 rounded-lg border border-slate-700 cursor-pointer transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
                                          >
                                            <Printer className="w-4 h-4 text-sky-400" /> {appLanguage === "en" ? "Browser Print Layout" : "Impressão Manual"}
                                          </button>

                                          <button
                                            type="button"
                                            onClick={() => exportTRCTToPDF(activeChallenge, appLanguage)}
                                            className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-xs uppercase px-5 py-2.5 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(16,185,129,0.2)] active:scale-95"
                                          >
                                            <FileDown className="w-4 h-4 text-slate-950 animate-pulse" /> {appLanguage === "en" ? "Download Official PDF" : "Exportar DF / TRCT em PDF"}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })()}

                                  {/* Submit & Autofill Actions bar */}
                                  <div className="flex flex-col sm:flex-row justify-between items-center pt-4 gap-4 border-t border-white/5">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const gab = activeChallenge?.gabarito?.valoresCorretos;
                                        if (gab) {
                                          setCrisisInputs({
                                            salario: gab.salario?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            mediaHe: gab.mediaHe?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            insalubridade: gab.insalubridade?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            periculosidade: gab.periculosidade?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            horasExtras: gab.horasExtras?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            adicionalNoturno: gab.adicionalNoturno?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            comissoes: gab.comissoes?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            dsrHe: gab.dsrHe?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            inss: gab.inss?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            irrf: gab.irrf?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            vt: gab.vt?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            faltasDesconto: gab.faltasDesconto?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            salarioFamilia: gab.salarioFamilia?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            baseFgts: gab.baseFgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                            fgts: gab.fgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) || "",
                                          });
                                          setTrctResultMsg(null);
                                        }
                                      }}
                                      className="border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white font-sans font-bold text-[11px] uppercase px-4 py-2.5 rounded-lg cursor-pointer transition-all flex items-center gap-1.5 w-full sm:w-auto justify-center"
                                    >
                                      Preencher Valores Originais
                                    </button>

                                    <button
                                      type="submit"
                                      className="bg-accent-primary hover:bg-opacity-80 text-slate-950 font-sans font-bold text-xs uppercase px-6 py-3 rounded-lg cursor-pointer transition-all flex items-center gap-2 shadow-[0_4px_12px_rgba(var(--accent-primary-rgb),0.2)] w-full sm:w-auto justify-center active:scale-95"
                                    >
                                      <Calculator className="w-4 h-4" /> Validar Apuração de Holerite (15 Variáveis)
                                    </button>
                                  </div>
                                </form>
                              </div>
                            )}

                          {(activeChallenge.fase === 3 || activeChallenge.fase === 4 || activeChallenge.fase === 5) &&
                            phase3Tab === "atestados" && (
                              <div className="animate-fade-in mt-4">
                                {activeChallenge.empregado.detalhesAtestado ? (
                                  <div className="bg-slate-50 p-6 rounded-xl border border-gray-300 font-sans text-slate-800 shadow-[inset_0_0_20px_rgba(0,0,0,0.05)] max-w-2xl mx-auto transform -rotate-1 hover:rotate-0 transition-transform">
                                    {/* Realistic medical certificate render */}
                                    <div className="border-b-2 border-slate-800 pb-4 mb-4 flex justify-between items-end">
                                      <div className="text-left">
                                        <h2 className="text-2xl font-bold uppercase tracking-wide text-slate-900 border-b-2 border-slate-800 inline-block pb-1">
                                          Atestado Médico
                                        </h2>
                                        <p className="text-xs font-semibold mt-1">
                                          Clínica Medicina & Saúde Ocupacional
                                        </p>
                                      </div>
                                      <div className="text-right">
                                        <p className="text-xs font-bold text-slate-700">
                                          CRM:{" "}
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.crm
                                          }
                                        </p>
                                        <p className="text-xs text-slate-600">
                                          Dr(a).{" "}
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.medico
                                          }
                                        </p>
                                      </div>
                                    </div>
                                    <div className="space-y-6 text-sm leading-relaxed my-8 text-left">
                                      <p className="indent-8">
                                        Atesto para os devidos fins que o(a)
                                        paciente{" "}
                                        <strong>
                                          {activeChallenge.empregado.nome}
                                        </strong>{" "}
                                        foi submetido(a) a exame clínico nesta
                                        data e necessita de{" "}
                                        <strong>
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.diasAfastados
                                          }{" "}
                                          dia(s)
                                        </strong>{" "}
                                        de afastamento de suas atividades
                                        laborais por motivos de saúde.
                                      </p>
                                      <p className="font-bold flex items-center gap-2">
                                        CID-10 Autodeclarado:{" "}
                                        <span className="border-b border-slate-400 w-32 inline-block text-center text-rose-800">
                                          {
                                            activeChallenge.empregado
                                              .detalhesAtestado.cid
                                          }
                                        </span>
                                      </p>
                                    </div>
                                    <div className="pt-16 pb-4 flex flex-col items-center border-t border-dashed border-slate-300">
                                      <div className="text-slate-400 text-[10px] mb-2 italic">
                                        Apenas assinatura eletrônica / Carimbo
                                        físico omitido na digitalização
                                      </div>
                                      <div className="border-t border-slate-800 w-64 pt-2 text-center text-xs font-bold">
                                        Dr(a).{" "}
                                        {
                                          activeChallenge.empregado
                                            .detalhesAtestado.medico
                                        }{" "}
                                        - Assinatura
                                      </div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="bg-slate-950/20 p-8 rounded-xl flex flex-col items-center justify-center text-gray-500 font-mono space-y-3">
                                    <span className="text-4xl opacity-40">
                                      📝
                                    </span>
                                    <span className="text-sm">
                                      Nenhum atestado médico ou documento
                                      pericial anexado a esta ocorrência no
                                      sistema.
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                          {/* ACTION BUTTONS: EXTRAS */}
                          <div className="border-t border-white/5 pt-4 flex flex-col md:flex-row gap-2 justify-between items-center text-xs font-mono">
                            <div className="flex gap-2">
                              {/* Validation tools CRM and dental */}
                              {activeChallenge.empregado.detalhesAtestado && (
                                <button
                                  id="validate-crm-action-btn"
                                  type="button"
                                  disabled={!isCrmCheckUnlocked}
                                  onClick={() => {
                                    if (
                                      activeChallenge.empregado.detalhesAtestado
                                    ) {
                                      setActiveCrmCheck({
                                        medico:
                                          activeChallenge.empregado
                                            .detalhesAtestado.medico,
                                        crm: activeChallenge.empregado
                                          .detalhesAtestado.crm,
                                      });
                                    }
                                  }}
                                  className={`py-1.5 px-3 rounded-lg border text-[11px] font-bold cursor-pointer transition-all flex items-center gap-1.5 ${
                                    isCrmCheckUnlocked
                                      ? "bg-indigo-950/40 hover:bg-indigo-900/40 border-accent-primary/30 text-accent-primary"
                                      : "bg-slate-950 border-white/5 text-gray-500 cursor-not-allowed"
                                  }`}
                                >
                                  <Search className="w-3.5 h-3.5" />
                                  {isCrmCheckUnlocked
                                    ? "Validar CRM Médico"
                                    : "CRM Travado - Use após Bloco B"}
                                </button>
                              )}
                            </div>

                            {/* Completed Status badge */}
                            {completedChallenges.includes(
                              activeChallenge.id,
                            ) && (
                              <div className="text-emerald-400 font-bold flex items-center gap-1 animate-pulse select-none">
                                <CheckCircle2 className="w-4 h-4" />{" "}
                                {appLanguage === "en"
                                  ? "Challenge Completed!"
                                  : "Desafio Concluído!"}
                              </div>
                            )}
                          </div>

                          {/* BOTTOM NAVIGATION BUTTONS */}
                          <div className="sticky bottom-0 left-0 right-0 z-30 border-t border-white/10 bg-slate-950/98 backdrop-blur-lg p-3 sm:p-4 shadow-[0_-12px_45px_rgba(0,0,0,0.85)] -mx-4 sm:-mx-6 -mb-4 sm:-mb-6 rounded-b-2xl mt-6">
                            <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-4xl mx-auto">
                              {/* Previous Button */}
                              <button
                                id="bottom-prev-challenge-btn"
                                onClick={selectPreviousChallenge}
                                className="flex-shrink-0 px-3 sm:px-4 h-[44px] text-[10px] sm:text-xs font-sans font-black uppercase text-accent-primary hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-white/10 bg-slate-900/90 hover:bg-slate-800 shadow-lg active:scale-95 hover:border-accent-primary/50 touch-manipulation"
                                title={appLanguage === "en" ? "Previous" : "Anterior"}
                              >
                                <ChevronLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">{appLanguage === "en" ? "Anterior" : "Anterior"}</span>
                              </button>

                              {/* Center: Counter and Submit Action */}
                              <div className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-6">
                                {/* Discrete Counter */}
                                <div className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-[0.2em] flex items-center gap-2 opacity-80 order-2 sm:order-1">
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                  {phaseChallenges.findIndex((c) => c.id === selectedChallengeId) + 1} / {phaseChallenges.length}
                                  <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
                                </div>

                                {/* Central Submit Button */}
                                {!(activeChallenge.fase === 3 && phase3Tab === "holerite") && activeChallenge.fase !== 5 && (
                                  <button
                                    id="footer-mcq-submit-btn"
                                    type="button"
                                    onClick={handleCheckChallengeMCQ}
                                    disabled={!selectedOptionId || isAlreadyAttempted}
                                    className="w-full sm:w-auto min-w-[180px] sm:min-w-[220px] h-[44px] bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-black text-[11px] sm:text-xs uppercase px-8 rounded-xl shadow-xl transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:scale-102 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 order-1 sm:order-2"
                                  >
                                    <ShieldCheck className="w-4 h-4" />
                                    {isAlreadyAttempted
                                      ? (appLanguage === "en" ? "Caso Encerrado" : "Caso Encerrado")
                                      : (appLanguage === "en" ? "Validar Diagnóstico" : "Validar Diagnóstico")}
                                  </button>
                                )}
                              </div>

                              {/* Next Button */}
                              <button
                                id="bottom-next-challenge-btn"
                                onClick={selectNextChallenge}
                                className="flex-shrink-0 px-3 sm:px-4 h-[44px] text-[10px] sm:text-xs font-sans font-black uppercase text-accent-primary hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer rounded-xl border border-white/10 bg-slate-900/90 hover:bg-slate-800 shadow-lg active:scale-95 hover:border-accent-primary/50 touch-manipulation"
                                title={appLanguage === "en" ? "Next" : "Próximo"}
                              >
                                <span className="hidden sm:inline">{appLanguage === "en" ? "Próximo" : "Próximo"}</span>
                                <ChevronRight className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                    </>
                  )}
                </div>

                {/* Right sidebar: Interactive manual calculator */}
                <div className="space-y-4">
                  {selectedPhaseId >= 2 ? (
                    <ManualCalculator />
                  ) : (
                    <div className="glass-panel p-4 rounded-xl border border-white/10 text-center text-text-secondary italic font-mono text-xs">
                      <Lock className="w-4 h-4 mx-auto mb-2" />
                      Calculadora disponível na Fase 2
                    </div>
                  )}

                  <InteractiveCalendar />

                  {/* Career overview visual progress box */}
                  <div className="glass-panel p-5 rounded-xl border border-white/5 space-y-3 font-sans text-xs">
                    <h3 className="font-sans font-bold text-gray-200 uppercase tracking-wider block text-left">
                      Progresso do Cargo
                    </h3>
                    <div className="space-y-2 text-left text-text-secondary font-mono">
                      <div className="flex justify-between">
                        <span>Fases Concluídas:</span>
                        <span className="text-gray-300 font-bold">
                          {activeStudent.faseAtual} / 7
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Desafios Concluídos:</span>
                        <span className="text-gray-300 font-bold">
                          {completedChallenges.length} /{" "}
                          {allChallenges.length}
                        </span>
                      </div>
                      <div className="w-full bg-slate-950 text-xs h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-accent-primary h-full"
                          style={{
                            width: `${(completedChallenges.length / allChallenges.length) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* Plano de Progressão de Cargos (Career Progress) nested inside challenges tab */}
              <div className="border-t border-white/5 pt-6 mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🎖️</span>
                  <h2 className="text-sm font-sans font-extrabold text-gray-100 uppercase tracking-widest">
                    {appLanguage === "en" ? "Position Progression Plan" : "Plano de Progressão de Cargos"}
                  </h2>
                </div>
                <CareerProgress
                  currentPhaseId={selectedPhaseId}
                  unlockedPhases={unlockedPhasesList}
                  student={activeStudent}
                  onSelectPhase={(phaseId) => setSelectedPhaseId(phaseId)}
                  completedChallengesCount={completedChallenges.length}
                />
              </div>
            </div>
          )}

            {currentTab === "metrics" && activeStudent && (
              <StudentMetricsTab
                students={students}
                activeStudent={activeStudent}
                onUpdateSimulationTime={handleUpdateSimulationTime}
              />
            )}

            {currentTab === "desempenho" && activeStudent && (
              <DesempenhoPessoal
                activeStudent={activeStudent}
                students={students}
              />
            )}

            {currentTab === "badges" && activeStudent && (
              <BadgesTab
                activeStudent={activeStudent}
                appLanguage={appLanguage}
              />
            )}

            {currentTab === "sandbox" && <SandboxMode />}

            {currentTab === "linguajar" && (
              <LinguajarTranslator
                appLanguage={appLanguage}
                onChangeLanguage={(lang) => {
                  setAppLanguage(lang);
                }}
              />
            )}

            {currentTab === "feedback" && activeStudent && (
              <div className="space-y-6 animate-fade-in text-left">
                {/* Header card with developer instructions & external links */}
                <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-slate-900/40 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-emerald-500/10 px-3 py-1 text-[10px] rounded-bl text-emerald-400 font-bold uppercase tracking-wider font-mono">
                    ÁREA DE SINALIZAÇÃO DE BUGS
                  </div>
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-sans font-black text-gray-100 tracking-tight flex items-center gap-2">
                        <span>🧪</span> Portal do Veterano Homologador
                      </h2>
                      <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
                        Bem-vindo ao canal oficial de auditoria técnica. Como veterano testador, seu papel é fundamental para mapear bugs matemáticos e de layout. Registre suas observações abaixo.
                      </p>
                    </div>

                    {/* External Testing Link */}
                    <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex flex-col items-center gap-2 text-center md:max-w-xs font-mono">
                      <span className="text-[10px] text-accent-warning uppercase font-bold tracking-wider">
                        🔗 Formulário de Testes Externos
                      </span>
                      <a
                        href="https://forms.gle/testes-externos-worksim"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-1.5 rounded font-sans font-bold text-xs uppercase tracking-wide transition-all shadow-md inline-block cursor-pointer"
                      >
                        Acessar Google Forms
                      </a>
                      <p className="text-[9px] text-gray-400 leading-normal max-w-[200px]">
                        Link curto oficial para feedbacks externos. Em caso de instabilidade, utilize o seletor SMTP automático abaixo.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Form and Simulator */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
                  
                  {/* Form Card (2 Columns) */}
                  <div id="veteran-bug-form-card" className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-white/5 space-y-6">
                    <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                      <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wider flex items-center gap-2">
                        <span>📝</span> Disparar Relatório Automático
                      </h3>
                      <span className="text-[10.5px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-2.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">
                        Destinatário: fabiosantanalima01@gmail.com
                      </span>
                    </div>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        const card = document.getElementById("veteran-bug-form-card");
                        if (!card) return;
                        
                        const categorySelect = card.querySelector("#feedback-type") as HTMLSelectElement;
                        const textInput = card.querySelector("#feedback-desc") as HTMLTextAreaElement;
                        
                        if (!textInput || !textInput.value.trim()) {
                          alert("Por favor, descreva as observações técnicas do bug.");
                          return;
                        }

                        // Call send handler
                        const category = categorySelect?.value || "Feedback Geral / Bug";
                        const desc = textInput.value.trim();

                        setConfirmModal({
                          isOpen: true,
                          title: "Confirmar Envio",
                          description: `Você tem certeza de que deseja enviar este relatório na categoria "${category}"? O feedback será registrado e encaminhado imediatamente para homologação.`,
                          onConfirm: () => {
                            // Create feedback entry
                            const newId = `fb-${Date.now()}`;
                            const newFb = {
                              id: newId,
                              veteranName: activeStudent.nomeCompleto,
                              veteranUser: activeStudent.matricula,
                              category: category,
                              text: desc,
                              timestamp: new Date().toLocaleString("pt-BR"),
                              emailTo: "fabiosantanalima01@gmail.com",
                              status: "Não Lido"
                            };

                            handleSetVeteranFeedbacks(prev => [newFb, ...prev]);

                            // Add to active chat messages of student to simulate system email dispatch
                            const sysAlertId = `alert-${Date.now()}`;
                            setStudents(prev => prev.map(s => {
                              if (s.id === activeStudent.id) {
                                return {
                                  ...s,
                                  mensagensChat: [
                                    ...(s.mensagensChat || []),
                                    {
                                      id: sysAlertId,
                                      remetente: "Sistema",
                                      texto: `📧 [EMAIL ENVIADO] Relatório de homologação enviado com sucesso para fabiosantanalima01@gmail.com. Assunto: [${category}]`,
                                      timestamp: new Date().toLocaleTimeString("pt-BR")
                                    }
                                  ]
                                };
                              }
                              return s;
                            }));

                            // Show quick layout confirmation dialog
                            const toast = document.createElement("div");
                            toast.className = "fixed bottom-5 right-5 z-[20000] bg-emerald-500 text-slate-950 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce transition-all font-sans font-black border border-emerald-400 text-xs";
                            toast.innerHTML = `
                              <span>✓ Email enviado de forma automática para fabiosantanalima01@gmail.com!</span>
                            `;
                            document.body.appendChild(toast);
                            setTimeout(() => {
                              toast.remove();
                            }, 4000);

                            // Reset text input
                            textInput.value = "";
                          }
                        });
                      }}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-mono font-bold mb-1.5">
                            Seu Nome (Veterano):
                          </label>
                          <input
                            type="text"
                            disabled
                            value={activeStudent.nomeCompleto}
                            className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3.5 py-2 text-xs font-mono text-gray-300 opacity-60"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-mono font-bold mb-1.5">
                            Matrícula Acadêmica / Usuário:
                          </label>
                          <input
                            type="text"
                            disabled
                            value={activeStudent.matricula}
                            className="w-full bg-slate-950/50 border border-white/5 rounded-lg px-3.5 py-2 text-xs font-mono text-gray-300 opacity-60"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-mono font-bold mb-1.5">
                          Categoria da Ocorrência Técnica:
                        </label>
                        <select
                          id="feedback-type"
                          className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-sans text-gray-200 cursor-pointer focus:outline-none focus:border-emerald-500 bg-slate-900"
                        >
                          <option value="Bug de Layout / Visual">Bug de Layout / Visual</option>
                          <option value="Erro nos cálculos matemáticos do Holerite (Fase 3)">Erro nos cálculos matemáticos do Holerite (Fase 3)</option>
                          <option value="Problema de tolerância e cansaço / foco">Problema de tolerância e cansaço / foco</option>
                          <option value="Instruções ambíguas no roteiro CLT">Instruções ambíguas no roteiro CLT</option>
                          <option value="Sugestões de novas rotinas ou fases">Sugestões de novas rotinas ou fases</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] text-text-secondary uppercase tracking-wider block font-mono font-bold mb-1.5">
                          Descrição detalhada do Bug / Comentários Técnicos:
                        </label>
                        <textarea
                          id="feedback-desc"
                          rows={5}
                          required
                          placeholder="Ex: Verifiquei que ao responder o desafio CLT sobre adiantamento salarial na fase 3, o botão de enviar relatórios demorou..."
                          className="w-full bg-slate-950/30 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-650 focus:outline-none focus:border-emerald-500 font-sans leading-relaxed"
                        />
                      </div>

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className="bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-sans font-bold text-xs uppercase px-5 py-2.5 rounded-xl cursor-pointer hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2 font-black"
                        >
                          <Send className="w-4 h-4" /> Enviar Relatório via Intranet SMTP
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* History Sidebar */}
                  <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
                    <h3 className="text-xs font-sans font-bold text-gray-200 uppercase tracking-wider border-b border-white/5 pb-2">
                      📋 Meus Envíos de Feedback
                    </h3>

                    {/* Filter Dropdown */}
                    <div className="flex flex-col gap-1.5 bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                      <label htmlFor="veteran-feedback-filter-select" className="text-[9.5px] text-text-secondary uppercase tracking-wider font-mono font-bold">
                        Filtrar por Status:
                      </label>
                      <select
                        id="veteran-feedback-filter-select"
                        value={veteranFeedbackFilter}
                        onChange={(e) => setVeteranFeedbackFilter(e.target.value)}
                        className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-emerald-500 font-sans cursor-pointer"
                      >
                        <option value="Todos">Todos os Status</option>
                        <option value="Não Lido">Não Lido ✉️</option>
                        <option value="Lido">Lido 📖</option>
                        <option value="Resolvido">Resolvido ✅</option>
                      </select>
                    </div>
                    
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                      {(() => {
                        const myFeedbacks = veteranFeedbacks.filter(
                          (fb: any) => fb.veteranUser === activeStudent.matricula
                        );
                        
                        const filteredFeedbacks = myFeedbacks.filter((fb: any) => {
                          const statusVal = fb.status || "Não Lido";
                          if (veteranFeedbackFilter === "Todos") return true;
                          return statusVal === veteranFeedbackFilter;
                        });
                        
                        if (filteredFeedbacks.length === 0) {
                          return (
                            <div className="py-8 text-center text-[10px] text-text-secondary border border-dashed border-white/5 rounded-xl font-mono">
                              {myFeedbacks.length === 0
                                ? "Nenhum feedback registrado por você nesta sessão ainda."
                                : `Nenhum feedback com status "${veteranFeedbackFilter}" encontrado.`}
                            </div>
                          );
                        }

                        return filteredFeedbacks.map((fb: any, index: number) => {
                          const statusVal = fb.status || "Não Lido";
                          return (
                            <div key={fb.id || index} className="p-3 bg-slate-950/45 border border-white/5 rounded-xl text-[11px] font-mono select-none text-left">
                              <div className="flex justify-between items-center mb-1.5 flex-wrap gap-1">
                                <span className="text-[9px] bg-emerald-500/10 text-emerald-450 px-1.5 py-0.2 rounded font-sans font-bold">
                                  {fb.category.length > 15 ? `${fb.category.substring(0, 15)}...` : fb.category}
                                </span>
                                <span className="text-[8.5px] text-gray-500">{fb.timestamp}</span>
                              </div>
                              <p className="text-gray-300 italic line-clamp-3 text-[10.5px] mb-1 leading-relaxed">
                                "{fb.text}"
                              </p>
                              <div className="border-t border-white/5 pt-1 mt-1 flex justify-between text-[8px] items-center text-text-secondary flex-wrap gap-1">
                                <span>Para: fabiosantanalima01@gmail.com</span>
                                <div>
                                  {statusVal === "Resolvido" ? (
                                    <span className="text-emerald-400 font-bold flex items-center gap-0.5">
                                      Resolvido ✅
                                    </span>
                                  ) : statusVal === "Lido" ? (
                                    <span className="text-sky-400 font-bold flex items-center gap-0.5">
                                      Lido 📖
                                    </span>
                                  ) : (
                                    <span className="text-amber-500 font-bold flex items-center gap-0.5">
                                      Não Lido ✉️
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>

                    <div className="p-3 bg-orange-500/5 border border-orange-500/15 rounded-xl space-y-1.5 font-mono text-[9.5px] text-amber-500">
                      <span className="font-bold flex items-center gap-1">
                        ⚠️ AUDITORIA INTEGRADA:
                      </span>
                      <p className="leading-relaxed">
                        Seus envios internos caem instantaneamente na caixa "Feedbacks de Veteranos" do Professor/Monitoria, simulando mail-sending SMTP direto na plataforma.
                      </p>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {currentTab === "ranking" && (
              <RankingTab
                students={students}
                setStudents={setStudents}
                activeStudentId={activeStudentId}
                isProfessorOrAdmin={isProfessorOrAdmin}
              />
            )}

            {currentTab === "tournament" && (
              <TournamentTab
                localStudents={students}
                appLanguage={appLanguage}
                onSelectChallenge={(challengeId, phaseId) => {
                  setSelectedPhaseId(phaseId);
                  setSelectedChallengeId(challengeId);
                  setCurrentTab("challenges");
                  playSoundEffect("bip");
                }}
              />
            )}

            {currentTab === "sandbox" && <SandboxMode />}

            {currentTab === "professor" && isProfessorOrAdmin && (
              <ProfessorCockpit
                students={students}
                appLanguage={appLanguage}
                onAddStudents={handleAddStudentsFromOCR}
                onDeleteAllStudents={handleDeleteAllStudents}
                onSyncAllStudents={handleSyncAllStudents}
                onDeleteStudents={handleDeleteStudents}
                onUnlockSquad={handleUnlockSquadMachine}
                onPromoteStudent={handlePromoteStudent}
                onOpenChat={openChat}
                onResetStudentFocus={handleResetStudentFocus}
                onAnswerDoubt={handleAnswerDoubt}
                onResetDoubtCounter={handleResetDoubtCounter}
                veteranFeedbacks={veteranFeedbacks}
                onSetVeteranFeedbacks={handleSetVeteranFeedbacks}
                customChallenges={customChallenges}
                onSendCustomScenario={handleAddCustomChallengeByProfessor}
                onUpdateStudent={handleUpdateStudent}
                squadLogs={squadLogs}
                onAssignSquad={handleAssignSquad}
                onRemoveSquad={handleRemoveSquad}
                chatNotifications={chatNotifications}
                onSendMessage={handleSendChatMessage}
                themeMode={themeMode}
              />
            )}
          </main>

      {/* CONFIRMATION MODAL ("Tem certeza?") */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[10005] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-2xl p-6 space-y-6 shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <span className="text-xl">⚠️</span>
              <h2 className="text-sm font-sans font-black text-gray-100 uppercase tracking-widest">
                {confirmModal.title}
              </h2>
            </div>
            
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              {confirmModal.description}
            </p>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 hover:bg-white/5 text-gray-400 hover:text-white rounded-xl text-xs font-sans font-semibold transition-all uppercase cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal((prev) => ({ ...prev, isOpen: false }));
                }}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 rounded-xl text-xs font-sans font-black uppercase transition-all hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUTO PROMOTION & CELEBRATORY HIRING MODAL */}
      {showHiringModal && (
        <HiringModal
          student={activeStudent}
          onPromote={() => {
            if (activeStudent) {
              handlePromoteStudent(activeStudent.id, 1);
              setSelectedPhaseId(1);
              const nextPhaseChallenges = allChallenges.filter((c) => c.fase === 1);
              if (nextPhaseChallenges.length > 0) {
                setSelectedChallengeId(nextPhaseChallenges[0].id);
              } else {
                setSelectedChallengeId(null);
              }
              resetChallengeStates();
              setShowHiringModal(false);
            }
          }}
        />
      )}

      {/* PAUSE OVERLAY (BANHEIRO) */}
      {onboardingFinished && activeStudent && activeStudent.pausaAtiva === "banheiro" && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-indigo-500/30 rounded-2xl p-6 text-center space-y-6 shadow-[0_0_50px_rgba(99,102,241,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 flex items-center justify-center border border-indigo-500/30 text-indigo-400">
                <span className="text-3xl">🚽</span>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-sans font-black text-indigo-300 uppercase tracking-wide">
                Pausa para Banheiro Ativa
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                Seu tempo ativo de treinamento e o timer de ociosidade estão <strong className="text-indigo-400 font-bold">congelados com segurança</strong>. Nenhuma punição de ociosidade será aplicada enquanto você estiver fora de sua estação.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-white/5 font-mono text-[11.5px] text-gray-400 text-left space-y-1">
              <p>● Aluno: <strong className="text-white">{activeStudent.nomeCompleto}</strong></p>
              <p>● Limite Sanitário: <strong className="text-indigo-400">{activeStudent.pausasBanheiroUsadas} / 3 utilizadas</strong></p>
              <p>● Status: <strong className="text-emerald-400">Ambiente de DP Congelado</strong></p>
            </div>
            <button
              type="button"
              onClick={handleCancelPause}
              className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-sans font-bold text-xs uppercase py-3 rounded-xl cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.3)] font-sans"
            >
              Retornar ao Trabalho
            </button>
          </div>
        </div>
      )}

      {/* PAUSE OVERLAY (DÚVIDA) */}
      {onboardingFinished && activeStudent && activeStudent.pausaAtiva === "duvida" && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-6 shadow-[0_0_50px_rgba(16,185,129,0.2)] animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center animate-pulse">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30 text-emerald-400">
                <span className="text-3xl">❓</span>
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-sans font-black text-emerald-300 uppercase tracking-wide">
                Sua Dúvida foi Disparada!
              </h2>
              <p className="text-xs text-text-secondary leading-relaxed">
                A estação de trabalho está <strong className="text-emerald-400 font-bold">pausada com segurança</strong> sem interrupção de produtividade. Aguardando o Professor/Monitoria responder e aprovar sua dúvida técnica na mesa dele.
              </p>
            </div>
            <div className="bg-slate-950 p-4 rounded-xl border border-emerald-500/10 font-mono text-xs text-left space-y-2">
              <div className="text-[10px] text-emerald-400 uppercase tracking-wider pb-1 border-b border-white/5">
                Sua Pergunta Pendente:
              </div>
              <p className="text-gray-200 italic leading-relaxed text-[11.5px]">
                "{activeStudent.duvidaPendenteTexto}"
              </p>
            </div>
            <div className="space-y-2">
              <p className="text-[9.5px] text-gray-500 uppercase font-mono font-bold leading-none">Dúvidas mostram empenho e dão pontos extras de XP!</p>
              <button
                type="button"
                onClick={handleCancelPause}
                className="w-full bg-slate-800 hover:bg-slate-700 text-gray-350 font-sans font-bold text-xs uppercase py-2.5 rounded-xl cursor-pointer transition-all border border-white/5"
              >
                Desistir e Retomar Trabalho
              </button>
            </div>
          </div>
        </div>
      )}

      {/* POPUP DE DIGITAÇÃO DE DÚVIDA COM O PROFESSOR */}
      {showDoubtPopup && activeStudent && (
        <div className="fixed inset-0 z-[11000] bg-slate-950/80 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-emerald-500/30 rounded-2xl p-6 text-left space-y-5 shadow-[0_0_40px_rgba(16,185,129,0.15)] animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-start border-b border-white/5 pb-3">
              <div>
                <h3 className="text-md font-sans font-black text-emerald-400 uppercase tracking-wider">
                  🚶‍♂️ Dúvida Presencial (Física)
                </h3>
                <p className="text-[11px] text-text-secondary">
                  ATENÇÃO: Este modo congelará totalmente seu simulador. Você deve se levantar fisicamente e ir falar com o Professor/Monitoria na mesa dele.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDoubtPopup(false)}
                className="text-gray-500 hover:text-white text-xs uppercase font-bold font-mono bg-slate-950 px-2 py-1 rounded cursor-pointer"
              >
                Cancelar
              </button>
            </div>

            <div className="space-y-2 font-sans">
              <label htmlFor="doubt-textarea-input" className="text-[10px] text-emerald-400 uppercase font-mono block">Qual o seu impasse trabalhista legal?</label>
              <textarea
                id="doubt-textarea-input"
                rows={3}
                placeholder="Exemplo: Professor/Monitoria, na Fase 3, como calculamos o desconto do DSR sobre as faltas injustificadas considerando a convenção coletiva?"
                value={doubtTextValue}
                onChange={(e) => setDoubtTextValue(e.target.value)}
                className="w-full bg-slate-950 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-gray-650 focus:outline-none focus:border-emerald-500 resize-none font-sans"
              />
            </div>

            <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 font-mono text-[9px] text-gray-400 space-y-1">
              <p>● **PAUSA PRESENCIAL**: Ao confirmar, levante-se e dirija-se à mesa do professor.</p>
              <p>● **Sem Penalidades**: Seu tempo operacional e contadores de ociosidade ficam <span className="text-emerald-400 font-bold">100% PAUSADOS</span>.</p>
              <p>● **Alternativa**: Quer tirar dúvida sem congelar o seu simulador? Use o <span className="text-sky-450 font-bold">IntraChat Direto (Online)</span> de texto a partir do seu cockpit corporativo.</p>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleConfirmDoubtPause(doubtTextValue)}
                disabled={!doubtTextValue.trim()}
                className={`w-full font-sans font-bold text-xs uppercase py-3 rounded-xl cursor-pointer transition-all text-center ${
                  doubtTextValue.trim()
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                    : "bg-slate-850/50 text-gray-500 border border-white/5 cursor-not-allowed"
                }`}
              >
                Confirmar Pausa e ir ao Professor/Monitoria
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowDoubtPopup(false);
                  setIsStudentChatOpen(true);
                  playSoundEffect("success");
                }}
                className="w-full bg-sky-950/40 hover:bg-sky-900 border border-sky-500/20 text-sky-400 font-sans font-bold text-xs uppercase py-2.5 rounded-xl cursor-pointer transition-all text-center"
              >
                Prefiro abrir o IntraChat (Sem Pausa)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CELEBRAÇÃO DE STREAK DE AUTONOMIA */}
      {showStreakCelebration && (
        <div className="fixed inset-0 z-[12000] bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-6 shadow-[0_0_80px_rgba(245,158,11,0.25)] relative overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl" />

            <div className="space-y-2 relative z-10">
              <div className="flex justify-center -mt-4 animate-bounce">
                <span className="text-6xl text-amber-400">🔥🏆🔥</span>
              </div>
              <h2 className="text-2xl font-sans font-black text-amber-450 uppercase tracking-widest pt-2 leading-none">
                Streak de Produtividade Imperável!
              </h2>
              <p className="text-xs font-bold text-gray-250 uppercase font-mono">
                3 Fases Completas sem Erros ou Dúvidas!
              </p>
              <p className="text-xs text-text-secondary leading-relaxed pt-2">
                Seu desempenho teórico e autonomia atingiram o nível máximo sugerido pelo Professor/Monitoria. Você completou 3 fases seguidas com mais de <span className="text-amber-400 font-bold">95% de precisão técnica</span> e absoluto foco, sem pedir intervenções na mesa de apoio!
              </p>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-white/5 space-y-2 relative z-10">
              <div className="text-[10px] text-amber-550 font-mono uppercase tracking-wider">
                Prêmios de Autonomia CLT Disponibilizados:
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 text-left">● XP Dobrado nas Fases</span>
                <span className="text-emerald-400 font-bold">Incluso</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 text-left">● Bônus Especial de Streak</span>
                <span className="text-amber-400 font-bold">+250 XP</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowStreakCelebration(false)}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-sans font-black text-xs uppercase py-3.5 rounded-xl cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(245,158,11,0.4)] relative z-10"
            >
              Reivindicar Recompensa e Continuar
            </button>
          </div>
        </div>
      )}

      {/* CELEBRAÇÃO DE PROMOÇÃO DE FASE */}
      {completedPhaseTransition && (
        <AnimatePresence>
          <motion.div 
            id="phase-promotion-portal" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[12000] bg-slate-950/95 backdrop-blur-2xl flex items-center justify-center p-4 overflow-hidden"
          >
            <MatrixBackground />
            <motion.div 
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-md w-full bg-slate-900/90 border border-emerald-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-[0_0_80px_rgba(16,185,129,0.3)] relative overflow-hidden z-10"
            >
              {/* Cyberpunk ambient shadows */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl animate-pulse" />

              <div className="space-y-3 relative z-10">
                <div className="flex justify-center -mt-4 animate-bounce">
                  <span className="text-5xl filter drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">✨🏆✨</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1 rounded-full text-emerald-400 font-sans font-bold text-[10px] uppercase tracking-widest leading-none">
                  <Award className="w-3.5 h-3.5 animate-spin" />
                  {appLanguage === "en" ? "PROMOTION GRANTED!" : "PROMOÇÃO HOMOLOGADA!"}
                </div>
                <h2 className="text-xl font-sans font-black text-white uppercase tracking-tight leading-tight">
                  {appLanguage === "en" ? "Phase Completed!" : "Fase Concluída!"}
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto font-sans">
                  {appLanguage === "en" 
                    ? "Your legal audit operations and payroll parameters have been successfully promoted to the next level." 
                    : "Seu domínio técnico e conformidade com as regras do e-Social foram homologados com sucesso."}
                </p>
              </div>

              {/* Career track path visualization */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-4 relative z-10 text-left">
                <div className="flex items-center justify-between text-[11px] font-mono uppercase text-[#00E5FF] pb-2 border-b border-white/5">
                  <span>{appLanguage === "en" ? "PROGRESSION LOG" : "REGISTRO DE PROGRESSÃO"}</span>
                  <span className="text-emerald-400 font-bold">STATUS: OK</span>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div className="flex items-center justify-between gap-1">
                    <div className="space-y-0.5 max-w-[45%] text-left">
                      <span className="text-[9px] uppercase tracking-widest text-[#1D6D7F] font-mono font-bold block">{appLanguage === "en" ? "COMPLETED" : "CONCLUÍDO"}</span>
                      <strong className="text-gray-300 font-bold block truncate text-xs">
                        Fase {completedPhaseTransition.from}: {CAREER_PHASES.find(p => p.id === completedPhaseTransition.from)?.moduloTecnico || "-"}
                      </strong>
                    </div>
                    <ArrowRight className="w-4 h-4 text-emerald-400 flex-shrink-0 animate-pulse" />
                    <div className="space-y-0.5 max-w-[45%] text-right text-xs">
                      <span className="text-[9px] uppercase tracking-widest text-emerald-400 font-mono font-bold block">{appLanguage === "en" ? "NEXT LEVEL" : "PRÓXIMO NÍVEL"}</span>
                      <strong className="text-emerald-300 font-bold block truncate text-xs">
                        Fase {completedPhaseTransition.to}: {CAREER_PHASES.find(p => p.id === completedPhaseTransition.to)?.moduloTecnico || "-"}
                      </strong>
                    </div>
                  </div>

                  <div className="border-t border-white/5 pt-3 flex items-center justify-between">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-mono leading-none">{appLanguage === "en" ? "NEW CARGO ROLE" : "NOVO CARGO ADQUIRIDO:"}</span>
                    <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md py-0.5 px-2.5">
                      <Briefcase className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10px] font-sans text-emerald-350 uppercase font-black tracking-wide">
                        {CAREER_PHASES.find(p => p.id === completedPhaseTransition.to)?.cargo || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cheat Sheet Download Button in Celebration */}
              <button
                type="button"
                onClick={handleDownloadCheatSheet}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl transition-all cursor-pointer font-bold text-xs group"
                title={appLanguage === "en" ? "Download Explanatory Answer Key of all your errors so far (PDF)" : "Baixar Gabarito Explicativo de todos os seus erros até agora (PDF)"}
              >
                <FileDown className="w-4 h-4 group-hover:animate-bounce" />
                <span>{appLanguage === "en" ? "REVIEW GENERAL ERRORS (PDF)" : "REVISAR ERROS GERAIS (PDF)"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleSendCheatSheetEmail()}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all cursor-pointer font-bold text-xs group"
                title={appLanguage === "en" ? "Receive explanatory answer key of errors in your email" : "Receber gabarito explicativo dos erros no seu email"}
              >
                <Mail className="w-4 h-4 group-hover:scale-110" />
                <span>{appLanguage === "en" ? "SEND REVIEW TO EMAIL" : "ENVIAR REVISÃO PARA EMAIL"}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  playSoundEffect("success");
                  setCompletedPhaseTransition(null);
                }}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-sans font-black text-xs uppercase py-3.5 rounded-xl cursor-pointer transition-all hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] relative z-10 shadow-lg tracking-wider"
              >
                {appLanguage === "en" ? "Decline Promotion and Continue" : "Avançar de Fase & Assumir Novo Cargo"}
              </button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* INACTIVITY LOCKOVERLAY */}
      {isScreenBlocked && (
        <div
          id="inactivity-block-overlay"
          className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <MatrixBackground />
          <div className="relative z-10 max-w-md w-full bg-slate-900 border border-rose-500/30 rounded-2xl p-6 text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in duration-300">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center border border-rose-500/20 text-rose-500 animate-bounce">
                <AlertTriangle className="w-8 h-8" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="text-lg font-sans font-black text-rose-400 uppercase tracking-wider">
                Sessão Bloqueada por Inatividade!
              </h2>
              <p className="text-xs text-text-secondary font-sans leading-relaxed">
                Você ficou mais de{" "}
                <strong className="text-rose-400">3 minutos</strong> sem tomar
                nenhuma ação física ou interação na plataforma.
              </p>
            </div>

            <div className="bg-slate-950/80 rounded-xl p-4 border border-white/5 space-y-3 font-mono text-xs text-left">
              <div className="flex justify-between text-[11px] text-text-secondary border-b border-white/5 pb-1.5">
                <span>CONTRATO DE ATIVIDADE</span>
                <span className="text-rose-400 font-bold">
                  STATUS: SUSPENSO
                </span>
              </div>
              <p className="text-[11px] leading-relaxed text-gray-400">
                ⚠️ <strong className="text-white">CONSEQÜÊNCIA:</strong> Você foi penalizado em <strong className="text-rose-400">5% do seu XP total</strong> e seu acumulador de tempo contínuo foi resetado.
              </p>
              <p className="text-[11px] leading-relaxed text-gray-400">
                Cada 10 minutos de treino ativo valem{" "}
                <strong className="text-accent-primary">10 XP cheios</strong>,
                mas a inatividade quebra o ciclo de bonificação.
              </p>
            </div>

            <button
              id="unblock-session-btn"
              type="button"
              onClick={() => {
                setIsScreenBlocked(false);
                setInactivitySeconds(0);
                playSoundEffect("success");
              }}
              className="w-full bg-rose-500 hover:bg-rose-400 text-slate-950 font-sans font-bold text-xs uppercase py-3 rounded-xl cursor-pointer transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)]"
            >
              Reativar e Retomar Treinamento
            </button>
          </div>
        </div>
      )}

      {/* FOCUS BLOCK OVERLAY (saidasTela >= 7) */}
      {onboardingFinished && activeStudent && !isProfessorOrAdmin && (activeStudent.saidasTela || 0) >= 7 && 
       activeStudent.id !== "STU-1C-10-1782358045698-r6f" && activeStudent.matricula !== "1C102026RH" && activeStudent.faseAtual !== -1 && (
        <div
          id="focus-block-overlay"
          className="fixed inset-0 z-[10000] bg-slate-950/95 backdrop-blur-md overflow-y-auto flex justify-center p-4 py-8 md:py-12 font-mono pointer-events-auto items-start md:items-center"
        >
          <MatrixBackground />
          <div className="relative z-10 max-w-xl w-full bg-slate-900 border-2 border-rose-500/80 rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-[0_0_80px_rgba(239,68,68,0.4)] animate-in fade-in zoom-in duration-300 my-auto">
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-rose-500/15 flex items-center justify-center border border-rose-500/40 text-rose-500 animate-pulse">
                <ShieldAlert className="w-12 h-12" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-sans font-black text-rose-500 uppercase tracking-widest leading-tight" style={{ fontSize: `${warningFontSizeMultiplier * 1.3}rem` }}>
                SESSÃO SANCIONADA PARA AUDITORIA
              </h2>
              <p className="font-mono font-bold uppercase tracking-widest text-rose-300" style={{ fontSize: `${warningFontSizeMultiplier * 0.85}rem` }}>
                ⚠️ PENALIDADE: -5% XP TOTAL • RESET DE CICLO
              </p>
              <p className="text-xs text-text-secondary font-mono">
                Excesso de Saídas de Foco {activeStudent.saidasTela} / 7
              </p>
            </div>

            {/* Font Size Adjuster Panel */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-xs select-none">
              <span className="text-gray-300 font-sans flex items-center gap-1.5 font-bold">
                <span className="text-emerald-400">A⁺</span> Tamanho do Texto:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateWarningFontSize(warningFontSizeMultiplier - 0.1)}
                  className="w-10 h-8 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-lg flex items-center justify-center font-black font-sans transition-all active:scale-90 cursor-pointer text-sm"
                  title="Diminuir fonte (A-)"
                >
                  A-
                </button>
                <span className="text-emerald-400 font-mono text-xs font-bold w-12 text-center bg-slate-900 py-1 rounded border border-white/5">
                  {Math.round(warningFontSizeMultiplier * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => updateWarningFontSize(warningFontSizeMultiplier + 0.1)}
                  className="w-10 h-8 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-lg flex items-center justify-center font-black font-sans transition-all active:scale-90 cursor-pointer text-sm"
                  title="Aumentar fonte (A+)"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => updateWarningFontSize(1.25)}
                  className="h-8 px-2.5 bg-slate-850 hover:bg-slate-750 text-gray-300 text-[11px] rounded-lg flex items-center justify-center font-bold font-sans transition-all active:scale-90 cursor-pointer border border-white/10"
                  title="Restaurar tamanho de leitura aprimorado"
                >
                  Padrão
                </button>
              </div>
            </div>

            <div className="bg-slate-950/95 rounded-xl p-5 border border-rose-500/40 space-y-4 font-mono text-left shadow-inner">
              <div className="flex justify-between border-b border-rose-500/35 pb-2 font-black tracking-wider" style={{ fontSize: `${warningFontSizeMultiplier * 0.85}rem` }}>
                <span className="text-rose-400">🚨 AUDITORIA E-SOCIAL</span>
                <span className="text-rose-500 font-bold">STATUS: BLOQUEADO</span>
              </div>
              
              <p className="leading-relaxed text-gray-100" style={{ fontSize: `${warningFontSizeMultiplier * 0.9}rem` }}>
                ⚠️ <strong className="text-white">NOTIFICAÇÃO FORMAL:</strong> Seu navegador registrou que você minimizou ou trocou a aba ativa do simulador de e-Social por <strong className="text-rose-400 font-bold">{(activeStudent.saidasTela || 0)} vezes</strong>.
              </p>
              
              <p className="leading-relaxed text-gray-350" style={{ fontSize: `${warningFontSizeMultiplier * 0.85}rem` }}>
                O domínio técnico do e-Social exige atenção estrita e pleno foco na tela de trabalho. Sua estação foi <strong className="text-rose-400 font-extrabold uppercase">travada definitivamente</strong> por desvio operacional repetido.
              </p>
              
              <div className="p-4 bg-rose-950/50 rounded-xl border-2 border-rose-500/25 leading-relaxed text-rose-200 font-sans shadow-md" style={{ fontSize: `${warningFontSizeMultiplier * 0.85}rem` }}>
                📌 <strong className="text-white">Instruções Presenciais:</strong> O <strong className="text-white">Professor/Monitoria</strong> recebeu o alerta de conduta em tempo real no painel dele. Ele irá pessoalmente até a sua estação de trabalho para analisar os lançamentos, orientar sobre boas práticas e efetuar o desbloqueio seguro.
              </div>
            </div>

            {/* Backdoor physical override for Professor/Monitoria directly on student keyboard */}
            <div className="pt-4 border-t border-white/10 space-y-2.5 text-left">
              <p className="text-[10px] text-gray-400 font-mono uppercase font-bold tracking-wider">🔒 Código de Desbloqueio Local (Apenas para o Professor)</p>
              <div className="flex gap-2">
                <input 
                  type="password"
                  id="professor-backdoor-pass"
                  placeholder="Código de Desbloqueio..."
                  className="flex-1 bg-slate-950/90 border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-rose-500 font-mono shadow-md focus:ring-1 focus:ring-rose-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const val = (e.target as HTMLInputElement).value;
                      if (val.trim() === "RH2026RH") {
                        handleResetStudentFocus(activeStudent.id);
                        (e.target as HTMLInputElement).value = "";
                      } else {
                        playSoundEffect("failure");
                        alert("Código de desbloqueio incorreto!");
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const inputEl = document.getElementById("professor-backdoor-pass") as HTMLInputElement;
                    if (inputEl && inputEl.value.trim() === "RH2026RH") {
                      handleResetStudentFocus(activeStudent.id);
                      inputEl.value = "";
                    } else {
                      playSoundEffect("failure");
                      alert("Código de desbloqueio incorreto!");
                    }
                  }}
                  className="bg-rose-500 hover:bg-rose-400 text-slate-950 border border-rose-500/30 px-5 rounded-xl text-xs font-sans font-black uppercase tracking-wider transition-all hover:scale-[1.02] active:scale-95 cursor-pointer shadow-md"
                >
                  Desbloquear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INTERMEDIATE CONDUCT WARNINGS (saidasTela === 5 or 6) */}
      {onboardingFinished && activeStudent && !isProfessorOrAdmin && 
       ((activeStudent.saidasTela || 0) === 5 || (activeStudent.saidasTela || 0) === 6) && 
       (activeStudent.saidasTela || 0) > dismissedWarningCount && (
        <div
          id="focus-warning-overlay"
          className="fixed inset-0 z-[9990] bg-slate-950/90 backdrop-blur-sm overflow-y-auto flex justify-center p-4 py-8 md:py-12 animate-fade-in pointer-events-auto items-start md:items-center"
        >
          <div className="max-w-xl w-full bg-slate-900 border-2 border-amber-500/80 rounded-2xl p-6 md:p-8 text-center space-y-6 shadow-[0_0_50px_rgba(245,158,11,0.25)] my-auto">
            <div className="flex justify-center">
              <div className="w-16 h-16 rounded-full bg-amber-500/15 flex items-center justify-center border border-amber-500/30 text-amber-500 animate-bounce">
                <AlertTriangle className="w-9 h-9" />
              </div>
            </div>

            <div className="space-y-2">
              <h2 className="font-sans font-black text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1.5" style={{ fontSize: `${warningFontSizeMultiplier * 1.1}rem` }}>
                <span>⚠️ ALERTA DE CONDUTA OPERACIONAL</span>
              </h2>
              <p className="text-gray-400 font-mono block tracking-wide" style={{ fontSize: `${warningFontSizeMultiplier * 0.75}rem` }}>
                ATENÇÃO PLENA REQUERIDA NO MONITORAMENTO DO PORTAL
              </p>
            </div>

            {/* Font Size Adjuster Panel */}
            <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-950/90 border border-white/10 rounded-xl text-xs select-none">
              <span className="text-gray-300 font-sans flex items-center gap-1.5 font-bold">
                <span className="text-amber-400">A⁺</span> Tamanho do Texto:
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => updateWarningFontSize(warningFontSizeMultiplier - 0.1)}
                  className="w-10 h-8 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-lg flex items-center justify-center font-black font-sans transition-all active:scale-95 cursor-pointer text-sm"
                  title="Diminuir fonte (A-)"
                >
                  A-
                </button>
                <span className="text-amber-400 font-mono text-xs font-bold w-12 text-center bg-slate-900 py-1 rounded border border-white/5">
                  {Math.round(warningFontSizeMultiplier * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => updateWarningFontSize(warningFontSizeMultiplier + 0.1)}
                  className="w-10 h-8 bg-slate-800 hover:bg-slate-700 text-white border border-white/10 rounded-lg flex items-center justify-center font-black font-sans transition-all active:scale-95 cursor-pointer text-sm"
                  title="Aumentar fonte (A+)"
                >
                  A+
                </button>
                <button
                  type="button"
                  onClick={() => updateWarningFontSize(1.25)}
                  className="h-8 px-2.5 bg-slate-850 hover:bg-slate-750 text-gray-300 text-[11px] rounded-lg flex items-center justify-center font-bold font-sans transition-all active:scale-95 cursor-pointer border border-white/10"
                  title="Restaurar tamanho de leitura aprimorado"
                >
                  Padrão
                </button>
              </div>
            </div>

            <div className="bg-slate-950/95 rounded-xl p-5 border border-white/10 space-y-4 font-mono text-left">
              <p className="leading-relaxed text-gray-100" style={{ fontSize: `${warningFontSizeMultiplier * 0.9}rem` }}>
                Você retirou o foco do simulador de e-Social pela <strong className="text-amber-400 font-bold">{activeStudent.saidasTela}ª vez</strong>!
              </p>
              
              {activeStudent.saidasTela === 5 ? (
                <p className="leading-relaxed text-gray-350" style={{ fontSize: `${warningFontSizeMultiplier * 0.85}rem` }}>
                  ⚠️ No e-Social, desvios eventuais do simulador prejudicam severamente o aprendizado técnico de transmissão de eventos de Tabelas e Admissões. Nosso ambiente monitora cada saída. Mantenha os olhos e as ações totalmente voltados ao trabalho!
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="leading-relaxed text-gray-305 font-sans" style={{ fontSize: `${warningFontSizeMultiplier * 0.85}rem` }}>
                    🔴 <strong className="text-rose-400 font-bold">ALERTA FINAL:</strong> Esta é a sua <strong className="text-amber-400 font-bold">6ª saída</strong> de tela de simulação.
                  </p>
                  <p className="text-rose-200 bg-rose-950/45 p-3.5 rounded-xl border-2 border-rose-500/20 font-sans font-semibold leading-relaxed" style={{ fontSize: `${warningFontSizeMultiplier * 0.87}rem` }}>
                    "Caso mude de aba ou minimize o sistema <strong className="text-white font-black uppercase">MAIS UMA VEZ (7ª saída)</strong>, sua tela será travada de forma definitiva. O Professor/Monitoria terá que desbloquear sua estação pessoalmente e seu avanço nesta etapa será zerado."
                  </p>
                </div>
              )}
            </div>

            <button
              id="dismiss-focus-warning-btn"
              type="button"
              onClick={() => {
                setDismissedWarningCount(activeStudent.saidasTela || 0);
                playSoundEffect("success");
              }}
              className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-sans font-black text-xs uppercase py-3.5 md:py-4 rounded-xl cursor-pointer transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:scale-[1.01] active:scale-95 tracking-wider"
            >
              Ciente. Prometo Focar 100% no Simulador
            </button>
          </div>
        </div>
      )}

      {/* FLOATING CHATS CONTAINER */}
      <div className="fixed bottom-0 right-4 z-[999] flex gap-4 pointer-events-none items-end">
        {openChats.map((id) => {
          const student = students.find((s) => s.id === id);
          if (!student) return null;
          return (
            <ChatWindow
              key={student.id}
              student={student}
              onClose={() => closeChat(student.id)}
              onSendMessage={handleSendChatMessage}
              onTypingChange={(id, typing) => handleTypingChange(id, typing, "Professor")}
              allStudents={students}
              onAssignSquad={handleAssignSquad}
              onAddStudentToSquad={handleAddStudentToSquad}
            />
          );
        })}
      </div>

      {/* STUDENT INTRA-CHAT WINDOW */}
      {onboardingFinished && activeStudent && !isProfessorOrAdmin && isStudentChatOpen && (
        <div className="fixed bottom-0 right-4 z-[9999] flex items-end">
          <StudentChatWindow
            student={activeStudent}
            onClose={() => setIsStudentChatOpen(false)}
            onSendMessage={(text) => handleSendStudentChatMessage(activeStudent.id, text)}
            onTypingChange={(typing) => handleTypingChange(activeStudent.id, typing, "Estudante")}
          />
        </div>
      )}

      {/* PROFESSOR CHAT TOAST NOTIFICATIONS */}
      {isProfessorOrAdmin && chatNotifications.length > 0 && (
        <div className="fixed bottom-4 left-4 z-[10000] max-w-sm w-80 space-y-2 pointer-events-auto">
          {chatNotifications.map((notif) => (
            <div
              key={notif.id}
              className="glass-panel p-3.5 rounded-xl border border-sky-500/30 shadow-[0_4px_12px_rgba(56,189,248,0.15)] flex flex-col gap-2 bg-slate-900 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3"
            >
              <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                <div className="flex items-center gap-1.5 font-sans font-bold text-xs text-sky-400">
                  <span className="text-sm">💬</span>
                  <span className="truncate">Mensagem de {notif.studentName}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setChatNotifications((prev) => prev.filter((x) => x.id !== notif.id))}
                  className="text-gray-400 hover:text-white transition-colors cursor-pointer text-xs font-mono font-bold"
                  title="Dispensar Notificação"
                >
                  ✕
                </button>
              </div>
              <p className="text-xs text-gray-200 line-clamp-3 bg-slate-950/40 p-2 rounded border border-white/5 font-sans italic leading-relaxed">
                "{notif.text}"
              </p>
              <div className="flex items-center justify-between gap-1.5 pt-1">
                <span className="text-[9px] text-gray-500 font-mono">{notif.timestamp}</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const stud = students.find((s) => s.id === notif.studentId);
                      if (stud) openChat(stud);
                      setChatNotifications((prev) => prev.filter((x) => x.id !== notif.id));
                      playSoundEffect("success");
                    }}
                    className="bg-sky-500 hover:bg-sky-400 text-slate-950 px-2.5 py-1 rounded-md text-[10px] font-sans font-bold uppercase cursor-pointer tracking-wider"
                  >
                    Responder
                  </button>
                  <button
                    type="button"
                    onClick={() => setChatNotifications((prev) => prev.filter((x) => x.id !== notif.id))}
                    className="bg-slate-800 hover:bg-slate-700 text-gray-300 px-2 py-1 rounded-md text-[10px] font-sans font-medium uppercase cursor-pointer"
                  >
                    Dispensar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      </div>
    </div>
  )}
</div>
      {/* Sibling container for printing only (Holerite Original) */}
    {activeChallenge && activeChallenge.fase === 3 && activeChallenge.gabarito?.valoresCorretos && (
      <div className="hidden print:block bg-white text-black p-8 font-sans text-xs w-[21cm] h-[29.7cm] mx-auto space-y-6">
        {(() => {
          const gab = activeChallenge.gabarito.valoresCorretos;
          if (!gab) return null;

          const rubricsList = [];
          if (gab.salario > 0) {
            const refLabel = activeChallenge.id === "3.6" ? "15 Dias" : activeChallenge.id === "3.8" ? "04 Dias" : "30 Dias";
            rubricsList.push({ cod: "101", desc: "SALÁRIO BASE PROPORCIONAL", ref: refLabel, vencimento: gab.salario, desconto: 0 });
          }
          if (gab.mediaHe > 0) {
            rubricsList.push({ cod: "115", desc: "MÉDIA HORAS EXTRAS (12M)", ref: "Média", vencimento: gab.mediaHe, desconto: 0 });
          }
          if (gab.insalubridade > 0) {
            rubricsList.push({ cod: "135", desc: "ADICIONAL DE INSALUBRIDADE", ref: "40% s/ SM", vencimento: gab.insalubridade, desconto: 0 });
          }
          if (gab.periculosidade > 0) {
            rubricsList.push({ cod: "140", desc: "ADICIONAL DE PERICULOSIDADE", ref: "30.00%", vencimento: gab.periculosidade, desconto: 0 });
          }
          if (gab.horasExtras > 0) {
            rubricsList.push({ cod: "150", desc: "HORAS EXTRAS REALIZADAS", ref: "Apuradas", vencimento: gab.horasExtras, desconto: 0 });
          }
          if (gab.adicionalNoturno > 0) {
            rubricsList.push({ cod: "160", desc: "ADICIONAL NOTURNO (CLT)", ref: "20% Not.", vencimento: gab.adicionalNoturno, desconto: 0 });
          }
          if (gab.comissoes > 0) {
            rubricsList.push({ cod: "180", desc: "COMISSÕES S/ TAREFAS ACORDADAS", ref: "Comis.", vencimento: gab.comissoes, desconto: 0 });
          }
          if (gab.dsrHe > 0) {
            rubricsList.push({ cod: "190", desc: "REFLEXOS DSR S/ HE E VARIAVEIS", ref: "Lei 605", vencimento: gab.dsrHe, desconto: 0 });
          }
          if (gab.salarioFamilia > 0) {
            rubricsList.push({ cod: "210", desc: "SALÁRIO-FAMÍLIA (PREVIDÊNCIA)", ref: activeChallenge.id === "3.6" ? "3 Cotas" : "1 Cota", vencimento: gab.salarioFamilia, desconto: 0 });
          }
          if (gab.inss > 0) {
            rubricsList.push({ cod: "501", desc: "CONTRIBUIÇÃO PREVIDENCIÁRIA INSS", ref: `${((gab.inss / gab.bruto) * 100).toFixed(1)}%`, vencimento: 0, desconto: gab.inss });
          }
          if (gab.irrf > 0) {
            rubricsList.push({ cod: "502", desc: "IMPOSTO DE RENDA RETIDO IRRF", ref: "Tabela", vencimento: 0, desconto: gab.irrf });
          }
          if (gab.vt > 0) {
            rubricsList.push({ cod: "510", desc: "DESCONTO VALE-TRANSPORTE (LEI)", ref: "6.00%", vencimento: 0, desconto: gab.vt });
          }
          if (gab.faltasDesconto > 0) {
            rubricsList.push({ cod: "520", desc: "DESCONTO DE FALTAS E DSR PERDIDO", ref: "Dias/DSR", vencimento: 0, desconto: gab.faltasDesconto });
          }

          const padCount = Math.max(10 - rubricsList.length, 0);
          const paddedList = [
            ...rubricsList,
            ...Array(padCount).fill({ cod: "", desc: "", ref: "", vencimento: 0, desconto: 0 })
          ];

          const sumVencimentos = rubricsList.reduce((acc, current) => acc + current.vencimento, 0);
          const sumDescontos = rubricsList.reduce((acc, current) => acc + current.desconto, 0);
          const valLiquido = sumVencimentos - sumDescontos;

          return (
            <div className="bg-white p-6 border border-black rounded-lg text-slate-900 font-sans space-y-6">
              <div className="flex justify-between items-center border-b border-black pb-3">
                <div>
                  <h4 className="font-bold text-base uppercase">CRISRES Soluções Trabalhistas S/A</h4>
                  <p className="text-xs text-slate-500 font-mono">CNPJ: 14.882.341/0001-02 | Rua da Consolidação, 1500 - São Paulo/SP</p>
                </div>
                <div className="text-right border-l-2 border-black pl-4">
                  <span className="font-sans font-black block uppercase text-sm text-slate-800 tracking-wider">Recibo de Pagamento de Salário</span>
                  <span className="text-xs font-mono text-slate-600">Referência: <strong className="text-slate-950 font-bold">{getPointParamsForChallenge(activeChallenge).mes_referencia}</strong></span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2 bg-slate-50 p-3 text-xs text-slate-700 border border-black rounded">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Cód.</span>
                  <span className="font-bold font-mono">000{activeChallenge.id.replace(".", "")}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Funcionário</span>
                  <span className="font-bold text-sm">{activeChallenge.empregado.nome}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Admissão</span>
                  <span className="font-bold font-mono">{activeChallenge.empregado.dataAdmissao}</span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-300">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Cargo</span>
                  <span className="font-semibold">{activeChallenge.empregado.cbo.split(" (")[0]}</span>
                </div>
                <div className="pt-2 border-t border-slate-300">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">CBO</span>
                  <span className="font-mono">{activeChallenge.empregado.cbo.match(/\(([^)]+)\)/)?.[1] || "—"}</span>
                </div>
                <div className="pt-2 border-t border-slate-300">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Jornada</span>
                  <span>{activeChallenge.empregado.jornada || "44 horas"}</span>
                </div>
              </div>

              <div className="border border-black rounded overflow-hidden">
                <table className="w-full text-xs font-mono border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-sans font-bold uppercase border-b border-black text-slate-700 text-left">
                      <th className="p-2.5 border-r border-black w-[10%] text-center">Cód</th>
                      <th className="p-2.5 border-r border-black w-[45%]">Descrição</th>
                      <th className="p-2.5 border-r border-black w-[15%] text-center font-bold">Referência</th>
                      <th className="p-2.5 border-r border-black w-[15%] text-right pr-4 font-bold">Vencimentos</th>
                      <th className="p-2.5 w-[15%] text-right pr-4 font-bold">Descontos</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-300">
                    {paddedList.map((row, idx) => (
                      <tr key={idx} className="h-7">
                        <td className="p-1.5 border-r border-slate-300 text-center text-slate-500 font-mono">{row.cod}</td>
                        <td className="p-1.5 border-r border-slate-300 pl-3 font-sans font-medium">{row.desc}</td>
                        <td className="p-1.5 border-r border-slate-300 text-center text-slate-600 font-mono">{row.ref}</td>
                        <td className="p-1.5 border-r border-slate-300 text-right pr-4 font-semibold text-emerald-800 font-mono">{row.vencimento > 0 ? row.vencimento.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}</td>
                        <td className="p-1.5 text-right pr-4 font-semibold text-rose-800 font-mono">{row.desconto > 0 ? row.desconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 }) : ""}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="border border-black p-3 rounded">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Proventos</span>
                  <span className="font-bold text-sm font-mono text-emerald-800">R$ {sumVencimentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border border-black p-3 rounded">
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Total Descontos</span>
                  <span className="font-bold text-sm font-mono text-rose-800">R$ {sumDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-2 border-black bg-slate-50 p-3 rounded">
                  <span className="text-[10px] text-slate-800 block uppercase font-black">Líquido a Receber</span>
                  <span className="font-black text-base font-mono text-slate-905">R$ {valLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-1 p-2 border border-black rounded bg-slate-50 font-mono text-[10px] text-slate-600 text-center">
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-sans">Salário Contratual</span>
                  <span className="font-semibold">R$ {activeChallenge.empregado.salarioBase?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-sans">Base Contr. INSS</span>
                  <span className="font-semibold">R$ {gab.baseFgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-400 uppercase font-sans">Base Cálc. FGTS</span>
                  <span className="font-semibold">R$ {gab.baseFgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
                <div>
                  <span className="block text-[9px] text-slate-405 uppercase font-sans font-bold">FGTS do Mês (8%)</span>
                  <span className="font-black text-slate-900">R$ {gab.fgts?.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                </div>
              </div>

              <div className="pt-6 flex justify-between items-center text-xs text-slate-500">
                <div className="leading-relaxed max-w-sm">
                  <p className="font-bold text-slate-800">VALOR JURÍDICO RECONHECIDO</p>
                  <p className="text-[10px]">Declaro ter recebido a importância líquida descrita neste recibo de pagamento.</p>
                </div>
                <div className="text-right pt-2 border-l border-slate-350 pl-4">
                  <p className="font-mono">___/___/______   ____________________________________</p>
                  <p className="text-[9px] text-center uppercase tracking-wider text-slate-400 mr-[40px] mt-1">Data & Assinatura do Funcionário</p>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    )}
    <AnimatePresence>
      {activeBroadcast && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 0.65, y: 0, scale: 1 }}
          whileHover={{ opacity: 0.95 }}
          exit={{ opacity: 0, y: 15, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-4 right-4 z-[99999] max-w-xs pointer-events-auto transition-opacity"
        >
          <div className="bg-slate-950/65 backdrop-blur-xs p-2.5 rounded-lg border border-white/5 shadow-md flex items-center gap-2">
            <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/10">
              <LogIn className="w-3 h-3 text-emerald-500/60" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-gray-400 font-mono font-medium block leading-tight truncate">
                {activeBroadcast.text}
              </span>
            </div>
            <button 
              onClick={() => setActiveBroadcast(null)}
              className="p-1 hover:bg-white/5 rounded text-gray-500 hover:text-gray-300 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>

    <AnimatePresence>
      {!isProfessorOrAdmin && activeStudent && activeStudent.faseAtual >= 1 && !activeStudent.contratoAssinado && (
        <WorkContractModal 
          student={activeStudent} 
          appLanguage={appLanguage} 
          onSign={handleSignContract} 
        />
      )}
    </AnimatePresence>

    <AnimatePresence>
      {isBadgePhotoModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-slate-900 border border-white/10 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-2xl relative"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <Camera className="w-4 h-4 text-accent-primary" /> Foto do Crachá
              </h3>
              <button 
                onClick={() => setIsBadgePhotoModalOpen(false)} 
                className="text-gray-400 hover:text-white p-1 hover:bg-white/5 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex flex-col items-center gap-5 py-2">
               <div className="w-32 h-40 bg-black/40 rounded-xl border border-dashed border-white/20 flex flex-col items-center justify-center relative overflow-hidden group">
                  {badgePhoto ? (
                    <img src={badgePhoto} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center space-y-2 opacity-40">
                      <User className="w-10 h-10 mx-auto text-gray-400" />
                      <p className="text-[10px] font-mono">SEM FOTO</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => photoInputRef.current?.click()}
                      className="text-[10px] font-bold text-white bg-accent-primary/80 px-3 py-1.5 rounded-full"
                    >
                      Trocar
                    </button>
                  </div>
               </div>
               
               <div className="flex flex-col w-full gap-2">
                 <button 
                   onClick={() => photoInputRef.current?.click()}
                   className="w-full text-xs bg-accent-primary/10 text-accent-primary hover:text-white px-3 py-2.5 rounded-xl border border-accent-primary/20 hover:bg-accent-primary hover:border-accent-primary transition-all font-bold flex items-center justify-center gap-2"
                 >
                   <Camera className="w-3.5 h-3.5" />
                   {badgePhoto ? "Alterar sua Foto de Acesso" : "Carregar Foto Formal"}
                 </button>
                 
                 {badgePhoto && (
                   <button 
                     onClick={() => setBadgePhoto(null)}
                     className="w-full text-[10px] text-rose-400/70 hover:text-rose-400 font-bold uppercase transition-all py-1"
                   >
                     Remover Foto Atual
                   </button>
                 )}
               </div>
            </div>
            
            <div className="bg-slate-950/60 p-3 rounded-xl border border-white/5">
              <p className="text-[10px] text-text-secondary leading-relaxed text-center">
                A foto será integrada ao seu <strong>crachá oficial</strong> no formato 3x4 formal. Evite filtros ou fundos poluídos.
              </p>
            </div>
            
            <div className="pt-2">
              <button 
                onClick={() => setIsBadgePhotoModalOpen(false)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
              >
                Concluir e Salvar Configuração
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    <input 
      type="file" 
      ref={photoInputRef}
      className="hidden"
      accept="image/*"
      onChange={handleBadgePhotoChange}
    />
    </>
  );
}

