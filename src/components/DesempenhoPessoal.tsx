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
} from "lucide-react";

interface DesempenhoPessoalProps {
  activeStudent: Student;
  students: Student[];
}

export default function DesempenhoPessoal({
  activeStudent,
  students,
}: DesempenhoPessoalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"efficiency" | "skills" | "certification">("efficiency");

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

  return (
    <div className="space-y-6 text-left animate-fade-in font-sans">
      
      {/* HEADER SECTION */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/15 bg-gradient-to-br from-slate-900/60 to-indigo-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-indigo-500/10 px-3.5 py-1 text-[10px] rounded-bl text-indigo-400 font-bold uppercase tracking-wider font-mono">
          Painel de Desempenho v2.1
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
      )}

      {activeSubTab === "certification" && (
        <div className="glass-panel p-6 rounded-2xl border border-indigo-550/20 bg-indigo-950/5 space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start justify-between border-b border-indigo-500/10 pb-4">
            <div className="space-y-1 text-left">
              <h3 className="text-sm font-bold text-gray-100 uppercase tracking-wide flex items-center gap-1.5">
                <FileBadge className="w-5 h-5 text-sky-400" /> Espaço de Certificação de Veteranos
              </h3>
              <p className="text-xs text-text-secondary leading-normal">
                Prancheta de auditoria dedicada para testadores homologados de rotinas do WorkSim.
              </p>
            </div>

            <div className="bg-sky-500/10 text-sky-400 border border-sky-400/20 text-[10px] font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5 animate-bounce" /> MAT: {activeStudent.matricula}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs leading-relaxed text-left">
            <div className="space-y-4">
              <div className="p-4 bg-slate-950/45 rounded-xl border border-white/5 space-y-2">
                <h4 className="font-bold text-xs uppercase text-gray-250 font-mono tracking-wider flex items-center gap-1">
                  💡 Status de Homologação de CBO
                </h4>
                <p className="text-gray-400 text-[11px]">
                  CBO ativo associado atualmente: <strong>{activeStudent.cargo}</strong>. Para as rotinas de conformidade de guias no e-Social de admissão e rescisão documental, as verbas de adicinal de periculosidade e adicionais noturnos calculam incidências automáticas parametrizadas.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] font-mono pt-1 text-gray-450">
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> CLT: OK (Fiel)</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Sindicato: OK</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Guias FGTS: OK</span>
                  <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-sky-500" /> Dispositivo: iOS/Web</span>
                </div>
              </div>

              <div className="p-4 bg-slate-950/45 rounded-xl border border-white/5 space-y-2">
                <h4 className="font-bold text-xs uppercase text-gray-250 font-mono tracking-wider">
                  ⚠️ Metodologia de Punição Involuntária
                </h4>
                <p className="text-gray-400 text-[11px]">
                  Para evitar trapaças e garantir o real aprendizado da legislação trabalhista, o WorkSim utiliza o sensor virtual de foco. Sair da tela para pesquisar com Inteligência Artificial externa reduz gradualmente o seu multiplicador de bônus na tela principal de desafios de 3.0x para até 0.5x. Mantenha o foco ativo!
                </p>
              </div>
            </div>

            {/* Premium Simulated Virtual Boarding pass for tester credential */}
            <div className="flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950 border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-indigo-500/10 text-indigo-400 text-[8px] font-mono px-2 py-0.5 rounded-bl font-bold uppercase tracking-widest border-l border-b border-indigo-500/15">
                VETERANO HOMOLOGADO
              </div>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-sky-500 flex items-center justify-center text-slate-950 font-bold text-lg select-none">
                    WS
                  </div>
                  <div>
                    <h4 className="font-black text-white text-sm uppercase leading-tight font-mono">WorkSim RH Certification</h4>
                    <span className="text-[9.5px] text-sky-400 font-mono">Acreditação Fictícia para Docência</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3.5 border-t border-b border-white/5 py-4 font-mono text-[10px]">
                  <div>
                    <span className="text-[8.5px] text-gray-500 block uppercase font-sans">Estudante Testador</span>
                    <strong className="text-gray-350">{activeStudent.nomeCompleto}</strong>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-gray-500 block uppercase font-sans">Turma Registrada</span>
                    <strong className="text-gray-350">{activeStudent.sala} ({activeStudent.ano})</strong>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-gray-500 block uppercase font-sans">XP Acumulado</span>
                    <strong className="text-emerald-400 font-bold">{activeStudent.xp} XP</strong>
                  </div>
                  <div>
                    <span className="text-[8.5px] text-gray-500 block uppercase font-sans">Precisão e-Social</span>
                    <strong className="text-indigo-400 font-bold">{precision}%</strong>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-[8.5px] text-gray-500 font-mono mt-3">
                <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                <span>Emitido por Mestre Fábio em {new Date().toLocaleDateString("pt-BR")}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
