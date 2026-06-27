import React, { useState } from "react";
import { Student } from "../types";
import {
  Trophy,
  Users,
  UserCheck,
  Star,
  Trash2,
  Search,
  LogOut,
  ShieldAlert,
  Sparkles,
  Award,
  Crown,
  Laptop,
} from "lucide-react";

interface RankingTabProps {
  students: Student[];
  setStudents: React.Dispatch<React.SetStateAction<Student[]>>;
  activeStudentId: string | null;
  isProfessorOrAdmin: boolean;
}

export default function RankingTab({
  students,
  setStudents,
  activeStudentId,
  isProfessorOrAdmin,
}: RankingTabProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [rankingMode, setRankingMode] = useState<"GLOBAL" | "CLASS">("GLOBAL");
  const [classFilter, setClassFilter] = useState("ALL");
  const [newTeamIdInput, setNewTeamIdInput] = useState("");
  const [selectedStudentToAdd, setSelectedStudentToAdd] = useState("");
  const [joinError, setJoinError] = useState("");
  const [joinSuccess, setJoinSuccess] = useState("");

  const activeStudent = students.find((s) => s.id === activeStudentId);

  // --- FILTER OUT PROFESSOR AND DATA PREPARATION ---
  // The professor/admin does not participate in the student rankings
  const actualStudents = students.filter(
    (s) => s.id !== "adm" && s.matricula !== "ADM2026" && s.id !== "professor"
  );

  // --- DETERMINISTIC SORTING & RANKING COMPUTATION ---
  // Comparator based on the specific tie-break routing rules request
  const sortStudentsForRanking = (a: Student, b: Student): number => {
    // 1. Primary order: XP (descending)
    if (b.xp !== a.xp) {
      return b.xp - a.xp;
    }

    // 2. Secondary order: If they are in the SAME team (sharing computer/station)
    if (a.timeId && b.timeId && a.timeId === b.timeId) {
      // Leader precedes all
      if (a.timeLider && !b.timeLider) return -1;
      if (b.timeLider && !a.timeLider) return 1;

      // Vice-Leader precedes all except Leader
      if (a.timeViceLider && !b.timeViceLider) return -1;
      if (b.timeViceLider && !a.timeViceLider) return 1;

      // Regular members or tie of roles: Sort by Attendance Call Number (lowest first, e.g. "01" > "02")
      const numA = parseInt(a.chamadaNumero || "99", 10);
      const numB = parseInt(b.chamadaNumero || "99", 10);
      return numA - numB;
    }

    // 3. Fallback: If different teams, sort by Attendance Call Number
    const numA = parseInt(a.chamadaNumero || "99", 10);
    const numB = parseInt(b.chamadaNumero || "99", 10);
    if (numA !== numB) {
      return numA - numB;
    }

    // 4. Default: Alphabetical name order
    return a.nomeCompleto.localeCompare(b.nomeCompleto);
  };

  // Compile sorted list
  const sortedAllStudents = [...actualStudents].sort(sortStudentsForRanking);

  // Generate ranking positions with identical rank mapping for equivalent team/XP
  let currentRank = 1;
  const rankedStudents = sortedAllStudents.map((stu, index, arr) => {
    if (index > 0) {
      const prev = arr[index - 1];
      const sameXP = stu.xp === prev.xp;
      const sameTeam = stu.timeId && prev.timeId && stu.timeId === prev.timeId;

      // If they are in the same team or have equal XP, they share the exact same rank place
      if (sameXP || sameTeam) {
        // Keeps the same rank as the previous
      } else {
        currentRank = index + 1;
      }
    }
    return {
      student: stu,
      rank: currentRank,
    };
  });

  // Unique classes for filtering preset (excluding ADM)
  const availableClasses = Array.from(
    new Set(actualStudents.map((s) => s.sala || "Sem Turma"))
  ).filter((c) => c !== "ADM");

  // Determine effective class filter
  const effectiveClassFilter = rankingMode === "GLOBAL" ? "ALL" : (classFilter === "ALL" && activeStudent?.sala ? activeStudent.sala : classFilter);

  // Filter ranks
  const filteredRankList = rankedStudents.filter((item) => {
    const s = item.student;
    const matchesSearch =
      s.nomeCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.matricula.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = effectiveClassFilter === "ALL" || s.sala === effectiveClassFilter;
    return matchesSearch && matchesClass;
  });

  // --- TEAM/SQUAD MANAGEMENT LOGIC ---
  const handleCreateOrJoinTeam = (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError("");
    setJoinSuccess("");

    if (!activeStudentId || !activeStudent) return;
    if (!newTeamIdInput.trim()) {
      setJoinError("Defina um código ou identificador de máquina!");
      return;
    }

    const targetTeamId = newTeamIdInput.trim().toUpperCase();

    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === activeStudentId) {
          // Join team. By default, if the team has no leader, they can be a regular member first
          // Check if there is already a leader in that team to see if they should be regular
          const hasLeader = prev.some((p) => p.timeId === targetTeamId && p.timeLider);

          // Calculate current maximum group-earned XP
          const currentSquadStudents = prev.filter((p) => p.timeId === targetTeamId);
          const withAntecedente = currentSquadStudents.filter(
            (p) => p.xpAntecedente !== undefined && p.xpAntecedente !== null
          );
          let maxGroupEarnedXp = 0;
          if (withAntecedente.length > 0) {
            maxGroupEarnedXp = Math.max(0, ...withAntecedente.map((p) => p.xp - (p.xpAntecedente || 0)));
          }
          const antValue = Math.max(0, s.xp - maxGroupEarnedXp);

          return {
            ...s,
            timeId: targetTeamId,
            timeLider: !hasLeader, // Become leader if first in team
            timeViceLider: false,
            xpAntecedente: antValue,
          };
        }
        return s;
      })
    );

    setJoinSuccess(`✓ Conectado com sucesso à Estação de Simulador [${targetTeamId}]!`);
    setNewTeamIdInput("");
    setTimeout(() => setJoinSuccess(""), 4000);
  };

  const handleLeaveTeam = () => {
    if (!activeStudentId || !activeStudent) return;
    const teamId = activeStudent.timeId;

    setStudents((prev) => {
      // Clear team parameters for active student
      const updated = prev.map((s) => {
        if (s.id === activeStudentId) {
          return {
            ...s,
            timeId: undefined,
            timeLider: undefined,
            timeViceLider: undefined,
            xpAntecedente: undefined,
          };
        }
        return s;
      });

      // If active student was leader, promote next member in the team automatically if exists
      if (activeStudent.timeLider && teamId) {
        const remainingTeam = updated.filter((s) => s.timeId === teamId);
        if (remainingTeam.length > 0) {
          // Promote first remaining to leader
          const promoteId = remainingTeam[0].id;
          return updated.map((s) => {
            if (s.id === promoteId) {
              return { ...s, timeLider: true, timeViceLider: false };
            }
            return s;
          });
        }
      }
      return updated;
    });

    setJoinSuccess("Você se desvinculou da equipe de simulador.");
    setTimeout(() => setJoinSuccess(""), 4000);
  };

  const handleAddMemberToMyTeam = () => {
    if (!activeStudent || !activeStudent.timeId || !selectedStudentToAdd) return;

    const targetTeamId = activeStudent.timeId;

    setStudents((prev) => {
      // Calculate current maximum group-earned XP on my team
      const currentSquadStudents = prev.filter((p) => p.timeId === targetTeamId);
      const withAntecedente = currentSquadStudents.filter(
        (p) => p.xpAntecedente !== undefined && p.xpAntecedente !== null
      );
      let maxGroupEarnedXp = 0;
      if (withAntecedente.length > 0) {
        maxGroupEarnedXp = Math.max(0, ...withAntecedente.map((p) => p.xp - (p.xpAntecedente || 0)));
      }

      return prev.map((s) => {
        if (s.id === selectedStudentToAdd) {
          const antValue = Math.max(0, s.xp - maxGroupEarnedXp);
          return {
            ...s,
            timeId: targetTeamId,
            timeLider: false,
            timeViceLider: false,
            xpAntecedente: antValue,
          };
        }
        return s;
      });
    });

    setSelectedStudentToAdd("");
    setJoinSuccess("✓ Novo parceiro de equipe integrado ao computador!");
    setTimeout(() => setJoinSuccess(""), 4000);
  };

  const handleSetRole = (targetId: string, role: "lider" | "vice" | "operator") => {
    if (!activeStudent || !activeStudent.timeId) return;
    const teamId = activeStudent.timeId;

    setStudents((prev) => {
      return prev.map((s) => {
        // Only modify members of the same team
        if (s.timeId !== teamId) return s;

        if (role === "lider") {
          if (s.id === targetId) {
            return { ...s, timeLider: true, timeViceLider: false };
          } else if (s.timeLider) {
            // Demote old leader to vice or operator
            return { ...s, timeLider: false };
          }
        } else if (role === "vice") {
          if (s.id === targetId) {
            return { ...s, timeViceLider: true, timeLider: false };
          } else if (s.timeViceLider) {
            return { ...s, timeViceLider: false };
          }
        } else {
          // Regular operator
          if (s.id === targetId) {
            return { ...s, timeLider: false, timeViceLider: false };
          }
        }
        return s;
      });
    });
  };

  const handleKickMember = (targetId: string) => {
    setStudents((prev) =>
      prev.map((s) => {
        if (s.id === targetId) {
          return {
            ...s,
            timeId: undefined,
            timeLider: undefined,
            timeViceLider: undefined,
            xpAntecedente: undefined,
          };
        }
        return s;
      })
    );
  };

  // Teammates in my current computer
  const myTeammates = activeStudent?.timeId
    ? students.filter((s) => s.timeId === activeStudent.timeId)
    : [];

  // Potential students to add (not in any team or in a different team)
  const addableStudents = actualStudents.filter(
    (s) => s.id !== activeStudentId && s.timeId !== activeStudent?.timeId
  );

  // Top podium students for visualization - relative to currently filtered list
  const podiumStudents = filteredRankList.slice(0, 3);

  return (
    <div className="space-y-6">
      
      {/* HEADER CARD */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 relative overflow-hidden bg-slate-950/25">
        <div className="absolute top-0 right-0 p-5 opacity-10">
          <Trophy className="w-32 h-32 text-amber-400" />
        </div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400 animate-bounce" />
              <h2 className="text-xl font-sans font-black text-gray-100 uppercase tracking-widest">
                Ranking e Equipes de Simulador
              </h2>
            </div>
            <p className="text-xs text-text-secondary max-w-2xl leading-relaxed">
              Consulte no placar geral os líderes do e-Social corporativo. Teclantes na mesma máquina
              física operam integrados compartilhando pontos, sob ordens hierárquicas de Líderes e Vice-Líderes.
            </p>
          </div>

          <div className="bg-amber-400/10 border border-amber-400/20 rounded-xl px-4 py-2.5 flex items-center gap-3">
            <Award className="w-5 h-5 text-amber-400" />
            <div className="font-mono text-left">
              <div className="text-[10px] text-gray-400 uppercase">
                {rankingMode === "GLOBAL" ? "Campeão Geral" : `Campeão da Turma [${effectiveClassFilter}]`}
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[150px]">
                {filteredRankList[0]?.student?.nomeCompleto || "Sem Alunos"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- PODIUM OF TOP 3 --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 2nd PLACE CARD */}
        {podiumStudents[1] && (
          <div className="glass-panel rounded-2xl p-5 border border-slate-300/10 bg-slate-950/20 relative flex flex-col items-center justify-center text-center order-2 md:order-1 pt-8 self-end min-h-[170px] shadow-sm">
            <div className="absolute -top-4 w-9 h-9 rounded-full bg-slate-400 border border-white text-slate-950 font-black flex items-center justify-center font-mono">
              2º
            </div>
            <div className="text-xs text-slate-400 uppercase font-mono mb-1">Segundo Lugar</div>
            <h4 className="text-sm font-bold text-white tracking-wide truncate max-w-full fire-level-2 flex items-center gap-1 justify-center">
              <span>🔥🔥 {podiumStudents[1].student.nomeCompleto}</span>
            </h4>
            <div className="flex items-center gap-1 mt-2.5 bg-slate-400/10 px-2.5 py-0.5 rounded-full text-slate-400 border border-slate-400/20 font-mono text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              {podiumStudents[1].student.xp} XP
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1.5">
              Matrícula: {podiumStudents[1].student.matricula}
            </p>
            {podiumStudents[1].student.timeId && (
              <span className="text-[9px] bg-slate-400/5 text-slate-350 border border-slate-400/10 px-2 py-0.2 rounded-full font-sans mt-2.5 block">
                💻 Máquina: {podiumStudents[1].student.timeId}
              </span>
            )}
          </div>
        )}

        {/* 1st PLACE CARD */}
        {podiumStudents[0] && (
          <div className="glass-panel rounded-2xl p-6 border border-amber-500/35 bg-amber-950/15 relative flex flex-col items-center justify-center text-center order-1 md:order-2 pt-10 min-h-[195px] shadow-[0_0_25px_rgba(245,158,11,0.1)]">
            <div className="absolute -top-6 w-12 h-12 rounded-full bg-gradient-to-r from-amber-450 to-yellow-450 text-slate-950 font-black flex items-center justify-center font-mono text-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] animate-pulse">
              👑
            </div>
            <div className="absolute top-2 right-2">
              <Trophy className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div className="text-xs text-amber-450 uppercase font-black font-mono tracking-wider mb-1">
              Primeiro Lugar
            </div>
            <h4 className="text-base font-black text-white tracking-wide truncate max-w-full fire-level-1 flex flex-col items-center justify-center gap-1">
              <span className="text-[11px] uppercase tracking-wider text-rose-400 animate-pulse">🔥 FOGARÉU 🔥</span>
              <span>{podiumStudents[0].student.nomeCompleto}</span>
            </h4>
            <div className="flex items-center gap-1 mt-2.5 bg-amber-400/25 px-3.5 py-1 rounded-full text-yellow-300 border border-amber-400/30 font-mono text-sm shadow-[0_0_10px_rgba(245,158,11,0.15)] font-bold">
              <Star className="w-4 h-4 fill-current" />
              {podiumStudents[0].student.xp} XP
            </div>
            <p className="text-[10px] text-yellow-400/60 font-mono mt-2">
              Matrícula: {podiumStudents[0].student.matricula}
            </p>
            {podiumStudents[0].student.timeId && (
              <span className="text-[10px] bg-amber-400/10 text-yellow-250 border border-amber-450/20 px-2.5 py-0.5 rounded-full font-mono font-bold mt-2.5 block">
                💻 Máquina: {podiumStudents[0].student.timeId}
              </span>
            )}
          </div>
        )}

        {/* 3rd PLACE CARD */}
        {podiumStudents[2] && (
          <div className="glass-panel rounded-2xl p-5 border border-[#CD7F32]/20 bg-slate-950/20 relative flex flex-col items-center justify-center text-center order-3 md:order-3 pt-8 self-end min-h-[170px] shadow-sm">
            <div className="absolute -top-4 w-9 h-9 rounded-full bg-[#CD7F32] border border-white text-slate-950 font-black flex items-center justify-center font-mono">
              3º
            </div>
            <div className="text-xs text-[#CD7F32] uppercase font-mono mb-1">Terceiro Lugar</div>
            <h4 className="text-sm font-bold text-white tracking-wide truncate max-w-full fire-level-3 flex items-center gap-1 justify-center">
              <span>🔥 {podiumStudents[2].student.nomeCompleto}</span>
            </h4>
            <div className="flex items-center gap-1 mt-2.5 bg-[#CD7F32]/10 px-2.5 py-0.5 rounded-full text-[#CD7F32] border border-[#CD7F32]/20 font-mono text-xs">
              <Star className="w-3.5 h-3.5 fill-current" />
              {podiumStudents[2].student.xp} XP
            </div>
            <p className="text-[10px] text-gray-500 font-mono mt-1.5">
              Matrícula: {podiumStudents[2].student.matricula}
            </p>
            {podiumStudents[2].student.timeId && (
              <span className="text-[9px] bg-[#CD7F32]/5 text-[#CD7F32]/80 border border-[#CD7F32]/10 px-2 py-0.2 rounded-full font-sans mt-2.5 block">
                💻 Máquina: {podiumStudents[2].student.timeId}
              </span>
            )}
          </div>
        )}

      </div>

      {/* --- GESTÃO DE TIME DO SIMULADOR (ACTIVE STUDENT ONLY) --- */}
      {!isProfessorOrAdmin && activeStudentId && activeStudent && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-3">
            <div className="glass-panel rounded-2xl p-6 border border-cyan-500/15 bg-slate-950/20 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Laptop className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-sm font-sans font-bold text-gray-100 uppercase tracking-widest flex items-center gap-1.5">
                      💻 Gestão de Time de Simulador (Mesa Compartilhada)
                    </h3>
                    <p className="text-[11px] text-text-secondary leading-snug">
                      Ao operarem na mesma máquina física, conectem as matrículas para compartilharem o mesmo XP gerado na sessão.
                    </p>
                  </div>
                </div>

                {activeStudent.timeId ? (
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-cyan-400 bg-cyan-400/10 border border-cyan-400/15 rounded px-2.5 py-1">
                      ESTAÇÃO ATIVA: <strong>{activeStudent.timeId}</strong>
                    </span>
                    <button
                      onClick={handleLeaveTeam}
                      className="bg-rose-500/10 hover:bg-rose-500 text-rose-450 hover:text-white border border-rose-500/20 font-sans font-bold text-[10px] uppercase py-1.5 px-3 rounded-lg flex items-center gap-1 cursor-pointer transition-all"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Desvincular Máquina
                    </button>
                  </div>
                ) : (
                  <span className="text-[10px] uppercase font-mono font-bold bg-amber-400/10 border border-amber-400/20 text-yellow-300 px-2 py-0.5 rounded">
                    ⚠️ Operando Individualmente (Sem Equipe)
                  </span>
                )}
              </div>

              {joinSuccess && (
                <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs font-mono text-center">
                  {joinSuccess}
                </div>
              )}
              {joinError && (
                <div className="p-3 bg-rose-950/20 border border-rose-500/20 rounded-xl text-rose-400 text-xs font-mono text-center">
                  {joinError}
                </div>
              )}

              {/* Action content */}
              {!activeStudent.timeId ? (
                <form onSubmit={handleCreateOrJoinTeam} className="flex gap-3 max-w-md">
                  <input
                    type="text"
                    value={newTeamIdInput}
                    onChange={(e) => setNewTeamIdInput(e.target.value)}
                    placeholder="Código da Máquina (Ex: PC-04, ESTACAO-07)"
                    className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-3 py-2 text-xs font-mono text-white focus:border-cyan-400 focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="bg-cyan-550 hover:bg-cyan-500 text-slate-950 font-sans font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.15)] shrink-0"
                  >
                    Registrar Estação
                  </button>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left sub-div: add roommate member */}
                  <div className="space-y-3">
                    <h4 className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                      ➕ Conectar novo aluno à mesma máquina:
                    </h4>
                    <div className="flex gap-3">
                    <select
                      value={selectedStudentToAdd}
                      onChange={(e) => setSelectedStudentToAdd(e.target.value)}
                      className="flex-grow bg-bg-card border border-white/10 rounded-xl p-2.5 text-xs text-text-primary uppercase focus:border-cyan-400 tracking-wide focus:outline-none"
                    >
                        <option value="">-- Selecione o Aluno por Chamada --</option>
                        {addableStudents.map((s) => (
                          <option key={s.id} value={s.id}>
                            #{s.chamadaNumero || s.id} - {s.nomeCompleto} ({s.matricula})
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={handleAddMemberToMyTeam}
                        disabled={!selectedStudentToAdd}
                        className="bg-cyan-550/90 hover:bg-cyan-500 text-bg-primary font-sans font-bold text-xs uppercase px-4 py-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer shrink-0"
                      >
                        Vincular
                      </button>
                    </div>
                  </div>

                  {/* Right sub-div: list teammates on my machine */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-mono text-gray-400 uppercase tracking-wider">
                      👥 Integrantes Ativos na Máquina [{activeStudent.timeId}]:
                    </h4>
                    <div className="space-y-2 max-h-[140px] overflow-y-auto">
                      {myTeammates.map((m) => (
                        <div
                          key={m.id}
                          className={`flex items-center justify-between p-2 rounded-xl text-xs font-mono border ${
                            m.id === activeStudentId
                              ? "bg-cyan-500/10 border-cyan-400/20"
                              : "bg-white/5 border-white/5"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold text-cyan-400">
                              #{m.chamadaNumero || "00"}{" "}
                            </span>
                            <span className="text-gray-200">{m.nomeCompleto}</span>{" "}
                            {m.id === activeStudentId && (
                              <span className="text-[9px] text-[#00E5FF] font-sans font-semibold">
                                (Você)
                              </span>
                            )}
                            <div className="text-[10px] text-gray-450">
                              Matrícula: {m.matricula}{" "}
                              {m.timeLider ? (
                                <span className="text-[9px] text-amber-400 font-bold ml-1.5 uppercase bg-amber-450/10 px-1 rounded">
                                  Líder
                                </span>
                              ) : m.timeViceLider ? (
                                <span className="text-[9px] text-indigo-400 font-bold ml-1.5 uppercase bg-indigo-500/10 px-1 rounded">
                                  Vice-Líder
                                </span>
                              ) : (
                                <span className="text-[9px] text-gray-450 ml-1.5 uppercase bg-white/5 px-1 rounded text-[9px]">
                                  Membro
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Role control buttons */}
                          <div className="flex gap-1">
                            {!m.timeLider && (
                              <button
                                onClick={() => handleSetRole(m.id, "lider")}
                                className="text-[9px] bg-amber-400/10 hover:bg-amber-400 hover:text-slate-950 font-sans px-1.5 py-0.5 rounded text-amber-400 transition-colors cursor-pointer block"
                                title="Eleger como Líder do Grupo"
                              >
                                Líder
                              </button>
                            )}
                            {!m.timeViceLider && (
                              <button
                                onClick={() => handleSetRole(m.id, "vice")}
                                className="text-[9px] bg-indigo-550/10 hover:bg-indigo-550 hover:text-white font-sans px-1.5 py-0.5 rounded text-indigo-400 transition-colors cursor-pointer block"
                                title="Eleger como Vice-Líder do Grupo"
                              >
                                Vice
                              </button>
                            )}
                            {(m.timeLider || m.timeViceLider) && (
                              <button
                                onClick={() => handleSetRole(m.id, "operator")}
                                className="text-[9px] bg-white/5 hover:bg-white/10 font-sans px-1.5 py-0.5 rounded text-gray-400 transition-colors cursor-pointer block"
                                title="Tornar Membro Comum"
                              >
                                Membro
                              </button>
                            )}
                            {m.id !== activeStudentId && (
                              <button
                                onClick={() => handleKickMember(m.id)}
                                className="text-zinc-500 hover:text-rose-400 p-0.5 shrink-0 block"
                                title="Remover da Mesa"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- ALL RANKING CLASSIFICATIONS --- */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 bg-slate-950/15 space-y-6 text-left">
        
        {/* Mode Selector & Search controls row */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="space-y-4 w-full md:w-auto">
            <h3 className="text-sm font-sans font-extrabold text-gray-150 uppercase tracking-widest flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyan-400" />
              <span>Classificação do e-Social</span>
            </h3>
            
            {/* TOGGLE BUTTONS */}
            <div className="flex bg-slate-950/50 p-1 rounded-xl border border-white/10 w-fit">
              <button
                onClick={() => setRankingMode("GLOBAL")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition-all ${
                  rankingMode === "GLOBAL"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Ranking Global
              </button>
              <button
                onClick={() => setRankingMode("CLASS")}
                className={`px-4 py-1.5 rounded-lg text-[10px] font-sans font-black uppercase tracking-wider transition-all ${
                  rankingMode === "CLASS"
                    ? "bg-cyan-500 text-slate-950 shadow-lg shadow-cyan-500/20"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Ranking por Turma
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap w-full md:w-auto justify-end">
            {/* Class filter - Only shown if in CLASS mode or if admin want to switch classes */}
            {rankingMode === "CLASS" && (
              <div className="flex flex-col gap-1">
                <span className="text-[9px] font-mono text-gray-500 uppercase ml-1">Selecionar Turma:</span>
                <select
                  value={effectiveClassFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="bg-bg-card border border-white/10 rounded-xl px-3 py-2 text-xs text-text-primary focus:border-cyan-400 focus:outline-none min-w-[140px]"
                >
                  {isProfessorOrAdmin && <option value="ALL">Todas as Turmas</option>}
                  {availableClasses.map((cl, i) => (
                    <option key={i} value={cl}>
                      Turma: {cl}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Keyword Search */}
            <div className="flex flex-col gap-1 w-full md:w-auto">
              <span className="text-[9px] font-mono text-gray-500 uppercase ml-1">Filtrar Nome/Matrícula:</span>
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Pesquisar..."
                  className="bg-bg-card border border-white/10 rounded-xl pl-8 pr-3 py-2 text-xs text-text-primary focus:border-cyan-400 focus:outline-none w-full md:w-[220px] font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ranking Table */}
        <div className="overflow-x-auto pr-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-mono text-gray-400 uppercase tracking-wider">
                <th className="pb-3 text-center w-14">Class.</th>
                <th className="pb-3 w-14">Chamada</th>
                <th className="pb-3">Aluno / e-Social Matrícula</th>
                <th className="pb-3 text-center">Turma</th>
                <th className="pb-3 text-right">XP Real</th>
                <th className="pb-3 pl-8 text-left">Estação / Time no Simulador</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredRankList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-mono text-xs text-text-secondary">
                    🔍 Nenhum aluno correspondente aos filtros foi localizado no placar do e-Social.
                  </td>
                </tr>
              ) : (
                filteredRankList.map((item, index) => {
                  const s = item.student;
                  const medalMap: Record<number, string> = {
                    1: "🥇",
                    2: "🥈",
                    3: "🥉",
                  };
                  const hasMedal = item.rank <= 3;
                  const isS = s.id === activeStudentId;

                  return (
                    <tr
                      key={s.id}
                      className={`hover:bg-white/5 group border-b border-white/5/20 text-xs transition-all ${
                        isS ? "bg-cyan-450/5 font-bold" : ""
                      }`}
                    >
                      {/* Classification Position */}
                      <td className="py-3 text-center">
                        {hasMedal ? (
                          <span className="text-base" title={`${item.rank}º lugar`}>
                            {medalMap[item.rank]}
                          </span>
                        ) : (
                          <span className="font-mono text-gray-400">{item.rank}º</span>
                        )}
                      </td>

                      {/* Attendance Call Number */}
                      <td className="py-3 font-mono text-gray-500 font-bold text-center">
                        #{s.chamadaNumero || "—"}
                      </td>

                      {/* Student Info */}
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2.5 text-left">
                          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-slate-800 to-indigo-950 flex items-center justify-center border border-white/5 font-mono text-xs text-cyan-400 font-bold shrink-0">
                            {s.nomeCompleto.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="truncate">
                            {item.rank === 1 ? (
                              <span className="fire-level-1 block truncate">
                                🔥🔥🔥 {s.nomeCompleto} 🔥🔥🔥{" "}
                                {isS && <span className="text-[10px] text-rose-450 uppercase font-black tracking-widest">[Você]</span>}
                              </span>
                            ) : item.rank === 2 ? (
                              <span className="fire-level-2 block truncate">
                                🔥🔥 {s.nomeCompleto}{" "}
                                {isS && <span className="text-[10px] text-orange-450 uppercase font-black tracking-widest">[Você]</span>}
                              </span>
                            ) : item.rank === 3 ? (
                              <span className="fire-level-3 block truncate">
                                🔥 {s.nomeCompleto}{" "}
                                {isS && <span className="text-[10px] text-amber-450 uppercase font-black tracking-widest">[Você]</span>}
                              </span>
                            ) : (
                              <span className="text-gray-100 block group-hover:text-cyan-400 transition-colors truncate">
                                {s.nomeCompleto}{" "}
                                {isS && (
                                  <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">
                                    [Você]
                                  </span>
                                )}
                              </span>
                            )}
                            <span className="text-[10px] text-text-secondary font-mono block">
                              MATRICULA: {s.matricula}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Turma Classroom */}
                      <td className="py-3 text-center text-gray-300 font-bold">
                        {s.sala || "Sem Turma"}
                      </td>

                      {/* XP Real */}
                      <td className="py-3 text-right">
                        <span className="text-amber-400 font-mono font-bold text-xs bg-amber-450/5 px-2.5 py-1 rounded border border-amber-450/10">
                          ⭐ {s.xp} XP
                        </span>
                      </td>

                      {/* Team Simulator Information */}
                      <td className="py-3 pl-8 text-left">
                        {s.timeId ? (
                          <div className="flex items-center gap-2">
                            <div className="flex flex-col">
                              <span className="bg-cyan-500/10 text-cyan-400 border border-cyan-500/15 font-mono px-2 py-0.5 rounded text-[10px] font-bold">
                                💻 {s.timeId}
                              </span>
                              {s.timeLider ? (
                                <span className="text-[9px] text-amber-400 font-bold uppercase tracking-wider mt-0.5">
                                  👑 Líder do Grupo
                                </span>
                              ) : s.timeViceLider ? (
                                <span className="text-[9px] text-indigo-400 font-bold uppercase tracking-wider mt-0.5">
                                  🥈 Vice-Líder do Grupo
                                </span>
                              ) : (
                                <span className="text-[9px] text-gray-500 uppercase tracking-wider mt-0.5">
                                  Teclante (Membro)
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-600 font-mono text-[10px] italic">
                            Operando Individual
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
