/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, Award, FileText, CheckCircle2, Terminal, 
  UserCheck, Briefcase, ChevronRight, LockKeyhole
} from "lucide-react";
import { Student } from "../types";

interface HiringModalProps {
  student: Student | null;
  onPromote: () => void;
}

export default function HiringModal({ student, onPromote }: HiringModalProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [contractSigned, setContractSigned] = useState<boolean>(false);
  const [showConfetti, setShowConfetti] = useState<boolean>(false);

  // Play a celebratory synth chime when the badge is forged/hired
  useEffect(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Node 1: Sweet high arpeggio
      const playTone = (freq: number, delay: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime + delay);
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + delay);
        gainNode.gain.linearRampToValueAtTime(0.08, audioCtx.currentTime + delay + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + delay + duration);
        
        osc.start(audioCtx.currentTime + delay);
        osc.stop(audioCtx.currentTime + delay + duration);
      };

      playTone(523.25, 0.0, 0.6); // C5
      playTone(659.25, 0.12, 0.6); // E5
      playTone(783.99, 0.24, 0.6); // G5
      playTone(1046.50, 0.36, 1.0); // C6 (glorious high root)
    } catch (e) {
      console.log("Audio block", e);
    }
  }, []);

  // Neon Matrix rain effect in glowing emerald-green
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const matrixTerms = [
      "CONTRATADO", "ESTAGIÁRIO", "RH GLOBAL", "CLT", "ADMISSÃO", 
      "FGTS 8%", "APROVADO", "F1 LIBERADO", "e-SOCIAL", "CARREIRA",
      "GENTE", "VAGA PREENCHIDA", "100% REGULAMENTAR"
    ];

    const fontSize = 13;
    const columns = Math.ceil(canvas.width / 55);
    const drops: number[] = Array(columns).fill(0).map(() => -Math.random() * 20);
    const speeds: number[] = Array(columns).fill(0).map(() => Math.random() * 1.5 + 1.0);
    const letters: string[] = Array(columns).fill(0).map(() => matrixTerms[Math.floor(Math.random() * matrixTerms.length)]);

    let animationId: number;

    const drawMatrix = () => {
      ctx.fillStyle = "rgba(11, 15, 25, 0.15)"; // Soft trails fading in back
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "bold " + fontSize + "px 'JetBrains Mono', monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = letters[i];
        const yPos = drops[i] * fontSize;

        // Make the leading character glow brighter
        if (drops[i] > 0 && yPos < canvas.height) {
          ctx.fillStyle = "#10B981"; // Emerald-500
          ctx.fillText(text, i * 62, yPos);
          
          // Outer glow for key highlights
          if (Math.random() > 0.85) {
            ctx.fillStyle = "#34D399"; // Emerald-400
            ctx.shadowColor = "#10B981";
            ctx.shadowBlur = 8;
            ctx.fillText(text, i * 62, yPos);
            ctx.shadowBlur = 0;
          }
        }

        // Reset drop
        if (yPos > canvas.height && Math.random() > 0.98) {
          drops[i] = -5;
          letters[i] = matrixTerms[Math.floor(Math.random() * matrixTerms.length)];
          speeds[i] = Math.random() * 1.5 + 1.0;
        }

        drops[i] += speeds[i];
      }

      animationId = requestAnimationFrame(drawMatrix);
    };

    animationId = requestAnimationFrame(drawMatrix);

    const handleResize = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSignAndConfirm = () => {
    setContractSigned(true);
    setShowConfetti(true);
    setTimeout(() => {
      onPromote();
    }, 1600);
  };

  if (!student) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      id="hiring-mainframe-portal" 
      className="fixed inset-0 z-50 bg-slate-950 overflow-hidden flex flex-col justify-center items-center p-4"
    >
      
      {/* Background Matrix Canvas animation fallback */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-40 z-0" />
      
      {/* Optional real loop media background video uploaded by user */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover pointer-events-none opacity-30 z-0 mix-blend-screen"
        onError={(e) => {
          // If video isn't compiled in assets yet or loaded, let the canvas handle visuals cleanly
          console.log("Using core canvas matrix rain stream background");
        }}
      >
        <source src="/hiring_transition.mp4" type="video/mp4" />
        <source src="/transition.mp4" type="video/mp4" />
      </video>

      {/* Cyberpunk Scanlines */}
      <div className="absolute inset-0 terminal-scanlines opacity-20 pointer-events-none z-10" />

      {/* Outer wrapper container */}
      <div className="relative z-20 w-full max-w-lg mb-8 text-center px-4">
        
        <AnimatePresence mode="wait">
          {!contractSigned ? (
            <motion.div
              key="hiring-badge-card"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -40, rotateX: 20 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="space-y-6"
            >
              
              {/* Header Badge Title */}
              <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-4 py-1.5 rounded-full text-emerald-400 font-sans font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-950/20 animate-pulse">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                Processo de Admissão Homologado ✓
              </div>

              {/* Floating physical badge card "Cartão Flutuante" */}
              <div className="relative w-full max-w-sm mx-auto glass-panel border-2 border-emerald-400/40 rounded-2xl bg-slate-900/90 text-left p-6 shadow-[0_0_25px_rgba(16,185,129,0.25)] overflow-hidden group select-none">
                
                {/* Visual laser glow line tracing down */}
                <motion.div
                  initial={{ top: "-5%" }}
                  animate={{ top: "105%" }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-emerald-400 to-transparent shadow-[0_0_8px_#10B981] z-10 pointer-events-none"
                />

                {/* Vertical watermarked safety lines */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

                {/* Badge Header Area */}
                <div className="flex justify-between items-start border-b border-white/10 pb-4 mb-4 font-mono text-[9px] text-text-secondary">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold tracking-widest text-[10px] text-emerald-400 uppercase font-sans">
                      GLOBAL LOGÍSTICA S.A.
                    </span>
                  </div>
                  <span>GENTE & GESTÃO</span>
                </div>

                {/* Badge Photo / Holographic Box */}
                <div className="flex gap-4 items-center mb-5">
                  <div className="relative bg-slate-950/90 border-2 border-emerald-400/50 rounded-xl w-24 h-24 flex-shrink-0 flex flex-col items-center justify-center p-1 font-mono hover:scale-105 transition-transform">
                    <div className="w-full h-full rounded-lg bg-slate-900 border border-white/5 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl filter saturate-100 animate-bounce">💼</span>
                      <span className="text-[7.5px] uppercase text-emerald-400 font-bold tracking-wide mt-1 bg-emerald-950/50 px-1 border border-emerald-400/25 rounded">
                        CONTRATADO
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-left flex-1">
                    <div className="text-[10px] font-mono text-emerald-400 uppercase font-medium tracking-widest">
                      ★ COLABORADOR HOMOLOGADO ★
                    </div>
                    <h3 id="hiring-badge-student-name" className="text-lg font-sans font-black text-white leading-tight tracking-tight uppercase truncate">
                      {student.nomeCompleto}
                    </h3>
                    <div className="inline-flex items-center gap-1 bg-emerald-500/10 border border-emerald-500/20 rounded-md py-0.5 px-2.5 mt-1.5">
                      <Briefcase className="w-3 h-3 text-emerald-400" />
                      <span className="text-[10.5px] font-sans text-emerald-300 uppercase font-bold">
                        Cargo: Estagiário de RH
                      </span>
                    </div>
                  </div>
                </div>

                {/* Badge Technical Specifications (CLT values) */}
                <div className="bg-slate-950/80 border border-white/5 rounded-xl p-3.5 space-y-2.5 font-mono text-[11px] text-text-secondary leading-normal relative z-20">
                  <div className="flex justify-between">
                    <span>MATRÍCULA:</span>
                    <strong className="text-emerald-400">{student.matricula}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>CBO DO CARGO:</span>
                    <strong className="text-gray-200">2524-05 (ESTÁGIO DE GENTE)</strong>
                  </div>
                  <div className="flex justify-between border-t border-white/5 pt-1.5 mt-1">
                    <span>JORNADA REGULAMENTAR:</span>
                    <strong className="text-gray-200">30 horas semanais</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>BOLSA AUXÍLIO BASE:</span>
                    <strong className="text-emerald-400">R$ 1.800,00 /mês</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>STATUS NO REGISTRO:</span>
                    <span className="bg-emerald-950/45 text-emerald-400 border border-emerald-500/25 px-1.5 py-0.2 rounded text-[9px] uppercase font-bold">
                      CONTRATADO
                    </span>
                  </div>
                </div>

                {/* Floating Card Activation Button */}
                <button
                  type="button"
                  onClick={handleSignAndConfirm}
                  className="w-full mt-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-sans font-black text-xs uppercase tracking-wider py-3.5 px-5 rounded-xl shadow-lg shadow-emerald-900/35 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 relative group overflow-hidden"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
                  <span>ASSINAR CONTRATO & ATIVAR CRAC HÁ</span>
                  <ChevronRight className="w-4 h-4 text-slate-950 animate-next" />
                </button>

              </div>

              {/* Informative Subtitle */}
              <p className="text-xs text-text-secondary flex items-center justify-center gap-1.5 font-mono">
                <LockKeyhole className="w-3.5 h-3.5 text-emerald-400/60" />
                Ao colher o crachá, a <strong className="text-emerald-400">FASE 1: Holerites</strong> será imediatamente desbloqueada.
              </p>

            </motion.div>
          ) : (
            <motion.div
              key="hiring-confirmed-stage"
              initial={{ opacity: 0, scale: 0.8, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                type: "spring",
                stiffness: 120,
                damping: 20,
                duration: 0.8 
              }}
              className="text-center space-y-8"
            >
              
              <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="absolute inset-0 bg-white rounded-full shadow-[0_0_50px_rgba(255,255,255,0.4)]"
                />
                <motion.div
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.6 }}
                >
                  <CheckCircle2 className="w-20 h-20 text-slate-950 relative z-10" />
                </motion.div>
                
                {/* Rotating glow ring around the check */}
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-[-15px] border-2 border-dashed border-white/20 rounded-full"
                />
              </div>

              <div className="space-y-3">
                <motion.h2 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-4xl font-sans font-black text-white uppercase tracking-tighter"
                >
                  Introdução Concluída
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-emerald-400 font-mono tracking-[0.3em] uppercase font-bold"
                >
                  ✓ [ e-Social ATIVO ] [ REGISTRAÇÃO EFETIVADA ]
                </motion.p>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-6 bg-slate-900 shadow-2xl border border-white/10 rounded-2xl max-w-md mx-auto text-left relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Award className="w-16 h-16 text-emerald-400" />
                </div>
                
                <div className="space-y-4 relative z-10">
                  <p className="text-gray-200 text-base leading-relaxed">
                    Parabéns, <strong className="text-emerald-400">{student.nomeCompleto}</strong>! O conselho diretivo validou sua admissão e você acaba de ser promovido a <strong className="text-white">Estagiário de RH</strong>.
                  </p>
                  
                  <div className="text-[11px] border-t border-white/10 pt-4 space-y-2 text-text-secondary font-mono">
                    <p className="flex items-center gap-2 text-emerald-400 font-bold">
                      <Terminal className="w-3.5 h-3.5" />
                      ESTAÇÃO DE TRABALHO: Módulo 1 Ativado
                    </p>
                    <p className="flex items-center gap-2">
                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                       Holerites e contracheques liberados
                    </p>
                    <p className="flex items-center gap-2">
                       <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                       Poder diretivo e admissão homologada
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-xs text-white/50 font-mono tracking-widest uppercase pb-10"
              >
                Inicializando Mainframe Departamento Pessoal...
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </motion.div>
  );
}
