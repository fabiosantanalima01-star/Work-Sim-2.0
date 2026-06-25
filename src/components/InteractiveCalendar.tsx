/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Info, HelpCircle } from "lucide-react";

// Easter holiday calculation algorithm (Meeus/Jones/Butcher)
function getEasterRelatedHolidays(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31); // 3 = March, 4 = April
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  
  const easter = new Date(year, month - 1, day);
  
  // Carnaval is 47 days before Easter
  const carnaval = new Date(easter.getTime());
  carnaval.setDate(easter.getDate() - 47);
  
  // Sexta-feira Santa (Good Friday) is 2 days before Easter
  const sextaSanta = new Date(easter.getTime());
  sextaSanta.setDate(easter.getDate() - 2);
  
  // Corpus Christi is 60 days after Easter
  const corpusChristi = new Date(easter.getTime());
  corpusChristi.setDate(easter.getDate() + 60);

  const fmt = (d: Date) => 
    `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;

  return {
    carnaval: fmt(carnaval),
    sextaSanta: fmt(sextaSanta),
    corpusChristi: fmt(corpusChristi)
  };
}

export default function InteractiveCalendar() {
  const currentYear = new Date().getFullYear();
  // Initialize to June 2026 for convenience since Phase 3 is mostly June 2026/May 2026
  const [selectedMonth, setSelectedMonth] = useState<number>(5); // 0-indexed (5 = June)
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [sabadoUtil, setSabadoUtil] = useState<boolean>(true); // Saturdays count as business days for DSR by default

  const MONTHS_LABELS = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  // Dynamically compute holidays for the active year
  const holidaysMap = useMemo(() => {
    const mobile = getEasterRelatedHolidays(selectedYear);
    const h: Record<string, { name: string; isOptional?: boolean }> = {
      "01/01": { name: "Confraternização Universal" },
      [mobile.carnaval]: { name: "Carnaval (Ponto Facultativo)", isOptional: true },
      [mobile.sextaSanta]: { name: "Sexta-Feira Santa" },
      "21/04": { name: "Tiradentes" },
      "01/05": { name: "Dia do Trabalho" },
      [mobile.corpusChristi]: { name: "Corpus Christi (Feriado Comercial)" },
      "07/09": { name: "Independência do Brasil" },
      "12/10": { name: "Nossa Senhora Aparecida" },
      "02/11": { name: "Finados" },
      "15/11": { name: "Proclamação da República" },
      "20/11": { name: "Dia da Consciência Negra" },
      "25/12": { name: "Natal" }
    };
    return h;
  }, [selectedYear]);

  // Compute stats of the chosen month
  const monthData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const firstDayOfWeek = new Date(selectedYear, selectedMonth, 1).getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    let sundaysCount = 0;
    let saturdaysCount = 0;
    let holidaysCount = 0;
    let workingDaysCount = 0;

    const daysDetails = [];

    for (let d = 1; d <= daysInMonth; d++) {
      const curDate = new Date(selectedYear, selectedMonth, d);
      const dayOfWeek = curDate.getDay();
      const dayKey = `${String(d).padStart(2, "0")}/${String(selectedMonth + 1).padStart(2, "0")}`;
      const holidayInfo = holidaysMap[dayKey];
      const isOfficialHoliday = holidayInfo && !holidayInfo.isOptional;

      let type: "work" | "sunday" | "saturday" | "holiday" = "work";

      if (dayOfWeek === 0) {
        sundaysCount++;
        type = "sunday";
      } else if (isOfficialHoliday) {
        holidaysCount++;
        type = "holiday";
      } else if (dayOfWeek === 6) {
        saturdaysCount++;
        type = "saturday";
        if (sabadoUtil) {
          workingDaysCount++;
        }
      } else {
        workingDaysCount++;
      }

      daysDetails.push({
        day: d,
        dayOfWeek,
        isHoliday: !!holidayInfo,
        holidayName: holidayInfo?.name || null,
        isOptionalHoliday: holidayInfo?.isOptional || false,
        type
      });
    }

    // Commercial calculation DSR
    // Sundays + Official Non-Optional Holidays represent DSR days
    const totalDsrDays = sundaysCount + holidaysCount;
    // Business Days = Total Days in Month - Sundays - Holidays (and maybe Saturdays if not working day)
    const totalBusinessDays = daysInMonth - sundaysCount - holidaysCount - (sabadoUtil ? 0 : saturdaysCount);

    return {
      daysInMonth,
      firstDayOfWeek,
      sundaysCount,
      saturdaysCount,
      holidaysCount,
      workingDaysCount,
      totalDsrDays,
      totalBusinessDays,
      daysDetails
    };
  }, [selectedMonth, selectedYear, holidaysMap, sabadoUtil]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear(v => v - 1);
    } else {
      setSelectedMonth(v => v - 1);
    }
    setSelectedDay(null);
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear(v => v + 1);
    } else {
      setSelectedMonth(v => v + 1);
    }
    setSelectedDay(null);
  };

  const activeDayInfo = useMemo(() => {
    if (!selectedDay) return null;
    return monthData.daysDetails.find(d => d.day === selectedDay) || null;
  }, [selectedDay, monthData]);

  return (
    <div id="interactive-calendar-widget" className="glass-panel p-5 rounded-xl border border-white/5 text-gray-200 mt-4">
      <div className="flex items-center gap-2 mb-4">
        <CalendarIcon className="w-5 h-5 text-accent-primary" />
        <h3 className="font-sans font-semibold text-sm uppercase tracking-wider text-accent-primary">
          Calendário Comercial do Mês (DSR)
        </h3>
      </div>

      <p className="text-xs text-text-secondary mb-4 leading-relaxed font-sans">
        Navegue por qualquer mês e ano real para levantar a contagem de dias úteis e repousos (DSR) oficiais, em conformidade com a Lei 605/49.
      </p>

      {/* Selector controls */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <button
          type="button"
          onClick={handlePrevMonth}
          className="p-1 px-2 bg-slate-900 border border-white/10 hover:border-accent-primary hover:text-white transition-all rounded text-gray-400 cursor-pointer active:scale-90 select-none pb-1"
          title="Mês Anterior"
        >
          <ChevronLeft className="w-4 h-4 inline" />
        </button>

        <div className="flex gap-1.5 flex-1 justify-center">
          <select
            value={selectedMonth}
            onChange={(e) => { setSelectedMonth(Number(e.target.value)); setSelectedDay(null); }}
            className="bg-slate-950/80 border border-white/10 rounded px-2 py-1 font-sans text-xs focus:outline-none focus:border-accent-primary text-white cursor-pointer"
          >
            {MONTHS_LABELS.map((m, idx) => (
              <option key={m} value={idx} className="bg-slate-950 text-white">{m}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => { setSelectedYear(Number(e.target.value)); setSelectedDay(null); }}
            className="bg-slate-950/85 border border-white/10 rounded px-2 py-1 font-mono text-xs focus:outline-none focus:border-accent-primary text-white cursor-pointer"
          >
            {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
              <option key={y} value={y} className="bg-slate-950 text-white">{y}</option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleNextMonth}
          className="p-1 px-2 bg-slate-900 border border-white/10 hover:border-accent-primary hover:text-white transition-all rounded text-gray-400 cursor-pointer active:scale-90 select-none pb-1"
          title="Próximo Mês"
        >
          <ChevronRight className="w-4 h-4 inline" />
        </button>
      </div>

      {/* Grid wrapper */}
      <div className="border border-white/5 rounded-lg p-3 bg-slate-950/40 font-mono text-xs mb-4">
        <div className="grid grid-cols-7 gap-1 text-[11px] text-center font-bold text-gray-400 border-b border-white/10 pb-1.5 mb-2">
          <div className="text-rose-450 uppercase">Dom</div>
          <div className="uppercase">Seg</div>
          <div className="uppercase">Ter</div>
          <div className="uppercase">Qua</div>
          <div className="uppercase">Qui</div>
          <div className="uppercase">Sex</div>
          <div className="text-amber-400 uppercase">Sáb</div>
        </div>

        <div className="grid grid-cols-7 gap-1.5 text-center">
          {/* Empty placeholders for first day of week offset */}
          {Array.from({ length: monthData.firstDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="text-gray-700 py-1.5">-</div>
          ))}

          {/* Actual days */}
          {monthData.daysDetails.map((d) => {
            const isSelected = selectedDay === d.day;
            
            let colorClasses = "text-white hover:bg-white/10";
            if (d.type === "sunday") {
              colorClasses = "text-rose-400 bg-rose-500/10 hover:bg-rose-500/20";
            } else if (d.type === "holiday") {
              if (d.isOptionalHoliday) {
                colorClasses = "text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20";
              } else {
                colorClasses = "text-pink-405 bg-pink-500/15 hover:bg-pink-500/25 font-bold ring-1 ring-pink-500/10";
              }
            } else if (d.type === "saturday") {
              colorClasses = "text-amber-300 bg-amber-500/5 hover:bg-amber-500/10";
            }

            if (isSelected) {
              colorClasses = "bg-accent-primary text-black font-black hover:bg-accent-primary ring-2 ring-white/50";
            }

            return (
              <button
                key={`day-${d.day}`}
                type="button"
                onClick={() => setSelectedDay(d.day)}
                className={`py-1.5 rounded transition-all select-none cursor-pointer flex flex-col items-center justify-center font-bold relative text-xs ${colorClasses}`}
                title={d.holidayName || `${d.day} de ${MONTHS_LABELS[selectedMonth]}`}
              >
                <span>{d.day}</span>
                {d.isHoliday && !isSelected && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-0.5 ${d.isOptionalHoliday ? "bg-cyan-400" : "bg-pink-500"}`} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day explanation mini box */}
      {activeDayInfo && (
        <div className="mb-4 p-2.5 bg-slate-900 border border-white/10 rounded-lg text-[11px] font-sans text-left animate-fade-in">
          <div className="flex justify-between font-bold text-gray-200">
            <span>Dia {selectedDay} / {MONTHS_LABELS[selectedMonth]} {selectedYear}:</span>
            <span className="text-gray-400">{["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"][activeDayInfo.dayOfWeek]}</span>
          </div>
          {activeDayInfo.isHoliday ? (
            <p className="mt-1 text-pink-400 font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-pink-500 inline-block shrink-0" />
              Feriado: {activeDayInfo.holidayName} {activeDayInfo.isOptionalHoliday && "(Ponto Facultativo)"}
            </p>
          ) : activeDayInfo.dayOfWeek === 0 ? (
            <p className="mt-1 text-rose-450 font-semibold">Repouso Semanal Remunerado (DSR / Domingo)</p>
          ) : activeDayInfo.dayOfWeek === 6 ? (
            <p className="mt-1 text-amber-400 font-semibold">Sábado {sabadoUtil ? "(Dia Útil Comercial de DP)" : "(Compensado / Não Útil)"}</p>
          ) : (
            <p className="mt-1 text-emerald-400">Dia de trabalho ordinário ordinário</p>
          )}
        </div>
      )}

      {/* Toggle corporate parameter */}
      <div className="flex items-center gap-2 mb-4 bg-slate-950/35 p-2 rounded-lg border border-white/5 font-sans">
        <input
          id="sabado-util-toggle"
          type="checkbox"
          checked={sabadoUtil}
          onChange={(e) => setSabadoUtil(e.target.checked)}
          className="w-3.5 h-3.5 rounded border-white/10 text-accent-primary bg-slate-950 focus:ring-accent-primary cursor-pointer accent-accent-primary"
        />
        <label
          htmlFor="sabado-util-toggle"
          className="text-[10px] sm:text-[11px] text-gray-300 font-semibold cursor-pointer select-none leading-none"
        >
          Sábado é dia de trabalho comercial para DSR?
        </label>
        <HelpCircle className="w-3 h-3 text-gray-400 shrink-0" title="Por praxe na Justiça do Trabalho (Lei 605/49), sábados contam como dias úteis para o cálculo do DSR de funcionários mensalistas que recebem horas extras ou prêmios." />
      </div>

      {/* Analytical result counts summary */}
      <div id="dsr-summary-panel" className="bg-slate-900/60 p-3 rounded-lg border border-white/5 font-mono text-[11px] space-y-1.5 text-left">
        <div className="flex justify-between">
          <span className="text-gray-400">Dias no Mês:</span>
          <span className="text-white font-bold">{monthData.daysInMonth} dias</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Sábados no mês:</span>
          <span className="text-white font-bold">{monthData.saturdaysCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Domingos (DSR):</span>
          <span className="text-white font-bold text-rose-450">{monthData.sundaysCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-400">Feriados (DSR):</span>
          <span className="text-white font-bold text-pink-405">{monthData.holidaysCount}</span>
        </div>

        <div className="border-t border-white/13 my-2 pt-1.5 space-y-1.5 font-sans">
          <div className="flex justify-between text-xs font-black">
            <span className="text-emerald-400 uppercase tracking-wider text-[10px]">1. Dias Úteis (Divisor DSR):</span>
            <span className="text-emerald-400 font-mono text-[13px]">{monthData.totalBusinessDays} dias</span>
          </div>
          <div className="flex justify-between text-xs font-black">
            <span className="text-rose-400 uppercase tracking-wider text-[10px]">2. Repousos (Multiplicador DSR):</span>
            <span className="text-rose-400 font-mono text-[13px]">{monthData.totalDsrDays} dias</span>
          </div>
        </div>

        <div className="border-t border-dashed border-white/5 pt-1.5 text-[9px] text-gray-500 leading-tight">
          <span className="font-bold text-gray-400 text-[10px] block mb-0.5">Equação do DSR sobre Variáveis:</span>
          DSR = (Soma das Horas Extras / {monthData.totalBusinessDays}) × {monthData.totalDsrDays}
        </div>
      </div>
    </div>
  );
}
