/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Terminal, CreditCard, Sparkles, LogIn, ChevronRight, ShieldCheck } from "lucide-react";

interface MatrixIntroProps {
  studentName: string;
  matricula: string;
  onComplete: () => void;
}

export default function MatrixIntro({ studentName, matricula, onComplete }: MatrixIntroProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [step, setStep] = useState<"raining" | "forging" | "accessGranted">("raining");
  const [bipSoundPlayed, setBipSoundPlayed] = useState<boolean>(false);

  useEffect(() => {
    // 1. Raining stage matrix effect with actual HR tax and labor laws symbols instead of raw katakana
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const phrases = [
      "CLT", "Art.482", "FGTS", "H.E. 50%", "H.E. 100%", "INSS", 
      "DSR", "CBO", "PIS", "VT", "FÉRIAS", "RESCISÃO", "TRCT", 
      "13º SALÁRIO", "ADICIONAL NOTURNO", "INSALUBRIDADE", "SINDICAL"
    ];

    const fontSize = 14;
    const columns = Math.floor(canvas.width / 50); // space between columns
    const drops: number[] = Array(columns).fill(0);
    const rainSpeeds: number[] = Array(columns).fill(0).map(() => Math.random() * 2 + 1.2);
    const rainTexts: string[] = Array(columns).fill(0).map(() => phrases[Math.floor(Math.random() * phrases.length)]);

    let animationId: number;
    let frameCount = 0;

    const draw = () => {
      ctx.fillStyle = "rgba(11, 15, 25, 3.2)"; // Deep background glow matching our palette
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "bold " + fontSize + "px JetBrains Mono, monospace";

      for (let i = 0; i < drops.length; i++) {
        // Neon color scheme
        const text = rainTexts[i];
        
        ctx.fillStyle = i % 2 === 0 ? "#00E5FF" : "#1D6D7F"; // Electric Cyan & Blue Muted tones
        ctx.fillText(text, i * 50, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
          rainTexts[i] = phrases[Math.floor(Math.random() * phrases.length)];
        }
        drops[i] += rainSpeeds[i];
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    // After 2.5 seconds, start the Crachá Card integration sequence
    const forgeTimer = setTimeout(() => {
      setStep("forging");
    }, 2800);

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      clearTimeout(forgeTimer);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glare, setGlare] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    // Max tilt angles
    const degX = -((mouseY - height / 2) / (height / 2)) * 14;
    const degY = ((mouseX - width / 2) / (width / 2)) * 14;
    
    setTilt({ x: degX, y: degY });
    setGlare({
      x: (mouseX / width) * 100,
      y: (mouseY / height) * 100,
      opacity: 0.45,
    });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setGlare((prev) => ({ ...prev, opacity: 0 }));
  };

  // Simulate corporate login swipe card beep sound
  const playBip = () => {
    if (bipSoundPlayed) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, audioCtx.currentTime); // high pitched clean beep
      gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.15);
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
      setBipSoundPlayed(true);
    } catch (e) {
      console.log("Audio API blocked on iframe interaction", e);
    }
  };

  return (
    <div id="matrix-onboarding-container" className="fixed inset-0 z-50 bg-[#060810] overflow-hidden flex flex-col justify-center items-center font-sans">
      {/* Background Falling Rain Matrix Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none opacity-20 z-0" />
      
      {/* Glitch Overlay scanlines and grid */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/40 via-[#060810] to-[#010204] z-5 pointer-events-none" />
      <div className="absolute inset-0 terminal-scanlines opacity-15 pointer-events-none z-10" />

      {/* Main interactive state machine */}
      <div className="relative z-20 w-full max-w-xl px-4 flex flex-col items-center">
        
        <AnimatePresence mode="wait">
          {step === "raining" && (
            <motion.div
              key="intro-headline"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.5 }}
              className="text-center space-y-4"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-accent-primary/20 rounded-full blur-xl animate-pulse" />
                <Terminal className="w-14 h-14 text-accent-primary mx-auto relative z-10 animate-pulse" />
              </div>
              <h1 className="text-2xl md:text-3xl font-mono font-bold tracking-tight text-white uppercase">
                Acessando o Mainframe CLT
              </h1>
              <p className="text-accent-primary text-xs font-mono select-none tracking-widest uppercase">
                [ TURMA 01 ] [ REGISTRO ATIVO ] [ SQUAD UNLOCKED ]
              </p>
              <div className="text-[11px] text-text-secondary font-mono bg-[#0c1224]/80 px-4 py-2.5 rounded-xl border border-white/5 inline-block backdrop-blur-md shadow-2xl">
                <span className="inline-block w-2.5 h-2.5 bg-cyan-400 rounded-full animate-ping mr-2 align-middle" />
                Sincronizando parâmetros de simulação...
              </div>
            </motion.div>
          )}

          {step === "forging" && (
            <motion.div
              key="cracha-forge"
              initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 85 }}
              className="w-full max-w-sm flex flex-col items-center gap-3"
            >
              <div className="text-center mb-1">
                <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest bg-cyan-950/40 border border-cyan-800/30 px-3 py-1 rounded-full shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                  ⚡ Identificação Requerida ⚡
                </span>
              </div>

              {/* Perspective box wrapping the card */}
              <div 
                className="w-full relative transition-all duration-150 ease-out cursor-grab active:cursor-grabbing"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                style={{
                  perspective: "1200px"
                }}
              >
                {/* 3D Container with rotateX, rotateY and genuine physical borders */}
                <div 
                  className="p-1 rounded-[24px] bg-gradient-to-br from-white/10 via-white/5 to-transparent shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] backdrop-blur-xl relative overflow-hidden"
                  style={{
                    transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                    transformStyle: "preserve-3d",
                    transition: "transform 0.1s ease-out"
                  }}
                >
                  {/* Holographic light reflection glare layer */}
                  <div 
                    className="absolute inset-0 pointer-events-none z-30 transition-opacity duration-300"
                    style={{
                      opacity: glare.opacity,
                      background: `radial-gradient(circle at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 50%, rgba(6,182,190,0.06) 80%)`,
                    }}
                  />

                  {/* High Quality Inner Content Grid badge card */}
                  <div 
                    className="p-6 rounded-[20px] bg-slate-900/90 relative overflow-hidden flex flex-col items-center border border-white/10"
                    style={{ transform: "translateZ(10px)" }}
                  >
                    {/* Embedded laser scanning line */}
                    <motion.div 
                      initial={{ top: "-10%" }}
                      animate={{ top: "110%" }}
                      transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                      className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#00E5FF] z-10 pointer-events-none opacity-80"
                    />

                    {/* Chip card holographic microchip ornament */}
                    <div className="absolute top-8 right-6 w-10 h-8 rounded-md bg-gradient-to-br from-amber-400 via-amber-300 to-yellow-600/60 border border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.25)] flex items-center justify-center pointer-events-none">
                      <div className="grid grid-cols-3 gap-[1px] w-8 h-6 opacity-85">
                        {Array.from({ length: 9 }).map((_, i) => (
                          <div key={i} className="border-[0.5px] border-amber-950/20 rounded-[1px] bg-amber-400/10" />
                        ))}
                      </div>
                    </div>

                    {/* Grid watermark background */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:14px_14px] pointer-events-none" />

                    <div className="flex justify-between w-full border-b border-white/5 pb-4 mb-5 select-none relative z-20">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-accent-primary rounded-full animate-pulse shadow-[0_0_8px_#00E5FF]" />
                        <span className="font-mono text-[9px] text-accent-primary uppercase tracking-widest font-black">
                          WorkSim RH S.A.
                        </span>
                      </div>
                      <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider pr-12">
                        SYS: GLOBAL-LOG
                      </span>
                    </div>

                    {/* Profile Holder Avatar Frame with volumetric translateZ */}
                    <div 
                      className="relative w-24 h-24 mb-4 rounded-xl overflow-hidden bg-[#0a0f1d] border border-cyan-500/30 flex items-center justify-center p-1 shadow-inner group"
                      style={{ transform: "translateZ(25px)" }}
                    >
                      <div className="w-full h-full bg-[#11182c] rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
                        {/* Dynamic camera line overlay */}
                        <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-[#00E5FF]/5 to-transparent pointer-events-none" />
                        <span className="text-4xl filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]">👤</span>
                        <span className="text-[9px] font-mono text-cyan-400 mt-1 uppercase font-semibold border-t border-cyan-950 px-2 py-0.5 relative z-10">
                          LOG-COV
                        </span>
                      </div>
                    </div>

                    {/* Name and Designation with depth */}
                    <div 
                      className="text-center space-y-1 mb-6 relative z-20"
                      style={{ transform: "translateZ(35px)" }}
                    >
                      <span className="text-[9px] font-mono text-cyan-400 uppercase tracking-widest block font-bold leading-none">
                        Colaborador Autorizado
                      </span>
                      <h3 id="intro-card-student-name" className="text-xl font-sans font-black text-white tracking-tight uppercase leading-snug">
                        {studentName || "Recruta de RH"}
                      </h3>
                      <div className="bg-gradient-to-r from-cyan-950/60 to-slate-950/60 border border-cyan-500/20 rounded-md py-1 px-3 mt-2 inline-block">
                        <span className="text-[10px] font-mono text-cyan-400 uppercase font-black tracking-wider">
                          Cargo: Estagiário de RH
                        </span>
                      </div>
                    </div>

                    {/* Registration metadata details with depth */}
                    <div 
                      className="w-full border border-white/5 space-y-2 text-[11px] font-mono text-gray-400 relative z-20 bg-slate-950/60 p-3.5 rounded-xl text-left"
                      style={{ transform: "translateZ(20px)" }}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">MATRÍCULA:</span>
                        <span id="intro-card-registration" className="font-extrabold text-cyan-400">
                          {matricula}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">DEPARTAMENTO:</span>
                        <span className="text-gray-200">GENTE & GESTÃO</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-500">ESTAÇÃO:</span>
                        <span className="text-emerald-400 font-bold">ATIVA [SALA 1B]</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Glowing Interactive Proximity Sensor Bar */}
              <div className="w-full mt-3 p-3 bg-slate-950/80 border border-white/5 rounded-2xl flex flex-col items-center text-center gap-2 shadow-2xl relative">
                <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500/10 to-indigo-500/15 rounded-2xl pointer-events-none blur-sm" />
                
                <span className="text-[9px] font-mono text-gray-500 uppercase tracking-widest selection:none">
                  Aproxime seu dispositivo ou clique abaixo
                </span>

                <button
                  id="swipe-cracha-trigger"
                  type="button"
                  onMouseEnter={playBip}
                  onClick={() => {
                    playBip();
                    setStep("accessGranted");
                    setTimeout(() => {
                      onComplete();
                    }, 1200);
                  }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-bg-primary font-sans font-extrabold text-[11px] uppercase tracking-wider py-3 px-5 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_25px_rgba(6,182,212,0.45)] border border-cyan-400/25 cursor-pointer transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <LogIn className="w-4 h-4 text-bg-primary" />
                  Bater Crachá no Leitor
                </button>
              </div>
            </motion.div>
          )}

          {step === "accessGranted" && (
            <motion.div
              key="access-grant"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center space-y-4"
            >
              <div className="relative inline-block">
                <div className="absolute inset-0 bg-emerald-500/20 rounded-full blur-2xl animate-ping" />
                <div className="w-20 h-20 bg-[#0f2d20] rounded-full flex items-center justify-center border-2 border-emerald-400/60 mx-auto text-emerald-400 relative z-10 shadow-[0_0_30px_rgba(16,185,129,0.3)]">
                  <ShieldCheck className="w-10 h-10" />
                </div>
              </div>
              <h2 className="text-xl font-mono font-black text-emerald-400 uppercase tracking-widest leading-none">
                ✓ SISTEMA INTEGRADO LIBERADO
              </h2>
              <div className="p-4 rounded-2xl glass-panel text-[11px] text-gray-400 max-w-sm space-y-1.5 font-sans bg-slate-900/80 border border-emerald-500/20 shadow-2xl backdrop-blur-md">
                <p className="text-gray-100 font-bold block text-sm">
                  Bem-vindo à Global Logística S.A.
                </p>
                <p>Estação de Auditoria de Folhas do e-Social liberada.</p>
                <div className="h-1 w-full bg-slate-950 rounded-full overflow-hidden mt-3">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.1, ease: "easeInOut" }}
                    className="h-full bg-emerald-500"
                  />
                </div>
                <p className="text-[9px] text-[#00E5FF] font-mono mt-2 uppercase tracking-wide">
                  Inicializando cockpit de carreira...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
