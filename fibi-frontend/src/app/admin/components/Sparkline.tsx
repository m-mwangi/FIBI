import { useId } from 'react';

/**
 * A small trend line for KPI tiles.
 *
 * Hand-rolled SVG rather than Recharts: at 96×32 the chart library's
 * ResponsiveContainer needs a measured parent to render at all, and pulling a
 * full cartesian engine into eight tiles costs far more than the twenty lines
 * below. This draws a path and a gradient fill, nothing else.
 *
 * A flat series (every value equal, including all-zero) is drawn as a straight
 * line through the vertical middle instead of dividing by a zero range.
 */
export function Sparkline({
  values,
  color = '#059669',
  width = 96,
  height = 32,
  fill = true,
  className = '',
}: {
  values: number[];
  color?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
}) {
  // Unique per instance: two sparklines on one page must not share a gradient id.
  const gradientId = useId().replace(/:/g, '');

  const points = values.filter((v) => Number.isFinite(v));
  if (points.length < 2) return null;

  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min;

  // 1px inset top and bottom so the stroke is not clipped at the extremes.
  const pad = 1.5;
  const usableHeight = height - pad * 2;

  const coords = points.map((value, i) => {
    const x = (i / (points.length - 1)) * width;
    const y = range === 0 ? height / 2 : pad + (1 - (value - min) / range) * usableHeight;
    return { x, y };
  });

  const line = coords.map((c, i) => `${i === 0 ? 'M' : 'L'}${c.x.toFixed(2)},${c.y.toFixed(2)}`).join(' ');
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      className={className}
      aria-hidden="true"
      preserveAspectRatio="none"
    >
      {fill && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${gradientId})`} />
        </>
      )}
      <path
        d={line}
        stroke={color}
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      {/* Head dot marks the current value, which is the one the tile states. */}
      <circle cx={coords[coords.length - 1]!.x - 1} cy={coords[coords.length - 1]!.y} r={2} fill={color} />
    </svg>
  );
}
