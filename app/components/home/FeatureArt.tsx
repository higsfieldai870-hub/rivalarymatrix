import styles from "./art.module.css";

// Decorative previews for the home page's feature tiles: left player in
// green, right player in blue, the same pairing every comparison uses.

export type ArtKind = "battle" | "radar" | "clock" | "chart" | "path" | "number";

const battle: [string, number, number][] = [
  ["GOALS", 78, 64],
  ["ASSISTS", 52, 70],
  ["xG", 68, 58],
  ["DRIBBLES", 84, 46],
];

function radarPoints(values: number[], radius = 78) {
  return values
    .map((v, i) => {
      const angle = ((-90 + (360 / values.length) * i) * Math.PI) / 180;
      return `${(100 + Math.cos(angle) * radius * v).toFixed(1)},${(100 + Math.sin(angle) * radius * v).toFixed(1)}`;
    })
    .join(" ");
}

const chartLine = (values: number[]) => values.map((v, i) => `${i * 50},${112 - v}`).join(" ");
const chartLeft = [28, 52, 46, 78, 70, 94, 86];
const chartRight = [36, 42, 66, 60, 88, 76, 100];

// Club moves along two careers, as a share of the timeline.
const careers = [
  [0, 24, 50, 76, 100],
  [0, 36, 62, 100],
];

export default function FeatureArt({ kind, index }: { kind: ArtKind; index: number }) {
  switch (kind) {
    case "battle":
      return (
        <div className={styles.battle}>
          {battle.map(([label, left, right]) => (
            <div key={label} className={styles.battleRow}>
              <span className={styles.barLeft}>
                <i className={styles.fill} style={{ width: `${left}%` }} />
              </span>
              <em>{label}</em>
              <span className={styles.barRight}>
                <i className={styles.fill} style={{ width: `${right}%` }} />
              </span>
            </div>
          ))}
        </div>
      );

    case "radar":
      return (
        <svg className={styles.radar} viewBox="0 0 200 200">
          {[1, 0.66, 0.33].map((scale) => (
            <polygon key={scale} className={styles.grid} points={radarPoints([1, 1, 1, 1, 1], 78 * scale)} />
          ))}
          <polygon className={styles.shapeRight} points={radarPoints([0.72, 0.92, 0.6, 0.82, 0.66])} />
          <polygon className={styles.shapeLeft} points={radarPoints([0.94, 0.68, 0.84, 0.5, 0.88])} />
        </svg>
      );

    case "clock":
      return (
        <div className={styles.clock}>
          <span>90&apos;</span>
        </div>
      );

    case "chart":
      return (
        <svg className={styles.chart} viewBox="0 0 300 120" preserveAspectRatio="none">
          {[30, 60, 90].map((y) => (
            <line key={y} className={styles.grid} x1="0" x2="300" y1={y} y2={y} />
          ))}
          <polygon className={styles.areaLeft} points={`0,120 ${chartLine(chartLeft)} 300,120`} />
          <polyline className={styles.lineRight} points={chartLine(chartRight)} />
          <polyline className={styles.lineLeft} points={chartLine(chartLeft)} />
        </svg>
      );

    case "path":
      return (
        <div className={styles.path}>
          {careers.map((stops, side) => (
            <div key={side} className={`${styles.track} ${side ? styles.trackRight : styles.trackLeft}`}>
              {stops.map((at) => (
                <i key={at} style={{ left: `${at}%` }} />
              ))}
            </div>
          ))}
        </div>
      );

    case "number":
      return <span className={styles.number}>{String(index).padStart(2, "0")}</span>;
  }
}
