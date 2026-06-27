import React from "react";
import { Student, CareerPhase } from "../types";
import { CAREER_PHASES, CHALLENGES_DATA } from "../data";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Award,
  User,
  Users,
  CheckCircle2,
  Target,
  Brain,
  Sparkles,
  Search,
  BookOpen,
  History,
  Zap,
  AlertTriangle,
  Flame,
  Activity,
  FileText,
  ArrowUpRight,
  Calendar,
  Trophy,
} from "lucide-react";

interface StudentMetricsTabProps {
  students: Student[];
  activeStudent: Student | null;
  onUpdateSimulationTime?: (seconds: number) => void;
}

// Fixed cumulative reference standard XP benchmarks per phase.
// This is used to draw the "Média de Referência" and helps calculate classroom averages cleanly.
const REFERENCE_XP_CURVE = [
  { pId: -1, label: "Fase -1 (Início)", refXp: 50, cargo: "Simulado Revisão" },
  { pId: 0, label: "Fase 0 (ADM)", refXp: 140, cargo: "Pré-Cadastro" },
  { pId: 1, label: "Fase 1 (Triagem)", refXp: 200, cargo: "Estag. Triagem" },
  { pId: 2, label: "Fase 2 (FGTS)", refXp: 300, cargo: "Estag. Segundoanista" },
  { pId: 3, label: "Fase 3 (DP)", refXp: 510, cargo: "Assistente DP" },
  { pId: 4, label: "Fase 4 (CES)", refXp: 630, cargo: "Analista Pl." },
  { pId: 5, label: "Fase 5 (RES)", refXp: 1180, cargo: "Coordenador RH" },
  { pId: 6, label: "Fase 6 (Compliance)", refXp: 1300, cargo: "Gerente RH" },
  { pId: 7, label: "Fase 7 (Estratégia)", refXp: 1400, cargo: "Diretor RH" },
];

export default function StudentMetricsTab({
  students,
  activeStudent,
  onUpdateSimulationTime,
}: StudentMetricsTabProps) {
  // 1. Calculate general class metrics
  const totalStudentsCount = students.length;
  const sortedByXp = [...students].sort((a, b) => (b.xp || 0) - (a.xp || 0));
  const myRankIndex = activeStudent ? sortedByXp.findIndex((s) => s.id === activeStudent.id) : -1;
  const myRank = myRankIndex !== -1 ? myRankIndex + 1 : totalStudentsCount;

  const totalClassXp = students.reduce((acc, curr) => acc + (curr.xp || 0), 0);
  const classAverageXp = Math.round(totalStudentsCount > 0 ? totalClassXp / totalStudentsCount : 0);

  // Calculate XP velocity per hour
  const activeSecs = activeStudent?.tempoAtivoSegundos || 1;
  const xpHourSpeed = activeStudent ? Math.round((activeStudent.xp / activeSecs) * 3600) : 0;

  const [inputMinutes, setInputMinutes] = React.useState<string>("");
  const [logFilter, setLogFilter] = React.useState<"all" | "promotion" | "achievement" | "penalty" | "challenge">("all");

  interface SessionLog {
    id: string;
    type: "promotion" | "streak" | "penalty" | "achievement" | "session" | "challenge";
    title: string;
    desc: string;
    timestamp: string;
    badgeText: string;
    badgeStyle: string;
    xpString?: string;
  }

  const generateSessionLogs = (): SessionLog[] => {
    const list: SessionLog[] = [];
    
    // 1. Initial Connection / Setup (Always present)
    list.push({
      id: "log-init",
      type: "session",
      title: "Habilitação Cadastral CLT",
      desc: "Simulador de e-Social integrado com sucesso para esta estação. Registro eletrônico da Carteira de Trabalho (CTPS) conectado à base governamental de testes.",
      timestamp: "Início",
      badgeText: "Conexão",
      badgeStyle: "bg-sky-500/10 text-sky-400 border border-sky-500/20",
    });

    // 2. Completed Challenge cases
    const respostas = activeStudent.respostasDesafios || {};
    Object.entries(respostas).forEach(([chId, wasCorrect]) => {
      const challenge = CHALLENGES_DATA.find((c) => c.id === chId);
      if (challenge) {
        list.push({
          id: `log-ch-${chId}`,
          type: "challenge",
          title: `Caso Resolvido: ${challenge.titulo}`,
          desc: wasCorrect 
            ? `Transmissão efetuada com sucesso ao e-Social. O diagnóstico legal operado foi cirúrgico, sem geração de passivos trabalhistas.`
            : `Transmissão concluída com inconsistência regulatória original. O sistema registrou um aviso de desconformidade e foi devidamente retificado.`,
          timestamp: `Desafio ${chId}`,
          badgeText: wasCorrect ? "Sucesso" : "Retificado",
          badgeStyle: wasCorrect 
            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
            : "bg-amber-500/10 text-amber-500 border border-amber-500/20",
          xpString: wasCorrect ? `+${challenge.xpRecompensa} XP` : "+0 XP",
        });
      }
    });

    // 3. Career Stage Upgrades (Fase 1-7)
    if (activeStudent.faseAtual >= 1) {
      list.push({
        id: "log-promo-1",
        type: "promotion",
        title: "Promoção de Carreira: Estagiário de Triagem",
        desc: "Aprovado no Pré-Cadastro admissional! Desbloqueado o módulo de inspeção e triagem de guias básicas no portal e-Social.",
        timestamp: "Fase 1",
        badgeText: "Carreira",
        badgeStyle: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        xpString: "+50 XP",
      });
    }
    if (activeStudent.faseAtual >= 2) {
      list.push({
        id: "log-promo-2",
        type: "promotion",
        title: "Promoção de Carreira: Estagiário Segundoanista",
        desc: "Habilitado para tratamento de guias recolhimento do FGTS e validação de incidência de INSS mensal na base do e-Social.",
        timestamp: "Fase 2",
        badgeText: "Carreira",
        badgeStyle: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
        xpString: "+100 XP",
      });
    }
    if (activeStudent.faseAtual >= 3) {
      list.push({
        id: "log-promo-3",
        type: "promotion",
        title: "Ascensão Corporativa: Assistente de Departamento Pessoal",
        desc: "Promovido! Acesso concedido para conferência fina de holerites base, adicionais de insalubridade, horas extras e periculosidade.",
        timestamp: "Fase 3",
        badgeText: "Promoção",
        badgeStyle: "bg-purple-600/15 text-purple-300 border border-purple-500/25",
        xpString: "+150 XP",
      });
    }
    if (activeStudent.faseAtual >= 4) {
      list.push({
        id: "log-promo-4",
        type: "promotion",
        title: "Ascensão Corporativa: Analista de DP Pleno",
        desc: "Responsabilidade estendida pela consistência formal de contratos de admissão e auditoria documental trabalhista complexa.",
        timestamp: "Fase 4",
        badgeText: "Promoção",
        badgeStyle: "bg-purple-600/15 text-purple-300 border border-purple-500/25",
        xpString: "+200 XP",
      });
    }
    if (activeStudent.faseAtual >= 5) {
      list.push({
        id: "log-promo-5",
        type: "promotion",
        title: "Acreditação Funcional: Coordenador de RH",
        desc: "Autoridade para gestão de termos rescisórios de alta complexidade (demissões motivadas, acordos bilaterais e rescisões indiretas).",
        timestamp: "Fase 5",
        badgeText: "Coordenador",
        badgeStyle: "bg-purple-700/20 text-purple-200 border border-purple-500/30",
        xpString: "+300 XP",
      });
    }
    if (activeStudent.faseAtual >= 6) {
      list.push({
        id: "log-promo-6",
        type: "promotion",
        title: "Cargo Diretivo: Gerente de Governança RH",
        desc: "Capacidade homologada para elaboração de pareceres legais e formulação de estratégias para contenção e saneamento de passivos fiscais.",
        timestamp: "Fase 6",
        badgeText: "Gerência",
        badgeStyle: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
        xpString: "+400 XP",
      });
    }
    if (activeStudent.faseAtual >= 7) {
      list.push({
        id: "log-promo-7",
        type: "promotion",
        title: "Aliança Executiva: Diretor Operacional de RH",
        desc: "Nível máximo do simulador de e-Social! Direção de comissões, gestão de equipes compartilhadas e consultor executivo da plataforma.",
        timestamp: "Fase 7",
        badgeText: "Diretoria",
        badgeStyle: "bg-amber-500/20 text-yellow-300 border border-amber-500/25",
        xpString: "+500 XP",
      });
    }

    // 4. Streak Rewards & Performance Milestones
    if (activeStudent.precisao >= 90) {
      list.push({
        id: "log-ach-precisao",
        type: "achievement",
        title: "Selo de Ouro em Conformidade e-Social",
        desc: `Alcançou ${activeStudent.precisao}% de precisão na apuração jurídica, operando acima do nível de tolerância aceito pelas agências governamentais.`,
        timestamp: "Geral",
        badgeText: "Conformidade",
        badgeStyle: "bg-amber-500/10 text-yellow-400 border border-amber-500/20",
      });
    }
    if (activeStudent.streakFasesAutonomas && activeStudent.streakFasesAutonomas > 0) {
      list.push({
        id: "log-ch-streak",
        type: "achievement",
        title: `Bônus de Streak: ${activeStudent.streakFasesAutonomas} Fases Autônomas`,
        desc: `Destaque operacional sob produtividade! Completou ${activeStudent.streakFasesAutonomas} fases seguidas mantendo conformidade exemplar, sem requisições de socorro ao mestre Fábio.`,
        timestamp: "Sessão",
        badgeText: "Streak Autônomo",
        badgeStyle: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
        xpString: "Bônus Ativo",
      });
    }
    if (activeStudent.xp >= 400) {
      list.push({
        id: "log-ach-400xp",
        type: "achievement",
        title: "Marco Consolidado de Aprendizado",
        desc: `Sua trilha consagrou a expressiva marca de mais de 400 pontos de aprendizado prático de legislação trabalhista.`,
        timestamp: "XP",
        badgeText: "Distinção",
        badgeStyle: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
      });
    }

    // 5. Warnings & Operational Penalties (Focal control)
    const totalLosses = activeStudent.saidasTela || 0;
    if (totalLosses > 0) {
      list.push({
        id: "log-pen-loss",
        type: "penalty",
        title: `Desvio de Atenção Operacional: ${totalLosses}ª Saída Registrada`,
        desc: `O sensor detectou que sua estação perdeu foco da tela de e-Social. Evite pesquisas externas para preservar seu multiplicador integral de XP.`,
        timestamp: "Alerta",
        badgeText: "Conduta",
        badgeStyle: "bg-rose-500/10 text-rose-450 border border-rose-500/20",
      });

      if (totalLosses >= 5) {
        list.push({
          id: "log-pen-critical",
          type: "penalty",
          title: "Instalação sob Alerta Sancionatório Crítico",
          desc: "Alerta de investigação! Risco operacional eminente de travamento por violação restritiva de conformidade (5+ desvios na sessão laboral).",
          timestamp: "Investigação",
          badgeText: "Crítico",
          badgeStyle: "bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse",
        });
      }
    }

    if (activeStudent.recuperadoDeBloqueio) {
      list.push({
        id: "log-pen-bloqueio",
        type: "penalty",
        title: "Token Reativado sob Anistia Presencial",
        desc: "Sua estação de trabalho foi desbloqueada pelo cockpit docente. Tolerância de foco expirada: nova saída suspenderá permanentemente sua sessão.",
        timestamp: "Anistia",
        badgeText: "Tolerância Zero",
        badgeStyle: "bg-indigo-500/10 text-indigo-300 border border-indigo-500/20",
      });
    }

    // Chronological / Weight-based Sorting
    return list.sort((a, b) => {
      const getWeight = (x: SessionLog) => {
        if (x.type === "penalty") {
          if (x.id.includes("bloqueio")) return 1000;
          if (x.id.includes("critical")) return 900;
          return 800;
        }
        if (x.type === "promotion") {
          if (x.id.includes("7")) return 700;
          if (x.id.includes("6")) return 650;
          if (x.id.includes("5")) return 600;
          if (x.id.includes("4")) return 550;
          if (x.id.includes("3")) return 500;
          if (x.id.includes("2")) return 450;
          if (x.id.includes("1")) return 400;
        }
        if (x.type === "streak") return 300;
        if (x.type === "achievement") return 250;
        if (x.type === "challenge") {
          const matchedNum = x.id.match(/[\d.]+/);
          const chIdVal = matchedNum ? parseFloat(matchedNum[0]) : 0;
          return 100 + chIdVal;
        }
        return 0; // session
      };
      return getWeight(b) - getWeight(a);
    });
  };

  const compiledLogs = generateSessionLogs();
  const filteredLogs = compiledLogs.filter((log) => {
    if (logFilter === "all") return true;
    return log.type === logFilter;
  });

  // 2. Generate dynamic classroom average per phase.
  // We compute the average XP of students in each phase, or standard expectations.
  const chartData = REFERENCE_XP_CURVE.map((refItem) => {
    // Collect students who are currently at or have completed this phase
    const studentsInOrBeyondPhase = students.filter(
      (s) => s.faseAtual >= refItem.pId
    );

    let calculatedClassXpAverage = refItem.refXp; // Default to standard reference

    if (studentsInOrBeyondPhase.length > 0) {
      // Calculate average XP of these students, capped by reference or scaling naturally
      const sumXp = studentsInOrBeyondPhase.reduce((acc, curr) => {
        // If they are exactly in this phase, use their actual XP.
        // If they have passed it, estimate based on the phase's standard XP cap.
        if (curr.faseAtual === refItem.pId) {
          return acc + (curr.xp || 0);
        } else {
          // If the student is ahead, they likely finished this phase with around the reference XP.
          // Add a small randomized realistic classroom variation
          const offset = ((curr.matricula.charCodeAt(0) % 5) - 2) * 10; 
          return acc + refItem.refXp + offset;
        }
      }, 0);
      calculatedClassXpAverage = Math.round(sumXp / studentsInOrBeyondPhase.length);
    }

    // Now calculate current logged in student's profile for the graph.
    // If they have not reached the phase yet, we do not plot their line (set to null) to represent the curve.
    let myPhaseXpProgress: number | null = null;
    if (activeStudent.faseAtual > refItem.pId) {
      // The student completed this phase, so they got approximately the reference XP (or slightly adjusted by their actual)
      const currentRef = REFERENCE_XP_CURVE.find(r => r.pId === activeStudent.faseAtual);
      const ratio = activeStudent.xp / (currentRef?.refXp || 1400);
      myPhaseXpProgress = Math.round(refItem.refXp * Math.min(1.2, Math.max(0.8, ratio)));
    } else if (activeStudent.faseAtual === refItem.pId) {
      // Current active phase: plot their exact current XP
      myPhaseXpProgress = activeStudent.xp;
    }

    return {
      name: refItem.cargo,
      "Seu XP": myPhaseXpProgress,
      "Média da Turma": calculatedClassXpAverage,
      "Meta do Mercado": refItem.refXp,
    };
  });

  return (
    <div className="space-y-6 animate-fade-in p-1">
      {/* HEADER SUMMARY SECTION */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/35 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1 px-2 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 text-[10px] font-mono font-black uppercase">
              ANÁLISE DE DESEMPENHO
            </span>
            <span className="text-[10px] text-gray-500 font-mono">
              MAT: {activeStudent.matricula}
            </span>
          </div>
          <h2 className="text-xl font-sans font-bold text-gray-100 tracking-tight">
            Análise e Progressão de XP Média por Fase
          </h2>
          <p className="text-xs text-text-secondary leading-relaxed">
            Monitore seu ritmo de aprendizado em relação à média geral dos colegas de sala e os benchmarks ideais corporativos de conformidade e-Social.
          </p>
        </div>

        {/* RANKING OR HIGHLIGHT SQUAD */}
        <div className="flex items-center gap-3 bg-slate-950/40 p-3 rounded-xl border border-white/5">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div className="text-left font-mono">
            <span className="text-[8.5px] text-gray-500 uppercase block font-sans">Sua Classificação</span>
            <span className="text-xs font-black text-gray-200 block">
              <strong className="text-emerald-400 text-sm font-sans">{myRank}º</strong> colocado na Sala
            </span>
          </div>
        </div>
      </div>

      {/* QUICK STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {/* Card 1: Meu XP */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest">Seu Aprendizado</span>
            <Award className="w-4 h-4 text-accent-primary" />
          </div>
          <p className="text-2xl font-sans font-black text-white tracking-tight mt-2">
            {activeStudent.xp}{" "}
            <span className="text-xs font-mono font-normal text-gray-400">XP</span>
          </p>
          <div className="flex justify-between items-center mt-3 text-[9px] font-mono border-t border-white/5 pt-2 text-gray-500">
            <span>Fase Atual:</span>
            <span className="text-gray-300 font-bold">F{activeStudent.faseAtual}</span>
          </div>
        </div>

        {/* Card 2: Question Progress in Phase */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest">Resoluções na Fase</span>
            <BookOpen className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-sans font-black text-white tracking-tight mt-2">
            {(() => {
              const phaseChallenges = CHALLENGES_DATA.filter(c => c.fase === activeStudent.faseAtual);
              const solved = phaseChallenges.filter(c => activeStudent.respostasDesafios?.[c.id] === true).length;
              return `${solved} / ${phaseChallenges.length}`;
            })()}
          </p>
          <div className="flex justify-between items-center mt-3 text-[9px] font-mono border-t border-white/5 pt-2 text-gray-500">
            <span>Progresso da Meta:</span>
            <span className="text-gray-300 font-bold">
              {(() => {
                const phaseChallenges = CHALLENGES_DATA.filter(c => c.fase === activeStudent.faseAtual);
                if (phaseChallenges.length === 0) return "100%";
                const solved = phaseChallenges.filter(c => activeStudent.respostasDesafios?.[c.id] === true).length;
                return `${Math.round((solved / phaseChallenges.length) * 100)}%`;
              })()}
            </span>
          </div>
        </div>

        {/* Card 3: Turma Average */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest">Média da Turma</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-sans font-black text-white tracking-tight mt-2">
            {classAverageXp}{" "}
            <span className="text-xs font-mono font-normal text-emerald-500">XP</span>
          </p>
          <div className="flex justify-between items-center mt-3 text-[9px] font-mono border-t border-white/5 pt-2 text-gray-500">
            <span>Diferença:</span>
            <span className={`font-bold ${activeStudent.xp >= classAverageXp ? 'text-emerald-400' : 'text-rose-400'}`}>
              {activeStudent.xp >= classAverageXp ? "+" : ""}
              {activeStudent.xp - classAverageXp} XP
            </span>
          </div>
        </div>

        {/* Card 3: Precisão Reciproca */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest">Precisão Global</span>
            <Target className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-sans font-black text-white tracking-tight mt-2">
            {activeStudent.precisao || 0}%
          </p>
          <div className="flex justify-between items-center mt-3 text-[9px] font-mono border-t border-white/5 pt-2 text-gray-500">
            <span>Meta Recomendada:</span>
            <span className="text-gray-300 font-bold">90%</span>
          </div>
        </div>

        {/* Card 4: Focus Conduct Metric */}
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/20 hover:border-white/10 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-gray-450 uppercase tracking-widest">Controle de Saídas</span>
            <Brain className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-sans font-black text-white tracking-tight mt-2">
            {activeStudent.saidasTela || 0}{" "}
            <span className="text-xs font-mono font-normal text-gray-400">/ 7</span>
          </p>
          <div className="flex justify-between items-center mt-3 text-[9px] font-mono border-t border-white/5 pt-2 text-gray-500">
            <span>Status conduta:</span>
            <span className={`font-bold uppercase ${
              (activeStudent.saidasTela || 0) >= 5 ? 'text-rose-450 animate-pulse' : 'text-emerald-400'
            }`}>
              {(activeStudent.saidasTela || 0) >= 7 ? "Travado" : (activeStudent.saidasTela || 0) >= 5 ? "Risco de Bloqueio" : "Foco Excelente"}
            </span>
          </div>
        </div>
      </div>

      {/* PARALLEL EXAM GRADE (FASE -1 or 0) CARD */}
      {(() => {
        const isFaseM1 = activeStudent.faseAtual === -1;
        const isFase0 = activeStudent.faseAtual === 0;
        
        if (!isFaseM1 && !isFase0) return null;

        const phaseId = activeStudent.faseAtual;
        const phaseChallenges = CHALLENGES_DATA.filter(c => c.fase === phaseId);
        const solvedCount = phaseChallenges.filter(id => activeStudent.respostasDesafios?.[id.id] === true).length;
        const totalCount = phaseChallenges.length || 1;
        const examGrade = ((solvedCount / totalCount) * 10).toFixed(1);
        const phaseLabel = isFaseM1 ? "Fase -1 (Revisão)" : "Fase 0 (Pré-Cadastro)";
        
        return (
          <div className="bg-gradient-to-r from-cyan-950/40 via-blue-950/40 to-indigo-950/40 border border-[#00E5FF]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-cyan-950/10 animate-fade-in">
            <div className="flex items-center gap-3.5">
              <span className="text-3xl filter drop-shadow">📝</span>
              <div className="text-left">
                <h4 className="text-sm font-sans font-extrabold text-gray-100 uppercase tracking-tight flex items-center gap-2">
                  <span>Nota de Prova Oficial — {phaseLabel}</span>
                  <span className="text-[9px] bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-400/25 font-mono">PARALELA</span>
                </h4>
                <p className="text-xs text-text-secondary mt-1 leading-relaxed max-w-xl">
                  Calculada dinamicamente com base nas transmissões sem erro efetuadas aos {totalCount} módulos teóricos de homologação CLT e e-Social.
                </p>
                <div className="text-[10px] text-gray-400 font-mono mt-2 flex items-center gap-2">
                  <span>Progresso da Prova:</span>
                  <strong className="text-white">{solvedCount} de {totalCount} desafios corretos</strong>
                  <span>•</span>
                  <span className="text-emerald-400">Precisão de Fase: {((solvedCount / totalCount) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1.5 bg-[#00E5FF]/5 border border-[#00E5FF]/25 px-5 py-2.5 rounded-2xl shadow-inner shrink-0 group hover:border-[#00E5FF]/50 transition-all select-none">
              <span className="text-[10.5px] text-cyan-400/80 font-mono font-bold uppercase tracking-wider">Nota Prova:</span>
              <span className="text-3xl font-mono font-black text-[#00E5FF] tracking-tighter">
                {examGrade}
              </span>
              <span className="text-xs text-cyan-400/80 font-mono font-bold">/ 10.0</span>
            </div>
          </div>
        );
      })()}

      {/* CORE STATS CHART BOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Recharts interactive line/area chart */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/10 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-mono font-black text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
              <span>● PROJEÇÃO DE CURVA DE XP POR CARGO/FASE</span>
            </h3>
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-950 font-mono text-gray-500">
              RECHARTS COMPLIANCE MODULE
            </span>
          </div>

          <div className="h-[280px] w-full font-mono text-[9px] text-gray-400">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorMyXp" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClass" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorMarket" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.05} />
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff08" />
                <XAxis 
                  dataKey="label" 
                  stroke="#ffffff30" 
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 7 }}
                />
                <YAxis 
                  stroke="#ffffff30" 
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 8 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1329",
                    borderColor: "rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    color: "#fff",
                    fontFamily: "monospace",
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
                
                {/* Meta Recomendada */}
                <Area
                  type="monotone"
                  dataKey="Meta do Mercado"
                  stroke="#4f46e5"
                  strokeDasharray="4 4"
                  fillOpacity={1}
                  fill="url(#colorMarket)"
                />
                {/* Classe */}
                <Area
                  type="monotone"
                  dataKey="Média da Turma"
                  stroke="#10b981"
                  fillOpacity={1}
                  fill="url(#colorClass)"
                />
                {/* Meu XP connected */}
                <Area
                  type="monotone"
                  dataKey="Seu XP"
                  stroke="#8b5cf6"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#colorMyXp)"
                  connectNulls
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Phase-by-Phase detailed scorecard table */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/10 space-y-4">
          <h3 className="text-xs font-mono font-black text-gray-200 uppercase tracking-widest flex items-center gap-1.5 border-b border-white/5 pb-2">
            <span>📋 Scorecard de Metas por Fase</span>
          </h3>
          
          <div className="space-y-2.5 max-h-[265px] overflow-y-auto pr-1">
            {CAREER_PHASES.map((ph) => {
              const refItem = REFERENCE_XP_CURVE.find((c) => c.pId === ph.id);
              const isLocked = activeStudent.faseAtual < ph.id;
              const isCurrent = activeStudent.faseAtual === ph.id;
              const isPassed = activeStudent.faseAtual > ph.id;

              return (
                <div 
                  key={ph.id}
                  className={`p-2 rounded-lg border text-left font-mono text-[10px] space-y-1 transition-all ${
                    isCurrent 
                      ? "bg-accent-primary/5 border-accent-primary/30" 
                      : isPassed
                        ? "bg-slate-950/40 border-emerald-500/15"
                        : "bg-slate-950/20 border-white/5 opacity-60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-gray-200">
                      {ph.id}. {ph.cargo}
                    </span>
                    {isPassed ? (
                      <span className="text-[8px] font-sans font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1 py-0.2 rounded uppercase">
                        Concluído
                      </span>
                    ) : isCurrent ? (
                      <span className="text-[8px] font-sans font-bold bg-accent-primary/20 text-accent-primary px-1 py-0.2 rounded uppercase animate-pulse">
                        Sua Fase
                      </span>
                    ) : (
                      <span className="text-[8px] font-sans font-bold bg-slate-900 text-gray-500 px-1 py-0.2 rounded uppercase">
                        Bloqueado
                      </span>
                    )}
                  </div>

                  <p className="text-[9px] text-gray-400 truncate font-sans">
                    {ph.moduloTecnico}
                  </p>

                  <div className="flex justify-between text-[8px] text-gray-500 border-t border-white/5 pt-1.5">
                    <span>Meta de Ref: <strong className="text-gray-300">{refItem?.refXp} XP</strong></span>
                    <span>Qtd Desafios: <strong className="text-gray-300">{ph.totalDesafios}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* SESSION HISTORY AND COMPLIANCE AUDIT TIMELINE */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/10 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-4">
          <div className="space-y-1 text-left">
            <h3 className="text-xs font-mono font-black text-gray-250 uppercase tracking-widest flex items-center gap-1.5">
              <History className="w-5 h-5 text-indigo-400" />
              <span>● HISTÓRICO DE SESSÃO E AUDITORIA LEGISLATIVA</span>
            </h3>
            <p className="text-xs text-text-secondary leading-normal">
              Controle de auditoria em tempo real dos marcos de carreira, recompensas de streak e eventos de conduta operacional.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2 py-0.5 rounded bg-slate-950 font-mono text-gray-500 border border-white/5">
              E-SOCIAL EVENT LOGS
            </span>
          </div>
        </div>

        {/* Dynamic Filters Bar */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950/45 rounded-lg border border-white/5 w-fit">
          <button
            type="button"
            onClick={() => setLogFilter("all")}
            className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold rounded-md transition-colors cursor-pointer ${
              logFilter === "all"
                ? "bg-indigo-500 text-slate-950"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Todos ({compiledLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setLogFilter("promotion")}
            className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold rounded-md transition-colors cursor-pointer ${
              logFilter === "promotion"
                ? "bg-purple-500/25 text-purple-300 border border-purple-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Carreira ({compiledLogs.filter(l => l.type === "promotion").length})
          </button>
          <button
            type="button"
            onClick={() => setLogFilter("achievement")}
            className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold rounded-md transition-colors cursor-pointer ${
              logFilter === "achievement"
                ? "bg-amber-500/20 text-yellow-300 border border-amber-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Conquistas ({compiledLogs.filter(l => l.type === "achievement").length})
          </button>
          <button
            type="button"
            onClick={() => setLogFilter("penalty")}
            className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold rounded-md transition-colors cursor-pointer ${
              logFilter === "penalty"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/20"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Alertas ({compiledLogs.filter(l => l.type === "penalty").length})
          </button>
          <button
            type="button"
            onClick={() => setLogFilter("challenge")}
            className={`px-3 py-1.5 text-[10px] uppercase font-mono font-bold rounded-md transition-colors cursor-pointer ${
              logFilter === "challenge"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/10"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Casos ({compiledLogs.filter(l => l.type === "challenge").length})
          </button>
        </div>

        {/* Timeline Event Feed */}
        <div id="session-history-timeline" className="space-y-2.5 max-h-[350px] overflow-y-auto pr-1">
          {filteredLogs.length === 0 ? (
            <div className="text-center py-10 rounded-xl border border-dashed border-white/5 text-gray-500 font-mono text-xs">
              Nenhum evento registrado nesta aba de auditoria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              let IconComponent = History;
              let iconColorClass = "text-sky-400";
              let itemBorderClass = "border-white/5 bg-slate-950/20";
              
              if (log.type === "promotion") {
                IconComponent = Award;
                iconColorClass = "text-purple-400";
                itemBorderClass = "border-purple-500/15 bg-purple-500/5";
              } else if (log.type === "achievement") {
                IconComponent = Trophy;
                iconColorClass = "text-amber-400";
                itemBorderClass = "border-amber-500/15 bg-amber-500/5";
              } else if (log.type === "penalty") {
                IconComponent = AlertTriangle;
                iconColorClass = "text-rose-450 animate-pulse";
                itemBorderClass = "border-rose-500/15 bg-rose-500/5";
              } else if (log.type === "challenge") {
                IconComponent = FileText;
                iconColorClass = "text-emerald-400";
                itemBorderClass = "border-emerald-500/10 bg-emerald-500/5";
              } else {
                IconComponent = Activity;
                iconColorClass = "text-sky-400";
                itemBorderClass = "border-sky-505/10 bg-sky-500/5";
              }

              return (
                <div
                  key={log.id}
                  className={`flex gap-3.5 p-3.5 rounded-xl border transition-all ${itemBorderClass} hover:border-white/10 text-left`}
                >
                  {/* Left Icon Panel */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-slate-950/60 border border-white/5 flex items-center justify-center">
                    <IconComponent className={`w-4 h-4 ${iconColorClass}`} />
                  </div>
                  
                  {/* Main content */}
                  <div className="flex-grow space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-sans font-bold text-gray-200 text-xs sm:text-sm">
                          {log.title}
                        </span>
                        <span className={`text-[9px] px-1.5 py-0.2 rounded border font-mono uppercase font-black ${log.badgeStyle}`}>
                          {log.badgeText}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                        {log.xpString && (
                          <span className="text-[9px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                            {log.xpString}
                          </span>
                        )}
                        <span className="text-[9px] font-mono text-gray-500 bg-slate-950/50 px-2 py-0.5 rounded">
                          {log.timestamp}
                        </span>
                      </div>
                    </div>
                    <p className="text-[11px] text-text-secondary leading-relaxed font-sans font-normal">
                      {log.desc}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* EDUCATIONAL LEGEND FOOTER */}
      <div className="bg-emerald-950/15 border border-emerald-500/10 p-4 rounded-xl flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="text-left font-sans text-xs space-y-1">
          <p className="font-black text-gray-200">Como funciona a Progressão de XP?</p>
          <p className="text-gray-400 leading-relaxed text-[11px]">
            Para avançar de cargos como <strong>Estagiário</strong>, <strong>Assistente</strong> e <strong>Gerente</strong>, você precisa completar os e-Social checks de cada fase, mantendo uma precisão mínima acumulada (ex: 100% no pré-cadastro). A média de mercado reflete o aprendizado teórico sugerido, e a média de classe mostra o ritmo real de seus colegas. Fique atento às saídas de foco operacionais para evitar punições ou bloqueios de tela que zeram seu andamento!
          </p>
        </div>
      </div>
    </div>
  );
}
