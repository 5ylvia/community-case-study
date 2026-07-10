export default function Chip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center px-4 py-1 rounded-full text-[11.5px] font-semibold border transition-all duration-200 whitespace-nowrap ${
        active
          ? "bg-ink text-paper border-ink"
          : "bg-card text-ink-soft border-line"
      }`}
    >
      {children}
    </button>
  );
}
