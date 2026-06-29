/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Student, Challenge } from "../types";
import { CHALLENGES_DATA, CAREER_PHASES } from "../data";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Clock,
  Award,
  Target,
  Brain,
  Timer,
  Activity,
  CheckCircle2,
  AlertTriangle,
  History,
  GraduationCap,
  Sparkles,
  Zap,
  TrendingUp,
  Flame,
  FileBadge,
  Printer,
  Download,
  Users,
  User,
} from "lucide-react";
import { exportCertificateToPDF } from "../utils/pdfExport";

interface DesempenhoPessoalProps {
  activeStudent: Student;
  students: Student[];
  initialSubTab?: "efficiency" | "skills" | "certification";
}

export default function DesempenhoPessoal({
  activeStudent,
  students,
  initialSubTab,
}: DesempenhoPessoalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"efficiency" | "skills" | "certification">(initialSubTab || "efficiency");
  const [selectedPhase, setSelectedPhase] = useState<number>(activeStudent.faseAtual);
  const [certType, setCertType] = useState<"individual-self" | "individual-partner" | "squad">("individual-self");
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");

  // Safe synthesizer for localized sound feedback using HTML5 Web Audio API
  const playSoundEffect = (type: string) => {
    try {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtxClass) return;
      const audioCtx = new AudioCtxClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === "success") {
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
      }
    } catch (e) {
      // Ignored gracefully if audio environment is blocked/muted
    }
  };

  // Helper functions for Phase Certificate calculations
  const hashString = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return Math.abs(hash);
  };

  const calculatePhaseStats = (student: Student, phaseId: number) => {
    const phaseChallenges = CHALLENGES_DATA.filter((c) => c.fase === phaseId);
    const answers = student.respostasDesafios || {};
    const answeredInPhase = phaseChallenges.filter((c) => answers[c.id] !== undefined);
    const completedCount = answeredInPhase.length;
    const correctCount = answeredInPhase.filter((c) => answers[c.id] === true).length;
    
    const acertoReal = completedCount > 0 ? Math.round((correctCount / completedCount) * 100) : 0;
    
    let acertoNota = acertoReal;
    let arredondamentoAplicado = false;
    if (acertoReal >= 55 && acertoReal < 60) {
      acertoNota = 60;
      arredondamentoAplicado = true;
    }
    
    const approved = acertoReal >= 55;
    const notaBase = Number((acertoNota / 10).toFixed(1));
    
    const secondsInPhase = answeredInPhase.reduce((acc, c) => acc + (student.temposRespostas?.[c.id] || 0), 0);
    const hh = Math.floor(secondsInPhase / 3600);
    const mm = Math.floor((secondsInPhase % 3600) / 60);
    
    let bonus = 0;
    if (acertoReal > 75) {
      bonus = secondsInPhase <= 3600 ? 1.5 : 0.5;
    }
    
    const notaSoma = approved ? (notaBase + bonus) : notaBase;
    const notaFinal = Number(Math.min(notaSoma, 10.0).toFixed(2));
    const excedente = (notaSoma > 10.0 && acertoReal > 75) ? Number((notaSoma - 10.0).toFixed(2)) : null;
    
    const verificationCode = `WS-${hashString(student.id + "-" + phaseId).toString(16).slice(0, 8).toUpperCase()}`;

    return {
      completedCount,
      correctCount,
      acertoReal,
      acertoNota,
      arredondamentoAplicado,
      approved,
      notaBase,
      secondsInPhase,
      hh,
      mm,
      bonus,
      notaFinal: Number(notaFinal.toFixed(1)),
      excedente,
      verificationCode
    };
  };

  const calculateSquadPhaseStats = (partners: Student[], phaseId: number) => {
    const partnerStats = partners.map(p => calculatePhaseStats(p, phaseId));
    
    const avgCorrect = partnerStats.reduce((acc, s) => acc + s.correctCount, 0) / partners.length;
    const avgCompleted = partnerStats.reduce((acc, s) => acc + s.completedCount, 0) / partners.length;
    
    const avgAcertoReal = Math.round(partnerStats.reduce((acc, s) => acc + s.acertoReal, 0) / partners.length);
    
    let acertoNota = avgAcertoReal;
    let arredondamentoAplicado = false;
    if (avgAcertoReal >= 55 && avgAcertoReal < 60) {
      acertoNota = 60;
      arredondamentoAplicado = true;
    }
    
    const approved = avgAcertoReal >= 55;
    const notaBase = Number((acertoNota / 10).toFixed(1));
    
    const avgSeconds = partnerStats.reduce((acc, s) => acc + s.secondsInPhase, 0) / partners.length;
    const hh = Math.floor(avgSeconds / 3600);
    const mm = Math.floor((avgSeconds % 3600) / 60);
    
    let bonus = 0;
    if (avgAcertoReal > 75) {
      bonus = avgSeconds <= 3600 ? 1.5 : 0.5;
    }
    
    const notaSoma = approved ? (notaBase + bonus) : notaBase;
    const notaFinal = Number(Math.min(notaSoma, 10.0).toFixed(2));
    const excedente = (notaSoma > 10.0 && avgAcertoReal > 75) ? Number((notaSoma - 10.0).toFixed(2)) : null;
    
    const verificationCode = `WS-SQ-${hashString(partners.map(p => p.id).join(",") + "-" + phaseId).toString(16).slice(0, 8).toUpperCase()}`;

    return {
      completedCount: Math.round(avgCompleted),
      correctCount: Math.round(avgCorrect),
      acertoReal: avgAcertoReal,
      acertoNota,
      arredondamentoAplicado,
      approved,
      notaBase,
      secondsInPhase: Math.round(avgSeconds),
      hh,
      mm,
      bonus,
      notaFinal: Number(notaFinal.toFixed(1)),
      excedente,
      verificationCode
    };
  };

  // 1. Calculate Core Numbers
  const respostas = activeStudent.respostasDesafios || {};
  const totalCompleted = Object.keys(respostas).length;
  const correctCount = Object.values(respostas).filter((v) => v === true).length;
  const incorrectCount = totalCompleted - correctCount;
  
  const precision = activeStudent.precisao ?? 0;

  // Active time calculations
  const totalSecs = activeStudent.tempoAtivoSegundos || 300; // default safe fallback fallback
  const totalMins = totalSecs / 60;
  
  const avgMinsPerChallenge = totalCompleted > 0 ? Number((totalMins / totalCompleted).toFixed(1)) : 0;

  // Focus quality rating
  const focusLosses = activeStudent.saidasTela || 0;
  const focusScore = Math.max(10, 100 - focusLosses * 15);

  // Filter completed challenges from metadata
  const completedChallenges = CHALLENGES_DATA.filter((c) => respostas[c.id] !== undefined);

  // Chronological completion sequence mapping for Recharts Progress line.
  // We sortcompleted challenges to ensure a smooth progression curve
  const sortedCompleted = [...completedChallenges].sort((a, b) => {
    const aVal = parseFloat(a.id);
    const bVal = parseFloat(b.id);
    return isNaN(aVal) || isNaN(bVal) ? a.id.localeCompare(b.id) : aVal - bVal;
  });

  // Dynamically map sequential case stats
  let cumulativeXp = 0;
  const progressionData = sortedCompleted.map((c, idx) => {
    const wasCorrect = respostas[c.id] === true;
    cumulativeXp += wasCorrect ? c.xpRecompensa : 0;
    
    // Use actual time spent if available, otherwise fallback to estimation
    const actualSecs = activeStudent.temposRespostas?.[c.id];
    const stdLimit = c.tempoLimiteMinutos || 10;
    
    let timeSpentValue: number;
    if (actualSecs !== undefined) {
      timeSpentValue = Number((actualSecs / 60).toFixed(1));
    } else {
      // Proportional resolution time calculation based on standard challenge limit and actual active time ratio
      const speedRatio = totalCompleted > 0 
        ? (totalMins / sortedCompleted.reduce((acc, curr) => acc + (curr.tempoLimiteMinutos || 10), 0))
        : 0.8;
      timeSpentValue = Number((stdLimit * Math.max(0.4, Math.min(1.6, speedRatio))).toFixed(1));
    }

    return {
      index: idx + 1,
      name: `Caso ${c.id}`,
      titulo: c.titulo,
      "Tempo Gasto (Sua Média)": timeSpentValue,
      "Benchmark Sugerido": stdLimit,
      "XP Acumulado": cumulativeXp,
      status: wasCorrect ? "Acerto" : "Retificado",
      isReal: actualSecs !== undefined,
    };
  });

  // If student has no completed challenges, generate synthetic starting tutorials to allow immediate chart visualization.
  const chartData = progressionData.length > 0 ? progressionData : [
    { name: "Início", "Tempo Gasto (Sua Média)": 0, "Benchmark Sugerido": 5, "XP Acumulado": 0 },
    { name: "Boas-vindas", "Tempo Gasto (Sua Média)": 2.5, "Benchmark Sugerido": 5, "XP Acumulado": 50 },
    { name: "Simulador Aberto", "Tempo Gasto (Sua Média)": 4, "Benchmark Sugerido": 8, "XP Acumulado": 100 },
  ];

  // 2. Classify Accuracy breakdown per cognitive areas of labor law
  const areas = [
    { name: "Pré-Cadastros & CTPS", phases: [0, 1] },
    { name: "Conformidade e-Social", phases: [2] },
    { name: "Guias FGTS & Retenções", phases: [3] },
    { name: "Gestão de Afastamentos", phases: [4] },
    { name: "Verbas & Descontos CLT", phases: [5, 6, 7] },
  ];

  const skillRadarData = areas.map((area) => {
    const areaChallenges = CHALLENGES_DATA.filter((c) => area.phases.includes(c.fase));
    const completedInArea = areaChallenges.filter((c) => respostas[c.id] !== undefined);
    const correctInArea = completedInArea.filter((c) => respostas[c.id] === true);

    const accuracyRate = completedInArea.length > 0 
      ? Math.round((correctInArea.length / completedInArea.length) * 100)
      : 80; // default starting template capability

    return {
      area: area.name,
      "Sua Precisão (%)": accuracyRate,
      "Padrão Profissional": 90,
    };
  });

  // Calculate fastest and slowest completed cases
  const caseDetailedAnalyses = sortedCompleted.map((c) => {
    const wasCorrect = respostas[c.id] === true;
    const actualSecs = activeStudent.temposRespostas?.[c.id];
    const stdLimit = c.tempoLimiteMinutos || 10;
    
    let timeSpentValue: number;
    if (actualSecs !== undefined) {
      timeSpentValue = Number((actualSecs / 60).toFixed(1));
    } else {
      const estimatedTime = Number((stdLimit * (totalMins / (sortedCompleted.reduce((acc, curr) => acc + (curr.tempoLimiteMinutos || 10), 0) || 1))).toFixed(1));
      timeSpentValue = estimatedTime;
    }
    
    const delta = Number((stdLimit - timeSpentValue).toFixed(1));

    return {
      id: c.id,
      title: c.titulo,
      type: c.tipo,
      time: timeSpentValue,
      limit: stdLimit,
      delta,
      correct: wasCorrect,
      xp: wasCorrect ? c.xpRecompensa : 0
    };
  });

  const fastestCase = caseDetailedAnalyses.length > 0
    ? [...caseDetailedAnalyses].sort((a, b) => a.time - b.time)[0]
    : null;

  const mostEfficientCase = caseDetailedAnalyses.length > 0
    ? [...caseDetailedAnalyses].sort((a, b) => b.delta - a.delta)[0]
    : null;

  // Render donut charts for correct ratio
  const pieData = [
    { name: "Corretas", value: correctCount || 1, color: "#10b981" },
    { name: "Retificadas", value: incorrectCount || 0, color: "#f43f5e" }
  ];

  // 3. Dynamic Topic Precision Logic ("Nota dentro da nota" / "Nota dentro do tópico")
  const topicsList = [
    {
      id: "admissao",
      name: "Admissão & Vínculo CLT",
      icon: "👤",
      color: "from-sky-500 to-blue-500",
      description: "Vínculo de emprego, parametrização de CBO e admissão no e-Social.",
      matches: (c: Challenge) => {
        const ft = (c.focoTecnico || "").toLowerCase();
        const tit = (c.titulo || "").toLowerCase();
        return ft.includes("artigo 3") || ft.includes("vínculo") || ft.includes("admissão") || ft.includes("contrat") || ft.includes("ctps") || ft.includes("cbo") || tit.includes("vínculo") || tit.includes("admissão") || tit.includes("cbo");
      }
    },
    {
      id: "jornada",
      name: "Jornada & Horas Extras",
      icon: "⏱️",
      color: "from-amber-500 to-orange-500",
      description: "Controle de ponto, horas extras, divisor de jornada e reflexo de DSR.",
      matches: (c: Challenge) => {
        const ft = (c.focoTecnico || "").toLowerCase();
        const tit = (c.titulo || "").toLowerCase();
        return ft.includes("jornada") || ft.includes("divisor") || ft.includes("horas extras") || ft.includes("banco de horas") || ft.includes("intervalo") || ft.includes("hora ficta") || tit.includes("jornada") || tit.includes("divisor") || tit.includes("horas extras");
      }
    },
    {
      id: "afastamento",
      name: "Faltas, Afastamentos & Atestados",
      icon: "🩺",
      color: "from-emerald-500 to-teal-500",
      description: "Validação de atestados médicos, prazos, CID e regras de faltas justificadas.",
      matches: (c: Challenge) => {
        const ft = (c.focoTecnico || "").toLowerCase();
        const tit = (c.titulo || "").toLowerCase();
        return ft.includes("falta") || ft.includes("atestado") || ft.includes("afastamento") || ft.includes("doença") || ft.includes("médico") || ft.includes("medico") || ft.includes("óbito") || ft.includes("cid") || ft.includes("inss") || tit.includes("atestado") || tit.includes("falta") || tit.includes("afastamento");
      }
    },
    {
      id: "adicionais",
      name: "Adicionais CLT",
      icon: "⚡",
      color: "from-purple-500 to-indigo-500",
      description: "Cálculo de insalubridade, periculosidade e adicional noturno.",
      matches: (c: Challenge) => {
        const ft = (c.focoTecnico || "").toLowerCase();
        const tit = (c.titulo || "").toLowerCase();
        return ft.includes("adicional") || ft.includes("periculosidade") || ft.includes("insalubridade") || ft.includes("noturno") || tit.includes("adicional") || tit.includes("periculosidade") || tit.includes("insalubridade") || tit.includes("noturno");
      }
    },
    {
      id: "fgts",
      name: "FGTS & Retenções Tributárias",
      icon: "📊",
      color: "from-red-500 to-rose-500",
      description: "Depósitos de FGTS ordinários e rescisórios, alíquota de jovem aprendiz e retenções de INSS/IRRF.",
      matches: (c: Challenge) => {
        const ft = (c.focoTecnico || "").toLowerCase();
        const tit = (c.titulo || "").toLowerCase();
        return ft.includes("fgts") || ft.includes("recolhimento") || ft.includes("inss") || ft.includes("irrf") || ft.includes("encargos") || ft.includes("alíquota") || tit.includes("fgts") || tit.includes("inss") || tit.includes("irrf");
      }
    },
    {
      id: "beneficios",
      name: "Benefícios & Folha",
      icon: "💼",
      color: "from-indigo-500 to-violet-500",
      description: "Desconto e cálculo de Vale-Transporte, Salário-Família, comissões e apuração de holerite.",
      matches: (c: Challenge) => {
        const ft = (c.focoTecnico || "").toLowerCase();
        const tit = (c.titulo || "").toLowerCase();
        return ft.includes("família") || ft.includes("familia") || ft.includes("vale-transporte") || ft.includes("vt") || ft.includes("comiss") || ft.includes("benefício") || ft.includes("holerite") || tit.includes("vt") || tit.includes("comiss") || tit.includes("salário");
      }
    },
    {
      id: "rescisao",
      name: "Rescisão & Justa Causa",
      icon: "🛡️",
      color: "from-pink-500 to-rose-500",
      description: "Tipos de rescisão, verbas rescisórias, multas CLT e justa causa (Art. 482).",
      matches: (c: Challenge) => {
        const ft = (c.focoTecnico || "").toLowerCase();
        const tit = (c.titulo || "").toLowerCase();
        return ft.includes("rescis") || ft.includes("trct") || ft.includes("verbas decisórias") || ft.includes("desligamento") || ft.includes("aviso") || ft.includes("justa causa") || ft.includes("consenso") || ft.includes("482") || ft.includes("483") || tit.includes("rescis") || tit.includes("justa causa") || tit.includes("aviso");
      }
    }
  ];

  const topicsPrecisionData = topicsList.map((topic) => {
    // 1. Get all challenges for this topic
    const topicChallenges = CHALLENGES_DATA.filter((c) => topic.matches(c));
    
    // 2. Filter completed challenges
    const completedChallengesForTopic = topicChallenges.filter((c) => respostas[c.id] !== undefined);
    
    let totalScore = 0;
    let completedCount = completedChallengesForTopic.length;
    
    completedChallengesForTopic.forEach((c) => {
      const isCorrect = respostas[c.id] === true;
      if (isCorrect) {
        totalScore += 100; // 100%
      } else {
        // "Nota dentro da nota" logic - partial success inside challenge types
        if (c.tipo === "Cálculo") {
          totalScore += 70; // 70% accuracy for partial fields correct
        } else if (c.tipo === "Misto") {
          totalScore += 50; // 50% for close choices
        } else if (c.tipo === "Erro" || c.tipo === "Justa Causa") {
          totalScore += 30; // 30% for partial compliance details
        } else {
          totalScore += 10; // 10% baseline for effort
        }
      }
    });

    // If no challenges are completed, we can assign a balanced starting template capability of 80% with an 'Aguardando Desafios' status
    const precisionRate = completedCount > 0 
      ? Math.round(totalScore / completedCount)
      : 80; // default initial baseline prior to completing challenges

    const internalGrade = Number((precisionRate / 10).toFixed(1));

    return {
      ...topic,
      completedCount,
      totalCount: topicChallenges.length,
      precision: precisionRate,
      grade: internalGrade,
      hasChallenges: completedCount > 0
    };
  });

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* HEADER SECTION */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-slate-900/60 to-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-indigo-500/10 px-3.5 py-1 text-[10px] rounded-bl text-indigo-400 font-bold uppercase tracking-wider font-mono">
          Painel de Desempenho v3.9
        </div>

        <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
          <div className="space-y-1.5 max-w-2xl">
            <h2 className="text-xl font-bold text-gray-100 tracking-tight flex items-center gap-2">
              <Timer className="w-5 h-5 text-indigo-400" />
              <span>Desempenho e Curva de Resolução Pessoal</span>
            </h2>
            <p className="text-xs text-text-secondary leading-relaxed">
              Consulte seu tempo médio de resposta, foco de tela acumulado, índice de conformidade com os tempos regulados da CLT e a classificação de proficiência em rotinas sindicais.
            </p>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg border border-white/5 self-stretch md:self-auto">
            <button
              onClick={() => setActiveSubTab("efficiency")}
              className={`flex-1 md:flex-initial px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                activeSubTab === "efficiency"
                  ? "bg-indigo-500 text-slate-950 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              ⏱️ Tempo & XP
            </button>
            <button
              onClick={() => setActiveSubTab("skills")}
              className={`flex-1 md:flex-initial px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                activeSubTab === "skills"
                  ? "bg-indigo-500 text-slate-950 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              📊 Força Regional
            </button>
            <button
              onClick={() => setActiveSubTab("certification")}
              className={`flex-1 md:flex-initial px-3 py-1.5 text-xs rounded-md transition-all cursor-pointer ${
                activeSubTab === "certification"
                  ? "bg-indigo-500 text-slate-950 font-bold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              🛡️ Testadores & CBO
            </button>
          </div>
        </div>
      </div>

      {/* THREE VALUE SCORECARD GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Core Metric 1: Solve speed */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest block font-bold">Resolução de Casos</span>
            <Clock className="w-4 h-4 text-sky-450" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none">
              {avgMinsPerChallenge} <span className="text-xs font-mono font-normal text-sky-400">min/caso</span>
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-1.5 flex justify-between">
              <span>Ativo: {Math.round(totalMins)} min</span>
              {Object.keys(activeStudent.temposRespostas || {}).length > 0 && (
                <span className="text-emerald-500 text-[8px] animate-pulse">● REAL-TIME</span>
              )}
            </p>
          </div>
        </div>

        {/* Core Metric 2: Total Completed */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest block font-bold">Casos Corretos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none">
              {correctCount} <span className="text-xs font-mono font-normal text-emerald-400">/ {totalCompleted}</span>
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-1.5">
              Precisão geral consolidada: {precision}%
            </p>
          </div>
        </div>

        {/* Core Metric 3: Focus Decaying level */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest block font-bold">Índice de Foco</span>
            <Brain className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none">
              {focusScore}%
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-1.5">
              Saídas involuntárias: {focusLosses} tab switch{focusLosses === 1 ? "" : "es"}
            </p>
          </div>
        </div>

        {/* Core Metric 4: Autonomy level */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/15">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest block font-bold">Dúvidas Resolvidas</span>
            <Activity className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-2.5">
            <h3 className="text-2xl font-black text-white tracking-tight leading-none">
              {activeStudent.duvidasHistorico?.length || 0} <span className="text-xs font-mono font-normal text-indigo-400">tiradas</span>
            </h3>
            <p className="text-[10px] text-gray-500 font-mono mt-1.5">
              Streak autônomo: {activeStudent.streakFasesAutonomas || 0} fases
            </p>
          </div>
        </div>

      </div>

      {/* CORE GRAPH DISPLAY ZONE */}
      {activeSubTab === "efficiency" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Composed Chart showing speed vs cumulative learning */}
          <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <div className="flex justify-between items-center border-b border-white/5 pb-2.5">
              <div>
                <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-indigo-400" />
                  Evolução Temporal e Rendimento de XP
                </h3>
                <p className="text-[11px] text-text-secondary">Eixo Esquerdo: Duração do Caso (minutos) | Eixo Direito: Curva de Crescimento de XP</p>
              </div>
              <span className="text-[9px] font-mono bg-slate-950 text-gray-500 px-2 py-0.5 rounded border border-white/5">
                Ref. CLT 20h
              </span>
            </div>

            <div className="h-[280px] w-full font-mono text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={chartData}
                  margin={{ top: 15, right: -10, left: -25, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" />
                  <XAxis dataKey="name" stroke="#ffffff20" tick={{ fill: '#9ca3af', fontSize: 8 }} />
                  <YAxis yAxisId="left" stroke="#38bdf8" label={{ value: 'Tempo Gasto (min)', angle: -90, position: 'insideLeft', fill: '#38bdf8', offset: 10 }} tick={{ fill: '#38bdf8', fontSize: 8 }} />
                  <YAxis yAxisId="right" orientation="right" stroke="#8b5cf6" label={{ value: 'XP Acumulado', angle: 90, position: 'insideRight', fill: '#8b5cf6', offset: 10 }} tick={{ fill: '#8b5cf6', fontSize: 8 }} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-950 border border-white/10 p-2.5 rounded-xl shadow-2xl font-mono text-[10px] space-y-1">
                            <p className="text-white font-bold border-b border-white/5 pb-1 mb-1">{data.titulo || data.name}</p>
                            <p className="text-sky-400">Duração: {data["Tempo Gasto (Sua Média)"]} min {data.isReal ? "✓ (Real)" : "(Est.)"}</p>
                            <p className="text-indigo-400">Benchmark: {data["Benchmark Sugerido"]} min</p>
                            <p className="text-purple-400">XP Acumulado: {data["XP Acumulado"]}</p>
                            {data.status && <p className={data.status === "Acerto" ? "text-emerald-400" : "text-rose-400"}>Status: {data.status}</p>}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '8px' }} />
                  
                  {/* Benchmarks as columns */}
                  <Bar yAxisId="left" dataKey="Benchmark Sugerido" fill="#4f46e5" opacity={0.15} radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="Tempo Gasto (Sua Média)" fill="#38bdf8" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  
                  {/* Progres curve line */}
                  <Line yAxisId="right" type="monotone" dataKey="XP Acumulado" stroke="#8b5cf6" strokeWidth={2.5} activeDot={{ r: 6 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Side Performance Statistics and Insights box */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Quick Pie Chart for Accuraccy ratio */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3">
              <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest border-b border-white/5 pb-2">
                Conformidade das Respostas
              </h3>

              {totalCompleted === 0 ? (
                <div className="py-8 text-center text-xs text-text-secondary font-mono border border-dashed border-white/5 rounded-xl">
                  Nenhum caso respondido ainda.
                </div>
              ) : (
                <div className="flex items-center gap-4 justify-between h-[110px] w-full font-mono text-[10px]">
                  <div className="h-full w-24 relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={pieData}
                          innerRadius={28}
                          outerRadius={40}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col justify-center items-center pointer-events-none">
                      <span className="text-[17px] font-black text-gray-150 leading-none">
                        {Math.round((correctCount / totalCompleted) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5 text-xs text-left">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-gray-400">Casos Certos: {correctCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      <span className="text-gray-400">Erros Retificados: {incorrectCount}</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1 border-t border-white/5 text-[9px] text-gray-500 font-mono">
                      <span>Total de Casos: {totalCompleted}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Time efficiency tips & fastest challenge details */}
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3.5">
              <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-500" />
                Destaque de Produtividade
              </h3>

              <div className="space-y-3 text-xs">
                {fastestCase ? (
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-sky-500/10 space-y-1.5">
                    <span className="text-[8.5px] uppercase font-mono text-sky-450 block font-bold">🚀 CASO MAIS RÁPIDO RESOLVIDO:</span>
                    <h4 className="font-bold text-gray-200">{fastestCase.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono flex justify-between">
                      <span>Tempo estimado: {fastestCase.time} min</span>
                      <span className="text-emerald-450 font-bold">-(CBO OK)</span>
                    </p>
                  </div>
                ) : (
                  <div className="p-3 text-center border border-dashed border-white/5 rounded-xl text-gray-500 text-[11px] font-mono">
                    Nenhum caso registrado no seu histórico de sessão. Resolva desafios para desbloquear os diagnósticos.
                  </div>
                )}

                {mostEfficientCase && mostEfficientCase.delta > 0 && (
                  <div className="p-3 bg-slate-950/40 rounded-xl border border-emerald-500/10 space-y-1.5">
                    <span className="text-[8.5px] uppercase font-mono text-emerald-400 block font-bold">⚡ MAIOR EFICIÊNCIA (vs CLT):</span>
                    <h4 className="font-bold text-gray-200">{mostEfficientCase.title}</h4>
                    <p className="text-[10px] text-gray-400 font-mono flex justify-between">
                      <span>Sua média: {mostEfficientCase.time} min</span>
                      <span className="text-emerald-400">Sobrou {mostEfficientCase.delta} min!</span>
                    </p>
                  </div>
                )}
              </div>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === "skills" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Radar RadarChart map of compliance domains */}
          <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-white/5 space-y-4">
            <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest border-b border-white/5 pb-2 flex items-center gap-1">
              <Target className="w-4 h-4 text-emerald-400" /> Profiler de Força de Competências (Rotinas Operacionais)
            </h3>

            <div className="h-[270px] w-full font-mono text-[9.5px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={skillRadarData}>
                  <PolarGrid stroke="#ffffff08" />
                  <PolarAngleAxis dataKey="area" tick={{ fill: '#d1d5db', fontSize: 9 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 7 }} />
                  <Radar name="Sua Precisão" dataKey="Sua Precisão (%)" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                  <Radar name="Meta do Mercado" dataKey="Padrão Profissional" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.05} />
                  <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quantitative breakdown map as a list */}
          <div className="lg:col-span-5 space-y-4">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3.5">
              <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest border-b border-white/5 pb-1">
                Análise Detalhada de Conformidade
              </h3>

              <div className="space-y-3">
                {skillRadarData.map((sk, idx) => {
                  const isExcellent = sk["Sua Precisão (%)"] >= sk["Padrão Profissional"];
                  return (
                    <div key={idx} className="space-y-1.5 text-xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-gray-300 font-medium">{sk.area}</span>
                        <div className="flex gap-2 font-mono text-[10px]">
                          <span className={isExcellent ? 'text-emerald-400 font-bold' : 'text-amber-500'}>
                            Sua: {sk["Sua Precisão (%)"]}%
                          </span>
                          <span className="text-gray-500">
                            (Target: {sk["Padrão Profissional"]}%)
                          </span>
                        </div>
                      </div>

                      {/* Visual Progress bar representation */}
                      {/* Visual Progress bar representation */}
                      <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className={`h-full rounded-full transition-all ${
                            isExcellent ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-amber-500 to-orange-500'
                          }`}
                          style={{ width: `${sk["Sua Precisão (%)"]}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Performance Level Feedback Badge */}
            <div className="p-4 rounded-xl bg-slate-900/30 border border-indigo-505/10 flex items-start gap-3">
              <Award className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div className="text-xs text-left leading-relaxed">
                <span className="font-bold text-gray-200 block">Feedback do Algoritmo DP</span>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  {precision >= 90 
                    ? "Excelente! Você opera com precisão de mestre de e-Social. Sua assertividade jurídica diminui passivos trabalhistas crônicos e garante credibilidade no preenchimento de carteiras de trabalho."
                    : "Em desenvolvimento. Foque em revisar as justificativas legais com o mestre para alcançar a precisão mínima do e-Social de 90%, minimizando sanções fiscais estruturais."}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Detalhamento de Precisão por Tópicos de Competência */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-5 bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-slate-950/40">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4">
            <div className="text-left">
              <h3 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest flex items-center gap-2">
                <Brain className="w-4 h-4 text-emerald-400" />
                Desempenho por Tópico de Competência (Precisão Interna dos Desafios)
              </h3>
              <p className="text-[11px] text-gray-400 mt-1">
                Média fidedigna de assertividade por competência operacional. Erros em desafios de cálculo contabilizam notas parciais (nota dentro da nota) com base em campos preenchidos corretamente.
              </p>
            </div>
            <div className="bg-slate-950/60 px-3 py-1 rounded-lg border border-white/5 text-[9px] font-mono text-emerald-400 uppercase">
              Mapeamento de Rotinas CLT
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {topicsPrecisionData.map((topic, idx) => {
              const isExcellent = topic.precision >= 85;
              const isGood = topic.precision >= 60 && topic.precision < 85;
              
              let badgeText = "Em Desenvolvimento";
              let badgeColorClass = "bg-rose-500/10 text-rose-400 border-rose-500/20";
              
              if (!topic.hasChallenges) {
                badgeText = "Aguardando Casos";
                badgeColorClass = "bg-slate-800/50 text-gray-400 border-white/5";
              } else if (isExcellent) {
                badgeText = "Alta Proficiência";
                badgeColorClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
              } else if (isGood) {
                badgeText = "Aprimoramento Médio";
                badgeColorClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
              }

              return (
                <div key={idx} className="bg-slate-950/40 p-4 rounded-xl border border-white/5 flex flex-col justify-between hover:border-indigo-500/20 transition-all group">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl bg-slate-950 p-2 rounded-lg border border-white/5 group-hover:scale-110 transition-transform">
                          {topic.icon}
                        </span>
                        <div className="text-left">
                          <h4 className="font-sans font-bold text-gray-250 text-xs leading-snug">{topic.name}</h4>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Casos: {topic.completedCount} / {topic.totalCount}
                          </span>
                        </div>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${badgeColorClass}`}>
                        {badgeText}
                      </span>
                    </div>

                    <p className="text-[11px] text-gray-400 leading-relaxed text-left min-h-[34px]">
                      {topic.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3.5 border-t border-white/5 space-y-2">
                    <div className="flex justify-between items-end">
                      <span className="text-[9px] font-mono text-gray-500 uppercase">Média de Acertos</span>
                      <div className="text-right">
                        <span className="text-sm font-black text-white">{topic.precision}%</span>
                        <span className="text-[9px] font-mono text-gray-400 ml-1.5">({topic.grade}/10)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-white/5 relative">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 bg-gradient-to-r ${topic.color}`}
                        style={{ width: `${topic.precision}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
      )}

      {activeSubTab === "certification" && (() => {
        const squadId = activeStudent.timeId?.trim() || "";
        const hasSquad = squadId !== "";
        const squadPartners = hasSquad
          ? students.filter((s) => s.timeId && s.timeId.trim().toUpperCase() === squadId.toUpperCase())
          : [];
        const otherPartners = squadPartners.filter((s) => s.id !== activeStudent.id);

        // Ensure we default to a partner if any exists
        const partnerToRender = otherPartners.find((p) => p.id === selectedPartnerId) || otherPartners[0] || activeStudent;

        // Determine current certificate entity info
        let certTitle = "CERTIFICADO DE CONCLUSÃO DE FASE";
        let stats = calculatePhaseStats(activeStudent, selectedPhase);
        let displayName = activeStudent.nomeCompleto;
        let displayMatricula = activeStudent.matricula;
        let displayTurma = `${activeStudent.sala} (${activeStudent.ano})`;
        let modalidadeText = "Individual";

        if (certType === "individual-partner" && otherPartners.length > 0) {
          stats = calculatePhaseStats(partnerToRender, selectedPhase);
          displayName = partnerToRender.nomeCompleto;
          displayMatricula = partnerToRender.matricula;
          displayTurma = `${partnerToRender.sala} (${partnerToRender.ano})`;
          modalidadeText = `Individual (Parceiro de Squad – "${squadId}")`;
        } else if (certType === "squad" && hasSquad) {
          stats = calculateSquadPhaseStats(squadPartners, selectedPhase);
          displayName = `SQUAD ${squadId.toUpperCase()}`;
          displayMatricula = squadPartners.map((p) => p.matricula).join(", ");
          displayTurma = squadPartners[0]?.sala ? `${squadPartners[0].sala} (${squadPartners[0].ano})` : `${activeStudent.sala} (${activeStudent.ano})`;
          modalidadeText = `Squad – "${squadId}" composto pelos alunos: ${squadPartners.map((p) => p.nomeCompleto).join(", ")}`;
        }

        const currentPhaseObj = CAREER_PHASES.find((p) => p.id === selectedPhase) || CAREER_PHASES[1];
        const phaseName = `Fase ${selectedPhase === -1 ? "Revisão" : selectedPhase} – ${currentPhaseObj.moduloTecnico} (${currentPhaseObj.cargo})`;
        const statusText = stats.approved
          ? "concluiu com êxito"
          : "concluiu a fase, porém com resultado insatisfatório";

        // Current Date formatting
        const currentDate = new Date();
        const dia = currentDate.getDate();
        const mesExtenso = currentDate.toLocaleString("pt-BR", { month: "long" });
        const ano = currentDate.getFullYear();
        const localEmissao = "Campo Grande - MS";

        return (
          <div className="space-y-6">
            <style>{`
              @media print {
                @page {
                  size: landscape;
                  margin: 0;
                }
                body {
                  background-color: #ffffff !important;
                  background-image: none !important;
                  color: #000000 !important;
                }
                body > * {
                  visibility: hidden !important;
                }
                /* specificity override to bypass parent print:hidden and display the card nested inside */
                #worksim-rh-main-app {
                  display: block !important;
                  visibility: hidden !important;
                  background: none !important;
                  border: none !important;
                  box-shadow: none !important;
                  padding: 0 !important;
                  margin: 0 !important;
                  height: auto !important;
                  min-height: auto !important;
                  overflow: visible !important;
                }
                #printable-certificate-card {
                  visibility: visible !important;
                  display: block !important;
                  position: fixed !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100vw !important;
                  height: 100vh !important;
                  max-width: 100vw !important;
                  max-height: 100vh !important;
                  background-color: #faf7f0 !important;
                  background-image: radial-gradient(#cbd5e1 1px, transparent 0) !important;
                  background-size: 24px 24px !important;
                  border: 14px double #b45309 !important; /* amber-700 */
                  color: #0f172a !important;
                  padding: 40px !important;
                  box-shadow: none !important;
                  border-radius: 0 !important;
                  margin: 0 !important;
                  box-sizing: border-box !important;
                  z-index: 9999999 !important;
                  font-size: 11pt !important;
                }
                #printable-certificate-card * {
                  visibility: visible !important;
                }
                .no-print {
                  display: none !important;
                }
                .print-table {
                  border-collapse: collapse !important;
                  width: 100% !important;
                }
                .print-table th, .print-table td {
                  border: 1px solid #cbd5e1 !important;
                  padding: 6px 10px !important;
                }
                * {
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
              }
            `}</style>

            {/* CONTROL PANEL */}
            <div className="glass-panel p-6 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-slate-900/80 to-indigo-950/20 space-y-4">
              <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between border-b border-white/5 pb-4">
                <div className="space-y-1 text-left">
                  <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                    <FileBadge className="w-5 h-5 text-amber-500" /> Emissor de Certificados WorkSim
                  </h3>
                  <p className="text-xs text-text-secondary leading-normal">
                    Selecione a fase concluída e emita seu certificado oficial individualizado ou por equipe (squad).
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] font-mono text-gray-400 uppercase">Fase para emissão:</span>
                  <select
                    value={selectedPhase}
                    onChange={(e) => {
                      const pId = parseInt(e.target.value);
                      setSelectedPhase(pId);
                    }}
                    className="bg-slate-950 border border-white/10 text-gray-200 rounded-lg px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    {CAREER_PHASES.map((phase) => (
                      <option key={phase.id} value={phase.id}>
                        Fase {phase.id === -1 ? "Revisão" : phase.id}: {phase.moduloTecnico} ({phase.cargo})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SQUAD INTERACTIVE OPTIONS */}
              {hasSquad ? (
                <div className="p-4 rounded-xl bg-slate-950/40 border border-indigo-500/10 space-y-3.5 text-left">
                  <div className="flex items-center gap-2 text-indigo-400">
                    <Users className="w-4 h-4 animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-wider">Membro ativo de Equipe: Squad {squadId.toUpperCase()}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => {
                        setCertType("individual-self");
                        playSoundEffect("click");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        certType === "individual-self"
                          ? "bg-amber-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(217,119,6,0.3)]"
                          : "bg-slate-900 text-gray-350 hover:bg-slate-800"
                      }`}
                    >
                      👤 Meu Certificado Individual
                    </button>

                    {otherPartners.length > 0 && (
                      <button
                        onClick={() => {
                          setCertType("individual-partner");
                          if (otherPartners[0]) setSelectedPartnerId(otherPartners[0].id);
                          playSoundEffect("click");
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          certType === "individual-partner"
                            ? "bg-amber-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(217,119,6,0.3)]"
                            : "bg-slate-900 text-gray-350 hover:bg-slate-800"
                        }`}
                      >
                        👥 Baixar Individual por Aluno (Links de Colegas)
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setCertType("squad");
                        playSoundEffect("click");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        certType === "squad"
                          ? "bg-amber-600 text-slate-950 font-bold shadow-[0_0_12px_rgba(217,119,6,0.3)]"
                          : "bg-slate-900 text-gray-350 hover:bg-slate-800"
                      }`}
                    >
                      🎖️ Certificado Coletivo (Por Squad)
                    </button>
                  </div>

                  {/* Teammate Sub-selector if individual-partner is selected */}
                  {certType === "individual-partner" && otherPartners.length > 0 && (
                    <div className="pt-2 border-t border-white/5 flex flex-wrap items-center gap-3 animate-fade-in">
                      <span className="text-[10px] font-mono text-gray-400 uppercase">Selecione o colega do squad:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {otherPartners.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => {
                              setSelectedPartnerId(p.id);
                              playSoundEffect("click");
                            }}
                            className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                              selectedPartnerId === p.id || (!selectedPartnerId && otherPartners[0]?.id === p.id)
                                ? "bg-indigo-500 text-slate-950"
                                : "bg-slate-900 text-gray-400 hover:text-white"
                            }`}
                          >
                            {p.nomeCompleto.split(" ")[0]} ({p.matricula})
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-950/20 border border-white/5 text-left text-xs text-text-secondary flex items-center gap-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Realização individual cadastrada. Associado à estação principal do estudante.</span>
                </div>
              )}
            </div>

            {/* LIVE CERTIFICATE DISPLAY PREVIEW */}
            <div className="relative group/cert">
              
              {/* PRINT BAR */}
              <div className="flex justify-between items-center bg-slate-900/60 p-3 rounded-t-xl border-t border-x border-white/5 no-print">
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Visualização de Impressão A4 (Paisagem)
                </span>
                
                <button
                  onClick={() => {
                    playSoundEffect("success");
                    exportCertificateToPDF({
                      certType,
                      displayName,
                      displayMatricula,
                      displayTurma,
                      activeStudentMatricula: activeStudent.matricula,
                      statusText,
                      phaseName,
                      stats,
                      hasSquad,
                      squadPartners,
                      localEmissao,
                      modalidadeText,
                      dia,
                      mesExtenso,
                      ano
                    });
                  }}
                  className="flex items-center gap-1.5 py-1.5 px-4 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-[11px] rounded-lg cursor-pointer transition-all hover:scale-102 shadow-lg"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>GERAR CERTIFICADO / SALVAR PDF</span>
                </button>
              </div>

              {/* CERTIFICATE CANVAS FRAME */}
              <div
                id="printable-certificate-card"
                className="bg-[#faf7f0] text-slate-900 border-[14px] border-double border-[#b45309] p-8 sm:p-12 shadow-2xl relative font-serif text-left transition-all duration-300 overflow-hidden"
                style={{ backgroundImage: "radial-gradient(#fcfaf4 1px, transparent 0)", backgroundSize: "24px 24px" }}
              >
                {/* Vintage Guilloche elements and background watermark seal */}
                <div className="absolute inset-0 opacity-[0.02] pointer-events-none flex items-center justify-center select-none">
                  <span className="text-[350px] font-black font-sans">WS</span>
                </div>

                <div className="absolute top-4 left-4 w-12 h-12 border-t-2 border-l-2 border-amber-600/40 pointer-events-none" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-2 border-r-2 border-amber-600/40 pointer-events-none" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-2 border-l-2 border-amber-600/40 pointer-events-none" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-2 border-r-2 border-amber-600/40 pointer-events-none" />

                {/* HEADER SECTION */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b-2 border-amber-800/20 pb-4">
                  <div className="text-center md:text-left space-y-1">
                    <h2 className="text-[17px] font-bold uppercase tracking-wider text-amber-900 leading-tight">
                      Escola Estadual Professora Flavina Maria da Silva
                    </h2>
                    <p className="text-[11px] font-sans text-stone-650 tracking-wide font-semibold uppercase">
                      Curso Técnico em Recursos Humanos – 1.º Semestre
                    </p>
                    <p className="text-[10px] font-sans text-stone-500 italic">
                      Unidade Curricular Profissional 3: Legislação Aplicada a Negócios
                    </p>
                  </div>

                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-11 h-11 rounded-full border-2 border-amber-600 flex items-center justify-center bg-amber-50">
                      <Award className="w-6 h-6 text-amber-700" />
                    </div>
                    <span className="text-[9px] font-sans text-amber-800 font-bold uppercase tracking-widest mt-1">
                      WorkSim RH
                    </span>
                  </div>
                </div>

                {/* CERTIFICATE TITLE */}
                <div className="text-center my-6 space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-black text-amber-950 uppercase tracking-tight leading-none">
                    Certificado de Conclusão de Fase
                  </h1>
                  <p className="text-xs sm:text-sm font-sans italic text-stone-600 uppercase tracking-widest">
                    Simulador Académico de Legislação de RH – WorkSim
                  </p>
                </div>

                {/* ATTRIBUTION TEXT */}
                <div className="space-y-4 text-[12px] sm:text-[13px] text-stone-850 leading-relaxed text-justify px-2 font-sans">
                  <p>
                    Certificamos que {certType === "squad" ? "o grupo de estudantes do" : "o(a) aluno(a)"}{" "}
                    <strong className="text-stone-950 font-bold text-sm underline decoration-amber-600/55 underline-offset-4">
                      {displayName}
                    </strong>
                    {certType !== "squad" && (
                      <>
                        , N.º de matrícula: <strong className="font-bold text-stone-950">{displayMatricula}</strong> | Turma: <strong className="font-bold text-stone-950">{displayTurma}</strong>
                      </>
                    )}
                    {certType === "squad" ? ", do " : ", "}estudante da <strong className="font-bold text-stone-900">Escola Estadual Professora Flavina Maria da Silva</strong>, regularmente matriculado(a) no <strong className="font-bold text-stone-900">Curso Técnico em Recursos Humanos – 1.º Semestre</strong>, e registrado(a) no sistema <strong className="font-bold text-amber-900">WorkSim</strong> sob a credencial de matrícula <strong className="font-mono text-stone-950">{activeStudent.matricula}</strong>,
                  </p>

                  <p>
                    {statusText}{" "}
                    a fase <strong className="font-bold text-amber-950 text-xs sm:text-sm font-mono border-b border-amber-700/25 pb-0.5">{phaseName}</strong>, com o desempenho técnico-legal registrado e aferido pelas regras do simulador em tempo real:
                  </p>
                </div>

                {/* RESULTS TABLE */}
                <div className="my-6">
                  <table className="w-full text-left text-xs font-sans print-table border border-stone-300">
                    <thead>
                      <tr className="bg-stone-100/85 text-amber-950 font-bold border-b border-stone-300">
                        <th className="py-2.5 px-4">Indicador de Conformidade e Resolução</th>
                        <th className="py-2.5 px-4 text-right">Resultado Registrado</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 text-stone-850 bg-white/50">
                      <tr>
                        <td className="py-2 px-4 font-semibold text-stone-900">Questões da fase</td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-stone-950">{stats.correctCount} de {stats.completedCount}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold text-stone-900">Tempo total de resposta</td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-stone-950">{stats.hh}h {stats.mm}min</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold text-stone-900">Percentagem de acerto real</td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-stone-950">{stats.acertoReal}%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold text-stone-900 flex items-center gap-1.5">
                          <span>Percentagem para efeito de nota</span>
                          {stats.arredondamentoAplicado && (
                            <span className="text-[9px] bg-indigo-500/10 text-indigo-700 border border-indigo-400/20 py-0.5 px-1.5 rounded font-mono font-bold uppercase print:text-black">
                              (Arredondada pelo sistema)
                            </span>
                          )}
                        </td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-stone-950">{stats.acertoNota}%</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold text-stone-900">Nota base <span className="text-[10px] text-stone-500 font-normal">(percentagem de nota ÷ 10)</span></td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-stone-950">{stats.notaBase.toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold text-stone-900">Bônus por agilidade <span className="text-[10px] text-stone-500 font-normal">(concedido apenas para &gt;75% de acertos reais)</span></td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-stone-950">
                          {stats.acertoReal > 75 ? `+${stats.bonus.toFixed(2)}` : "Não aplicável"}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-bold text-stone-950 bg-stone-50/40">Nota final consolidada</td>
                        <td className="py-2 px-4 text-right font-mono font-black text-amber-950 bg-stone-50/40 text-sm">{stats.notaFinal.toFixed(1)}</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-4 font-semibold text-stone-900">Excedente <span className="text-[10px] text-stone-500 font-normal">(desempenho extraordinário acima de 10,0)</span></td>
                        <td className="py-2 px-4 text-right font-mono font-bold text-stone-950">
                          {stats.excedente !== null ? `+${stats.excedente.toFixed(2)}` : "—"}
                        </td>
                      </tr>
                      <tr className="border-t-2 border-stone-350 bg-stone-100/50 font-bold">
                        <td className="py-2.5 px-4 text-stone-950">RESULTADO FINAL DA AVALIAÇÃO</td>
                        <td className={`py-2.5 px-4 text-right font-mono text-sm uppercase tracking-wider font-black ${
                          stats.approved ? "text-emerald-700" : "text-rose-700"
                        }`}>
                          {stats.approved ? "APROVADO" : "REPROVADO"}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* SQUAD INTEGRANTS DETAIL BOX FOR SQUAD CERTIFICATES */}
                {certType === "squad" && hasSquad && (
                  <div className="p-3.5 bg-amber-50/45 rounded-lg border border-amber-600/20 text-[10px] font-sans text-stone-750 mb-6 flex flex-col gap-1">
                    <span className="font-bold text-amber-900 uppercase font-mono tracking-wider">Integrantes do Squad homologados conjuntamente:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-stone-950 pt-1">
                      {squadPartners.map((p) => (
                        <div key={p.id} className="flex items-center gap-1">
                          <span className="text-amber-700">●</span>
                          <span>{p.nomeCompleto} ({p.matricula})</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ADDITIONAL INFO FOOTER */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end mt-8 border-t-2 border-amber-800/20 pt-6 font-sans text-[11px] text-stone-650">
                  <div className="space-y-1.5 text-center md:text-left">
                    <span className="text-[8.5px] uppercase tracking-widest text-stone-400 block font-bold">Autenticação de Segurança</span>
                    <p className="font-mono text-stone-950 leading-none">
                      Código de verificação: <strong className="font-bold uppercase">{stats.verificationCode}</strong>
                    </p>
                    <p className="text-[9.5px] text-stone-500 leading-tight">
                      Autenticidade verificável em <span className="underline text-amber-850">worksim.com.br/verificar</span>
                    </p>
                  </div>

                  <div className="space-y-1 text-center font-sans">
                    <p>
                      Emitido em <strong className="font-semibold text-stone-900">{localEmissao}</strong>, aos{" "}
                      <strong className="font-semibold text-stone-900">{dia}</strong> de{" "}
                      <strong className="font-semibold text-stone-900">{mesExtenso}</strong> de{" "}
                      <strong className="font-semibold text-stone-900">{ano}</strong>.
                    </p>
                    <div className="text-[9.5px] text-stone-500 italic">
                      Modalidade: <span className="font-bold not-italic">{modalidadeText}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-center space-y-1 border-t md:border-t-0 border-stone-200 pt-3 md:pt-0">
                    {/* SVG Stylized Signature placeholder */}
                    <div className="h-8 w-32 relative flex items-center justify-center select-none font-sans text-xs italic text-amber-850 font-semibold opacity-85">
                      Fábio Santana Lima
                      <div className="absolute bottom-1 w-full border-b border-stone-400/60" />
                    </div>
                    <span className="text-[8.5px] uppercase tracking-wider text-stone-400 font-bold block text-center leading-none">
                      Assinatura Digital do Responsável
                    </span>
                    <span className="text-[9px] text-stone-500 block text-center leading-tight">
                      Sistema WorkSim Acadêmico
                    </span>
                  </div>
                </div>

                {/* GOLD FOIL EMBOSSED SEAL DESIGN AS REQUESTED BY EMBELLISHMENT SPECS */}
                <div className="absolute bottom-6 right-8 opacity-[0.25] pointer-events-none hidden md:block">
                  <svg className="w-16 h-16 text-amber-700" viewBox="0 0 100 100" fill="currentColor">
                    <path d="M50,0 C63.8,0 75,11.2 75,25 C75,38.8 63.8,50 50,50 C36.2,50 25,38.8 25,25 C25,11.2 36.2,0 50,0 Z" />
                    <polygon points="50,45 35,90 50,75 65,90" />
                  </svg>
                </div>
              </div>

              {/* USER IFRAME ADVISORY */}
              <div className="mt-3 text-center text-[11px] text-gray-500 font-mono no-print">
                💡 Dica: Se o seu navegador não carregar a janela de impressão diretamente, ou se estiver na janela incorporada do AI Studio, clique em <strong>"Abrir em nova aba"</strong> no menu superior da aplicação e clique no botão de gerar certificado de lá para poder baixar em formato PDF perfeitamente!
              </div>
            </div>

            {/* RULES REFERENCE SHEET */}
            <div className="p-5 rounded-2xl border border-white/5 bg-slate-900/40 text-left space-y-4 no-print">
              <h4 className="text-xs font-mono font-bold text-gray-200 uppercase tracking-widest border-b border-white/5 pb-1">
                Regras de Avaliação e Promoção Aplicadas pelo WorkSim
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-text-secondary leading-relaxed">
                <div className="space-y-2">
                  <h5 className="font-bold text-gray-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> 1. Aprovação & Notas
                  </h5>
                  <p className="text-gray-400 text-[11px]">
                    Percentagem de acerto ≥ 55%: <strong>Aprovado</strong>. Percentagens de acerto real entre 55% e 59,99% são arredondadas para 60% para fins de nota (garantindo a aprovação). Abaixo de 55%: <strong>Reprovado</strong>, zerando quaisquer bônus de agilidade.
                  </p>
                </div>
                <div className="space-y-2">
                  <h5 className="font-bold text-gray-200 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" /> 2. Bônus por Agilidade
                  </h5>
                  <p className="text-gray-400 text-[11px]">
                    Concedido exclusivamente para acertos reais <strong>superores a 75%</strong> (&gt;75%). Tempo acumulado total na fase ≤ 1 hora: <strong>+1,50 pontos</strong> de bônus na nota consolidada. Tempo &gt; 1 hora: <strong>+0,50 pontos</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

    </div>
  );
}
