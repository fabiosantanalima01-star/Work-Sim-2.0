/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useMemo } from "react";
import { Student } from "../types";
import { db } from "../lib/firebase";
import { collection, onSnapshot, query, orderBy, limit } from "firebase/firestore";
import { Globe, Trophy, Users, Award, Star, TrendingUp, Zap, Target, ShieldCheck, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TournamentTabProps {
  localStudents: Student[];
  appLanguage: "pt" | "en";
}

interface ClassRanking {
  sala: string;
  totalXP: number;
  avgXP: number;
  studentCount: number;
  topStudent: string;
}

export default function TournamentTab({ localStudents, appLanguage }: TournamentTabProps) {
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  // Sync All Students from Firestore for accurate class totals
  useEffect(() => {
    const q = query(
      collection(db, "students")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const students: Student[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        students.push({ id: doc.id, ...data, xp: data.xp || 0 } as Student);
      });
      // Sort in memory to avoid Firestore index requirement for all students
      students.sort((a, b) => (b.xp || 0) - (a.xp || 0));
      setAllStudents(students);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching global ranking:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Derive Top 50 for the individual ranking display
  const globalTopStudents = useMemo(() => {
    return allStudents.slice(0, 50);
  }, [allStudents]);

  // Calculate Interclasses Ranking based on ALL students with normalization and canonical name selection
  const classRankings = useMemo(() => {
    const classGroups: Record<string, { 
      names: Record<string, number>, 
      totalXP: number, 
      studentCount: number, 
      topStudent: string, 
      topXP: number 
    }> = {};
    
    allStudents.forEach(s => {
      const rawSala = (s.sala || "Sem Sala").trim();
      
      // Normalization for grouping (internal key)
      const groupingKey = rawSala.toUpperCase()
        .replace(/[º°.]/g, '')
        .replace(/\s+/g, '')
        .replace(/(\d+)([A-Z])/, '$1 $2') || "SEM SALA";
      
      if (!classGroups[groupingKey]) {
        classGroups[groupingKey] = { 
          names: {}, 
          totalXP: 0, 
          studentCount: 0, 
          topStudent: s.nomeCompleto, 
          topXP: s.xp || 0 
        };
      }
      
      const group = classGroups[groupingKey];
      
      // Track name frequencies to pick the best display name
      const upperName = rawSala.toUpperCase();
      group.names[upperName] = (group.names[upperName] || 0) + 1;
      
      group.totalXP += (s.xp || 0);
      group.studentCount += 1;
      
      if ((s.xp || 0) >= group.topXP) {
        group.topXP = s.xp || 0;
        group.topStudent = s.nomeCompleto;
      }
    });

    const rankings: ClassRanking[] = Object.entries(classGroups).map(([_, data]) => {
      // Pick the most frequent name in the group as the display name
      const bestName = Object.entries(data.names).sort((a, b) => b[1] - a[1])[0][0];
      
      return {
        sala: bestName,
        totalXP: data.totalXP,
        avgXP: data.studentCount > 0 ? Math.round(data.totalXP / data.studentCount) : 0,
        studentCount: data.studentCount,
        topStudent: data.topStudent
      };
    });

    return rankings.sort((a, b) => b.totalXP - a.totalXP);
  }, [allStudents]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* HERO SECTION */}
      <div className="glass-panel rounded-3xl p-8 border border-emerald-500/20 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-emerald-950/20 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] rounded-full -mr-48 -mt-48"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 blur-[100px] rounded-full -ml-48 -mb-48"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-[0.3em]">
              <Globe className="w-3 h-3" />
              <span>Sincronização Global Ativa</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-black tracking-tighter text-white uppercase leading-none">
              Torneio Interclasses <br />
              <span className="text-emerald-400 font-outline-sm">WorkSIM Global</span>
            </h1>
            <p className="text-sm text-gray-400 leading-relaxed font-medium">
              A elite do RH e Legislação Trabalhista em um desafio sem fronteiras. 
              Sua sala contra o mundo, sua competência contra os melhores teclantes da rede.
            </p>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Users className="w-5 h-5 text-sky-400" />
                <div className="text-left leading-none">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Salas Ativas</p>
                  <p className="text-lg font-black text-white">{classRankings.length}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                <Target className="w-5 h-5 text-rose-400" />
                <div className="text-left leading-none">
                  <p className="text-[10px] text-gray-500 uppercase font-bold">Total XP Global</p>
                  <p className="text-lg font-black text-white">
                    {allStudents.reduce((acc, s) => acc + s.xp, 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/30 transition-all duration-700"></div>
            <div className="relative w-48 h-48 lg:w-64 lg:h-64 flex items-center justify-center">
              <Trophy className="w-32 h-32 lg:w-48 lg:h-48 text-emerald-400 drop-shadow-[0_0_30px_rgba(52,211,153,0.5)] animate-pulse" />
              <div className="absolute inset-0 border-4 border-dashed border-emerald-500/20 rounded-full animate-spin-slow"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* INTERCLASSES RANKING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                <Users className="w-4 h-4 text-sky-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Placar Interclasses</h2>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-widest">
              Por Total de XP
            </span>
          </div>

          <div className="glass-panel rounded-3xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-white/5 bg-white/5 grid grid-cols-12 gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <div className="col-span-1 text-center">Pos.</div>
              <div className="col-span-4">Sala / Turma</div>
              <div className="col-span-2 text-center">Alunos</div>
              <div className="col-span-5 text-right">Performance Global</div>
            </div>

            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {classRankings.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-mono text-xs italic">
                  Aguardando dados de simulação global...
                </div>
              ) : (
                classRankings.map((rank, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={rank.sala} 
                    className={`p-4 grid grid-cols-12 gap-4 items-center group hover:bg-white/5 transition-colors ${index === 0 ? 'bg-emerald-500/5' : ''}`}
                  >
                    <div className="col-span-1 flex justify-center">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${
                        index === 0 ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/30' : 
                        index === 1 ? 'bg-sky-500 text-slate-950' :
                        index === 2 ? 'bg-amber-500 text-slate-950' :
                        'bg-white/5 text-gray-400 border border-white/10'
                      }`}>
                        {index + 1}
                      </span>
                    </div>
                    <div className="col-span-4">
                      <p className="text-sm font-black text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                        SALA {rank.sala}
                      </p>
                      <p className="text-[9px] text-gray-500 font-mono uppercase truncate">
                        Top: {rank.topStudent}
                      </p>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                        {rank.studentCount}
                      </span>
                    </div>
                    <div className="col-span-5 flex flex-col items-end gap-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-white font-mono">
                          {rank.totalXP.toLocaleString()} <span className="text-[10px] text-emerald-400">XP</span>
                        </span>
                      </div>
                      <div className="w-24 h-1 bg-white/5 rounded-full overflow-hidden border border-white/5">
                        <div 
                          className="h-full bg-emerald-500" 
                          style={{ width: `${Math.min(100, (rank.totalXP / (classRankings[0]?.totalXP || 1)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* GLOBAL TOPS RANKING */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                <Zap className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight">Tops Globais (Elite)</h2>
            </div>
            <span className="text-[10px] font-mono text-gray-500 uppercase font-bold tracking-widest">
              Sincronizado
            </span>
          </div>

          <div className="glass-panel rounded-3xl border border-white/5 bg-slate-900/40 overflow-hidden shadow-lg">
            <div className="p-4 border-b border-white/5 bg-white/5 grid grid-cols-12 gap-4 text-[10px] font-black text-gray-500 uppercase tracking-widest">
              <div className="col-span-1 text-center">Pos.</div>
              <div className="col-span-6">Teclante / Operador</div>
              <div className="col-span-2 text-center">Sala</div>
              <div className="col-span-3 text-right">XP</div>
            </div>

            <div className="divide-y divide-white/5 max-h-[600px] overflow-y-auto custom-scrollbar">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center gap-3 text-gray-500">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                  <p className="font-mono text-[10px] uppercase tracking-widest">Mapeando Grid Global...</p>
                </div>
              ) : globalTopStudents.length === 0 ? (
                <div className="p-12 text-center text-gray-500 font-mono text-xs italic">
                  Nenhum registro encontrado no servidor global.
                </div>
              ) : (
                globalTopStudents.map((stu, index) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    key={stu.id} 
                    className="p-3.5 grid grid-cols-12 gap-4 items-center group hover:bg-white/5 transition-colors"
                  >
                    <div className="col-span-1 flex justify-center">
                      {index < 3 ? (
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg ${
                          index === 0 ? 'bg-gradient-to-br from-amber-300 to-amber-600 text-slate-950 scale-110 ring-2 ring-amber-400/30' :
                          index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-slate-950' :
                          'bg-gradient-to-br from-orange-400 to-orange-700 text-slate-950'
                        }`}>
                          <Award className="w-4 h-4" />
                        </div>
                      ) : (
                        <span className="text-[11px] font-mono font-bold text-gray-500 group-hover:text-emerald-400 transition-colors">
                          {index + 1}º
                        </span>
                      )}
                    </div>
                    <div className="col-span-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-gray-300 shrink-0 uppercase">
                        {stu.nomeCompleto.substring(0, 2)}
                      </div>
                      <div className="truncate">
                        <p className={`text-sm font-black uppercase tracking-tight truncate ${index < 3 ? 'text-white' : 'text-gray-200'}`}>
                          {stu.nomeCompleto}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-mono text-gray-500 font-bold uppercase">{stu.matricula}</span>
                          {stu.isVeterano && (
                            <span className="text-[7px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1 rounded font-black uppercase">Veterano</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-center">
                      <span className="text-[10px] font-black text-emerald-400/80 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 uppercase">
                        {stu.sala}
                      </span>
                    </div>
                    <div className="col-span-3 text-right">
                      <span className={`text-xs font-black font-mono ${index < 3 ? 'text-amber-400' : 'text-gray-300'}`}>
                        {stu.xp.toLocaleString()} <span className="text-[9px] opacity-50">XP</span>
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </section>

      </div>

      {/* FOOTER INFO */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-6 glass-panel rounded-3xl border border-white/5 bg-white/5">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-400" />
          <div className="text-left">
            <p className="text-[10px] font-black text-white uppercase tracking-widest">Sincronização de Alta Fidelidade</p>
            <p className="text-[9px] text-gray-500 font-mono">Status: Conectado ao WorkSIM Global Grid Engine v1.5</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Última Atualização</p>
            <p className="text-[10px] text-white font-mono">{new Date().toLocaleTimeString()}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 transition-all text-[10px] font-black uppercase tracking-widest cursor-pointer"
          >
            <RefreshCw className="w-3 h-3" />
            Recarregar Dados
          </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .font-outline-sm {
          -webkit-text-stroke: 1px rgba(52, 211, 153, 0.5);
          color: transparent;
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}} />
    </div>
  );
}
