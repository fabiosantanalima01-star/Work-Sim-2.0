/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Challenge } from "../types";
import { CheckCircle2, XCircle, AlertTriangle, Info, HelpCircle } from "lucide-react";

interface InteractiveSeveranceGridProps {
  activeChallenge: Challenge;
  isAlreadyAttempted: boolean;
  hasSucceeded: boolean;
  onSubmit: (isCorrect: boolean, feedbackText: string, article: string, selectedMap: Record<string, boolean>) => void;
  savedSelection?: Record<string, boolean>;
}

interface VerbaItem {
  id: string;
  nome: string;
  descricao: string;
}

const VERBAS_LIST_PT: VerbaItem[] = [
  { id: "saldo", nome: "Saldo do salário", descricao: "Dias efetivamente trabalhados no mês da saída." },
  { id: "decimo", nome: "13° proporcional", descricao: "Fração proporcional de meses trabalhados no ano corrente." },
  { id: "feriasVenc", nome: "Férias vencidas + 1/3", descricao: "Férias adquiridas e não gozadas de períodos anteriores." },
  { id: "feriasProp", nome: "Férias proporcionais + 1/3", descricao: "Férias proporcionais acumuladas da fração do período atual." },
  { id: "saqueFgts", nome: "Saque do FGTS", descricao: "Autorização para levantar o saldo depositado na conta vinculada do FGTS." },
  { id: "multa40", nome: "Multa de 40% de FGTS", descricao: "Indenização de 40% por demissão sem justa causa ou rescisão indireta." },
  { id: "multa20", nome: "Multa de 20% de FGTS", descricao: "Indenização reduzida a 20% por culpa recíproca ou acordo consensual." },
  { id: "avisoIntegral", nome: "Aviso prévio integral (100%)", descricao: "Período de aviso prévio em sua totalidade (indenizado ou trabalhado)." },
  { id: "avisoParcial", nome: "Aviso prévio parcial (50%)", descricao: "Período de aviso prévio pago pela metade (indenizado) em caso de culpa recíproca ou acordo." },
  { id: "seguro", nome: "Seguro desemprego", descricao: "Guia habilitando o requerimento do benefício do governo." }
];

const VERBAS_LIST_EN: VerbaItem[] = [
  { id: "saldo", nome: "Base Salary Balance", descricao: "Days effectively worked in the discharge month." },
  { id: "decimo", nome: "Proportional 13th Salary", descricao: "Proportional fraction of months worked in the current year." },
  { id: "feriasVenc", nome: "Overdue Vacation + 1/3", descricao: "Acquired and unused vacation days from previous cycles." },
  { id: "feriasProp", nome: "Proportional Vacation + 1/3", descricao: "Proportional vacation accumulated from current fraction." },
  { id: "saqueFgts", nome: "FGTS Fund Withdrawal", descricao: "Permission to withdraw the accumulated balance in FGTS." },
  { id: "multa40", nome: "FGTS 40% Fine Penalty", descricao: "40% indemnity for layoff without just cause or indirect termination." },
  { id: "multa20", nome: "FGTS 20% Fine Penalty", descricao: "Reduced 20% indemnity for reciprocal fault or mutual consent." },
  { id: "avisoIntegral", nome: "Full Notice Period (100%)", descricao: "Draft notice period in its entirety (compensated or worked)." },
  { id: "avisoParcial", nome: "Half Notice Period (50%)", descricao: "Aviso Prévio notice period halved (compensated) for mutual/reciprocal." },
  { id: "seguro", nome: "Unemployment Insurance Guides", descricao: "Official guides enabling government unemployment application." }
];

interface InteractiveSeveranceGridProps {
  activeChallenge: Challenge;
  isAlreadyAttempted: boolean;
  hasSucceeded: boolean;
  onSubmit: (isCorrect: boolean, feedbackText: string, article: string, selectedMap: Record<string, boolean>) => void;
  savedSelection?: Record<string, boolean>;
  appLanguage?: "pt" | "en";
}

export default function InteractiveSeveranceGrid({
  activeChallenge,
  isAlreadyAttempted,
  hasSucceeded,
  onSubmit,
  savedSelection,
  appLanguage = "pt"
}: InteractiveSeveranceGridProps) {
  const [selectedMap, setSelectedMap] = useState<Record<string, boolean>>({});
  const [localFeedback, setLocalFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  const VERBAS_LIST = appLanguage === "en" ? VERBAS_LIST_EN : VERBAS_LIST_PT;


  // Parse the correct items from responseExpectedId (stored as comma separated values)
  const correctIds = activeChallenge.gabarito.respostaEsperadaId.split(",");

  // Synced loaded state on change of challenge
  useEffect(() => {
    if (isAlreadyAttempted) {
      // Prefill with the correct mapping if they won, or empty/failed status otherwise
      const prefilled: Record<string, boolean> = {};
      if (hasSucceeded) {
        correctIds.forEach((id) => {
          prefilled[id] = true;
        });
      } else if (savedSelection) {
        setSelectedMap(savedSelection);
        return;
      }
      setSelectedMap(prefilled);
    } else {
      setSelectedMap({});
      setLocalFeedback(null);
    }
  }, [activeChallenge.id, isAlreadyAttempted, hasSucceeded, savedSelection]);

  const handleToggleVerba = (id: string) => {
    if (isAlreadyAttempted) return;
    
    // Play a small click vibe or just toggle state
    setSelectedMap((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleValidate = () => {
    if (isAlreadyAttempted) return;

    // Check if the user selected EXACTLY the correct set of verbas
    const activeSelectedIds = Object.keys(selectedMap).filter((k) => selectedMap[k] === true);
    
    // Check if correctIds matches activeSelectedIds
    const hasAllCorrectSelection =
      correctIds.length === activeSelectedIds.length &&
      correctIds.every((id) => activeSelectedIds.includes(id));

    if (hasAllCorrectSelection) {
      const successMsg = activeChallenge.gabarito.valoresCorretos?.justificativa || "Sua marcação de verbas rescisórias está perfeitamente em conformidade legal!";
      setLocalFeedback({
        isCorrect: true,
        text: successMsg
      });
      onSubmit(true, successMsg, activeChallenge.gabarito.artigoLegal, selectedMap);
    } else {
      const errorMsg = "Sua marcação de verbas rescisórias está incorreta! Algumas verbas que você indicou são indevidas para este tipo de desligamento, ou você deixou de atribuir um direito legítimo do trabalhador. Analise o quadro legal de referência de DP e tente novamente.";
      setLocalFeedback({
        isCorrect: false,
        text: errorMsg
      });
      // In this setup, we lets them see failure feedback but let them refine, OR write failure!
      // Let's pass the status to App.tsx
      onSubmit(false, errorMsg, activeChallenge.gabarito.artigoLegal, selectedMap);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Alert Banner */}
      <div className="bg-slate-950/45 border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex gap-3">
          <div className="p-2 bg-accent-primary/10 rounded-xl text-accent-primary shrink-0 self-start">
            <Info className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h4 className="text-gray-100 font-sans font-bold text-sm uppercase tracking-wider">
              {appLanguage === "en" 
                ? "Severance Mapping Term Analysis (TRCT)" 
                : "Análise do Termo de Mapeamento Rescisório (TRCT)"}
            </h4>
            <p className="text-xs text-text-secondary leading-relaxed font-sans">
              {appLanguage === "en"
                ? "Each type of termination determines unique rights and obligations under the Consolidation of Labor Laws (CLT). As a DP Coordinator, you must analyze this employee's case, cross-reference it with the rules of the reference table, and accurately define the due rights."
                : "Cada tipo de rescisão determina direitos e obrigações únicas na Consolidação das Leis do Trabalho (CLT). Como Coordenador de DP, você deve analisar o caso deste colaborador, cruzar com as regras da tabela de referência e definir com precisão os direitos devidos."}
            </p>
          </div>
        </div>
      </div>

      {/* Main interactive 1-column clickable grid */}
      <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-4 bg-slate-950/20 relative">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h3 className="text-sm font-sans font-bold text-gray-200 uppercase tracking-tight">
              {appLanguage === "en" ? "Due Severance Analysis" : "Análise de Verbas Devidas"}
            </h3>
            <p className="text-[10px] font-mono text-text-secondary uppercase">
              {appLanguage === "en"
                ? "Click to toggle (Green = Due / Red = Not Due)"
                : "Clique para ativar (Verde = Devido / Vermelho = Não Devido)"}
            </p>
          </div>
          
          <div className="text-right">
            <span className="text-[10px] font-mono text-text-secondary block">
              {appLanguage === "en" ? "CONTRACT STATUS:" : "STATUS DO CONTRATO:"}
            </span>
            <span className="text-xs font-mono font-bold text-accent-warning bg-accent-warning/10 px-2 py-0.5 rounded border border-accent-warning/20">
              {(() => {
                const title = activeChallenge.titulo;
                if (title.includes("Dispensa") || title.includes("Sem Justa Causa") || title.includes("Layoff") || title.includes("Unjustified")) {
                  return appLanguage === "en" ? "Without Just Cause" : "Sem Justa Causa";
                }
                if (title.includes("Pedido de Demissão") || title.includes("Resignation") || title.includes("Employee Resignation")) {
                  return appLanguage === "en" ? "Resignation" : "Pedido de Demissão";
                }
                if (title.includes("Acordo") || title.includes("Mutual") || title.includes("Consensual")) {
                  return appLanguage === "en" ? "Consensual Agreement" : "Acordo Consensual";
                }
                if (title.includes("Indireta") || title.includes("Indirect")) {
                  return appLanguage === "en" ? "Indirect Resignation" : "Rescisão Indireta";
                }
                if (title.includes("Justa Causa") || title.includes("Just Cause") || title.includes("Terminated for Just")) {
                  return appLanguage === "en" ? "Just Cause Dismissal" : "Demissão Justa Causa";
                }
                return appLanguage === "en" ? "Reciprocal Fault" : "Culpa Recíproca";
              })()}
            </span>
          </div>
        </div>

        {/* 1-column table list */}
        <div className="divide-y divide-white/5 bg-slate-950/40 rounded-xl border border-white/5 overflow-hidden">
          {VERBAS_LIST.map((verba) => {
            const isSelected = !!selectedMap[verba.id];
            return (
              <div 
                key={verba.id}
                className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3 sm:gap-6 transition-all duration-200 hover:bg-white/[0.02] ${
                  isSelected ? "bg-emerald-950/[0.05]" : ""
                }`}
              >
                <div className="space-y-1 text-left flex-1">
                  <h4 className="font-sans font-bold text-gray-200 text-sm">
                    {verba.nome}
                  </h4>
                  <p className="font-sans text-xs text-text-secondary leading-normal">
                    {verba.descricao}
                  </p>
                </div>

                <button
                  id={`verba-toggle-btn-${verba.id}`}
                  type="button"
                  onClick={() => handleToggleVerba(verba.id)}
                  disabled={isAlreadyAttempted}
                  className={`w-full sm:w-44 py-2.5 px-4 rounded-xl border font-mono text-[11px] font-bold uppercase transition-all duration-300 shadow-md ${
                    isAlreadyAttempted ? "cursor-not-allowed opacity-90" : "cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                  } ${
                    isSelected 
                      ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300 ring-2 ring-emerald-500/20" 
                      : "bg-rose-500/10 border-rose-500/30 text-rose-400"
                  }`}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? "bg-emerald-400 animate-pulse" : "bg-rose-500"}`} />
                    {isSelected 
                      ? (appLanguage === "en" ? "✓ DUE" : "✓ DEVIDO") 
                      : (appLanguage === "en" ? "🚫 NOT DUE" : "🚫 NÃO DEVIDO")}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Validation Row */}
        {!isAlreadyAttempted && (
          <div className="flex justify-end pt-2">
            <button
              id="severance-grid-submit-btn"
              type="button"
              onClick={handleValidate}
              className="bg-accent-primary text-bg-primary hover:bg-white font-sans font-bold text-xs uppercase py-3 px-8 rounded-xl cursor-pointer transition-all hover:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
            >
              {appLanguage === "en" ? "Validate Layout Terms (TRCT)" : "Validar Verbas do Termo (TRCT)"}
            </button>
          </div>
        )}
      </div>

      {/* Local Feedback Card inside the form */}
      {(localFeedback || isAlreadyAttempted) && (
        <div
          id="severance-grid-feedback"
          className={`p-5 rounded-2xl border text-sm leading-relaxed text-left animate-fade-in ${
            localFeedback?.isCorrect || hasSucceeded
              ? "bg-emerald-950/25 border-emerald-500/20 text-emerald-400"
              : "bg-rose-950/25 border-rose-500/20 text-accent-error"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className={`p-1 rounded-lg shrink-0 ${
              localFeedback?.isCorrect || hasSucceeded ? "text-emerald-400 bg-emerald-500/10" : "text-rose-400 bg-rose-500/10"
            }`}>
              {localFeedback?.isCorrect || hasSucceeded ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <XCircle className="w-5 h-5" />
              )}
            </div>
            <div className="space-y-1 flex-1">
              <span className="font-bold flex items-center gap-1.5 uppercase font-sans text-xs tracking-wider">
                {localFeedback?.isCorrect || hasSucceeded
                  ? (appLanguage === "en" ? "✓ Homologation Approved by Audit (TRCT Match)" : "✓ Homologação Aprovada pela Auditaria (TRCT Correto)")
                  : (appLanguage === "en" ? "✕ Severance Dispute Detected (Invalid TRCT)" : "✕ Divergência de Verbas Detectada (TRCT Inválido)")}
              </span>
              <p className="text-gray-100 font-sans text-xs md:text-sm mt-1">
                {localFeedback?.text ||
                  (hasSucceeded
                    ? (appLanguage === "en" ? "Your compliance check of final severance has successfully matched all labor standards." : "Sua auditoria de verbas rescisórias obteve homologação total perante a fiscalização do trabalho!")
                    : (appLanguage === "en" ? "You assigned unapproved terms or suppressed legitimate rights, triggering compliance failures." : "Você homologou verbas indevidas ou suprimiu direitos líquidos do trabalhador, gerando inconformidade fiscal!"))}
              </p>
              <div className="text-[11px] text-text-secondary font-mono mt-3 border-t border-white/5 pt-2 flex items-center gap-1">
                <span className="text-amber-400 font-bold uppercase mr-1">
                  {appLanguage === "en" ? "CLT Grounding:" : "Fundamentação CLT:"}
                </span> 
                {activeChallenge.gabarito.artigoLegal}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
