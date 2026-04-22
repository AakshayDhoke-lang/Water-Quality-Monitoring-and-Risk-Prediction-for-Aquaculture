import { useMemo } from "react";

export function Bubbles({ count = 18 }: { count?: number }) {
  const bubbles = useMemo(
    () =>
      Array.from({ length: count }).map((_, i) => ({
        id: i,
        size: 6 + Math.random() * 26,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 10 + Math.random() * 14,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {bubbles.map((b) => (
        <span
          key={b.id}
          className="absolute bottom-0 rounded-full"
          style={{
            left: `${b.left}%`,
            width: `${b.size}px`,
            height: `${b.size}px`,
            background:
              "radial-gradient(circle at 30% 30%, oklch(0.95 0.05 195 / 0.7), oklch(0.78 0.18 195 / 0.15) 60%, transparent 70%)",
            boxShadow: "0 0 12px oklch(0.78 0.18 195 / 0.4)",
            animation: `rise ${b.duration}s linear ${b.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
