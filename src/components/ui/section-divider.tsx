"use client";

/* Ligne de coupe — motif "fiche perforée", sans glow néon */
export default function SectionDivider() {
  return (
    <div
      className="relative w-full h-px"
      style={{
        backgroundImage:
          "repeating-linear-gradient(to right, var(--ls-border-color) 0, var(--ls-border-color) 6px, transparent 6px, transparent 14px)",
      }}
      aria-hidden="true"
    >
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full"
        style={{ background: "var(--ls-bg)", border: "1px solid var(--ls-border-color)" }}
      />
    </div>
  );
}
