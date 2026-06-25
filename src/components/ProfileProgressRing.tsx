import React from "react";
import { motion } from "motion/react";

interface ProfileProgressRingProps {
  progress: number; // 0 to 100
  size?: number;
  strokeWidth?: number;
  children: React.ReactNode;
  activeColor?: string;
}

export const ProfileProgressRing: React.FC<ProfileProgressRingProps> = ({
  progress,
  size = 40,
  strokeWidth = 3,
  children,
  activeColor = "#10b981", // emerald-500
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Background circle */}
      <svg
        className="absolute transform -rotate-90"
        width={size}
        height={size}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-white/10"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={activeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          strokeLinecap="round"
          className="drop-shadow-[0_0_8px_rgba(16,185,129,0.4)]"
        />
      </svg>
      
      {/* Content (Avatar) */}
      <div className="relative z-10 flex items-center justify-center overflow-hidden rounded-full transform scale-[0.85]">
        {children}
      </div>
    </div>
  );
};

export default ProfileProgressRing;
