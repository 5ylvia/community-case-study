import { Minus, Plus } from "./icons";

export default function NumberStepper({ value, onChange, min = 1, max = 20, suffix = "people" }) {
  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-soft hover:bg-ink/5 cursor-pointer transition-colors"
      >
        <Minus size={14} />
      </button>
      <span className="text-title font-bold text-ink w-8 text-center">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        className="w-8 h-8 rounded-full border border-line flex items-center justify-center text-ink-soft hover:bg-ink/5 cursor-pointer transition-colors"
      >
        <Plus size={14} />
      </button>
      <span className="text-body text-ink-soft">{suffix}</span>
    </div>
  );
}
