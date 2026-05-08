"use client";

import { motion } from "framer-motion";

export default function SectionDivider() {
  return (
    <div className="relative w-full h-16 flex items-center justify-center overflow-hidden" aria-hidden="true">
      {/* Base line */}
      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-[#253352] to-transparent" />

      {/* Glow halo */}
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-6 bg-gradient-to-r from-transparent via-[rgba(59,130,246,0.06)] to-transparent" />

      {/* Animated beam */}
      <motion.div
        className="absolute top-1/2 -translate-y-1/2 w-40 h-px"
        style={{
          background: "linear-gradient(to right, transparent, #60A5FA, #3B82F6, #60A5FA, transparent)",
          boxShadow: "0 0 12px 2px rgba(96,165,250,0.5)",
        }}
        initial={{ x: "-10vw" }}
        animate={{ x: "110vw" }}
        transition={{
          duration: 3.2,
          repeat: Infinity,
          repeatDelay: 4,
          ease: "easeInOut",
        }}
      />

      {/* Dot center */}
      <motion.div
        className="relative z-10 w-1 h-1 rounded-full bg-electric-400"
        animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ boxShadow: "0 0 8px 2px rgba(96,165,250,0.6)" }}
      />
    </div>
  );
}
