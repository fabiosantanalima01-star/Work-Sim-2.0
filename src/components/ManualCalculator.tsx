/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Calculator, Check, AlertCircle, PlusCircle, MinusCircle, Percent, ArrowRight, Table, Info } from "lucide-react";

export default function ManualCalculator() {
  const [salario, setSalario] = useState<string>("1800,00");
  const [divisor, setDivisor] = useState<number>(220);
  const [percentual, setPercentual] = useState<number>(50); // 50%, 100%
  const [horas, setHoras] = useState<string>("02:30");
  const [tab, setTab] = useState<"adicional" | "desconto" | "percentual">("adicional");
  const [horasDesconto, setHorasDesconto] = useState<string>("01:15");
  const [descontarDSR, setDescontarDSR] = useState<boolean>(false);

  // States for the newly added Percentual (%) calculations
  const [percentBaseVal, setPercentBaseVal] = useState<string>("1800,00");
  const [percentRate, setPercentRate] = useState<string>("6");
  const [percentOp, setPercentOp] = useState<"desconto" | "adicional">("desconto");
  const [activePercentSubTab, setActivePercentSubTab] = useState<"simples" | "inss" | "irrf">("simples");
  const [dependentes, setDependentes] = useState<number>(0);
  const [pensao, setPensao] = useState<string>("0,00");

  // Parse formatted float (money/rates)
  const getNumericValue = (val: string) => {
    const cleanStr = val.replace(/\./g, '').replace(',', '.');
    const num = Number(cleanStr);
    return isNaN(num) ? 0 : num;
  };

  // Convert clock times (HH:MM or HH:MM:SS) or decimal numbers into fractional hours
  const parseToHours = (val: string): number => {
    const cleanStr = val.trim();
    if (!cleanStr) return 0;
    
    // Check if it's formatted as HH:MM or HH:MM:SS
    if (cleanStr.includes(":")) {
      const parts = cleanStr.split(":");
      const h = parseInt(parts[0], 10) || 0;
      const m = parseInt(parts[1], 10) || 0;
      const s = parts[2] ? (parseInt(parts[2], 10) || 0) : 0;
      return h + (m / 60) + (s / 3600);
    }
    
    // Otherwise parse as standard float with comma/dot
    const numericStr = cleanStr.replace(/\./g, "").replace(",", ".");
    const num = parseFloat(numericStr);
    return isNaN(num) ? 0 : num;
  };

  // Live parsed hour metrics helper
  const parsedHorasExtras = parseToHours(horas);
  const parsedHorasDesconto = parseToHours(horasDesconto);

  // Calculations
  const valorHoraComum = getNumericValue(salario) / divisor;
  
  // Tab 1: Overtime
  const multiplicador = 1 + percentual / 100;
  const valorHoraExtra = valorHoraComum * multiplicador;
  const valorTotalCredito = valorHoraExtra * parsedHorasExtras;

  // Tab 2: Discounts
  // Direct hour discount = hourly base rate * parsed hours
  // DSR = 1 full day of work (SalaryBase / 30) or based on hours (7.33 hours for 220h standard)
  const valorDiaTrabalho = getNumericValue(salario) / 30;
  const valorTotalDescontoHoras = valorHoraComum * parsedHorasDesconto;
  const valorDsrDesconto = descontarDSR ? valorDiaTrabalho : 0;
  const valorTotalDebito = valorTotalDescontoHoras + valorDsrDesconto;

  // Tab 3: Percentages & Deductions/Additions
  const parsedPercentBase = getNumericValue(percentBaseVal);
  const parsedPercentRate = parseFloat(percentRate.replace(',', '.')) || 0;
  const valorAliquota = parsedPercentBase * (parsedPercentRate / 100);
  const valorFinalAliquota = percentOp === "desconto" ? parsedPercentBase - valorAliquota : parsedPercentBase + valorAliquota;

  // Progressive INSS Simulation calculations (Updated reference limits)
  const calculateProgressiveINSS = (baseValue: number) => {
    const currentCeiling = 8475.55;
    const baseVal = Math.min(baseValue, currentCeiling);

    const f1Limit = 1621.00;
    const f2Limit = 2902.84;
    const f3Limit = 4354.27;
    
    const f1Value = Math.min(baseVal, f1Limit);
    let f1Contrib = f1Value * 0.075;
    if (f1Value === f1Limit) {
      f1Contrib = 121.57; // Keep exact official 1st faixa limit contribution
    } else {
      f1Contrib = Math.round(f1Contrib * 100) / 100;
    }

    const f2Value = baseVal > f1Limit ? Math.min(baseVal, f2Limit) - f1Limit : 0;
    const f2Contrib = Math.round(f2Value * 0.09 * 100) / 100;

    const f3Value = baseVal > f2Limit ? Math.min(baseVal, f3Limit) - f2Limit : 0;
    const f3Contrib = Math.round(f3Value * 0.12 * 100) / 100;

    const f4Value = baseVal > f3Limit ? baseVal - f3Limit : 0;
    const f4Contrib = Math.round(f4Value * 0.14 * 100) / 100;

    const totalINSS = f1Contrib + f2Contrib + f3Contrib + f4Contrib;
    const effectivePercentage = baseValue > 0 ? (totalINSS / baseValue) * 100 : 0;

    return {
      f1Value, f1Contrib,
      f2Value, f2Contrib,
      f3Value, f3Contrib,
      f4Value, f4Contrib,
      totalINSS,
      effectivePercentage,
      isCapped: baseValue > currentCeiling
    };
  };

  const inssResult = calculateProgressiveINSS(parsedPercentBase);

  const calculateIRRF2026Details = (baseVal: number, deps: number, pensaoVal: number) => {
    const VALOR_DEPENDENTE = 189.59;
    const deducaoTotal = (deps * VALOR_DEPENDENTE) + pensaoVal;
    const baseLiquida = Math.max(0, baseVal - deducaoTotal);
    
    let impostoBruto = 0;
    let aliquotaNominal = "Isento";
    let deducaoFaixa = 0;
    
    if (baseLiquida > 0) {
      if (baseLiquida <= 2428.80) {
        impostoBruto = 0;
        aliquotaNominal = "Isento";
        deducaoFaixa = 0;
      } else if (baseLiquida <= 2826.65) {
        impostoBruto = (baseLiquida * 0.075) - 182.16;
        aliquotaNominal = "7,5%";
        deducaoFaixa = 182.16;
      } else if (baseLiquida <= 3751.05) {
        impostoBruto = (baseLiquida * 0.15) - 394.16;
        aliquotaNominal = "15,0%";
        deducaoFaixa = 394.16;
      } else if (baseLiquida <= 4664.68) {
        impostoBruto = (baseLiquida * 0.225) - 675.49;
        aliquotaNominal = "22,5%";
        deducaoFaixa = 675.49;
      } else {
        impostoBruto = (baseLiquida * 0.275) - 908.73;
        aliquotaNominal = "27,5%";
        deducaoFaixa = 908.73;
      }
    }
    
    impostoBruto = Math.max(0, impostoBruto);
    
    let reducaoLei = 0;
    let isentoPorLei = false;
    let impostoFinal = impostoBruto;
    
    if (baseLiquida <= 5000.00) {
      if (impostoBruto > 0) {
        reducaoLei = impostoBruto;
        isentoPorLei = true;
      }
      impostoFinal = 0;
    } else if (baseLiquida <= 7350.00) {
      let reducao = 978.62 - (0.133145 * baseLiquida);
      if (reducao < 0) reducao = 0;
      reducaoLei = reducao;
      impostoFinal = Math.max(0, impostoBruto - reducao);
    } else {
      reducaoLei = 0;
      impostoFinal = impostoBruto;
    }
    
    const finalRounded = parseFloat(impostoFinal.toFixed(2));
    const effectivePercentage = baseVal > 0 ? (finalRounded / baseVal) * 100 : 0;
    
    return {
      valorDependenteLegal: VALOR_DEPENDENTE,
      deducaoTotal,
      baseLiquida,
      aliquotaNominal,
      deducaoFaixa,
      impostoBruto,
      reducaoLei,
      isentoPorLei,
      impostoFinal: finalRounded,
      effectivePercentage
    };
  };

  const irrfResult = calculateIRRF2026Details(
    parsedPercentBase,
    dependentes,
    getNumericValue(pensao)
  );

  return (
    <div id="manual-calculator-widget" className="glass-panel p-5 rounded-xl border border-white/5 text-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-accent-primary animate-pulse" />
        <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-accent-primary">
          Calculadora de Apoio CLIPS
        </h3>
      </div>
      
      <p className="text-xs text-text-secondary mb-4 leading-relaxed font-sans">
        Ferramenta de operação manual em conformidade com a CLT. Use os dados apurados para auditar e homologar com precisão decodificada.
      </p>

      {/* Tabs configuration inside widget */}
      <div className="grid grid-cols-3 gap-1 mb-4 bg-slate-950/60 p-1 rounded-lg border border-white/5 text-[10px] font-mono">
        <button
          type="button"
          onClick={() => setTab("adicional")}
          className={`py-1.5 rounded flex items-center justify-center gap-1 transition-all select-none cursor-pointer ${
            tab === "adicional"
              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          <PlusCircle className="w-3.5 h-3.5" />
          Horas (+)
        </button>
        <button
          type="button"
          onClick={() => setTab("desconto")}
          className={`py-1.5 rounded flex items-center justify-center gap-1 transition-all select-none cursor-pointer ${
            tab === "desconto"
              ? "bg-rose-500/10 text-rose-400 border border-rose-500/20 font-bold"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          <MinusCircle className="w-3.5 h-3.5" />
          Faltas (-)
        </button>
        <button
          type="button"
          onClick={() => setTab("percentual")}
          className={`py-1.5 rounded flex items-center justify-center gap-1 transition-all select-none cursor-pointer ${
            tab === "percentual"
              ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold"
              : "text-gray-400 hover:text-gray-200 hover:bg-white/5"
          }`}
        >
          <Percent className="w-3.5 h-3.5" />
          Alíquotas (%)
        </button>
      </div>

      <div className="space-y-4 font-mono text-xs">
        {/* Salario Base Input (Shared) */}
        <div>
          <label className="block text-text-secondary mb-1 uppercase tracking-wider text-[10px]">SALÁRIO BASE (R$)</label>
          <input
            id="calc-salario-input"
            type="text"
            value={salario}
            onChange={(e) => setSalario(e.target.value)}
            className="w-full bg-slate-950/70 border border-white/10 rounded p-2 focus:border-accent-primary focus:outline-none text-accent-primary"
            placeholder="Ex: 2.117,91"
          />
        </div>

        {/* Divisor Sector Selector (Shared) */}
        <div>
          <label className="block text-text-secondary mb-1 uppercase tracking-wider text-[10px]">DIVISOR DE JORNADA</label>
          <div className="grid grid-cols-3 gap-1">
            {[220, 200, 180].map((div) => (
              <button
                id={`calc-div-${div}`}
                key={div}
                type="button"
                onClick={() => setDivisor(div)}
                className={`p-1.5 rounded transition-all select-none border border-transparent ${
                  divisor === div
                    ? "bg-accent-primary/20 border-accent-primary text-accent-primary font-bold"
                    : "bg-slate-900 text-gray-400 hover:bg-slate-850"
                }`}
              >
                {div}h
              </button>
            ))}
          </div>
          <span className="text-[10px] text-text-secondary mt-1 block">
            {divisor === 220 ? "Para jornada de 44h/sem" : divisor === 200 ? "Para jornada de 40h/sem" : "Para jornada de 36h/sem"}
          </span>
        </div>

        {tab === "adicional" ? (
          <>
            {/* Adicional Multiplier percentage */}
            <div>
              <label className="block text-text-secondary mb-1 uppercase tracking-wider text-[10px]">ADICIONAL HORAS EXTRAS (%)</label>
              <div className="grid grid-cols-2 gap-1 font-sans">
                {[50, 100].map((rate) => (
                  <button
                    id={`calc-rate-${rate}`}
                    key={rate}
                    type="button;onClick"
                    onClick={() => setPercentual(rate)}
                    className={`p-1.5 rounded transition-all select-none border border-transparent cursor-pointer ${
                      percentual === rate
                        ? "bg-accent-primary/20 border-accent-primary text-accent-primary font-bold"
                        : "bg-slate-900 text-gray-400 hover:bg-slate-850"
                    }`}
                  >
                    {rate}%
                  </button>
                ))}
              </div>
            </div>

            {/* Overtime Hours quantity */}
            <div>
              <label className="block text-text-secondary mb-1 uppercase tracking-wider text-[10px]">CANTIDADE / PERÍODO EXTRA</label>
              <input
                id="calc-horas-input"
                type="text"
                value={horas}
                onChange={(e) => setHoras(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 rounded p-2 focus:border-accent-primary focus:outline-none text-emerald-400"
                placeholder="Ex: 02:30 ou 2,5"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Converta tempo (HH:MM) ou use decimal. Apurado: <strong className="text-emerald-400">{parsedHorasExtras.toFixed(4).replace('.', ',')} horas</strong>
              </span>
            </div>

            {/* Creditos Outputs */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Vlr Hora Base:</span>
                <span className="text-gray-300 font-semibold">
                  R$ {valorHoraComum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Vlr Hora Extra (+{percentual}%):</span>
                <span className="text-gray-300 font-semibold">
                  R$ {valorHoraExtra.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-white/10 my-2 pt-2 flex justify-between">
                <span className="text-emerald-400 font-semibold uppercase text-[11px] tracking-wider">CRÉDITO APURADO:</span>
                <span className="text-emerald-400 text-sm font-bold font-mono">
                  R$ {isLoadingValue(valorTotalCredito) ? "0,00" : valorTotalCredito.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </>
        ) : tab === "desconto" ? (
          <>
            {/* Discount Hours Quantity */}
            <div>
              <label className="block text-text-secondary mb-1 uppercase tracking-wider text-[10px]">QUANTIDADE / PERÍODO DE ATRASO/FALTA</label>
              <input
                id="calc-horas-desconto-input"
                type="text"
                value={horasDesconto}
                onChange={(e) => setHorasDesconto(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 rounded p-2 focus:border-accent-primary focus:outline-none text-rose-400"
                placeholder="Ex: 01:15 ou 1,25"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">
                Apurado: <strong className="text-rose-400">{parsedHorasDesconto.toFixed(4).replace('.', ',')} horas</strong> de atraso.
              </span>
            </div>

            {/* DSR Discount Toggle */}
            <div className="flex items-start gap-2 bg-slate-950/30 p-2 rounded border border-white/5">
              <input
                id="calc-dsr-checkbox"
                type="checkbox"
                checked={descontarDSR}
                onChange={(e) => setDescontarDSR(e.target.checked)}
                className="w-4 h-4 rounded border-white/10 text-accent-primary bg-slate-950 focus:ring-accent-primary mt-0.5 cursor-pointer accent-accent-primary"
              />
              <div className="space-y-0.5 cursor-pointer" onClick={() => setDescontarDSR(!descontarDSR)}>
                <span className="text-[11px] font-semibold text-gray-200 block uppercase">Descontar DSR do Período?</span>
                <span className="text-[9px] text-gray-500 block leading-tight">Retém 1 dia de descanso face à ausência/atraso injustificado na semana (Art. 6 Lei 605/49).</span>
              </div>
            </div>

            {/* Debito Outputs */}
            <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 space-y-2 mt-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Vlr Hora Base:</span>
                <span className="text-gray-300 font-semibold">
                  R$ {valorHoraComum.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Desconto de Horas:</span>
                <span className="text-red-400 font-semibold">
                  - R$ {valorTotalDescontoHoras.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {descontarDSR && (
                <div className="flex justify-between">
                  <span className="text-text-secondary">Desconto DSR (1 Dia):</span>
                  <span className="text-red-400 font-semibold">
                    - R$ {valorDiaTrabalho.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="border-t border-white/10 my-2 pt-2 flex justify-between">
                <span className="text-rose-400 font-semibold uppercase text-[11px] tracking-wider">TOTAL DESCONTO:</span>
                <span className="text-rose-400 text-sm font-bold font-mono">
                  R$ {isLoadingValue(valorTotalDebito) ? "0,00" : valorTotalDebito.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </>
        ) : (
          /* Custom Percentage (%) area with simple discount/add and progressive INSS options */
          <div className="space-y-4">
            {/* Sub-navigation of % Tab */}
            <div className="grid grid-cols-3 gap-1 p-0.5 bg-slate-900 rounded border border-white/5 text-[9px] font-sans">
              <button
                type="button"
                onClick={() => setActivePercentSubTab("simples")}
                className={`py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activePercentSubTab === "simples"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/10"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Percent className="w-2.5 h-2.5 text-cyan-400 text-xs" />
                <span>Simples</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePercentSubTab("inss")}
                className={`py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activePercentSubTab === "inss"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/10"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Table className="w-2.5 h-2.5 text-cyan-400 text-xs" />
                <span>INSS</span>
              </button>
              <button
                type="button"
                onClick={() => setActivePercentSubTab("irrf")}
                className={`py-1.5 rounded flex items-center justify-center gap-1 cursor-pointer transition-all ${
                  activePercentSubTab === "irrf"
                    ? "bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/10"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Calculator className="w-2.5 h-2.5 text-cyan-400 text-xs" />
                <span>IRRF 2026</span>
              </button>
            </div>

            {/* Base de Cálculo Input */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-text-secondary uppercase tracking-wider text-[10px]">BASE DE CÁLCULO (R$)</label>
                <button
                  type="button"
                  onClick={() => setPercentBaseVal(salario)}
                  className="text-[9px] text-cyan-400 hover:text-cyan-300 border border-cyan-400/20 px-1.5 py-0.5 rounded bg-cyan-950/20 font-sans cursor-pointer transition-all hover:scale-105 active:scale-95"
                  title="Copiar o valor do Salário Base principal da calculadora"
                >
                  Usar Salário Base
                </button>
              </div>
              <input
                id="percent-base-input"
                type="text"
                value={percentBaseVal}
                onChange={(e) => setPercentBaseVal(e.target.value)}
                className="w-full bg-slate-950/70 border border-white/10 rounded p-2 focus:border-cyan-400 focus:outline-none text-cyan-300"
                placeholder="Ex: 1.800,00"
              />
            </div>

            {activePercentSubTab === "simples" ? (
              <>
                {/* Operação Selector */}
                <div>
                  <label className="block text-text-secondary mb-1 uppercase tracking-wider text-[10px]">TIPO DE LANÇAMENTO</label>
                  <div className="grid grid-cols-2 gap-1 text-[10px] font-sans">
                    <button
                      type="button"
                      onClick={() => setPercentOp("desconto")}
                      className={`p-1.5 rounded transition-all cursor-pointer border border-transparent ${
                        percentOp === "desconto"
                          ? "bg-rose-500/20 border-rose-500/40 text-rose-300 font-bold"
                          : "bg-slate-900 text-gray-400"
                      }`}
                    >
                      Desconto (-)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPercentOp("adicional")}
                      className={`p-1.5 rounded transition-all cursor-pointer border border-transparent ${
                        percentOp === "adicional"
                          ? "bg-emerald-500/20 border-emerald-500/40 text-emerald-300 font-bold"
                          : "bg-slate-900 text-gray-400"
                      }`}
                    >
                      Adicional (+)
                    </button>
                  </div>
                </div>

                {/* Percentage rate input */}
                <div>
                  <label className="block text-text-secondary mb-1 uppercase tracking-wider text-[10px]">ALÍQUOTA / PERCENTUAL (%)</label>
                  <input
                    id="percent-rate-input"
                    type="text"
                    value={percentRate}
                    onChange={(e) => setPercentRate(e.target.value)}
                    className="w-full bg-slate-950/70 border border-white/10 rounded p-2 focus:border-cyan-400 focus:outline-none text-cyan-300 mb-1.5"
                    placeholder="Ex: 6"
                  />
                  
                  {/* Preset percents */}
                  <div className="grid grid-cols-4 gap-1 font-sans text-[8px] tracking-tight">
                    {[
                      { l: "6% (VT)", v: "6" },
                      { l: "8% (FGTS)", v: "8" },
                      { l: "20% (Insal.)", v: "20" },
                      { l: "30% (Peric.)", v: "30" },
                      { l: "7.5% (F1)", v: "7.5" },
                      { l: "9% (F2)", v: "9" },
                      { l: "12% (F3)", v: "12" },
                      { l: "14% (F4)", v: "14" }
                    ].map((item) => (
                      <button
                        key={item.l}
                        type="button"
                        onClick={() => setPercentRate(item.v)}
                        className={`p-1 rounded cursor-pointer border hover:border-cyan-400/30 transition-all ${
                          percentRate === item.v 
                            ? "bg-cyan-950/40 border-cyan-400/40 text-cyan-400 font-bold" 
                            : "bg-slate-900/60 border-transparent text-gray-400"
                        }`}
                      >
                        {item.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Calculation outcomes card */}
                <div className="bg-slate-950/60 p-3 rounded-lg border border-white/5 space-y-2 mt-2">
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Base Utilizada:</span>
                    <span className="text-gray-300 font-semibold">
                      R$ {parsedPercentBase.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-secondary">Percentual Aplicado:</span>
                    <span className="text-cyan-400 font-bold">{parsedPercentRate.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 2 })}%</span>
                  </div>
                  
                  <div className="border-t border-white/10 my-2 pt-2 space-y-2">
                    <div className="flex justify-between">
                      <span className={`${percentOp === "desconto" ? "text-rose-400" : "text-emerald-400"} font-semibold uppercase text-[10px]`}>
                        {percentOp === "desconto" ? "VALOR DO DESCONTO:" : "VALOR DO ADICIONAL:"}
                      </span>
                      <span className={`${percentOp === "desconto" ? "text-rose-455" : "text-emerald-455"} font-bold text-xs font-mono`}>
                        {percentOp === "desconto" ? "- " : "+ "} 
                        R$ {isLoadingValue(valorAliquota) ? "0,00" : valorAliquota.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between pt-1 border-t border-white/5 font-sans">
                      <span className="text-text-secondary text-[10px] uppercase">LÍQUIDO ESTIMADO:</span>
                      <span className="text-gray-100 font-bold font-mono text-xs">
                        R$ {isLoadingValue(valorFinalAliquota) ? "0,00" : valorFinalAliquota.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </>
            ) : activePercentSubTab === "inss" ? (
              <>
                {/* Progressive INSS Breakdowns */}
                <div className="space-y-1.5 font-sans text-[10px]">
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider mb-1 font-mono">
                    <Info className="w-3.5 h-3.5 text-cyan-450" />
                    Cálculo Progressivo (INSS)
                  </div>

                  {/* Bracket 1 */}
                  <div className="bg-slate-950/40 p-2 rounded border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between text-gray-300 font-mono text-[10px]">
                      <span className="font-semibold text-cyan-300">1ª Faixa (7,5% - Até R$ 1.621,00):</span>
                      <span className="text-rose-400 font-bold">R$ {inssResult.f1Contrib.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-none">
                      Base na faixa: {inssResult.f1Value > 0 ? `R$ ${inssResult.f1Value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"} x 7,5%  (Cálculo Prático: Salário Integral x 7,5%)
                    </span>
                  </div>

                  {/* Bracket 2 */}
                  <div className="bg-slate-950/40 p-2 rounded border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between text-gray-300 font-mono text-[10px]">
                      <span className="font-semibold text-cyan-300">2ª Faixa (9,0% - R$ 1.621,01 a R$ 2.902,84):</span>
                      <span className="text-rose-400 font-bold">R$ {inssResult.f2Contrib.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-none">
                      Base na faixa: {inssResult.f2Value > 0 ? `R$ ${inssResult.f2Value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"} x 9,0%  (Cálculo Prático: R$ 1.621,00 x 7,5% + excedente x 9%)
                    </span>
                  </div>

                  {/* Bracket 3 */}
                  <div className="bg-slate-950/40 p-2 rounded border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between text-gray-300 font-mono text-[10px]">
                      <span className="font-semibold text-cyan-300">3ª Faixa (12,0% - R$ 2.902,85 a R$ 4.354,27):</span>
                      <span className="text-rose-400 font-bold">R$ {inssResult.f3Contrib.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-none">
                      Base na faixa: {inssResult.f3Value > 0 ? `R$ ${inssResult.f3Value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"} x 12,0% (Cálculo Prático: F1 + F2 + excedente x 12%)
                    </span>
                  </div>

                  {/* Bracket 4 */}
                  <div className="bg-slate-950/40 p-2 rounded border border-white/5 flex flex-col justify-between">
                    <div className="flex justify-between text-gray-300 font-mono text-[10px] flex-wrap">
                      <span className="font-semibold text-cyan-300">4ª Faixa (14,0% - R$ 4.354,28 até o Teto):</span>
                      <span className="text-rose-400 font-bold">R$ {inssResult.f4Contrib.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <span className="text-[9px] text-gray-500 leading-none">
                      Base na faixa: {inssResult.f4Value > 0 ? `R$ ${inssResult.f4Value.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "R$ 0,00"} x 14,0% (Cálculo Prático: Soma F1+F2+F3 + excedente x 14%)
                    </span>
                  </div>

                  {/* Reference Table of INSS brackets requested by the user */}
                  <div id="quick-access-panel" className="border-2 border-cyan-400 rounded-xl p-5 bg-slate-950 shadow-2xl mt-5 font-sans ring-4 ring-cyan-400/20">
                    <div className="flex items-center gap-2.5 mb-4 border-b-2 border-cyan-400 pb-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30 animate-pulse" />
                      <span className="text-sm md:text-base font-black text-white uppercase tracking-widest font-sans">
                        Tabela de Referência Oficial (INSS 2026)
                      </span>
                    </div>
                    
                    <div className="space-y-2 font-sans">
                      {/* Grid Header */}
                      <div className="grid grid-cols-12 bg-slate-900/90 border border-cyan-400/40 py-2.5 px-4 font-black text-cyan-300 text-[10px] md:text-xs tracking-wider uppercase rounded-t-lg">
                        <div className="col-span-3 text-left">Faixa</div>
                        <div className="col-span-4 text-left">Salário de Contribuição</div>
                        <div className="col-span-2 text-center">Alíquota</div>
                        <div className="col-span-3 text-right">Cálculo Prático</div>
                      </div>
                      
                      {/* 1st Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-4 py-3 border border-white/15 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-500/5 transition-all duration-150">
                        <div className="col-span-3 font-black text-gray-100 text-xs md:text-sm">1ª Faixa</div>
                        <div className="col-span-4 text-white font-black text-xs md:text-sm">Até R$ 1.621,00</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700/90 px-3 py-1 rounded border border-emerald-500 text-xs md:text-sm shadow-sm inline-block">7,5%</span>
                        </div>
                        <div className="col-span-3 text-right text-emerald-400 font-mono font-black text-xs md:text-sm">Base x 7,5%</div>
                      </div>

                      {/* 2nd Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-4 py-3 border border-white/15 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-500/5 transition-all duration-150">
                        <div className="col-span-3 font-black text-gray-100 text-xs md:text-sm">2ª Faixa</div>
                        <div className="col-span-4 text-white font-black text-xs md:text-sm">R$ 1.621,01 a 2.902,84</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700/90 px-3 py-1 rounded border border-emerald-500 text-xs md:text-sm shadow-sm inline-block">9,0%</span>
                        </div>
                        <div className="col-span-3 text-right text-yellow-300 font-mono font-black text-xs md:text-sm">R$ 121,57 + exc. x 9%</div>
                      </div>

                      {/* 3rd Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-4 py-3 border border-white/15 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-500/5 transition-all duration-150">
                        <div className="col-span-3 font-black text-gray-100 text-xs md:text-sm">3ª Faixa</div>
                        <div className="col-span-4 text-white font-black text-xs md:text-sm">R$ 2.902,85 a 4.354,27</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700/90 px-3 py-1 rounded border border-emerald-500 text-xs md:text-sm shadow-sm inline-block">12,0%</span>
                        </div>
                        <div className="col-span-3 text-right text-yellow-300 font-mono font-black text-xs md:text-sm">R$ 236,94 + exc. x 12%</div>
                      </div>

                      {/* 4th Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-4 py-3 border border-white/15 hover:border-cyan-400/60 shadow-lg hover:shadow-cyan-500/5 transition-all duration-150 rounded-b-lg">
                        <div className="col-span-3 font-black text-gray-100 text-xs md:text-sm">4ª Faixa</div>
                        <div className="col-span-4 text-white font-black text-xs md:text-sm">R$ 4.354,28 ao Teto</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700/90 px-3 py-1 rounded border border-emerald-500 text-xs md:text-sm shadow-sm inline-block">14,0%</span>
                        </div>
                        <div className="col-span-3 text-right text-yellow-300 font-mono font-black text-xs md:text-sm">R$ 411,11 + exc. x 14%</div>
                      </div>
                    </div>
                  </div>

                  {/* Result progressive summaries */}
                  <div className="bg-slate-950/70 p-3 rounded-lg border border-cyan-500/25 space-y-1.5 mt-2 font-sans">
                    <div className="flex justify-between font-mono">
                      <span className="text-rose-400 font-bold uppercase tracking-wider text-[10px]">INSS DEDUZIDO:</span>
                      <span className="text-rose-400 font-black text-xs">
                        - R$ {isLoadingValue(inssResult.totalINSS) ? "0,00" : inssResult.totalINSS.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="flex justify-between font-mono text-[9px] text-gray-450 border-t border-white/5 pt-1.5">
                      <span>Alíquota Efetiva:</span>
                      <span className="font-semibold text-gray-300">
                        {isLoadingValue(inssResult.effectivePercentage) ? "0,0%" : `${inssResult.effectivePercentage.toFixed(2)}%`}
                      </span>
                    </div>
                    {inssResult.isCapped && (
                      <div className="text-[8px] text-amber-400 leading-normal font-sans pt-1">
                        ⚠️ Base acima de R$ 8.475,55. Aplicado o valor limite do Teto Previdenciário Nacional.
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Brand new IRRF 2026 Tab */}
                <div className="space-y-3 font-sans">
                  <div className="text-[10px] text-gray-400 flex items-center gap-1 uppercase tracking-wider font-mono">
                    <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                    Simulador Detalhado de IRRF (2026)
                  </div>

                  {/* Dependentes Field */}
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1.5">
                    <label className="block text-text-secondary text-[10px] uppercase tracking-wide font-mono">Dependentes Legais de IRRF</label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setDependentes(Math.max(0, dependentes - 1))}
                        className="p-1 px-3 rounded bg-slate-950 text-white hover:bg-slate-900 font-black border border-white/10 active:scale-90 transition-all select-none cursor-pointer"
                        title="Subtrair Dependente"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-white font-black text-sm bg-slate-950 py-1 rounded inline-block font-mono border border-cyan-500/20">{dependentes}</span>
                      <button
                        type="button"
                        onClick={() => setDependentes(dependentes + 1)}
                        className="p-1 px-3 rounded bg-slate-950 text-white hover:bg-slate-900 font-black border border-white/10 active:scale-90 transition-all select-none cursor-pointer"
                        title="Adicionar Dependente"
                      >
                        +
                      </button>
                      <span className="text-[10px] text-cyan-300 font-mono font-bold pl-1">Dedução: R$ {(dependentes * 189.59).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                    </div>
                  </div>

                  {/* Pensao Alimenticia Field */}
                  <div className="bg-slate-900/60 p-2.5 rounded-lg border border-white/5 space-y-1">
                    <label className="block text-text-secondary text-[10px] uppercase tracking-wide font-mono">Pensão Alimentícia Descontada (R$)</label>
                    <input
                      type="text"
                      value={pensao}
                      onChange={(e) => setPensao(e.target.value)}
                      className="w-full bg-slate-950/75 border border-white/10 rounded p-2 focus:border-cyan-400 focus:outline-none text-cyan-300 font-mono font-semibold"
                      placeholder="Ex: 0,00"
                    />
                  </div>

                  {/* Calculation Outcomes Card */}
                  <div className="bg-slate-950/70 p-4 rounded-xl border border-cyan-500/25 space-y-2 mt-2 leading-relaxed">
                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Base Bruta de IRRF:</span>
                      <span className="text-gray-300 font-bold font-mono">
                        R$ {parsedPercentBase.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    {irrfResult.deducaoTotal > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-rose-450">(-) Deduções Legais:</span>
                        <span className="text-rose-450 font-bold font-mono">
                          - R$ {irrfResult.deducaoTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-xs pt-1 border-t border-white/5">
                      <span className="text-cyan-300 font-semibold">(=) Base de Cálculo Líquida:</span>
                      <span className="text-cyan-300 font-black font-mono">
                        R$ {irrfResult.baseLiquida.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-text-secondary">Faixa Real de Enquadramento:</span>
                      <span className="text-white font-bold bg-slate-900 border border-white/10 px-2 py-0.5 rounded font-mono text-[10px]">
                        {irrfResult.aliquotaNominal} {irrfResult.deducaoFaixa > 0 && `(Dedução de R$ ${irrfResult.deducaoFaixa.toLocaleString("pt-BR", { minimumFractionDigits: 2 })})`}
                      </span>
                    </div>

                    {irrfResult.impostoBruto > 0 && (
                      <div className="flex justify-between text-xs">
                        <span className="text-text-secondary">Imposto de Renda Bruto:</span>
                        <span className="text-gray-300 font-bold font-mono">
                          R$ {irrfResult.impostoBruto.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}

                    {irrfResult.reducaoLei > 0 && (
                      <div className="flex justify-between items-center bg-emerald-950/40 p-2 rounded border border-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                        <span>(-) Redução Isenção Lei nº 15.270/2025:</span>
                        <span className="font-mono font-black">- R$ {irrfResult.reducaoLei.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                      </div>
                    )}

                    <div className="border-t-2 border-cyan-400 pt-2 flex justify-between items-center">
                      <span className="text-rose-400 font-black uppercase text-[11px] tracking-wider">IMPOSTO DE RENDA RETIDO (IRRF):</span>
                      <span className="text-rose-405 text-sm md:text-base font-black font-mono">
                        R$ {isLoadingValue(irrfResult.impostoFinal) ? "0,00" : irrfResult.impostoFinal.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex justify-between font-mono text-[9px] text-gray-450 border-t border-white/5 pt-1.5">
                      <span>Alíquota Efetiva Real:</span>
                      <span className="font-semibold text-gray-300">
                        {isLoadingValue(irrfResult.effectivePercentage) ? "0,0%" : `${irrfResult.effectivePercentage.toFixed(2)}%`}
                      </span>
                    </div>
                  </div>

                  {/* Reference Table of IRRF brackets */}
                  <div className="border-2 border-cyan-400 rounded-xl p-5 bg-slate-950 shadow-2xl mt-4 font-sans ring-4 ring-cyan-400/20">
                    <div className="flex items-center gap-2.5 mb-4 border-b-2 border-cyan-400 pb-3">
                      <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 ring-4 ring-cyan-400/30 animate-pulse" />
                      <span className="text-xs md:text-sm font-black text-white uppercase tracking-widest font-sans">
                        Tabela de IRRF Progressiva Oficial (2026)
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="grid grid-cols-12 bg-slate-900 border-b-2 border-cyan-400/50 pb-3 pt-2 font-black text-cyan-300 text-[11px] md:text-xs tracking-wider uppercase px-2 rounded-lg">
                        <div className="col-span-4 text-left">Base Líquida</div>
                        <div className="col-span-2 text-center">Alíquota</div>
                        <div className="col-span-3 text-right">Dedução Tabela</div>
                        <div className="col-span-3 text-right">Corte (Lei 15.270/25)</div>
                      </div>
                      
                      {/* 1st Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-3 py-2 rounded-xl border border-cyan-500/35 hover:border-cyan-400 transition-all duration-150">
                        <div className="col-span-4 font-black text-white text-xs md:text-sm">Até R$ 2.428,80</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700 px-2 py-0.5 rounded border border-emerald-500 text-xs shadow-sm inline-block">0,0%</span>
                        </div>
                        <div className="col-span-3 text-right text-cyan-300 font-mono font-medium text-xs">Isento</div>
                        <div className="col-span-3 text-right text-emerald-450 font-bold text-[11px] font-sans">Totalmente Isento</div>
                      </div>

                      {/* 2nd Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-3 py-2 rounded-xl border border-cyan-500/35 hover:border-cyan-400 transition-all duration-150">
                        <div className="col-span-4 font-black text-white text-xs md:text-sm">De 2.428,81 a 2.826,65</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700 px-2 py-0.5 rounded border border-emerald-500 text-xs shadow-sm inline-block">7,5%</span>
                        </div>
                        <div className="col-span-3 text-right text-gray-200 font-mono text-xs">R$ 182,16</div>
                        <div className="col-span-3 text-right text-emerald-450 font-bold text-[11px] font-sans">Isento (Até R$ 5k)</div>
                      </div>

                      {/* 3rd Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-3 py-2 rounded-xl border border-cyan-500/35 hover:border-cyan-400 transition-all duration-150">
                        <div className="col-span-4 font-black text-white text-xs md:text-sm">De 2.826,66 a 3.751,05</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700 px-2 py-0.5 rounded border border-emerald-500 text-xs shadow-sm inline-block">15,0%</span>
                        </div>
                        <div className="col-span-3 text-right text-gray-200 font-mono text-xs">R$ 394,16</div>
                        <div className="col-span-3 text-right text-emerald-450 font-bold text-[11px] font-sans">Isento (Até R$ 5k)</div>
                      </div>

                      {/* 4th Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-3 py-2 rounded-xl border border-cyan-500/35 hover:border-cyan-400 transition-all duration-150">
                        <div className="col-span-4 font-black text-white text-xs md:text-sm">De 3.751,06 a 4.664,68</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700 px-2 py-0.5 rounded border border-emerald-500 text-xs shadow-sm inline-block">22,5%</span>
                        </div>
                        <div className="col-span-3 text-right text-gray-200 font-mono text-xs">R$ 675,49</div>
                        <div className="col-span-3 text-right text-emerald-450 font-bold text-[11px] font-sans">Isento (Até R$ 5k)</div>
                      </div>

                      {/* 5th Bracket Row */}
                      <div className="grid grid-cols-12 items-center bg-slate-900 px-3 py-2 rounded-xl border border-cyan-500/35 hover:border-cyan-400 transition-all duration-150">
                        <div className="col-span-4 font-black text-white text-xs md:text-sm">Acima de R$ 4.664,68</div>
                        <div className="col-span-2 text-center">
                          <span className="text-white font-black bg-emerald-700 px-2 py-0.5 rounded border border-emerald-500 text-xs shadow-sm inline-block">27,5%</span>
                        </div>
                        <div className="col-span-3 text-right text-gray-200 font-mono text-xs">R$ 908,73</div>
                        <div className="col-span-3 text-right text-orange-400 font-bold text-[10px] sm:text-[11px] font-sans">Redução progressiva</div>
                      </div>
                    </div>

                    {/* Note on Law 15.270/2025 */}
                    <div className="bg-slate-900/80 rounded-lg p-2.5 border border-cyan-500/10 mt-3 font-sans text-[10px] text-cyan-300 leading-normal">
                      🌟 <strong>Importante (Lei nº 15.270/2025):</strong> Contribuintes com Base Líquida de até <strong>R$ 5.000,00</strong> possuem isenção integral. Entre <strong>R$ 5.000,01 e R$ 7.350,00</strong>, é aplicada uma redução progressiva dada pela formula legal: <code>Redução = 978,62 - (0,133145 x Base)</code>.
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function isLoadingValue(v: number): boolean {
  return isNaN(v) || !isFinite(v);
}
