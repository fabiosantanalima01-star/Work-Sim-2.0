/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";

interface WorkSimLogoProps {
  variant?: "navbar" | "login" | "full" | "icon-only";
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  appLanguage?: "pt" | "en";
}

export default function WorkSimLogo({
  variant = "navbar",
  size = "md",
  className = "",
  appLanguage = "pt",
}: WorkSimLogoProps) {
  // Size mapping for the logo emblem container
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10 sm:w-11 sm:h-11",
    lg: "w-14 h-14 sm:w-16 sm:h-16",
    xl: "w-20 h-20 sm:w-24 sm:h-24",
  };

  const svgSizes = {
    sm: "w-5 h-5",
    md: "w-6 h-6 sm:w-7 sm:h-7",
    lg: "w-8 h-8 sm:w-10 sm:h-10",
    xl: "w-12 h-12 sm:w-14 sm:h-14",
  };

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* EMBLEM ICON */}
      <div className="relative group flex-shrink-0">
        {/* Glow effect behind logo */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl blur-md opacity-30 group-hover:opacity-75 transition-all duration-500 group-hover:scale-105" />

        {/* Main Logo Card Container */}
        <div
          className={`relative ${sizeClasses[size]} rounded-2xl bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 border border-emerald-500/30 flex items-center justify-center shadow-2xl shadow-emerald-950/50 overflow-hidden backdrop-blur-xl group-hover:border-emerald-400/60 transition-all duration-300`}
        >
          {/* Subtle grid pattern background */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(16,185,129,0.4) 1px, transparent 0)",
              backgroundSize: "8px 8px",
            }}
          />

          {/* High-Tech Vector Logo SVG */}
          <svg
            className={`${svgSizes[size]} relative z-10 text-emerald-400 transition-transform duration-500 group-hover:scale-110`}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#10B981" />
                <stop offset="50%" stopColor="#14B8A6" />
                <stop offset="100%" stopColor="#06B6D4" />
              </linearGradient>
              <linearGradient id="logoAccent" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#34D399" />
                <stop offset="100%" stopColor="#38BDF8" />
              </linearGradient>
            </defs>

            {/* Outer Hexagonal Shield / Connection Network */}
            <path
              d="M24 4L40 12V36L24 44L8 36V12L24 4Z"
              stroke="url(#logoGrad)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-40 group-hover:opacity-80 transition-opacity"
            />

            {/* Central HR Human Nodes & Network Interconnections */}
            {/* Top Node (Leadership / Strategy) */}
            <circle cx="24" cy="15" r="3.5" fill="url(#logoAccent)" />
            
            {/* Left Node (Team / Operations) */}
            <circle cx="15" cy="29" r="3" fill="#10B981" />

            {/* Right Node (Analytics / Performance) */}
            <circle cx="33" cy="29" r="3" fill="#06B6D4" />

            {/* Interconnecting Circuit Lines (Simulation Mechanics) */}
            <path
              d="M24 18.5V28M17.5 27.5L24 22L30.5 27.5M17.5 30.5H30.5"
              stroke="url(#logoGrad)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Central Core Pulse Dot */}
            <circle cx="24" cy="28" r="2" fill="#FFFFFF" className="animate-pulse" />

            {/* Base Arc (Human Capital Foundation) */}
            <path
              d="M12 37C15.5 39.5 20.2 41 24 41C27.8 41 32.5 39.5 36 37"
              stroke="url(#logoAccent)"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>

          {/* Bottom Gradient Accent Bar */}
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />
        </div>
      </div>

      {/* TYPOGRAPHY / BRAND TEXT */}
      {variant !== "icon-only" && (
        <div className="flex flex-col min-w-0">
          {variant === "navbar" && (
            <>
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-black tracking-tight text-white uppercase font-sans">
                  WORKSIM
                </span>
                <span className="text-sm sm:text-base md:text-xl lg:text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 uppercase font-sans">
                  RH
                </span>
                <span className="hidden xl:inline-block px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 uppercase tracking-wider ml-1">
                  OFFICIAL
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-emerald-400/90 font-mono font-bold uppercase tracking-wider mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>{appLanguage === "en" ? "Academic HR Simulator" : "Simulador Acadêmico de RH"}</span>
              </p>
            </>
          )}

          {(variant === "login" || variant === "full") && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center gap-1.5">
                <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.2em] text-white uppercase font-sans">
                  WORKSIM
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-black tracking-[0.2em] text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 uppercase font-sans">
                  RH
                </span>
              </div>
              <p className="text-[9px] sm:text-[10px] text-emerald-400 font-mono uppercase tracking-[0.25em] font-semibold mt-1">
                {appLanguage === "en"
                  ? "HUMAN RESOURCES ACADEMIC SIMULATOR"
                  : "SIMULADOR ACADÊMICO DE LEGISLAÇÃO DE RH"}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
