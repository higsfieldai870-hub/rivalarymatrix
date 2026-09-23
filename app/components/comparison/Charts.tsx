"use client";

import {
  BarController,
  BarElement,
  CategoryScale,
  Chart,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
  type ChartConfiguration,
  type ChartType,
  type Plugin,
} from "chart.js";
import { useCallback, useEffect, useRef } from "react";

Chart.register(
  BarController,
  BarElement,
  CategoryScale,
  Filler,
  Legend,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
);

// Two series per chart: the left player is always green, the right blue.
export type ChartSeries = { label: string; data: (number | null)[] };
export type SeriesPair = [ChartSeries, ChartSeries];

type Theme = {
  green: string;
  blue: string;
  white: string;
  muted: string;
  muted2: string;
  panel: string;
  body: string;
  display: string;
};

function readTheme(): Theme {
  const css = getComputedStyle(document.documentElement);
  const token = (name: string) => css.getPropertyValue(name).trim();

  return {
    green: token("--green"),
    blue: token("--blue"),
    white: token("--white"),
    muted: token("--muted"),
    muted2: token("--muted2"),
    panel: token("--panel"),
    body: token("--font-body"),
    display: token("--font-display"),
  };
}

function withAlpha(hex: string, alpha: number) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

let defaultsApplied = false;

function applyDefaults(t: Theme) {
  if (defaultsApplied) return;
  defaultsApplied = true;

  Chart.defaults.color = t.muted;
  Chart.defaults.font.family = t.body;
  Chart.defaults.font.size = 11;
  Chart.defaults.borderColor = "rgba(255, 255, 255, 0.09)";
  Chart.defaults.maintainAspectRatio = false;

  const legend = Chart.defaults.plugins.legend;
  legend.position = "top";
  legend.align = "end";
  legend.labels.usePointStyle = true;
  legend.labels.pointStyle = "circle";
  legend.labels.boxWidth = 8;
  legend.labels.boxHeight = 8;
  legend.labels.padding = 18;

  const tooltip = Chart.defaults.plugins.tooltip;
  tooltip.backgroundColor = t.panel;
  tooltip.borderColor = "rgba(255, 255, 255, 0.14)";
  tooltip.borderWidth = 1;
  tooltip.titleColor = t.white;
  tooltip.bodyColor = t.white;
  tooltip.titleFont = { family: t.display, size: 16, weight: 700 };
  tooltip.padding = 12;
  tooltip.cornerRadius = 10;
  tooltip.usePointStyle = true;
  tooltip.boxPadding = 6;
}

// Vertical guide under the hovered season on line charts.
const crosshair: Plugin<"line"> = {
  id: "crosshair",
  beforeDatasetsDraw(chart) {
    const active = chart.tooltip?.getActiveElements();
    if (!active?.length) return;

    const { ctx, chartArea } = chart;
    const x = active[0].element.x;

    ctx.save();
    ctx.beginPath();
    ctx.moveTo(x, chartArea.top);
    ctx.lineTo(x, chartArea.bottom);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.18)";
    ctx.stroke();
    ctx.restore();
  },
};

const seriesColor = (index: number, t: Theme) => (index === 0 ? t.green : t.blue);

const formatValue = (value: number, decimals: number) =>
  decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");

const tooltipLabel = (
  label: string | undefined,
  value: number | null,
  suffix: string,
  decimals: number,
) => ` ${label}: ${value === null ? "–" : `${formatValue(value, decimals)}${suffix}`}`;

const cartesianScales = (t: Theme, beginAtZero: boolean, decimals: number) => ({
  x: {
    grid: { display: false },
    border: { color: "rgba(255, 255, 255, 0.12)" },
    ticks: { color: t.muted },
  },
  y: {
    beginAtZero,
    grid: { color: "rgba(255, 255, 255, 0.05)" },
    border: { display: false },
    ticks: { color: t.muted2, padding: 8, precision: decimals > 0 ? 1 : 0 },
  },
});

function ChartCanvas<T extends ChartType>({
  build,
  label,
}: {
  build: (theme: Theme) => ChartConfiguration<T>;
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const theme = readTheme();
    applyDefaults(theme);

    const chart = new Chart(canvas, build(theme));
    return () => chart.destroy();
  }, [build]);

  return <canvas ref={ref} role="img" aria-label={label} />;
}

type CartesianProps = {
  labels: string[];
  series: SeriesPair;
  ariaLabel: string;
  suffix?: string;
  decimals?: number;
};

export function BarChart({ labels, series, ariaLabel, suffix = "", decimals = 0 }: CartesianProps) {
  const build = useCallback(
    (t: Theme): ChartConfiguration<"bar"> => ({
      type: "bar",
      data: {
        labels,
        datasets: series.map((s, i) => ({
          label: s.label,
          data: s.data,
          backgroundColor: seriesColor(i, t),
          borderRadius: 4,
          borderSkipped: "start" as const,
          barPercentage: 0.86,
          categoryPercentage: 0.62,
          maxBarThickness: 56,
        })),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: cartesianScales(t, true, decimals),
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => tooltipLabel(ctx.dataset.label, ctx.parsed.y, suffix, decimals),
            },
          },
        },
      },
    }),
    [labels, series, suffix, decimals],
  );

  return <ChartCanvas build={build} label={ariaLabel} />;
}

export function LineChart({
  labels,
  series,
  ariaLabel,
  suffix = "",
  decimals = 0,
  fill = false,
  beginAtZero = true,
}: CartesianProps & { fill?: boolean; beginAtZero?: boolean }) {
  const build = useCallback(
    (t: Theme): ChartConfiguration<"line"> => ({
      type: "line",
      data: {
        labels,
        datasets: series.map((s, i) => {
          const color = seriesColor(i, t);
          return {
            label: s.label,
            data: s.data,
            borderColor: color,
            backgroundColor: fill ? withAlpha(color, 0.07) : color,
            fill: fill ? ("origin" as const) : false,
            borderWidth: 2,
            cubicInterpolationMode: "monotone" as const,
            spanGaps: true,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: color,
            pointBorderColor: t.panel,
            pointBorderWidth: 2,
            pointHitRadius: 14,
          };
        }),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        scales: cartesianScales(t, beginAtZero, decimals),
        plugins: {
          tooltip: {
            callbacks: {
              label: (ctx) => tooltipLabel(ctx.dataset.label, ctx.parsed.y, suffix, decimals),
            },
          },
        },
      },
      plugins: [crosshair],
    }),
    [labels, series, suffix, decimals, fill, beginAtZero],
  );

  return <ChartCanvas build={build} label={ariaLabel} />;
}

export function RadarChart({
  labels,
  series,
  ariaLabel,
  min = 0,
  max = 100,
  tooltips,
}: {
  labels: string[];
  series: SeriesPair;
  ariaLabel: string;
  min?: number;
  max?: number;
  // Optional preformatted tooltip text per series, per axis.
  tooltips?: [string[], string[]];
}) {
  const build = useCallback(
    (t: Theme): ChartConfiguration<"radar"> => ({
      type: "radar",
      data: {
        labels,
        datasets: series.map((s, i) => {
          const color = seriesColor(i, t);
          return {
            label: s.label,
            data: s.data,
            borderColor: color,
            backgroundColor: withAlpha(color, 0.14),
            borderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: color,
            pointBorderColor: t.panel,
            pointBorderWidth: 2,
            pointHitRadius: 14,
          };
        }),
      },
      options: {
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) =>
                ` ${ctx.dataset.label}: ${
                  tooltips?.[ctx.datasetIndex]?.[ctx.dataIndex] ?? ctx.parsed.r
                }`,
            },
          },
        },
        scales: {
          r: {
            min,
            max,
            ticks: { display: false, stepSize: (max - min) / 4 },
            grid: { color: "rgba(255, 255, 255, 0.08)" },
            angleLines: { color: "rgba(255, 255, 255, 0.08)" },
            pointLabels: { color: t.muted, font: { size: 11, weight: 600 } },
          },
        },
      },
    }),
    [labels, series, min, max, tooltips],
  );

  return <ChartCanvas build={build} label={ariaLabel} />;
}
