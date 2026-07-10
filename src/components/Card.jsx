export default function Card({ children, className = "", glow, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`bg-card rounded-2xl p-6 md:p-4 border border-line ${
        glow ? "shadow-[0_0_12px_rgba(254,183,0,0.33)]" : "shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
      } ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
