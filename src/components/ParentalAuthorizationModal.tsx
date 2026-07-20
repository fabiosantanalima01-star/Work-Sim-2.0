import React, { useState } from "react";
import { motion } from "motion/react";
import { ShieldCheck, CheckCircle2, AlertTriangle, Download, Loader2, ArrowRight, ClipboardSignature, Phone, User, LogOut } from "lucide-react";
import { Student } from "../types";
import { exportParentalAuthorizationToPDF, exportPrintableParentalAuthorizationForm } from "../utils/parentalAuthorizationExporter";

interface ParentalAuthorizationModalProps {
  student: Student;
  appLanguage: "pt" | "en";
  onAuthorize: (guardianName: string, guardianCpf: string, guardianPhone: string) => void;
  onLogout?: () => void;
}

export default function ParentalAuthorizationModal({ student, appLanguage, onAuthorize, onLogout }: ParentalAuthorizationModalProps) {
  const [guardianName, setGuardianName] = useState("");
  const [guardianCpf, setGuardianCpf] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [isChecked1, setIsChecked1] = useState(false);
  const [isChecked2, setIsChecked2] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Format CPF as 000.000.000-00
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      value = value
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
      setGuardianCpf(value);
    }
  };

  // Format Phone as (00) 00000-0000
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length <= 11) {
      if (value.length > 10) {
        value = value.replace(/^(\d{2})(\d{5})(\d{4})$/, "($1) $2-$3");
      } else if (value.length > 5) {
        value = value.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
      } else if (value.length > 2) {
        value = value.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
      } else if (value.length > 0) {
        value = value.replace(/^(\d*)$/, "($1");
      }
      setGuardianPhone(value);
    }
  };

  const handleSignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guardianName.trim() || guardianCpf.length < 14 || guardianPhone.length < 14 || !isChecked1 || !isChecked2) {
      return;
    }

    setIsSigning(true);
    setTimeout(() => {
      setIsSigning(false);
      setHasSigned(true);
      // Fire authorization update
      onAuthorize(guardianName, guardianCpf, guardianPhone);
    }, 1500);
  };

  const handleDownload = () => {
    setIsExporting(true);
    try {
      exportParentalAuthorizationToPDF(
        student,
        guardianName,
        guardianCpf,
        guardianPhone,
        new Date().toISOString()
      );
    } catch (err) {
      console.error("Error exporting PDF:", err);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const isFormValid = guardianName.trim().length > 3 && 
                      guardianCpf.length === 14 && 
                      guardianPhone.length >= 14 && 
                      isChecked1 && 
                      isChecked2;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white text-slate-950 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden relative border-8 border-slate-900 my-8"
      >
        {/* Document Header */}
        <div className="bg-slate-50 border-b-2 border-slate-200 p-6 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-lg font-black uppercase tracking-tighter text-slate-900 leading-none">
              WORKSIM <span className="text-emerald-600">RH</span> LABORATORY
            </h2>
            <p className="text-[9px] font-mono text-slate-400 font-bold tracking-widest uppercase">
              Parental Consent Document v1.0
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-500/20 text-[10px] uppercase font-bold tracking-wider cursor-pointer transition-all flex items-center gap-1.5"
                title="Sair da Conta"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sair
              </button>
            )}
            <div className="bg-slate-900 text-white p-2 rounded-lg">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-3.5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-905">
            <p className="font-bold uppercase tracking-tight">AUTORIZAÇÃO PARENTAL REQUERIDA</p>
            <p className="mt-0.5 text-slate-700 leading-relaxed">
              De acordo com as diretrizes de conformidade operacional e proteção do menor, este simulador pedagógico exige a anuência assinada do pai, mãe ou responsável legal antes do início dos testes práticos.
            </p>
          </div>
        </div>

        {/* Physical Print option */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
          <span className="text-slate-600 font-semibold text-center sm:text-left">Prefere assinar no papel físico?</span>
          <button
            type="button"
            onClick={() => exportPrintableParentalAuthorizationForm(student)}
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-emerald-700 active:scale-95"
          >
            <Download className="w-3.5 h-3.5" />
            Baixar Termo Físico para Imprimir
          </button>
        </div>

        {/* Document Body */}
        <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto font-sans text-xs leading-relaxed text-slate-800">
          <div className="border border-slate-100 rounded-xl p-4 bg-slate-50/50 space-y-2">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">Estudante Matriculado(a)</h3>
            <div className="grid grid-cols-2 gap-4 font-mono text-[11px] text-slate-600">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">NOME COMPLETO:</span>
                <span className="font-sans font-bold text-slate-900">{student.nomeCompleto}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">MATRÍCULA:</span>
                <span className="text-slate-900 font-bold">{student.matricula}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">SALA / TURMA:</span>
                <span className="text-slate-900 font-bold">{student.sala}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-sans font-bold">ANO LETIVO:</span>
                <span className="text-slate-900 font-bold">{student.ano}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3 font-serif italic text-slate-700 leading-relaxed border-l-4 border-emerald-500 pl-4 py-1">
            "Eu, abaixo qualificado como responsável legal pelo menor acima identificado, autorizo expressamente a sua participação nas dinâmicas simuladas de departamento pessoal, comitês pedagógicos e trilha ativa do Laboratório WORKSIM RH, incluindo a telemetria ética de foco operacional e criação de crachá de identificação interna do laboratório educacional."
          </div>

          {!hasSigned ? (
            <form onSubmit={handleSignSubmit} className="space-y-4 pt-2">
              <div className="space-y-3">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-1.5">
                  <ClipboardSignature className="w-4 h-4 text-emerald-600" /> Qualificação e Assinatura do Responsável
                </h4>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                      Nome Completo do Responsável Legal
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        placeholder="Nome completo do Pai, Mãe ou Tutor legal"
                        value={guardianName}
                        onChange={(e) => setGuardianName(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-sans text-xs"
                      />
                      <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        CPF do Responsável
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="000.000.000-00"
                        value={guardianCpf}
                        onChange={handleCpfChange}
                        className="w-full px-3 py-2 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                        Telefone de Contato
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="(00) 00000-0000"
                          value={guardianPhone}
                          onChange={handlePhoneChange}
                          className="w-full pl-9 pr-3 py-2 border-2 border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-all font-mono text-xs"
                        />
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked1}
                    onChange={(e) => setIsChecked1(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-[11px] text-slate-600 leading-normal">
                    Declaro que sou maior de idade, responsável legal pelo aluno e dou pleno consentimento para sua participação.
                  </span>
                </label>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isChecked2}
                    onChange={(e) => setIsChecked2(e.target.checked)}
                    className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                  />
                  <span className="text-[11px] text-slate-600 leading-normal">
                    Autorizo o processamento de dados pedagógicos internos e o upload controlado do crachá do aluno.
                  </span>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={!isFormValid || isSigning}
                  className={`px-5 py-3 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-wider transition-all duration-300 ${
                    isFormValid && !isSigning
                      ? "bg-slate-900 border-slate-950 text-white hover:bg-slate-800 cursor-pointer shadow-lg active:scale-95"
                      : "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                  }`}
                >
                  {isSigning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
                      Homologando Termo...
                    </>
                  ) : (
                    <>
                      <ClipboardSignature className="w-4 h-4" />
                      Assinar Termo e Liberar
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6 text-center py-6">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mx-auto border-4 border-emerald-100 shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-1">
                <h3 className="text-base font-black text-slate-900 uppercase">Autorização de Menor Ativada!</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  A assinatura do responsável legal foi homologada e vinculada à matrícula do estudante. O acesso à estação de treinamento está totalmente liberado.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-2">
                <button
                  onClick={handleDownload}
                  disabled={isExporting}
                  className={`w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50 hover:bg-slate-100 flex items-center justify-center gap-2 font-bold text-xs transition-all uppercase tracking-wider cursor-pointer ${isExporting ? "opacity-50" : ""}`}
                >
                  {isExporting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  Baixar Termo Assinado (PDF)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 p-4 text-center">
          <span className="text-[9px] text-slate-400 font-mono tracking-wider font-semibold uppercase">
            WORKSIM RH SECURITY INTEGRITY & LEGAL COMPLIANCE
          </span>
        </div>
      </motion.div>
    </div>
  );
}
