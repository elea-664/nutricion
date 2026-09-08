"use client";

import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
} from "framer-motion";

// Barra fina y fija arriba de todo que se llena conforme se hace scroll.
// Es una "marca de agua alta": solo avanza hacia adelante. Si el usuario
// sube, la barra se queda donde estaba (no se desinfla) — y si vuelve a
// bajar más allá de ese punto, retoma el mismo llenado suave de siempre.
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const maxProgress = useMotionValue(0);

  useMotionValueEvent(scrollYProgress, "change", (latest) => {
    if (latest > maxProgress.get()) {
      maxProgress.set(latest);
    }
  });

  const scaleX = useSpring(maxProgress, {
    stiffness: 120,
    damping: 24,
    mass: 0.3,
  });

  return (
    <motion.div
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-50 h-1 origin-left bg-primary"
    />
  );
}
