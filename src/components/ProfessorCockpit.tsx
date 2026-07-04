/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { Student, Challenge, SquadLog } from "../types";
import { CHALLENGES_DATA, CAREER_PHASES } from "../data";
import {
  Camera,
  FileSpreadsheet,
  Loader2,
  Sparkles,
  Search,
  Send,
  Download,
  Filter,
  HelpCircle,
  HardDrive,
  Cpu,
  Lock,
  TrendingUp,
  BarChart3,
  Users,
  Target,
  Sparkle,
  Zap,
  AlertTriangle,
  ShieldAlert,
  CheckCheck,
  MailOpen,
  Upload,
  Trash2,
  FileText,
  CheckCircle,
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Cloud,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp
} from "firebase/firestore";
import { db, auth } from "../lib/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ComposedChart,
  Cell
} from "recharts";

import DashboardAuditoria from "./DashboardAuditoria";

interface ProfessorCockpitProps {
  students: Student[];
  onAddStudents: (newStudents: Student[]) => void;
  onUnlockSquad: (machineId: string) => void;
  onPromoteStudent?: (studentId: string, nextPhase: number) => void;
  onOpenChat: (student: Student) => void;
  onResetStudentFocus?: (studentId: string) => void;
  onAnswerDoubt?: (studentId: string, doubtId: string, answerText: string) => void;
  onResetDoubtCounter?: (studentId: string) => void;
  onSendMessage?: (studentId: string, text: string) => void;
  veteranFeedbacks?: any[];
  onSetVeteranFeedbacks?: React.Dispatch<React.SetStateAction<any[]>>;
  customChallenges?: Challenge[];
  onSendCustomScenario?: (scenario: Challenge, targetStudentId: string | "ALL") => void;
  onUpdateStudent?: (studentId: string, updates: Partial<Student>) => void;
  squadLogs?: SquadLog[];
  onAssignSquad?: (machineId: string, studentIds: string[]) => void;
  onRemoveSquad?: (machineId: string) => void;
  onDeleteAllStudents?: () => void;
  onRestoreStudentsBackup?: (backupStudents: Student[]) => void;
  onSyncAllStudents?: () => void;
  onDeleteStudents?: (studentIds: string[]) => void;
  chatNotifications?: {
    id: string;
    studentId: string;
    studentName: string;
    text: string;
    timestamp: string;
  }[];
  appLanguage?: "pt" | "en";
  themeMode?: "dark" | "light";
  clockOffset?: number;
  releasedPhases?: number[];
  onUpdateReleasedPhases?: (released: number[]) => void;
}

export default function ProfessorCockpit({ 
  students, 
  onAddStudents, 
  onUnlockSquad, 
  onPromoteStudent, 
  onOpenChat,
  onResetStudentFocus,
  onAnswerDoubt,
  onResetDoubtCounter,
  onSendMessage,
  veteranFeedbacks = [],
  onSetVeteranFeedbacks,
  customChallenges = [],
  onSendCustomScenario,
  onUpdateStudent,
  squadLogs = [],
  onAssignSquad,
  onRemoveSquad,
  onDeleteAllStudents,
  onRestoreStudentsBackup,
  onSyncAllStudents,
  onDeleteStudents,
  chatNotifications = [],
  appLanguage = "pt",
  themeMode = "dark",
  clockOffset = 0,
  releasedPhases = [-1, 0, 2, 3, 4, 5, 6, 7],
  onUpdateReleasedPhases,
}: ProfessorCockpitProps) {
  const [globalClassroomFilter, setGlobalClassroomFilter] = useState<string>("TODAS");
  const [activeTabPanel, setActiveTabPanel] = useState<"operations" | "telemetry" | "feedbacks" | "analytics" | "scenarios" | "activity" | "auditoria">("analytics");
  const [selectedIdsForDeletion, setSelectedIdsForDeletion] = useState<string[]>([]);
  const [isDeletingSelection, setIsDeletingSelection] = useState<boolean>(false);
  const [isDownloadingQRs, setIsDownloadingQRs] = useState<boolean>(false);
  const [selectedClassForBadges, setSelectedClassForBadges] = useState<string>("TODAS");
  const [broadcastLogs, setBroadcastLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [profFeedbackFilter, setProfFeedbackFilter] = useState<string>("Todos");
  const [ocrInputText, setOcrInputText] = useState<string>(
    "Ana Souza Lima\nBruno Cesar Mendes\nCarla Roberta Dias\nDavid Silveira\nEstevao Neves"
  );
  const [isProcessingOcr, setIsProcessingOcr] = useState<boolean>(false);
  const [ocrPhase, setOcrPhase] = useState<string>("");
  const [squadMachineId, setSquadMachineId] = useState<string>("PC-04");
  const [unlockStatus, setUnlockStatus] = useState<string>("");
  const [squadSearchQuery, setSquadSearchQuery] = useState<string>("");
  const [selectedSquadStudentIds, setSelectedSquadStudentIds] = useState<string[]>([]);
  const [profSearchQuery, setProfSearchQuery] = useState<string>("");

  // --- Export/Import & Safety Backup Handlers ---
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const handleExportRoster = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `worksim_roster_backup_${new Date().toISOString().slice(0,10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error("Failed to export roster", e);
      alert("Erro ao exportar backup.");
    }
  };

  const handleImportRoster = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const file = event.target.files?.[0];
    if (!file) return;

    fileReader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (Array.isArray(parsed)) {
          const isValid = parsed.every(item => item && typeof item === 'object' && 'nomeCompleto' in item && 'matricula' in item);
          if (isValid) {
            if (window.confirm(`Deseja realmente restaurar ${parsed.length} alunos deste arquivo de backup? Isso substituirá a lista atual.`)) {
              if (onRestoreStudentsBackup) {
                onRestoreStudentsBackup(parsed);
                alert("Relação de alunos restaurada com sucesso!");
                setHasLocalBackup(true);
              }
            }
          } else {
            alert("Erro: O formato do arquivo JSON de backup é inválido.");
          }
        } else {
          alert("Erro: O formato do arquivo de backup deve ser uma lista de estudantes.");
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao ler ou processar o arquivo de backup.");
      }
    };
    fileReader.readAsText(file);
    event.target.value = "";
  };

  const [hasLocalBackup, setHasLocalBackup] = useState(() => {
    try {
      return !!localStorage.getItem("worksim_students_safety_backup");
    } catch {
      return false;
    }
  });

  const handleRestoreLocalSafetyBackup = () => {
    try {
      const cached = localStorage.getItem("worksim_students_safety_backup");
      const timestamp = localStorage.getItem("worksim_students_backup_timestamp");
      if (!cached) {
        alert("Nenhum backup local de segurança encontrado.");
        return;
      }
      const parsed = JSON.parse(cached);
      const formattedDate = timestamp ? new Date(Number(timestamp)).toLocaleString() : "data desconhecida";

      if (window.confirm(`Deseja restaurar o backup automático de segurança gerado em ${formattedDate}? Contém ${parsed.length} alunos.`)) {
        if (onRestoreStudentsBackup) {
          onRestoreStudentsBackup(parsed);
          alert("Alunos restaurados com sucesso a partir do backup automático!");
        }
      }
    } catch (e) {
      console.error(e);
      alert("Erro ao tentar restaurar backup local.");
    }
  };

  // Theme-based tooltip styles
  const tooltipBg = themeMode === "light" ? "#ffffff" : "#0f172a";
  const tooltipBorder = themeMode === "light" ? "#e2e8f0" : "rgba(255,255,255,0.08)";
  const tooltipText = themeMode === "light" ? "#1e293b" : "#f8fafc";
  const tooltipLabel = themeMode === "light" ? "#64748b" : "#94a3b8";

  // --- DERIVED DATA BASED ON GLOBAL CLASS FILTER ---
  const classrooms = Array.from(new Set(students.map(s => s.sala))).filter(Boolean).sort();
  const filteredStudentsByClass = students
    .filter(s => s.id !== "adm") // Always filter out ADM
    .filter(s => {
      if (globalClassroomFilter === "TODAS") return true;
      if (globalClassroomFilter === "ATIVOS") {
        const compNow = Date.now() + clockOffset;
        return s.lastSeen && Math.abs(compNow - s.lastSeen) < 210000;
      }
      return s.sala === globalClassroomFilter;
    });

  const studentsToDisplay = filteredStudentsByClass.filter(s => {
    if (!profSearchQuery.trim()) return true;
    const q = profSearchQuery.toLowerCase();
    return s.nomeCompleto.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
  });

  // --- ANALYTICS CALCULATIONS ---
  const challengeAccuracyData = CHALLENGES_DATA.map((ch) => {
    const correctCount = filteredStudentsByClass.filter((s) => s.respostasDesafios?.[ch.id] === true).length;
    const totalStudents = filteredStudentsByClass.length || 1;
    const accuracyRate = Math.round((correctCount / totalStudents) * 100);
    return {
      id: ch.id,
      titulo: ch.titulo,
      "Taxa de Acertos (%)": accuracyRate,
      "Alunos Resolvidos": correctCount,
      "Foco": ch.focoTecnico,
      shortLabel: `D${ch.id}`,
    };
  }).filter((item) => {
    // Return all Phase -1 and Phase 0 challenges or any challenge that has at least one completion
    return item.id.startsWith("-1.") || item.id.startsWith("0.") || item["Alunos Resolvidos"] > 0;
  });

  // Calculate insights
  const totalClassXp = filteredStudentsByClass.reduce((acc, s) => acc + s.xp, 0);
  const avgClassPrecision = Math.round(
    filteredStudentsByClass.reduce((acc, s) => acc + s.precisao, 0) / (filteredStudentsByClass.filter(s => s.precisao > 0).length || 1)
  );

  const hardestChallenge = challengeAccuracyData.length > 0
    ? [...challengeAccuracyData]
        .filter(c => c["Alunos Resolvidos"] > 0)
        .sort((a, b) => a["Taxa de Acertos (%)"] - b["Taxa de Acertos (%)"])[0] || null
    : null;

  const topStudent = filteredStudentsByClass.length > 0
    ? [...filteredStudentsByClass].sort((a, b) => b.xp - a.xp || b.precisao - a.precisao)[0]
    : null;

  // --- ANALYTICS FOR PENDING DOUBTS & FOCUS ---
  const studentsWithDoubts = filteredStudentsByClass.filter(s => s.pausaAtiva === "duvida");
  const studentsBlocked = filteredStudentsByClass.filter(s => s.contaBloqueada === true);

  // --- STATE FOR CUSTOM SCENARIO BUILDER ---
  const [scenPresetNum, setScenPresetNum] = useState<number>(-1);
  const [scenId, setScenId] = useState<string>(`SCEN-${Date.now()}`);
  const [scenFase, setScenFase] = useState<number>(1);
  const [scenTitulo, setScenTitulo] = useState<string>("");
  const [scenTipo, setScenTipo] = useState<"Erro" | "Explicativo" | "Misto" | "Cálculo" | "Justa Causa">("Erro");
  const [scenFocoTecnico, setScenFocoTecnico] = useState<string>("");
  const [scenTempoLimiteMinutos, setScenTempoLimiteMinutos] = useState<number>(15);
  const [scenXpRecompensa, setScenXpRecompensa] = useState<number>(200);
  const [scenQueixa, setScenQueixa] = useState<string>("");
  
  // Empregado
  const [scenEmpNome, setScenEmpNome] = useState<string>("Maria Aparecida Santos");
  const [scenEmpCbo, setScenEmpCbo] = useState<string>("4110-10");
  const [scenEmpSalBase, setScenEmpSalBase] = useState<number>(2200.00);
  const [scenEmpAdmissao, setScenEmpAdmissao] = useState<string>("10/06/2024");
  const [scenEmpDataFato, setScenEmpDataFato] = useState<string>("04/06/2026");
  const [scenEmpJornada, setScenEmpJornada] = useState<string>("44h semanais (220h)");

  // Options
  const [scenOptA, setScenOptA] = useState<string>("");
  const [scenOptB, setScenOptB] = useState<string>("");
  const [scenOptC, setScenOptC] = useState<string>("");
  const [scenOptD, setScenOptD] = useState<string>("");
  const [scenCorrectOpt, setScenCorrectOpt] = useState<string>("A");

  // Gabarito
  const [scenArtigoLegal, setScenArtigoLegal] = useState<string>("");
  const [scenJustificativa, setScenJustificativa] = useState<string>("");

  // Target Student
  const [scenTargetStudentId, setScenTargetStudentId] = useState<string | "ALL">("ALL");
  const [scenStatusMsg, setScenStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleToggleStudentSelection = (id: string) => {
    setSelectedIdsForDeletion(prev => 
      prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = async () => {
    if (selectedIdsForDeletion.length === 0) return;
    
    setIsDeletingSelection(true);
    try {
      await onDeleteStudents?.(selectedIdsForDeletion);
      setSelectedIdsForDeletion([]);
    } catch (err) {
      console.error("[Cockpit] Error during deletion:", err);
    } finally {
      setIsDeletingSelection(false);
    }
  };

  // --- IN-DEPTH INDIVIDUAL TELEMETRY & REMEDIAL ACTIONS ---
  const [selectedTelemetryStudentId, setSelectedTelemetryStudentId] = useState<string | null>(null);
  const [telemetryActionStatus, setTelemetryActionStatus] = useState<{ studentId: string; msg: string; type: "success" | "error" } | null>(null);

  // --- STATE FOR BATCH ENROLLMENT VIA CLASS ATTENDANCE SHEET ---
  const [batchClassroom, setBatchClassroom] = useState<string>("1º B");
  const [batchYear, setBatchYear] = useState<number>(2026);
  const [batchRawInput, setBatchRawInput] = useState<string>("");
  const [batchSuccessMsg, setBatchSuccessMsg] = useState<string>("");
  const [isProcessingBatch, setIsProcessingBatch] = useState<boolean>(false);

  // --- COLLAPSIBLE PANELS STATE ---
  const [collapsedOcr, setCollapsedOcr] = useState<boolean>(true);
  const [collapsedPdfRepo, setCollapsedPdfRepo] = useState<boolean>(true);
  const [collapsedBatchEnroll, setCollapsedBatchEnroll] = useState<boolean>(true);
  const [collapsedBadgePrint, setCollapsedBadgePrint] = useState<boolean>(true);

  // --- BROADCAST LOGS LISTENER ---
  useEffect(() => {
    if (activeTabPanel !== "activity") return;
    if (!auth.currentUser) {
      console.warn("Skipping real-time broadcast logs fetching because user is not authenticated on Firebase.");
      setIsLogsLoading(false);
      return;
    }
    
    setIsLogsLoading(true);
    const q = query(
      collection(db, "broadcasts"),
      orderBy("timestamp", "desc"),
      limit(50)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setBroadcastLogs(logs);
      setIsLogsLoading(false);
    }, (error) => {
      console.error("Error fetching broadcast logs:", error);
      setIsLogsLoading(false);
    });

    return () => unsubscribe();
  }, [activeTabPanel]);

  // --- ARQUIVOS DE CHAMADAS EM PDF (UPAR E RETORNAR SUAS LINHAS) ---
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [folhasPdfs, setFolhasPdfs] = useState<{
    id: string;
    name: string;
    size: string;
    date: string;
    rowsCount: number;
    status: string;
    classroom: string;
  }[]>(() => {
    const cached = localStorage.getItem("worksim_folhas_pdfs");
    if (cached) return JSON.parse(cached);
    return [
      { id: "pdf-1", name: "Folha_Chamada_Maio_2026.pdf", size: "148 KB", date: "15/05/2026 10:20", rowsCount: 8, status: "Pronto", classroom: "1º B" },
      { id: "pdf-2", name: "Chamada_Logistica_01_06.pdf", size: "94 KB", date: "01/06/2026 08:30", rowsCount: 5, status: "Pronto", classroom: "2º A" }
    ];
  });

  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadPhase, setPdfUploadPhase] = useState("");
  const [pdfUploadProgress, setPdfUploadProgress] = useState(0);
  const [pdfErrorMsg, setPdfErrorMsg] = useState("");
  const [pdfSuccessMsg, setPdfSuccessMsg] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);

  useEffect(() => {
    localStorage.setItem("worksim_folhas_pdfs", JSON.stringify(folhasPdfs));
  }, [folhasPdfs]);

  const handlePdfFileImport = async (file: File) => {
    const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
    if (!allowedTypes.includes(file.type) && !file.name.toLowerCase().endsWith(".pdf")) {
      setPdfErrorMsg("Erro de tipo: O sistema requer uma folha de chamada em formato Imagem ou PDF para verificação.");
      setTimeout(() => setPdfErrorMsg(""), 6000);
      return;
    }

    setPdfErrorMsg("");
    setPdfSuccessMsg("");
    setIsUploadingPdf(true);
    setPdfUploadProgress(10);
    setPdfUploadPhase("Iniciando conexão com Gemini AI...");

    try {
      const formData = new FormData();
      formData.append("attendanceSheet", file);
      formData.append("turma", batchClassroom || "1B");
      formData.append("eje", "RH"); // Multi-tenant Axis as requested

      setPdfUploadProgress(30);
      setPdfUploadPhase("Enviando arquivo para processamento neural...");

      const response = await fetch("/api/process-attendance-sheet", {
        method: "POST",
        body: formData,
      });

      setPdfUploadProgress(70);
      setPdfUploadPhase("Gemini extraindo nomes e matrículas...");

      if (!response.ok) {
        throw new Error("Falha no processamento pelo servidor.");
      }

      const data = await response.json();
      const extractedStudents: Student[] = data.students;

      setPdfUploadProgress(100);
      setPdfUploadPhase("Integrando registros ao banco de dados!");

      const now = new Date();
      const formattedDate = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      
      const newPdf = {
        id: `file-${Date.now()}`,
        name: file.name,
        size: `${Math.round(file.size / 1024)} KB`,
        date: formattedDate,
        rowsCount: extractedStudents.length,
        status: "Finalizado",
        classroom: batchClassroom || "1B"
      };

      setFolhasPdfs(prev => [newPdf, ...prev]);
      onAddStudents(extractedStudents);

      setIsUploadingPdf(false);
      setPdfSuccessMsg(`✓ Folha "${file.name}" processada com sucesso! ${extractedStudents.length} alunos matriculados via Gemini AI.`);
      setTimeout(() => setPdfSuccessMsg(""), 8000);
    } catch (error) {
      console.error("Erro no processamento Gemini:", error);
      setIsUploadingPdf(false);
      setPdfErrorMsg("Erro crítico: Não foi possível processar o arquivo. Verifique sua conexão com o Gemini ou se o arquivo é legível.");
      setTimeout(() => setPdfErrorMsg(""), 7000);
    }
  };

  const handleDeletePdf = (pdfId: string) => {
    setFolhasPdfs(prev => prev.filter(p => p.id !== pdfId));
  };

  // Pool of preset scenarios to choose from
  const SCENARIO_PRESETS: Challenge[] = [
    {
      id: "PRE-01",
      fase: 1,
      titulo: "Fardamento e Custo Obreiro",
      tipo: "Erro",
      focoTecnico: "Direito Trabalhista - Vestuário",
      tempoLimiteMinutos: 10,
      xpRecompensa: 180,
      empregado: {
        nome: "Júlio Cesar Ramos",
        cbo: "5111-05",
        salarioBase: 1980.00,
        dataAdmissao: "10/04/2025",
        dataFato: "01/06/2026",
        jornada: "220h"
      },
      queixa: "A gerência de logística publicou norma interna exigindo que todos os carregadores usem calça preta e sapato social específico, descontando o valor direto no salário deles como ferramenta de trabalho. O funcionário Júlio questiona o desconto. Qual a conduta correta?",
      gabarito: {
        tipoAcao: "Abonar Falta",
        valoresCorretos: {
          justificativa: "Conforme o artigo 456-A, parágrafo único da CLT, cabe ao empregador definir o padrão de vestuário no meio ambiente laboral e arcar integralmente com os custos dos uniformes e EPIs. O desconto no salário do trabalhador é manifestamente ilegal.",
        },
        artigoLegal: "Artigo 456-A, parágrafo único da CLT",
        respostaEsperadaId: "A"
      },
      opcoes: [
        { id: "A", texto: "Cancelar os descontos imediatamente e ressarcir os valores cobrados indevidamente, pois o uniforme obrigatório é ônus exclusivo do empregador." },
        { id: "B", texto: "Manter o desconto de até 20% do salário mínimo, conforme a tabela de utilidades de fornecimento básico." },
        { id: "C", texto: "Transferir o custo para o sindicato com base no acordo coletivo geral de compensação de ferramentas." },
        { id: "D", texto: "Exigir que o colaborador traga de casa as suas próprias vestimentas sem reembolso patronal." }
      ]
    },
    {
      id: "PRE-02",
      fase: 2,
      titulo: "Intervalo Intrajornada Suprimido",
      tipo: "Cálculo",
      focoTecnico: "Horas Extras e Intervalo",
      tempoLimiteMinutos: 15,
      xpRecompensa: 220,
      empregado: {
        nome: "Bruna Gomes Silveira",
        cbo: "4110-10",
        salarioBase: 2640.00,
        dataAdmissao: "14/09/2024",
        dataFato: "02/06/2026",
        jornada: "180h"
      },
      queixa: "A funcionária Bruna trabalha 8 horas diárias, mas devido à alta demanda logística do e-commerce, sua folha de ponto aponta que ela usufruiu de apenas 30 minutos de almoço (dos 60 regulamentares) durante 10 dias no mês. Qual a forma correta de pagar pelo tempo não gozado?",
      gabarito: {
        tipoAcao: "Retificar Folha",
        valoresCorretos: {
          justificativa: "Conforme art. 71, § 4º da CLT, a não concessão ou a concessão parcial do intervalo intrajornada mínimo gera o direito ao pagamento apenas do período suprimido (30 minutos diários) com acréscimo de 50%, de natureza estritamente indenizatória.",
        },
        artigoLegal: "Artigo 71, § 4º da CLT",
        respostaEsperadaId: "C"
      },
      opcoes: [
        { id: "A", texto: "Pagar 1 hora cheia de hora extra para cada dia de concessão parcial, integrando as médias no FGTS e DSR." },
        { id: "B", texto: "Ignorar o pagamento por se tratar de cargo de confiança insuscetível a controle de jornada nos termos do Art. 62." },
        { id: "C", texto: "Pagar o tempo suprimido (30 minutos diários) com adicional de 50% em caráter exclusivamente indenizatório (sem reflexos no DSR)." },
        { id: "D", texto: "Zerar o saldo compensando os 30 minutos em banco de horas sem necessidade de desembolso pecuniário complementar." }
      ]
    },
    {
      id: "PRE-03",
      fase: 3,
      titulo: "Justa Causa por Desídia Reincidente",
      tipo: "Justa Causa",
      focoTecnico: "Aplicação Segura do Artigo 482",
      tempoLimiteMinutos: 15,
      xpRecompensa: 280,
      empregado: {
        nome: "Thiago Ramos Pinheiro",
        cbo: "3513-05",
        salarioBase: 3100.00,
        dataAdmissao: "01/02/2024",
        dataFato: "05/06/2026",
        jornada: "220h"
      },
      queixa: "Thiago Ramos já acumulou 4 advertências escritas e 2 suspensões formais no último semestre decorrentes de faltas injustificadas, atrasos crônicos e absoluto desinteresse no desempenho das funções. Hoje faltou novamente sem justificativa técnica. Qual a conduta legítima do DP?",
      gabarito: {
        tipoAcao: "Aplicar Justa Causa",
        valoresCorretos: {
          justificativa: "O histórico cumulativo e atualizado de faltas injustificadas precedidas de punições pedagógicas graduais (advertências e suspensões) caracteriza a desídia, amparando a rescisão motivada (Justa Causa) with fulcro no Art. 482, alínea 'e' da CLT.",
        },
        artigoLegal: "Artigo 482, alínea 'e' da CLT",
        respostaEsperadaId: "B"
      },
      opcoes: [
        { id: "A", texto: "Aplicar uma terceira suspensão disciplinar de 10 dias úteis e aguardar mais uma recorrência do comportamento." },
        { id: "B", texto: "Efetuar a rescisão motivada do contrato de trabalho por Justa Causa em decorrência de desídia na execução das funções." },
        { id: "C", texto: "Desligar o colaborador sem justa causa pagando o saldo rescisório com dispensa do aviso prévio trabalhado legal." },
        { id: "D", texto: "Solicitar abertura de inquérito de apuração de falta grave no sindicato patronal local." }
      ]
    }
  ];

  const handleApplyPreset = (index: number) => {
    if (index === -1) {
      setScenPresetNum(-1);
      setScenTitulo("");
      setScenFase(1);
      setScenFocoTecnico("");
      setScenQueixa("");
      setScenOptA("");
      setScenOptB("");
      setScenOptC("");
      setScenOptD("");
      setScenArtigoLegal("");
      setScenJustificativa("");
      return;
    }
    const preset = SCENARIO_PRESETS[index];
    setScenPresetNum(index);
    setScenId(`SCEN-${Date.now()}`);
    setScenFase(preset.fase);
    setScenTitulo(preset.titulo);
    setScenTipo(preset.tipo);
    setScenFocoTecnico(preset.focoTecnico);
    setScenTempoLimiteMinutos(preset.tempoLimiteMinutos);
    setScenXpRecompensa(preset.xpRecompensa);
    setScenQueixa(preset.queixa);
    
    setScenEmpNome(preset.empregado.nome);
    setScenEmpCbo(preset.empregado.cbo);
    setScenEmpSalBase(preset.empregado.salarioBase);
    setScenEmpAdmissao(preset.empregado.dataAdmissao);
    setScenEmpDataFato(preset.empregado.dataFato);
    setScenEmpJornada(preset.empregado.jornada);

    setScenOptA(preset.opcoes?.[0]?.texto || "");
    setScenOptB(preset.opcoes?.[1]?.texto || "");
    setScenOptC(preset.opcoes?.[2]?.texto || "");
    setScenOptD(preset.opcoes?.[3]?.texto || "");
    setScenCorrectOpt(preset.gabarito.respostaEsperadaId);
    
    setScenArtigoLegal(preset.gabarito.artigoLegal);
    setScenJustificativa(preset.gabarito.valoresCorretos?.justificativa || "");
    
    setScenStatusMsg({ type: "success", text: `✓ Preset "${preset.titulo}" carregado com sucesso no formulário!` });
    setTimeout(() => setScenStatusMsg(null), 3000);
  };

  const handleExportScenarioJSON = () => {
    const scenarioData: Challenge = {
      id: scenId,
      fase: Number(scenFase),
      titulo: scenTitulo || "Sem Título",
      tipo: scenTipo,
      focoTecnico: scenFocoTecnico || "Geral",
      tempoLimiteMinutos: Number(scenTempoLimiteMinutos),
      xpRecompensa: Number(scenXpRecompensa),
      empregado: {
        nome: scenEmpNome || "Servidor Alvo",
        cbo: scenEmpCbo || "4110-10",
        salarioBase: Number(scenEmpSalBase) || 1512.00,
        dataAdmissao: scenEmpAdmissao || "01/01/2026",
        dataFato: scenEmpDataFato || "01/06/2026",
        jornada: scenEmpJornada || "220h"
      },
      queixa: scenQueixa || "Sem queixa detalhada.",
      gabarito: {
        tipoAcao: scenTipo === "Justa Causa" ? "Aplicar Justa Causa" : scenTipo === "Cálculo" ? "Retificar Folha" : "Apenas Explicar",
        valoresCorretos: {
          justificativa: scenJustificativa || "Sem justificativa."
        },
        artigoLegal: scenArtigoLegal || "Geral CLT",
        respostaEsperadaId: scenCorrectOpt
      },
      opcoes: [
        { id: "A", texto: scenOptA || "Opção A descrita" },
        { id: "B", texto: scenOptB || "Opção B descrita" },
        { id: "C", texto: scenOptC || "Opção C descrita" },
        { id: "D", texto: scenOptD || "Opção D descrita" }
      ].filter(o => o.texto.trim().length > 0)
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenarioData, null, 2));
    const downloadNode = document.createElement("a");
    downloadNode.setAttribute("href", dataStr);
    downloadNode.setAttribute("download", `Cenario-${scenTitulo.replace(/\s+/g, "_") || "Personalizado"}.json`);
    document.body.appendChild(downloadNode);
    downloadNode.click();
    downloadNode.remove();
    
    setScenStatusMsg({ type: "success", text: `✓ Cenário JSON gerado e exportado com êxito para seus downloads!` });
    setTimeout(() => setScenStatusMsg(null), 4000);
  };

  const handleImportScenarioJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed: Challenge = JSON.parse(event.target?.result as string);
        if (!parsed.titulo || !parsed.queixa) {
          throw new Error("Arquivo JSON de Cenário inválido. Campos essenciais ausentes.");
        }

        setScenId(parsed.id || `SCEN-${Date.now()}`);
        setScenFase(parsed.fase ?? 1);
        setScenTitulo(parsed.titulo);
        setScenTipo(parsed.tipo || "Erro");
        setScenFocoTecnico(parsed.focoTecnico || "Geral");
        setScenTempoLimiteMinutos(parsed.tempoLimiteMinutos || 15);
        setScenXpRecompensa(parsed.xpRecompensa || 200);
        setScenQueixa(parsed.queixa);

        if (parsed.empregado) {
          setScenEmpNome(parsed.empregado.nome || "Não definido");
          setScenEmpCbo(parsed.empregado.cbo || "4110-10");
          setScenEmpSalBase(parsed.empregado.salarioBase || 1512.00);
          setScenEmpAdmissao(parsed.empregado.dataAdmissao || "01/01/2026");
          setScenEmpDataFato(parsed.empregado.dataFato || "01/01/2026");
          setScenEmpJornada(parsed.empregado.jornada || "220h");
        }

        if (parsed.opcoes) {
          setScenOptA(parsed.opcoes[0]?.texto || "");
          setScenOptB(parsed.opcoes[1]?.texto || "");
          setScenOptC(parsed.opcoes[2]?.texto || "");
          setScenOptD(parsed.opcoes[3]?.texto || "");
        }

        setScenCorrectOpt(parsed.gabarito?.respostaEsperadaId || "A");
        setScenArtigoLegal(parsed.gabarito?.artigoLegal || "CLT");
        setScenJustificativa(parsed.gabarito?.valoresCorretos?.justificativa || "");

        setScenStatusMsg({ type: "success", text: `✓ Cenário "${parsed.titulo}" importado e carregado no formulário!` });
        setTimeout(() => setScenStatusMsg(null), 3000);
      } catch (err: any) {
        setScenStatusMsg({ type: "error", text: `❌ Falha ao importar cenário: ${err.message}` });
        setTimeout(() => setScenStatusMsg(null), 4000);
      }
    };
    reader.readAsText(file);
  };

  const handleDispatchScenarioToStudents = () => {
    if (!scenTitulo.trim()) {
      setScenStatusMsg({ type: "error", text: "❌ Erro: O título do cenário precisa ser preenchido!" });
      setTimeout(() => setScenStatusMsg(null), 4000);
      return;
    }
    if (!scenQueixa.trim()) {
      setScenStatusMsg({ type: "error", text: "❌ Erro: A queixa/descrição do colaborador precisa ser preenchida!" });
      setTimeout(() => setScenStatusMsg(null), 4000);
      return;
    }
    if (!scenOptA.trim() || !scenOptB.trim()) {
      setScenStatusMsg({ type: "error", text: "❌ Erro: Preencha pelo menos as opções A e B para formular as alternativas!" });
      setTimeout(() => setScenStatusMsg(null), 4000);
      return;
    }

    const constructedScenario: Challenge = {
      id: scenId,
      fase: Number(scenFase),
      titulo: scenTitulo,
      tipo: scenTipo,
      focoTecnico: scenFocoTecnico || "Prática Logística",
      tempoLimiteMinutos: Number(scenTempoLimiteMinutos),
      xpRecompensa: Number(scenXpRecompensa),
      empregado: {
        nome: scenEmpNome,
        cbo: scenEmpCbo,
        salarioBase: Number(scenEmpSalBase),
        dataAdmissao: scenEmpAdmissao,
        dataFato: scenEmpDataFato,
        jornada: scenEmpJornada
      },
      queixa: scenQueixa,
      gabarito: {
        tipoAcao: scenTipo === "Justa Causa" ? "Aplicar Justa Causa" : scenTipo === "Cálculo" ? "Retificar Folha" : "Apenas Explicar",
        valoresCorretos: {
          justificativa: scenJustificativa
        },
        artigoLegal: scenArtigoLegal,
        respostaEsperadaId: scenCorrectOpt
      },
      opcoes: [
        { id: "A", texto: scenOptA },
        { id: "B", texto: scenOptB },
        { id: "C", texto: scenOptC || "Opção C complementar" },
        { id: "D", texto: scenOptD || "Opção D complementar" }
      ].filter(o => o.texto.trim().length > 0)
    };

    if (onSendCustomScenario) {
      onSendCustomScenario(constructedScenario, scenTargetStudentId);
      
      const targetName = scenTargetStudentId === "ALL" 
        ? "Todos os Alunos simultaneamente!" 
        : (students.find(s => s.id === scenTargetStudentId)?.nomeCompleto || "Aluno Selecionado");

      setScenStatusMsg({ 
        type: "success", 
        text: `🚀 SUCESSO COLETIVO! Cenário "${scenTitulo}" direcionado IMEDIATAMENTE para ${targetName}` 
      });
      
      // Reset ID to let next creation take a new ID
      setScenId(`SCEN-${Date.now()}`);
      setTimeout(() => setScenStatusMsg(null), 5000);
    } else {
      setScenStatusMsg({ type: "error", text: "❌ Erro operacional: Callback de envio não vinculado no App." });
      setTimeout(() => setScenStatusMsg(null), 4000);
    }
  };

  // --- TELEMETRY CALCULATIONS ---
  
  // 1. Average XP Progression of the Class grouped by Fase Atual
  const maxPhaseInClass = filteredStudentsByClass.length > 0
    ? Math.max(...filteredStudentsByClass.map((s) => s.faseAtual), 0)
    : 0;
  const phasesCohort = [-1, 0, 1, 2, 3, 4, 5, 6, 7].filter((p) => p <= maxPhaseInClass);
  const xpProgressionData = phasesCohort.map((phaseNum) => {
    const studentsInPhase = filteredStudentsByClass.filter((s) => s.faseAtual === phaseNum);
    const avgXp = studentsInPhase.length > 0
      ? Math.round(studentsInPhase.reduce((acc, s) => acc + s.xp, 0) / studentsInPhase.length)
      : 0;
    
    // Baseline XP targets expected for a student to clear or reach each phase
    const expectedXP = phaseNum === -1 ? 20 : phaseNum === 0 ? 140 : phaseNum === 1 ? 200 : phaseNum === 2 ? 300 : phaseNum === 3 ? 510 : 1000;
    
    return {
      fase: `F${phaseNum}`,
      "XP Médio": avgXp,
      "Referência Base": expectedXP,
      "Qtd Alunos": studentsInPhase.length,
    };
  });

  // 2. Accuracy Distribution per Challenge
  const challengeAccuracyDataPlaceholder = []; // Just a spacer

  // --- IN-DEPTH PEDAGOGICAL ANALYTICS & INTERVENTIONS ---
  const [activeIntervention, setActiveIntervention] = useState<string | null>(null);

  const triggerThemeWorkspaceClear = () => {
    setActiveIntervention("doubt-clear");
    let countResolved = 0;
    students.forEach((s) => {
      if (s.pausaAtiva === "duvida" || s.duvidaPendenteTexto) {
        const lastDoubt = s.duvidasHistorico?.find(d => !d.resolvida) || { id: "fallback" };
        if (onAnswerDoubt) {
          onAnswerDoubt(s.id, lastDoubt.id, "Suporte síncrono do Professor/Monitoria: Esclarecemos as principais regras da CLT aplicáveis a este caso. Dúvida sanada com sucesso!");
          countResolved++;
        }
      }
    });
    setTimeout(() => setActiveIntervention(null), 2500);
  };

  const triggerFocusRefurbish = () => {
    setActiveIntervention("focus-clear");
    let countCleared = 0;
    students.forEach((s) => {
      if (s.status === "Ativo" && (s.saidasTela || 0) > 0 && (s.saidasTela || 0) < 7) {
        if (onResetStudentFocus) {
          onResetStudentFocus(s.id);
          countCleared++;
        }
      }
    });
    setTimeout(() => setActiveIntervention(null), 2500);
  };

  const triggerCurriculumPillSim = () => {
    setActiveIntervention("pill");
    // Simulate sending an alert message in the system console about custom guidance
    setTimeout(() => setActiveIntervention(null), 2500);
  };

  // 1. Desempenho Coletivo por Fase
  const academyPhases = [-1, 0, 1, 2, 3, 4, 5, 6, 7];
  const phasePerformanceCohort = academyPhases.map((pId) => {
    const studentsInP = filteredStudentsByClass.filter((s) => s.faseAtual === pId);
    const count = studentsInP.length;

    // Average XP of students in this phase
    const avgXp = count > 0
      ? Math.round(studentsInP.reduce((acc, s) => acc + s.xp, 0) / count)
      : 0;

    // Average precision of students in this phase
    const studentsWithPrec = studentsInP.filter(s => s.precisao > 0);
    const avgPrecision = studentsWithPrec.length > 0
      ? Number((studentsWithPrec.reduce((acc, s) => acc + s.precisao, 0) / studentsWithPrec.length).toFixed(1))
      : 0;

    // Average completion percentage for current phase challenges
    const phaseChs = CHALLENGES_DATA.filter((c) => c.fase === pId);
    let completionPct = 0;
    if (phaseChs.length > 0) {
      const finishedSum = studentsInP.reduce((acc, s) => {
        const solved = phaseChs.filter(c => s.respostasDesafios?.[c.id] === true).length;
        return acc + solved;
      }, 0);
      completionPct = count > 0 ? Math.round((finishedSum / (phaseChs.length * count)) * 100) : 0;
    } else {
      completionPct = 0;
    }

    const cpCargo = CAREER_PHASES.find((cp) => cp.id === pId)?.cargo || `Fase ${pId}`;

    // General Efficiency index combining parameters
    const generalScore = Math.round((avgPrecision * 0.55) + (Math.min(100, (avgXp / (pId === 0 ? 200 : pId === 1 ? 800 : pId === 2 ? 1800 : 4000)) * 100) * 0.45));

    return {
      faseName: `Fase ${pId}`,
      cargo: cpCargo,
      "Alunos Ativos": count,
      "Precisão Média (%)": avgPrecision,
      "XP Médio": avgXp,
      "Taxa de Conclusão (%)": completionPct,
      "Desempenho Geral (%)": Math.min(100, generalScore),
      "Métrica Alvo": pId === 0 ? 100 : pId === 1 ? 85 : pId === 2 ? 90 : 95
    };
  });

  // 2. Learning Bottlenecks on Specific Challenges
  const challengesBottleneckRank = CHALLENGES_DATA.map((ch) => {
    let correct = 0;
    let incorrect = 0;
    let pendingDoubts = 0;

    filteredStudentsByClass.forEach((student) => {
      if (student.respostasDesafios?.[ch.id] === true) {
        correct++;
      } else if (student.respostasDesafios?.[ch.id] === false) {
        incorrect++;
      }

      // Check doubts
      if (student.pausaAtiva === "duvida" && student.duvidaPendenteTexto) {
        const doubtQuery = student.duvidaPendenteTexto.toLowerCase();
        if (
          doubtQuery.includes(ch.id) || 
          doubtQuery.includes(ch.titulo.toLowerCase()) || 
          doubtQuery.includes(ch.focoTecnico.toLowerCase())
        ) {
          pendingDoubts++;
        }
      }
    });

    const totalAttempts = correct + incorrect;
    const errorRate = totalAttempts > 0 ? Math.round((incorrect / totalAttempts) * 100) : 0;
    
    // Bottleneck score calculations (0-100) to find learning friction
    // If a student failed, it increases gravity tremendously
    const rawScore = totalAttempts > 0
      ? (incorrect * 30) + (errorRate * 0.45) + (pendingDoubts * 32)
      : (ch.fase * 10); // prospective hurdles

    const score = Math.min(100, Math.max(0, Math.round(rawScore)));

    return {
      id: ch.id,
      titulo: ch.titulo,
      faseNum: ch.fase,
      faseLabel: `Fase ${ch.fase}`,
      foco: ch.focoTecnico,
      "Acertos": correct,
      "Erros": incorrect,
      "Dúvidas": pendingDoubts,
      "Tentativas": totalAttempts,
      "Taxa de Erro (%)": errorRate,
      "Score de Gargalo": score,
      shortLabel: `D${ch.id}`
    };
  });

  // Sort challenges to highlight exact learning obstacles
  const identifiedBottlenecks = [...challengesBottleneckRank]
    .sort((a, b) => b["Score de Gargalo"] - a["Score de Gargalo"] || b["Erros"] - a["Erros"])
    .slice(0, 8);

  const handleSimulatedOCRUpload = () => {
    setIsProcessingOcr(true);
    setOcrPhase("Iniciando fita de leitura OCR...");
    
    // Line-by-line step mock indicators matching an advanced classroom setup
    setTimeout(() => {
      setOcrPhase("Separando canais de matriz de caracteres...");
      setTimeout(() => {
        setOcrPhase("Análise fonética e limpeza de termos nulos...");
        setTimeout(() => {
          const names = ocrInputText.split("\n").filter(n => n.trim().length > 0);
          const generated: Student[] = names.map((name) => {
            const tempId = Math.random().toString(36).substring(2, 9);
            const nextId = `OCR-${Date.now()}-${tempId}`;
            const rawName = name.trim();
            const matricula = `${tempId.toUpperCase()}2026RH`;
            return {
              id: nextId,
              nomeCompleto: rawName,
              matricula: matricula,
              sala: "1B",
              ano: 2026,
              cargo: "Estagiário de RH",
              xp: 0,
              precisao: 0.0,
              faseAtual: -1, 
              status: "Aguardando Ativação",
              respostasDesafios: {},
              chamadaNumero: tempId.slice(0, 2)
            };
          });

          onAddStudents(generated);
          setIsProcessingOcr(false);
          setOcrPhase("");
        }, 1200);
      }, 1000);
    }, 800);
  };

  const parseBatchInput = (inputText: string, classroom: string, year: number): Student[] => {
    const lines = inputText.split("\n").filter((l) => l.trim().length > 0);
    const compactClass = classroom.replace(/[^a-zA-Z0-9]/g, "").toUpperCase(); // "1º B" -> "1B"
    return lines.map((line, idx) => {
      const trimmed = line.trim();
      const numMatch = trimmed.match(/^(\d+)/);
      let callNum = String(idx + 1).padStart(2, "0");
      let rawName = trimmed;
      if (numMatch) {
         callNum = String(parseInt(numMatch[1], 10)).padStart(2, "0");
         rawName = trimmed.replace(/^\d+[\s\-.]*/, "");
      }
      
      const cleanName = rawName.trim();
      const generatedMatricula = `${compactClass}${callNum}${year}RH`;
      
      return {
        id: `STU-${compactClass}-${callNum}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`, 
        nomeCompleto: cleanName || `Aluno ${callNum}`,
        matricula: generatedMatricula,
        sala: classroom,
        ano: year,
        cargo: "Candidato de RH",
        xp: 0,
        precisao: 0.0,
        faseAtual: -1,
        status: "Ativo",
        respostasDesafios: {},
        chamadaNumero: callNum,
      };
    });
  };

  const handleRunBatchEnrollment = () => {
    setIsProcessingBatch(true);
    setTimeout(() => {
      const generated = parseBatchInput(batchRawInput, batchClassroom, batchYear);
      onAddStudents(generated);
      setIsProcessingBatch(false);
      setBatchSuccessMsg(`✓ Matrícula de Lote integrada! ${generated.length} alunos cadastrados com sucesso.`);
      setTimeout(() => setBatchSuccessMsg(""), 5000);
    }, 1200);
  };

  const handleManualUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanMachineId = squadMachineId.trim();
    if (!cleanMachineId) return;

    if (onAssignSquad && selectedSquadStudentIds.length > 0) {
      onAssignSquad(cleanMachineId, selectedSquadStudentIds);
      setUnlockStatus(`✓ Célula de computadores [${cleanMachineId}] liberada e integrada com o Squad de ${selectedSquadStudentIds.length} alunos!`);
      setSelectedSquadStudentIds([]);
      setSquadSearchQuery("");
    } else {
      onUnlockSquad(cleanMachineId);
      setUnlockStatus(`✓ Célula de computadores [${cleanMachineId}] liberada com sucesso pelo Professor!`);
    }
    setTimeout(() => setUnlockStatus(""), 5000);
  };

  // Download entire class metrics telemetry
  const handleExportTelemetry = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(students, null, 2));
    const downloadAction = document.createElement("a");
    downloadAction.setAttribute("href", dataStr);
    downloadAction.setAttribute("download", "WorkSim_Turma_1B_telemetry.json");
    document.body.appendChild(downloadAction);
    downloadAction.click();
    downloadAction.remove();
  };

  return (
    <div className="space-y-6">
      
      {/* Upper overview stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
            <LayoutDashboard className="w-5 h-5 text-accent-primary" />
          </div>
          <div>
            <h2 className="text-sm font-sans font-black text-gray-100 uppercase tracking-widest">Controle de Cohort</h2>
            <p className="text-[10px] text-text-secondary font-mono">Gestão de telemetria multiclasse e e-Social</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-950/40 p-1.5 rounded-xl border border-white/5">
          <span className="text-[9px] font-mono font-bold text-gray-500 uppercase ml-2">Filtrar Turma:</span>
          <select 
            value={globalClassroomFilter}
            onChange={(e) => setGlobalClassroomFilter(e.target.value)}
            className="bg-slate-900 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-accent-primary focus:outline-none focus:border-accent-primary/40 transition-all cursor-pointer"
          >
            <option value="TODAS">TODAS AS TURMAS</option>
            <option value="ATIVOS" className="text-emerald-400 font-bold">● ONLINE AGORA (ATIVOS)</option>
            {classrooms.map(c => (
              <option key={c} value={c}>{c.toUpperCase()}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 font-mono">
          <span className="text-text-secondary text-[10px] block font-bold uppercase">TURMA SELECIONADA</span>
          <span className="text-xl font-bold text-accent-primary block mt-1">
            {globalClassroomFilter === "TODAS" ? "VISÃO GLOBAL" : globalClassroomFilter.toUpperCase()}
          </span>
          <span className="text-[10px] text-gray-500 mt-1 block">Regime regular de e-Social</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/5 font-mono">
          <span className="text-text-secondary text-[10px] block font-bold uppercase">ALUNOS MONITORADOS</span>
          <span className="text-xl font-bold text-gray-100 block mt-1">{filteredStudentsByClass.length} Registros</span>
          <span className="text-[10px] text-accent-primary mt-1 block">
            {filteredStudentsByClass.filter(s => s.status === "Ativo").length} Contas Ativas
          </span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/5 font-mono">
          <span className="text-text-secondary text-[10px] block font-bold uppercase">MÉDIA DE PRECISÃO</span>
          <span className="text-xl font-bold text-emerald-400 block mt-1">
            {(filteredStudentsByClass.reduce((acc, current) => acc + current.precisao, 0) / (filteredStudentsByClass.filter(s=>s.precisao > 0).length || 1)).toFixed(1)}%
          </span>
          <span className="text-[10px] text-gray-500 mt-1 block">Filtro de aprovação civil</span>
        </div>
        <div className="glass-panel p-4 rounded-xl border border-white/5 font-mono">
          <span className="text-text-secondary text-[10px] block font-bold uppercase">XP TOTAL COHORT</span>
          <span className="text-xl font-bold text-accent-warning block mt-1">
            {filteredStudentsByClass.reduce((acc, current) => acc + current.xp, 0)} XP
          </span>
          <span className="text-[10px] text-gray-500 mt-1 block">Soma de desafios vencidos</span>
        </div>
      </div>

      {/* REAL-TIME FOCUS ALARMS PANEL */}
      {(() => {
        const focusLogs = filteredStudentsByClass.flatMap((student) => {
          const systemMsgs = (student.mensagensChat || []).filter(m => m.remetente === "Sistema");
          return systemMsgs.map(m => ({
            ...m,
            studentName: student.nomeCompleto,
            studentId: student.id,
            phase: student.faseAtual
          }));
        }).sort((a, b) => {
          return (b.id || "").localeCompare(a.id || "");
        });

        const activeDeviators = students.filter(
          s => {
            const compNow = Date.now() + clockOffset;
            const isOnline = s.lastSeen && Math.abs(compNow - s.lastSeen) < 210000;
            return isOnline && s.status === "Ativo" && (s.focoStatus === "Fora da Tela" || (s.saidasTela || 0) > 0);
          }
        );

        return (
          <div className="glass-panel p-5 rounded-2xl border border-rose-500/10 bg-slate-900/40 space-y-4 animate-fade-in shadow-[0_0_20px_rgba(239,68,68,0.02)]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3 gap-2">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-450 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                </span>
                <h3 className="text-xs font-mono font-black text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                  🛡️ PAINEL CONTROLADOR DE ALERTA DE FOCO (e-Social)
                </h3>
              </div>
              <span className="text-[10px] text-gray-500 font-mono text-left sm:text-right">
                CONFORMIDADE OPERACIONAL DE ATENÇÃO PLENA - PROFESSOR/MONITORIA
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              {/* Ocorrencias criticas e desvios */}
              <div className="lg:col-span-7 space-y-3">
                <h4 className="text-[11px] font-sans font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>⚠️ Status Flutuante e Alvos Ativos</span>
                  <span className="text-[9px] font-normal text-gray-550 font-mono">(Alunos Fora de Foco, Avisados ou Bloqueados)</span>
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[185px] overflow-y-auto pr-1">
                  {activeDeviators.length === 0 ? (
                    <div className="col-span-2 p-6 bg-slate-950/20 border border-white/5 rounded-xl text-center flex flex-col items-center justify-center space-y-1">
                      <span className="text-[10px] text-emerald-400 font-bold uppercase font-mono tracking-wider">● CLASSE EM FOCO PLENO</span>
                      <span className="text-[9px] text-gray-500 font-sans">Nenhum acadêmico fora da tela ou com alertas acumulados no momento.</span>
                    </div>
                  ) : (
                    activeDeviators.map((student) => {
                      const exits = student.saidasTela || 0;
                      const isBlocked = exits >= 7;
                      const isWarned = exits >= 5 && exits < 7;
                      const isOffline = student.focoStatus === "Fora da Tela";

                      return (
                        <div 
                          key={student.id} 
                          className={`p-2.5 rounded-xl border flex flex-col justify-between gap-2 font-mono text-[10px] transition-all duration-350 ${
                            isBlocked 
                              ? "bg-rose-950/30 border-rose-500/40 shadow-[0_0_15px_rgba(239,68,68,0.15)] animate-pulse" 
                              : isWarned 
                                ? "bg-amber-950/25 border-amber-500/35" 
                                : "bg-slate-950/50 border-white/5"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-1.5">
                            <div className="max-w-[130px] truncate">
                              <span className="font-sans font-black text-gray-200 block truncate leading-snug">{student.nomeCompleto}</span>
                              <span className="text-[8.5px] text-gray-500 block">Fase {student.faseAtual} • MAT: {student.matricula}</span>
                            </div>
                            {isBlocked ? (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-rose-500 text-slate-950 font-sans font-black uppercase tracking-wider animate-bounce">
                                🔒 TRAVADO
                              </span>
                            ) : isOffline ? (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-rose-950/80 text-rose-400 border border-rose-500/20 font-sans font-bold uppercase tracking-wider animate-pulse">
                                🚫 FORA DA TELA
                              </span>
                            ) : (
                              <span className="text-[8px] px-1 py-0.2 rounded bg-emerald-950 text-emerald-400 font-sans font-bold uppercase tracking-wider">
                                NA TELA
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-1.5 mt-1">
                            <div className="flex flex-col">
                              <span className="text-[7.5px] text-gray-550 leading-none">MÉTRICA DE SAÍDA</span>
                              <span className={`text-[10px] font-black mt-0.5 ${isBlocked ? 'text-rose-450' : exits >= 5 ? 'text-amber-450' : 'text-gray-300'}`}>
                                {exits} Vez{exits !== 1 && 'es'}
                              </span>
                            </div>

                            {onResetStudentFocus && (
                              <button
                                type="button"
                                onClick={() => onResetStudentFocus(student.id)}
                                className={`px-2 py-1 rounded text-[9px] font-sans font-black uppercase cursor-pointer transition-all ${
                                  isBlocked 
                                    ? "bg-rose-500 text-slate-950 hover:bg-rose-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]" 
                                    : "bg-slate-800 text-gray-300 hover:bg-slate-705"
                                }`}
                              >
                                {isBlocked ? "Destravar" : "Zerar Foco"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Security Command Console Terminal */}
              <div className="lg:col-span-5 space-y-3">
                <h4 className="text-[11px] font-sans font-black text-gray-400 uppercase tracking-wider">
                  📟 Console Geral de Flutuação (Foco da Turma)
                </h4>
                <div className="bg-slate-1000 border border-white/5 rounded-xl p-3 h-[185px] overflow-y-auto font-mono text-[9px] text-gray-400 space-y-2 select-none">
                  {focusLogs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-650 text-center">
                      <span>- SEM OCORRÊNCIAS REGISTRADAS -</span>
                      <span className="text-[8px] mt-1">Sinais de minimização e trocas de aba dos alunos aparecerão neste terminal em tempo real.</span>
                    </div>
                  ) : (
                    focusLogs.slice(0, 15).map((log, idx) => {
                      const txt = log.texto || "";
                      const isLoss = txt.includes("🚫");
                      const isRecovery = txt.includes("✅");
                      const isUnlock = txt.includes("🛠️");
                      return (
                        <div key={log.id || idx} className="flex gap-1.5 items-start hover:bg-white/5 p-1 rounded transition-colors duration-200">
                          <span className="text-gray-650 flex-shrink-0">[{log.timestamp}]</span>
                          <span className="truncate">
                            <strong className="text-gray-300 font-sans font-semibold">{log.studentName}</strong>:{" "}
                            <span className={isLoss ? "text-rose-450 font-bold" : isRecovery ? "text-emerald-400" : isUnlock ? "text-cyan-400 font-bold" : "text-gray-400"}>
                              {txt.substring(txt.indexOf(":") + 1).trim() || txt}
                            </span>
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Tab Selector Navigation Panel */}
      <div className="flex border-b border-white/5 space-x-6 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTabPanel("analytics")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTabPanel === "analytics"
              ? "border-cyan-500 text-cyan-400"
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          <TrendingUp className="w-4 h-4 text-cyan-400" />
          Diagnóstico e Gargalos
          <span className="bg-cyan-500/10 text-cyan-400 text-[8px] font-sans px-1.5 py-0.5 rounded border border-cyan-500/20 font-black animate-pulse">
            NOVO
          </span>
        </button>
        <button
          onClick={() => setActiveTabPanel("telemetry")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTabPanel === "telemetry"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          <BarChart3 className="w-4 h-4 text-accent-primary" />
          Telemetria Geral (Recharts)
        </button>
        <button
          onClick={() => setActiveTabPanel("operations")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTabPanel === "operations"
              ? "border-accent-primary text-accent-primary"
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          <Users className="w-4 h-4 text-accent-warning" />
          Operações de Alunos
        </button>
        <button
          onClick={() => setActiveTabPanel("feedbacks")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTabPanel === "feedbacks"
              ? "border-emerald-500 text-emerald-450"
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          <span className="text-emerald-400">🧪</span> Feedbacks de Veteranos
          {Number(veteranFeedbacks?.length) > 0 && (
            <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[9px] px-1.5 py-0.2 rounded font-bold animate-pulse text-[9px]">
              {veteranFeedbacks.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTabPanel("scenarios")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTabPanel === "scenarios"
              ? "border-amber-500 text-amber-400"
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          Diagnóstico & Gargalos 🛠️
          <span className="bg-amber-500/10 text-amber-400 text-[8px] font-sans px-1.5 py-0.5 rounded border border-amber-500/20 font-black animate-pulse">
            DIRECIONAR
          </span>
        </button>
        <button
          onClick={() => setActiveTabPanel("activity")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTabPanel === "activity"
              ? "border-indigo-500 text-indigo-400"
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          <Cpu className="w-4 h-4 text-indigo-500" />
          Atividade Recente
        </button>
        <button
          onClick={() => setActiveTabPanel("auditoria")}
          className={`pb-3 text-xs font-mono uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            activeTabPanel === "auditoria"
              ? "border-rose-500 text-rose-400"
              : "border-transparent text-text-secondary hover:text-white"
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-rose-500" />
          Audit Dashboard
        </button>
      </div>

      {activeTabPanel === "activity" && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-500/10 bg-slate-900/40 space-y-6 animate-fade-in shadow-[0_0_40px_rgba(99,102,241,0.05)]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-4">
            <div>
              <h2 className="text-sm font-sans font-black text-gray-100 uppercase tracking-widest flex items-center gap-2">
                <span className="p-1.5 bg-indigo-500/10 rounded-lg"><Cpu className="w-4 h-4 text-indigo-400" /></span>
                Log de Eventos e Atividade Coletiva
              </h2>
              <p className="text-[10px] text-text-secondary font-mono mt-1">Sinais capturados em tempo real de logins e marcos técnicos</p>
            </div>
            
            <button 
              onClick={() => {
                setIsLogsLoading(true);
                // The useEffect will refetch due to state change if I flip a dummy toggle or just wait for snapshot update
                setTimeout(() => setIsLogsLoading(false), 800);
              }}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] font-mono font-bold text-gray-400 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              Sincronizar Log
            </button>
          </div>

          <div className="min-h-[400px] max-h-[600px] overflow-y-auto pr-2 custom-scrollbar space-y-3">
            {isLogsLoading ? (
              <div className="h-40 flex items-center justify-center gap-3">
                <Loader2 className="w-5 h-5 text-indigo-500 animate-spin" />
                <span className="text-xs font-mono text-gray-500 animate-pulse">Varrendo registros na rede e-Social...</span>
              </div>
            ) : broadcastLogs.length === 0 ? (
              <div className="h-40 flex flex-col items-center justify-center space-y-2 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                <ShieldAlert className="w-8 h-8 text-indigo-500/30" />
                <p className="text-[10px] text-gray-500 font-mono italic">Nenhum evento registrado nas últimas horas.</p>
              </div>
            ) : (
              broadcastLogs.map((log) => {
                const date = new Date(log.timestamp);
                const timeStr = date.toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                const dateStr = date.toLocaleDateString("pt-BR");

                return (
                  <div 
                    key={log.id} 
                    className="p-3.5 rounded-xl border border-white/5 bg-slate-950/40 hover:bg-slate-950/60 transition-colors flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                    </div>
                    
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider font-sans">Sinal de Presença</span>
                        <span className="text-[9px] text-gray-500 font-mono">{dateStr} {timeStr}</span>
                      </div>
                      <p className="text-xs text-white/80 leading-relaxed font-medium">
                        {log.text}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-black uppercase">Autenticado</span>
                        <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-black uppercase">Firebase Ready</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
            <h4 className="text-[10px] font-sans font-black text-indigo-300 uppercase tracking-widest mb-1">MÉTRICA DE FREQUÊNCIA TEMPORAL</h4>
            <p className="text-[9px] text-indigo-400/70 font-mono leading-tight">
              Os logs acima são arquivados automaticamente na coleção 'broadcasts' sincronizada com o motor Firebase. 
              Eles representam a atividade real-time capturada nos últimos 50 registros globais.
            </p>
          </div>
        </div>
      )}
      
      {activeTabPanel === "auditoria" && (
        <DashboardAuditoria students={students} />
      )}

      {activeTabPanel === "operations" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* Left column: OCR automated roster builder & lock controller */}
          <div className="lg:col-span-2 space-y-6">

            {/* Phase Release Control Panel */}
            <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/40 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-accent-warning/10 text-accent-warning">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                      Controle de Liberação de Fases
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Gerencie quais fases do simulador estão abertas/disponíveis para acesso dos alunos em tempo real.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateReleasedPhases?.([-1, 0, 1, 2, 3, 4, 5, 6, 7])}
                    className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono transition-all font-bold cursor-pointer"
                  >
                    Liberar Todas
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateReleasedPhases?.([-1])}
                    className="px-2.5 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-[10px] font-mono transition-all font-bold cursor-pointer"
                  >
                    Bloquear Todas
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAREER_PHASES.map((phase) => {
                  const isReleased = releasedPhases.includes(phase.id);
                  const isPhaseMinus1 = phase.id === -1;

                  return (
                    <div
                      key={phase.id}
                      onClick={() => {
                        if (isPhaseMinus1) return;
                        const nextReleased = isReleased
                          ? releasedPhases.filter((p) => p !== phase.id)
                          : [...releasedPhases, phase.id];
                        onUpdateReleasedPhases?.(nextReleased);
                      }}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 cursor-pointer ${
                        isPhaseMinus1
                          ? "bg-slate-950/40 border-white/5 opacity-80 cursor-not-allowed"
                          : isReleased
                          ? "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.05)]"
                          : "bg-slate-950/60 border-white/10 hover:border-white/25 hover:bg-slate-950/40"
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-md font-bold ${
                            isPhaseMinus1
                              ? "bg-slate-800 text-slate-400"
                              : isReleased
                              ? "bg-emerald-500/10 text-emerald-400"
                              : "bg-slate-950 text-slate-500"
                          }`}>
                            Fase {phase.id}
                          </span>
                          {phase.id === 0 && (
                            <span className="bg-amber-500/10 text-amber-400 text-[8px] font-black uppercase px-1 py-0.2 rounded-md border border-amber-500/20 tracking-wider">
                              PROVA 📝
                            </span>
                          )}
                        </div>
                        <h4 className="text-[11px] font-bold text-gray-200 mt-1 truncate">
                          {phase.cargo}
                        </h4>
                        <p className="text-[9px] text-text-secondary leading-tight mt-0.5 truncate">
                          {phase.moduloTecnico}
                        </p>
                      </div>

                      <div className="shrink-0">
                        {isPhaseMinus1 ? (
                          <div className="w-6 h-6 rounded-lg bg-slate-800 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                            ✔
                          </div>
                        ) : isReleased ? (
                          <div className="w-6 h-6 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center animate-pulse">
                            <span className="text-[10px] font-bold">ON</span>
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-lg bg-slate-950 border border-white/5 text-gray-500 flex items-center justify-center">
                            <span className="text-[10px] font-bold">OFF</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Automated Onboarding panel */}
            <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden transition-all duration-300">
              <button 
                onClick={() => setCollapsedOcr(!collapsedOcr)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-5 h-5 text-accent-primary" />
                  <div className="text-left">
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                      Onboarding via OCR de Chamada
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Mestre, digite ou cole a lista nominal da chamada do dia. O OCR simula o escaneamento físico e gera os IDs.
                    </p>
                  </div>
                </div>
                {collapsedOcr ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-accent-primary" />}
              </button>

              {!collapsedOcr && (
                <div className="p-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <textarea
                    id="professor-ocr-textarea"
                    rows={4}
                    value={ocrInputText}
                    onChange={(e) => setOcrInputText(e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-3 text-xs font-mono focus:border-accent-primary focus:outline-none text-accent-primary"
                    placeholder="Digite um nome por linha..."
                    disabled={isProcessingOcr}
                  />

                  <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-xl border border-white/5">
                    <div className="flex items-center gap-2 text-xs text-text-secondary">
                      <FileSpreadsheet className="w-4 h-4 text-accent-primary" />
                      <span>Format: Nome completo | Turma 1B</span>
                    </div>
                    <button
                      id="professor-ocr-launch-btn"
                      type="button"
                      onClick={handleSimulatedOCRUpload}
                      disabled={isProcessingOcr}
                      className="bg-accent-primary text-bg-primary hover:bg-white font-sans font-bold text-xs uppercase py-2 px-4 rounded-lg cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50"
                    >
                      {isProcessingOcr ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Buscando...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          Rodar OCR e Cadastrar
                        </>
                      )}
                    </button>
                  </div>

                  {isProcessingOcr && (
                    <div className="p-3 bg-indigo-950/20 border border-indigo-500/10 rounded-xl flex items-center gap-2 font-mono text-xs text-accent-primary animate-pulse">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Estágio OCR: {ocrPhase}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* NOVO REPOSITÓRIO E ESPAÇO PARA UPAR AS FOLHAS DE CHAMADAS EM PDF */}
            <div className="glass-panel rounded-2xl border border-indigo-500/30 bg-slate-950/40 overflow-hidden shadow-[0_0_20px_rgba(99,102,241,0.08)] text-left transition-all duration-300">
              <button 
                onClick={() => setCollapsedPdfRepo(!collapsedPdfRepo)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
                    <FileText className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                      Repositório Oficial de Chamadas (Upload de PDFs)
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Envie as folhas de chamada digitalizadas do diário escolar em formato <span className="text-indigo-400 font-semibold">PDF</span>. O leitor óptico (OCR) identificará a lista nominal e integrará os novos registros.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-indigo-500/10 text-indigo-400 font-mono text-[9px] px-2.5 py-0.5 rounded-full border border-indigo-500/20 font-bold hidden sm:block">
                    e-SOCIAL COMPLIANT
                  </span>
                  {collapsedPdfRepo ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-indigo-400" />}
                </div>
              </button>

              {!collapsedPdfRepo && (
                <div className="p-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* DRAG AND DROP ZONE */}
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={() => setIsDragOver(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handlePdfFileImport(e.dataTransfer.files[0]);
                      }
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center gap-2 transition-all cursor-pointer text-center select-none ${
                      isDragOver
                        ? "border-accent-primary bg-accent-primary/10 scale-[0.99]"
                        : "border-white/10 hover:border-indigo-400/40 hover:bg-white/5 bg-slate-950/30"
                    }`}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          handlePdfFileImport(e.target.files[0]);
                        }
                      }}
                      accept=".pdf"
                      className="hidden"
                    />
                    
                    <div className="p-3 bg-indigo-550/10 text-indigo-400 rounded-full border border-indigo-500/15 transition-all">
                      <Upload className="w-6 h-6 text-indigo-400" />
                    </div>
                    
                    <div>
                      <p className="text-xs font-sans font-semibold text-gray-200">
                        Clique para selecionar ou arraste o arquivo PDF aqui
                      </p>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">
                        Apenas documentos com extensão .pdf são aceitos (Max. 10MB)
                      </p>
                    </div>
                  </div>

                  {/* UPLOAD STATUS METER */}
                  {isUploadingPdf && (
                    <div className="p-4 bg-slate-950/70 border border-indigo-500/20 rounded-xl space-y-2.5 animate-pulse">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-indigo-400 flex items-center gap-1.5 font-bold">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          {pdfUploadPhase}
                        </span>
                        <span className="font-mono text-gray-400">
                          {pdfUploadProgress}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-accent-primary h-full rounded-full transition-all duration-300"
                          style={{ width: `${pdfUploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* SUCCESS & ERROR TOASTERS */}
                  {pdfErrorMsg && (
                    <div className="p-3 bg-red-950/20 border border-red-500/15 rounded-xl flex items-center gap-2 text-xs text-red-500 font-sans animate-fade-in">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>{pdfErrorMsg}</span>
                    </div>
                  )}

                  {pdfSuccessMsg && (
                    <div className="p-3 bg-emerald-950/20 border border-emerald-500/15 rounded-xl flex items-center gap-2 text-xs text-emerald-400 font-sans animate-fade-in font-semibold">
                      <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{pdfSuccessMsg}</span>
                    </div>
                  )}

                  {/* LIST OF CURRENT CHAMADA PDF FILES */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                      📁 Documentos Salvos de Chamada ({folhasPdfs.length})
                    </h4>
                    
                    {folhasPdfs.length === 0 ? (
                      <p className="text-[10px] text-gray-500 font-mono italic p-2 bg-slate-900/40 rounded-lg text-center border border-white/5">
                        Nenhuma folha de chamada importada em PDF até o momento.
                      </p>
                    ) : (
                      <div className="space-y-2 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                        {folhasPdfs.map((pdf) => (
                          <div
                            key={pdf.id}
                            className="bg-slate-950/50 border border-white/5 p-3 rounded-xl flex items-center justify-between text-xs hover:border-indigo-500/20 transition-all group animate-fade-in"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg border border-rose-500/15">
                                <FileText className="w-4 h-4 text-rose-400" />
                              </div>
                              <div className="space-y-0.5">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-sans font-bold text-gray-200 group-hover:text-amber-400 transition-colors">
                                    {pdf.name}
                                  </span>
                                  <span className="text-[9px] font-mono text-gray-500">
                                    ({pdf.size})
                                  </span>
                                </div>
                                <p className="text-[9.5px] text-text-secondary font-mono flex items-center gap-2">
                                  <span>📅 Importado: <span className="text-gray-300">{pdf.date}</span></span>
                                  <span className="text-white/10">|</span>
                                  <span>Turma: <span className="text-cyan-400 font-semibold">{pdf.classroom}</span></span>
                                  <span className="text-white/10">|</span>
                                  <span>Alunos: <span className="text-[#00E5FF] font-semibold">{pdf.rowsCount}</span></span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full select-none font-bold uppercase">
                                ✓ Sincronizado OCR
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDeletePdf(pdf.id)}
                                className="p-1.5 text-gray-500 hover:text-rose-400 rounded-lg hover:bg-rose-500/10 transition-all cursor-pointer border border-transparent hover:border-rose-500/15"
                                title="Apagar documento do sistema"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* SECÃO PARALELA: MATRÍCULA POR LOTE (FOLHA DIGITALIZADA DA CHAMADA) */}
            <div className="glass-panel rounded-2xl border border-cyan-500/25 bg-slate-950/30 overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.05)] text-left transition-all duration-300">
              <button 
                onClick={() => setCollapsedBatchEnroll(!collapsedBatchEnroll)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg border border-cyan-500/20">
                    <FileSpreadsheet className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                      Matrícula por Lote (Folha de Chamada Digital)
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Insira a lista da chamada escolar para registrar alunos e gerar matrículas automáticas sob o padrão parametrizado do e-Social: <strong className="text-cyan-400">{"{TURMA}{NÚMERO}2026RH"}</strong>.
                    </p>
                  </div>
                </div>
                {collapsedBatchEnroll ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-cyan-400" />}
              </button>

              {!collapsedBatchEnroll && (
                <div className="p-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  {/* Grid of parameters */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Turma / Sala Escolar</label>
                      <input
                        type="text"
                        value={batchClassroom}
                        onChange={(e) => setBatchClassroom(e.target.value)}
                        placeholder="Ex: 1º B"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                      <p className="text-[9px] text-gray-500">Exemplos: 1º B, 2º A, 3º C</p>
                    </div>
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Ano Letivo (Simulador)</label>
                      <input
                        type="number"
                        value={batchYear}
                        onChange={(e) => setBatchYear(parseInt(e.target.value, 10) || 2026)}
                        placeholder="2026"
                        className="w-full bg-slate-950/80 border border-white/10 rounded-lg py-2 px-3 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Textarea for roster names */}
                  <div className="space-y-1.5 text-left">
                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider block">Insira Lista de Presença da Chamada</label>
                    <textarea
                      rows={4}
                      value={batchRawInput}
                      onChange={(e) => setBatchRawInput(e.target.value)}
                      className="w-full bg-slate-950/80 border border-[#00E5FF]/20 rounded-lg p-3 text-xs font-mono text-[#00E5FF] focus:border-cyan-400 focus:outline-none"
                      placeholder="01 - Nome Aluno\n02 - Próximo Aluno..."
                    />
                    <p className="text-[10px] text-gray-500 mt-1">
                      💡 Identifica automaticamente números sequenciais. Se omitidos, o sistema gerará na ordem digitada.
                    </p>
                  </div>

                  {/* Live Preview Console */}
                  <div className="bg-slate-950/90 border border-white/5 rounded-xl p-4 space-y-2 text-left">
                    <span className="text-[10px] font-mono text-gray-400 block border-b border-white/5 pb-1">
                      👁️ PRÉ-VISUALIZAÇÃO DE MATRÍCULAS DO LOTE:
                    </span>
                    <div className="max-h-[120px] overflow-y-auto space-y-1.5 pr-1 text-xs">
                      {parseBatchInput(batchRawInput, batchClassroom, batchYear).map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-white/5 p-1.5 rounded text-[11px] font-mono">
                          <span className="text-gray-300">
                            <strong className="text-cyan-400">#{item.chamadaNumero}</strong> - {item.nomeCompleto}
                          </span>
                          <span className="text-xs font-bold text-gray-400 shrink-0">
                            Matrícula: <strong className="text-amber-400 bg-amber-400/10 px-1.5 py-0.5 rounded border border-amber-400/15">{item.matricula}</strong>
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex justify-between items-center flex-wrap gap-3 pt-1">
                    {batchSuccessMsg ? (
                      <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 font-bold animate-fade-in">
                        {batchSuccessMsg}
                      </span>
                    ) : (
                      <span className="text-[11px] text-gray-500 font-sans">
                        * Matrículas síncronas integradas à folha de frequência escolar.
                      </span>
                    )}

                    <button
                      onClick={handleRunBatchEnrollment}
                      type="button"
                      disabled={isProcessingBatch || !batchRawInput.trim()}
                      className="bg-cyan-550 hover:bg-cyan-500 text-slate-950 font-sans font-bold text-xs uppercase py-2.5 px-5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all disabled:opacity-50 shadow-[0_0_15px_rgba(6,182,212,0.2)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] active:scale-95"
                    >
                      {isProcessingBatch ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Processando Lote...
                        </>
                      ) : (
                        <>
                          <FileSpreadsheet className="w-4 h-4 text-slate-950" />
                          Matricular em Lote por Chamada
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>



            {/* BATCH BADGE EXPORT BY CLASS */}
            <div className="glass-panel rounded-2xl border border-emerald-500/30 bg-slate-950/40 overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.05)] transition-all duration-300">
              <button 
                onClick={() => setCollapsedBadgePrint(!collapsedBadgePrint)}
                className="w-full flex items-center justify-between p-6 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
                    <Camera className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                      Impressão em Lote: Crachás de Acesso
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Gere o PDF oficial de crachás por turma. Inclui foto dos alunos que já configuraram ou espaço em branco (3x4) para colagem manual.
                    </p>
                  </div>
                </div>
                {collapsedBadgePrint ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronUp className="w-5 h-5 text-emerald-400" />}
              </button>

              {!collapsedBadgePrint && (
                <div className="p-6 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex-1 w-full">
                      <label className="text-[10px] uppercase font-bold text-text-secondary mb-1 block">Filtrar por Turma/Sala:</label>
                      <select 
                        value={selectedClassForBadges}
                        onChange={(e) => setSelectedClassForBadges(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs font-mono text-white focus:border-emerald-500 outline-none"
                      >
                        <option value="TODAS">TODAS AS TURMAS</option>
                        {Array.from(new Set(students.map(s => s.sala).filter(Boolean))).sort().map(sala => (
                          <option key={sala} value={sala}>{sala}</option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={async () => {
                        setIsDownloadingQRs(true);
                        try {
                          const filteredStudents = selectedClassForBadges === "TODAS" 
                            ? students 
                            : students.filter(s => s.sala === selectedClassForBadges);
                          
                          const { exportAllQRBadgesToPDF } = await import("../utils/qrExporter");
                          await exportAllQRBadgesToPDF(filteredStudents, appLanguage);
                        } catch (e) {
                          console.error("Error bulk exporting badges", e);
                        } finally {
                          setIsDownloadingQRs(false);
                        }
                      }}
                      disabled={isDownloadingQRs || students.length === 0}
                      className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-sans font-bold text-xs uppercase py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 disabled:opacity-50 mt-5 cursor-pointer"
                    >
                      {isDownloadingQRs ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Gerando PDF...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          Gerar Crachás da Turma
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-950/40 p-3 rounded-xl border border-white/5">
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="text-[10px] text-gray-300 font-bold uppercase tracking-tight">Política de Privacidade QR</p>
                        <p className="text-[9px] text-text-secondary leading-relaxed text-left">
                          Cada código QR é <strong>único e individual</strong>. O mestre deve garantir a entrega sigilosa de cada crachá ao seu respectivo titular para evitar acessos indevidos.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CLEANUP BUTTON ADDED AS REQUESTED */}
              <div className="pt-4 border-t border-white/5 flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">
                    Admin Tools:
                  </span>
                  <button
                    onClick={onDeleteAllStudents}
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500 text-rose-500 hover:text-white rounded-lg text-[9px] font-sans font-black uppercase transition-all border border-rose-500/20 hover:border-rose-500 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    Limpar Banco (Geral)
                  </button>

                  <button
                    onClick={onSyncAllStudents}
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-slate-950 rounded-lg text-[9px] font-sans font-black uppercase transition-all border border-emerald-500/20 hover:border-emerald-500 cursor-pointer"
                  >
                    <Cloud className="w-3 h-3" />
                    Sincronizar com Nuvem
                  </button>

                  <div className="h-4 w-[1px] bg-white/10 mx-1" />

                  <button
                    onClick={handleExportRoster}
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg text-[9px] font-sans font-black uppercase transition-all border border-indigo-500/20 hover:border-indigo-500 cursor-pointer"
                    title="Exportar backup físico da lista de alunos"
                  >
                    <Download className="w-3 h-3" />
                    Exportar Backup (JSON)
                  </button>

                  <input
                    type="file"
                    ref={backupFileInputRef}
                    onChange={handleImportRoster}
                    accept=".json"
                    className="hidden"
                  />

                  <button
                    onClick={() => backupFileInputRef.current?.click()}
                    type="button"
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500 text-indigo-400 hover:text-white rounded-lg text-[9px] font-sans font-black uppercase transition-all border border-indigo-500/20 hover:border-indigo-500 cursor-pointer"
                    title="Restaurar backup físico de arquivo JSON"
                  >
                    <Upload className="w-3 h-3" />
                    Restaurar de Arquivo
                  </button>

                  {hasLocalBackup && (
                    <button
                      onClick={handleRestoreLocalSafetyBackup}
                      type="button"
                      className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 hover:bg-amber-500 text-amber-500 hover:text-slate-950 rounded-lg text-[9px] font-sans font-black uppercase transition-all border border-amber-500/20 hover:border-amber-500 cursor-pointer"
                      title="Restaurar do backup automático interno do navegador"
                    >
                      <HardDrive className="w-3 h-3" />
                      Backup de Emergência
                    </button>
                  )}
                </div>

                {selectedIdsForDeletion.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    disabled={isDeletingSelection}
                    type="button"
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-[10px] font-sans font-black uppercase transition-all shadow-[0_0_15px_rgba(225,29,72,0.3)] animate-in fade-in zoom-in duration-300"
                  >
                    {isDeletingSelection ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3.5 h-3.5" />
                    )}
                    Apagar Selecionados ({selectedIdsForDeletion.length})
                  </button>
                )}
              </div>

            {/* Squad / Célula machine authorization panel */}
            <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-accent-warning" />
                  <div>
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                      Autorização de Células de Trabalho (Squad)
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Gerencie e desbloqueie máquinas para squads físicos compartilhados (limite de até 4 alunos por PC).
                    </p>
                  </div>
                </div>
                <span className="bg-accent-warning/10 text-accent-warning font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-accent-warning/20 font-black">
                  SQUAD ACTIVE CELLS
                </span>
              </div>

              {/* Step 1: Select Squad Members */}
              <div className="space-y-2 bg-slate-950/45 p-4 rounded-xl border border-white/5">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-mono font-bold text-accent-primary uppercase tracking-wide block">
                    Etapa 1: Selecionar Alunos do Squad ({selectedSquadStudentIds.length}/4)
                  </label>
                  {selectedSquadStudentIds.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setSelectedSquadStudentIds([])}
                      className="text-[9px] font-mono text-rose-400 hover:text-white underline cursor-pointer"
                    >
                      Limpar Seleção
                    </button>
                  )}
                </div>

                {/* Selected Indicators */}
                {selectedSquadStudentIds.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 p-2 bg-slate-1000/60 rounded border border-white/5">
                    {selectedSquadStudentIds.map((sid) => {
                      const stud = students.find((s) => s.id === sid);
                      return (
                        <span
                          key={sid}
                          className="inline-flex items-center gap-1 bg-accent-warning/10 border border-accent-warning/35 text-accent-warning text-[10px] px-2 py-0.5 rounded-full font-sans"
                        >
                          {stud ? stud.nomeCompleto : "Aluno"}
                          <button
                            type="button"
                            onClick={() => setSelectedSquadStudentIds((prev) => prev.filter((id) => id !== sid))}
                            className="text-white hover:text-rose-400 font-bold ml-1 cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[10px] text-gray-500 font-mono italic">
                    Escolha de 2 a 4 alunos participantes para vincular à máquina.
                  </p>
                )}

                {/* Search field */}
                <div className="relative">
                  <span className="absolute left-2.5 top-1.5 text-xs">🔍</span>
                  <input
                    type="text"
                    value={squadSearchQuery}
                    onChange={(e) => setSquadSearchQuery(e.target.value)}
                    placeholder="Filtrar por nome, matrícula ou número de chamada..."
                    className="w-full bg-slate-950 border border-white/10 rounded px-8 py-1.5 text-[11px] text-white focus:outline-none focus:border-accent-primary/75 font-sans"
                  />
                </div>

                {/* Lazy/Scrollable checks */}
                <div className="max-h-28 overflow-y-auto border border-white/5 rounded bg-slate-1000/30 p-2 space-y-1.5 custom-scrollbar">
                  {students
                    .filter((st) => {
                      if (!squadSearchQuery.trim()) return true;
                      const q = squadSearchQuery.toLowerCase();
                      return (
                        st.nomeCompleto.toLowerCase().includes(q) ||
                        st.matricula.toLowerCase().includes(q) ||
                        (st.chamadaNumero && String(st.chamadaNumero).includes(q))
                      );
                    })
                    .map((st) => {
                      const isChecked = selectedSquadStudentIds.includes(st.id);
                      return (
                        <label
                          key={st.id}
                          className={`flex items-center justify-between text-[11px] font-sans px-2 py-1 rounded cursor-pointer transition-colors ${
                            isChecked
                              ? "bg-accent-primary/10 border border-accent-primary/25 text-white"
                              : "hover:bg-white/5 border border-transparent text-gray-400"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  if (selectedSquadStudentIds.length >= 4) return;
                                  setSelectedSquadStudentIds((prev) => [...prev, st.id]);
                                } else {
                                  setSelectedSquadStudentIds((prev) => prev.filter((id) => id !== st.id));
                                }
                              }}
                              className="accent-accent-primary rounded cursor-pointer"
                            />
                            <span>
                              #{st.chamadaNumero || "?"} - {st.nomeCompleto}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 font-mono text-[9px]">
                            {st.timeId ? (
                              <span className="text-emerald-400">PC: {st.timeId}</span>
                            ) : (
                              <span className="text-gray-600">Individual</span>
                            )}
                            <span className="text-gray-500">({st.matricula})</span>
                          </div>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Step 2: Set Station and unlock */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-bold text-accent-primary uppercase tracking-wide block">
                  Etapa 2: Especificar ID da Máquina & Desbloquear
                </label>
                <form onSubmit={handleManualUnlock} className="flex gap-2">
                  <div className="relative flex-1">
                    <Lock className="w-3.5 h-3.5 absolute left-3 top-3.5 text-text-secondary" />
                    <input
                      id="squad-machine-id-input"
                      type="text"
                      value={squadMachineId}
                      onChange={(e) => setSquadMachineId(e.target.value.toUpperCase())}
                      className="w-full bg-slate-950/70 border border-white/10 rounded-lg py-2.5 pl-8 pr-3 text-xs font-mono focus:border-accent-primary focus:outline-none text-accent-primary"
                      placeholder="ID da Máquina física (Ex: PC-01)"
                    />
                  </div>
                  <button
                    id="squad-unlock-btn"
                    type="submit"
                    className="bg-accent-warning text-bg-primary hover:bg-white font-sans font-bold text-xs uppercase py-2.5 px-4 rounded-lg cursor-pointer transition-all whitespace-nowrap"
                  >
                    {selectedSquadStudentIds.length > 0 ? "Vincular & Liberar" : "Liberar Acesso PC"}
                  </button>
                </form>
              </div>

              {unlockStatus && (
                <div className="p-2.5 bg-emerald-950/10 border border-emerald-500/15 rounded-lg text-emerald-400 font-mono text-[11px] animate-fade-in text-center">
                  {unlockStatus}
                </div>
              )}

              {/* CURRENTLY REGISTERED SQUAD LOGS */}
              <div className="border-t border-white/5 pt-4 space-y-2">
                <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <span>📋</span> Histórico de Células de Trabalho (Squad Logs)
                </h4>
                {squadLogs.length === 0 ? (
                  <p className="text-[10px] text-gray-500 font-mono italic leading-relaxed">
                    Nenhum squad registrado em equipe nas máquinas físicas até o momento. Use o seletor acima para agregar grupos.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-44 overflow-y-auto custom-scrollbar pr-1">
                    {squadLogs.map((log) => {
                      const participantNames = log.studentIds
                        .map((sid) => students.find((st) => st.id === sid)?.nomeCompleto)
                        .filter(Boolean)
                        .join(", ");

                      return (
                        <div
                          key={log.id}
                          className="bg-slate-950/50 border border-white/5 p-2 rounded-lg flex items-center justify-between text-xs transition-all hover:border-white/10 animate-fade-in"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-mono font-black text-accent-warning bg-accent-warning/10 px-1.5 py-0.5 rounded border border-accent-warning/15">
                                {log.machineId}
                              </span>
                              <span className="text-[9px] font-mono text-gray-500">{log.timestamp}</span>
                            </div>
                            <p className="text-[10px] text-gray-300 font-sans leading-tight">
                              Estudantes:{" "}
                              <span className="text-gray-100 font-semibold">{participantNames || "Indivíduo"}</span>
                            </p>
                          </div>
                          {onRemoveSquad && (
                            <button
                              type="button"
                              onClick={() => onRemoveSquad(log.machineId)}
                              className="text-[9px] font-sans font-bold text-rose-400 hover:text-white hover:bg-rose-500/15 border border-rose-500/20 px-2 py-1 rounded transition-all cursor-pointer"
                            >
                              Liberar Máquina
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* MESA DE ATENDIMENTO DE DÚVIDAS CLT */}
            <div id="prof-doubts-desk" className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <HelpCircle className="w-5 h-5 text-emerald-400" />
                  <div>
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                      Mesa de Atendimento de Dúvidas & IntraChat (Professor/Monitoria)
                    </h3>
                    <p className="text-[11px] text-text-secondary">
                      Como Mestre de DP, valide dúvidas CLT ou responda mensagens do IntraChat para dinamizar o aprendizado.
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-500/10 text-emerald-400 font-mono text-[10px] px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                  {students.filter(s => {
                    const hasFormalDoubt = s.pausaAtiva === "duvida" || s.duvidaPendenteTexto;
                    const lastMsg = s.mensagensChat && s.mensagensChat.length > 0 ? s.mensagensChat[s.mensagensChat.length - 1] : null;
                    const isUnreplied = lastMsg && lastMsg.remetente !== "Professor" && lastMsg.remetente !== "Sistema";
                    return hasFormalDoubt || isUnreplied || chatNotifications.some(n => n.studentId === s.id);
                  }).length} Aguardando
                </span>
              </div>

              {/* List of pending student doubts and chat messages */}
              {(() => {
                const pendingStudents = students
                  .filter(s => {
                    const hasFormalDoubt = s.pausaAtiva === "duvida" || s.duvidaPendenteTexto;
                    const lastMsg = s.mensagensChat && s.mensagensChat.length > 0 ? s.mensagensChat[s.mensagensChat.length - 1] : null;
                    const isUnreplied = lastMsg && lastMsg.remetente !== "Professor" && lastMsg.remetente !== "Sistema";
                    return hasFormalDoubt || isUnreplied || chatNotifications.some(n => n.studentId === s.id);
                  })
                  .sort((a, b) => {
                    // Pull students with unread notifications to the absolute top
                    const aNotifs = chatNotifications.filter(n => n.studentId === a.id).length;
                    const bNotifs = chatNotifications.filter(n => n.studentId === b.id).length;
                    if (aNotifs !== bNotifs) return bNotifs - aNotifs;

                    // Then formal doubts
                    const aDoubt = (a.pausaAtiva === "duvida" || a.duvidaPendenteTexto) ? 1 : 0;
                    const bDoubt = (b.pausaAtiva === "duvida" || b.duvidaPendenteTexto) ? 1 : 0;
                    if (aDoubt !== bDoubt) return bDoubt - aDoubt;

                    return 0;
                  });
                if (pendingStudents.length === 0) {
                  return (
                    <div className="py-6 text-center border border-dashed border-white/5 rounded-xl text-xs text-text-secondary font-mono">
                      🟢 Nenhuma dúvida ou mensagem pendente. Silêncio produtivo na Global Logística S.A.
                    </div>
                  );
                }

                return (
                  <div className="space-y-4">
                    {pendingStudents.map(student => {
                      const studentNotifs = chatNotifications.filter(n => n.studentId === student.id);
                      const messages = student.mensagensChat || [];
                      const lastMessage = messages.length > 0 ? messages[messages.length - 1] : null;
                      const isUnreplied = lastMessage && lastMessage.remetente !== "Professor" && lastMessage.remetente !== "Sistema";
                      
                      const hasFormalDoubt = student.pausaAtiva === "duvida" || student.duvidaPendenteTexto;
                      
                      const lastDoubt = student.duvidasHistorico?.find(d => !d.resolvida) || {
                        id: "fallback",
                        pergunta: student.duvidaPendenteTexto || "Como calcular o saldo de salário?",
                        timestamp: "Agora"
                      };

                      return (
                        <div key={student.id} className="bg-slate-950/40 border border-white/5 p-4 rounded-xl space-y-3 font-mono text-xs">
                          <div className="flex justify-between items-center border-b border-white/5 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-sans font-bold text-gray-200">{student.nomeCompleto}</span>
                              <span className="text-[9px] bg-slate-900 border border-white/10 px-1.5 py-0.2 rounded text-indigo-400">
                                Fase {student.faseAtual}
                              </span>
                              {studentNotifs.length > 0 && (
                                <span className="text-[8px] bg-sky-500/10 text-sky-400 border border-sky-500/20 px-1 py-0.2 rounded font-bold animate-pulse">
                                  {studentNotifs.length} MSG NOVAS
                                </span>
                              )}
                              {isUnreplied && studentNotifs.length === 0 && (
                                <span className="text-[8px] bg-slate-900 text-gray-400 border border-white/10 px-1 py-0.2 rounded font-bold">
                                  AGUARDANDO RETORNO
                                </span>
                              )}
                              {student.isTyping && (
                                <span className="text-[8px] text-sky-400 font-mono animate-bounce">
                                  escrevendo...
                                </span>
                              )}
                            </div>
                            <span className="text-[9px] text-text-secondary">
                              {hasFormalDoubt ? lastDoubt.timestamp : (studentNotifs[studentNotifs.length - 1]?.timestamp || lastMessage?.timestamp || "Recente")}
                            </span>
                          </div>

                          {/* Formal Doubt Section */}
                          {hasFormalDoubt && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-1.5 text-[9px] text-emerald-400/80 uppercase font-bold">
                                <HelpCircle className="w-3 h-3" /> Dúvida Operacional CLT:
                              </div>
                              <div className="bg-indigo-950/20 p-3 rounded-lg border border-indigo-500/10 text-gray-300 leading-relaxed text-[11px] italic">
                                "{lastDoubt.pergunta}"
                              </div>
                              <div className="space-y-2">
                                <span className="text-[9px] text-accent-warning uppercase tracking-wide block">Sua Resposta Doutrinária:</span>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="Ex: De acordo com o Art. 477 da CLT..."
                                    id={`reply-input-${student.id}-${lastDoubt.id}`}
                                    className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-white placeholder-gray-650"
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        const val = (e.target as HTMLInputElement).value;
                                        if (val.trim() && onAnswerDoubt) {
                                          onAnswerDoubt(student.id, lastDoubt.id, val.trim());
                                          (e.target as HTMLInputElement).value = "";
                                        }
                                      }
                                    }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const el = document.getElementById(`reply-input-${student.id}-${lastDoubt.id}`) as HTMLInputElement;
                                      if (el && el.value.trim() && onAnswerDoubt) {
                                        onAnswerDoubt(student.id, lastDoubt.id, el.value.trim());
                                        el.value = "";
                                      }
                                    }}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-bold text-[10px] uppercase px-4 rounded-lg cursor-pointer transition-all"
                                  >
                                    Responder Dúvida
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Chat Message Section */}
                          {(studentNotifs.length > 0 || isUnreplied) && (
                            <div className="space-y-2 pt-2 border-t border-white/5">
                              <div className="flex items-center gap-1.5 text-[9px] text-sky-400/80 uppercase font-bold">
                                <Send className="w-3 h-3" /> {studentNotifs.length > 0 ? "Novas mensagens (IntraChat):" : "Última mensagem do aluno:"}
                              </div>
                              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
                                {messages.length > 0 && messages.slice(-5).map((m, midx) => {
                                  const isProf = m.remetente === "Professor";
                                  const isSys = m.remetente === "Sistema";
                                  return (
                                    <div key={m.id || midx} className={`p-2 rounded-lg text-[10.5px] border ${
                                      isProf 
                                        ? "bg-emerald-500/5 border-emerald-500/10 text-emerald-400/90 ml-4 italic" 
                                        : isSys 
                                          ? "bg-slate-900 border-white/5 text-gray-500 text-[9px]" 
                                          : "bg-sky-500/5 border-sky-500/10 text-gray-300 mr-4"
                                    }`}>
                                      <div className="flex justify-between items-center mb-0.5 opacity-60 text-[8px] font-bold">
                                        <span>{isProf ? "Professor (Você)" : isSys ? "Sistema" : student.nomeCompleto}</span>
                                        <span>{m.timestamp}</span>
                                      </div>
                                      {m.texto}
                                    </div>
                                  );
                                })}
                              </div>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  placeholder="Digite resposta rápida IntraChat..."
                                  id={`direct-chat-reply-${student.id}`}
                                  className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-[10px] focus:outline-none focus:border-sky-500 text-white placeholder-gray-650"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      const val = (e.target as HTMLInputElement).value;
                                      if (val.trim() && onSendMessage) {
                                        onSendMessage(student.id, val.trim());
                                        (e.target as HTMLInputElement).value = "";
                                      }
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const el = document.getElementById(`direct-chat-reply-${student.id}`) as HTMLInputElement;
                                    if (el && el.value.trim() && onSendMessage) {
                                      onSendMessage(student.id, el.value.trim());
                                      el.value = "";
                                    }
                                  }}
                                  className="bg-sky-500/10 hover:bg-sky-500 text-sky-400 hover:text-slate-950 border border-sky-500/20 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                                >
                                  Enviar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onOpenChat(student)}
                                  className="bg-slate-900 hover:bg-slate-800 text-gray-400 border border-white/5 px-2.5 py-1.5 rounded-lg text-[10px] font-bold uppercase transition-all"
                                  title="Abrir Histórico Completo"
                                >
                                  💬
                                </button>
                              </div>
                            </div>
                          )}
                          
                          <div className="flex items-center justify-between mt-1 leading-normal text-[8.5px] text-text-secondary pt-1">
                            <span>
                              💡 XP atual do aluno: **{student.xp}**. Dúvidas resolvidas: **{student.duvidasHistorico?.filter(d => d.resolvida).length || 0}**.
                            </span>
                            {onResetDoubtCounter && (
                              <button
                                type="button"
                                onClick={() => onResetDoubtCounter(student.id)}
                                className="text-[8px] text-accent-warning hover:text-white hover:underline uppercase bg-slate-950 px-1 py-0.5 rounded border border-white/5"
                              >
                                Reiniciar Contagem
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>

          </div>

          {/* Right column: Current Cohort list and Telemetry downloader */}
          <div className="space-y-4">
            
            <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-3 flex flex-col h-full max-h-[480px]">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-xs font-sans font-bold text-gray-300 uppercase tracking-wider">
                  Livro de Registro: {globalClassroomFilter === "TODAS" ? (appLanguage === "en" ? "All Cohorts" : "Todas as Turmas") : globalClassroomFilter}
                </h4>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const allVisibleIds = studentsToDisplay.map(s => s.id);
                      const allSelected = allVisibleIds.length > 0 && allVisibleIds.every(id => selectedIdsForDeletion.includes(id));
                      
                      if (allSelected) {
                        // Deselect all visible students currently filtered
                        setSelectedIdsForDeletion(prev => prev.filter(id => !allVisibleIds.includes(id)));
                      } else {
                        // Select all visible students (plus already selected ones)
                        setSelectedIdsForDeletion(prev => Array.from(new Set([...prev, ...allVisibleIds])));
                      }
                    }}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all ${
                      studentsToDisplay.length > 0 && studentsToDisplay.every(s => selectedIdsForDeletion.includes(s.id))
                        ? "bg-rose-500 border-rose-500 text-white"
                        : "bg-slate-900 border-white/10 text-gray-400 hover:text-white"
                    }`}
                  >
                    {studentsToDisplay.length > 0 && studentsToDisplay.every(s => selectedIdsForDeletion.includes(s.id)) ? "Desmarcar" : "Selecionar Todos"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteSelected}
                    disabled={selectedIdsForDeletion.length === 0 || isDeletingSelection}
                    className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all flex items-center gap-1 ${
                      selectedIdsForDeletion.length > 0
                        ? "bg-rose-500 border-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-500/20"
                        : "bg-slate-900 border-white/5 text-gray-600 cursor-not-allowed"
                    }`}
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                    {isDeletingSelection ? "..." : "Apagar"}
                  </button>
                  
                  <div className="h-4 w-[1px] bg-white/5 mx-1" />

                  <button
                    id="prof-telemetry-btn"
                    type="button"
                    onClick={handleExportTelemetry}
                    className="text-accent-primary hover:text-white flex items-center gap-1 font-mono text-[10px] cursor-pointer"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* SEARCH FILTERS FOR STUDENT LIST */}
              <div className="flex gap-2">
                <select
                  value={globalClassroomFilter}
                  onChange={(e) => setGlobalClassroomFilter(e.target.value)}
                  className="bg-slate-950/80 border border-white/5 rounded-lg py-1 px-2 text-[10px] font-mono text-gray-300 focus:border-accent-primary focus:outline-none transition-all w-24"
                >
                  <option value="TODAS">{appLanguage === "en" ? "All Classes" : "Turmas"}</option>
                  <option value="ATIVOS" className="text-emerald-400 font-bold">{appLanguage === "en" ? "● Online Now" : "● Online"}</option>
                  {classrooms.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={profSearchQuery}
                    onChange={(e) => setProfSearchQuery(e.target.value)}
                    placeholder={appLanguage === "en" ? "Filter by student..." : "Filtrar por aluno..."}
                    className="w-full bg-slate-950/80 border border-white/5 rounded-lg py-1.5 px-3 text-[10px] font-mono text-gray-300 focus:border-accent-primary focus:outline-none transition-all"
                  />
                  <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-500" />
                </div>
              </div>

              {/* Scrollable grid representing live performance of students */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                {studentsToDisplay
                  .map((student) => {
                  const phase0CompletedCount = [
                    "0.1", "0.2", "0.3", "0.4", "0.5", "0.6", "0.7", "0.8", "0.9", "0.10",
                    "0.11", "0.12", "0.13", "0.14", "0.15", "0.16", "0.17", "0.18", "0.19", "0.20", "0.21"
                  ].filter(
                    id => student.respostasDesafios?.[id] === true
                  ).length;
                  const isReadyToHire = student.faseAtual === 0 && phase0CompletedCount === 21;
                  const compNow = Date.now() + clockOffset;
                  const isOnline = student.lastSeen && Math.abs(compNow - student.lastSeen) < 210000;

                  return (
                    <div 
                      id={`prof-student-card-${student.id}`}
                      key={student.id} 
                      className={`bg-slate-950/50 p-3 rounded-xl border flex flex-col gap-2 transition-all font-mono text-xs text-left ${
                        selectedIdsForDeletion.includes(student.id) 
                          ? "border-rose-500/50 bg-rose-500/5 shadow-[0_0_10px_rgba(225,29,72,0.1)]" 
                          : "border-white/5 hover:border-accent-primary/20"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-2.5">
                          {/* Selection Checkbox */}
                          <div 
                            onClick={() => handleToggleStudentSelection(student.id)}
                            className={`mt-1 w-4 h-4 rounded border flex items-center justify-center cursor-pointer transition-all ${
                              selectedIdsForDeletion.includes(student.id)
                                ? "bg-rose-500 border-rose-500"
                                : "bg-slate-900 border-white/10 hover:border-rose-500/50"
                            }`}
                          >
                            {selectedIdsForDeletion.includes(student.id) && (
                              <CheckCheck className="w-2.5 h-2.5 text-white" />
                            )}
                          </div>

                          <div className="space-y-0.5 max-w-[140px]">
                            <div className="flex items-center gap-1.5">
                              {(() => {
                                const compNow = Date.now() + clockOffset;
                                const isOnline = student.lastSeen && Math.abs(compNow - student.lastSeen) < 210000;
                                const isFocused = isOnline && student.focoStatus === "Ativo";
                                return (
                                  <div 
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                      isOnline
                                        ? isFocused
                                          ? "bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)] animate-pulse"
                                          : "bg-amber-500 shadow-[0_0_6px_rgba(245,158,11,0.7)] animate-pulse"
                                        : "bg-gray-700"
                                    }`} 
                                    title={
                                      isOnline
                                        ? isFocused
                                          ? "Online (Focado na Tela)"
                                          : "Online (Fora da Tela / Minimizou)"
                                        : "Offline / Ausente"
                                    }
                                  />
                                );
                              })()}
                              <button
                                onClick={() => onOpenChat(student)}
                                className="text-gray-200 block truncate font-sans font-medium hover:text-accent-primary transition-colors text-left"
                              >
                                {student.nomeCompleto}
                              </button>
                            </div>
                            <div className="flex items-center justify-between gap-1 w-full">
                              <span className="text-[10px] text-text-secondary block truncate">
                                MAT: {student.matricula}
                              </span>
                              <button
                                type="button"
                                onClick={() => onDeleteStudents?.([student.id])}
                                className="text-rose-500/40 hover:text-rose-500 transition-colors p-0.5"
                                title="Apagar aluno"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          <span className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded inline-block ${
                            student.status === "Ativo" 
                              ? isOnline 
                                ? "bg-emerald-950/35 text-emerald-400" 
                                : "bg-slate-900 text-gray-400"
                              : "bg-slate-900 text-gray-500"
                          }`}>
                            {student.status === "Ativo" && !isOnline ? "Ausente" : student.status}
                          </span>
                          {student.status === "Ativo" && isOnline && (
                            student.focoStatus === "Fora da Tela" ? (
                              <div className="flex flex-col items-start gap-1 mt-1">
                                <span className="text-[9px] bg-rose-500/15 text-rose-450 border border-rose-500/30 px-1.5 py-0.2 rounded font-sans font-bold uppercase tracking-wider animate-pulse inline-block">
                                  ⚠️ Fora de Foco ({student.saidasTela || 0})
                                </span>
                                {(student.saidasTela || 0) > 0 && onResetStudentFocus && (
                                  <button
                                    type="button"
                                    onClick={() => onResetStudentFocus(student.id)}
                                    className="text-[8px] text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-1.5 py-0.5 rounded transition-all font-sans font-bold uppercase cursor-pointer border border-rose-500/20"
                                  >
                                    {(student.saidasTela || 0) >= 7 ? "Destravar" : "Zerar"}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-start gap-1 mt-1">
                                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded font-sans font-bold uppercase tracking-wider inline-block">
                                  ● No Foco
                                </span>
                                {(student.saidasTela || 0) > 0 && onResetStudentFocus && (
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[8px] text-gray-500">Alertas: {student.saidasTela}</span>
                                    <button
                                      type="button"
                                      onClick={() => onResetStudentFocus(student.id)}
                                      className="text-[8px] text-amber-500 hover:text-white bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded transition-all font-mono font-bold uppercase cursor-pointer border border-white/5"
                                    >
                                      Zerar
                                    </button>
                                  </div>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                          <span className="text-accent-warning block text-xs font-bold">
                            {student.xp} XP
                          </span>
                          <span className="text-[10px] text-text-secondary block">
                            Carreira: F{student.faseAtual}
                          </span>
                          <span className="text-[10px] text-emerald-400 block font-bold">
                            {student.precisao > 0 ? `${student.precisao}% Acertos` : "-"}
                            <span className="text-[8px] text-gray-400 block font-normal mt-0.5 font-sans">
                              ({phase0CompletedCount}/21 na Fase 0)
                            </span>
                            <span className="text-[9px] bg-cyan-950/50 text-[#00E5FF] border border-[#00E5FF]/20 px-1.5 py-0.5 rounded font-mono font-bold block mt-1 hover:border-cyan-400/40 transition-all select-none text-center">
                              Nota F0: {((phase0CompletedCount / 21) * 10).toFixed(1)}/10
                            </span>
                          </span>
                        </div>
                      </div>

                      {/* Highly responsive 'Contratar' CTA for eligible students */}
                      {isReadyToHire && (
                        <button
                          type="button"
                          onClick={() => onPromoteStudent?.(student.id, 1)}
                          className="w-full mt-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 hover:from-emerald-500/30 hover:to-teal-500/30 text-emerald-400 border border-emerald-500/35 text-[10px] py-1 px-2 rounded font-sans font-bold uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer hover:shadow-[0_0_8px_rgba(16,185,129,0.2)] transition-all"
                        >
                          ⚡ CONTRATAR (PROMOVER P/ F1)
                        </button>
                      )}

                      <div className="flex flex-col gap-1.5 border-t border-white/5 pt-1.5 text-[9px] text-text-secondary">
                        <div className="flex items-center justify-between">
                          <span>Progressão de Fase:</span>
                          <select 
                            value={student.faseAtual} 
                            onChange={(e) => onPromoteStudent?.(student.id, parseInt(e.target.value))}
                            className="bg-slate-900 text-gray-200 border border-white/10 rounded px-1 py-0.5 uppercase cursor-pointer focus:outline-none focus:border-accent-primary font-sans text-[10px]"
                          >
                            {[0,1,2,3,4,5,6,7].map(lvl => (
                              <option key={lvl} value={lvl}>Fase {lvl}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tema Sonoro Notific.:</span>
                          <select 
                            value={student.soundTheme || "default"} 
                            onChange={(e) => onUpdateStudent?.(student.id, { soundTheme: e.target.value as any })}
                            className="bg-slate-900 text-accent-primary border border-white/10 rounded px-1 py-0.5 uppercase cursor-pointer focus:outline-none focus:border-accent-primary font-sans text-[10px]"
                          >
                            <option value="default">Padrão</option>
                            <option value="electronic">Eletrônico</option>
                            <option value="organic">Orgânico</option>
                            <option value="classic">Clássico</option>
                            <option value="cyber">Cyber</option>
                            <option value="mellow">Mellow</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeTabPanel === "analytics" && (
        <div className="space-y-6 animate-fade-in text-left">
          
          {/* Header Dashboard Info */}
          <div className="bg-slate-900 border border-cyan-500/10 rounded-xl p-5 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-cyan-500/10 text-cyan-400">
                    <TrendingUp className="w-5 h-5 animate-pulse" />
                  </span>
                  <h3 className="text-sm font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    Diagnóstico Curricular & Mapeamento de Gargalos
                  </h3>
                </div>
                <p className="text-xs text-text-secondary mt-1 font-sans max-w-2xl">
                  Análise pedagógica baseada em submissões de conformidade CLT. Monitore as curvas reais de rendimento por fase da turma e identifique desafios críticos ou lacunas de competência com planos de ação sugeridos.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono text-cyan-400/80 bg-cyan-400/10 px-2 py-1 rounded border border-cyan-500/20">
                  Total de Casos: {CHALLENGES_DATA.length}
                </span>
                
                <div className="flex items-center gap-2 bg-slate-950 border border-white/20 rounded-lg px-2 py-0.5 shadow-sm">
                  <span className="text-[9px] font-mono text-gray-400 uppercase font-bold">Turma:</span>
                  <select 
                    value={globalClassroomFilter}
                    onChange={(e) => setGlobalClassroomFilter(e.target.value)}
                    className="bg-slate-950 border-none text-[10px] font-mono text-accent-warning focus:outline-none cursor-pointer pr-1 font-bold"
                  >
                    <option value="TODAS" className="bg-slate-900 text-white">TODAS</option>
                    <option value="ATIVOS" className="bg-slate-900 text-emerald-400 font-bold">● ATIVOS</option>
                    {classrooms.map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Core Metrics Cards (Top Level Insights) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">Precisão Coletiva</span>
                <span className="p-1 rounded bg-indigo-500/10 text-indigo-400"><Target className="w-4 h-4" /></span>
              </div>
              <div className="mt-2 text-2xl font-mono tracking-tight text-white font-bold">
                {avgClassPrecision}%
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                Média de acertos de primeira tentativa na cohort.
              </p>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">XP Acumulado</span>
                <span className="p-1 rounded bg-amber-500/10 text-amber-400"><TrendingUp className="w-4 h-4" /></span>
              </div>
              <div className="mt-2 text-2xl font-mono tracking-tight text-white font-bold">
                {totalClassXp.toLocaleString()}
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                Experiência total acumulada pela turma selecionada.
              </p>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">Dúvidas Pendentes</span>
                <span className="p-1 rounded bg-amber-500/10 text-amber-400"><MessageSquare className="w-4 h-4" /></span>
              </div>
              <div className="mt-2 text-2xl font-mono tracking-tight text-white font-bold">
                {studentsWithDoubts.length}
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                Alunos aguardando suporte síncrono.
              </p>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">Bloqueios Ativos</span>
                <span className="p-1 rounded bg-rose-500/10 text-rose-500"><ShieldAlert className="w-4 h-4" /></span>
              </div>
              <div className="mt-2 text-2xl font-mono tracking-tight text-white font-bold">
                {studentsBlocked.length}
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                Foco perdido devido a distrações (troca de abas).
              </p>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">Gargalos Críticos</span>
                <span className="p-1 rounded bg-rose-500/10 text-rose-400"><AlertTriangle className="w-4 h-4" /></span>
              </div>
              <div className="mt-2 text-2xl font-mono tracking-tight text-white font-bold">
                {challengesBottleneckRank.filter(c => c["Taxa de Erro (%)"] > 25).length} <span className="text-xs text-text-secondary font-normal font-sans">Casos</span>
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                Taxação de erros &gt; 25% nas submissões.
              </p>
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase tracking-wider text-text-secondary">Sinergia Curricular</span>
                <span className="p-1 rounded bg-cyan-500/10 text-cyan-400"><Zap className="w-4 h-4" /></span>
              </div>
              <div className="mt-2 text-2xl font-mono tracking-tight text-cyan-400 font-bold">
                {Math.round(phasePerformanceCohort.reduce((acc, p) => acc + p["Taxa de Conclusão (%)"], 0) / 8)}%
              </div>
              <p className="text-[10px] text-text-secondary mt-1">
                Grau geral de completude curricular da trilha.
              </p>
            </div>
          </div>

          {/* Gráficos Recharts e Análise Curricular */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart 1: Curva de Aprendizado e Desempenho por Fase */}
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white font-black">
                    1. Curva de Desempenho & Fixação por Fase
                  </h4>
                  <p className="text-[10px] text-text-secondary font-sans font-medium">
                    Combinação do rendimento geral parametrizado vs precisão média.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-cyan-400/80 bg-cyan-400/5 px-2 py-0.5 rounded border border-cyan-500/15">
                  Fase 0 a 7
                </span>
              </div>

              <div className="h-64 mt-4 text-xs font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={phasePerformanceCohort} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="faseName" stroke="#94a3b8" fontSize={9} fontClassName="font-mono" tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} fontClassName="font-mono" domain={[0, 100]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: "8px", color: tooltipText, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      itemStyle={{ color: tooltipText, fontSize: "12px" }}
                      labelStyle={{ color: tooltipLabel, fontSize: "11px", fontWeight: "bold" }}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: "monospace", paddingTop: 10 }} />
                    <Area 
                      type="monotone" 
                      dataKey="Desempenho Geral (%)" 
                      fill="rgba(6, 182, 212, 0.1)" 
                      stroke="#06b6d4" 
                      strokeWidth={1.5}
                      name="Rendimento (%)"
                      activeDot={{ r: 4 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Precisão Média (%)" 
                      stroke="#6366f1" 
                      strokeWidth={2}
                      name="Aproveitamento (%)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="Taxa de Conclusão (%)" 
                      stroke="#eab308" 
                      strokeWidth={1}
                      strokeDasharray="4 4"
                      name="Completude (%)" 
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-950/40 rounded-lg p-3 border border-white/5 text-[10px] font-sans text-text-secondary leading-relaxed space-y-1">
                <span className="font-mono text-cyan-400 block uppercase font-bold text-[9px] tracking-wider">💡 INSIGHT DA CURVA DE APRENDIZADO:</span>
                Visto que a <span className="text-indigo-400 font-bold">Fase 0 (Pré-Cadastro)</span> detém maior percentual de conclusão cumulativa, a precisão tende a se estabilizar. Uma queda na <span className="text-yellow-400 font-semibold">Taxa de Conclusão</span> nas fases seguintes (1 a 3) sugere que os alunos necessitam de intervenção ativa antes de transitarem ao encargo de Assistente de DP.
              </div>
            </div>

            {/* Chart 2: Bottlenecks Identification (Taxa de Erro por Desafio) */}
            <div className="bg-slate-900 border border-white/5 rounded-xl p-4 space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-white font-black">
                    2. Gravidade de Gargalo por Desafio Crítico
                  </h4>
                  <p className="text-[10px] text-text-secondary font-sans font-medium">
                    Score de atrito calculado a partir de submissões falhas e dúvidas ativas.
                  </p>
                </div>
                <span className="text-[9px] font-mono text-rose-400 bg-rose-400/5 px-2 py-0.5 rounded border border-rose-500/15">
                  Foco em Erros
                </span>
              </div>

              <div className="h-64 mt-4 text-xs font-sans">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={identifiedBottlenecks} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis dataKey="shortLabel" stroke="#94a3b8" fontSize={9} fontClassName="font-mono" tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={9} fontClassName="font-mono" domain={[0, 100]} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: tooltipBg, borderColor: tooltipBorder, borderRadius: "8px", color: tooltipText, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      itemStyle={{ color: tooltipText, fontSize: "12px" }}
                      labelStyle={{ color: tooltipLabel, fontSize: "11px", fontWeight: "bold" }}
                      formatter={(value, name) => [value, name]}
                    />
                    <Legend iconSize={8} wrapperStyle={{ fontSize: 9, fontFamily: "monospace", paddingTop: 10 }} />
                    <Bar dataKey="Score de Gargalo" name="Index de Gargalo (%)" radius={[2, 2, 0, 0]}>
                      {identifiedBottlenecks.map((entry, index) => {
                        const score = entry["Score de Gargalo"];
                        const barColor = score > 60 ? "#f43f5e" : score > 30 ? "#f59e0b" : "#3b82f6";
                        return <Cell key={`cell-${index}`} fill={barColor} />;
                      })}
                    </Bar>
                    <Bar dataKey="Erros" name="Qtd. Erros" fill="#94a3b8" radius={[2, 2, 0, 0]} opacity={0.3} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-slate-950/40 rounded-lg p-3 border border-white/5 text-[10px] font-sans text-text-secondary space-y-1">
                <span className="font-mono text-rose-400 block uppercase font-bold text-[9px] tracking-wider">⚡ ZONEAMENTO DE RISCO DIDÁTICO:</span>
                Barras <span className="text-rose-400 font-bold">Vermelhas (&gt;60%)</span> apontam gargalos com atrito pedagógico elevado. Recomenda-se realizar plantão de dúvidas na mesa de controle ou usar reforço didático específico.
              </div>
            </div>

          </div>

          {/* Diagnostics Section: Top Bottlenecks and recommended actions */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono uppercase tracking-wider text-text-secondary font-black">
              📋 Prescrições Didáticas e Mapeamento de Falhas (Professor/Monitoria)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {identifiedBottlenecks.slice(0, 3).map((item, idx) => {
                const isCritical = item["Score de Gargalo"] > 40 || item["Erros"] > 0;
                
                let customPlan = "Revise presencialmente as regras consolidadas do e-Social e simule exercícios alternativos na Sandbox para consolidar.";
                if (item.id === "0.1") {
                  customPlan = "Alunos confundem pessoalidade com dedicação exclusiva. Explique que o Art. 3º CLT não exige exclusividade para configurar o vínculo de emprego!";
                } else if (item.id === "0.2") {
                  customPlan = "Destaque que o FGTS (8%) é um encargo exclusivo patronal tributário do Art. 15 Lei 8.036. Descontar do funcionário em holerite comum gera severa brecha fiscal!";
                } else if (item.id === "0.3") {
                  customPlan = "Explique a tolerância limite do Art. 58 §1º da CLT (até 5 mins por marcação, teto de 10 mins diários). Aborde os prejuízos de descontos abusivos de atrasos ínfimos!";
                } else if (item.id === "0.4") {
                  customPlan = "Reforce o repouso semanal remunerado proporcional e suas regras de perda sob faltas injustificadas na mesma semana fiscal.";
                } else if (item.id === "1.1") {
                  customPlan = "Ponto crítico em contratos de Estágio - Lei 11.788/08. Enfatize a limitação estrita de 6 horas diárias e a nulidade do vínculo cooperativo por desborde funcional.";
                } else if (item.id === "1.2") {
                  customPlan = "Revisar as convenções coletivas de teto salarial e o salário proporcional para admissões com jornada em tempo parcial (Art. 58-A CLT).";
                }

                return (
                  <div 
                    key={item.id} 
                    className={`bg-slate-900 border rounded-xl p-4 flex flex-col justify-between space-y-4 ${
                      isCritical ? "border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.03)] opacity-100" : "border-white/5"
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="text-[9px] font-mono font-bold text-rose-450 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/15 uppercase">
                          Gargalo {idx + 1}
                        </span>
                        <span className="text-[10px] font-mono text-text-secondary">
                          Desafio {item.id}
                        </span>
                      </div>
                      
                      <div>
                        <h5 className="text-xs font-bold text-white font-sans line-clamp-1">
                          {item.titulo}
                        </h5>
                        <p className="text-[10px] font-mono text-text-secondary mt-0.5">
                          Tópico: {item.foco} ({item.faseLabel})
                        </p>
                      </div>

                      {/* Diagnostic metrics */}
                      <div className="grid grid-cols-3 gap-2 border-y border-white/5 py-2 my-2 text-center">
                        <div>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-text-secondary block">Erros</span>
                          <span className={`text-xs font-mono font-bold ${item["Erros"] > 0 ? "text-rose-400" : "text-white"}`}>
                            {item["Erros"]}
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-text-secondary block">Taxa Erro</span>
                          <span className={`text-xs font-mono font-bold ${item["Taxa de Erro (%)"] > 25 ? "text-amber-400" : "text-white"}`}>
                            {item["Taxa de Erro (%)"]}%
                          </span>
                        </div>
                        <div>
                          <span className="text-[8px] font-mono uppercase tracking-wider text-text-secondary block">Preocupação</span>
                          <span className={`text-xs font-mono font-bold ${item["Score de Gargalo"] > 50 ? "text-rose-500" : "text-cyan-400"}`}>
                            {item["Score de Gargalo"]}%
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <span className="text-[8px] font-mono uppercase tracking-wider text-cyan-400 font-bold block">
                        ✔ PLANO DE AÇÃO PRECEPTOR:
                      </span>
                      <p className="text-[10px] font-sans text-text-secondary leading-relaxed bg-slate-950/40 border border-white/5 rounded p-2.5">
                        {customPlan}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Classroom Interventions Panel (Action Bar) */}
          <div className="bg-slate-900 border border-white/5 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="text-xs font-mono uppercase tracking-wider text-white font-black">
                🎮 Mesa de Controle: Intervenções Coletivas em Tempo Real
              </h4>
              <p className="text-[10px] text-text-secondary font-sans mt-0.5">
                Comandos pedagógicos integrados para atuar em tempo real sobre a trilha cooperativa de todos os estudantes.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
              
              {/* Action 1: Mass Knowledge Pill */}
              <button
                type="button"
                onClick={triggerCurriculumPillSim}
                disabled={activeIntervention !== null}
                className="group relative bg-slate-950 hover:bg-slate-950/80 border border-white/5 hover:border-cyan-500/25 p-4 rounded-xl text-left transition-all overflow-hidden flex flex-col justify-between h-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="space-y-1 relative z-10">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" /> Pílula de Teoria
                  </span>
                  <h5 className="text-xs font-bold text-white mt-1">Disparar Reforço Pedagógico</h5>
                  <p className="text-[10px] text-text-secondary leading-relaxed font-sans mt-0.5">
                    Dispara diretrizes teóricas gerais e regras consolidadas do CLT sobre os tópicos de maior atrito diretamente no terminal acadêmico.
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-mono pt-3 relative z-10 w-full mt-auto">
                  <span className="text-cyan-400 group-hover:underline">Enviar material</span>
                  <span className="text-text-secondary">Simulação</span>
                </div>
                
                {activeIntervention === "pill" && (
                  <div className="absolute inset-0 bg-cyan-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 animate-fade-in z-20">
                    <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                    <span className="text-[10px] font-mono text-cyan-400 mt-2">Disparando esclarecimentos doutrinários...</span>
                  </div>
                )}
              </button>

              {/* Action 2: Clear Pending Doubts in bulk */}
              <button
                type="button"
                onClick={triggerThemeWorkspaceClear}
                disabled={activeIntervention !== null || students.filter(s => s.pausaAtiva === "duvida" || s.duvidaPendenteTexto).length === 0}
                className="group relative bg-slate-950 hover:bg-slate-950/80 border border-white/5 hover:border-amber-500/25 p-4 rounded-xl text-left transition-all overflow-hidden flex flex-col justify-between h-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="space-y-1 relative z-10 font-sans">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" /> Plantão Síncrono de Dúvidas
                  </span>
                  <h5 className="text-xs font-bold text-white mt-1">Resolver Todas as Dúvidas</h5>
                  <p className="text-[10px] text-text-secondary leading-relaxed font-sans mt-0.5">
                    Analisa e resolve eletronicamente as indagações pendentes de toda a turma conectada, liberando os canais acadêmicos e creditando bônus de XP.
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-mono pt-3 relative z-10 w-full mt-auto">
                  <span className="text-amber-400 group-hover:underline">Zerar dúvidas em massa ({students.filter(s => s.pausaAtiva === "duvida" || s.duvidaPendenteTexto).length})</span>
                  <span className="text-text-secondary">Conexão Real</span>
                </div>

                {activeIntervention === "doubt-clear" && (
                  <div className="absolute inset-0 bg-amber-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 animate-fade-in z-20">
                    <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                    <span className="text-[10px] font-mono text-amber-400 mt-2">Homologando pregações didáticas...</span>
                  </div>
                )}
              </button>

              {/* Action 3: Clear screen exits focus warnings bulk */}
              <button
                type="button"
                onClick={triggerFocusRefurbish}
                disabled={activeIntervention !== null || students.filter(s => s.status === "Ativo" && (s.saidasTela || 0) > 0 && (s.saidasTela || 0) < 7).length === 0}
                className="group relative bg-slate-950 hover:bg-slate-950/80 border border-white/5 hover:border-emerald-500/25 p-4 rounded-xl text-left transition-all overflow-hidden flex flex-col justify-between h-36 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="space-y-1 relative z-10 font-sans">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5" /> Foco Coletivo Reset
                  </span>
                  <h5 className="text-xs font-bold text-white mt-1">Resetar Alertas de Tela</h5>
                  <p className="text-[10px] text-text-secondary leading-relaxed font-sans mt-0.5">
                    Reduz a zero os desvios involuntários de aba registradas nos logs, de modo a desativar overlays e advertências automáticas do preceptor.
                  </p>
                </div>
                
                <div className="flex justify-between items-center text-[10px] font-mono pt-3 relative z-10 w-full mt-auto">
                  <span className="text-emerald-400 group-hover:underline">Zerar saídas de {students.filter(s => s.status === "Ativo" && (s.saidasTela || 0) > 0 && (s.saidasTela || 0) < 7).length} alunos</span>
                  <span className="text-text-secondary">Conexão Real</span>
                </div>

                {activeIntervention === "focus-clear" && (
                  <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-3 animate-fade-in z-20">
                    <Loader2 className="w-6 h-6 text-emerald-400 animate-spin" />
                    <span className="text-[10px] font-mono text-emerald-400 mt-2">Resetando tolerâncias comportamentais...</span>
                  </div>
                )}
              </button>

            </div>
          </div>

        </div>
      )}

      {activeTabPanel === "telemetry" && (
        <div className="space-y-6 animate-fade-in text-left">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950/40 p-4 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent-primary/10 rounded-lg border border-accent-primary/20">
                <BarChart3 className="w-5 h-5 text-accent-primary" />
              </div>
              <div>
                <h3 className="text-sm font-sans font-black text-gray-100 uppercase tracking-widest">Painel Recharts de Telemetria Geral</h3>
                <p className="text-[10px] text-text-secondary font-mono">Visualização analítica de cohort e gargalos de aprendizagem</p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-white/20 shadow-md">
              <span className="text-[9px] font-mono font-bold text-gray-400 uppercase ml-2">Filtro Local:</span>
              <select 
                value={globalClassroomFilter}
                onChange={(e) => setGlobalClassroomFilter(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg px-3 py-1.5 text-[10px] font-mono text-accent-primary font-bold focus:outline-none focus:border-accent-primary/60 transition-all cursor-pointer"
              >
                <option value="TODAS" className="bg-slate-900 text-white">TODAS AS TURMAS</option>
                <option value="ATIVOS" className="bg-slate-900 text-emerald-400 font-bold">● ONLINE AGORA (ATIVOS)</option>
                {classrooms.map(c => (
                  <option key={c} value={c} className="bg-slate-900 text-white">{c.toUpperCase()}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Subsection Grid analytics overview specific to Telemetry insights */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 font-mono">
              <span className="text-text-secondary text-[10px] block font-bold uppercase flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Precisão Geral Turma
              </span>
              <span className="text-lg font-bold text-emerald-400 block mt-1.5">
                {avgClassPrecision > 0 ? `${avgClassPrecision}%` : "0%"}
              </span>
              <span className="text-[9px] text-gray-500 mt-0.5 block">Média de acerto agregada</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 font-mono">
              <span className="text-text-secondary text-[10px] block font-bold uppercase flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-accent-warning" />
                XP Total Cohort
              </span>
              <span className="text-lg font-bold text-accent-warning block mt-1.5">
                {totalClassXp.toLocaleString("pt-BR")} XP
              </span>
              <span className="text-[9px] text-gray-500 mt-0.5 block">Progresso cumulativo total</span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 font-mono">
              <span className="text-text-secondary text-[10px] block font-bold uppercase flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5 text-rose-400" />
                Desafio Crítico (Hardest)
              </span>
              <span className="text-sm font-bold text-rose-400 block mt-1.5 truncate">
                {hardestChallenge ? `${hardestChallenge.shortLabel}: ${hardestChallenge["Taxa de Acertos (%)"]}%` : "—"}
              </span>
              <span className="text-[9px] text-gray-500 mt-0.5 block truncate">
                {hardestChallenge ? hardestChallenge.titulo : "Menor taxa de acertos da sala"}
              </span>
            </div>
            <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 font-mono">
              <span className="text-text-secondary text-[10px] block font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Aluno Destaque (Top Performance)
              </span>
              <span className="text-sm font-bold text-indigo-400 block mt-1.5 truncate">
                {topStudent ? `${topStudent.nomeCompleto}` : "—"}
              </span>
              <span className="text-[9px] text-gray-500 mt-0.5 block opacity-80">
                {topStudent ? `Fase ${topStudent.faseAtual} • ${topStudent.xp} XP` : "Maior XP acumulado"}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* 1. Média de XP por Fase (Line Chart) */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <TrendingUp className="w-5 h-5 text-accent-primary" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                    Progressão de XP Média por Fase
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-snug">
                    Curva real de XP médio acumulado pela turma comparado à linha base correspondente de cada nível de carreira.
                  </p>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={xpProgressionData} margin={{ top: 15, right: 20, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="fase" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: tooltipBg === "#ffffff" ? "#ffffff" : "#020617", borderColor: tooltipBorder, borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      itemStyle={{ color: tooltipText, fontSize: "12px" }}
                      labelStyle={{ color: tooltipLabel, fontSize: "11px", fontWeight: "bold" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }} />
                    <Line type="monotone" dataKey="XP Médio" stroke="#6366f1" strokeWidth={3} activeDot={{ r: 7 }} name="Média Real Turma" />
                    <Line type="monotone" dataKey="Referência Base" stroke="#eab308" strokeWidth={2} strokeDasharray="5 5" name="Selo Basal" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* 2. Distribuição de Acertos por Desafio (Bar Chart) */}
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex items-center gap-2 border-b border-white/5 pb-3">
                <BarChart3 className="w-5 h-5 text-accent-warning" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                    Distribuição de Acertos por Desafio
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-snug">
                    Percentual de acerto (taxa de resoluções de sucesso) em toda a trilha de RH da Fase 0 e Fase 1.
                  </p>
                </div>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={challengeAccuracyData} margin={{ top: 15, right: 10, left: -25, bottom: 0 }}>
                    <defs>
                      <linearGradient id="accuracyGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.15}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="shortLabel" stroke="#94a3b8" fontSize={10} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} tickLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: tooltipBg === "#ffffff" ? "#ffffff" : "#020617", borderColor: tooltipBorder, borderRadius: "8px", boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }}
                      itemStyle={{ color: tooltipText, fontSize: "12px" }}
                      labelStyle={{ color: tooltipLabel, fontSize: "11px", fontWeight: "bold" }}
                      formatter={(value: any, name: any, props: any) => {
                        if (name === "Taxa de Acertos (%)") {
                          return [`${value}% de acerto`, `${props.payload.titulo}`];
                        }
                        return [value, name];
                      }}
                    />
                    <Bar dataKey="Taxa de Acertos (%)" fill="url(#accuracyGrad)" name="Taxa de Acertos (%)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Table representing cohort live matrix detailed metrics for the teacher */}
          <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 pb-4 gap-4">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-accent-primary" />
                <div>
                  <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                    Quadro Analítico de Desempenho
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Ficha de rendimento individual com totalizações de XP, precisão média e taxa de cumprimento das metas curriculares.
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-3">
                {/* Search Bar for Analytical Table */}
                <div className="relative w-full sm:w-56">
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={profSearchQuery}
                    onChange={(e) => setProfSearchQuery(e.target.value)}
                    placeholder="Buscar por nome..."
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-[10px] font-mono text-gray-300 focus:border-accent-primary focus:outline-none transition-all placeholder:text-gray-600"
                  />
                </div>

                {/* Local Classroom Filter */}
                <div className="flex items-center gap-2 bg-slate-950 border border-white/20 rounded-xl px-3 py-1.5 w-full sm:w-auto shadow-md">
                  <Filter className="w-3 h-3 text-gray-400" />
                  <select 
                    value={globalClassroomFilter}
                    onChange={(e) => setGlobalClassroomFilter(e.target.value)}
                    className="bg-transparent border-none text-[10px] font-mono text-gray-200 font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="TODAS" className="bg-slate-900 text-white">TODAS AS TURMAS</option>
                    <option value="ATIVOS" className="bg-slate-900 text-emerald-400 font-bold">● ONLINE AGORA (ATIVOS)</option>
                    {classrooms.map(c => (
                      <option key={c} value={c} className="bg-slate-900 text-white">{c.toUpperCase()}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleExportTelemetry}
                    className="text-accent-primary hover:text-white flex items-center gap-1 font-mono text-[10px] cursor-pointer whitespace-nowrap bg-white/5 px-2 py-1.5 rounded-lg border border-white/5 hover:border-accent-primary/30 transition-all flex-1 sm:flex-initial"
                  >
                    <Download className="w-3.5 h-3.5" /> JSON
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setIsDownloadingQRs(true);
                      try {
                        const { exportAllQRBadgesToPDF } = await import("../utils/qrExporter");
                        await exportAllQRBadgesToPDF(students, "pt");
                      } catch (e) {
                        console.error("Error exporting QR codes from panel", e);
                      } finally {
                        setIsDownloadingQRs(false);
                      }
                    }}
                    disabled={isDownloadingQRs}
                    className="text-emerald-400 hover:text-white flex items-center gap-1.5 font-mono text-[10px] cursor-pointer whitespace-nowrap bg-emerald-500/10 px-2.5 py-1.5 rounded-lg border border-emerald-500/20 hover:border-emerald-500/40 transition-all font-bold disabled:opacity-50 flex-1 sm:flex-initial"
                  >
                    {isDownloadingQRs ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" /> PDF QR
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="border-b border-white/10 text-[10px] text-text-secondary uppercase select-none">
                    <th className="py-2.5 px-3">Nome / Chamada</th>
                    <th className="py-2.5 px-3 text-center">Fase</th>
                    <th className="py-2.5 px-3 text-right">XP</th>
                    <th className="py-2.5 px-3 text-right">Precisão</th>
                    <th className="py-2.5 px-3 text-center">Resoluções</th>
                    <th className="py-2.5 px-3 text-center">Foco / Presença</th>
                    <th className="py-2.5 px-3">Metas de Onboarding (Fase 0)</th>
                    <th className="py-2.5 px-3 text-right">Ação Analítica</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudentsByClass
                    .filter(s => {
                      if (!profSearchQuery.trim()) return true;
                      const q = profSearchQuery.toLowerCase();
                      return s.nomeCompleto.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
                    })
                    .map((student) => {
                      const compNow = Date.now() + clockOffset;
                      const isOnline = student.lastSeen && Math.abs(compNow - student.lastSeen) < 210000;
                      
                      const phaseConfig = CAREER_PHASES.find(p => p.id === student.faseAtual);
                      const totalInPhase = phaseConfig?.totalDesafios || 7;
                      
                      const finishedCountGlobal = Object.values(student.respostasDesafios || {}).filter(val => val === true).length;
                      // Count only challenges in current phase
                      const phaseChallenges = CHALLENGES_DATA.filter(c => c.fase === student.faseAtual);
                      const finishedInPhase = phaseChallenges.filter(c => student.respostasDesafios?.[c.id] === true).length;
                      const completionRate = Math.min(100, Math.round((finishedInPhase / totalInPhase) * 100));

                      // User requested that starting count should reflect actual questions
                      // If phase is -1, denominator is 55. If 0, denominator is 21.
                      // numerator is finishedInPhase. 
                      // If starting at phase -1, they want to see it as a real count of questions.
                      
                      return (
                        <tr key={student.id} className="border-b border-white/5 hover:bg-slate-900/40 hover:text-white transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const compNow = Date.now() + clockOffset;
                              const isOnline = student.lastSeen && Math.abs(compNow - student.lastSeen) < 210000;
                              const isFocused = isOnline && student.focoStatus === "Ativo";
                              return (
                                <div 
                                  className={`w-2 h-2 rounded-full shrink-0 ${
                                    isOnline
                                      ? isFocused
                                        ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.7)] animate-pulse"
                                        : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.7)] animate-pulse"
                                      : "bg-gray-700"
                                  }`} 
                                  title={
                                    isOnline
                                      ? isFocused
                                        ? "Online e Focado"
                                        : "Online (Em outra aba / Desfocado)"
                                      : "Offline / Ausente"
                                  }
                                />
                              );
                            })()}
                            <span className="font-sans font-semibold text-gray-100 block">{student.nomeCompleto}</span>
                            {(student.tentativaFraude || 0) > 0 && (
                              <span className="bg-red-500/20 text-red-500 text-[8px] px-1.5 py-0.5 rounded-full border border-red-500/30 animate-pulse font-bold uppercase">
                                FRAUDE!
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-gray-400">ID: {student.id} | MAT: {student.matricula}</span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-accent-primary font-bold px-1.5 py-0.5 rounded bg-blue-950/20 border border-blue-500/10 text-[10px]">
                            F{student.faseAtual}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-accent-warning font-bold">
                          {student.xp} XP
                        </td>
                        <td className={`py-3 px-3 text-right font-bold ${student.precisao >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {student.precisao > 0 ? `${student.precisao}%` : "—"}
                        </td>
                        <td className="py-3 px-3 text-center text-gray-300">
                          {finishedInPhase} / {totalInPhase}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {!isOnline ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-[9px] bg-slate-800/40 text-gray-400 border border-white/5 px-1.5 py-0.5 rounded font-bold tracking-wider inline-block text-center uppercase font-mono">
                                ● Ausente
                              </span>
                            </div>
                          ) : student.status === "Ativo" ? (
                            student.focoStatus === "Fora da Tela" ? (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] bg-rose-500/15 text-rose-450 border border-rose-500/20 px-1.5 py-0.5 rounded font-black tracking-wider animate-pulse inline-block text-center uppercase font-mono">
                                  🚫 Fora da Tela
                                </span>
                                <span className="text-[8px] text-gray-500 font-mono">
                                  Alertas: {student.saidasTela || 0}
                                </span>
                                {(student.saidasTela || 0) > 0 && onResetStudentFocus && (
                                  <button
                                    type="button"
                                    onClick={() => onResetStudentFocus(student.id)}
                                    className="text-[8px] text-rose-450 hover:text-white bg-rose-500/10 hover:bg-rose-500 px-1.5 py-0.5 rounded transition-all font-mono font-bold uppercase mt-0.5 cursor-pointer border border-rose-500/25"
                                  >
                                    {(student.saidasTela || 0) >= 7 ? "Destravar" : "Zerar"}
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-[9px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded font-bold tracking-wider inline-block text-center uppercase font-mono">
                                  ● Na Tela
                                </span>
                                <span className="text-[8px] text-gray-550 font-mono">
                                  Alertas: {student.saidasTela || 0}
                                </span>
                                {(student.saidasTela || 0) > 0 && onResetStudentFocus && (
                                  <button
                                    type="button"
                                    onClick={() => onResetStudentFocus(student.id)}
                                    className="text-[8px] text-amber-500 hover:text-white bg-slate-800 hover:bg-slate-700 px-1.5 py-0.5 rounded transition-all font-mono font-bold uppercase mt-0.5 cursor-pointer border border-white/5"
                                  >
                                    Zerar
                                  </button>
                                )}
                              </div>
                            )
                          ) : (
                            <span className="text-gray-500 text-[10px]">&mdash;</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-full max-w-[130px] bg-slate-950 rounded-full h-1.5 overflow-hidden border border-white/5">
                              <div className="bg-gradient-to-r from-accent-primary to-emerald-500 h-full rounded-full" style={{ width: `${completionRate}%` }}></div>
                            </div>
                            <span className="text-[9px] text-gray-400">{completionRate}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedTelemetryStudentId(student.id)}
                            className="bg-[#00E5FF]/10 text-[#00E5FF] hover:bg-[#00E5FF] hover:text-slate-950 font-sans font-bold px-2.5 py-1 rounded-lg border border-[#00E5FF]/20 text-[10px] uppercase transition-all tracking-wider cursor-pointer inline-flex items-center gap-1.5 hover:shadow-[0_0_12px_rgba(0,229,255,0.3)] active:scale-95 touch-manipulation font-black"
                          >
                            <Cpu className="w-3.5 h-3.5" />
                            Telemetria
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {/* Summary Footer Row */}
                  {(() => {
                    const analyticalFiltered = filteredStudentsByClass.filter(s => {
                      if (!profSearchQuery.trim()) return true;
                      const q = profSearchQuery.toLowerCase();
                      return s.nomeCompleto.toLowerCase().includes(q) || s.matricula.toLowerCase().includes(q) || s.id.toLowerCase().includes(q);
                    });

                    if (analyticalFiltered.length === 0) return null;

                    const totalXP = analyticalFiltered.reduce((sum, s) => sum + (s.xp || 0), 0);
                    const avgPrecisao = analyticalFiltered.reduce((sum, s) => sum + (s.precisao || 0), 0) / analyticalFiltered.length;
                    
                    const avgCompletion = (analyticalFiltered.reduce((sum, s) => {
                      const phaseConfig = CAREER_PHASES.find(p => p.id === s.faseAtual);
                      const total = phaseConfig?.totalDesafios || 7;
                      const phaseChs = CHALLENGES_DATA.filter(c => c.fase === s.faseAtual);
                      const finished = phaseChs.filter(c => s.respostasDesafios?.[c.id] === true).length;
                      return sum + (finished / total);
                    }, 0) / analyticalFiltered.length) * 100;

                    return (
                      <tr className="bg-slate-950/80 font-bold border-t-2 border-white/10 sticky bottom-0">
                        <td className="py-4 px-3 text-accent-primary uppercase text-[10px] tracking-widest">Totais / Médias da Turma</td>
                        <td className="py-4 px-3"></td>
                        <td className="py-4 px-3 text-right text-accent-warning text-sm">{totalXP.toLocaleString()} XP</td>
                        <td className="py-4 px-3 text-right text-emerald-400 text-sm">{avgPrecisao.toFixed(1)}%</td>
                        <td className="py-4 px-3"></td>
                        <td className="py-4 px-3"></td>
                        <td className="py-4 px-3">
                           <div className="flex items-center gap-2">
                             <div className="w-full max-w-[130px] bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                               <div className="bg-gradient-to-r from-accent-primary to-emerald-500 h-full" style={{ width: `${avgCompletion}%` }}></div>
                             </div>
                             <span className="text-[10px] text-accent-primary font-black">{avgCompletion.toFixed(1)}%</span>
                           </div>
                        </td>
                        <td className="py-4 px-3"></td>
                      </tr>
                    );
                  })()}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* OFICINA DE CENÁRIOS PARA TREINAMENTOS */}
      {activeTabPanel === "scenarios" && (
        <div id="scenarios-work-bay" className="space-y-6 animate-fade-in text-left">
          
          <div className="glass-panel p-6 rounded-2xl border border-amber-500/10 bg-slate-900/40 relative overflow-hidden font-sans">
            <div className="absolute top-0 right-0 bg-amber-500/10 px-3 py-1 text-[10px] rounded-bl text-amber-400 uppercase font-bold tracking-widest font-mono">
              Diagnóstico Curricular & Mapeamento de Gargalos v2.9
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-500">
                  <Sparkles className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-sans font-black uppercase text-gray-100 tracking-wide">
                    Estúdio de Lançamento de Cenários Autorais
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-relaxed">
                    Crie desafios personalizados de e-Social e DP, simule queixas trabalhistas reais e direcione-os imediatamente para os alunos.
                  </p>
                </div>
              </div>
            </div>

            {scenStatusMsg && (
              <div className={`mt-4 p-3 rounded-xl border text-xs font-mono font-bold ${
                scenStatusMsg.type === "success" 
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" 
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}>
                {scenStatusMsg.text}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
            
            {/* FORMULÁRIO DE CONSTRUÇÃO DE CENÁRIO (Col-span 2) */}
            <div className="lg:col-span-2 bg-slate-900/60 border border-white/5 rounded-2xl p-6 space-y-6 relative">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <h4 className="text-xs font-mono font-black text-[#00E5FF] uppercase tracking-wider flex items-center gap-2">
                  <span>🛠️</span> CONSTRUTOR DE PARÂMETROS SOCIAIS
                </h4>
                
                {/* PRESETS PICKER */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-gray-400">Presets Rápidos:</span>
                  <select
                    value={scenPresetNum}
                    onChange={(e) => handleApplyPreset(Number(e.target.value))}
                    className="bg-slate-950 border border-white/10 rounded-md py-1 px-2 font-mono text-[10px] text-gray-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                  >
                    <option value={-1}>-- Criar Personalizado --</option>
                    {SCENARIO_PRESETS.map((preset, idx) => (
                      <option key={preset.id} value={idx}>{preset.titulo} (Fase {preset.fase})</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                
                <div className="space-y-1.5 col-span-1 md:col-span-2">
                  <label className="text-gray-400 font-bold block">Título do Cenário de Treinamento</label>
                  <input
                    type="text"
                    value={scenTitulo}
                    onChange={(e) => setScenTitulo(e.target.value)}
                    placeholder="Ex: Fraude de Vale-Transporte com Falsidade Ideológica"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-255 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block font-mono text-[10px]">ID do Registro (Bypass)</label>
                  <input
                    type="text"
                    value={scenId}
                    onChange={(e) => setScenId(e.target.value)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-300 font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block">Estação de Destino (Fase do Simulador)</label>
                  <select
                    value={scenFase}
                    onChange={(e) => setScenFase(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value={0}>Fase 0: Pré-seleção e Teoria CLT</option>
                    <option value={1}>Fase 1: Admissão e e-Social Onboarding</option>
                    <option value={2}>Fase 2: Gestão de Jornada & Ausências</option>
                    <option value={3}>Fase 3: Operação de Folha & DSR</option>
                    <option value={4}>Fase 4: Periculosidade e Turnos Complexos</option>
                    <option value={5}>Fase 5: Rotina de Férias & Proventos</option>
                    <option value={6}>Fase 6: Demissões e Cálculos de Rescisão</option>
                    <option value={7}>Fase 7: Auditoria de Homologação Final</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block">Tipo Técnico do Caso</label>
                  <select
                    value={scenTipo}
                    onChange={(e) => setScenTipo(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none"
                  >
                    <option value="Erro font-bold">Incoerência de Cadastro (Erro)</option>
                    <option value="Cálculo">Incorreção Numérica (Cálculo)</option>
                    <option value="Justa Causa">Desligamento Gravoso (Justa Causa)</option>
                    <option value="Explicativo">Conhecimento de e-Social (Explicativo)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block">Foco de Auditoria Prática</label>
                  <input
                    type="text"
                    value={scenFocoTecnico}
                    onChange={(e) => setScenFocoTecnico(e.target.value)}
                    placeholder="Ex: Desvia de e-Social / Jornada em Dobro"
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block">Recompensa ao Concluir (XP)</label>
                  <input
                    type="number"
                    value={scenXpRecompensa}
                    onChange={(e) => setScenXpRecompensa(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-gray-400 font-bold block">Sessão Exigida (Tempo Limite em Minutos)</label>
                  <input
                    type="number"
                    value={scenTempoLimiteMinutos}
                    onChange={(e) => setScenTempoLimiteMinutos(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-200 focus:outline-none"
                  />
                </div>

                {/* EMPREGADO META DATA CARD */}
                <div className="col-span-1 md:col-span-2 bg-slate-955/40 p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block border-b border-white/5 pb-1">
                    👤 DADOS AUXILIARES DO TRABALHADOR
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="space-y-1 text-[11px]">
                      <span className="text-gray-500">Nome Completo do Obreiro</span>
                      <input
                        type="text"
                        value={scenEmpNome}
                        onChange={(e) => setScenEmpNome(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-gray-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <span className="text-gray-500">CBO Ocupação</span>
                      <input
                        type="text"
                        value={scenEmpCbo}
                        onChange={(e) => setScenEmpCbo(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-gray-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <span className="text-gray-500">Salário Contratual (R$)</span>
                      <input
                        type="number"
                        value={scenEmpSalBase}
                        onChange={(e) => setScenEmpSalBase(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-gray-200 focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <span className="text-gray-500">Data de Admissão</span>
                      <input
                        type="text"
                        value={scenEmpAdmissao}
                        onChange={(e) => setScenEmpAdmissao(e.target.value)}
                        placeholder="DD/MM/AAAA"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-gray-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <span className="text-gray-500">Data do Fato Reclamado</span>
                      <input
                        type="text"
                        value={scenEmpDataFato}
                        onChange={(e) => setScenEmpDataFato(e.target.value)}
                        placeholder="DD/MM/AAAA"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-gray-200 focus:outline-none font-mono"
                      />
                    </div>
                    <div className="space-y-1 text-[11px]">
                      <span className="text-gray-500">Regime Contratual / Jornada</span>
                      <input
                        type="text"
                        value={scenEmpJornada}
                        onChange={(e) => setScenEmpJornada(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2 py-1 text-gray-200 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* QUEIXA DO CASO DE ESTUDO */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-gray-400 font-bold block">Queixa Trabalhista, Erro em Lançamento ou Reclamação</label>
                  <textarea
                    rows={4}
                    value={scenQueixa}
                    onChange={(e) => setScenQueixa(e.target.value)}
                    placeholder="Discorra de forma nítida os detalhes e as evidências do caso de e-social ou cálculo faltoso que o aluno necessitará solucionar e apontar o gabarito correto..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-250 focus:outline-none text-xs leading-relaxed"
                  />
                </div>

                {/* ALTERNATIVAS DE MULTIPLA ESCOLHA */}
                <div className="col-span-1 md:col-span-2 bg-slate-1000/30 p-4 rounded-xl border border-white/5 space-y-3">
                  <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block border-b border-white/5 pb-1">
                    📋 ALTERNATIVAS DISPONÍVEIS E GABARITO DE RESPOSTA
                  </span>
                  
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center gap-3">
                      <span className="bg-amber-500/10 text-amber-500 w-6 h-6 flex items-center justify-center font-bold rounded border border-amber-500/15">A</span>
                      <input
                        type="text"
                        value={scenOptA}
                        onChange={(e) => setScenOptA(e.target.value)}
                        placeholder="Descreva a alternativa A..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg py-1.5 px-3 text-gray-200 focus:outline-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-amber-500/10 text-amber-500 w-6 h-6 flex items-center justify-center font-bold rounded border border-amber-500/15">B</span>
                      <input
                        type="text"
                        value={scenOptB}
                        onChange={(e) => setScenOptB(e.target.value)}
                        placeholder="Descreva a alternativa B..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg py-1.5 px-3 text-gray-205 focus:outline-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 text-gray-400 w-6 h-6 flex items-center justify-center font-bold rounded">C</span>
                      <input
                        type="text"
                        value={scenOptC}
                        onChange={(e) => setScenOptC(e.target.value)}
                        placeholder="Descreva a alternativa C (opcional)..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg py-1.5 px-3 text-gray-220 focus:outline-none text-xs"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="bg-slate-800 text-gray-400 w-6 h-6 flex items-center justify-center font-bold rounded">D</span>
                      <input
                        type="text"
                        value={scenOptD}
                        onChange={(e) => setScenOptD(e.target.value)}
                        placeholder="Descreva a alternativa D (opcional)..."
                        className="flex-1 bg-slate-950 border border-white/10 rounded-lg py-1.5 px-3 text-gray-220 focus:outline-none text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-white/5 pt-3 mt-3">
                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-bold block text-xs">Alternativa Marcada como Correta</label>
                      <select
                        value={scenCorrectOpt}
                        onChange={(e) => setScenCorrectOpt(e.target.value)}
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-200 font-mono font-bold focus:outline-none"
                      >
                        <option value="A">Alternativa A (Gabarito Oficial)</option>
                        <option value="B">Alternativa B (Gabarito Oficial)</option>
                        {scenOptC.trim() && <option value="C">Alternativa C (Gabarito Oficial)</option>}
                        {scenOptD.trim() && <option value="D">Alternativa D (Gabarito Oficial)</option>}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-gray-400 font-bold block text-xs">Fundamentação / Artigo de CLT ou e-Social</label>
                      <input
                        type="text"
                        value={scenArtigoLegal}
                        onChange={(e) => setScenArtigoLegal(e.target.value)}
                        placeholder="Ex: Artigo 456-A da CLT"
                        className="w-full bg-slate-950 border border-white/10 rounded-lg px-2.5 py-1.5 text-gray-200 focus:outline-none font-sans text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* JUSTIFICATIVA OFICIAL DA RESPOSTA E SUPORTE PEDAGÓGICO */}
                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <label className="text-gray-400 font-bold block">Justificativa e Resolução Detalhada do Gabarito</label>
                  <textarea
                    rows={3}
                    value={scenJustificativa}
                    onChange={(e) => setScenJustificativa(e.target.value)}
                    placeholder="Escreva a resposta justificada com os deslindes da regra de CLT que será exposta ao acadêmico assim que ele enviar sua respectiva alternativa..."
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-gray-220 focus:outline-none text-xs leading-relaxed"
                  />
                </div>

              </div>
            </div>

            {/* BARRA DE EXPEDIÇÃO & DESTINATÁRIOS (Col-span 1) */}
            <div className="space-y-6">
              
              {/* CARTÃO DE EXPEDIÇÃO PARAMETRADA */}
              <div className="bg-slate-900/60 border border-white/5 rounded-2xl p-5 space-y-5 text-xs">
                <span className="text-[10px] font-mono font-bold text-[#00E5FF] uppercase tracking-widest block border-b border-white/5 pb-2">
                  🚀 DISPARAR IMEDIATAMENTE PARA FILA
                </span>

                <div className="space-y-4 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-gray-400 font-bold block text-xs">Definir Estudante Alvo (Destinatário)</label>
                    <select
                      value={scenTargetStudentId}
                      onChange={(e) => setScenTargetStudentId(e.target.value)}
                      className="w-full bg-slate-950 border border-amber-500/30 text-amber-400 font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:border-amber-400 cursor-pointer text-xs"
                    >
                      <option value="ALL">📢 TODOS OS ALUNOS (Simultâneo)</option>
                      {students.map((student) => (
                        <option key={student.id} value={student.id}>
                          🧑‍🎓 {student.nomeCompleto} (Fase {student.faseAtual})
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-gray-400 italic leading-snug mt-1.5 block">
                      Ao mandar direcionado, o simulador aciona de imediato a tela de desafios e o feed de e-Social do aluno selecionado, permitindo o engajamento rápido!
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleDispatchScenarioToStudents}
                    className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black py-3 rounded-xl uppercase tracking-wider hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                  >
                    <Send className="w-4 h-4" />
                    Enviar Cenário Direcionado
                  </button>
                </div>
              </div>

              {/* ARQUIVAMENTO EXTERNO E EXPORTADOR */}
              <div className="bg-slate-900 border border-white/5 rounded-2xl p-5 space-y-4 text-xs font-sans">
                <span className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest block border-b border-white/5 pb-2">
                  💾 EXPORTAÇÃO E IMPORTAÇÃO OFICIAL (.JSON)
                </span>

                <div className="space-y-3">
                  <p className="text-[10.5px] text-text-secondary leading-relaxed">
                    Você pode exportar esta configuração como um arquivo de cenário para usá-lo em outros simuladores ou importá-lo no futuro!
                  </p>

                  <button
                    type="button"
                    onClick={handleExportScenarioJSON}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white py-2.5 rounded-xl uppercase font-black transition-colors flex items-center justify-center gap-2 cursor-pointer border border-white/5 text-xs"
                  >
                    <Download className="w-4 h-4" />
                    Exportar Cenário (.json)
                  </button>

                  <div className="border-t border-white/5 pt-3 mt-2">
                    <label className="text-gray-400 font-bold block mb-1.5">Importar cenário salvo (.json)</label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportScenarioJSON}
                      className="hidden"
                      id="scenario-file-import"
                    />
                    <label
                      htmlFor="scenario-file-import"
                      className="w-full bg-slate-950 border border-white/10 hover:border-amber-500/50 py-2 rounded-xl uppercase font-bold text-center flex items-center justify-center gap-2 cursor-pointer text-gray-400 transition-colors"
                    >
                      <span>📂</span> Escolher Arquivo do Computador
                    </label>
                  </div>
                </div>
              </div>

              {/* LISTA VIVA DE CENÁRIOS AUTORAIS ATIVOS */}
              <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-5 space-y-4 text-xs">
                <h4 className="text-[10px] font-mono font-bold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">
                  📋 HISTÓRICO DE CENÁRIOS AUTORAIS ENVIADOS
                </h4>
                
                <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
                  {customChallenges.length === 0 ? (
                    <div className="p-4 bg-slate-955/20 border border-white/5 text-center text-gray-500 italic text-[10px] rounded-xl flex flex-col items-center justify-center">
                      <span>Nenhum cenário autoral ativo no momento.</span>
                      <span className="text-[8.5px] mt-1 text-gray-600">Seus cenários novos disparados aparecerão listados aqui.</span>
                    </div>
                  ) : (
                    customChallenges.map((ch) => (
                      <div key={ch.id} className="p-2.5 bg-slate-950 border border-white/5 rounded-xl font-mono text-[9px] text-gray-400 space-y-1.5 hover:border-amber-500/20 transition-all">
                        <div className="flex items-center justify-between">
                          <strong className="text-gray-300 font-sans font-bold text-[10px] truncate max-w-[120px] block">{ch.titulo}</strong>
                          <span className="bg-amber-500/10 text-amber-500 font-sans font-black px-1.5 py-0.2 rounded scale-90">FASE {ch.fase}</span>
                        </div>
                        <div className="flex items-center justify-between text-gray-500 text-[8.5px]">
                          <span>ID: {ch.id}</span>
                          <span className="truncate max-w-[100px]">Foco: {ch.focoTecnico}</span>
                        </div>
                        <div className="flex justify-between border-t border-white/5 pt-1 mt-1 text-[8.5px]">
                          <span>Ref: <strong className="text-amber-400">+{ch.xpRecompensa} XP</strong></span>
                          <span className="text-emerald-400 font-sans font-bold">ATIVADO IMEDIATO ✓</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* --- LEVEL 3: VETERAN FEEDBACK REPORTS SIM SMTP INBOX --- */}
      {activeTabPanel === "feedbacks" && (
        <div className="space-y-6 animate-fade-in text-left font-mono">
          <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-slate-900/40 relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-emerald-500/10 px-3 py-1 text-[10px] rounded-bl text-emerald-400 uppercase font-bold tracking-widest">
              SMTP INBOX LIVE
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <span>📧</span>
                </div>
                <div>
                  <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-wide">
                    Caixa de Entrada de Homologação (Veteranos e Testadores)
                  </h3>
                  <p className="text-[11px] text-text-secondary leading-snug font-sans">
                    Aqui você monitora todos os logs encaminhados para <strong className="text-gray-300 font-mono">fabiosantanalima01@gmail.com</strong> em tempo real.
                  </p>
                </div>
              </div>

              {onSetVeteranFeedbacks && veteranFeedbacks && veteranFeedbacks.length > 0 && (
                <div className="flex items-center gap-2 self-start sm:self-center">
                  {veteranFeedbacks.some((fb: any) => fb.status !== "Resolvido") ? (
                    <button
                      type="button"
                      onClick={() => {
                        onSetVeteranFeedbacks((prev: any[]) =>
                          prev.map((item) => ({ ...item, status: "Resolvido" }))
                        );
                      }}
                      className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-sans font-black uppercase text-[10px] rounded-lg cursor-pointer transition-all flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <CheckCheck className="w-3.5 h-3.5" />
                      Resolver Tudo em Lote ({veteranFeedbacks.filter((fb: any) => fb.status !== "Resolvido").length})
                    </button>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3.5 py-2 bg-white/5 text-gray-400 font-sans text-[10px] uppercase font-bold rounded-lg border border-white/5 select-none">
                      <MailOpen className="w-3.5 h-3.5 text-emerald-450" />
                      Tudo Resolvido
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-950/20 p-3.5 rounded-xl border border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-text-secondary font-mono font-bold uppercase tracking-wider">Filtrar por Status:</span>
                <div className="flex gap-1.5">
                  {(["Todos", "Não Lido", "Lido", "Resolvido"] as const).map((statusVal) => (
                    <button
                      key={statusVal}
                      type="button"
                      onClick={() => setProfFeedbackFilter(statusVal)}
                      className={`px-2.5 py-1 text-[10px] font-bold rounded-lg cursor-pointer transition-all ${
                        profFeedbackFilter === statusVal
                          ? statusVal === "Resolvido"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : statusVal === "Lido"
                            ? "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                            : statusVal === "Não Lido"
                            ? "bg-amber-500/20 text-amber-500 border border-amber-500/30"
                            : "bg-white/10 text-white border border-white/15"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 border border-transparent"
                      }`}
                    >
                      {statusVal}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[10px] text-gray-500 font-mono">
                Exibindo: {(() => {
                  const filtered = (veteranFeedbacks || []).filter((fb: any) => {
                    const currentStatus = fb.status || "Não Lido";
                    return profFeedbackFilter === "Todos" || currentStatus === profFeedbackFilter;
                  });
                  return `${filtered.length} de ${veteranFeedbacks.length} mensagens`;
                })()}
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {!veteranFeedbacks || veteranFeedbacks.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-white/5 rounded-xl text-xs text-text-secondary">
                  <span>🍃 Nenhuma mensagem ou bug report recebido ainda nesta sessão.</span>
                </div>
              ) : (
                (() => {
                  const filtered = veteranFeedbacks.filter((fb: any) => {
                    const currentStatus = fb.status || "Não Lido";
                    if (profFeedbackFilter === "Todos") return true;
                    return currentStatus === profFeedbackFilter;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-8 text-center border border-dashed border-white/5 rounded-xl text-xs text-text-secondary">
                        <span>🍃 Nenhuma mensagem corresponde ao filtro "{profFeedbackFilter}".</span>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3.5 animate-fade-in">
                      {filtered.map((fb: any, idx: number) => {
                        const currentStatus = fb.status || "Não Lido";
                        return (
                          <div 
                            key={fb.id || idx} 
                            className={`p-4 rounded-xl border transition-all text-xs ${
                              currentStatus === "Resolvido"
                                ? "bg-slate-950/25 border-white/5 text-gray-400"
                                : currentStatus === "Lido"
                                ? "bg-slate-950/45 border-sky-500/10 text-gray-200"
                                : "bg-slate-950/60 border-amber-500/15 text-gray-100"
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/5 pb-2 mb-2.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-450 border border-emerald-500/15">
                                  {fb.category}
                                </span>
                                {currentStatus === "Resolvido" && (
                                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                                    Resolvido ✅
                                  </span>
                                )}
                                {currentStatus === "Lido" && (
                                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-sky-500/15 text-sky-400 border border-sky-500/20">
                                    Lido 📖
                                  </span>
                                )}
                                {currentStatus === "Não Lido" && (
                                  <span className="text-[10px] font-sans font-bold px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/20">
                                    Não Lido ✉️
                                  </span>
                                )}
                                <span className="text-gray-400">Por:</span>
                                <span className="text-gray-200 font-sans font-bold">
                                  {fb.veteranName} ({fb.veteranUser})
                                </span>
                              </div>
                              <span className="text-[10px] text-gray-550 font-mono">
                                {fb.timestamp}
                              </span>
                            </div>

                            <div className="text-[11.5px] font-sans leading-relaxed text-gray-300 italic bg-black/25 p-3 rounded-lg border border-white/5 mb-2 whitespace-pre-wrap">
                              "{fb.text}"
                            </div>

                            <div className="flex items-center justify-between border-t border-white/5 pt-2 mt-2 text-[10px] font-mono text-gray-500 flex-wrap gap-2">
                              <div>
                                <span>Destino: </span>
                                <span className="text-sky-400 font-semibold">{fb.emailTo}</span>
                                <span className="mx-2">•</span>
                                <span>Simulador SMTP: </span>
                                <span className="text-emerald-450 font-bold">Enviado Corretamente ✓</span>
                              </div>
                              <div className="flex gap-1.5 flex-wrap">
                                {onSetVeteranFeedbacks && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetVeteranFeedbacks((prev: any[]) =>
                                          prev.map((item) => 
                                            item.id === fb.id
                                              ? { ...item, status: "Não Lido" }
                                              : item
                                          )
                                        );
                                      }}
                                      className={`px-2 py-1 rounded font-sans font-bold uppercase text-[9.5px] cursor-pointer transition-all ${
                                        currentStatus === "Não Lido"
                                          ? "bg-amber-500 text-slate-950 font-bold"
                                          : "bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20"
                                      }`}
                                    >
                                      Não Lido
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetVeteranFeedbacks((prev: any[]) =>
                                          prev.map((item) => 
                                            item.id === fb.id
                                              ? { ...item, status: "Lido" }
                                              : item
                                          )
                                        );
                                      }}
                                      className={`px-2 py-1 rounded font-sans font-bold uppercase text-[9.5px] cursor-pointer transition-all ${
                                        currentStatus === "Lido"
                                          ? "bg-sky-500 text-slate-950 font-bold"
                                          : "bg-sky-500/10 hover:bg-sky-500/25 text-sky-400 border border-sky-400/20"
                                      }`}
                                    >
                                      Lido
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        onSetVeteranFeedbacks((prev: any[]) =>
                                          prev.map((item) => 
                                            item.id === fb.id
                                              ? { ...item, status: "Resolvido" }
                                              : item
                                          )
                                        );
                                      }}
                                      className={`px-2 py-1 rounded font-sans font-bold uppercase text-[9.5px] cursor-pointer transition-all ${
                                        currentStatus === "Resolvido"
                                          ? "bg-emerald-500 text-slate-950 font-black"
                                          : "bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-450 border border-emerald-500/20"
                                      }`}
                                    >
                                      Resolvido
                                    </button>
                                  </>
                                )}
                                {onSetVeteranFeedbacks && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onSetVeteranFeedbacks((prev: any[]) =>
                                        prev.filter((item) => item.id !== fb.id)
                                      );
                                    }}
                                    className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500 text-rose-450 hover:text-white rounded font-sans font-semibold uppercase text-[9.5px] cursor-pointer transition-all border border-rose-500/15"
                                  >
                                    Apagar
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })())}
            </div>
          </div>
        </div>
      )}

      {/* CANAL DE TELEMETRIA INDIVIDUAL & REFORÇO INTELIGENTE DIRETO */}
      {selectedTelemetryStudentId && (() => {
        const student = students.find((s) => s.id === selectedTelemetryStudentId);
        if (!student) return null;

        const compNow = Date.now() + clockOffset;
        const isOnline = student.lastSeen && Math.abs(compNow - student.lastSeen) < 210000;

        // Calculate TMA: Total Active Seconds divided by number of answered questions
        const solvedCount = Object.keys(student.respostasDesafios || {}).length;
        const totalSecs = student.tempoAtivoSegundos || 0;
        const avgSecondsPerChallenge = solvedCount > 0 ? Math.round(totalSecs / solvedCount) : 0;
        
        const tmaMinutes = Math.floor(avgSecondsPerChallenge / 60);
        const tmaSeconds = avgSecondsPerChallenge % 60;
        const formattedTMA = `${tmaMinutes.toString().padStart(2, "0")}m ${tmaSeconds.toString().padStart(2, "0")}s`;

        // Calculate topic proficiencies
        const categories = [
          { 
            id: "clt",
            name: "Legislação CLT & Admissão Portal", 
            fases: [0, 1], 
            icon: "📜",
            reforçoPreset: {
              titulo: `Reforço CLT: Primazia da Realidade - Caso ${student.nomeCompleto.split(' ')[0]}`,
              tipo: "Justa Causa",
              focoTecnico: "Vínculo de Emprego sob Artigo 9º da CLT",
              queixa: `Marcelo, contratado formalmente como consultor autônomo PJ para auxiliar o setor administrativo chefiado por ${student.nomeCompleto}, cumpre horário rígido, usa crachá e reporta diariamente à diretoria. Após o encerramento do contrato, Marcelo exige as verbas rescisórias da CLT retroativas de um ano. Como preceptor de DP, indique o deslinde legal aplicável.`,
              gabarito: {
                tipoAcao: "Apenas Explicar",
                valoresCorretos: {
                  justificativa: "Conforme o Artigo 9º da CLT, os atos praticados com o objetivo de desvirtuar, impedir ou fraudar a aplicação dos preceitos contidos na consolidação trabalhista são nulos de pelo direito. Prepondera no Direito do Trabalho o Princípio da Primazia da Realidade sobre a forma do pacto civil.",
                },
                artigoLegal: "Artigo 9º da CLT",
                respostaEsperadaId: "A"
              },
              opcoes: [
                { id: "A", texto: "Reconhecer retroativamente a relação de emprego e registrar a CTPS devido à primazia da realidade das condições fáticas de subordinação." },
                { id: "B", texto: "Negar o pleito baseando-se estritamente na assinatura de contrato civil livre mútuo, que elide qualquer manifestação consolidadora." },
                { id: "C", texto: "Propor acordo extrajudicial de isenção integral pagando comissão de 1% do passivo no sindicato regional local." },
                { id: "D", texto: "Negar o pleito encaminhando-o para arbitragem privada, já que os cargos administrativos operam sob governança corporativa isolada." }
              ]
            }
          },
          { 
            id: "jornada",
            name: "Gestão de Frequência & Jornada", 
            fases: [2, 3], 
            icon: "⏱️",
            reforçoPreset: {
              titulo: `Reforço Jornada: Abono por Consulta Médica - Caso ${student.nomeCompleto.split(' ')[0]}`,
              tipo: "Erro",
              focoTecnico: "Abono Legal Art. 473 CLT",
              queixa: `Um colaborador apresentou ao departamento pessoal um atestado médico de acompanhamento de seu filho de 5 anos em consulta de urgência pediátrica. O analista sênior recusou o documento, descontando o dia do funcionário sob alegação de que a CLT só abona faltas de saúde do próprio funcionário. Rogério quer saber a conduta legal com base na CLT.`,
              gabarito: {
                tipoAcao: "Abonar Falta",
                valoresCorretos: {
                  justificativa: "O Artigo 473, inciso XI da CLT assegura que o trabalhador poderá deixar de comparecer ao serviço por até 1 (um) dia por ano para acompanhar filho de até 6 (seis) anos em consulta médica, devendo a falta ser abonada e paga integralmente.",
                },
                artigoLegal: "Artigo 473, inciso XI da CLT",
                respostaEsperadaId: "A"
              },
              opcoes: [
                { id: "A", texto: "Abonar integralmente a falta de Rogério, haja vista a garantia expressa para acompanhamento de filhos de até 6 anos." },
                { id: "B", texto: "Manter o desconto de falta regulamentar convertendo-o porém em folga compensatória do banco sem reflexos no DSR do mês." },
                { id: "C", texto: "Rejeitar o atestado exigindo porém que o preceptor regional autorize o auxílio-creche sob pena de fiscalização sindical." },
                { id: "D", texto: "Efetuar o desconto do dia do funcionário abonando apenas a metade do respectivo repouso semanal remunerado." }
              ]
            }
          },
          { 
            id: "folha",
            name: "Cálculos de Encargos, FGTS & VT", 
            fases: [3], 
            icon: "💸",
            reforçoPreset: {
              titulo: `Reforço Encargos: Retificação de Desconto de VT - Caso ${student.nomeCompleto.split(' ')[0]}`,
              tipo: "Cálculo",
              focoTecnico: "Lei do Vale-Transporte 7.418/1985",
              queixa: `A funcionária Estela recebe salário-base de R$ 3.000,00 e gasta exatamente R$ 120,00 por mês em bilhete municipal de ônibus. No contracheque de maio, o DP descontou R$ 180,00 sob a rubrica comum de Vale-Transporte. A funcionária contesta o valor. Qual retificação o analista de DP sob sua mentoria deve proceder?`,
              gabarito: {
                tipoAcao: "Retificar Folha",
                valoresCorretos: {
                  justificativa: "Conforme o artigo 4º, parágrafo único da Lei 7.418/85, o desconto de vale-transporte é limitado ao teto de 6% do salário-base ou ao valor real das passagens consumidas, o que for menor. No caso, 6% de 3.000 é 180, mas o custo real foi 120, logo deve-se descontar apenas 120.",
                },
                artigoLegal: "Art. 4º, Parágrafo Único da Lei 7.418/1985",
                respostaEsperadaId: "B"
              },
              opcoes: [
                { id: "A", texto: "Manter o desconto de R$ 180,00 (6%), porque a alíquota de 6% prevista na lei trabalhista federal é imperativa." },
                { id: "B", texto: "Retificar o desconto para o valor de R$ 120,00, pois o desconto é limitado ao custo real dos vales fornecidos se este for inferior a 6%." },
                { id: "C", texto: "Excluir totalmente o desconto de vale-transporte devolvendo as quantias e convertendo em auxílio-combustível retroativo indene." },
                { id: "D", texto: "Converter a diferença de R$ 60,00 in saldo de banco de horas creditado na próxima semana fiscal laborada." }
              ]
            }
          },
          { 
            id: "ferias",
            name: "Férias, Licenças & Afastamentos", 
            fases: [4], 
            icon: "🏖️",
            reforçoPreset: {
              titulo: `Reforço Férias: Abono Pecuniário - Caso ${student.nomeCompleto.split(' ')[0]}`,
              tipo: "Cálculo",
              focoTecnico: "Artigo 143 da CLT",
              queixa: `Um colaborador solicitou a conversão de 1/3 das suas férias em abono pecuniário (venda de 10 dias). O gestor negou alegando que a empresa não aceita vender férias este ano por corte de custos. O que diz a legislação?`,
              gabarito: {
                tipoAcao: "Apenas Explicar",
                valoresCorretos: {
                  justificativa: "O Artigo 143 da CLT estabelece que é FACULDADE do empregado converter 1/3 do período de férias a que tiver direito em abono pecuniário, desde que requerido no prazo de até 15 dias antes do término do período aquisitivo. A empresa não pode negar se o prazo for cumprido.",
                },
                artigoLegal: "Artigo 143 da CLT",
                respostaEsperadaId: "A"
              },
              opcoes: [
                { id: "A", texto: "A empresa é obrigada a aceitar a conversão, pois trata-se de um direito potestativo do empregado previsto no Art. 143." },
                { id: "B", texto: "A empresa pode negar baseando-se no poder diretivo e na saúde financeira do negócio conforme reforma de 2017." },
                { id: "C", texto: "O abono pecuniário só é permitido para cargos de confiança e média gerência com anuência sindical prévia." },
                { id: "D", texto: "Venda de férias é ilegal no Brasil desde a ratificação da Convenção 132 da OIT sobre repouso anual." }
              ]
            }
          },
          { 
            id: "especiais",
            name: "Contratos Especiais & Estabilidade", 
            fases: [4, 6], 
            icon: "📋",
            reforçoPreset: {
              titulo: `Reforço Contratos: Estabilidade Gestante em Temporário - Caso ${student.nomeCompleto.split(' ')[0]}`,
              tipo: "Misto",
              focoTecnico: "Tema 495 de Repercussão Geral do STF",
              queixa: `Maria foi contratada via agência de trabalho temporário (Lei 6.019/74) por 90 dias. No 60º dia, descobriu gravidez. A empresa quer encerrar o contrato no prazo final. Maria alega estabilidade. O que decide o DP?`,
              gabarito: {
                tipoAcao: "Apenas Explicar",
                valoresCorretos: {
                  justificativa: "O STF fixou tese (Tema 495) de que NÃO existe direito à estabilidade provisória da gestante em contratos por tempo determinado (como o temporário da Lei 6.019), prevalecendo o termo final ajustado.",
                },
                artigoLegal: "Tema 495 STF / Lei 6.019/74",
                respostaEsperadaId: "B"
              },
              opcoes: [
                { id: "A", texto: "Reconhecer a estabilidade e manter o contrato até 5 meses após o parto, conforme Súmula 244 do TST." },
                { id: "B", texto: "Encerrar o contrato no prazo determinado, pois o STF decidiu pela inexistência de estabilidade em contratos temporários." },
                { id: "C", texto: "Converter o contrato em prazo indeterminado imediatamente para evitar multas do Ministério do Trabalho." },
                { id: "D", texto: "Suspender o contrato até o retorno da licença-maternidade, sem ônus salariais para a empresa tomadora." }
              ]
            }
          },
          { 
            id: "TRCT",
            name: "Desligamento & Auditoria TRCT", 
            fases: [5], 
            icon: "⚖️",
            reforçoPreset: {
              titulo: `Reforço TRCT: Prazo de Quitação Rescisória - Caso ${student.nomeCompleto.split(' ')[0]}`,
              tipo: "Cálculo",
              focoTecnico: "Artigo 477, § 6º da CLT",
              queixa: `A Global Logística dispensou Carlos sem justa causa com aviso prévio indenizado em uma sexta-feira. O analista de DP agendou a homologação do TRCT e o crédito do pagamento rescisório para 15 dias corridos após o término contratual. O sindicato recusa a assinatura alegando descumprimento do prazo regular. Qual o parecer legal do preceptor?`,
              gabarito: {
                tipoAcao: "Aviso Prévio Indenizado",
                valoresCorretos: {
                  justificativa: "De acordo com o Art. 477, § 6º da CLT, o pagamento dos valores constantes do instrumento de rescisão ou do recibo de quitação deverá ser efetuado até 10 (dez) dias contados a partir do término do contrato, independentemente da modalidade de aviso prévio aplicada.",
                },
                artigoLegal: "Art. 477, § 6º da CLT",
                respostaEsperadaId: "D"
              },
              opcoes: [
                { id: "A", texto: "O prazo com aviso prévio indenizado é de até 30 dias pela convenção sindical, suspendendo-se a multa regular do Art. 477." },
                { id: "B", texto: "O DP cumpre as normas agendando em até 15 dias, cabendo multa patronal apenas em caso de faltas intencionais." },
                { id: "C", texto: "O pagamento deve ocorrer nas primeiras 24 horas úteis, sob risco de aplicação de juros retroativos automáticos diários de 1%." },
                { id: "D", texto: "A empresa deve creditar os saldos rescisórios em até 10 dias corridos a contar da rescisão, sob risco de multa de 1 salário básico do obreiro." }
              ]
            }
          },
          { 
            id: "compliance",
            name: "Compliance, Pareceres & eSocial", 
            fases: [6, 7], 
            icon: "🛡️",
            reforçoPreset: {
              titulo: `Reforço Compliance: Desvio de Função - Caso ${student.nomeCompleto.split(' ')[0]}`,
              tipo: "Misto",
              focoTecnico: "Artigo 468 da CLT",
              queixa: `Um auxiliar de escritório está exercendo funções de analista pleno há 6 meses sem alteração salarial ou de CBO. Ele exige equiparação. Qual a conduta preventiva de compliance?`,
              gabarito: {
                tipoAcao: "Apenas Explicar",
                valoresCorretos: {
                  justificativa: "O desvio de função caracteriza alteração contratual lesiva (Art. 468 CLT). A empresa deve regularizar o CBO e pagar as diferenças salariais retroativas para evitar passivo trabalhista e multas administrativas.",
                },
                artigoLegal: "Artigo 468 da CLT",
                respostaEsperadaId: "C"
              },
              opcoes: [
                { id: "A", texto: "Manter a função alegando jus variandi do empregador para treinamento em novas competências sem ônus." },
                { id: "B", texto: "Demitir o funcionário imediatamente por perda de confiança e alegar reestruturação organizacional de cargos." },
                { id: "C", texto: "Regularizar o cargo no eSocial com o CBO correto e pagar o retroativo da diferença salarial desde o início do desvio." },
                { id: "D", texto: "Aguardar o prazo de 2 anos para que a prescrição bienal atue sobre as parcelas acumuladas do desvio." }
              ]
            }
          }
        ];

        // Map dynamic topic performance
        const topicCalculations = categories.map((cat) => {
          const catChs = CHALLENGES_DATA.filter(c => cat.fases.includes(c.fase));
          const attempted = catChs.filter(c => student.respostasDesafios[c.id] !== undefined);
          const correct = catChs.filter(c => student.respostasDesafios[c.id] === true);
          
          let pct = 0;
          if (catChs.length > 0) {
            if (attempted.length > 0) {
              pct = Math.round((correct.length / attempted.length) * 100);
            } else {
              // Se nada foi resolvido, o aproveitamento é 0% (solicitação do usuário)
              pct = 0;
            }
          } else {
            pct = 0;
          }

          return {
            ...cat,
            pct,
            attempted: attempted.length,
            correct: correct.length
          };
        });

        // Lowest scoring component
        const sortedTopics = [...topicCalculations].sort((a, b) => a.pct - b.pct);
        const weakestTopic = sortedTopics[0];

        // Active Remedial Challenge
        const remedialChallenge = weakestTopic.reforçoPreset;

        const handleDispatchRemedial = () => {
          if (!onSendCustomScenario) return;
          
          const scenarioChallenge: Challenge = {
            id: `REFORCO-${student.id}-${Date.now().toString().slice(-4)}`,
            fase: student.faseAtual, // Direct it immediately to their active career phase, ensuring they can access it on their screen of active phase!
            titulo: remedialChallenge.titulo,
            tipo: remedialChallenge.tipo as any,
            focoTecnico: remedialChallenge.focoTecnico,
            tempoLimiteMinutos: 15,
            xpRecompensa: 250, // Premium bonus for remedial action
            empregado: {
              nome: "Caso Clínico Remissivo",
              cbo: "4110-10",
              salarioBase: 2850.00,
              dataAdmissao: "02/01/2024",
              dataFato: "06/06/2026",
              jornada: "220h"
            },
            queixa: remedialChallenge.queixa,
            gabarito: remedialChallenge.gabarito as any,
            opcoes: remedialChallenge.opcoes
          };

          onSendCustomScenario(scenarioChallenge, student.id);
          
          setTelemetryActionStatus({
            studentId: student.id,
            type: "success",
            msg: `✓ Atividade de reforço "${remedialChallenge.titulo}" enviada com sucesso para o terminal do aluno ${student.nomeCompleto}! Desafio ativo na fase correspondente.`
          });

          // Self destruct status message after 4.5 seconds
          setTimeout(() => {
            setTelemetryActionStatus(null);
          }, 4500);
        };

        return (
          <div className="fixed inset-0 z-[12000] bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in font-sans">
            <div className="bg-slate-900 border border-cyan-500/20 max-w-3xl w-full rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(6,182,212,0.15)] max-h-[92vh] flex flex-col">
              
              {/* Header block */}
              <div className="bg-slate-950 border-b border-white/5 p-5 flex items-center justify-between">
                <div className="flex items-center gap-3 text-left">
                  <div className="p-2.5 bg-[#00E5FF]/10 text-[#00E5FF] rounded-xl border border-[#00E5FF]/20 animate-pulse">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-mono uppercase tracking-wider text-white font-black">
                      Telemetria de Rendimento & TMA
                    </h4>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      Ficha Analítica Acadêmica de <strong className="text-cyan-400">{student.nomeCompleto}</strong> (Fase {student.faseAtual})
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedTelemetryStudentId(null);
                    setTelemetryActionStatus(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 hover:text-white text-gray-400 w-8 h-8 flex items-center justify-center rounded-lg border border-white/5 transition-colors cursor-pointer text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Message Banner for Remedial Actions */}
              {telemetryActionStatus && telemetryActionStatus.studentId === student.id && (
                <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-3 text-xs font-mono font-bold text-emerald-400 text-center animate-fade-in">
                  {telemetryActionStatus.msg}
                </div>
              )}

              {/* Scrollable Content Bay */}
              <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs text-left">
                
                {/* Micro metrics grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Metric 1: TMA Gauge */}
                  <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/5 rounded-full blur-xl animate-pulse" />
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">⏱️ TMA REGISTRADO</span>
                      <div className="text-2xl font-mono font-bold text-[#00E5FF] tracking-tight">
                        {formattedTMA}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Tempo Médio de Atendimento síncrono por desafio.
                      </p>
                    </div>
                    <div className="mt-3 text-[9px] bg-emerald-500/10 text-emerald-400 py-1 px-2 rounded-lg border border-emerald-500/20 inline-block text-center font-mono font-black uppercase">
                      Eficiência TMA: Estabilizada ✓
                    </div>
                  </div>

                  {/* Metric 2: Precision Level */}
                  <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/5 rounded-full blur-xl" />
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">🎯 TAXA DE ACERTO</span>
                      <div className="text-2xl font-mono font-bold text-cyan-400 tracking-tight">
                        {typeof student.precisao === 'number' ? `${student.precisao}%` : "—"}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Aproveitamento global nas primeiras submissões.
                      </p>
                    </div>
                    {/* Visual meter */}
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden mt-3 border border-white/5">
                      <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full transition-all duration-500" style={{ width: `${student.precisao || 0}%` }} />
                    </div>
                  </div>

                  {/* Metric 3: Active Status Block */}
                  <div className="bg-slate-950/80 border border-white/5 rounded-xl p-4 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-xl" />
                    <div>
                      <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest block border-b border-white/5 pb-1 mb-2">📊 CONTROLE OPERACIONAL</span>
                      <div className="text-sm font-mono font-bold text-amber-500 tracking-tight uppercase truncate">
                        {!isOnline ? "● Ausente / Offline" : student.focoStatus === "Fora da Tela" ? "🚫 Desfocado Temporário" : "● Operando Ativo"}
                      </div>
                      <p className="text-[10px] text-gray-400 mt-1">
                        Desvios de foco: <strong className="text-white">{student.saidasTela || 0} alertas</strong>
                      </p>
                    </div>
                    <div className="mt-3 text-[10px] bg-slate-900 text-gray-300 py-1 px-2 rounded-lg border border-white/5 inline-block text-center font-mono font-bold">
                      XP Real: {student.xp} XP
                    </div>
                  </div>

                </div>

                {/* PARALLEL EXAM GRADE (FASE -1 or 0) SPECIAL BANNER */}
                {(() => {
                  const isFaseM1 = student.faseAtual === -1;
                  const isFase0 = student.faseAtual === 0;
                  
                  if (!isFaseM1 && !isFase0) return null;

                  const phaseId = student.faseAtual;
                  const phaseChallengesList = CHALLENGES_DATA.filter(c => c.fase === phaseId);
                  const pCompletedCount = phaseChallengesList.filter(c => student.respostasDesafios?.[c.id] === true).length;
                  const totalCount = phaseChallengesList.length || 1;
                  const pGrade = ((pCompletedCount / totalCount) * 10).toFixed(1);
                  const phaseLabel = isFaseM1 ? "Fase -1 (Revisão)" : "Fase 0 (Pré-Cadastro)";

                  return (
                    <div className="bg-gradient-to-r from-cyan-950/30 to-indigo-950/30 border border-[#00E5FF]/20 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-fade-in shadow-md">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl filter drop-shadow">📝</span>
                        <div>
                          <h5 className="font-sans font-extrabold text-sm text-gray-100 flex items-center gap-2">
                            <span>Nota de Prova Oficial — {phaseLabel}</span>
                          </h5>
                          <span className="text-[10px] text-gray-400 block mt-0.5">
                            Acertos do aluno no simulador CLT: <strong>{pCompletedCount} de {totalCount}</strong> módulos teóricos concluídos.
                          </span>
                        </div>
                      </div>
                      <div className="flex items-baseline gap-1 bg-[#00E5FF]/5 border border-[#00E5FF]/25 px-4 py-2 rounded-xl group hover:border-[#00E5FF]/40 transition-all select-none shrink-0 text-center">
                        <span className="text-[10px] text-cyan-400/85 font-mono font-bold uppercase tracking-wider">Nota:</span>
                        <span className="text-xl font-mono font-black text-[#00E5FF] tracking-tight">{pGrade}</span>
                        <span className="text-[10px] text-cyan-400 font-mono">/ 10</span>
                      </div>
                    </div>
                  );
                })()}

                {/* Índices por tópicos com identificação de fraqueza */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono font-bold text-cyan-400 uppercase tracking-wider block border-b border-white/5 pb-1">
                    📉 MAPEAMENTO DE PROFICIÊNCIA POR TÓPICO CURRICULAR
                  </span>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topicCalculations.map((topic) => {
                      const isWeakest = topic.id === weakestTopic.id;
                      
                      return (
                        <div 
                          key={topic.id} 
                          className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-3 bg-slate-950/70 transition-all ${
                            isWeakest 
                              ? "border-rose-500/30 bg-rose-950/5 relative shadow-[0_0_15px_rgba(244,63,94,0.05)]" 
                              : "border-white/5"
                          }`}
                        >
                          {isWeakest && (
                            <span className="absolute top-2 right-2 bg-rose-500/10 px-2 py-0.5 rounded text-[8px] font-mono text-rose-400 border border-rose-500/20 uppercase font-black tracking-widest animate-pulse">
                              Ponto Fraco Identificado ⚠️
                            </span>
                          )}

                          <div className="space-y-1">
                            <span className="text-[13px] inline-flex items-center gap-1.5">
                              <span>{topic.icon}</span>
                              <strong className="text-gray-200 font-sans font-bold block">{topic.name}</strong>
                            </span>
                            <span className="text-[9.5px] font-mono text-gray-400">
                              Questões na fita: {topic.correct} acertos de {topic.attempted} resolvidas
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            <div className="flex justify-between items-center text-[10px] font-mono text-gray-400">
                              <span>Aproveitamento Conceitual:</span>
                              <strong className={`font-bold ${topic.pct >= 80 ? 'text-emerald-400' : topic.pct >= 60 ? 'text-amber-400' : 'text-rose-400'}`}>
                                {topic.pct}%
                              </strong>
                            </div>
                            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5 p-0.5">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${
                                  topic.pct >= 80 ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : topic.pct >= 60 ? 'bg-amber-500' : 'bg-rose-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]'
                                }`} 
                                style={{ width: `${topic.pct}%` }} 
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Seção Inteligente de Criação e Envio de cenário remedial personalizado na hora */}
                <div className="bg-slate-950/90 border border-rose-500/20 rounded-xl p-5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-rose-500/10 px-3 py-1 text-[9px] rounded-bl text-rose-400 uppercase font-bold tracking-widest font-mono">
                    REFORÇO ADAPTATIVO SINCRONIZADO
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono text-rose-400 block uppercase font-bold tracking-widest">
                        💡 CONSTRUTOR AUTOMÁTICO DE REFORÇO TRABALHISTA
                      </span>
                      <h5 className="text-xs font-bold text-gray-100 font-sans">
                        Atividade Didática Personalizada Recomendada
                      </h5>
                      <p className="text-[10.5px] text-gray-400 leading-relaxed font-sans">
                        Com base na deficiência identificada em <span className="text-rose-400 font-semibold">{weakestTopic.name}</span>, o simulador estruturou eletronicamente e na hora o seguinte caso para acelerar a curva de fixação:
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-white/5 rounded-xl space-y-3 font-mono text-[10px]">
                      <div className="flex justify-between border-b border-white/5 pb-1.5 flex-wrap gap-2 text-left">
                        <span className="text-gray-400">Título: <strong className="text-white font-sans">{remedialChallenge.titulo}</strong></span>
                        <span className="text-amber-400 font-sans font-bold">Fase {student.faseAtual} (Ativo)</span>
                      </div>
                      <div className="space-y-1">
                        <span className="text-gray-500 font-bold block uppercase text-[8.5px]">RECLAMAÇÃO TRABALHISTA APRESENTADA:</span>
                        <p className="text-gray-300 font-sans leading-relaxed text-[10.5px] text-left">
                          {remedialChallenge.queixa}
                        </p>
                      </div>
                      <div className="space-y-1 pt-1.5 border-t border-white/5 text-[9.5px]">
                        <span className="text-emerald-400 font-bold block uppercase text-[8.5px]">ALTERNATIVAS DE SOLUÇÃO (MULTIPLA ESCOLHA):</span>
                        {remedialChallenge.opcoes.map((opt) => (
                          <div key={opt.id} className="flex gap-2 text-gray-400 mt-1 text-left">
                            <strong className="text-emerald-400 font-black">[{opt.id}]</strong>
                            <span className="flex-1 font-sans text-gray-300 leading-snug">{opt.texto}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-white/5 pt-2 flex justify-between items-center text-[9px] text-gray-500">
                        <span>Fundamentação Oficial: <strong className="text-[#00E5FF]">{remedialChallenge.gabarito.artigoLegal}</strong></span>
                        <span className="text-emerald-400 font-bold">Gabarito: Alternativa [{remedialChallenge.gabarito.respostaEsperadaId}]</span>
                      </div>
                    </div>

                    <div className="flex gap-3 pt-1">
                      <button
                        type="button"
                        onClick={handleDispatchRemedial}
                        className="flex-1 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 hover:shadow-[0_0_20px_rgba(244,63,94,0.3)] text-slate-950 font-black py-2.5 rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        <Zap className="w-4 h-4 text-slate-950" />
                        Disparar Reforço Imediato (+250 XP)
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal controls in footer */}
              <div className="bg-slate-950 border-t border-white/5 p-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTelemetryStudentId(null);
                    setTelemetryActionStatus(null);
                  }}
                  className="bg-slate-800 hover:bg-slate-700 text-gray-200 font-bold px-4 py-2 rounded-xl border border-white/5 transition-all text-xs cursor-pointer"
                >
                  Fechar Diagnóstico
                </button>
              </div>

            </div>
          </div>
        );
      })()}



    </div>
  );
}
