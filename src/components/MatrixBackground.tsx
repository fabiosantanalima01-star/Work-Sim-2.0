import React, { useEffect, useRef } from "react";

export default function MatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const handleResize = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    handleResize();

    const phrases = [
      "CLT", "Art.482", "FGTS", "H.E. 50%", "H.E. 100%", "INSS", 
      "DSR", "CBO", "PIS", "VT", "FÉRIAS", "RESCISÃO", "TRCT", 
      "13º SALÁRIO", "ADICIONAL NOTURNO", "INSALUBRIDADE", "PERICULOSIDADE", "E-SOCIAL", "MULTA 40%"
    ];

    const fontSize = 13;
    const isMobile = window.innerWidth < 768;
    const columnWidth = isMobile ? 40 : 55;
    const columns = Math.ceil(canvas.width / columnWidth); 
    const drops: number[] = Array(columns).fill(0).map(() => -Math.floor(Math.random() * (isMobile ? 15 : 30)));
    const rainSpeeds: number[] = Array(columns).fill(0).map(() => (Math.random() * 1.5 + 0.8) * (isMobile ? 0.8 : 1));
    const rainTexts: string[] = Array(columns).fill(0).map(() => phrases[Math.floor(Math.random() * phrases.length)]);

    let animationId: number;
    let frames = 0;

    const draw = () => {
      frames++;
      // Limit framerate on mobile to save battery/compute
      if (isMobile && frames % 2 !== 0) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      // Semi-transparent fade background to create trail effect
      ctx.fillStyle = "rgba(7, 9, 15, 0.12)"; 
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.font = "bold " + fontSize + "px JetBrains Mono, ui-monospace, monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = rainTexts[i];
        
        // Matrix style toxic green spectrum overlay
        if (Math.random() > 0.98) {
          ctx.fillStyle = "#10B981"; // Emerald-500
        } else {
          ctx.fillStyle = i % 3 === 0 ? "#059669" : i % 3 === 1 ? "#34D399" : "#047857"; 
        }

        ctx.fillText(text, i * columnWidth, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.95) {
          drops[i] = -2;
          rainTexts[i] = phrases[Math.floor(Math.random() * phrases.length)];
        }
        drops[i] += rainSpeeds[i];
      }
      animationId = requestAnimationFrame(draw);
    };

    animationId = requestAnimationFrame(draw);

    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="absolute inset-0 pointer-events-none opacity-40 z-0" 
      style={{ filter: window.innerWidth < 768 ? "none" : "blur(0.5px)" }}
    />
  );
}
