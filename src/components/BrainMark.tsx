/** Animated neural-network brain mark used in the splash and brand lockups. */
export function BrainMark({ size = 96 }: { size?: number }) {
  const nodes = [
    [50, 12],
    [22, 32],
    [78, 32],
    [14, 62],
    [50, 50],
    [86, 62],
    [32, 84],
    [68, 84],
  ] as const;
  const edges = [
    [0, 1],
    [0, 2],
    [1, 3],
    [1, 4],
    [2, 4],
    [2, 5],
    [3, 6],
    [4, 6],
    [4, 7],
    [5, 7],
  ] as const;

  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className="drop-shadow-[0_0_28px_var(--primary)]">
      <defs>
        <linearGradient id="brainGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--primary)" />
          <stop offset="55%" stopColor="var(--secondary)" />
          <stop offset="100%" stopColor="var(--accent)" />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="46" fill="none" stroke="url(#brainGrad)" strokeWidth="1.2" opacity="0.35" />
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a][0]}
          y1={nodes[a][1]}
          x2={nodes[b][0]}
          y2={nodes[b][1]}
          stroke="url(#brainGrad)"
          strokeWidth="1.6"
          strokeDasharray="60"
          strokeDashoffset="60"
          style={{ animation: `dash-line 1.1s ease-out ${0.08 * i}s forwards` }}
        />
      ))}
      {nodes.map(([x, y], i) => (
        <circle
          key={i}
          cx={x}
          cy={y}
          r="4"
          fill="url(#brainGrad)"
          style={{ animation: `pulse-glow 2.4s ease-in-out ${0.12 * i}s infinite` }}
        />
      ))}
    </svg>
  );
}