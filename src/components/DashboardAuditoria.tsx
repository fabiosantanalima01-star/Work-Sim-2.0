/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell
} from "recharts";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { 
  Activity, 
  ShieldAlert, 
  UserX, 
  TrendingUp, 
  Clock, 
  FileText,
  AlertTriangle
} from "lucide-react";
import { Student } from "../types";

interface DashboardAuditoriaProps {
  students: Student[];
}

interface ActivityLog {
  id: string;
  studentId: string;
  studentName: string;
  type: string;
  action: string;
  details: string;
  timestamp: string;
}

export default function DashboardAuditoria({ students }: DashboardAuditoriaProps) {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<"1h" | "6h" | "24h" | "all">("all");

  useEffect(() => {
    setIsLoading(true);
    const q = query(
      collection(db, "logs"),
      orderBy("timestamp", "desc"),
      limit(200)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[];
      setLogs(fetchedLogs);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching logs for audit dashboard:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // --- DATA PROCESSING FOR CHARTS ---

  // 1. Time Series: Activity Count by hour/minute
  const processTimeSeriesData = () => {
    if (logs.length === 0) return [];

    const groupedData: Record<string, { time: string; focusLoss: number; total: number }> = {};
    
    // Reverse to process from oldest to newest for the chart
    [...logs].reverse().forEach(log => {
      const date = new Date(log.timestamp);
      // Format as HH:mm
      const timeStr = `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
      
      if (!groupedData[timeStr]) {
        groupedData[timeStr] = { time: timeStr, focusLoss: 0, total: 0 };
      }
      
      groupedData[timeStr].total += 1;
      if (log.type === "focus-loss") {
        groupedData[timeStr].focusLoss += 1;
      }
    });

    return Object.values(groupedData);
  };

  // 2. Ranking: Students with most focus losses
  const processFocusLossByStudent = () => {
    const counts: Record<string, { name: string; count: number }> = {};
    
    logs.filter(l => l.type === "focus-loss").forEach(log => {
      if (!counts[log.studentId]) {
        counts[log.studentId] = { name: log.studentName, count: 0 };
      }
      counts[log.studentId].count += 1;
    });

    return Object.values(counts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  };

  const timeSeriesData = processTimeSeriesData();
  const studentFocusData = processFocusLossByStudent();

  const totalFocusLosses = logs.filter(l => l.type === "focus-loss").length;
  const totalLogs = logs.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header & Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Eventos Totais</span>
          </div>
          <div className="text-2xl font-black text-white">{totalLogs}</div>
          <div className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-tighter">Últimos 200 registros</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-rose-500/20 bg-rose-500/5">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-4 h-4 text-rose-500" />
            <span className="text-[10px] font-mono font-bold text-rose-500/70 uppercase tracking-wider">Saídas de Tela</span>
          </div>
          <div className="text-2xl font-black text-white">{totalFocusLosses}</div>
          <div className="text-[9px] text-rose-500/50 font-mono mt-1 uppercase tracking-tighter">Tentativas de desvio detectadas</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Frequência</span>
          </div>
          <div className="text-2xl font-black text-white">
            {totalLogs > 0 ? (totalLogs / (logs.length > 1 ? (new Date(logs[0].timestamp).getTime() - new Date(logs[logs.length-1].timestamp).getTime()) / 3600000 : 1)).toFixed(1) : 0}
            <span className="text-xs text-gray-500 ml-1">evt/h</span>
          </div>
          <div className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-tighter">Taxa de log por hora</div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-white/5 bg-slate-900/40">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px] font-mono font-bold text-gray-500 uppercase tracking-wider">Eficiência</span>
          </div>
          <div className="text-2xl font-black text-white">
            {totalLogs > 0 ? Math.round(((totalLogs - totalFocusLosses) / totalLogs) * 100) : 100}%
          </div>
          <div className="text-[9px] text-gray-500 font-mono mt-1 uppercase tracking-tighter">Taxa de conformidade</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-sky-400" />
              </div>
              <h3 className="text-sm font-sans font-black text-white uppercase tracking-widest">Série Temporal de Atividades</h3>
            </div>
            <div className="flex gap-2">
              <div className="h-2 w-2 rounded-full bg-sky-500"></div>
              <span className="text-[9px] font-mono text-gray-400 uppercase">Frequência Global</span>
            </div>
          </div>
          
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                <XAxis 
                  dataKey="time" 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                  minTickGap={30}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={10} 
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#0f172a", 
                    borderRadius: "12px", 
                    border: "1px solid rgba(255,255,255,0.1)",
                    fontSize: "10px",
                    fontFamily: "monospace"
                  }}
                  itemStyle={{ padding: "2px 0" }}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', textTransform: 'uppercase', fontFamily: 'monospace' }} />
                <Line 
                  name="Eventos Totais"
                  type="monotone" 
                  dataKey="total" 
                  stroke="#38bdf8" 
                  strokeWidth={3} 
                  dot={{ r: 2, fill: "#38bdf8", strokeWidth: 0 }}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  animationDuration={1500}
                />
                <Line 
                  name="Saídas de Tela"
                  type="monotone" 
                  dataKey="focusLoss" 
                  stroke="#ef4444" 
                  strokeWidth={2} 
                  strokeDasharray="5 5"
                  dot={false}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Focus Loss Ranking */}
        <div className="glass-panel p-6 rounded-2xl border border-white/10 bg-slate-900/60 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-rose-500/10 rounded-lg">
              <UserX className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="text-sm font-sans font-black text-white uppercase tracking-widest">Top Saídas de Tela por Aluno</h3>
          </div>

          <div className="h-[300px] w-full">
            {studentFocusData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart layout="vertical" data={studentFocusData} margin={{ left: 20, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    stroke="#94a3b8" 
                    fontSize={10} 
                    width={100}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                    contentStyle={{ 
                      backgroundColor: "#0f172a", 
                      borderRadius: "12px", 
                      border: "1px solid rgba(255,255,255,0.1)",
                      fontSize: "10px",
                      fontFamily: "monospace"
                    }}
                  />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={20}>
                    {studentFocusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? "#ef4444" : "#f43f5e"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-2 opacity-50">
                <AlertTriangle className="w-8 h-8" />
                <p className="text-[10px] font-mono uppercase">Nenhum desvio detectado</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Detailed Logs */}
      <div className="glass-panel rounded-2xl border border-white/10 bg-slate-900/40 overflow-hidden shadow-xl">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" />
            <h4 className="text-[10px] font-mono font-bold text-white uppercase tracking-widest">Logs de Auditoria Recentes</h4>
          </div>
          <span className="text-[9px] font-mono text-gray-500 uppercase tracking-tighter">Histórico Real-time</span>
        </div>
        
        <div className="max-h-[300px] overflow-y-auto overflow-x-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-slate-900 border-b border-white/5">
              <tr className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-wider">
                <th className="px-4 py-3">Horário</th>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Ação / Detalhes</th>
              </tr>
            </thead>
            <tbody className="text-[10px] font-mono">
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="px-4 py-2.5 text-gray-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </td>
                  <td className="px-4 py-2.5 text-white font-bold whitespace-nowrap">{log.studentName}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase ${
                      log.type === "focus-loss" ? "bg-rose-500/20 text-rose-400 border border-rose-500/30" : 
                      log.type === "challenge-completion" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                      "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                    }`}>
                      {log.type}
                    </span>
                  </td>
                  <td className="px-4 py-2.5 text-gray-400 truncate max-w-xs" title={log.details}>
                    <span className="text-white/70 font-bold mr-2">[{log.action}]</span>
                    {log.details}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && !isLoading && (
                <tr>
                  <td colSpan={4} className="px-4 py-10 text-center text-gray-600 uppercase italic">Nenhum log encontrado no sistema</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
