export interface EQBandPoint {
  freqHz: number;
  gainDb: number;
  q: number;
  label: string;
}

interface Props {
  bands: EQBandPoint[];
  title?: string;
}

export function EQGraph({ bands, title }: Props) {
  const width = 600;
  const height = 220;
  const padding = { left: 40, right: 10, top: 20, bottom: 25 };

  const minFreq = 20;
  const maxFreq = 20000;
  const minGain = -18;
  const maxGain = 18;

  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const log10 = (x: number) => Math.log10(x);

  const xScale = (f: number) => {
    const clamped = Math.min(maxFreq, Math.max(minFreq, f || minFreq));
    const denom = log10(maxFreq) - log10(minFreq);
    const tt = denom === 0 ? 0 : (log10(clamped) - log10(minFreq)) / denom;
    return padding.left + tt * innerWidth;
  };

  const yScale = (g: number) => {
    const clamped = Math.max(minGain, Math.min(maxGain, g || 0));
    const t = (clamped - minGain) / (maxGain - minGain);
    return padding.top + (1 - t) * innerHeight;
  };

  const freqTicks = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000];
  const gainTicks = [-18, -12, -6, 0, 6, 12, 18];

  return (
    <div className="viewer-panel" style={{ marginTop: "1rem" }}>
      {title && <h2>{title}</h2>}
      <svg width={width} height={height}>
        <rect
          x={0}
          y={0}
          width={width}
          height={height}
          fill="#020617"
          stroke="#1e293b"
        />

        {freqTicks.map((f) => {
          const x = xScale(f);
          return (
            <g key={`fx-${f}`}>
              <line
                x1={x}
                y1={padding.top}
                y2={height - padding.bottom}
                stroke="#1e293b"
                strokeWidth={0.5}
              />
              <text
                x={x}
                y={height - 5}
                fontSize={9}
                textAnchor="middle"
                fill="#9ca3af"
              >
                {f >= 1000 ? `${f / 1000}k` : f}
              </text>
            </g>
          );
        })}

        {gainTicks.map((g) => {
          const y = yScale(g);
          return (
            <g key={`gy-${g}`}>
              <line
                x1={padding.left}
                x2={width - padding.right}
                y1={y}
                y2={y}
                stroke={g === 0 ? "#4b5563" : "#1e293b"}
                strokeWidth={g === 0 ? 0.9 : 0.5}
              />
              <text x={5} y={y + 3} fontSize={9} fill="#9ca3af">
                {g}
              </text>
            </g>
          );
        })}

        {bands.map((b, idx) => {
          const x = xScale(b.freqHz);
          const y = yScale(b.gainDb);
          return (
            <g key={idx}>
              <line
                x1={x}
                x2={x}
                y1={padding.top}
                y2={height - padding.bottom}
                stroke="#334155"
                strokeDasharray="3 3"
                strokeWidth={0.7}
              />
              <circle cx={x} cy={y} r={4} fill="#38bdf8" />
              <text
                x={x}
                y={y - 6}
                fontSize={9}
                textAnchor="middle"
                fill="#e5e7eb"
              >
                {b.gainDb.toFixed(1)}dB
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
