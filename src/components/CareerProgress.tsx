/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion } from "motion/react";
import { CareerPhase, Student, Challenge } from "../types";
import { CAREER_PHASES, CHALLENGES_DATA } from "../data";
import { 
  Award, Lock, Unlock, PlayCircle, CheckCircle2, TrendingUp, Zap, Clock, Bookmark, 
  HelpCircle, Search, ChevronRight, Activity, GitFork, Cpu, BookOpen, ShieldCheck, Scale, Terminal, Check, AlertCircle, Sparkles
} from "lucide-react";

interface CareerProgressProps {
  currentPhaseId: number;
  unlockedPhases: number[];
  student: Student;
  onSelectPhase: (phaseId: number) => void;
  completedChallengesCount: number;
}

export default function CareerProgress({
  currentPhaseId,
  unlockedPhases,
  student,
  onSelectPhase,
  completedChallengesCount
}: CareerProgressProps) {
  // Computed metrics
  const totalCompletes = completedChallengesCount;
  const accuracyText = student.precisao > 0 ? `${student.precisao}%` : "95%";

  // Computed metrics for current active HR training phase
  const trainingPhaseId = student.faseAtual ?? 0;
  const trainingPhaseObj = CAREER_PHASES.find(p => p.id === trainingPhaseId) || CAREER_PHASES[0];
  const trainingPhaseChallenges = CHALLENGES_DATA.filter(c => c.fase === trainingPhaseId);
  const trainingPhaseTotal = trainingPhaseChallenges.length;
  const trainingPhaseCompleted = trainingPhaseChallenges.filter(c => student.respostasDesafios?.[c.id] !== undefined).length;
  const trainingPhasePercentage = trainingPhaseTotal > 0 
    ? Math.round((trainingPhaseCompleted / trainingPhaseTotal) * 100) 
    : 100;

  // Navigation state inside Career Dashboard: "timeline" for traditional list, "skilltree" for dynamic skill tree
  const [activeTab, setActiveTab] = useState<"timeline" | "skilltree">("skilltree");
  
  // Interactive selected node state for Skill Tree
  const [selectedNodeId, setSelectedNodeId] = useState<number>(currentPhaseId);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");

  const activeNode = CAREER_PHASES.find(p => p.id === selectedNodeId) || CAREER_PHASES[0];

  // Computed metrics for activeNode (selected/currently examined)
  const activeNodeChallenges = CHALLENGES_DATA.filter(c => c.fase === activeNode.id);
  const activeNodeTotal = activeNodeChallenges.length;
  const activeNodeCompleted = activeNodeChallenges.filter(c => student.respostasDesafios?.[c.id] !== undefined).length;
  const activeNodePct = activeNodeTotal > 0 ? Math.round((activeNodeCompleted / activeNodeTotal) * 100) : 100;

  // Group phases by departments for a themed skill tree grouping
  const departments = [
    {
      id: "dept-1",
      name: "ONBOARDING & ADMISSÃO",
      description: "Prerrogativas do vínculo (Artº 3 CLT), prazos e formalidades admissionais essenciais.",
      badge: "Nível Básico",
      colorClass: "border-sky-500/20 text-sky-400 bg-sky-500/5",
      glowColor: "shadow-sky-500/5",
      phases: [0, 1]
    },
    {
      id: "dept-2",
      name: "CONFORMIDADE & AUDITORIA CLT",
      description: "Fechamento de ponto diário, fraudes em atestados de saúde e auditorias de afastamento.",
      badge: "Nível Intermediário",
      colorClass: "border-purple-500/20 text-purple-400 bg-purple-500/5",
      glowColor: "shadow-purple-500/5",
      phases: [2, 3]
    },
    {
      id: "dept-3",
      name: "OPERAÇÕES ESPEVECIALIZADAS",
      description: "Contratos intermitentes, temporários e indenizações rescisórias diretas em folha.",
      badge: "Nível Avançado",
      colorClass: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
      glowColor: "shadow-emerald-500/5",
      phases: [4, 5]
    },
    {
      id: "dept-4",
      name: "DIRETORIA DE GENTE & GOVERNANÇA",
      description: "Prevenção de passivos milionários, readequação funcional e inteligência em CBO CLT.",
      badge: "Executivo",
      colorClass: "border-amber-500/20 text-amber-500 bg-amber-500/5",
      glowColor: "shadow-amber-500/5",
      phases: [6, 7]
    }
  ];

  // Get challenges associated with a given phase
  const getChallengesForPhase = (phaseId: number) => {
    return CHALLENGES_DATA.filter(c => c.fase === phaseId);
  };

  // Helper descriptions explaining what unlocking requirements are for the specific phases/roles
  const getUnlockRequirementText = (phaseId: number) => {
    switch (phaseId) {
      case 0:
        return "Disponível imediatamente ao iniciar a carreira de homologação CLT.";
      case 1:
        return "Concluir todos os 21 desafios de Pré-Cadastro (Fase 0) com 100% de precisão técnica + Assinar homologação no painel principal.";
      case 2:
        return "Completar a triagem de Fase 1 para liberar a auditoria e homologação das contas vinculadas e saques de FGTS.";
      case 3:
        return "Resolver com sucesso todos os 7 casos de liberação de FGTS de Fase 2 para ter acesso à Mesa de Rescisões (TRCT).";
      case 4:
        return "Dominar e liquidar as 8 folha/TRCTs auditadas na Fase 3 para ser promovido a Contratos Especiais.";
      case 5:
        return "Ter seu desempenho revisado e promovido à coordenação pelo Professor Fábio.";
      case 6:
        return "Mitigar com sucesso fraudes de comissão e dominar cálculos demissionais da Fase 5.";
      case 7:
        return "Alcançar a gerência técnica de compliance de CBOs e auditoria de contratos.";
      default:
        return "Critérios de promoção avaliados continuamente.";
    }
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Core performance stats block */}
      <div id="career-metrics-dashboard" className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 font-mono text-center flex flex-col justify-between">
          <div className="flex justify-center mb-1 text-accent-primary"><Clock className="w-4 h-4" /></div>
          <span className="text-[9px] text-text-secondary block font-bold uppercase">TREINO ATIVO REAL</span>
          <span className="text-xs font-bold text-gray-100 block mt-1">
            {(() => {
              const totalSec = student.tempoAtivoSegundos || 0;
              const hrs = Math.floor(totalSec / 3600);
              const mins = Math.floor((totalSec % 3600) / 60);
              const secs = totalSec % 60;
              return hrs > 0 
                ? `${hrs}h ${String(mins).padStart(2, '0')}m ${String(secs).padStart(2, '0')}s`
                : `${mins}m ${String(secs).padStart(2, '0')}s`;
            })()}
          </span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 font-mono text-center flex flex-col justify-between">
          <div className="flex justify-center mb-1 text-accent-primary"><TrendingUp className="w-4 h-4" /></div>
          <span className="text-[9px] text-text-secondary block font-bold uppercase">PRECISÃO TÉCNICA</span>
          <span className="text-sm font-bold text-emerald-400 block mt-1">{accuracyText}</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 font-mono text-center flex flex-col justify-between">
          <div className="flex justify-center mb-1 text-accent-warning"><Bookmark className="w-4 h-4" /></div>
          <span className="text-[9px] text-text-secondary block font-bold uppercase">FUNDAMENTAÇÃO</span>
          <span className="text-sm font-bold text-gray-200 block mt-1">94% CLT</span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 font-mono text-center flex flex-col justify-between">
          <div className="flex justify-center mb-1 text-accent-error"><Zap className="w-4 h-4 animate-bounce" /></div>
          <span className="text-[9px] text-text-secondary block font-bold uppercase">ACUMULADOR XP</span>
          <span className="text-xs font-bold text-accent-warning block mt-1">
            {(() => {
              const accumSecs = student.tempoAcumuladoXP || 0;
              const accumMins = Math.floor(accumSecs / 60);
              const accumSec = accumSecs % 60;
              return `${accumMins}m ${String(accumSec).padStart(2, '0')}s`;
            })()}
          </span>
          <span className="text-[8px] text-indigo-400 block mt-0.5 font-bold">
            ({student.casosResolvidosNoCiclo || 0} resolvidos)
          </span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 font-mono text-center flex flex-col justify-between">
          <div className="flex justify-center mb-1 text-accent-primary"><Award className="w-4 h-4" /></div>
          <span className="text-[9px] text-text-secondary block font-bold uppercase">COBERTURA CBOS</span>
          <div className="w-full bg-slate-950/80 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <motion.div 
              className="bg-accent-primary h-full" 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (totalCompletes + 2) * 12)}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
          <span className="text-[10px] text-accent-primary font-bold mt-1">
            {Math.min(50, totalCompletes + 2)} / 50 CBOs
          </span>
        </div>
        <div className="glass-panel p-3.5 rounded-xl border border-white/5 font-mono text-center flex flex-col justify-between items-center bg-slate-900/10">
          <div className="flex justify-center mb-1 text-cyan-400"><Unlock className="w-4 h-4" /></div>
          <span className="text-[9px] text-text-secondary block font-bold uppercase whitespace-nowrap">PROGRESSO DO CARGO</span>
          <div className="relative flex items-center justify-center w-12 h-12 my-1">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="24"
                cy="24"
                r="18"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="3"
                fill="transparent"
              />
              <motion.circle
                cx="24"
                cy="24"
                r="18"
                stroke="#00E5FF"
                strokeWidth="3.5"
                fill="transparent"
                strokeDasharray={2 * Math.PI * 18}
                initial={{ strokeDashoffset: 2 * Math.PI * 18 }}
                animate={{ strokeDashoffset: 2 * Math.PI * 18 - (activeNodePct / 100) * (2 * Math.PI * 18) }}
                transition={{ duration: 1, ease: "easeOut" }}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className="text-[11px] font-bold text-white leading-none">{activeNodePct}%</span>
            </div>
          </div>
          <span className="text-[10px] text-emerald-400 font-bold block whitespace-nowrap leading-none">
            {activeNodeCompleted}/{activeNodeTotal} Casos
          </span>
        </div>
      </div>

      {/* Selector Tabs at the peak */}
      <div className="flex justify-center md:justify-start items-center p-1 bg-slate-950/50 border border-white/5 rounded-xl max-w-fit font-sans">
        <button
          type="button"
          onClick={() => setActiveTab("skilltree")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "skilltree"
              ? "bg-accent-primary text-slate-950 font-black shadow-lg"
              : "text-text-secondary hover:text-white"
          }`}
        >
          <GitFork className="w-3.5 h-3.5" />
          Árvore de Habilidades (Skill Tree)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("timeline")}
          className={`px-4 py-2 text-xs font-medium rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === "timeline"
              ? "bg-accent-primary text-slate-950 font-black shadow-lg"
              : "text-text-secondary hover:text-white"
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Linha do Tempo
        </button>
      </div>

      {/* VIEW A: INTERACTIVE GRAPH/SKILL TREE */}
      {activeTab === "skilltree" && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-fade-in text-left">
          
          {/* Left / Middle: The visual Branching Map */}
          <div className="xl:col-span-2 space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
              <div className="flex justify-between items-start flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-sans font-extrabold text-gray-100 uppercase tracking-widest flex items-center gap-2">
                    <span>🌿</span> ÁRVORE DE DESENVOLVIMENTO DE COMPETÊNCIAS
                  </h3>
                  <p className="text-xs text-text-secondary mt-1">
                    Visualize o percurso de promoção trabalhista. Clique sobre os cargos para detalhar e planejar quais desafios específicos de conformidade (Compliance CLT) liberam as seguintes competências e promoções.
                  </p>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 rounded-lg text-emerald-400 font-mono text-[10px] uppercase font-bold border border-emerald-500/15">
                  <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                  Visualizador Técnico
                </div>
              </div>

              {/* Department Block Flow */}
              <div className="relative space-y-8 pt-4 pb-2">
                
                {/* Visual Connector vertical line */}
                <div className="absolute left-[34px] top-6 bottom-6 w-0.5 bg-gradient-to-b from-sky-500/40 via-purple-500/30 to-slate-800/20 hidden md:block" />

                {departments.map((dept, dIdx) => {
                  return (
                    <div 
                      key={dept.id} 
                      className={`relative md:pl-16 space-y-3 p-4 md:p-0 rounded-xl md:bg-transparent ${
                        selectedNodeId !== null && dept.phases.includes(selectedNodeId) 
                          ? "bg-white/[0.02]" 
                          : ""
                      }`}
                    >
                      {/* Department Descriptor Pin */}
                      <div className="flex items-center gap-3">
                        <div className={`hidden md:flex absolute left-5 w-7 h-7 rounded-lg border flex-items border-white/15 bg-slate-950 font-mono text-center text-xs font-black items-center justify-center text-text-secondary`}>
                          {dIdx + 1}
                        </div>
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-sans font-black text-[10.5px] uppercase tracking-widest text-gray-300">
                              {dept.name}
                            </span>
                            <span className={`text-[8.5px] px-2 py-0.2 rounded font-mono font-bold border uppercase tracking-wider ${dept.colorClass}`}>
                              {dept.badge}
                            </span>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-snug max-w-xl">
                            {dept.description}
                          </p>
                        </div>
                      </div>

                      {/* Horizontal list of phase nodes inside this department */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                        {dept.phases.map((phaseId) => {
                          const phase = CAREER_PHASES.find(p => p.id === phaseId);
                          if (!phase) return null;

                          const isUnlocked = unlockedPhases.includes(phaseId);
                          const isCurrent = currentPhaseId === phaseId;
                          const isSelected = selectedNodeId === phaseId;
                          
                          // Count challenges completed vs total
                          const chList = getChallengesForPhase(phaseId);
                          const totalCh = chList.length;
                          const completedCh = chList.filter(c => student.respostasDesafios?.[c.id] !== undefined).length;
                          const correctCh = chList.filter(c => student.respostasDesafios?.[c.id] === true).length;
                          
                          // Parent unlock assessment
                          const nextPhaseRequirement = phaseId === 0 
                            ? "Complete os 8 casos" 
                            : phaseId === 1 
                            ? "Feche o simulador (31 cases)" 
                            : phaseId === 2 
                            ? "Audite todos os pontos" 
                            : "Aprovação do Comitê CLT";

                          let isAllDone = totalCh > 0 && completedCh === totalCh;

                          return (
                            <div
                              key={phaseId}
                              onClick={() => setSelectedNodeId(phaseId)}
                              className={`relative p-4 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between group ${
                                isSelected
                                  ? "bg-indigo-950/20 border-accent-primary shadow-[0_0_15px_rgba(0,229,255,0.08)] scale-[1.01]"
                                  : isCurrent
                                  ? "bg-slate-900/30 border-cyan-500/40 hover:border-cyan-400"
                                  : isUnlocked
                                  ? "bg-slate-950/40 border-white/5 hover:bg-slate-900/40 hover:border-white/10"
                                  : "bg-black/40 border-white/5 opacity-55 hover:opacity-70"
                              }`}
                            >
                              {/* Highlight glow ring for active selection */}
                              {isCurrent && (
                                <span className="absolute -top-1.5 -right-1.5 flex h-3 w-3">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
                                </span>
                              )}

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg border text-xs font-mono font-bold ${
                                      isCurrent 
                                        ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400"
                                        : isUnlocked 
                                        ? "bg-slate-900 border-white/10 text-emerald-400"
                                        : "bg-slate-950 border-white/5 text-gray-500"
                                    }`}>
                                      {isUnlocked ? (
                                        isAllDone ? (
                                          <Check className="w-3 h-3 text-emerald-400" />
                                        ) : (
                                          <Unlock className="w-3 h-3" />
                                        )
                                      ) : (
                                        <Lock className="w-3 h-3" />
                                      )}
                                    </div>
                                    <span className="text-[10px] font-mono text-text-secondary uppercase tracking-widest">
                                      FASE {phaseId}
                                    </span>
                                  </div>
                                  
                                  {totalCh > 0 ? (
                                    <span className="text-[10px] font-mono font-semibold text-text-secondary">
                                      {completedCh}/{totalCh} Casos ({Math.round((completedCh/totalCh)*100)}%)
                                    </span>
                                  ) : (
                                    <span className="text-[9px] font-mono text-gray-550 border border-white/5 px-1.5 py-0.2 rounded bg-black/20">
                                      Fase Estratégica
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-0.5 text-left">
                                  <h4 className="font-sans font-extrabold text-xs text-gray-100 group-hover:text-accent-primary uppercase transition-all truncate">
                                    {phase.cargo}
                                  </h4>
                                  <span className="text-[11px] text-text-secondary font-sans block truncate leading-normal">
                                    Módulo: {phase.moduloTecnico}
                                  </span>
                                </div>
                              </div>

                              {/* Progress bar inside Node */}
                              {totalCh > 0 ? (
                                <div className="mt-3.5 space-y-1">
                                  <div className="w-full bg-slate-950/80 h-1 rounded-full overflow-hidden">
                                    <motion.div 
                                      className={`h-full ${
                                        isAllDone 
                                          ? "bg-emerald-500" 
                                          : correctCh > 0 
                                          ? "bg-cyan-500" 
                                          : "bg-slate-800"
                                      }`}
                                      initial={{ width: 0 }}
                                      animate={{ width: `${(completedCh / totalCh) * 100}%` }}
                                      transition={{ duration: 0.8, ease: "easeOut" }}
                                    />
                                  </div>
                                  <div className="flex justify-between items-center text-[9px] font-mono text-gray-550">
                                    <span>Precisão: {phase.precisaoMinima}% req</span>
                                    {isUnlocked && (
                                      <span className="text-emerald-400">✓ Liberado</span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-3.5 pt-1 text-[9px] font-mono text-gray-550 italic border-t border-white/5 flex justify-between items-center">
                                  <span>Bypass por CLT Board</span>
                                  <span className="text-amber-500/80">Regra Executiva 🔑</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>

                    </div>
                  );
                })}

              </div>

            </div>
          </div>

          {/* Right: The dynamic active sub-branch details list panel */}
          <div className="space-y-6">
            <div className="glass-panel p-5 rounded-2xl border border-white/5 bg-slate-900/30 relative overflow-hidden flex flex-col justify-between">
              
              {/* Top Banner decoration */}
              <div className="absolute top-0 right-0 left-0 h-[3px] bg-gradient-to-r from-cyan-500 via-purple-500 to-emerald-500" />
              
              <div className="space-y-4 text-left">
                
                {/* Node heading */}
                <div className="border-b border-white/5 pb-4 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono uppercase bg-slate-950 px-2 py-0.5 rounded text-indigo-400 font-bold">
                        Fase {activeNode.id} • Detalhes da Competência
                      </span>
                    </div>
                    <h3 className="text-base font-sans font-black text-gray-100 uppercase tracking-tight leading-tight mt-1.5 text-balance">
                      {activeNode.cargo}
                    </h3>
                    <span className="text-xs text-accent-primary font-mono block">
                      Módulo Técnico: {activeNode.moduloTecnico}
                    </span>
                  </div>

                  {activeNodeTotal > 0 && (
                    <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0" id="selected-phase-gauge">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="rgba(255, 255, 255, 0.05)"
                          strokeWidth="3.5"
                          fill="transparent"
                        />
                        <motion.circle
                          cx="32"
                          cy="32"
                          r="24"
                          stroke="#00E5FF"
                          strokeWidth="3.5"
                          fill="transparent"
                          strokeDasharray={2 * Math.PI * 24}
                          initial={{ strokeDashoffset: 2 * Math.PI * 24 }}
                          animate={{ strokeDashoffset: 2 * Math.PI * 24 - (activeNodePct / 100) * (2 * Math.PI * 24) }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-[11px] font-bold text-white leading-none">{activeNodePct}%</span>
                        <span className="text-[8px] text-text-secondary mt-0.5 font-mono leading-none">{activeNodeCompleted}/{activeNodeTotal}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Requirements / Info cards */}
                <div className="space-y-3.5 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-1 font-mono text-[11px]">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest block font-bold">🎯 Foco Principal de DP:</span>
                    <span className="text-gray-200 block font-sans font-semibold">
                      {activeNode.focoPrincipal}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-950/50 border border-white/5 space-y-1.5 font-mono text-[11px]">
                    <span className="text-[10px] text-text-secondary uppercase tracking-widest block font-semibold flex items-center gap-1">
                      <Unlock className="w-3 h-3 text-cyan-400" /> REQUISITOS DE PROMOÇÃO:
                    </span>
                    <p className="text-gray-300 leading-normal font-sans">
                      {getUnlockRequirementText(activeNode.id)}
                    </p>
                    <div className="flex gap-4 pt-1 text-[10px] text-gray-500 border-t border-white/5 mt-1.5">
                      <div>
                        Acertos: <strong className="text-gray-300">{activeNode.precisaoMinima}%</strong>
                      </div>
                      <div>
                        Desafios: <strong className="text-gray-300">{activeNode.totalDesafios || "N/A"}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Option to focus / switch to this phase */}
                {unlockedPhases.includes(activeNode.id) && currentPhaseId !== activeNode.id ? (
                  <button
                    type="button"
                    onClick={() => onSelectPhase(activeNode.id)}
                    className="w-full py-2 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-slate-100 font-sans font-extrabold uppercase text-[11px] tracking-wider rounded-xl cursor-pointer hover:shadow-[0_0_12px_rgba(34,211,238,0.25)] transition-all flex items-center justify-center gap-2 mt-2"
                  >
                    <PlayCircle className="w-4 h-4" /> Mudar foco para esta Fase
                  </button>
                ) : currentPhaseId === activeNode.id ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-450 border border-emerald-500/15 text-center font-sans font-bold text-xs flex items-center justify-center gap-2 mt-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Você está focando nesta Fase atual
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-black/30 text-gray-500 border border-white/5 text-center font-mono text-[10.5px] uppercase flex items-center justify-center gap-1.5 mt-2">
                    <Lock className="w-3.5 h-3.5" /> Requisitos de Cargo Pendentes
                  </div>
                )}

                {/* Specific Challenges Leaf list of the Node */}
                <div className="border-t border-white/5 pt-4 mt-6 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-sans font-bold text-gray-200 uppercase tracking-widest flex items-center gap-1.5">
                      <span>🍂</span> Desafios Requeridos ({getChallengesForPhase(activeNode.id).length})
                    </h4>
                  </div>

                  {getChallengesForPhase(activeNode.id).length > 0 ? (
                    <div className="space-y-3">
                      
                      {/* Search & filters for leaf challenges */}
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Buscar lei ou texto..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-950/60 border border-white/10 rounded-lg pl-8 pr-2.5 py-1.5 text-[11px] text-white w-full focus:outline-none focus:border-cyan-500 font-sans"
                          />
                        </div>
                        <select
                          value={statusFilter}
                          onChange={(e: any) => setStatusFilter(e.target.value)}
                          className="bg-slate-950/60 border border-white/10 rounded-lg px-2 py-1.5 text-[11px] text-gray-400 cursor-pointer text-xs focus:outline-none focus:border-cyan-500 font-sans"
                        >
                          <option value="all">Todas</option>
                          <option value="completed">Concluídos</option>
                          <option value="pending">Próximos</option>
                        </select>
                      </div>

                      {/* Display filtered list */}
                      <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
                        {(() => {
                          let list = getChallengesForPhase(activeNode.id);
                          
                          // Filters
                          if (statusFilter === "completed") {
                            list = list.filter(c => student.respostasDesafios?.[c.id] !== undefined);
                          } else if (statusFilter === "pending") {
                            list = list.filter(c => student.respostasDesafios?.[c.id] === undefined);
                          }

                          if (searchQuery.trim() !== "") {
                            const query = searchQuery.toLowerCase();
                            list = list.filter(c => 
                              c.titulo.toLowerCase().includes(query) || 
                              c.id.toLowerCase().includes(query) ||
                              c.focoTecnico.toLowerCase().includes(query)
                            );
                          }

                          if (list.length === 0) {
                            return (
                              <div className="p-6 text-center text-[10.5px] text-text-secondary border border-dashed border-white/5 rounded-xl font-mono">
                                Nenhum caso corresponde aos filtros selecionados.
                              </div>
                            );
                          }

                          return list.map((c) => {
                            const isCorrect = student.respostasDesafios?.[c.id] === true;
                            const isIncorrect = student.respostasDesafios?.[c.id] === false;
                            const isDone = student.respostasDesafios?.[c.id] !== undefined;

                            let statusBadge = (
                              <span className="text-[9px] font-mono text-gray-550 border border-white/5 px-2 py-0.5 rounded bg-black/20 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5 text-gray-650" /> Pendente
                              </span>
                            );

                            if (isCorrect) {
                              statusBadge = (
                                <span className="text-[9px] font-mono text-emerald-450 border border-emerald-500/10 px-2 py-0.5 rounded bg-emerald-500/5 flex items-center gap-1 font-bold">
                                  ✓ Concluído
                                </span>
                              );
                            } else if (isIncorrect) {
                              statusBadge = (
                                <span className="text-[9px] font-mono text-rose-450 border border-rose-500/10 px-1.5 py-0.5 rounded bg-rose-500/5 flex items-center gap-0.5 font-bold">
                                  ✗ Falha Legal
                                </span>
                              );
                            }

                            return (
                              <div 
                                key={c.id} 
                                className={`p-3 rounded-xl border select-none text-left space-y-2 transition-all hover:bg-white/[0.01] ${
                                  isCorrect 
                                    ? "bg-slate-950/20 border-white/5" 
                                    : isIncorrect 
                                    ? "bg-rose-950/5 border-rose-500/10"
                                    : "bg-slate-950/40 border-white/5"
                                }`}
                              >
                                <div className="flex justify-between items-center gap-2 flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-[9.5px] font-mono bg-indigo-500/10 text-indigo-400 font-bold px-1.5 py-0.2 rounded border border-indigo-500/15">
                                      {c.id}
                                    </span>
                                    <span className="text-[9.5px] text-accent-warning font-mono font-bold">
                                      +{c.xpRecompensa} XP
                                    </span>
                                  </div>
                                  {statusBadge}
                                </div>

                                <div className="space-y-1">
                                  <h5 className="font-sans font-bold text-xs text-gray-200 leading-snug">
                                    {c.titulo}
                                  </h5>
                                  <span className="text-[10px] text-text-secondary font-mono block">
                                    Artigo/Foco: <strong className="text-gray-300 font-semibold">{c.focoTecnico || "CLT Geral"}</strong>
                                  </span>
                                </div>

                                {/* Summary preview click snippet */}
                                <p className="text-[10.5px] text-gray-450 italic font-sans leading-relaxed line-clamp-2 bg-black/15 p-2 rounded border border-white/5">
                                  "{c.queixa}"
                                </p>
                              </div>
                            );
                          });
                        })()}
                      </div>

                    </div>
                  ) : (
                    <div className="p-6 text-center rounded-xl bg-slate-950/40 border border-dashed border-white/5 space-y-1.5 text-xs text-text-secondary leading-normal">
                      <p>🔒 Esta fase final é um estágio de diretoria de parcerias e mitigação estratégica.</p>
                      <p className="text-[10.5px] font-mono block text-gray-550 italic">
                        Desbloqueado em tempo real conforme as determinações e banca examinadora do Professor Fábio.
                      </p>
                    </div>
                  )}

                </div>

              </div>
              
            </div>
          </div>

        </div>
      )}

      {/* VIEW B: TRADITIONAL HIGH COMPOSURE ROADMAP LIST */}
      {activeTab === "timeline" && (
        <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4 animate-fade-in">
          <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-widest border-b border-white/5 pb-3">
            Progressão de Carreira Simulada: Global Logística S.A.
          </h3>
          
          <p className="text-xs text-text-secondary font-sans leading-relaxed text-left">
            Prove sua perícia técnica e precisão em cada módulo de DP. Conclua o módulo atual com a assertividade legal mínima exigida para destravar a promoção e herdar o cargo subsequente.
          </p>

          <div className="space-y-3 pt-2">
            {CAREER_PHASES.map((phase) => {
              const isUnlocked = unlockedPhases.includes(phase.id);
              const isCurrent = currentPhaseId === phase.id;
              const isCompleted = phase.id < currentPhaseId;

              return (
                <div
                  id={`career-roadmap-node-${phase.id}`}
                  key={phase.id}
                  onClick={() => {
                    if (isUnlocked) onSelectPhase(phase.id);
                  }}
                  className={`p-4 rounded-xl border transition-all text-left flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCurrent
                      ? "bg-indigo-950/20 border-accent-primary shadow-[0_0_12px_rgba(0,229,255,0.05)] cursor-pointer"
                      : isUnlocked
                      ? "bg-slate-900/40 border-white/5 hover:border-accent-primary/50 cursor-pointer"
                      : "bg-black/40 border-white/5 opacity-60 cursor-not-allowed select-none"
                  }`}
                >
                  {/* Stage information */}
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : isCurrent ? (
                        <PlayCircle className="w-5 h-5 text-accent-primary animate-pulse" />
                      ) : (
                        <Lock className="w-5 h-5 text-text-secondary" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-text-secondary uppercase tracking-widest bg-slate-950 py-0.5 px-2 rounded">
                          Fase {phase.id}
                        </span>
                        <span className="text-xs text-text-secondary font-semibold font-mono">
                          Modulo Tech: {phase.moduloTecnico}
                        </span>
                      </div>
                      <h4 className="font-sans font-bold text-gray-100 text-sm mt-1 uppercase">
                        {phase.cargo}
                      </h4>
                      <span className="text-xs text-text-secondary font-sans block mt-0.5">
                        Foco: {phase.focoPrincipal}
                      </span>
                    </div>
                  </div>

                  {/* Progress bars or lock indications */}
                  <div className="flex items-center gap-4 text-xs font-mono md:text-right md:flex-col md:items-end">
                    <div>
                      <span className="text-text-secondary block text-[10px]">ASSERTIVIDADE MÍNIMA</span>
                      <span className="text-accent-primary font-bold">{phase.precisaoMinima}%</span>
                    </div>
                    <div>
                      <span className="text-text-secondary block text-[10px]">CARGA DE CASOS</span>
                      <span className="text-gray-300 font-semibold">{phase.totalDesafios} Casos</span>
                    </div>
                    {isCurrent && (
                      <span className="bg-accent-primary/10 text-accent-primary font-bold text-[9px] px-2.5 py-0.5 rounded tracking-widest animate-pulse">
                        FASE ATIVA
                      </span>
                    )}
                    {isCompleted && (
                      <span className="bg-emerald-500/10 text-emerald-400 font-bold text-[9px] px-2.5 py-0.5 rounded tracking-widest">
                        ✓ APROVADO
                      </span>
                    )}
                    {!isUnlocked && (
                      <span className="bg-slate-950 text-gray-500 font-bold text-[9px] px-2.5 py-0.5 rounded tracking-widest">
                        🔒 BLOQUEADO
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
}
