"use client";

import { useRef, type ReactNode } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
}

// Revelado atado al scroll (no a un solo trigger de "ya entró en
// viewport"): mientras la sección sube desde el borde inferior de la
// pantalla, empieza borrosa, tenue y un poco desplazada; conforme el
// usuario sigue bajando y la sección se acerca al centro, se enfoca del
// todo. Al subir de nuevo, se desenfoca en reversa — es continuo, no un
// disparador de una sola vez.
export function ScrollReveal({ children, className }: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: ref,
    // 0 cuando el tope de la sección está al 92% del viewport (recién
    // asomando abajo), 1 cuando llega al 40% (ya cómodamente a la vista).
    offset: ["start 0.92", "start 0.4"],
  });

  const opacity = useTransform(scrollYProgress, [0, 1], [0, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [56, 0]);
  const blurPx = useTransform(scrollYProgress, [0, 1], [16, 0]);
  const filter = useTransform(blurPx, (v) => `blur(${v}px)`);

  if (shouldReduceMotion) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ opacity, y, filter }} className={className}>
      {children}
    </motion.div>
  );
}
