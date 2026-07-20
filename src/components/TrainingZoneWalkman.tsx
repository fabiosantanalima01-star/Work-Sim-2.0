import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Lock,
  Unlock,
  CheckCircle,
  XCircle,
  Edit2,
  Save,
  Award,
  BookOpen,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  HelpCircle,
  Music,
  Radio,
  FileAudio,
  Check,
  AlertTriangle,
  Flame,
  Clock,
  Sparkles,
  Folder,
  ExternalLink,
  ChevronDown,
  Loader2,
  Upload,
  Disc,
  Music2,
  LogOut
} from "lucide-react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db, syncSetDoc } from "../lib/firebase";

// Define strict types for the component props
interface Challenge {
  id: string;
  fase: number;
  titulo: string;
  tipo: string;
  focoTecnico: string;
  tempoLimiteMinutos?: number;
  xpRecompensa: number;
  empregado?: {
    nome: string;
    cbo: string;
    salarioBase: number;
    dataAdmissao: string;
    dataFato: string;
    jornada: string;
  };
  queixa: string;
  gabarito: {
    tipoAcao: string;
    artigoLegal: string;
    respostaEsperadaId: string;
    valoresCorretos?: {
      justificativa?: string;
    };
  };
  opcoes: { id: string; texto: string }[];
}

interface Student {
  id: string;
  nomeCompleto: string;
  matricula: string;
  xp: number;
  precisao: number;
  respostasDesafios?: Record<string, boolean>;
}

interface TrainingZoneWalkmanProps {
  activeStudent: Student;
  allChallenges: Challenge[];
  completedChallenges: string[];
  selectedChallengeId: string | null;
  setSelectedChallengeId: (id: string | null) => void;
  selectedOptionId: string | null;
  setSelectedOptionId: (id: string | null) => void;
  handleCheckChallengeMCQ: () => void;
  challengeFeedback: { isCorrect: boolean; text: string; article: string } | null;
  setChallengeFeedback: (feedback: { isCorrect: boolean; text: string; article: string } | null) => void;
  isProfessorOrAdmin: boolean;
  playSoundEffect: (sound: string) => void;
  onExit?: () => void; // Used when passed, e.g. for professors or students who already completed it
  onLogout?: () => void;
}

// Helper to find a matching file from a public Google Drive folder list for a given challenge
function findMatchingFile(challenge: any, files: { id: string; name: string }[]) {
  if (!challenge || !files || files.length === 0) return null;
  
  // Extract question number (e.g., "-1.5" -> 5)
  const matchNum = challenge.id.match(/-1\.(\d+)/);
  const qNum = matchNum ? parseInt(matchNum[1], 10) : null;
  
  const cleanName = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Score files based on matches
  const scoredFiles = files.map(file => {
    const fileNameLower = cleanName(file.name);
    let score = 0;
    
    // 1. Strict pattern match for question number
    if (qNum !== null) {
      const numPatterns = [
        new RegExp(`\\bq${qNum}\\b`),
        new RegExp(`\\bq0${qNum}\\b`),
        new RegExp(`questao[\\s_-]?${qNum}\\b`),
        new RegExp(`\\b${qNum}\\.`),
        new RegExp(`\\b0${qNum}\\.`),
        new RegExp(`_${qNum}\\b`),
        new RegExp(`_${qNum}\\.`),
        new RegExp(`^${qNum}\\b`) // Starts with number, e.g. "2_Como_calcular" or "2.mp3"
      ];
      
      const hasPattern = numPatterns.some(regex => regex.test(fileNameLower));
      if (hasPattern) {
        score += 100;
      }
    }
    
    // 2. Keyword matching from Challenge Title
    const titleClean = cleanName(challenge.titulo);
    const titleWords = titleClean.replace(/questao\s+\d+:\s*/g, "").split(/[\s:_-]+/).filter(w => w.length > 3);
    titleWords.forEach(word => {
      if (fileNameLower.includes(word)) {
        score += 15;
      }
    });
    
    // 3. Keyword matching from Foco Técnico
    if (challenge.focoTecnico) {
      const focoClean = cleanName(challenge.focoTecnico);
      const focoWords = focoClean.split(/[\s:_-]+/).filter(w => w.length > 3);
      focoWords.forEach(word => {
        if (fileNameLower.includes(word)) {
          score += 10;
        }
      });
    }

    // 4. Keyword matching from Queixa
    if (challenge.queixa) {
      const queixaClean = cleanName(challenge.queixa);
      const queixaWords = queixaClean.split(/[\s:_-]+/).filter(w => w.length > 3 && !["trabalho", "clt", "trabalhador", "empregado"].includes(w));
      queixaWords.slice(0, 10).forEach(word => {
        if (fileNameLower.includes(word)) {
          score += 5;
        }
      });
    }
    
    return { file, score };
  });
  
  const sorted = scoredFiles.filter(item => item.score > 0).sort((a, b) => b.score - a.score);
  
  if (sorted.length > 0 && sorted[0].score >= 10) {
    return sorted[0].file;
  }
  
  return null;
}

export const TrainingZoneWalkman: React.FC<TrainingZoneWalkmanProps> = ({
  activeStudent,
  allChallenges,
  completedChallenges,
  selectedChallengeId,
  setSelectedChallengeId,
  selectedOptionId,
  setSelectedOptionId,
  handleCheckChallengeMCQ,
  challengeFeedback,
  setChallengeFeedback,
  isProfessorOrAdmin,
  playSoundEffect,
  onExit,
  onLogout
}) => {
  // Filter challenges to Phase -1 (Zona de Treinamento)
  const trainingChallenges = useMemo(() => {
    return allChallenges.filter((c) => c.fase === -1);
  }, [allChallenges]);

  // Real-time Firestore audio gabaritos subscription
  const [audioGabaritos, setAudioGabaritos] = useState<Record<string, string>>({});
  const [editingFileId, setEditingFileId] = useState<string>("");
  const [isEditingAudio, setIsEditingAudio] = useState<boolean>(false);
  const [isSavingAudio, setIsSavingAudio] = useState<boolean>(false);

  // Cloudinary Direct Upload State
  const [isUploadingCloudinary, setIsUploadingCloudinary] = useState<boolean>(false);
  const [cloudinaryUploadError, setCloudinaryUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleCloudinaryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeChallenge) return;

    setIsUploadingCloudinary(true);
    setCloudinaryUploadError(null);

    const formData = new FormData();
    formData.append("audio", file);

    try {
      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload do arquivo.");
      }

      // Automatically register the Cloudinary URL in Firestore
      await syncSetDoc("settings", "audio_gabaritos", {
        [activeChallenge.id]: data.secure_url
      }, { merge: true });

      setEditingFileId(data.secure_url);
      playSoundEffect("success");
    } catch (err: any) {
      console.error("Cloudinary upload failed:", err);
      setCloudinaryUploadError(err.message || "Falha no upload para o Cloudinary.");
    } finally {
      setIsUploadingCloudinary(false);
    }
  };

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "audio_gabaritos"), (snapshot) => {
      if (snapshot.exists()) {
        setAudioGabaritos(snapshot.data() as Record<string, string>);
      }
    }, (error) => {
      console.error("Erro ao assinar áudios explicativos:", error);
    });
    return unsub;
  }, []);

  // Set initial selected challenge if none is set
  useEffect(() => {
    if (trainingChallenges.length > 0 && !selectedChallengeId) {
      // Find first unanswered challenge to guide student
      const firstUnanswered = trainingChallenges.find(
        (c) => activeStudent.respostasDesafios?.[c.id] === undefined
      );
      setSelectedChallengeId(firstUnanswered ? firstUnanswered.id : trainingChallenges[0].id);
    }
  }, [trainingChallenges, selectedChallengeId, activeStudent, setSelectedChallengeId]);

  const activeChallenge = useMemo(() => {
    return trainingChallenges.find((c) => c.id === selectedChallengeId) || null;
  }, [trainingChallenges, selectedChallengeId]);

  // Check which challenges are unlocked (sequential rule)
  const unlockedMap = useMemo(() => {
    const map: Record<string, boolean> = {};
    trainingChallenges.forEach((ch, idx) => {
      if (idx === 0 || isProfessorOrAdmin) {
        map[ch.id] = true;
      } else {
        const prevCh = trainingChallenges[idx - 1];
        const isPrevDone = activeStudent.respostasDesafios?.[prevCh.id] !== undefined;
        map[ch.id] = isPrevDone;
      }
    });
    return map;
  }, [trainingChallenges, activeStudent.respostasDesafios, isProfessorOrAdmin]);

  // Statistics
  const stats = useMemo(() => {
    const total = trainingChallenges.length;
    const answeredList = trainingChallenges.filter((c) => activeStudent.respostasDesafios?.[c.id] !== undefined);
    const answeredCount = answeredList.length;
    const correctCount = trainingChallenges.filter((c) => activeStudent.respostasDesafios?.[c.id] === true).length;
    const accuracy = answeredCount > 0 ? (correctCount / answeredCount) * 100 : 0;
    const isCompleted100 = answeredCount === total;
    const hasPassed65 = accuracy >= 65;
    const isApproved = isCompleted100 && hasPassed65;

    return {
      total,
      answeredCount,
      correctCount,
      accuracy,
      isCompleted100,
      hasPassed65,
      isApproved,
      remainingCount: total - answeredCount
    };
  }, [trainingChallenges, activeStudent.respostasDesafios]);

  // Audio Player State & Refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [volume, setVolume] = useState<number>(1);
  const [audioError, setAudioError] = useState<string | null>(null);
  const [useNativePlayer, setUseNativePlayer] = useState<boolean>(false);

  const activeFileId = activeChallenge ? audioGabaritos[activeChallenge.id] || "" : "";

  const driveInfo = useMemo(() => {
    if (!activeFileId) {
      return { id: "", isFolder: false, isGoogleDrive: false, rawUrl: "" };
    }
    const trimmed = activeFileId.trim();
    
    // Detect if it's a Google Drive URL
    const isGoogleDrive = trimmed.includes("drive.google.com") || trimmed.includes("docs.google.com");
    
    // Detect if it's a folder link or folder ID
    const isFolderLink = trimmed.includes("/folders/") || trimmed.includes("folders");
    const isKnownFolderId = trimmed === "1OAvTlgpXJmjYfZyIF6-6wWYPMYk0zWgx";
    const isFolder = isFolderLink || isKnownFolderId;
    
    let parsedId = trimmed;
    
    if (isGoogleDrive) {
      // Try matching folder ID first
      const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
      if (folderMatch && folderMatch[1]) {
        parsedId = folderMatch[1];
      } else {
        // Try matching file ID
        const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileDMatch && fileDMatch[1]) {
          parsedId = fileDMatch[1];
        } else {
          const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
          if (idMatch && idMatch[1]) {
            parsedId = idMatch[1];
          }
        }
      }
    }
    
    return {
      id: parsedId,
      isFolder,
      isGoogleDrive,
      rawUrl: trimmed
    };
  }, [activeFileId]);

  // Folder-based dynamic detection and file listing
  const [folderFiles, setFolderFiles] = useState<{ id: string; name: string }[]>([]);
  const [isLoadingFolder, setIsLoadingFolder] = useState<boolean>(false);

  const detectedFolderId = useMemo(() => {
    // Check if the current challenge ID is a folder
    if (driveInfo.isFolder) {
      return driveInfo.id;
    }
    // Or scan other challenges in audioGabaritos for a folder ID/URL
    for (const val of Object.values(audioGabaritos)) {
      if (!val) continue;
      const trimmed = (val as string).trim();
      const isFolderLink = trimmed.includes("/folders/") || trimmed.includes("folders");
      const isKnownFolderId = trimmed === "1OAvTlgpXJmjYfZyIF6-6wWYPMYk0zWgx";
      if (isFolderLink) {
        const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
        if (folderMatch && folderMatch[1]) {
          return folderMatch[1];
        }
        return trimmed;
      }
      if (isKnownFolderId) {
        return trimmed;
      }
    }
    return "";
  }, [audioGabaritos, driveInfo]);

  useEffect(() => {
    if (!detectedFolderId) {
      setFolderFiles([]);
      return;
    }

    let isMounted = true;
    setIsLoadingFolder(true);
    fetch(`/api/drive-folder/${detectedFolderId}`)
      .then(res => res.json())
      .then(data => {
        if (isMounted && data.success && Array.isArray(data.files)) {
          setFolderFiles(data.files);
          console.log("Arquivos carregados da pasta do Drive:", data.files);
        }
      })
      .catch(err => {
        console.error("Erro ao ler arquivos da pasta do Drive:", err);
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingFolder(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [detectedFolderId]);

  const matchedFile = useMemo(() => {
    if (!activeChallenge || folderFiles.length === 0) return null;
    return findMatchingFile(activeChallenge, folderFiles);
  }, [activeChallenge, folderFiles]);

  const [selectedFolderFile, setSelectedFolderFile] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (driveInfo.isFolder) {
      setSelectedFolderFile(matchedFile);
    } else {
      setSelectedFolderFile(null);
    }
  }, [matchedFile, driveInfo.isFolder]);

  const extractedFileId = useMemo(() => {
    if (driveInfo.isFolder) {
      return selectedFolderFile ? selectedFolderFile.id : "";
    }
    return driveInfo.id;
  }, [driveInfo, selectedFolderFile]);

  const audioUrl = useMemo(() => {
    let sourceId = "";
    let sourceName = "";

    if (driveInfo.isFolder) {
      if (selectedFolderFile) {
        sourceId = selectedFolderFile.id;
        sourceName = selectedFolderFile.name;
      } else {
        return "";
      }
    } else {
      sourceId = extractedFileId;
      sourceName = activeFileId;
    }

    if (!sourceId) return "";

    // If it's already a direct URL and not a google drive link, return as is
    const trimmed = sourceName.trim();
    if (trimmed.startsWith("http") && !trimmed.includes("drive.google.com") && !trimmed.includes("docs.google.com")) {
      return trimmed;
    }

    // Determine the correct extension hint for the HTML5 audio decoder
    const lower = sourceName.toLowerCase();
    let ext = "mp3"; // Default to mp3 as it is universally supported by all browsers
    if (lower.includes("m4a")) {
      ext = "m4a";
    } else if (lower.includes("wav")) {
      ext = "wav";
    } else if (lower.includes("ogg")) {
      ext = "ogg";
    }

    // Direct stream link for Google Drive files
    return `https://docs.google.com/uc?export=download&id=${sourceId}#.${ext}`;
  }, [activeFileId, extractedFileId, driveInfo, selectedFolderFile]);

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const target = e.currentTarget;
    if (target.src) {
      console.warn("Handled: Audio source loading issue", target.error);
      if (extractedFileId) {
        setUseNativePlayer(true);
        setAudioError("Alternamos para o player nativo do Google Drive devido a restrições de formato ou segurança do navegador.");
      } else {
        setAudioError("Erro ao reproduzir o áudio. Certifique-se de que o arquivo está compartilhado como 'Qualquer pessoa com o link'.");
      }
    }
  };

  // Handle audio state transitions
  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setAudioError(null);
    setUseNativePlayer(false);

    if (audioRef.current) {
      audioRef.current.pause();
      if (audioUrl) {
        audioRef.current.src = audioUrl;
        audioRef.current.load();
      } else {
        audioRef.current.src = "";
      }
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAudioError(null);
        })
        .catch((err) => {
          console.warn("Handled: Playback blocked or failed", err);
          if (extractedFileId) {
            setUseNativePlayer(true);
            setAudioError("Alternamos para o player nativo do Google Drive devido a restrições de formato (.m4a) ou segurança do navegador.");
          } else {
            setAudioError("Não foi possível reproduzir este áudio. Verifique se o ID do arquivo é público e válido.");
          }
          setIsPlaying(false);
        });
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current) {
      const time = parseFloat(e.target.value);
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
      audioRef.current.muted = vol === 0;
      setIsMuted(vol === 0);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (timeInSec: number) => {
    if (isNaN(timeInSec)) return "00:00";
    const mins = Math.floor(timeInSec / 60);
    const secs = Math.floor(timeInSec % 60);
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle saving audio ID by Professor
  const handleSaveAudioId = async () => {
    if (!activeChallenge) return;
    setIsSavingAudio(true);
    try {
      await syncSetDoc("settings", "audio_gabaritos", {
        [activeChallenge.id]: editingFileId.trim()
      }, { merge: true });
      setIsEditingAudio(false);
      playSoundEffect("success");
    } catch (err) {
      console.error("Error saving audio id:", err);
      alert("Erro ao salvar ID de áudio.");
    } finally {
      setIsSavingAudio(false);
    }
  };

  // Start editing audio
  useEffect(() => {
    if (activeChallenge) {
      setEditingFileId(audioGabaritos[activeChallenge.id] || "");
      setIsEditingAudio(false);
    }
  }, [activeChallenge, audioGabaritos]);

  const currentIsAnswered = activeChallenge
    ? activeStudent.respostasDesafios?.[activeChallenge.id] !== undefined
    : false;

  const currentIsCorrect = activeChallenge
    ? activeStudent.respostasDesafios?.[activeChallenge.id] === true
    : false;

  const handleOptionSelect = (optionId: string) => {
    if (currentIsAnswered) return;
    setSelectedOptionId(optionId);
    playSoundEffect("click");
  };

  const handleSubmit = () => {
    if (!selectedOptionId || currentIsAnswered) return;
    handleCheckChallengeMCQ();
  };

  // Go to next question
  const handleNextChallenge = () => {
    if (!activeChallenge) return;
    const currentIndex = trainingChallenges.findIndex((c) => c.id === activeChallenge.id);
    if (currentIndex < trainingChallenges.length - 1) {
      const nextCh = trainingChallenges[currentIndex + 1];
      if (unlockedMap[nextCh.id]) {
        setSelectedChallengeId(nextCh.id);
        setSelectedOptionId(null);
        setChallengeFeedback(null);
        playSoundEffect("click");
      }
    }
  };

  // Go to previous question
  const handlePrevChallenge = () => {
    if (!activeChallenge) return;
    const currentIndex = trainingChallenges.findIndex((c) => c.id === activeChallenge.id);
    if (currentIndex > 0) {
      const prevCh = trainingChallenges[currentIndex - 1];
      setSelectedChallengeId(prevCh.id);
      setSelectedOptionId(null);
      setChallengeFeedback(null);
      playSoundEffect("click");
    }
  };

  return (
    <div id="training-zone-container" className="flex-1 flex flex-col bg-slate-950 text-slate-100 min-h-0 overflow-hidden relative">
      {/* Background neon grids and gradients */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
      
      {/* Decorative cyber tubes */}
      <div className="absolute top-0 left-10 right-10 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent blur-[2px]" />
      
      {/* Header bar */}
      <header className="z-10 bg-slate-900/85 backdrop-blur-md border-b border-white/5 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.15)] animate-pulse">
            <Radio className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-bold text-cyan-400 tracking-widest uppercase">Módulo Ativo</span>
              <span className="text-[9px] font-mono bg-cyan-500/10 text-cyan-400 px-1.5 py-0.5 rounded border border-cyan-500/20">CADETE - TREINAMENTO</span>
            </div>
            <h1 className="text-lg font-sans font-extrabold text-white tracking-tight flex items-center gap-2">
              Zona de Treinamento Obrigatória
            </h1>
          </div>
        </div>

        {/* Real-time stats badges */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Progress bar */}
          <div className="bg-slate-950/80 rounded-xl p-2 px-3 border border-white/5 flex items-center gap-3 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-slate-400 uppercase">Progresso Geral</span>
              <span className="text-xs font-mono font-bold text-white">
                {stats.answeredCount} / {stats.total} <span className="text-[10px] text-slate-500">({Math.round((stats.answeredCount / stats.total) * 100)}%)</span>
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500 ease-out"
                style={{ width: `${(stats.answeredCount / stats.total) * 100}%` }}
              />
            </div>
          </div>

          {/* Accuracy Gauge */}
          <div className="bg-slate-950/80 rounded-xl p-2 px-3 border border-white/5 flex items-center gap-3 shadow-inner">
            <div className="flex flex-col">
              <span className="text-[8px] font-mono text-slate-400 uppercase">Precisão Atual</span>
              <span className={`text-xs font-mono font-bold ${stats.accuracy >= 65 ? "text-emerald-400" : stats.answeredCount > 0 ? "text-amber-500" : "text-slate-400"}`}>
                {stats.accuracy.toFixed(1)}% <span className="text-[9px] text-slate-500">/ 65%</span>
              </span>
            </div>
            <div className={`p-1 rounded ${stats.accuracy >= 65 ? "bg-emerald-500/10 text-emerald-400" : "bg-amber-500/10 text-amber-500"}`}>
              {stats.accuracy >= 65 ? <Check className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            </div>
          </div>

          {/* Exit / Dashboard Unlock Button if approved or admin */}
          {(stats.isApproved || isProfessorOrAdmin) && onExit && (
            <button
              onClick={onExit}
              className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] transition-all cursor-pointer flex items-center gap-2 transform hover:-translate-y-0.5 active:translate-y-0 uppercase tracking-wider"
            >
              <Award className="w-4 h-4" />
              <span>Acessar o Cockpit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              className="px-3 py-2 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 border border-rose-500/20 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2"
              title="Sair da Conta"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Grid Content */}
      <div className="flex-1 flex flex-col lg:flex-row min-h-0 overflow-hidden">
        
        {/* Left Side: Sequenced Question Navigation Grid */}
        <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/5 bg-slate-900/30 flex flex-col min-h-0">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-900/50">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-cyan-400" /> Tópicos de Treino
            </span>
            <span className="text-[9px] font-mono px-2 py-0.5 bg-slate-950 text-slate-400 rounded-full border border-white/5">
              Sequencial Obrigatório
            </span>
          </div>

          {/* Question List Scroll Area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 scrollbar-thin">
            {trainingChallenges.map((ch, idx) => {
              const isUnlocked = unlockedMap[ch.id];
              const isAnswered = activeStudent.respostasDesafios?.[ch.id] !== undefined;
              const isCorrect = activeStudent.respostasDesafios?.[ch.id] === true;
              const isSelected = selectedChallengeId === ch.id;

              return (
                <button
                  key={ch.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    setSelectedChallengeId(ch.id);
                    setSelectedOptionId(null);
                    setChallengeFeedback(null);
                    playSoundEffect("click");
                  }}
                  className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 relative cursor-pointer ${
                    isSelected
                      ? "bg-cyan-500/15 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                      : isUnlocked
                        ? isAnswered
                          ? isCorrect
                            ? "bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/40"
                            : "bg-rose-500/5 border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40"
                          : "bg-slate-900/60 border-white/5 hover:bg-slate-800/40 hover:border-white/10"
                        : "bg-slate-950/40 border-white/5 opacity-50 cursor-not-allowed"
                  }`}
                >
                  {/* Status Indicator circle */}
                  <div className="mt-0.5">
                    {!isUnlocked ? (
                      <Lock className="w-3.5 h-3.5 text-slate-600" />
                    ) : isAnswered ? (
                      isCorrect ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      )
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-cyan-500/50 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-slate-400">Questão {idx + 1}</span>
                      {ch.xpRecompensa > 0 && (
                        <span className="text-[9px] font-mono text-cyan-400">+{ch.xpRecompensa} XP</span>
                      )}
                    </div>
                    <h3 className="text-xs font-bold text-white truncate mt-0.5">
                      {ch.titulo.replace(/^Questão \d+:\s*/, "")}
                    </h3>
                    <p className="text-[10px] font-mono text-slate-400 mt-1 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-slate-500" />
                      {ch.focoTecnico}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Workspace - Active Question and Walkman Player */}
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-4 md:p-6 space-y-6 relative">
          
          {/* Audio HTML tag */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleAudioEnded}
            onError={handleAudioError}
          />

          {activeChallenge ? (
            <div className="w-full max-w-4xl mx-auto space-y-6">
              
              {/* Question Card */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500/50 to-blue-500/50" />
                
                {/* Meta details */}
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 border-b border-white/5 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 text-[10px] font-bold">
                      {activeChallenge.gabarito.artigoLegal}
                    </span>
                    <span className="text-slate-500">|</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {activeChallenge.tempoLimiteMinutos || 5} min limite
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400">XP Recompensa:</span>{" "}
                    <span className="font-bold text-cyan-400 font-mono">{activeChallenge.xpRecompensa} XP</span>
                  </div>
                </div>

                {/* Simulated Employee Dossier / Context (if available) */}
                {activeChallenge.empregado && activeChallenge.empregado.nome !== "Simulado" && (
                  <div className="bg-slate-950/85 border border-white/5 rounded-xl p-3 px-4 mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase">Empregado</span>
                      <span className="font-bold text-white">{activeChallenge.empregado.nome}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase">CBO / Cargo</span>
                      <span className="font-bold text-slate-300">{activeChallenge.empregado.cbo}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase">Admissão</span>
                      <span className="font-bold text-slate-300">{activeChallenge.empregado.dataAdmissao}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] font-mono text-slate-500 uppercase">Jornada</span>
                      <span className="font-bold text-slate-300">{activeChallenge.empregado.jornada}</span>
                    </div>
                  </div>
                )}

                {/* Question Body */}
                <h2 className="text-sm font-sans font-extrabold text-white tracking-wide mb-2">
                  {activeChallenge.titulo}
                </h2>
                <p className="text-slate-200 text-sm leading-relaxed bg-slate-950/40 border border-white/5 rounded-xl p-4 shadow-inner">
                  {activeChallenge.queixa}
                </p>

                {/* Multiple Choice Options */}
                <div className="space-y-2.5 mt-5">
                  {activeChallenge.opcoes.map((opt) => {
                    const isSelected = selectedOptionId === opt.id;
                    const isCorrectOption = opt.id === activeChallenge.gabarito.respostaEsperadaId;
                    
                    let optionStyle = "border-white/5 bg-slate-950/40 text-slate-200 hover:bg-slate-900 hover:border-white/10";
                    if (currentIsAnswered) {
                      if (isCorrectOption) {
                        optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-medium";
                      } else if (isSelected) {
                        optionStyle = "bg-rose-500/10 border-rose-500 text-rose-400";
                      } else {
                        optionStyle = "border-white/5 bg-slate-950/20 text-slate-400 opacity-60";
                      }
                    } else if (isSelected) {
                      optionStyle = "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.1)]";
                    }

                    return (
                      <button
                        key={opt.id}
                        disabled={currentIsAnswered}
                        onClick={() => handleOptionSelect(opt.id)}
                        className={`w-full text-left p-3 px-4 rounded-xl border text-xs transition-all relative flex items-center justify-between cursor-pointer ${optionStyle}`}
                      >
                        <span className="flex-1 pr-4">{opt.texto}</span>
                        {/* Status micro icons inside option */}
                        {currentIsAnswered && isCorrectOption && (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        )}
                        {currentIsAnswered && isSelected && !isCorrectOption && (
                          <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Submit Action Block */}
                {!currentIsAnswered && (
                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={handleSubmit}
                      disabled={!selectedOptionId}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold font-mono tracking-wider transition-all flex items-center gap-2 transform cursor-pointer active:translate-y-0 ${
                        selectedOptionId
                          ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:-translate-y-0.5"
                          : "bg-slate-800 text-slate-500 cursor-not-allowed"
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>SUBMETER ANÁLISE</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Reveal Explanation and WALKMAN PLAYER after Answer is Submitted */}
              <AnimatePresence>
                {currentIsAnswered && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 15 }}
                    className="space-y-6"
                  >
                    {/* Feedback Alert Block */}
                    <div className={`border rounded-2xl p-5 shadow-lg relative overflow-hidden backdrop-blur-sm ${
                      currentIsCorrect 
                        ? "bg-emerald-500/5 border-emerald-500/20 text-slate-100" 
                        : "bg-rose-500/5 border-rose-500/20 text-slate-100"
                    }`}>
                      <div className="flex items-start gap-3.5">
                        <div className={`p-2 rounded-xl mt-0.5 ${currentIsCorrect ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}>
                          {currentIsCorrect ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1">
                          <h4 className={`text-sm font-sans font-extrabold tracking-wide ${currentIsCorrect ? "text-emerald-400" : "text-rose-400"}`}>
                            {currentIsCorrect ? "Análise Correta!" : "Análise Incorreta!"}
                          </h4>
                          <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                            {challengeFeedback?.text || activeChallenge.gabarito.valoresCorretos?.justificativa || "Gabarito gravado com sucesso."}
                          </p>
                          <p className="text-[10px] font-mono text-slate-400 mt-2 flex items-center gap-1 bg-slate-950/40 p-1.5 px-2.5 rounded border border-white/5 w-max">
                            <span className="font-bold text-cyan-400">Artigo Aplicado:</span> {activeChallenge.gabarito.artigoLegal}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* SPOTIFY / YOUTUBE MUSIC INSPIRED AUDIO PLAYER */}
                    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
                      {/* Ambient light glow effect in background */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-transparent to-purple-500/5 pointer-events-none" />
                      <div className="absolute top-3 right-4 text-[7px] font-mono text-zinc-500 select-none uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span>WorkSIM Premium Player</span>
                      </div>

                      {/* A. Sleek Spotify/YouTube Music Album Cover with Spinning Disc / Visualizer */}
                      <div className="relative w-44 h-44 bg-gradient-to-br from-indigo-900 via-purple-900 to-zinc-950 border border-zinc-800 rounded-2xl shadow-xl flex flex-col items-center justify-center shrink-0 overflow-hidden group">
                        {/* Overlay to show track status gradient */}
                        <div className={`absolute inset-0 opacity-40 bg-gradient-to-tr ${
                          currentIsCorrect 
                            ? "from-emerald-500 via-teal-600 to-zinc-900" 
                            : "from-rose-500 via-purple-900 to-zinc-900"
                        }`} />

                        {/* Spinning vinyl disc or cover art icon */}
                        <div className="relative z-10 flex flex-col items-center justify-center">
                          <motion.div
                            animate={isPlaying ? { rotate: 360 } : {}}
                            transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                            className="w-24 h-24 rounded-full bg-zinc-950 border-4 border-zinc-800 flex items-center justify-center shadow-2xl relative overflow-hidden"
                          >
                            {/* Groove lines */}
                            <div className="absolute inset-2 rounded-full border border-zinc-900 opacity-40" />
                            <div className="absolute inset-4 rounded-full border border-zinc-900 opacity-40" />
                            <div className="absolute inset-6 rounded-full border border-zinc-900 opacity-40" />
                            
                            {/* Inner label */}
                            <div className="w-8 h-8 rounded-full bg-purple-600 border border-zinc-800 flex items-center justify-center">
                              <Disc className="w-4 h-4 text-white" />
                            </div>
                          </motion.div>
                          
                          <span className="text-[10px] font-mono font-extrabold text-zinc-300 mt-3 tracking-widest bg-zinc-950/80 px-2 py-0.5 rounded-full border border-white/5">
                            QUESTÃO {activeChallenge.id.replace("-1.", "")}
                          </span>
                        </div>

                        {/* Animated Equalizer Visualizer at the bottom when playing */}
                        {isPlaying && (
                          <div className="flex items-end justify-center gap-[3px] h-8 w-full absolute bottom-2 left-0 bg-transparent px-4">
                            {[0.6, 1.2, 0.4, 0.9, 1.5, 0.8, 1.3, 0.5].map((delay, index) => (
                              <motion.div
                                key={index}
                                animate={{ height: ["15%", "90%", "15%"] }}
                                transition={{
                                  repeat: Infinity,
                                  duration: delay,
                                  ease: "easeInOut"
                                }}
                                className="w-1.5 rounded-t bg-emerald-500"
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* B. Spotify-style Metadata, Slider and Controls */}
                      <div className="flex-1 w-full space-y-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 uppercase font-bold tracking-wider">
                            <Music2 className="w-4 h-4" />
                            <span>Gabarito Explicativo</span>
                          </div>
                          <h3 className="text-base font-extrabold text-white tracking-tight leading-tight">
                            {activeChallenge.titulo.replace(/^Questão \d+:\s*/, "")}
                          </h3>
                          <p className="text-xs text-zinc-400">
                            Explicado por: <span className="text-zinc-200 font-semibold">Prof. Fábio</span> &bull; Simulador de RH
                          </p>
                        </div>

                        {/* Media player panel */}
                        {activeFileId ? (
                          driveInfo.isFolder ? (
                            isLoadingFolder ? (
                              <div className="flex flex-col items-center justify-center gap-2 py-6 bg-zinc-950/40 border border-zinc-800/50 rounded-xl w-full">
                                <Loader2 className="w-6 h-6 animate-spin text-emerald-500" />
                                <span className="text-xs text-zinc-400 font-mono">Conectando à pasta do Google Drive...</span>
                              </div>
                            ) : folderFiles.length === 0 ? (
                              <div className="space-y-3 bg-zinc-950/60 border border-red-500/20 rounded-xl p-4 relative overflow-hidden w-full">
                                <div className="flex items-start gap-3">
                                  <div className="p-2 bg-red-500/10 text-red-500 rounded-lg border border-red-500/20">
                                    <Folder className="w-5 h-5 text-red-500" />
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-[10px] font-mono text-red-500 font-bold uppercase tracking-wider block">
                                      Nenhum Arquivo Encontrado
                                    </span>
                                    <p className="text-xs text-zinc-300 leading-relaxed">
                                      Nenhum arquivo de áudio foi encontrado na pasta ou ela está vazia. Verifique as configurações.
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-3 bg-zinc-950/40 border border-zinc-800/50 rounded-xl p-3 w-full">
                                {/* Custom audio selector */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 font-bold uppercase tracking-wider">
                                    <span className="flex items-center gap-1 text-emerald-400">
                                      <Folder className="w-3.5 h-3.5" /> EXPLICAÇÕES DA PASTA
                                    </span>
                                    <span className="text-[9px] text-zinc-500">
                                      {folderFiles.length} arquivos
                                    </span>
                                  </div>
                                  <div className="relative">
                                    <select
                                      value={selectedFolderFile?.id || ""}
                                      onChange={(e) => {
                                        const file = folderFiles.find(f => f.id === e.target.value);
                                        if (file) {
                                          setSelectedFolderFile(file);
                                          setAudioError(null);
                                          setIsPlaying(false);
                                          setCurrentTime(0);
                                        }
                                      }}
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer appearance-none pr-8 font-mono"
                                    >
                                      <option value="" disabled className="bg-zinc-950 text-zinc-500">
                                        -- Selecione uma gravação --
                                      </option>
                                      {folderFiles.map((file) => (
                                        <option key={file.id} value={file.id} className="bg-zinc-950 text-zinc-300 font-mono">
                                          {file.name}
                                        </option>
                                      ))}
                                    </select>
                                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-400">
                                      <ChevronDown className="w-4 h-4" />
                                    </div>
                                  </div>

                                  {/* Info badge */}
                                  {selectedFolderFile ? (
                                    selectedFolderFile.id === (matchedFile as { id: string; name: string } | null)?.id ? (
                                      <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-emerald-400 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">
                                        <Sparkles className="w-3 h-3 text-emerald-400" />
                                        <span>Áudio correspondente autodetectado para esta questão!</span>
                                      </div>
                                    ) : (
                                      <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                                        <span>Você selecionou este áudio manualmente na pasta.</span>
                                      </div>
                                    )
                                  ) : (
                                    <div className="flex items-center gap-1.5 text-[9.5px] font-mono text-amber-400 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">
                                      <AlertTriangle className="w-3 h-3 text-amber-500" />
                                      <span>Nenhum áudio correspondente para a Questão {activeChallenge.id.replace("-1.", "")}. Escolha um acima.</span>
                                    </div>
                                  )}
                                </div>

                                {/* Shared Audio Player Controls */}
                                {selectedFolderFile && (
                                  <div className="space-y-3 w-full pt-2 border-t border-zinc-800/40">
                                    {/* Spotify-style Slider Progress */}
                                    <div className="space-y-1">
                                      <input
                                        type="range"
                                        min={0}
                                        max={duration || 100}
                                        value={currentTime}
                                        onChange={handleSeekChange}
                                        className="w-full h-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-colors"
                                      />
                                      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                        <span>{formatTime(currentTime)}</span>
                                        <span>{formatTime(duration)}</span>
                                      </div>
                                    </div>

                                    {/* Play, Volume and Mute in one Spotify Row */}
                                    <div className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-3">
                                        {/* Play Button */}
                                        <button
                                          onClick={togglePlay}
                                          className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                            isPlaying
                                              ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(30,215,96,0.3)] hover:scale-105"
                                              : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-md"
                                          }`}
                                          title={isPlaying ? "Pausar" : "Ouvir Explicação"}
                                        >
                                          {isPlaying ? <Pause className="w-5 h-5 fill-black text-black" /> : <Play className="w-5 h-5 fill-black text-black ml-0.5" />}
                                        </button>

                                        {/* Reset Track Button */}
                                        <button
                                          onClick={() => {
                                            if (audioRef.current) {
                                              audioRef.current.currentTime = 0;
                                              setCurrentTime(0);
                                              playSoundEffect("click");
                                            }
                                          }}
                                          className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                          title="Reiniciar Áudio"
                                        >
                                          <RotateCcw className="w-4 h-4" />
                                        </button>
                                      </div>

                                      {/* Volume Controls */}
                                      <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 rounded-full border border-zinc-800">
                                        <button
                                          onClick={toggleMute}
                                          className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                          title={isMuted ? "Tirar do Mudo" : "Mudo"}
                                        >
                                          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                                        </button>
                                        <input
                                          type="range"
                                          min={0}
                                          max={1}
                                          step={0.1}
                                          value={isMuted ? 0 : volume}
                                          onChange={handleVolumeChange}
                                          className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                        />
                                      </div>
                                    </div>

                                    {audioError && (
                                      <p className="text-[10px] font-mono text-rose-400 flex flex-wrap items-center gap-1 bg-rose-500/5 p-2 border border-rose-500/10 rounded leading-relaxed">
                                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                        <span>{audioError}</span>
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          ) : (
                            // It's a single file URL (could be direct Cloudinary link)
                            <div className="space-y-3 w-full bg-zinc-950/20 border border-zinc-800/40 rounded-xl p-3">
                              {/* Spotify-style Slider Progress */}
                              <div className="space-y-1">
                                <input
                                  type="range"
                                  min={0}
                                  max={duration || 100}
                                  value={currentTime}
                                  onChange={handleSeekChange}
                                  className="w-full h-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-emerald-500 transition-colors"
                                />
                                <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                                  <span>{formatTime(currentTime)}</span>
                                  <span>{formatTime(duration)}</span>
                                </div>
                              </div>

                              {/* Play, Volume and Mute in one Spotify Row */}
                              <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                  {/* Play Button */}
                                  <button
                                    onClick={togglePlay}
                                    className={`w-11 h-11 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                                      isPlaying
                                        ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(30,215,96,0.3)] hover:scale-105"
                                        : "bg-emerald-500 text-black hover:bg-emerald-400 hover:scale-105 active:scale-95 shadow-md"
                                    }`}
                                    title={isPlaying ? "Pausar" : "Ouvir Explicação"}
                                  >
                                    {isPlaying ? <Pause className="w-5 h-5 fill-black text-black" /> : <Play className="w-5 h-5 fill-black text-black ml-0.5" />}
                                  </button>

                                  {/* Reset Track Button */}
                                  <button
                                    onClick={() => {
                                      if (audioRef.current) {
                                        audioRef.current.currentTime = 0;
                                        setCurrentTime(0);
                                        playSoundEffect("click");
                                      }
                                    }}
                                    className="p-2 text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    title="Reiniciar Áudio"
                                  >
                                    <RotateCcw className="w-4 h-4" />
                                  </button>

                                  {/* Indicator if hosted on Cloudinary */}
                                  {activeFileId.includes("cloudinary.com") && (
                                    <span className="text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">
                                      Cloudinary HD
                                    </span>
                                  )}
                                </div>

                                {/* Volume Controls */}
                                <div className="flex items-center gap-2 bg-zinc-950/40 px-2.5 py-1.5 rounded-full border border-zinc-800">
                                  <button
                                    onClick={toggleMute}
                                    className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
                                    title={isMuted ? "Tirar do Mudo" : "Mudo"}
                                  >
                                    {isMuted ? <VolumeX className="w-4 h-4 text-rose-400 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
                                  </button>
                                  <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.1}
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                  />
                                </div>
                              </div>

                              {audioError && (
                                <p className="text-[10px] font-mono text-rose-400 flex flex-wrap items-center gap-1 bg-rose-500/5 p-2 border border-rose-500/10 rounded leading-relaxed">
                                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                                  <span>{audioError}</span>
                                </p>
                              )}
                            </div>
                          )
                        ) : (
                          <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-3 flex items-center gap-3 text-xs text-zinc-400">
                            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                            <div>
                              <span className="font-bold text-amber-500 block">Gravação indisponível</span>
                              O Professor Fábio ainda está preparando o áudio para esta questão no Cloudinary/Drive.
                            </div>
                          </div>
                        )}

                        {/* HIGH-FIDELITY PROFESSOR CLOUDINARY & DRIVE UPLOAD WIDGET */}
                        {isProfessorOrAdmin && (
                          <div className="bg-zinc-950/90 border border-zinc-800 rounded-2xl p-4 space-y-3 mt-3 relative overflow-hidden">
                            <div className="flex items-center justify-between gap-3 border-b border-zinc-800/60 pb-2">
                              <span className="text-[10px] font-mono text-zinc-300 font-extrabold uppercase tracking-wider flex items-center gap-1.5">
                                <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> Painel de Mídia (Professor Fábio)
                              </span>
                              {!isEditingAudio ? (
                                <button
                                  onClick={() => setIsEditingAudio(true)}
                                  className="text-[9px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded hover:bg-emerald-500/10 flex items-center gap-1 cursor-pointer transition-colors"
                                >
                                  <Edit2 className="w-2.5 h-2.5" /> EDITAR FONTE OU LINK
                                </button>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    onClick={handleSaveAudioId}
                                    disabled={isSavingAudio}
                                    className="text-[9px] font-mono text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded hover:bg-emerald-500/10 flex items-center gap-1 cursor-pointer disabled:opacity-50 transition-colors"
                                  >
                                    <Save className="w-2.5 h-2.5" /> {isSavingAudio ? "Salvando..." : "SALVAR LINK"}
                                  </button>
                                  <button
                                    onClick={() => {
                                      setEditingFileId(audioGabaritos[activeChallenge.id] || "");
                                      setIsEditingAudio(false);
                                    }}
                                    className="text-[9px] font-mono text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1 cursor-pointer transition-colors"
                                  >
                                    CANCELAR
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Cloudinary File Drag-and-Drop / Click Upload Area */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
                              {/* Left column: Quick Cloudinary Drag/Click Upload */}
                              <div className="flex flex-col justify-center">
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={handleCloudinaryFileUpload}
                                  accept="audio/*"
                                  className="hidden"
                                />
                                <button
                                  disabled={isUploadingCloudinary}
                                  onClick={() => fileInputRef.current?.click()}
                                  className={`border border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                                    isUploadingCloudinary
                                      ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-400"
                                      : "border-zinc-700 bg-zinc-900/40 hover:border-emerald-500/50 hover:bg-zinc-900/80 hover:text-emerald-400 text-zinc-400"
                                  }`}
                                >
                                  {isUploadingCloudinary ? (
                                    <>
                                      <Loader2 className="w-6 h-6 animate-spin text-emerald-400 mb-1.5" />
                                      <span className="text-xs font-bold font-mono">Enviando para o Cloudinary...</span>
                                      <span className="text-[9px] text-zinc-500 mt-1">Isso evita quaisquer problemas de permissão do Drive!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-6 h-6 mb-1.5 opacity-80" />
                                      <span className="text-xs font-bold font-mono">Upload Direto (Cloudinary)</span>
                                      <span className="text-[9px] text-zinc-500 mt-0.5">Clique ou arraste arquivo de áudio (.mp3, .wav, .m4a)</span>
                                    </>
                                  )}
                                </button>
                                {cloudinaryUploadError && (
                                  <p className="text-[9px] font-mono text-rose-400 mt-1 flex items-center gap-1">
                                    <AlertTriangle className="w-3 h-3" /> {cloudinaryUploadError}
                                  </p>
                                )}
                              </div>

                              {/* Right column: Source link display / manual inputs */}
                              <div className="flex flex-col justify-between bg-zinc-900/60 rounded-xl p-3 border border-zinc-800/40 text-xs">
                                {isEditingAudio ? (
                                  <div className="space-y-1.5">
                                    <label className="text-[9px] font-mono text-zinc-400 uppercase font-bold block">Inserir link manualmente</label>
                                    <input
                                      type="text"
                                      value={editingFileId}
                                      onChange={(e) => setEditingFileId(e.target.value)}
                                      placeholder="Cole link do Drive, Cloudinary ou URL direta"
                                      className="w-full bg-zinc-950 border border-zinc-800 rounded p-1.5 text-xs text-white placeholder-zinc-600 font-mono focus:outline-none focus:border-emerald-500/40"
                                    />
                                    <p className="text-[8px] font-mono text-zinc-500 leading-tight">
                                      Aceita links de pastas inteiras do Google Drive para reprodução sequencial autodetectada, ou links diretos.
                                    </p>
                                  </div>
                                ) : (
                                  <div className="space-y-2 flex flex-col justify-center h-full">
                                    <div className="space-y-0.5">
                                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wider block">Fonte de Áudio Cadastrada</span>
                                      <p className="text-xs text-zinc-200 font-bold truncate max-w-[200px] font-mono">
                                        {activeFileId ? activeFileId : <span className="font-normal italic text-zinc-500">Nenhum áudio cadastrado ainda</span>}
                                      </p>
                                    </div>
                                    <div className="text-[9px] font-mono text-zinc-400 bg-zinc-950/60 p-1.5 rounded border border-zinc-800 leading-snug">
                                      <span className="font-bold text-emerald-400">Recomendado:</span> Faça o upload acima para hospedar o áudio no Cloudinary de forma 100% segura e direta!
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Sequential Navigation Control buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/5">
                      <button
                        onClick={handlePrevChallenge}
                        disabled={trainingChallenges.findIndex((c) => c.id === activeChallenge.id) === 0}
                        className="px-4 py-2 bg-slate-900 border border-white/5 hover:border-white/15 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Anterior</span>
                      </button>

                      <div className="text-xs font-mono text-slate-400">
                        {trainingChallenges.findIndex((c) => c.id === activeChallenge.id) + 1} de {trainingChallenges.length}
                      </div>

                      {/* Next button - only enabled if next is unlocked */}
                      <button
                        onClick={handleNextChallenge}
                        disabled={
                          trainingChallenges.findIndex((c) => c.id === activeChallenge.id) === trainingChallenges.length - 1 ||
                          !unlockedMap[trainingChallenges[trainingChallenges.findIndex((c) => c.id === activeChallenge.id) + 1]?.id]
                        }
                        className="px-4 py-2 bg-slate-900 border border-white/5 hover:border-white/15 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Próxima</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <HelpCircle className="w-12 h-12 text-slate-600 mb-2 animate-bounce" />
              <p>Nenhuma questão selecionada no painel de tópicos.</p>
            </div>
          )}

        </div>

      </div>

      {/* FOOTER NOTICE */}
      <footer className="z-10 bg-slate-950 border-t border-white/5 p-4 text-center text-[10px] font-mono text-slate-500">
        Nome Recomendado para a Pasta no Drive do Professor:{" "}
        <span className="text-cyan-400 font-bold">"WorkSIM - Gabarito de Áudio (Zona de Treinamento)"</span>. 
        Assegure que os áudios tenham compartilhamento configurado como "Qualquer pessoa com o link".
      </footer>
    </div>
  );
};
