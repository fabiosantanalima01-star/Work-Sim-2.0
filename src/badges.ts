import { Student, Challenge } from "./types";
import { Award, UserCheck, Shield, Calculator, Sparkles, Target, Star, Eye } from "lucide-react";
import { CHALLENGES_DATA } from "./data";

export interface BadgeDefinition {
  id: string;
  titlePT: string;
  titleEN: string;
  descPT: string;
  descEN: string;
  rarityPT: "Comum" | "Incomum" | "Raro" | "Épico" | "Lendário";
  rarityEN: "Common" | "Uncommon" | "Rare" | "Epic" | "Legendary";
  icon: any; // Lucide icon
  themeColor: string; 
  checkUnlock: (student: Student, respostas: Record<string, boolean>) => {
    isUnlocked: boolean;
    currentValue: string | number;
    targetValue: string | number;
    progressPercentage: number;
  };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: "dp_freshman",
    titlePT: "Calouro Integrado",
    titleEN: "Welcomed Onboard",
    descPT: "Concluir todos os desafios da Integração Básica (Fase 0).",
    descEN: "Complete all onboarding challenges (Phase 0).",
    rarityPT: "Comum",
    rarityEN: "Common",
    icon: Award,
    themeColor: "from-teal-500 to-emerald-500",
    checkUnlock: (_, resp) => {
      const phase0Chs = CHALLENGES_DATA.filter((c) => c.fase === 0);
      const completed = phase0Chs.filter((c) => resp[c.id] !== undefined).length;
      const total = phase0Chs.length || 6;
      return {
        isUnlocked: completed >= total && total > 0,
        currentValue: completed,
        targetValue: total,
        progressPercentage: Math.min((completed / total) * 100, 100),
      };
    },
  },
  {
    id: "precision_intern",
    titlePT: "Estagiário Operacional",
    titleEN: "Operational Intern",
    descPT: "Atingir pelo menos 90% de precisão na Fase 1 com pelo menos 5 desafios resolvidos.",
    descEN: "Achieve at least 90% accuracy in Phase 1 with at least 5 resolved challenges.",
    rarityPT: "Incomum",
    rarityEN: "Uncommon",
    icon: UserCheck,
    themeColor: "from-sky-500 to-cyan-500",
    checkUnlock: (_, resp) => {
      const phase1Chs = CHALLENGES_DATA.filter((c) => c.fase === 1);
      const completed = phase1Chs.filter((c) => resp[c.id] !== undefined).length;
      const correct = phase1Chs.filter((c) => resp[c.id] === true).length;
      const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;
      
      return {
        isUnlocked: completed >= 5 && accuracy >= 90,
        currentValue: `${accuracy}% (${completed} resolvidos)`,
        targetValue: "90% (mín. 5 resolvidos)",
        progressPercentage: completed === 0 ? 0 : Math.min((completed / 5) * 50 + (accuracy / 90) * 50, 100),
      };
    },
  },
  {
    id: "esocial_guardian",
    titlePT: "Guardião do e-Social",
    titleEN: "e-Social Guardian",
    descPT: "Concluir a Fase 2 (Assistente de Admissão) com precisão de acertos de pelo menos 90%.",
    descEN: "Complete Phase 2 (Admission Assistant) with an accuracy rate of at least 90%.",
    rarityPT: "Raro",
    rarityEN: "Rare",
    icon: Shield,
    themeColor: "from-indigo-500 to-violet-500",
    checkUnlock: (_, resp) => {
      const phase2Chs = CHALLENGES_DATA.filter((c) => c.fase === 2);
      const completed = phase2Chs.filter((c) => resp[c.id] !== undefined).length;
      const correct = phase2Chs.filter((c) => resp[c.id] === true).length;
      const accuracy = completed > 0 ? Math.round((correct / completed) * 100) : 0;
      
      return {
        isUnlocked: completed >= 4 && accuracy >= 90,
        currentValue: `${accuracy}% (${completed} resolvidos)`,
        targetValue: "90% (mín. 4 resolvidos)",
        progressPercentage: completed === 0 ? 0 : Math.min((completed / 4) * 50 + (accuracy / 90) * 50, 100),
      };
    },
  },
  {
    id: "payroll_calculator",
    titlePT: "Calculista de Rescisão",
    titleEN: "Severance Expert",
    descPT: "Resolver com sucesso pelo menos 3 desafios tributários/fiscais complexos da Fase 3.",
    descEN: "Successfully solve at least 3 complex tax/fiscal challenges of Phase 3.",
    rarityPT: "Épico",
    rarityEN: "Epic",
    icon: Calculator,
    themeColor: "from-amber-500 to-orange-500",
    checkUnlock: (_, resp) => {
      const phase3Chs = CHALLENGES_DATA.filter((c) => c.fase === 3);
      const correct = phase3Chs.filter((c) => resp[c.id] === true).length;
      const target = 3;
      return {
        isUnlocked: correct >= target,
        currentValue: correct,
        targetValue: target,
        progressPercentage: Math.min((correct / target) * 100, 100),
      };
    },
  },
  {
    id: "xp_collector",
    titlePT: "Magnata do XP",
    titleEN: "XP Collector",
    descPT: "Acumular 2.500 XP ou mais no simulador.",
    descEN: "Accumulate 2,500 XP or more in the simulator.",
    rarityPT: "Lendário",
    rarityEN: "Legendary",
    icon: Sparkles,
    themeColor: "from-purple-500 to-pink-500",
    checkUnlock: (student) => {
      const xp = student.xp || 0;
      const target = 2500;
      return {
        isUnlocked: xp >= target,
        currentValue: xp,
        targetValue: target,
        progressPercentage: Math.min((xp / target) * 100, 100),
      };
    },
  },
  {
    id: "accuracy_master",
    titlePT: "Mestre da Precisão",
    titleEN: "Precision Master",
    descPT: "Atingir precisão geral consolidada superior a 95% com no mínimo 10 desafios concluídos.",
    descEN: "Achieve overall consolidated accuracy over 95% with at least 10 completed challenges.",
    rarityPT: "Lendário",
    rarityEN: "Legendary",
    icon: Target,
    themeColor: "from-rose-500 to-red-500",
    checkUnlock: (student, resp) => {
      const precision = student.precisao || 0;
      const totalCompleted = Object.keys(resp).length;
      return {
        isUnlocked: precision >= 95 && totalCompleted >= 10,
        currentValue: `${precision}% (${totalCompleted} resolvidos)`,
        targetValue: "95% (mín. 10 resolvidos)",
        progressPercentage: Math.min((totalCompleted / 10) * 50 + (precision / 95) * 50, 100),
      };
    },
  },
  {
    id: "autonomous_analyst",
    titlePT: "Analista Autônomo",
    titleEN: "Autonomous Analyst",
    descPT: "Superar fases inteiras de desafios de forma 100% autônoma.",
    descEN: "Overcome full phases of challenges 100% autonomously.",
    rarityPT: "Raro",
    rarityEN: "Rare",
    icon: Star,
    themeColor: "from-yellow-400 to-amber-500",
    checkUnlock: (student) => {
      const streaks = student.streakFasesAutonomas || 0;
      const target = 1;
      return {
        isUnlocked: streaks >= target,
        currentValue: `${streaks} fases`,
        targetValue: "1 fase",
        progressPercentage: Math.min((streaks / target) * 100, 100),
      };
    },
  },
  {
    id: "unshakable_focus",
    titlePT: "Foco de Ferro",
    titleEN: "Iron Focus",
    descPT: "Completar no mínimo 8 desafios mantendo menos de 3 perdas de foco de tela.",
    descEN: "Complete at least 8 challenges while maintaining fewer than 3 screen focus losses.",
    rarityPT: "Incomum",
    rarityEN: "Uncommon",
    icon: Eye,
    themeColor: "from-green-500 to-emerald-500",
    checkUnlock: (student, resp) => {
      const totalCompleted = Object.keys(resp).length;
      const focusLosses = student.saidasTela || 0;
      return {
        isUnlocked: totalCompleted >= 8 && focusLosses < 3,
        currentValue: `Perdas de Foco: ${focusLosses}`,
        targetValue: "Menos de 3 saídas (mín. 8 resolvidos)",
        progressPercentage: totalCompleted === 0 ? 0 : Math.min((totalCompleted / 8) * 100, 100),
      };
    },
  },
];
