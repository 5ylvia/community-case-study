export default function FormField({ label, children }) {
  return (
    <label className="block mb-3.5">
      <span className="block text-body font-semibold text-ink-soft mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "w-full px-3 py-2.5 rounded-[10px] border border-line bg-paper text-ink text-sm outline-none focus:border-ember transition-colors";

export const inputSmClass =
  "w-20 px-3 py-2 rounded-[10px] border border-line bg-paper text-ink text-sm outline-none focus:border-ember transition-colors";
