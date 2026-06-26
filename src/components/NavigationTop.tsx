/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { motion } from "motion/react";
import { 
  BookOpen, 
  Award, 
  Languages, 
  TrendingUp, 
  Timer, 
  Trophy, 
  Sun, 
  Moon,
  Terminal,
  SlidersHorizontal,
  ChevronRight,
  Eye,
  EyeOff,
  Menu,
  X,
  Globe
} from "lucide-react";

interface TopNavbarProps {
  currentTab: string;
  onTabChange: (tab: any) => void;
  themeMode: "dark" | "light";
  onToggleTheme: () => void;
  appLanguage: "pt" | "en";
  isProfessorOrAdmin: boolean;
  maxAllowedPhase: number;
  isFocusedMode: boolean;
  onToggleFocus: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  isMobileMenuOpen?: boolean;
  onToggleMobileMenu?: () => void;
}

export default function TopNavbar({
  currentTab,
  onTabChange,
  themeMode,
  onToggleTheme,
  appLanguage,
  isProfessorOrAdmin,
  maxAllowedPhase,
  isFocusedMode,
  onToggleFocus,
  isSidebarCollapsed,
  onToggleSidebar,
  isMobileMenuOpen = false,
  onToggleMobileMenu
}: TopNavbarProps) {
  const tabs = [
    { id: "challenges", label: appLanguage === "en" ? "Challenges" : "Desafios Ativos", icon: BookOpen, color: "text-accent-primary" },
    { id: "tournament", label: appLanguage === "en" ? "Tournament" : "WorkSIM Global", icon: Globe, color: "text-emerald-400" },
    { id: "linguajar", label: appLanguage === "en" ? "CLT Translator" : "Tradutor CLT", icon: Languages, color: "text-sky-400" },
    { id: "metrics", label: appLanguage === "en" ? "e-Social Graph" : "Gráfico e-Social", icon: TrendingUp, color: "text-cyan-400" },
    { id: "desempenho", label: appLanguage === "en" ? "Performance" : "Desempenho", icon: Timer, color: "text-indigo-400" },
    { id: "badges", label: appLanguage === "en" ? "Badges" : "Insígnias", icon: Award, color: "text-purple-400" },
    { id: "ranking", label: appLanguage === "en" ? "Ranking" : "Ranking & Equipes", icon: Trophy, color: "text-amber-500" },
  ];

  return (
    <>
      <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-md px-3 sm:px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-6 min-w-0">
          {/* Desktop Sidebar Toggle */}
          <button
            onClick={onToggleSidebar}
            className="hidden md:flex p-2 rounded-lg bg-white/5 border border-white/10 text-accent-primary hover:text-white hover:bg-accent-primary/20 transition-all cursor-pointer group"
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            <Terminal className={`w-5 h-5 transition-transform duration-500 ${isSidebarCollapsed ? "rotate-180" : ""}`} />
          </button>

          {/* Mobile Menu Toggle */}
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="flex md:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-accent-primary hover:text-white hover:bg-accent-primary/20 transition-all cursor-pointer group"
              title={isMobileMenuOpen ? "Fechar Menu" : "Abrir Menu"}
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          )}

          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <div className="relative group hidden xs:block sm:block">
              <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
              <div className="relative w-8 h-8 sm:w-11 sm:h-11 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center shadow-2xl">
                <BookOpen className="w-4 h-4 sm:w-6 sm:h-6 text-accent-primary" />
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <h1 className="text-xs sm:text-lg font-black tracking-tighter text-white uppercase leading-none truncate">
                <span className="sm:hidden">Simulador <span className="text-accent-primary">RH / CLT</span></span>
                <span className="hidden sm:inline">Simulador Acadêmico <span className="text-accent-primary">Legislação de RH</span></span>
              </h1>
              <div className="hidden sm:flex items-center gap-2 mt-1">
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-[10px] text-accent-primary/80 font-mono font-bold uppercase tracking-[0.2em] whitespace-nowrap">Legislação v7.07.2026</p>
                
                {/* Pedagogical Metadata Trigger */}
                <div className="group relative ml-4">
                  <div className="flex items-center gap-1 cursor-help opacity-60 hover:opacity-100 transition-opacity">
                    <BookOpen className="w-3 h-3 text-emerald-400" />
                    <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Metodologia</span>
                  </div>
                  <div className="absolute left-0 top-full mt-2 w-72 p-4 bg-slate-900 border border-emerald-500/30 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-[100] backdrop-blur-xl">
                    <div className="absolute -top-1.5 left-6 w-3 h-3 bg-slate-900 border-t border-l border-emerald-500/30 rotate-45"></div>
                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-2">Simulador de Alta Performance</h4>
                    <p className="text-[10px] leading-relaxed text-gray-300 italic">
                      "O software é um ambiente de simulação técnica imersiva. Ele funciona como uma estação de trabalho real de RH/DP, onde o aluno resolve casos práticos de admissão, jornada e rescisão. A plataforma valida cálculos em tempo real e fornece telemetria docente, transformando a teoria legal em prática operacional segura e escalável."
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Aprendizagem Ativa</span>
                      <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase">Cálculo Real</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 group cursor-pointer ${
                  currentTab === tab.id 
                    ? "text-white bg-white/5 border border-white/10" 
                    : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className={`w-4 h-4 ${tab.color} group-hover:scale-110 transition-transform`} />
                <span>{tab.label}</span>
                {currentTab === tab.id && (
                  <motion.div
                    layoutId="top-nav-active"
                    className="absolute inset-0 bg-white/5 rounded-xl border border-white/10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}

            {/* Special Tabs */}
            {(isProfessorOrAdmin || maxAllowedPhase >= 2) && (
              <button
                onClick={() => onTabChange("sandbox")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === "sandbox" ? "text-white bg-white/5 border border-white/10" : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <SlidersHorizontal className="w-4 h-4 text-accent-primary" />
                <span>{appLanguage === "en" ? "Tech Lab" : "Laboratório Técnico"}</span>
              </button>
            )}

            {isProfessorOrAdmin && (
              <button
                onClick={() => onTabChange("professor")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  currentTab === "professor" ? "text-white bg-white/5 border border-white/10" : "text-text-secondary hover:text-white hover:bg-white/5"
                }`}
              >
                <Terminal className="w-4 h-4 text-accent-warning" />
                <span>{appLanguage === "en" ? "Cockpit" : "Professor"}</span>
              </button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-white/5 border border-white/10 rounded-xl p-1">
            {/* Focus Toggle */}
            <button
              onClick={onToggleFocus}
              className={`p-2 sm:px-3 sm:py-1.5 rounded-lg transition-all cursor-pointer group flex items-center gap-1 sm:gap-1.5 ${
                isFocusedMode 
                  ? "bg-amber-500 text-slate-950 font-bold border border-amber-500 shadow-sm" 
                  : (themeMode === "light"
                      ? "text-gray-700 hover:text-gray-900 hover:bg-gray-200 border border-gray-300"
                      : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent")
              }`}
              title={isFocusedMode ? "Sair do Modo Foco" : "Entrar no Modo Foco (Olho)"}
            >
              {isFocusedMode ? (
                <>
                  <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-950 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] font-black tracking-tight text-slate-950 uppercase whitespace-nowrap">Foco Ativo</span>
                </>
              ) : (
                <>
                  <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:scale-110 transition-transform" />
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-tight uppercase whitespace-nowrap">Focado</span>
                </>
              )}
            </button>

            <div className="h-4 w-[1px] bg-white/10 mx-0.5 sm:mx-1" />

            {/* Theme Toggle */}
            <button
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer group"
              title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {themeMode === "dark" ? (
                <Sun className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:rotate-45 transition-transform" />
              ) : (
                <Moon className="w-3.5 h-3.5 sm:w-4 sm:h-4 group-hover:-rotate-12 transition-transform" />
              )}
            </button>
          </div>

          <div className="flex items-center gap-2 pl-1 sm:pl-2">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold text-white uppercase tracking-tight">Status do Servidor</p>
              <p className="text-[9px] text-emerald-400 font-mono animate-pulse">● OPERACIONAL</p>
            </div>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile-Only Horizontal Scrollable Tab Strip */}
      <div 
        className={`flex lg:hidden overflow-x-auto scrollbar-none py-2 px-3 gap-2 items-center justify-start whitespace-nowrap sticky top-[53px] z-40 shadow-md ${
          themeMode === "light"
            ? "bg-gray-100 border-b border-gray-200"
            : "bg-slate-950/80 border-b border-white/5 backdrop-blur-md"
        }`}
      >
        {tabs.map((tab) => {
          const IconComponent = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
                isActive
                  ? (themeMode === "light"
                      ? "bg-gray-700 text-white border border-gray-700 shadow-sm"
                      : "bg-accent-primary text-slate-950 border border-accent-primary shadow-glow shadow-accent-primary/20")
                  : (themeMode === "light"
                      ? "bg-white text-gray-600 border border-gray-200 hover:text-gray-950"
                      : "bg-slate-900/60 text-gray-400 border border-white/5 hover:text-white")
              }`}
            >
              <IconComponent className={`w-3.5 h-3.5 ${isActive ? "" : tab.color}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
        
        {/* Sandbox and Professor tabs if allowed */}
        {(isProfessorOrAdmin || maxAllowedPhase >= 2) && (
          <button
            onClick={() => onTabChange("sandbox")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              currentTab === "sandbox"
                ? (themeMode === "light"
                    ? "bg-gray-700 text-white border border-gray-700 shadow-sm"
                    : "bg-accent-primary text-slate-950 border border-accent-primary shadow-glow shadow-accent-primary/20")
                : (themeMode === "light"
                    ? "bg-white text-gray-600 border border-gray-200 hover:text-gray-950"
                    : "bg-slate-900/60 text-gray-400 border border-white/5 hover:text-white")
            }`}
          >
            <SlidersHorizontal className={`w-3.5 h-3.5 ${currentTab === "sandbox" ? "" : "text-accent-primary"}`} />
            <span>{appLanguage === "en" ? "Tech Lab" : "Laboratório Técnico"}</span>
          </button>
        )}

        {isProfessorOrAdmin && (
          <button
            onClick={() => onTabChange("professor")}
            className={`px-3 py-1.5 rounded-full text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0 ${
              currentTab === "professor"
                ? (themeMode === "light"
                    ? "bg-gray-700 text-white border border-gray-700 shadow-sm"
                    : "bg-accent-primary text-slate-950 border border-accent-primary shadow-glow shadow-accent-primary/20")
                : (themeMode === "light"
                    ? "bg-white text-gray-600 border border-gray-200 hover:text-gray-950"
                    : "bg-slate-900/60 text-gray-400 border border-white/5 hover:text-white")
            }`}
          >
            <Terminal className={`w-3.5 h-3.5 ${currentTab === "professor" ? "" : "text-accent-warning"}`} />
            <span>{appLanguage === "en" ? "Cockpit" : "Professor"}</span>
          </button>
        )}
      </div>
    </>
  );
}
