import { useMemo } from "react";

/** Decorative floating particle layer used behind glass surfaces. */
export function ParticleField({ count = 22 }: { count?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: (i * 37) % 100,
        top: (i * 61) % 100,
        size: 4 + ((i * 13) % 14),
        delay: (i % 9) * 0.7,
        duration: 7 + ((i * 3) % 8),
      })),
    [count],
  );

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full bg-primary/25 blur-[2px]"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: p.size,
            height: p.size,
            animation: `float-slow ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}
      <div className="absolute -left-32 top-10 h-72 w-72 rounded-full bg-secondary/20 blur-3xl animate-pulse-glow" />
      <div className="absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl animate-pulse-glow" />
    </div>
  );
}