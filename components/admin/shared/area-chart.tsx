"use client";

import { useId, useState } from "react";

import { cn } from "@/lib/utils";

type Point = { label: string; value: number };

export function AreaChart({
  data,
  height = 220,
  className,
  color = "var(--primary)",
  formatValue,
}: {
  data: Point[];
  height?: number;
  className?: string;
  color?: string;
  formatValue?: (value: number) => string;
}) {
  const gradientId = useId();
  const [hover, setHover] = useState<number | null>(null);

  if (data.length === 0) {
    return null;
  }

  const max = Math.max(...data.map((point) => point.value));
  const min = 0;
  const range = max - min || 1;
  const yTicks = 4;
  const tickValues = Array.from({ length: yTicks + 1 }, (_, index) =>
    Math.round((max / yTicks) * (yTicks - index)),
  );

  // Normalized 0-100 SVG coordinate space — the actual pixel size is set by
  // the wrapper div, so font sizes (HTML) stay fixed regardless of width.
  const chartWidth = 100;
  const chartHeight = 100;
  const step =
    data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;

  const points = data.map((point, index) => ({
    ...point,
    x: index * step,
    y: chartHeight - ((point.value - min) / range) * chartHeight,
  }));

  const pathD = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight} L ${points[0].x} ${chartHeight} Z`;

  return (
    <div
      className={cn("relative w-full", className)}
      style={{ height }}
    >
      {/* Y-axis labels — HTML so font size stays fixed in CSS pixels. */}
      <div className="pointer-events-none absolute inset-y-0 left-0 flex w-12 flex-col justify-between pb-6 pt-1 text-right text-[10px] text-muted-foreground tabular-nums">
        {tickValues.map((tick, index) => (
          <div key={index} className="leading-none pr-1.5">
            {formatValue ? formatValue(tick) : String(tick)}
          </div>
        ))}
      </div>

      {/* Chart area */}
      <div
        className="absolute bottom-6 left-12 right-2 top-1"
        onMouseLeave={() => setHover(null)}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          preserveAspectRatio="none"
          className="block overflow-visible"
        >
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          {tickValues.map((_, index) => {
            const y = (chartHeight / yTicks) * index;

            return (
              <line
                key={`grid-${index}`}
                x1="0"
                x2={chartWidth}
                y1={y}
                y2={y}
                stroke="var(--border)"
                strokeWidth="1"
                strokeDasharray={index === yTicks ? "0" : "2 4"}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}

          <path d={areaD} fill={`url(#${gradientId})`} />
          <path
            d={pathD}
            fill="none"
            stroke={color}
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />

          {points.map((point, index) => (
            <g key={point.label}>
              <rect
                x={point.x - step / 2}
                y={0}
                width={step}
                height={chartHeight}
                fill="transparent"
                onMouseEnter={() => setHover(index)}
              />
              {hover === index ? (
                <>
                  <line
                    x1={point.x}
                    x2={point.x}
                    y1="0"
                    y2={chartHeight}
                    stroke={color}
                    strokeOpacity="0.5"
                    strokeWidth="1"
                    strokeDasharray="2 3"
                    vectorEffect="non-scaling-stroke"
                  />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r="1.4"
                    fill="var(--background)"
                    stroke={color}
                    strokeWidth="0.6"
                    vectorEffect="non-scaling-stroke"
                  />
                </>
              ) : null}
            </g>
          ))}
        </svg>

        {hover !== null ? (
          <div
            className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[calc(100%+8px)] whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs font-medium shadow-lg"
            style={{
              left: `${(points[hover].x / chartWidth) * 100}%`,
              top: `${(points[hover].y / chartHeight) * 100}%`,
            }}
          >
            <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {points[hover].label}
            </div>
            <div className="tabular-nums">
              {formatValue
                ? formatValue(points[hover].value)
                : points[hover].value}
            </div>
          </div>
        ) : null}
      </div>

      {/* X-axis labels */}
      <div className="pointer-events-none absolute bottom-0 left-12 right-2 flex h-5 items-end justify-between text-[10px] text-muted-foreground tabular-nums">
        {data.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  );
}
