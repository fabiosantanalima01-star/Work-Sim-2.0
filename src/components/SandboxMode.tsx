/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { CBO } from "../types";
import { CBOS_DATA } from "../data";
import { Sliders, HelpCircle, FileJson, ArrowRight, CheckCircle2, RefreshCw } from "lucide-react";

export default function SandboxMode() {
  const [selectedCboCode, setSelectedCboCode] = useState<string>("4141-05"); // Almoxarife default
  const [salario, setSalario] = useState<number>(2117);
  const [overtimeHours, setOvertimeHours] = useState<number>(8);
  const [overtimeRate, setOvertimeRate] = useState<number>(50); // 50% or 100%
  const [unjustifiedAbsences, setUnjustifiedAbsences] = useState<number>(0);
  const [vtRequired, setVtRequired] = useState<boolean>(true);
  const [exportSuccess, setExportSuccess] = useState<boolean>(false);

  const selectedCbo = CBOS_DATA.find((c) => c.codigo === selectedCboCode) || CBOS_DATA[0];

  // Core calculations according to parametric engine standards
  const valorHoraBase = salario / 220; // Default divisor 220
  const rateMultiplier = 1 + overtimeRate / 100;
  const valorHoraExtra = valorHoraBase * rateMultiplier;
  const totalOvertimeRemuneration = valorHoraExtra * overtimeHours;

  const valorFaltaUnitario = salario / 30;
  const totalAbsencesLoss = valorFaltaUnitario * unjustifiedAbsences;
  const dsrLoss = unjustifiedAbsences > 0 ? valorFaltaUnitario : 0; // Loss of 1 day DSR if at least one unexcused absence

  const vtMaxDesconto = vtRequired ? salario * 0.06 : 0;

  // Final computed Net salary simulation
  const vencimentos = salario + totalOvertimeRemuneration;
  const descontos = totalAbsencesLoss + dsrLoss + vtMaxDesconto;
  const liquidoProjetado = vencimentos - descontos;

  const handleExportJSON = () => {
    const scenario = {
      titulo: `Simulação Paramétrica: ${selectedCbo.ocupacao}`,
      cbo: selectedCbo.codigo,
      salarioBase: salario,
      horasExtras: { qtd: overtimeHours, taxa: overtimeRate, total: Number(totalOvertimeRemuneration.toFixed(2)) },
      faltasInjustificadas: { qtd: unjustifiedAbsences, desconto: Number(totalAbsencesLoss.toFixed(2)), perdaDsr: Number(dsrLoss.toFixed(2)) },
      valeTransporte: { ativo: vtRequired, desconto: Number(vtMaxDesconto.toFixed(2)) },
      resultadoLiquido: Number(liquidoProjetado.toFixed(2)),
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
    downloadAnchor.setAttribute("download", `WorkSim_Scenario_${selectedCbo.codigo}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-1">
      
      {/* LEFT: Scenario builders */}
      <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Sliders className="w-5 h-5 text-accent-primary animate-pulse" />
          <div>
            <h2 className="text-base font-sans font-bold text-gray-100">
              Construção do Cenário Paramétrico
            </h2>
            <p className="text-xs text-text-secondary select-none">
              Defina as variáveis básicas para simular o holerite
            </p>
          </div>
        </div>

        {/* CBO Picker */}
        <div className="space-y-2">
          <label className="text-xs font-mono text-text-secondary block">
            SELECIONAR OCUPAÇÃO (CBO)
          </label>
          <select
            id="sandbox-cbo-picker"
            value={selectedCboCode}
            onChange={(e) => setSelectedCboCode(e.target.value)}
            className="w-full bg-slate-950/70 border border-white/10 rounded-lg p-2.5 focus:border-accent-primary focus:outline-none text-gray-200 text-xs font-mono"
          >
            {CBOS_DATA.map((c) => (
              <option key={c.codigo} value={c.codigo}>
                {c.codigo} - {c.ocupacao}
              </option>
            ))}
          </select>
        </div>

        {/* Dynamic representation of CBO code metadata */}
        <div className="grid grid-cols-4 gap-2 bg-slate-950/40 p-3 rounded-xl border border-white/5">
          <div className="text-center">
            <span className="text-[9px] text-text-secondary block font-bold">CT</span>
            <span className={`text-xs font-mono font-bold ${selectedCbo.ct === 1 ? "text-accent-primary" : "text-gray-600"}`}>
              {selectedCbo.ct === 1 ? "ATIVO" : "INATIVO"}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[9px] text-text-secondary block font-bold">REG. OBRIGATÓRIO</span>
            <span className={`text-xs font-mono font-bold ${selectedCbo.ro === 1 ? "text-accent-primary" : "text-gray-600"}`}>
              {selectedCbo.ro === 1 ? "SIM" : "NÃO"}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[9px] text-text-secondary block font-bold">EXAME SP</span>
            <span className={`text-xs font-mono font-bold ${selectedCbo.ee === 1 ? "text-accent-primary" : "text-gray-600"}`}>
              {selectedCbo.ee === 1 ? "REQ" : "ISENTO"}
            </span>
          </div>
          <div className="text-center">
            <span className="text-[9px] text-text-secondary block font-bold">INSALUBRIDADE</span>
            <span className={`text-xs font-mono font-bold ${selectedCbo.rda === 1 ? "text-accent-primary" : "text-gray-600"}`}>
              {selectedCbo.rda === 1 ? "APLIC" : "ISENTO"}
            </span>
          </div>
        </div>

        {/* Salary Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-text-secondary">SALÁRIO BASE CONTRATUAL</span>
            <span className="font-mono font-bold text-accent-primary">
              R$ {salario.toLocaleString("pt-BR")}
            </span>
          </div>
          <input
            id="sandbox-salary-slider"
            type="range"
            min="1412" // SM 2026/Current values
            max="15000"
            step="50"
            value={salario}
            onChange={(e) => setSalario(Number(e.target.value))}
            className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-accent-primary"
          />
          <span className="text-[10px] text-text-secondary block italic">
            Média de mercado para CBO: R$ {selectedCbo.salarioMedio.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>

        {/* Overtime Slider */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-mono text-text-secondary">HORAS EXTRAS REALIZADAS</span>
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
            <span className="text-text-secondary">Adicional:</span>
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
            <span className="font-mono text-text-secondary">FALTAS INJUSTIFICADAS NO MÊS</span>
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
              ⚠️ Perda automática de 1 dia de DSR além do dia descontado.
            </span>
          )}
        </div>

        {/* Vale Transporte toggle */}
        <div className="flex justify-between items-center bg-slate-950/20 p-3 rounded-xl border border-white/5">
          <div className="text-xs">
            <span className="text-gray-200 block font-bold font-sans">Opção Vale-Transporte (6%)</span>
            <span className="text-[10px] text-text-secondary font-mono">Desconto teto previsto em lei.</span>
          </div>
          <button
            id="sandbox-vt-toggle"
            type="button"
            onClick={() => setVtRequired(!vtRequired)}
            className={`px-3 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
              vtRequired ? "bg-accent-primary/20 border border-accent-primary text-accent-primary" : "bg-slate-900 text-gray-500 border border-white/5"
            }`}
          >
            {vtRequired ? "ATIVO" : "NÃO ATIVO"}
          </button>
        </div>

      </div>

      {/* RIGHT: Results panel simulation */}
      <div className="glass-panel rounded-2xl p-6 border border-accent-primary/25 bg-slate-900/40 space-y-6 flex flex-col justify-between">
        <div className="space-y-5">
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <h2 className="text-base font-sans font-bold text-accent-primary">
              Demonstrativo de Folha Estimado
            </h2>
            <span className="text-[10px] font-mono text-text-secondary">
              Divisor: 220 | Matriz CLT
            </span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            {/* Salario base visual */}
            <div className="flex justify-between items-center p-2.5 bg-slate-950/30 rounded-lg">
              <div>
                <span className="text-gray-300 block">Vencimento Base</span>
                <span className="text-[10px] text-text-secondary">Valor fixo de admissão</span>
              </div>
              <span className="text-gray-200 font-bold">
                R$ {salario.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Overtime rate visual */}
            <div className="flex justify-between items-center p-2.5 bg-slate-950/30 rounded-lg">
              <div>
                <span className="text-gray-300 block">Horas Extras (+{overtimeRate}%)</span>
                <span className="text-[10px] text-text-secondary">
                  {overtimeHours}h x R$ {valorHoraExtra.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}/h
                </span>
              </div>
              <span className="text-emerald-400 font-bold">
                + R$ {totalOvertimeRemuneration.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>

            {/* Absences visual */}
            {unjustifiedAbsences > 0 && (
              <div className="flex justify-between items-center p-2.5 bg-slate-950/30 rounded-lg">
                <div>
                  <span className="text-accent-error block">Desconto Faltas ({unjustifiedAbsences}d)</span>
                  <span className="text-[10px] text-text-secondary">
                    {unjustifiedAbsences} x R$ {valorFaltaUnitario.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}/dia
                  </span>
                </div>
                <span className="text-accent-error font-bold">
                  - R$ {totalAbsencesLoss.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* DSR visual if absences */}
            {unjustifiedAbsences > 0 && (
              <div className="flex justify-between items-center p-2.5 bg-slate-950/30 rounded-lg">
                <div>
                  <span className="text-accent-error block">Perda do Descanso (DSR)</span>
                  <span className="text-[10px] text-text-secondary">Falta injustificada subsequente</span>
                </div>
                <span className="text-accent-error font-bold">
                  - R$ {dsrLoss.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* VT visual */}
            {vtRequired && (
              <div className="flex justify-between items-center p-2.5 bg-slate-950/30 rounded-lg">
                <div>
                  <span className="text-gray-300 block">Seguro Vale-Transporte (6%)</span>
                  <span className="text-[10px] text-text-secondary">Recolhimento limite</span>
                </div>
                <span className="text-accent-error font-bold">
                  - R$ {vtMaxDesconto.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            )}

            {/* Total Balance box matching glass theme */}
            <div className="bg-slate-950 p-4 rounded-xl border border-accent-primary/20 space-y-2 mt-4">
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Total Bruto:</span>
                <span className="text-gray-300 font-bold">
                  R$ {vencimentos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">Total Descontos:</span>
                <span className="text-accent-error font-bold">
                  R$ {descontos.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between items-center text-sm">
                <span className="text-accent-primary font-bold">LÍQUIDO ESTIMADO:</span>
                <span className="text-accent-primary font-bold text-lg font-mono">
                  R$ {liquidoProjetado.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* JSON Export interface */}
        <div className="space-y-2 pt-4">
          <button
            id="sandbox-export-json-btn"
            type="button"
            onClick={handleExportJSON}
            className="w-full bg-accent-primary hover:bg-white text-bg-primary font-sans font-bold text-xs uppercase p-3 rounded-lg shadow-xl cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-98"
          >
            <FileJson className="w-4 h-4" />
            Exportar Cenário para Treinamentos
          </button>
          
          {exportSuccess && (
            <div className="text-center">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center justify-center gap-1 animate-pulse">
                <CheckCircle2 className="w-3.5 h-3.5" /> Cenário JSON baixado com sucesso!
              </span>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
