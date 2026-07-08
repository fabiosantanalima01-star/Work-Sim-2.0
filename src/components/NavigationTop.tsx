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
  Globe,
  HelpCircle
} from "lucide-react";
import MethodologyModal from "./MethodologyModal";

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
  selectedPhaseId?: number;
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
  onToggleMobileMenu,
  selectedPhaseId
}: TopNavbarProps) {
  const [isMethodologyOpen, setIsMethodologyOpen] = React.useState(false);
  const isFocusDisabled = selectedPhaseId !== undefined && selectedPhaseId >= 3;
  const tabs = [
    { id: "challenges", label: appLanguage === "en" ? "Challenges" : "Desafios", icon: BookOpen, color: "text-accent-primary" },
    { id: "tournament", label: appLanguage === "en" ? "WorkSIM" : "WorkSIM", icon: Globe, color: "text-emerald-400" },
    { id: "linguajar", label: appLanguage === "en" ? "Translator" : "Tradutor", icon: Languages, color: "text-sky-400" },
    { id: "metrics", label: appLanguage === "en" ? "Graph" : "Gráfico", icon: TrendingUp, color: "text-cyan-400" },
    { id: "desempenho", label: appLanguage === "en" ? "Performance" : "Desempenho", icon: Timer, color: "text-indigo-400" },
    { id: "badges", label: appLanguage === "en" ? "Badges" : "Insígnias", icon: Award, color: "text-purple-400" },
    { id: "ranking", label: appLanguage === "en" ? "Ranking" : "Ranking", icon: Trophy, color: "text-amber-500" },
  ];

  return (
    <>
      {/* Floating Escape Button for Focused Mode */}
      {isFocusedMode && (
        <button
          onClick={onToggleFocus}
          className="fixed top-3 right-3 z-[10000] px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all text-xs uppercase tracking-wider cursor-pointer border border-amber-600 animate-fade-in"
          title={appLanguage === "en" ? "Exit Focus Mode" : "Sair do Modo Foco"}
        >
          <Eye className="w-4 h-4 text-slate-950 animate-pulse" />
          <span>{appLanguage === "en" ? "Exit Focus" : "Sair do Foco"}</span>
        </button>
      )}

      {!isFocusedMode && (
        <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 backdrop-blur-md py-3 flex flex-col gap-4 px-2 sm:px-4">
          {/* TOP ROW: BRAND & ACTIONS */}
          <div className="flex items-center justify-between w-full">
            {/* BRAND SECTION */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <div className="flex items-center gap-3 min-w-0">
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

                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="relative group hidden xs:block flex-shrink-0">
                    <div className="absolute -inset-1 bg-gradient-to-r from-accent-primary to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-slate-900 border border-white/20 flex items-center justify-center shadow-2xl">
                      <BookOpen className="w-5 h-5 sm:w-7 sm:h-7 text-accent-primary" />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h1 className="text-xs sm:text-lg md:text-2xl lg:text-3xl font-black tracking-tight text-white uppercase leading-none sm:leading-tight">
                      <span className="block sm:inline whitespace-nowrap">
                        {appLanguage === "en" ? "Academic Simulator" : "Simulador Acadêmico"}
                      </span>
                      <span className="text-accent-primary block sm:inline sm:ml-2 whitespace-nowrap">
                        Legislação de RH
                      </span>
                    </h1>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <p className="text-[9px] sm:text-[11px] text-accent-primary/80 font-mono font-bold uppercase tracking-wider">Legislação v9.0.2026-RC1</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ACTIONS & METADATA (RIGHT) */}
            <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
              {/* Metodologia Highlight Button */}
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsMethodologyOpen(true)}
                  className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all cursor-pointer group"
                  title={appLanguage === "en" ? "Click to view full pedagogical methodology" : "Clique para ver a metodologia pedagógica detalhada"}
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="hidden xs:inline text-[10px] font-black text-emerald-300 uppercase tracking-tight">Metodologia</span>
                </button>
              </div>

              <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

              <div className="flex items-center gap-1 sm:gap-1.5 bg-white/5 border border-white/10 rounded-xl p-1">
                {/* Focus Toggle */}
                <button
                  onClick={() => {
                    if (isFocusDisabled) {
                      alert(
                        appLanguage === "en"
                          ? "Focus mode is disabled starting from Phase 3, because the calculator must be used."
                          : "O modo foco (escrever documentos) está desativado a partir da Fase 3, pois a calculadora deve ser utilizada."
                      );
                      return;
                    }
                    onToggleFocus();
                  }}
                  className={`p-1.5 sm:px-2.5 sm:py-1 rounded-lg transition-all flex items-center gap-1 group ${
                    isFocusDisabled
                      ? "opacity-40 cursor-not-allowed bg-slate-950/45 text-gray-500 border border-white/5"
                      : isFocusedMode 
                        ? "bg-amber-500 text-slate-950 font-bold border border-amber-500 shadow-sm cursor-pointer" 
                        : (themeMode === "light"
                            ? "text-gray-700 hover:text-gray-900 hover:bg-gray-200 border border-gray-300 cursor-pointer"
                            : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent cursor-pointer")
                  }`}
                  title={
                    isFocusDisabled
                      ? (appLanguage === "en" ? "Focus Mode Disabled (F3+)" : "Modo Foco Indisponível (F3+)")
                      : isFocusedMode 
                        ? (appLanguage === "en" ? "Exit Focus Mode" : "Sair do Modo Foco") 
                        : (appLanguage === "en" ? "Enter Focus Mode" : "Entrar no Modo Foco")
                  }
                >
                  {isFocusDisabled ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5 text-gray-500" />
                      <span className="hidden sm:inline text-[9px] font-bold tracking-tight uppercase whitespace-nowrap">Foco (N/A)</span>
                    </>
                  ) : isFocusedMode ? (
                    <>
                      <Eye className="w-3.5 h-3.5 text-slate-950 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline text-[9px] font-black tracking-tight text-slate-950 uppercase whitespace-nowrap">Foco Ativo</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      <span className="hidden sm:inline text-[9px] font-bold tracking-tight uppercase whitespace-nowrap">Focado</span>
                    </>
                  )}
                </button>

                <div className="h-4 w-[1px] bg-white/10 mx-0.5 sm:mx-1" />

                {/* Theme Toggle */}
                <button
                  onClick={onToggleTheme}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer group"
                  title={themeMode === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                  {themeMode === "dark" ? (
                    <Sun className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 group-hover:-rotate-12 transition-transform" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 pl-1 sm:pl-2">
                <div className="text-right hidden md:block">
                  <p className="text-[10px] font-bold text-white uppercase tracking-tight">Status do Servidor</p>
                  <p className="text-[9px] text-emerald-400 font-mono animate-pulse">● OPERACIONAL</p>
                </div>
                <div className="hidden sm:flex w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 items-center justify-center">
                  <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500" />
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ROW: NAVIGATION MENU (SPANNING FULL WIDTH) */}
          <div className="hidden lg:flex w-full">
            <nav className="flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`relative flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                    currentTab === tab.id 
                      ? "text-white bg-white/10 border border-white/20 shadow-lg" 
                      : "text-text-secondary hover:text-white hover:bg-white/5"
                  }`}
                >
                  <tab.icon className={`w-4 h-4 ${tab.color} group-hover:scale-110 transition-transform`} />
                  <span className="uppercase tracking-tight">{tab.label}</span>
                  {currentTab === tab.id && (
                    <motion.div
                      layoutId="top-nav-active"
                      className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              ))}

              {/* Special Tabs (Laboratório and Professor) also part of the full width menu */}
              {(isProfessorOrAdmin || maxAllowedPhase >= 6) && (
                <button
                  onClick={() => onTabChange("sandbox")}
                  className={`relative flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                    currentTab === "sandbox" 
                      ? "text-white bg-white/10 border border-white/20 shadow-lg" 
                      : "text-text-secondary hover:text-white hover:bg-white/5"
                  }`}
                >
                  <SlidersHorizontal className="w-4 h-4 text-accent-primary group-hover:scale-110 transition-transform" />
                  <span className="uppercase tracking-tight">{appLanguage === "en" ? "Tech Lab" : "Laboratório"}</span>
                  {currentTab === "sandbox" && (
                    <motion.div
                      layoutId="top-nav-active"
                      className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              )}

              {isProfessorOrAdmin && (
                <button
                  onClick={() => onTabChange("professor")}
                  className={`relative flex-1 px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 group cursor-pointer ${
                    currentTab === "professor" 
                      ? "text-white bg-white/10 border border-white/20 shadow-lg" 
                      : "text-text-secondary hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Terminal className="w-4 h-4 text-accent-warning group-hover:scale-110 transition-transform" />
                  <span className="uppercase tracking-tight">{appLanguage === "en" ? "Cockpit" : "Professor"}</span>
                  {currentTab === "professor" && (
                    <motion.div
                      layoutId="top-nav-active"
                      className="absolute inset-0 bg-white/5 rounded-xl border border-white/10 -z-10"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              )}
            </nav>
          </div>
        </header>
      )}

      {/* Mobile-Only Horizontal Scrollable Tab Strip */}
      {!isFocusedMode && (
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
        {(isProfessorOrAdmin || maxAllowedPhase >= 6) && (
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
      )}

      {/* Methodology Detailed Dialog */}
      <MethodologyModal 
        isOpen={isMethodologyOpen} 
        onClose={() => setIsMethodologyOpen(false)} 
        appLanguage={appLanguage} 
      />
    </>
  );
}
