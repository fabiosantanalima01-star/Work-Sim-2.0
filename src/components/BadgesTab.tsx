import React from "react";
import { motion } from "motion/react";
import { Student } from "../types";
import { CHALLENGES_DATA } from "../data";
import { BADGE_DEFINITIONS, BadgeDefinition } from "../badges";
import { 
  Award, 
  Lock,
  CheckCircle2,
  Star
} from "lucide-react";

interface BadgesTabProps {
  activeStudent: Student;
  appLanguage: "pt" | "en";
}

export default function BadgesTab({ activeStudent, appLanguage }: BadgesTabProps) {
  const respostas = activeStudent.respostasDesafios || {};

  // Map rarity badge styling
  const getRarityBadgeStyle = (rarity: string) => {
    switch (rarity) {
      case "Lendário":
      case "Legendary":
        return "bg-purple-500/20 text-purple-300 border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.2)]";
      case "Épico":
      case "Epic":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.2)]";
      case "Raro":
      case "Rare":
        return "bg-indigo-500/20 text-indigo-300 border-indigo-500/30";
      case "Incomum":
      case "Uncommon":
        return "bg-sky-500/20 text-sky-300 border-sky-500/30";
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30";
    }
  };

  const compiledBadges = BADGE_DEFINITIONS.map((def) => {
    const stats = def.checkUnlock(activeStudent, respostas);
    return {
      ...def,
      title: appLanguage === "en" ? def.titleEN : def.titlePT,
      desc: appLanguage === "en" ? def.descEN : def.descPT,
      rarity: appLanguage === "en" ? def.rarityEN : def.rarityPT,
      ...stats,
    };
  });

  const unlockedCount = compiledBadges.filter((b) => b.isUnlocked).length;
  const totalCount = compiledBadges.length;
  const totalUnlockPercentage = Math.round((unlockedCount / totalCount) * 100);

  // Stagger container animation for cards
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    show: { 
      opacity: 1, 
      scale: 1, 
      y: 0, 
      transition: { 
        type: "spring", 
        stiffness: 120, 
        damping: 12 
      } 
    },
  };

  return (
    <div className="space-y-8">
      {/* HEADER PROGRESS CARD */}
      <div className="relative overflow-hidden glass-panel p-8 rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900/80 via-slate-950/90 to-black shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none transform translate-x-1/4 -translate-y-1/4 scale-150">
          <Award className="w-64 h-64 text-indigo-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
                <Award className="w-8 h-8 text-indigo-400" />
              </div>
              <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">
                {appLanguage === "en" ? "Hall of Professional Honor" : "Galeria de Honra Profissional"}
              </h2>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl font-sans">
              {appLanguage === "en"
                ? "Your journey of excellence is recorded here. Every medal represents a verified milestone of compliance, focus, and operational mastery."
                : "Sua jornada de excelência é registrada aqui. Cada medalha representa um marco verificado de conformidade, foco e domínio operacional."}
            </p>
          </div>

          <div className="flex flex-col items-center justify-center bg-black/40 backdrop-blur-md border border-white/10 rounded-3xl px-8 py-6 text-center shrink-0 min-w-[200px] shadow-inner">
            <div className="relative">
              <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full" />
              <span className="text-4xl font-black text-indigo-400 leading-none relative">
                {unlockedCount} <span className="text-lg font-bold text-gray-500">/ {totalCount}</span>
              </span>
            </div>
            <span className="text-[11px] font-mono font-black uppercase tracking-[0.2em] text-indigo-300/60 mt-3 block">
              {appLanguage === "en" ? "Achievements" : "Conquistas"}
            </span>
            <div className="w-full bg-slate-900 h-2 rounded-full mt-4 overflow-hidden border border-white/5 p-[1px]">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${totalUnlockPercentage}%` }}
                className="h-full bg-gradient-to-r from-indigo-600 to-sky-400 rounded-full"
              />
            </div>
            <span className="text-[10px] font-mono text-gray-500 mt-2">{totalUnlockPercentage}% {appLanguage === "en" ? "Complete" : "Concluído"}</span>
          </div>
        </div>
      </div>

      {/* BADGES GRID */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {compiledBadges.map((badge) => {
          const Icon = badge.icon;
          const isUnlocked = badge.isUnlocked;

          return (
            <motion.div
              key={badge.id}
              variants={itemVariants}
              whileHover={isUnlocked ? { y: -8, scale: 1.03 } : {}}
              className={`group relative overflow-hidden p-6 rounded-[2rem] border transition-all text-center flex flex-col items-center gap-5 ${
                isUnlocked 
                  ? "glass-panel bg-gradient-to-b from-slate-900/60 to-slate-950/80 border-white/10 hover:border-indigo-500/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4),0_0_20px_rgba(79,70,229,0.2)] cursor-pointer"
                  : "bg-black/40 border-white/5 opacity-40 grayscale select-none cursor-not-allowed"
              }`}
            >
              {/* Shine effect for unlocked */}
              {isUnlocked && (
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transform" />
              )}

              {/* MEDAL VISUAL */}
              <div className="relative pt-2">
                {/* Ribbon behind medal */}
                {isUnlocked && (
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-16 pointer-events-none">
                     <div className={`w-full h-full bg-gradient-to-b ${badge.themeColor} opacity-20 rounded-t-sm clip-path-ribbon`} />
                  </div>
                )}
                
                <div className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${
                  isUnlocked
                    ? `bg-gradient-to-br ${badge.themeColor} border-white/20 shadow-[0_10px_25px_rgba(0,0,0,0.5),inset_0_-4px_8px_rgba(0,0,0,0.3)] scale-110`
                    : "bg-slate-900/80 border-white/5 grayscale"
                }`}>
                  {/* Inner gold ring for lendaries */}
                  {(badge.rarity === "Lendário" || badge.rarity === "Legendary") && isUnlocked && (
                    <div className="absolute inset-1 rounded-full border-2 border-yellow-400/30 animate-pulse" />
                  )}
                  
                  <Icon className={`w-10 h-10 ${isUnlocked ? "text-slate-950 drop-shadow-md" : "text-gray-600"}`} />
                  
                  {/* Little star on top of medal */}
                  {isUnlocked && (
                    <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-lg border border-slate-200">
                      <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                </div>

                {/* Glow behind medal */}
                {isUnlocked && (
                  <div className={`absolute inset-0 bg-gradient-to-br ${badge.themeColor} opacity-20 blur-2xl rounded-full scale-150 pointer-events-none group-hover:opacity-30 transition-opacity`} />
                )}
              </div>

              {/* TEXT CONTENT */}
              <div className="space-y-3 z-10">
                <div className="flex flex-col items-center gap-2">
                  <span className={`text-[10px] font-mono font-black uppercase px-3 py-1 rounded-full border tracking-widest ${getRarityBadgeStyle(badge.rarity)}`}>
                    {badge.rarity}
                  </span>
                  <h3 className={`text-base font-sans font-black tracking-tighter uppercase italic leading-none ${isUnlocked ? "text-white" : "text-gray-500"}`}>
                    {badge.title}
                  </h3>
                </div>
                
                <p className="text-[11px] text-gray-400 leading-tight font-sans max-w-[180px] mx-auto min-h-[33px]">
                  {badge.desc}
                </p>
              </div>

              {/* PROGRESS FOOTER */}
              <div className="w-full mt-2 pt-4 border-t border-white/5 space-y-2">
                <div className="flex justify-between items-center text-[10px] font-mono px-1">
                  <span className="text-gray-600 uppercase font-bold tracking-widest">
                    {appLanguage === "en" ? "Status" : "Status"}
                  </span>
                  <span className={`flex items-center gap-1 ${isUnlocked ? "text-emerald-400 font-black" : "text-gray-500"}`}>
                    {isUnlocked ? (
                      <>
                        <CheckCircle2 className="w-3 h-3" />
                        {appLanguage === "en" ? "EARNED" : "CONQUISTADO"}
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3" />
                        {badge.currentValue} / {badge.targetValue}
                      </>
                    )}
                  </span>
                </div>

                {/* Progress Bar (Only show if not unlocked) */}
                {!isUnlocked && (
                  <div className="w-full bg-slate-950 h-1 rounded-full overflow-hidden border border-white/5">
                    <div 
                      className="h-full bg-slate-600 rounded-full transition-all duration-300"
                      style={{ width: `${badge.progressPercentage}%` }}
                    />
                  </div>
                )}
              </div>

              {/* Decorative side rays for epics/legendaries */}
              {(badge.rarity === "Lendário" || badge.rarity === "Legendary" || badge.rarity === "Épico" || badge.rarity === "Epic") && isUnlocked && (
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10">
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-white rotate-45 blur-sm" />
                   <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1 bg-white -rotate-45 blur-sm" />
                </div>
              )}
            </motion.div>
          );
        })}
      </motion.div>

      {/* FOOTER LEGEND */}
      <div className="flex justify-center pt-4">
        <div className="inline-flex items-center gap-6 px-6 py-3 rounded-full bg-slate-950/40 border border-white/5 text-[10px] font-mono text-gray-500 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-500" /> {appLanguage === "en" ? "Common" : "Comum"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-sky-500" /> {appLanguage === "en" ? "Uncommon" : "Incomum"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500" /> {appLanguage === "en" ? "Rare" : "Raro"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500" /> {appLanguage === "en" ? "Epic" : "Épico"}
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" /> {appLanguage === "en" ? "Legendary" : "Lendário"}
          </div>
        </div>
      </div>
    </div>
  );
}
