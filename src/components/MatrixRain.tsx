import React, { useEffect, useRef } from "react";

interface MatrixRainProps {
  speed?: number; // Speed multiplier
  color?: string; // Color of characters
  fontSize?: number;
}

export const MatrixRain: React.FC<MatrixRainProps> = ({
  speed = 1.8,
  color = "#10b981", // Emerald 500
  fontSize = 16,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set dimensions to match client rect exactly
    const handleResize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || window.innerHeight;
    };

    handleResize();
    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Japanese katakana and numeric symbols
    const chars = "ｦｧｨｩｪｫｬｭｮｯｰｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const charArr = chars.split("");

    const columns = Math.ceil(canvas.width / fontSize);
    const rainDrops: number[] = Array.from({ length: columns }).map(() =>
      Math.random() * -100 // staggered start
    );

    let animationFrameId: number;

    const draw = () => {
      // Semi-transparent black background to create trail effect
      ctx.fillStyle = "rgba(2, 6, 23, 0.15)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = color;
      ctx.font = `bold ${fontSize}px monospace`;

      for (let i = 0; i < rainDrops.length; i++) {
        // Pick a random symbol
        const text = charArr[Math.floor(Math.random() * charArr.length)];
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;

        // Draw with high opacity
        ctx.fillText(text, x, y);

        // Reset drop to the top with a random offset if it reaches bottom
        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }

        // Increase drop coordinate based on fast speed multiplier
        rainDrops[i] += speed;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Begin render loop
    animationFrameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [speed, color, fontSize]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-90 transition-opacity duration-300 z-50 bg-slate-950/40"
      style={{ mixBlendMode: "screen" }}
    />
  );
};

export default MatrixRain;
