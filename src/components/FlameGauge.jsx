/**
 * Flame gauge — fills from the inside out based on score (0–100).
 * Gentle swaying flame + heartbeat pulse + rising sparks.
 */

const EMPTY = "var(--color-ink-soft)";

const COLORS = {
  outer: "#3C281E",
  body: "var(--color-flame-red)",
  inner: "var(--color-ember)",
  heart: "var(--color-flame)",
  detail: "#FFECBD",
};

const PATHS = [
  "M264.55 100.023C452.209 104.502 552.588 468.42 347.48 509.929C191.861 541.423 112.916 477.041 101.231 353.549C92.1573 257.665 134.544 142.668 186.055 195.499C201.185 150.14 210.884 98.7431 264.55 100.023Z",
  "M289.531 146.255C410.02 214.462 562.268 509.423 270.408 509.423C117.603 509.423 98.0087 306.081 168.319 235.07C174.448 228.88 196.875 256.163 203.287 258.688C201.222 229.442 230.637 109.897 289.531 146.255Z",
  "M245.877 259.276C245.941 211.212 301.539 197.825 334.072 233.205C379.599 282.716 413.487 359.978 363.823 464.785C360.461 471.88 356.194 478.818 349.876 483.48C311.896 511.501 246.431 478.584 208.288 443.964C175.072 413.818 167.414 372.165 170.607 333.363C173.538 297.755 208.897 292.561 237.682 313.726C243.41 317.938 249.207 312.496 248.591 305.413C247.292 290.493 245.856 274.818 245.877 259.276Z",
  "M361.186 388.569C376.388 617.662 136.449 369.398 226.91 347.191C257.566 339.665 276.436 384.256 282.071 382.525C286.603 381.133 351.898 248.603 361.186 388.569Z",
  "M305.012 426.992C305.012 426.992 267.973 399.701 259.139 418.546C248.633 440.961 306.497 477.455 322.499 470.855C337.424 464.698 360.705 384.627 329.885 391.928C311.258 396.342 305.012 426.992 305.012 426.992Z",
];

function getStyles(score) {
  const s = Math.max(0, Math.min(100, score));
  const off = { fill: EMPTY, opacity: 0.06 };
  const on = (color) => ({ fill: color, opacity: 1 });

  const filled = Math.floor(s / 20);

  const layers = [COLORS.outer, COLORS.body, COLORS.inner, COLORS.heart, COLORS.detail];
  return layers.map((color, i) => {
    const layerIndex = 4 - i;
    if (layerIndex < filled) return on(color);
    return off;
  });
}

export default function FlameGauge({ score, size = 120 }) {
  const styles = getStyles(score);
  const hasFlame = score > 10;

  return (
    <div className="inline-flex flex-col items-center">
      <div
        style={{
          width: size,
          height: size * (618 / 561),
          transformOrigin: "50% 100%",
          animation: hasFlame ? "flame-sway 4s ease-in-out infinite" : "none",
        }}
      >
        <svg
          viewBox="0 0 561 618"
          width="100%"
          height="100%"
        >
          <defs>
            <filter id="outer-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="30" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {score > 40 && <>
            <circle r="5" cx="240" cy="180" fill="var(--color-flame)" opacity="0"
              style={{ animation: "flame-spark 2.8s ease-out infinite" }} />
            <circle r="3.5" cx="320" cy="160" fill="var(--color-flame)" opacity="0"
              style={{ animation: "flame-spark 2.8s ease-out 0.9s infinite" }} />
            <circle r="4" cx="280" cy="140" fill="var(--color-flame)" opacity="0"
              style={{ animation: "flame-spark 2.8s ease-out 1.7s infinite" }} />
          </>}

          {/* glow — outermost active layer */}
          {(() => {
            const activeIdx = styles.findIndex((s) => s.opacity === 1);
            if (activeIdx >= 0) return (
              <path d={PATHS[activeIdx]} fill={styles[activeIdx].fill} opacity="0.6" filter="url(#outer-glow)" />
            );
            return null;
          })()}

          {PATHS.map((d, i) => {
            const isPulse = hasFlame && styles[i].opacity === 1 && (i === 3 || i === 4);
            return (
              <path
                key={i}
                d={d}
                fill={styles[i].fill}
                opacity={styles[i].opacity}
                style={isPulse ? {
                  transformOrigin: "50% 70%",
                  animation: "flame-pulse 3s ease-in-out infinite",
                } : undefined}
              />
            );
          })}
        </svg>
      </div>
      <div className="text-title font-bold text-ink -mt-2">{score} pts</div>
    </div>
  );
}
