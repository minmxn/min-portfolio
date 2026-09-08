import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Scroll-reveal wrapper: fades + rises its children as they enter the
 * viewport (plays once). Matches the Work page's section reveal.
 */
export function Reveal({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
