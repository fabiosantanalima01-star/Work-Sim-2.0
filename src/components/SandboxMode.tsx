/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { CBO } from "../types";
import { CBOS_DATA } from "../data";
import { 
  Sliders, 
  HelpCircle, 
  FileJson, 
  ArrowRight, 
  CheckCircle2, 
  RefreshCw, 
  Printer, 
  Briefcase, 
  FileText, 
  DollarSign, 
  Calendar, 
  Scale, 
  Sparkles, 
  TrendingUp, 
  ShieldCheck, 
  Info,
  ChevronRight,
  UserCheck
} from "lucide-react";

export default function SandboxMode() {
  // Modes: "holerite" (Monthly standard stub) or "trct" (Termination Rescision Contract / TRCT)
  const [sandboxMode, setSandboxMode] = useState<"holerite" | "trct">("holerite");

  // Core configurations
  const [selectedCboCode, setSelectedCboCode] = useState<string>("4141-05"); // Almoxarife default
  const [salario, setSalario] = useState<number>(3500); // Default to match the student screenshot sample 3,500.00
  const [horasSemanais, setHorasSemanais] = useState<number>(44); // default 44 hours
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  // Mode: Holerite standard parameters
  const [overtimeHours, setOvertimeHours] = useState<number>(8);
  const [overtimeRate, setOvertimeRate] = useState<number>(50); // 50% or 100%
  const [unjustifiedAbsences, setUnjustifiedAbsences] = useState<number>(0);
  const [vtRequired, setVtRequired] = useState<boolean>(true);

  // Mode: TRCT parameters (for Phase 6+)
  const [motivoDesligamento, setMotivoDesligamento] = useState<string>("sem-justa"); // sem-justa, pedido, justa-causa, acordo
  const [avisoPrevio, setAvisoPrevio] = useState<string>("indenizado"); // indenizado, trabalhado, descontado, ausente
  const [diasSaldoSalario, setDiasSaldoSalario] = useState<number>(26); // 26 days to match screenshot
  const [mesesTrabalhadosAno, setMesesTrabalhadosAno] = useState<number>(10); // 10/12 months to match screenshot
  const [mesesFeriasProporcionais, setMesesFeriasProporcionais] = useState<number>(10); // 10/12 months to match screenshot
  const [temFeriasVencidas, setTemFeriasVencidas] = useState<boolean>(true); // yes, has 12/12 vencidas in screenshot
  const [anosTrabalhados, setAnosTrabalhados] = useState<number>(2); // Default 2 years for proportional notice period (aviso prévio proporcional)

  const printAreaRef = useRef<HTMLDivElement>(null);
  const selectedCbo = CBOS_DATA.find((c) => c.codigo === selectedCboCode) || CBOS_DATA[0];

  // ==========================================
  // CALCULATIONS: HOLERITE STANDARD
  // ==========================================
  const divisorMensal = horasSemanais * 5;
  const valorHoraBase = salario / divisorMensal; 
  const rateMultiplier = 1 + overtimeRate / 100;
  const valorHoraExtra = valorHoraBase * rateMultiplier;
  const totalOvertimeRemuneration = valorHoraExtra * overtimeHours;

  const valorFaltaUnitario = salario / 30;
  const totalAbsencesLoss = valorFaltaUnitario * unjustifiedAbsences;
  const dsrLoss = unjustifiedAbsences > 0 ? valorFaltaUnitario : 0; 

  const vtMaxDesconto = vtRequired ? salario * 0.06 : 0;

  const holeriteVencimentos = salario + totalOvertimeRemuneration;
  const holeriteDescontos = totalAbsencesLoss + dsrLoss + vtMaxDesconto;
  const holeriteLiquido = holeriteVencimentos - holeriteDescontos;

  // ==========================================
  // CALCULATIONS: TRCT / RECIBO DE QUITAÇÃO
  // ==========================================
  const isJustaCausa = motivoDesligamento === "justa-causa";

  // Proventos / Earnings
  const trctSaldoSalario = (salario / 30) * diasSaldoSalario;
  
  // Aviso Prévio Proporcional (Lei 12.506/2011): 30 dias + 3 dias por ano completo trabalhado (máximo de 90 dias)
  const diasAvisoPrevio = isJustaCausa ? 0 : (30 + Math.min(60, (anosTrabalhados > 0 ? anosTrabalhados * 3 : 0)));
  
  // Aviso Prévio Indenizado
  // Se indenizado, recebe o valor de todos os dias (mínimo 30, máx 90).
  // Se trabalhado, trabalha os 30 dias regulares, e os dias excedentes (proporcionais) são pagos como indenizados.
  const trctAvisoPrevioIndenizado = (isJustaCausa || avisoPrevio === "ausente") ? 0 : (
    avisoPrevio === "indenizado" 
      ? (salario / 30) * diasAvisoPrevio 
      : (avisoPrevio === "trabalhado" && diasAvisoPrevio > 30 ? (salario / 30) * (diasAvisoPrevio - 30) : 0)
  );
  
  // Projeção do Aviso Prévio: cada 30 dias de aviso projeta 1 avo (1/12) adicional de 13º e férias
  const avosAvisoProjection = isJustaCausa ? 0 : Math.max(1, Math.round(diasAvisoPrevio / 30));

  // 13º Salário
  const trctDecimoTerceiroProp = isJustaCausa ? 0 : (salario / 12) * mesesTrabalhadosAno;
  const trctDecimoTerceiroAviso = (isJustaCausa || avisoPrevio === "ausente" || avisoPrevio === "descontado") 
    ? 0 
    : (salario / 12) * avosAvisoProjection;

  // Férias
  const trctFeriasVencidas = temFeriasVencidas ? salario : 0;
  const trctFeriasProporcionais = isJustaCausa ? 0 : (salario / 12) * mesesFeriasProporcionais;
  const trctFeriasAviso = (isJustaCausa || avisoPrevio === "ausente" || avisoPrevio === "descontado") 
    ? 0 
    : (salario / 12) * avosAvisoProjection;

  // Terço Constitucional de Férias (1/3)
  const trctTercoFeriasVencidas = trctFeriasVencidas / 3;
  const trctTercoFeriasProp = isJustaCausa ? 0 : trctFeriasProporcionais / 3;
  const trctTercoFeriasAviso = isJustaCausa ? 0 : trctFeriasAviso / 3;

  // Total Bruto
  const trctTotalBruto = 
    trctSaldoSalario + 
    trctAvisoPrevioIndenizado + 
    trctDecimoTerceiroProp + 
    trctDecimoTerceiroAviso + 
    trctFeriasVencidas + 
    trctFeriasProporcionais + 
    trctFeriasAviso + 
    trctTercoFeriasVencidas + 
    trctTercoFeriasProp + 
    trctTercoFeriasAviso;

  // Descontos / Deductions
  // INSS progressive brackets (approximate for realistic feedback)
  const calcINSS = (base: number) => {
    if (base <= 0) return 0;
    if (base <= 1412) return base * 0.075;
    if (base <= 2666.68) return (1412 * 0.075) + ((base - 1412) * 0.09);
    if (base <= 4000.03) return (1412 * 0.075) + ((2666.68 - 1412) * 0.09) + ((base - 2666.68) * 0.12);
    return (1412 * 0.075) + ((2666.68 - 1412) * 0.09) + ((4000.03 - 2666.68) * 0.12) + ((base - 4000.03) * 0.14);
  };

  const trctInssSalario = calcINSS(trctSaldoSalario);
  const trctInssDecimoTerceiro = calcINSS(trctDecimoTerceiroProp);
  const trctAvisoPrevioDescontado = (isJustaCausa || avisoPrevio !== "descontado") ? 0 : salario;

  // IRRF estimations (bracket simplified)
  const calcIRRF = (base: number, inss: number) => {
    const baseCalculo = base - inss;
    if (baseCalculo <= 2259.20) return 0;
    if (baseCalculo <= 2826.65) return (baseCalculo * 0.075) - 169.44;
    if (baseCalculo <= 3751.05) return (baseCalculo * 0.15) - 381.44;
    if (baseCalculo <= 4664.68) return (baseCalculo * 0.225) - 662.77;
    return (baseCalculo * 0.275) - 896.00;
  };

  const trctIrrfSalarios = calcIRRF(trctSaldoSalario, trctInssSalario);
  const trctIrrfDecimoTerceiro = calcIRRF(trctDecimoTerceiroProp, trctInssDecimoTerceiro);
  // IRRF Férias has separate calculation
  const trctIrrfFerias = calcIRRF(trctFeriasVencidas + trctFeriasProporcionais + trctTercoFeriasVencidas + trctTercoFeriasProp, 0);

  const trctTotalDescontos = 
    trctInssSalario + 
    trctInssDecimoTerceiro + 
    trctAvisoPrevioDescontado +
    trctIrrfSalarios + 
    trctIrrfDecimoTerceiro + 
    trctIrrfFerias;

  const trctLiquido = trctTotalBruto - trctTotalDescontos;

  // FGTS estimates
  const trctFgtsQuitacao = (trctSaldoSalario) * 0.08;
  const trctFgtsDecimoTerceiro = (trctDecimoTerceiroProp) * 0.08;
  const trctMultaFgts = motivoDesligamento === "sem-justa" ? (trctTotalBruto * 0.04) : 0; // Simplified simulated 40% fine

  // Handle export
  const handleExportJSON = () => {
    const scenario = {
      titulo: `Simulação Paramétrica ${sandboxMode === "trct" ? "TRCT" : "Holerite"}: ${selectedCbo.ocupacao}`,
      cbo: selectedCbo.codigo,
      salarioBase: salario,
      tipoDocumento: sandboxMode,
      ...(sandboxMode === "holerite" ? {
        horasExtras: { qtd: overtimeHours, taxa: overtimeRate, total: Number(totalOvertimeRemuneration.toFixed(2)) },
        faltasInjustificadas: { qtd: unjustifiedAbsences, desconto: Number(totalAbsencesLoss.toFixed(2)), perdaDsr: Number(dsrLoss.toFixed(2)) },
        valeTransporte: { ativo: vtRequired, desconto: Number(vtMaxDesconto.toFixed(2)) },
        resultadoLiquido: Number(holeriteLiquido.toFixed(2))
      } : {
        parametrosTRCT: {
          motivoDesligamento,
          avisoPrevio,
          diasSaldoSalario,
          mesesTrabalhadosAno,
          mesesFeriasProporcionais,
          temFeriasVencidas
        },
        resultadoLiquidoRescisorio: Number(trctLiquido.toFixed(2))
      }),
      codigoParametrosCBO: {
        ctpsDigital: selectedCbo.ct,
        registroObrigatorio: selectedCbo.ro,
        recolhimentoDigital: selectedCbo.rd,
        exameEspecifico: selectedCbo.ee,
        jornadaFlexivel: selectedCbo.jf,
        sindicatoIntegrado: selectedCbo.si,
        riscoTecnico: selectedCbo.rt,
        recolhimentoAdicionais: selectedCbo.rda
      }
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scenario, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `WorkSim_Scenario_${sandboxMode}_${selectedCbo.codigo}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* HEADER SWITCH PANEL */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60">
        <div className="space-y-1 text-left">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sparkles className="w-3 h-3 animate-pulse" /> FASE EXPERIMENTAL E DE TESTES (SANDBOX)
          </span>
          <h2 className="text-base font-sans font-black text-gray-150 flex items-center gap-2">
            🔬 Laboratório de Simulações Trabalhistas
          </h2>
          <p className="text-xs text-text-secondary select-none">
            Altere as variáveis em tempo real para visualizar o impacto imediato na folha de pagamento ou na rescisão (TRCT).
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-white/5 shrink-0 self-stretch md:self-auto">
          <button
            type="button"
            onClick={() => setSandboxMode("holerite")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              sandboxMode === "holerite" 
                ? "bg-accent-primary text-slate-950 shadow-md" 
                : "text-text-secondary hover:text-gray-200"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            HOLERITE MENSAL
          </button>
          <button
            type="button"
            onClick={() => setSandboxMode("trct")}
            className={`flex-1 md:flex-none px-4 py-2 rounded-lg text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              sandboxMode === "trct" 
                ? "bg-accent-primary text-slate-950 shadow-md" 
                : "text-text-secondary hover:text-gray-200"
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            EMISSÃO DE TRCT
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT: Scenario builders (4 Cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl p-6 border border-white/5 space-y-6 text-left">
          <div className="flex items-center gap-2 border-b border-white/5 pb-4">
            <Sliders className="w-4 h-4 text-accent-primary" />
            <div>
              <h3 className="text-xs font-mono font-bold text-gray-100 uppercase tracking-wider">
                Configuração de Variáveis
              </h3>
              <p className="text-[11px] text-text-secondary">
                {sandboxMode === "holerite" 
                  ? "Parâmetros normais de um holerite de folha mensal ordinário." 
                  : "Definições e datas do distrato trabalhista para geração do TRCT."}
              </p>
            </div>
          </div>

          {/* CBO Picker */}
          <div className="space-y-2">
            <label className="text-[10px] font-mono font-bold text-text-secondary block tracking-wider uppercase">
              Ocupação contratada (CBO)
            </label>
            <select
              id="sandbox-cbo-picker"
              value={selectedCboCode}
              onChange={(e) => setSelectedCboCode(e.target.value)}
              className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-2.5 focus:border-accent-primary focus:outline-none text-gray-200 text-xs font-mono cursor-pointer"
            >
              {CBOS_DATA.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.codigo} - {c.ocupacao}
                </option>
              ))}
            </select>
          </div>

          {/* CBO Indicators */}
          <div className="grid grid-cols-4 gap-2 bg-slate-950/40 p-3 rounded-xl border border-white/5 text-center">
            <div>
              <span className="text-[8px] text-text-secondary block font-bold">CTPS DIGITAL</span>
              <span className={`text-[10px] font-mono font-bold ${selectedCbo.ct === 1 ? "text-accent-primary" : "text-gray-600"}`}>
                {selectedCbo.ct === 1 ? "SIM" : "NÃO"}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-text-secondary block font-bold">REG. OBRIGATÓRIO</span>
              <span className={`text-[10px] font-mono font-bold ${selectedCbo.ro === 1 ? "text-accent-primary" : "text-gray-600"}`}>
                {selectedCbo.ro === 1 ? "SIM" : "NÃO"}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-text-secondary block font-bold">EXAME CLÍNICO</span>
              <span className={`text-[10px] font-mono font-bold ${selectedCbo.ee === 1 ? "text-accent-primary" : "text-gray-600"}`}>
                {selectedCbo.ee === 1 ? "REQUER" : "ISENTO"}
              </span>
            </div>
            <div>
              <span className="text-[8px] text-text-secondary block font-bold">INSALUBRIDADE</span>
              <span className={`text-[10px] font-mono font-bold ${selectedCbo.rda === 1 ? "text-accent-primary" : "text-gray-600"}`}>
                {selectedCbo.rda === 1 ? "APLICA" : "ISENTO"}
              </span>
            </div>
          </div>

          {/* Salary Slider */}
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-mono text-text-secondary uppercase text-[10px] tracking-wider font-bold">Salário Base de Admissão</span>
              <span className="font-mono font-black text-accent-primary text-sm">
                R$ {salario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <input
              id="sandbox-salary-slider"
              type="range"
              min="1412" 
              max="15000"
              step="100"
              value={salario}
              onChange={(e) => setSalario(Number(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-primary"
            />
            <span className="text-[10px] text-text-secondary block italic">
              Média salarial de mercado para CBO: R$ {selectedCbo.salarioMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Jornada Semanal / Horas Semanais */}
          <div className="space-y-2 border-t border-white/5 pt-4">
            <label className="text-[10px] font-mono font-bold text-text-secondary block tracking-wider uppercase">
              Jornada Semanal (Horas Semanais)
            </label>
            <select
              id="sandbox-horas-semanais"
              value={horasSemanais}
              onChange={(e) => setHorasSemanais(Number(e.target.value))}
              className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-2.5 focus:border-accent-primary focus:outline-none text-gray-200 text-xs font-mono cursor-pointer"
            >
              <option value={44}>44 Horas Semanais (Divisor 220)</option>
              <option value={40}>40 Horas Semanais (Divisor 200)</option>
              <option value={36}>36 Horas Semanais (Divisor 180)</option>
              <option value={30}>30 Horas Semanais (Divisor 150)</option>
              <option value={20}>20 Horas Semanais (Divisor 100)</option>
            </select>
            <div className="flex justify-between items-center text-[10px] font-mono text-text-secondary">
              <span>Divisor Mensal CLT:</span>
              <strong className="text-accent-primary">{divisorMensal}</strong>
            </div>
          </div>

          {/* DYNAMIC VARIABLES PER MODE */}
          {sandboxMode === "holerite" ? (
            <div className="space-y-5 border-t border-white/5 pt-4">
              
              {/* Overtime Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-text-secondary text-[10px] font-bold">HORAS EXTRAS EFETUADAS</span>
                  <span className="font-mono font-bold text-gray-200">{overtimeHours} Horas</span>
                </div>
                <input
                  id="sandbox-overtime-slider"
                  type="range"
                  min="0"
                  max="40"
                  value={overtimeHours}
                  onChange={(e) => setOvertimeHours(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex gap-4 text-xs font-mono mt-1">
                  <span className="text-text-secondary">Percentual Legal:</span>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      id="sandbox-rate-50-radio"
                      type="radio" 
                      checked={overtimeRate === 50} 
                      onChange={() => setOvertimeRate(50)} 
                      className="accent-accent-primary"
                    />
                    <span>50%</span>
                  </label>
                  <label className="flex items-center gap-1 cursor-pointer">
                    <input 
                      id="sandbox-rate-100-radio"
                      type="radio" 
                      checked={overtimeRate === 100} 
                      onChange={() => setOvertimeRate(100)} 
                      className="accent-accent-primary"
                    />
                    <span>100%</span>
                  </label>
                </div>
              </div>

              {/* Absences Selector */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-text-secondary text-[10px] font-bold">FALTAS INJUSTIFICADAS</span>
                  <span className="font-mono font-bold text-accent-error">{unjustifiedAbsences} faltas</span>
                </div>
                <input
                  id="sandbox-absences-slider"
                  type="range"
                  min="0"
                  max="10"
                  value={unjustifiedAbsences}
                  onChange={(e) => setUnjustifiedAbsences(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-error"
                />
                {unjustifiedAbsences > 0 && (
                  <span className="text-[10px] text-accent-warning flex items-center gap-1 font-mono">
                    ⚠️ Acarreta desconto proporcional e perda de 1 dia de DSR.
                  </span>
                )}
              </div>

              {/* Vale Transporte toggle */}
              <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-xl border border-white/5">
                <div className="text-xs">
                  <span className="text-gray-200 block font-bold font-sans">Opção Vale-Transporte (6%)</span>
                  <span className="text-[10px] text-text-secondary font-mono">Desconto limite legal em folha.</span>
                </div>
                <button
                  id="sandbox-vt-toggle"
                  type="button"
                  onClick={() => setVtRequired(!vtRequired)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    vtRequired ? "bg-accent-primary/20 border border-accent-primary text-accent-primary" : "bg-slate-900 text-gray-500 border border-white/5"
                  }`}
                >
                  {vtRequired ? "ATIVO" : "INATIVO"}
                </button>
              </div>

            </div>
          ) : (
            <div className="space-y-5 border-t border-white/5 pt-4">
              
              {/* Motivo Desligamento */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-text-secondary block tracking-wider uppercase">
                  Motivo da Rescisão (CLT)
                </label>
                <select
                  value={motivoDesligamento}
                  onChange={(e) => {
                    const val = e.target.value;
                    setMotivoDesligamento(val);
                    if (val === "justa-causa") {
                      setAvisoPrevio("ausente");
                    } else if (val === "pedido") {
                      setAvisoPrevio("descontado");
                    } else {
                      setAvisoPrevio("indenizado");
                    }
                  }}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-2 focus:border-accent-primary focus:outline-none text-gray-200 text-xs font-mono cursor-pointer"
                >
                  <option value="sem-justa">Dispensa Sem Justa Causa (Empregador)</option>
                  <option value="pedido">Pedido de Demissão (Empregado)</option>
                  <option value="justa-causa">Dispensa Com Justa Causa</option>
                  <option value="acordo">Rescisão por Acordo Comum</option>
                </select>
              </div>

              {/* Aviso Prévio Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-text-secondary block tracking-wider uppercase">
                  Regime de Aviso Prévio
                </label>
                <select
                  value={avisoPrevio}
                  onChange={(e) => setAvisoPrevio(e.target.value)}
                  disabled={motivoDesligamento === "justa-causa"}
                  className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-2 focus:border-accent-primary focus:outline-none text-gray-200 text-xs font-mono cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="indenizado">Aviso Prévio Indenizado</option>
                  <option value="trabalhado">Aviso Prévio Trabalhado</option>
                  <option value="descontado">Aviso Prévio Descontado (Pedido s/ aviso)</option>
                  <option value="ausente">Não Aplicável / Dispensado</option>
                </select>
              </div>

              {/* Anos Trabalhados Slider (Lei 12.506/2011) */}
              <div className="space-y-2 bg-slate-950/25 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-text-secondary text-[10px] font-bold uppercase">Tempo de Serviço (Anos Completos)</span>
                  <span className="font-mono font-bold text-gray-200">{anosTrabalhados} {anosTrabalhados === 1 ? "Ano" : "Anos"}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="1"
                  value={anosTrabalhados}
                  onChange={(e) => setAnosTrabalhados(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
                <div className="flex justify-between text-[10px] font-mono text-text-secondary pt-1">
                  <span>Aviso Proporcional:</span>
                  <strong className="text-accent-primary">{diasAvisoPrevio} dias</strong>
                </div>
              </div>

              {/* Saldo de Salarios Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-text-secondary text-[10px] font-bold uppercase">Saldo de Salários (Dias de Trabalho)</span>
                  <span className="font-mono font-bold text-gray-200">{diasSaldoSalario} Dias</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={diasSaldoSalario}
                  onChange={(e) => setDiasSaldoSalario(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
              </div>

              {/* Meses 13o Proporcional */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-text-secondary text-[10px] font-bold uppercase">Meses de 13º Proporcional (Avos)</span>
                  <span className="font-mono font-bold text-gray-200">{mesesTrabalhadosAno}/12 Avos</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={mesesTrabalhadosAno}
                  onChange={(e) => setMesesTrabalhadosAno(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
              </div>

              {/* Férias Proporcionais Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-mono text-text-secondary text-[10px] font-bold uppercase">Férias Proporcionais (Avos)</span>
                  <span className="font-mono font-bold text-gray-200">{mesesFeriasProporcionais}/12 Avos</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="12"
                  value={mesesFeriasProporcionais}
                  onChange={(e) => setMesesFeriasProporcionais(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                />
              </div>

              {/* Tem Férias Vencidas Toggle */}
              <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-xl border border-white/5">
                <div className="text-xs">
                  <span className="text-gray-200 block font-bold font-sans">Possui Férias Vencidas Integrais?</span>
                  <span className="text-[10px] text-text-secondary font-mono">Caso tenha completado período aquisitivo.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setTemFeriasVencidas(!temFeriasVencidas)}
                  className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                    temFeriasVencidas ? "bg-accent-primary/20 border border-accent-primary text-accent-primary" : "bg-slate-900 text-gray-500 border border-white/5"
                  }`}
                >
                  {temFeriasVencidas ? "SIM (12/12)" : "NÃO (0/12)"}
                </button>
              </div>

            </div>
          )}

          {/* JSON Export and Tools */}
          <div className="space-y-2 pt-4 border-t border-white/5">
            <button
              id="sandbox-export-json-btn"
              type="button"
              onClick={handleExportJSON}
              className="w-full bg-slate-950 hover:bg-slate-900 text-accent-primary border border-accent-primary/20 hover:border-accent-primary/55 font-sans font-bold text-xs uppercase p-3 rounded-lg cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <FileJson className="w-4 h-4" />
              Exportar Cenário (.JSON)
            </button>
            
            {exportSuccess && (
              <div className="text-center animate-bounce">
                <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Cenário exportado com sucesso!
                </span>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Results and Document Preview (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {sandboxMode === "holerite" ? (
            <div className="glass-panel rounded-2xl p-6 border border-accent-primary/25 bg-slate-900/40 space-y-6 text-left">
              <div className="flex justify-between items-center border-b border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-accent-primary" />
                  <h2 className="text-sm font-sans font-bold text-accent-primary uppercase tracking-wider">
                    Demonstrativo de Folha Estimado
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-text-secondary bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  MENSALISTA | DIVISOR {divisorMensal} (Valor Hora: R$ {valorHoraBase.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})
                </span>
              </div>

              <div className="space-y-4 text-xs font-mono">
                {/* Salario base visual */}
                <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
                  <div>
                    <span className="text-gray-200 block font-bold text-xs">Vencimento Base</span>
                    <span className="text-[10px] text-text-secondary">Salário nominal acordado no contrato</span>
                  </div>
                  <span className="text-gray-100 font-black text-sm">
                    R$ {salario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                  </span>
                </div>

                {/* Overtime rate visual */}
                {overtimeHours > 0 && (
                  <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
                    <div>
                      <span className="text-emerald-400 block font-bold text-xs">Horas Extras (+{overtimeRate}%)</span>
                      <span className="text-[10px] text-text-secondary">
                        {overtimeHours}h x R$ {valorHoraExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/h
                      </span>
                    </div>
                    <span className="text-emerald-400 font-black text-sm">
                      + R$ {totalOvertimeRemuneration.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Absences visual */}
                {unjustifiedAbsences > 0 && (
                  <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
                    <div>
                      <span className="text-accent-error block font-bold text-xs">Desconto Faltas Injustificadas</span>
                      <span className="text-[10px] text-text-secondary">
                        {unjustifiedAbsences} dia(s) x R$ {valorFaltaUnitario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/dia
                      </span>
                    </div>
                    <span className="text-accent-error font-black text-sm">
                      - R$ {totalAbsencesLoss.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* DSR visual if absences */}
                {unjustifiedAbsences > 0 && (
                  <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
                    <div>
                      <span className="text-accent-error block font-bold text-xs">Perda de Descanso Semanal (DSR)</span>
                      <span className="text-[10px] text-text-secondary">1 dia de DSR descontado por faltas na semana</span>
                    </div>
                    <span className="text-accent-error font-black text-sm">
                      - R$ {dsrLoss.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* VT visual */}
                {vtRequired && (
                  <div className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-white/5">
                    <div>
                      <span className="text-gray-300 block font-bold text-xs">Desconto Vale-Transporte (6%)</span>
                      <span className="text-[10px] text-text-secondary">Limite legal integral</span>
                    </div>
                    <span className="text-accent-error font-black text-sm">
                      - R$ {vtMaxDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                {/* Total Balance Box */}
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-accent-primary/20 space-y-3 mt-4">
                  <div className="flex justify-between text-xs font-sans text-text-secondary">
                    <span>Total de Vencimentos:</span>
                    <span className="text-gray-200 font-bold">
                      R$ {holeriteVencimentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs font-sans text-text-secondary">
                    <span>Total de Descontos:</span>
                    <span className="text-accent-error font-bold">
                      R$ {holeriteDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                    <span className="text-accent-primary font-black text-xs uppercase tracking-widest">
                      LÍQUIDO A RECEBER:
                    </span>
                    <span className="text-accent-primary font-black text-xl font-mono">
                      R$ {holeriteLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Tributos estimate */}
                <div className="bg-white/5 p-4 rounded-xl border border-white/5 space-y-2 mt-2 text-[10px] text-text-secondary text-left">
                  <div className="flex justify-between">
                    <span>Base de Cálculo FGTS:</span>
                    <span className="text-gray-300 font-mono">R$ {holeriteVencimentos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Depósito FGTS Estimado (8%):</span>
                    <span className="text-gray-300 font-mono">R$ {(holeriteVencimentos * 0.08).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* TRCT - RECIBO DE QUITAÇÃO (Matches screenshot and Phase 6+ requirements) */
            <div className="space-y-4">
              {/* Informative Alert Banner */}
              <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-4 flex items-start gap-3 text-left">
                <UserCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-emerald-400 font-sans font-bold text-xs uppercase tracking-wider">
                    📋 EMISSÃO DE QUITAÇÃO DE CONTRATO (TRCT) - ATIVO
                  </h4>
                  <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                    Você está operando o simulador oficial de rescisões da CLT. Esta ferramenta emite e gera o demonstrativo de verbas rescisórias para impressão direta ou homologação do e-Social.
                  </p>
                </div>
              </div>

              {/* The ERP UI replica "Recibo de Quitação" */}
              <div 
                ref={printAreaRef}
                className="bg-white text-black p-6 rounded-2xl border border-slate-300 shadow-xl space-y-6 text-left text-xs font-sans max-h-[750px] overflow-y-auto print:max-h-none print:overflow-visible print:border-none print:shadow-none"
              >
                
                {/* Header Replica from ERP */}
                <div className="border-b-2 border-slate-800 pb-3 flex justify-between items-center">
                  <div>
                    <h2 className="text-base font-bold text-blue-900 tracking-tight flex items-center gap-1.5 uppercase font-serif">
                      🏛️ Recibo de Quitação de Rescisão (TRCT)
                    </h2>
                    <p className="text-[10px] text-slate-500 font-mono font-bold uppercase">
                      WORKSIM RH - Sistemas de Folha de Pagamento v14.0
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={triggerPrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors border-none print:hidden"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Imprimir Termo
                  </button>
                </div>

                {/* Metadata block */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-slate-100 p-3 rounded-lg border border-slate-200 text-[11px]">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block uppercase font-mono text-[9px]">Empresa</span>
                    <strong className="text-slate-850">0007 - WORKSIM S.A.</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block uppercase font-mono text-[9px]">Funcionário</span>
                    <strong className="text-slate-850">00001 - {selectedCbo.ocupacao.toUpperCase()}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block uppercase font-mono text-[9px]">Admissão</span>
                    <strong className="text-slate-850">01/01/2024</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block uppercase font-mono text-[9px]">Afastamento</span>
                    <strong className="text-slate-850">26/10/2025</strong>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-150 p-3 rounded-lg border border-slate-200 text-[11px] mt-2">
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block uppercase font-mono text-[9px]">Motivo do Desligamento</span>
                    <strong className="text-blue-900 font-bold uppercase">
                      {motivoDesligamento === "sem-justa" && "02 - Dispensa Sem Justa Causa"}
                      {motivoDesligamento === "pedido" && "01 - Pedido de Demissão voluntário"}
                      {motivoDesligamento === "justa-causa" && "03 - Dispensa Com Justa Causa"}
                      {motivoDesligamento === "acordo" && "04 - Acordo Comum (Art. 484-A)"}
                    </strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block uppercase font-mono text-[9px]">Maior Remuneração</span>
                    <strong className="text-slate-850">R$ {salario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-500 block uppercase font-mono text-[9px]">Aviso Prévio</span>
                    <strong className="text-slate-850 uppercase">{avisoPrevio} ({diasAvisoPrevio} dias)</strong>
                  </div>
                </div>

                {/* Table Breakdown of Proventos and Descontos */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  
                  {/* Proventos (Earnings) column */}
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 text-xs uppercase flex items-center justify-between">
                      <span>Proventos</span>
                      <span className="text-emerald-700 font-mono text-[10px]">Cód - Descrição</span>
                    </h4>
                    <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                      
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span>051 - Saldo Salários ({diasSaldoSalario}d)</span>
                        <span className="font-bold">R$ {trctSaldoSalario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>

                      {trctAvisoPrevioIndenizado > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>069 - Aviso Prévio Indenizado {avisoPrevio === "trabalhado" ? `(Surto Proporcional: ${diasAvisoPrevio - 30}d)` : `(${diasAvisoPrevio}d)`}</span>
                          <span className="font-bold">R$ {trctAvisoPrevioIndenizado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctDecimoTerceiroProp > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>055 - 13º Salário Proporcional ({mesesTrabalhadosAno}/12)</span>
                          <span className="font-bold">R$ {trctDecimoTerceiroProp.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctDecimoTerceiroAviso > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>057 - 13º s/ Aviso Prévio Indenizado</span>
                          <span className="font-bold">R$ {trctDecimoTerceiroAviso.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctFeriasVencidas > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>067 - Férias Vencidas Integrais (12/12)</span>
                          <span className="font-bold">R$ {trctFeriasVencidas.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctFeriasProporcionais > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>267 - Férias Proporcionais ({mesesFeriasProporcionais}/12)</span>
                          <span className="font-bold">R$ {trctFeriasProporcionais.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctFeriasAviso > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>269 - Férias s/ Aviso Prévio Indenizado</span>
                          <span className="font-bold">R$ {trctFeriasAviso.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {(trctTercoFeriasVencidas > 0 || trctTercoFeriasProp > 0) && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>068 - 1/3 Férias (Constitucional)</span>
                          <span className="font-bold">R$ {(trctTercoFeriasVencidas + trctTercoFeriasProp).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctTercoFeriasAviso > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>270 - 1/3 Férias s/ Aviso Indenizado</span>
                          <span className="font-bold">R$ {trctTercoFeriasAviso.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900 text-xs">
                        <span>TOTAL BRUTO</span>
                        <span>R$ {trctTotalBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Descontos (Deductions) column */}
                  <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                    <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-1 text-xs uppercase flex items-center justify-between">
                      <span>Descontos / Retenções</span>
                      <span className="text-rose-700 font-mono text-[10px]">Cód - Descrição</span>
                    </h4>
                    <div className="space-y-1.5 font-mono text-[11px] text-slate-700">
                      
                      <div className="flex justify-between border-b border-slate-50 pb-1">
                        <span>101 - Previdência Social (INSS Saldo)</span>
                        <span className="font-bold text-rose-600">R$ {trctInssSalario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>

                      {trctInssDecimoTerceiro > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>103 - Previdência Social s/ 13º Salário</span>
                          <span className="font-bold text-rose-600">R$ {trctInssDecimoTerceiro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctAvisoPrevioDescontado > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>115 - Desconto de Aviso Prévio</span>
                          <span className="font-bold text-rose-600">R$ {trctAvisoPrevioDescontado.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctIrrfSalarios > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>194 - I.R.R.F. s/ Saldo de Salários</span>
                          <span className="font-bold text-rose-600">R$ {trctIrrfSalarios.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctIrrfDecimoTerceiro > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>193 - I.R.R.F. s/ 13º Salário</span>
                          <span className="font-bold text-rose-600">R$ {trctIrrfDecimoTerceiro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctIrrfFerias > 0 && (
                        <div className="flex justify-between border-b border-slate-50 pb-1">
                          <span>191 - I.R.R.F. s/ Férias e Terço</span>
                          <span className="font-bold text-rose-600">R$ {trctIrrfFerias.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                        </div>
                      )}

                      {trctTotalDescontos === 0 && (
                        <div className="text-center text-slate-400 italic text-[10px] py-4">
                          Nenhum desconto tributário retido.
                        </div>
                      )}

                      <div className="flex justify-between pt-2 border-t border-slate-200 font-bold text-slate-900 text-xs">
                        <span>TOTAL DESCONTOS</span>
                        <span>R$ {trctTotalDescontos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* FGTS Summary box replica */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-2 mt-4 text-[11px]">
                  <h4 className="font-bold text-slate-800 uppercase text-[10px] tracking-wider mb-1">
                    Bases e Valores de Depósitos / FGTS do Termo
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-slate-600">
                    <div>
                      <span>FGTS Quitação</span>
                      <strong className="block text-slate-800 font-mono">R$ {trctFgtsQuitacao.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div>
                      <span>FGTS 13º Salário</span>
                      <strong className="block text-slate-800 font-mono">R$ {trctFgtsDecimoTerceiro.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div>
                      <span>Multa Rescisória (40%)</span>
                      <strong className="block text-slate-800 font-mono">R$ {trctMultaFgts.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                    <div>
                      <span>Base FGTS Termo</span>
                      <strong className="block text-slate-800 font-mono">R$ {(trctSaldoSalario + trctDecimoTerceiroProp).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</strong>
                    </div>
                  </div>
                </div>

                {/* Final Net Liquido Row */}
                <div className="bg-blue-900 text-white p-5 rounded-xl flex flex-col md:flex-row justify-between items-center gap-4 mt-4 shadow-glow shadow-blue-900/10">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-blue-200">
                      VALOR LÍQUIDO DA QUITAÇÃO (TRCT):
                    </h3>
                    <p className="text-[10px] text-blue-150 leading-relaxed">
                      Termo homologável em conformidade legal com a legislação brasileira do Trabalho (CLT) vigente.
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono tracking-tight text-white block">
                      R$ {trctLiquido.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Signature placeholders */}
                <div className="grid grid-cols-2 gap-6 pt-6 mt-6 border-t border-slate-200 text-center text-[10px] text-slate-500">
                  <div className="space-y-8">
                    <div className="border-b border-slate-350 mx-auto w-3/4"></div>
                    <span>ASSINATURA DO COLABORADOR</span>
                  </div>
                  <div className="space-y-8">
                    <div className="border-b border-slate-350 mx-auto w-3/4"></div>
                    <span>REPRESENTANTE WORKSIM S.A.</span>
                  </div>
                </div>

              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
