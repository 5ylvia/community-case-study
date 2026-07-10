import { Plus } from "./icons";

export default function Fab({ onClick, label }) {
  return (
    <>
      {/* Mobile: full-width bar */}
      <button
        onClick={onClick}
        className="fixed left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-102 bg-ember text-white rounded-xl py-3.5 text-title font-bold shadow-[0_8px_22px_rgba(79,31,10,0.28)] z-40 md:hidden cursor-pointer hover:bg-ember-deep hover:shadow-[0_10px_28px_rgba(79,31,10,0.35)] transition-all"
        style={{ bottom: "calc(4.5rem + env(safe-area-inset-bottom, 0px))" }}
      >
        {label}
      </button>
      {/* Desktop: bottom-right + icon */}
      <button
        onClick={onClick}
        className="hidden md:flex fixed bottom-8 right-8 w-14 h-14 rounded-full bg-ember text-white items-center justify-center shadow-lg z-40 cursor-pointer hover:bg-ember-deep hover:shadow-xl hover:-translate-y-0.5 transition-all"
      >
        <Plus size={28} weight="bold" />
      </button>
    </>
  );
}
