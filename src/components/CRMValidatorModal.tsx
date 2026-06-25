/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Search, Loader2, CheckCircle2, AlertTriangle, XCircle, FileText, UserMinus } from "lucide-react";

interface CRMValidatorModalProps {
  medicoNome: string;
  crmCodigo: string;
  onClose: () => void;
}

export default function CRMValidatorModal({ medicoNome, crmCodigo, onClose }: CRMValidatorModalProps) {
  const [loading, setLoading] = useState<boolean>(true);
  const [progress, setProgress] = useState<number>(0);
  const [status, setStatus] = useState<"ativo" | "inexistente" | "suspenso" | "divergente">("ativo");

  useEffect(() => {
    // Dynamic simulation of connection to CFM database servers
    const interval = setInterval(() => {
      setProgress((old) => {
        if (old >= 100) {
          clearInterval(interval);
          setLoading(false);
          return 100;
        }
        return old + 20;
      });
    }, 250);

    // Hardcoded logic according to Block D challenge scenarios
    const crmNum = crmCodigo.replace(/\D/g, "");
    if (crmNum === "99999") {
      setStatus("inexistente");
    } else if (crmNum === "12345") {
      setStatus("divergente");
    } else if (crmNum === "40510") {
      setStatus("suspenso");
    } else {
      setStatus("ativo");
    }

    return () => clearInterval(interval);
  }, [crmCodigo]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div 
        id="crm-validator-modal-container" 
        className="glass-panel w-full max-w-lg rounded-2xl border border-white/10 p-6 overflow-hidden shadow-2xl flex flex-col relative"
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <span className="text-[10px] uppercase font-mono tracking-widest text-accent-primary bg-accent-primary/10 px-2 py-0.5 rounded">
              Ambiente de Validação CFM
            </span>
            <h2 className="text-lg font-sans font-bold text-gray-100 mt-1">
              Validação de Registro Profissional
            </h2>
          </div>
          <button 
            id="close-crm-top-btn"
            onClick={onClose}
            className="text-text-secondary hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        <div className="bg-slate-950/40 p-4 rounded-xl border border-white/5 space-y-2 mb-4 font-mono text-xs text-text-secondary">
          <div className="flex justify-between">
            <span>Médico Analisado:</span>
            <span className="text-gray-200 font-semibold">{medicoNome}</span>
          </div>
          <div className="flex justify-between">
            <span>Inscrição / CRM:</span>
            <span className="text-accent-primary font-bold">{crmCodigo}</span>
          </div>
          <div className="flex justify-between">
            <span>Conselho Regional:</span>
            <span className="text-gray-300">CFM / CRM-SP</span>
          </div>
        </div>

        {loading ? (
          <div className="py-6 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-accent-primary animate-spin" />
            <span className="text-xs text-text-secondary font-mono">
              Buscando na base de dados federal do CFM... {progress}%
            </span>
            <div className="w-full max-w-xs bg-slate-900 h-1.5 rounded-full overflow-hidden border border-white/5">
              <div 
                className="bg-accent-primary h-full transition-all duration-300 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Status outcome blocks based on simulated checks */}
            {status === "ativo" && (
              <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h4 className="font-mono font-bold text-emerald-400 text-sm">
                      ✅ REGISTRO ATIVO E CONVENIADO
                    </h4>
                    <span className="text-xs text-text-secondary">
                      Não há divergência nominal. O profissional de medicina está autorizado a atestar.
                    </span>
                  </div>
                </div>
                <div className="border-t border-emerald-500/10 pt-2 text-[11px] text-emerald-300 font-sans leading-relaxed">
                  <strong>Ação Recomendada:</strong> Proceda com o abono da falta do colaborador, registrando no espelho de folha como licença médica remunerada (Falta Abonada).
                </div>
              </div>
            )}

            {status === "inexistente" && (
              <div className="p-4 bg-rose-950/20 border border-accent-error/20 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-accent-error" />
                  <div>
                    <h4 className="font-mono font-bold text-accent-error text-sm">
                      ❌ CRM NÃO ENCONTRADO / INEXISTENTE
                    </h4>
                    <span className="text-xs text-text-secondary">
                      A inscrição informada não existe sob nenhuma titularidade no Conselho Federal.
                    </span>
                  </div>
                </div>
                <div className="border-t border-accent-error/10 pt-2 text-[11px] text-accent-error/80 font-sans leading-relaxed">
                  <strong>Recomendação Ética / Legal:</strong> Documento sem validade legal. Fraude documental gravíssima. A entrega deste papel configura improbidade (Artigo 482, 'a' da CLT). 
                  <p className="mt-1 font-semibold text-rose-300">
                    ⚠️ Justa Causa aplicável de imediato. Nota: Documente a constatação. O ônus da prova é do empregador.
                  </p>
                </div>
              </div>
            )}

            {status === "suspenso" && (
              <div className="p-4 bg-amber-950/20 border border-accent-warning/20 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-8 h-8 text-accent-warning" />
                  <div>
                    <h4 className="font-mono font-bold text-accent-warning text-sm">
                      ⚠️ CRM SUSPENSO / IMPEDIDO
                    </h4>
                    <span className="text-xs text-text-secondary">
                      Inscrição de registro ativa no passado, mas atualmente com o exercício profissional suspenso.
                    </span>
                  </div>
                </div>
                <div className="border-t border-accent-warning/10 pt-2 text-[11px] text-accent-warning/85 font-sans leading-relaxed">
                  <strong>Recomendação de Conduta:</strong> O atestado não possui validade operacional civil, impossibilitando o abono do dia de falta. 
                  <p className="mt-1 font-semibold text-amber-300">
                    Ação: Descontar como falta injustificada normal. Não aplicar punição disciplinar grave (Justa Causa) por ausência de prova de dolo ou má-fé mútua do colaborador (que pode ter buscado atendimento de boa-fé).
                  </p>
                </div>
              </div>
            )}

            {status === "divergente" && (
              <div className="p-4 bg-rose-950/20 border border-accent-error/20 rounded-xl space-y-3">
                <div className="flex items-center gap-3">
                  <UserMinus className="w-8 h-8 text-accent-error" />
                  <div>
                    <h4 className="font-mono font-bold text-accent-error text-sm">
                      ❌ TITULARIDADE DIVERGENTE DO REGISTRO
                    </h4>
                    <span className="text-xs text-text-secondary">
                      O CRM pertence a outro médico (Pediatra Dra. Maria Heloisa). Nome carimbado diverge de fato.
                    </span>
                  </div>
                </div>
                <div className="border-t border-accent-error/10 pt-2 text-[11px] text-rose-300 font-sans leading-relaxed">
                  <strong>Parecer Trabalhista:</strong> Indica uso de carimbo de terceiro ou falsificação de assinatura alheia. Infração gravíssima do Art. 482, alínea 'a' da CLT (Improbidade).
                  <p className="mt-1 font-semibold text-rose-200">
                    Ação: Notifique o diretor e inicie procedimentos de dispensa fundamentada por justa causa.
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 text-[11px] text-text-secondary bg-slate-900 p-2 rounded border border-white/5 font-mono">
              <FileText className="w-3.5 h-3.5" />
              <span>Citação Legal de Apoio: Súmula 15 do TST e Res. CFM 1658/2002</span>
            </div>
            
            <button 
              id="confirm-close-crm-btn"
              onClick={onClose}
              className="w-full bg-indigo-650 hover:bg-indigo-600 font-sans font-medium text-xs text-white p-2.5 rounded-lg transition-colors cursor-pointer"
            >
              Fechar Validação de Registro
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
