/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  BookOpen, 
  TrendingUp, 
  ShieldAlert, 
  Users, 
  Zap, 
  Award, 
  Calendar, 
  ChevronRight, 
  CheckCircle,
  Clock,
  Fingerprint
} from "lucide-react";

interface MethodologyModalProps {
  isOpen: boolean;
  onClose: () => void;
  appLanguage: "pt" | "en";
}

type TabType = "concept" | "phases" | "calcs" | "security" | "telemetry";

export default function MethodologyModal({ isOpen, onClose, appLanguage }: MethodologyModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>("concept");

  if (!isOpen) return null;

  const content = {
    pt: {
      title: "Metodologia Pedagógica & Arquitetura do Simulador",
      subtitle: "Andragogia Prática, Gamificação Rigorosa e Aprendizagem Baseada em Problemas (PBL)",
      close: "Fechar",
      tabs: {
        concept: "🎯 Conceito & Andragogia",
        phases: "📈 Trilhas de Carreira",
        calcs: "⚡ Engrenagem & Cálculos",
        security: "🛡️ Auditoria & Segurança",
        telemetry: "👥 Telemetria & Monitoramento"
      },
      concept: {
        title: "Andragogia Prática e Estação Imersiva de Trabalho",
        lead: "O Simulador Acadêmico de Legislação de RH transforma a teoria legal em prática corporativa real. Ele afasta o ensino estático e coloca o estudante no comando de uma estação de trabalho de Departamento Pessoal.",
        pillarsTitle: "Pilares do Método de Aprendizagem Ativa:",
        pillars: [
          {
            title: "Simulação Realista (Case-Based Learning)",
            desc: "Os cenários apresentados são baseados em problemas cotidianos reais enfrentados por empresas de diversos portes. O aluno lida com reclamações trabalhistas, admissões, controle de jornada e demissões."
          },
          {
            title: "Cálculos Integrados em Tempo Real",
            desc: "Cada decisão e inserção de dados valida cálculos complexos simultaneamente: verbas rescisórias, salário-família baseado em tetos normativos, contagem de descanso semanal remunerado (DSR) e parametrizações de e-Social."
          },
          {
            title: "Feedback Imediato com Amparo Legal",
            desc: "Assim que um desafio é respondido, a plataforma fornece uma explicação detalhada (gabarito comentado) acompanhado dos artigos correspondentes da Consolidação das Leis do Trabalho (CLT), sedimentando o conhecimento."
          }
        ]
      },
      phases: {
        title: "Plano de Cargos e Progressão em 8 Fases",
        lead: "A aprendizagem é estruturada como um plano de carreira corporativo dinâmico de 8 fases. O estudante começa como Auxiliar de DP e pode subir até Diretor de Gente e Gestão.",
        rulesTitle: "Regras Regulamentares de Progressão:",
        rules: [
          {
            title: "Fase 1 a 3 — Operacional",
            desc: "Focos em Admissão, Jornada (DSR, Horas Extras) e Folha de Pagamento básica. Exige rigor de cálculo manual e diagnóstico simples."
          },
          {
            title: "Fase 4 a 6 — Especialista & Gestor",
            desc: "Cenários de rescisões trabalhistas complexas (Justa Causa, Pedido, Acordo), estabilidades provisórias, acidentes de trabalho e parametrizações e-Social avançadas."
          },
          {
            title: "Fase 7 e 8 — Direção e Estratégia",
            desc: "Contratos especiais de trabalho, auditoria de folha, compliance sindical, e tomada de decisão estratégica de gestão de passivos trabalhistas."
          }
        ],
        badgeRequirement: "Trava Regulamentar:",
        badgeText: "Uma fase subsequente permanece bloqueada até que o estudante conclua 100% dos desafios da fase anterior e atinja uma precisão média regulamentar (mínimo de 70% a 80%, dependendo do cargo). Isso assegura que nenhuma lacuna conceitual seja arrastada para os níveis estratégicos."
      },
      calcs: {
        title: "Ferramentas Dinâmicas & Precisão Centesimal",
        lead: "O simulador não se resume a perguntas de múltipla escolha simples. Ele integra calculadoras de sub-rotinas interativas que exigem análise matemática precisa.",
        featuresTitle: "Recursos de Precisão no Painel de Trabalho:",
        features: [
          {
            title: "Calendário Comercial Interativo (DSR)",
            desc: "Permite ao usuário selecionar o mês e ano corrente e marcar interativamente os dias úteis e repousos (DSR), calculando coeficientes de folga de forma autônoma de acordo com a Lei 605/49."
          },
          {
            title: "Simulação de Admissão e e-Social",
            desc: "Análise de fichas cadastrais do trabalhador (nome, cargo, salário base, exames médicos) para verificar a elegibilidade de benefícios como o Salário-Família (conforme portarias do INSS) e conformidade de admissão."
          },
          {
            title: "Grid de Rescisão Trabalhadora",
            desc: "Tabelas onde o estudante confere saldo de salário, aviso prévio indenizado ou trabalhado, décimo terceiro proporcional, férias proporcionais e vencidas, aplicando multas constitucionais (40% do FGTS) de maneira cirúrgica."
          }
        ]
      },
      security: {
        title: "Segurança de Dados, Anti-Fraude & Integridade",
        lead: "Para garantir o valor acadêmico da avaliação e mitigar comportamentos inadequados, o simulador implementa um robusto módulo de segurança e auditoria ativa.",
        rulesTitle: "Mecanismos de Monitoramento e Proteção:",
        rules: [
          {
            title: "Monitoramento de Saída de Tela (Tab Lockout)",
            desc: "Se o estudante alternar de aba ou minimizar a janela para buscar gabaritos externos, o simulador registra uma ocorrência em segundo plano. Múltiplas saídas acionam um bloqueio temporário por desvio de foco e decrementam XP."
          },
          {
            title: "Inatividade Assistida",
            desc: "Caso a estação fique ociosa por mais de 3 minutos sem interação produtiva, o simulador entra em modo pausado, congelando o tempo e as pontuações para desencorajar o abandono da estação de trabalho."
          },
          {
            title: "Geração de Log e Auditoria Docente",
            desc: "Toda telemetria de respostas erradas, acertos de primeira, tempo gasto por questão e número de infrações de foco é salva no Firestore e fica disponível no painel de auditoria do Professor em tempo real."
          }
        ]
      },
      telemetry: {
        title: "Sincronização em Tempo Real e Trabalho em Equipe",
        lead: "O ambiente possui conectividade instantânea entre alunos, equipes (squads) e a mesa do professor, simulando o fluxo de uma consultoria moderna.",
        specsTitle: "Fluxo de Interação Integrada:",
        specs: [
          {
            title: "Estações Ativas (PCs Compartilhados)",
            desc: "Os alunos podem se agrupar em 'Estações de Trabalho' (squads de PC). O desempenho de cada integrante soma para o placar global da equipe e estimula a mentoria entre pares."
          },
          {
            title: "Canal de Dúvidas Direto com a Docência",
            desc: "Durante a resolução, o aluno pode enviar perguntas técnicas diretamente para a fila do professor. O professor responde de seu Cockpit e o aluno recebe o texto na hora, com bonificação de XP pelo empenho."
          },
          {
            title: "Feed Global e Placar em Tempo Real",
            desc: "Notificações automáticas via banco de dados avisam quando um colega conclui fases ou atinge pontuações históricas, gerando uma competição saudável baseada em mérito e rapidez."
          }
        ]
      }
    },
    en: {
      title: "Pedagogical Methodology & Simulator Architecture",
      subtitle: "Practical Andragogy, Rigorous Gamification, and Problem-Based Learning (PBL)",
      close: "Close",
      tabs: {
        concept: "🎯 Concept & Andragogy",
        phases: "📈 Career Tracks",
        calcs: "⚡ Engine & Calculations",
        security: "🛡️ Audit & Security",
        telemetry: "👥 Telemetry & Monitoring"
      },
      concept: {
        title: "Practical Andragogy & Immersive Workspace",
        lead: "The RH Legislation Academic Simulator transforms legal theory into real corporate practice, moving away from static learning and placing the student in command of an HR workstation.",
        pillarsTitle: "Active Learning Method Pillars:",
        pillars: [
          {
            title: "Realistic Simulation (Case-Based Learning)",
            desc: "Scenarios are based on real day-to-day issues faced by businesses of all sizes, covering labor complaints, hiring, timesheet audit, and dismissals."
          },
          {
            title: "Real-Time Integrated Calculations",
            desc: "Each decision and data entry validates complex calculations simultaneously: severance pay, family allowance based on INSS limits, DSR counts, and e-Social parameters."
          },
          {
            title: "Immediate Feedback with Legal Grounding",
            desc: "As soon as a challenge is submitted, the platform provides a detailed explanation (commented answer key) along with the corresponding articles of the CLT, consolidating knowledge."
          }
        ]
      },
      phases: {
        title: "8-Phase Career Progression and Job Hierarchy",
        lead: "Learning is structured as a dynamic 8-phase corporate career plan. Students start as an HR Assistant and can climb to Chief People Officer.",
        rulesTitle: "Regulatory Progression Rules:",
        rules: [
          {
            title: "Phase 1 to 3 — Operational",
            desc: "Focus on Hiring, Workday controls (DSR, Overtime), and basic Payroll calculations. Requires manual math accuracy and simple legal diagnosis."
          },
          {
            title: "Phase 4 to 6 — Specialist & Manager",
            desc: "Complex termination scenarios (Just Cause, Resignation, Mutual Agreement), temporary employment protection, workplace accidents, and advanced e-Social compliance."
          },
          {
            title: "Phase 7 and 8 — Strategy & C-Suite",
            desc: "Special work contracts, payroll auditing, trade union compliance, and strategic decision-making to mitigate labor liabilities."
          }
        ],
        badgeRequirement: "Regulatory Gatekeeping:",
        badgeText: "A subsequent phase remains locked until the student achieves 100% completion in the previous phase with a regulatory average accuracy (minimum of 70% to 80% depending on the role). This ensures no conceptual gaps are dragged into strategic levels."
      },
      calcs: {
        title: "Dynamic Tools & Centesimal Precision",
        lead: "The simulator goes beyond simple multiple-choice questions. It integrates interactive calculation widgets that require rigorous mathematical and legal checks.",
        featuresTitle: "Precision Features in the Workstation Panel:",
        features: [
          {
            title: "Interactive Commercial Calendar (DSR)",
            desc: "Allows users to select the month and year and click to count working days and rest days (DSR), calculating coefficients autonomously in compliance with Law 605/49."
          },
          {
            title: "Admission Simulation & e-Social Check",
            desc: "Analyzes worker registration sheets (name, role, salary, medical exams) to verify eligibility for benefits like Family Salary and basic regulatory compliance."
          },
          {
            title: "Interactive Severance Grid",
            desc: "Interactive grids where students balance wages, proportional or outstanding vacation time, proportional 13th-month pay, and constitutional penalties (e.g. 40% FGTS) with precision."
          }
        ]
      },
      security: {
        title: "Data Security, Anti-Fraud & Integrity Guard",
        lead: "To protect the academic value of evaluations and discourage counterproductive behaviors, the simulator implements a robust active security and audit module.",
        rulesTitle: "Monitoring and Protection Mechanisms:",
        rules: [
          {
            title: "Tab Lockout (Focus Monitoring)",
            desc: "If the student switches tabs or minimizes the window to search for answers, the simulator logs an infraction in the background. Multiple violations trigger a temporary screen lockout and deduct XP."
          },
          {
            title: "Idle State Freeze",
            desc: "If the workstation remains idle for more than 3 minutes, the simulator pauses, freezing the active timer and metrics to discourage abandonments."
          },
          {
            title: "Auditable Logs for Educators",
            desc: "The telemetry of wrong answers, first-attempt accuracy, time spent per case, and focus violations is saved on Firestore and displayed in real-time to the professor."
          }
        ]
      },
      telemetry: {
        title: "Real-Time Sync & Team Collaboration",
        lead: "The platform has instant connectivity between students, teams (squads), and the professor's dashboard, simulating a modern consulting firm workflow.",
        specsTitle: "Integrated Interaction Flow:",
        specs: [
          {
            title: "Active Stations (Shared Workstations)",
            desc: "Students can group themselves into shared Stations (PC squads). Each member's effort contributes to the group's global rank, fostering peer mentoring."
          },
          {
            title: "Direct Help Desk Tickets",
            desc: "During simulations, students can file technical question tickets. The professor reviews and responds from their cockpit, instantly sending the answer with bonus XP."
          },
          {
            title: "Global Activity Feed & Live Leaderboards",
            desc: "Automated database notifications alert peers when a colleague completes phases or breaks historical records, creating a healthy merit-based competition."
          }
        ]
      }
    }
  };

  const t = appLanguage === "en" ? content.en : content.pt;

  const tabIcons = {
    concept: <Zap className="w-4 h-4" />,
    phases: <Award className="w-4 h-4" />,
    calcs: <Calendar className="w-4 h-4" />,
    security: <ShieldAlert className="w-4 h-4" />,
    telemetry: <Users className="w-4 h-4" />
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-slate-900 border border-emerald-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
        >
          {/* Subtle green ambient light inside modal header */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-primary via-emerald-400 to-blue-500" />
          <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />

          {/* Modal Header */}
          <div className="p-6 border-b border-white/5 flex justify-between items-start gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-400">
                <BookOpen className="w-5 h-5" />
                <span className="text-[10px] font-mono font-black uppercase tracking-wider bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  {appLanguage === "en" ? "Pedagogy" : "Metodologia"}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-sans font-black text-white tracking-tight uppercase">
                {t.title}
              </h2>
              <p className="text-xs text-text-secondary font-medium">
                {t.subtitle}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-colors cursor-pointer"
              title={t.close}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body - Tabbed Layout */}
          <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
            {/* Sidebar Tabs */}
            <div className="w-full md:w-64 bg-slate-950/50 p-4 border-r border-white/5 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-x-visible no-scrollbar shrink-0">
              {(Object.keys(t.tabs) as TabType[]).map((tabKey) => (
                <button
                  key={tabKey}
                  onClick={() => setActiveTab(tabKey)}
                  className={`w-auto md:w-full flex items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                    activeTab === tabKey
                      ? "bg-accent-primary text-slate-950 font-black shadow-lg shadow-emerald-500/10"
                      : "text-text-secondary hover:text-white hover:bg-white/5"
                  }`}
                >
                  <span className={activeTab === tabKey ? "text-slate-950" : "text-emerald-400"}>
                    {tabIcons[tabKey]}
                  </span>
                  <span>{t.tabs[tabKey]}</span>
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6">
              {/* Tab 1: Concept */}
              {activeTab === "concept" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-extrabold text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-emerald-400" />
                      {t.concept.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-emerald-500/40 pl-4 py-1 bg-white/5 rounded-r-xl">
                      "{t.concept.lead}"
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
                      ● {t.concept.pillarsTitle}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {t.concept.pillars.map((pillar, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1 hover:border-emerald-500/20 transition-all">
                          <h5 className="text-sm font-sans font-extrabold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-mono">
                              {idx + 1}
                            </span>
                            {pillar.title}
                          </h5>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {pillar.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: Phases */}
              {activeTab === "phases" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-extrabold text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-emerald-400" />
                      {t.phases.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {t.phases.lead}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
                      ● {t.phases.rulesTitle}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {t.phases.rules.map((rule, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-2 flex flex-col justify-between">
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono font-black uppercase bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded">
                              {appLanguage === "en" ? `Tier ${idx + 1}` : `Nível ${idx + 1}`}
                            </span>
                            <h5 className="text-xs font-sans font-extrabold text-white mt-1">
                              {rule.title}
                            </h5>
                          </div>
                          <p className="text-[11px] text-text-secondary leading-relaxed">
                            {rule.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-1">
                    <h5 className="text-xs font-sans font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                      <Fingerprint className="w-4 h-4" />
                      {t.phases.badgeRequirement}
                    </h5>
                    <p className="text-[11px] text-gray-300 leading-relaxed">
                      {t.phases.badgeText}
                    </p>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Calcs */}
              {activeTab === "calcs" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-extrabold text-white flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-emerald-400" />
                      {t.calcs.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {t.calcs.lead}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
                      ● {t.calcs.featuresTitle}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {t.calcs.features.map((feature, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1 hover:border-emerald-500/20 transition-all flex gap-3 items-start">
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                            <Clock className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h5 className="text-sm font-sans font-extrabold text-white">
                              {feature.title}
                            </h5>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {feature.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 4: Security */}
              {activeTab === "security" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-extrabold text-white flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-400 animate-pulse" />
                      {t.security.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {t.security.lead}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-black uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
                      <span>●</span> {t.security.rulesTitle}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {t.security.rules.map((rule, idx) => (
                        <div key={idx} className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl space-y-1 hover:border-rose-500/20 transition-all">
                          <h5 className="text-sm font-sans font-extrabold text-white flex items-center gap-2">
                            <span className="w-5 h-5 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center text-xs font-mono font-black">
                              !
                            </span>
                            {rule.title}
                          </h5>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {rule.desc}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 5: Telemetry */}
              {activeTab === "telemetry" && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <h3 className="text-lg font-sans font-extrabold text-white flex items-center gap-2">
                      <Users className="w-5 h-5 text-emerald-400" />
                      {t.telemetry.title}
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {t.telemetry.lead}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <h4 className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
                      ● {t.telemetry.specsTitle}
                    </h4>
                    <div className="grid grid-cols-1 gap-4">
                      {t.telemetry.specs.map((spec, idx) => (
                        <div key={idx} className="p-4 bg-white/5 border border-white/5 rounded-xl space-y-1 hover:border-emerald-500/20 transition-all flex gap-3 items-start">
                          <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg shrink-0 mt-0.5">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <div className="space-y-0.5">
                            <h5 className="text-sm font-sans font-extrabold text-white">
                              {spec.title}
                            </h5>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {spec.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-950/60 border-t border-white/5 flex justify-end gap-3 shrink-0">
            <button
              onClick={onClose}
              className="px-5 py-2.5 bg-accent-primary hover:bg-emerald-600 text-slate-950 hover:text-white font-sans font-black uppercase text-xs rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-500/10 border-bottom border-b-4 border-emerald-800"
            >
              {appLanguage === "en" ? "Got it" : "Compreendido"}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
