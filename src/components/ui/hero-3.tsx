"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AnimatedMarqueeHeroProps {
  tagline: string;
  title: React.ReactNode;
  description: string;
  ctaText: string;
  images: string[];
  onCtaClick?: () => void;
  className?: string;
}

const FADE_UP = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
};

const ActionButton = ({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) => (
  <motion.button
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className="mt-8 px-9 py-3.5 rounded-full bg-electric-600 text-white font-semibold shadow-[0_4px_24px_rgba(37,99,235,0.45)] hover:bg-electric-700 hover:shadow-[0_6px_32px_rgba(37,99,235,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-[background,box-shadow] duration-200"
  >
    {children}
  </motion.button>
);

export const AnimatedMarqueeHero: React.FC<AnimatedMarqueeHeroProps> = ({
  tagline,
  title,
  description,
  ctaText,
  images,
  onCtaClick,
  className,
}) => {
  const duplicatedImages = [...images, ...images];

  return (
    <section
      className={cn(
        "relative w-full h-screen overflow-hidden bg-background flex flex-col text-center px-4",
        className
      )}
    >
      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        aria-hidden="true"
      >
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full blur-[120px] opacity-20"
          style={{ background: "radial-gradient(circle, #2563EB 0%, transparent 70%)" }}
        />
      </div>

      {/* Text content — centered in the 60% above the marquee */}
      <div className="relative z-10 flex flex-col items-center justify-center h-[60%] md:h-[62%]">
        {/* Tagline badge */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          className="mb-5 inline-flex items-center gap-2 rounded-full border border-electric-600/25 bg-electric-600/10 px-4 py-1.5 text-sm font-medium text-electric-400 backdrop-blur-sm"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-electric-400 animate-pulse" aria-hidden="true" />
          {tagline}
        </motion.div>

        {/* Main title — word-by-word stagger */}
        <motion.h1
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
          }}
          className="text-balance text-4xl sm:text-5xl md:text-7xl font-bold tracking-tighter text-foreground leading-[1.1]"
        >
          {typeof title === "string"
            ? title.split(" ").map((word, i) => (
                <motion.span key={i} variants={FADE_UP} className="inline-block mr-[0.25em]">
                  {word}
                </motion.span>
              ))
            : title}
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          transition={{ delay: 0.55 }}
          className="mt-6 max-w-lg text-pretty text-lg text-muted-foreground leading-relaxed"
        >
          {description}
        </motion.p>

        {/* CTA */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={FADE_UP}
          transition={{ delay: 0.7 }}
        >
          <ActionButton onClick={onCtaClick}>{ctaText}</ActionButton>
        </motion.div>

        {/* Trust nudge */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-3 text-xs text-muted-foreground/60"
        >
          Sans inscription · Sans carte bancaire · 5 fiches offertes
        </motion.p>
      </div>

      {/* Animated image marquee at the bottom */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 w-full h-[38%] md:h-[42%] overflow-hidden"
        style={{
          maskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent), linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage: "linear-gradient(to bottom, transparent, black 20%, black 80%, transparent), linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          maskComposite: "intersect",
          WebkitMaskComposite: "destination-in",
        }}
        aria-hidden="true"
      >
        <motion.div
          className="flex gap-4 w-max will-change-transform"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 40, repeat: Infinity }}
        >
          {duplicatedImages.map((src, index) => (
            <div
              key={index}
              className={`relative aspect-[3/4] h-44 md:h-56 flex-shrink-0 ${index % 3 === 0 ? "-rotate-2" : index % 3 === 1 ? "rotate-1" : "-rotate-1"}`}
            >
              <img
                src={src}
                alt=""
                className="w-full h-full object-cover rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-white/5"
                loading="lazy"
              />
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
