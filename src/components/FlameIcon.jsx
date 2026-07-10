import { Fire } from "./icons";

const CELL = 20;

function flameCells(score) {
  const s = Math.max(0, Math.min(100, score));
  const full = Math.floor(s / CELL);
  const rem = s % CELL;
  return Array.from({ length: 5 }).map((_, i) => {
    if (i < full) return "full";
    if (i === full && rem > 0) return "partial";
    return "empty";
  });
}

const cellClass = {
  full: "text-flame-red",
  partial: "text-ember",
  empty: "text-ink-soft opacity-22",
};

export default function FlameIcon({ score, size = 13, frozen = false }) {
  const cells = flameCells(score);
  return (
    <span className={`inline-flex gap-px ${frozen ? "opacity-50" : ""}`} title={`Ember ${score} pts`}>
      {cells.map((cell, i) => (
        <Fire
          key={i}
          size={size}
          weight="fill"
          className={cellClass[cell]}
        />
      ))}
    </span>
  );
}
