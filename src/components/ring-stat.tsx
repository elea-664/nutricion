"use client";

import { motion } from "framer-motion";
import { useId } from "react";

interface RingStatProps {
  value: string;
  label: string;
  /** 0–100, qué tanto del anillo se pinta de verde. Puramente decorativo. */
  percent: number;
  delay?: number;
}

// El gauge circular es la firma visual del empaque ATHL8 (los aros de
// "40g PROTEIN / 58g CARBS / 620 CALORIES"). Aquí se reutiliza para las
// cifras clave del demo (productos, inventario, canales) en vez de macros.
export function RingStat({ value, label, percent, delay = 0 }: RingStatProps) {
  const gradientId = useId();
  const size = 108;
  const stroke = 7;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const filled = (Math.min(100, Math.max(0, percent)) / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="oklch(0.5 0.1 152)" />
              <stop offset="100%" stopColor="oklch(0.85 0.22 149)" />
            </linearGradient>
          </defs>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="currentColor"
            className="text-foreground/10"
            strokeWidth={stroke}
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            whileInView={{ strokeDashoffset: circumference - filled }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1, delay, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-extrabold tabular-nums text-foreground">{value}</span>
        </div>
      </div>
      <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
        {label}
      </p>
    </div>
  );
}
