import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { FileText, PenTool, CheckCircle2, ShieldCheck, Download, Camera, Loader2, ArrowRight } from "lucide-react";
import { Student } from "../types";
import { exportContractToPDF } from "../utils/contractExporter";

interface WorkContractModalProps {
  student: Student;
  appLanguage: "pt" | "en";
  onSign: () => void;
}

export default function WorkContractModal({ student, appLanguage, onSign }: WorkContractModalProps) {
  const [isSigning, setIsSigning] = useState(false);
  const [hasSigned, setHasSigned] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleSign = () => {
    setIsSigning(true);
    // Simulate signing delay
    setTimeout(() => {
      setIsSigning(false);
      setHasSigned(true);
    }, 1500);
  };

  const handleDownload = () => {
    setIsExporting(true);
    try {
      exportContractToPDF(student, appLanguage);
    } catch (err) {
      console.error("Error exporting PDF:", err);
    } finally {
      setTimeout(() => setIsExporting(false), 1000);
    }
  };

  const translations = {
    title: { pt: "Contrato de Experiência e Admissão", en: "Probation & Work Contract" },
    clause1Title: { pt: "Cláusula 1ª - Objeto", en: "Clause 1 - Purpose" },
    clause1Text: {
      pt: `O presente contrato tem por objeto a prestação de serviços do(a) colaborador(a) ${student.nomeCompleto}, sob o cargo de ${student.cargo || "Analista de DP Júnior"}, comprometendo-se a seguir as normas regulamentares do Laboratório Técnico WORKSIM RH.`,
      en: `The purpose of this contract is the provision of services by ${student.nomeCompleto}, under the role of ${student.cargo || "Junior HR Analyst"}, committing to follow the regulatory standards of the WORKSIM RH Technical Laboratory.`
    },
    clause2Title: { pt: "Cláusula 2ª - Jornada e Foco", en: "Clause 2 - Working Hours & Focus" },
    clause2Text: {
      pt: "A jornada será monitorada pelo sistema de Telemetria de Foco. O desvio de atenção ou saída da estação de trabalho sem autorização prévia poderá resultar em advertências automáticas conforme o Regulamento Interno.",
      en: "The working hours will be monitored by the Focus Telemetry system. Any distraction or leaving the workstation without prior authorization may result in automatic warnings according to the Internal Regulations."
    },
    clause3Title: { pt: "Cláusula 3ª - Evolução e Carreira", en: "Clause 3 - Evolution & Career" },
    clause3Text: {
      pt: "A progressão de fase e de remuneração (XP) está condicionada à entrega cirúrgica de diagnósticos legais e contábeis corretos nos desafios propostos.",
      en: "Phase progression and remuneration (XP) are subject to the surgical delivery of correct legal and accounting diagnoses in the proposed challenges."
    },
    clause4Title: { pt: "Cláusula 4ª - Direitos Autorais e Metodologia", en: "Clause 4 - Copyright & Methodology" },
    clause4Text: {
      pt: "O usuário compreende que a estrutura de 8 fases, o roteiro pedagógico e o método de avaliação são de propriedade exclusiva do criador, sendo vedada a reprodução total ou parcial sem autorização prevía.",
      en: "The user understands that the 8-phase structure, the pedagogical script, and the evaluation method are the exclusive property of the creator, and total or partial reproduction without prior authorization is prohibited."
    },
    securityTitle: { pt: "ALERTA DE SEGURANÇA E PRIVACIDADE", en: "SECURITY & PRIVACY ALERT" },
    securityText: {
      pt: "O seu acesso ao Simulador é PESSOAL E INTRANSFERÍVEL. É terminantemente proibido o compartilhamento da sua Matrícula ou QR Code com terceiros, sob pena de BLOQUEIO DISCIPLINAR imediato do acesso. A integridade e segurança da sua conta são de sua inteira responsabilidade.",
      en: "Your access to the Simulator is PERSONAL & NON-TRANSFERABLE. Sharing your ID or QR Code with others is strictly prohibited, subject to immediate DISCIPLINARY BLOCK of access. Your account integrity and security are your sole responsibility."
    },
    privacy: {
      pt: "Ao assinar, você concorda com o uso de seus dados para fins de simulação educacional e monitoramento de desempenho.",
      en: "By signing, you agree to the use of your data for educational simulation and performance monitoring purposes."
    },
    signBtn: { pt: "Assinar Digitalmente", en: "Sign Digitally" },
    signing: { pt: "Autenticando Assinatura...", en: "Authenticating Signature..." },
    success: { pt: "Contrato Homologado!", en: "Contract Approved!" },
    nextStepBadge: { pt: "Agora, você já pode baixar o contrato e configurar seu Crachá.", en: "Now, you can download the contract and set up your Badge." },
    downloadBtn: { pt: "Baixar Contrato e Certidão (PDF)", en: "Download Contract & Cert (PDF)" },
    continueBtn: { pt: "Continuar para Estação", en: "Continue to Workstation" }
  };

  const t = (key: keyof typeof translations) => translations[key][appLanguage] || translations[key]["pt"];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="bg-white text-slate-950 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden relative border-8 border-slate-900"
      >
        {/* Header Style - Real Document look */}
        <div className="bg-slate-50 border-b-2 border-slate-200 p-8 flex justify-between items-start">
          <div className="space-y-1">
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 leading-none">
              WORKSIM <span className="text-emerald-600">RH</span> LABORATORY
            </h2>
            <p className="text-[10px] font-mono text-slate-400 font-bold tracking-widest uppercase">Official Employment Document v2.0</p>
          </div>
          <div className="bg-slate-900 text-white p-2 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto font-serif text-sm leading-relaxed text-slate-800">
          <div className="text-center space-y-2 mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-sans">{t("title")}</h1>
            <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
          </div>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 font-sans uppercase text-xs tracking-wider">{t("clause1Title")}</h3>
            <p>{t("clause1Text")}</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 font-sans uppercase text-xs tracking-wider">{t("clause2Title")}</h3>
            <p>{t("clause2Text")}</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 font-sans uppercase text-xs tracking-wider">{t("clause3Title")}</h3>
            <p>{t("clause3Text")}</p>
          </section>

          <section className="space-y-3">
            <h3 className="font-bold text-slate-900 font-sans uppercase text-xs tracking-wider">{t("clause4Title")}</h3>
            <p>{t("clause4Text")}</p>
          </section>

          <section className="p-6 rounded-2xl bg-rose-50 border-2 border-rose-100 space-y-3">
            <h3 className="font-black text-rose-700 font-sans uppercase text-xs tracking-widest flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              {t("securityTitle")}
            </h3>
            <p className="text-rose-900 font-bold leading-tight">{t("securityText")}</p>
          </section>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 italic text-[12px] opacity-80">
            {t("privacy")}
          </div>

          <div className="pt-10 flex flex-col items-center gap-6">
            <AnimatePresence mode="wait">
              {hasSigned ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex flex-col items-center gap-6 w-full"
                >
                  <div className="flex flex-col items-center gap-2 text-emerald-600">
                    <CheckCircle2 className="w-16 h-16" />
                    <p className="font-bold uppercase tracking-widest text-sm">{t("success")}</p>
                    <p className="text-[10px] text-slate-500 text-center">{t("nextStepBadge")}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full">
                    <button
                      onClick={handleDownload}
                      disabled={isExporting}
                      className="flex-1 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                    >
                      {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
                      {t("downloadBtn")}
                    </button>

                    <button
                      onClick={onSign}
                      className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                    >
                      {t("continueBtn")}
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="form"
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="w-full space-y-6"
                >
                  <div className="border-t-2 border-slate-200 pt-6 flex flex-col items-center gap-1">
                    <div className="w-48 h-px bg-slate-300 mb-2"></div>
                    <p className="text-[10px] font-bold uppercase text-slate-400">Assinatura Digital do Colaborador</p>
                    <p className="font-bold text-slate-900 font-mono underline decoration-emerald-500/30 underline-offset-4">{student.nomeCompleto}</p>
                  </div>

                  <button
                    onClick={handleSign}
                    disabled={isSigning}
                    className={`w-full py-5 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all transform active:scale-95 shadow-xl ${
                      isSigning 
                        ? "bg-slate-100 text-slate-400 cursor-wait" 
                        : "bg-slate-900 text-white hover:bg-emerald-600 hover:shadow-emerald-500/20"
                    }`}
                  >
                    {isSigning ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <FileText className="w-5 h-5" />
                        </motion.div>
                        {t("signing")}
                      </>
                    ) : (
                      <>
                        <PenTool className="w-5 h-5" />
                        {t("signBtn")}
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-50 p-6 flex justify-center border-t border-slate-100">
          <p className="text-[10px] text-slate-400 text-center font-mono">
            HASH: {Math.random().toString(36).substring(2, 15).toUpperCase()} | ID: {student.matricula}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
