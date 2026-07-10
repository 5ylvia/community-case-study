import { useEffect } from "react";
import { CheckCircle, HourglassSimple, ClockCounterClockwise, X, Info } from "./icons";

const ICONS = {
  success: <CheckCircle size={18} weight="fill" className="text-herb" />,
  waitlist: <HourglassSimple size={18} weight="fill" className="text-flame" />,
  pending: <ClockCounterClockwise size={18} className="text-ink-soft" />,
  info: <Info size={18} className="text-ember" />,
};

export default function AlertBanner({ open, type = "success", message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  if (!open) return null;

  return (
    <div className="fixed top-4 left-0 right-0 md:left-20 z-150 flex justify-center px-4 animate-slide-down">
      <div className="bg-card border border-line rounded-2xl shadow-lg px-4 py-3 flex items-center gap-2.5 w-full max-w-96">
        {ICONS[type]}
        <span className="text-body text-ink flex-1">{message}</span>
        <button onClick={onClose} className="text-ink-soft p-0.5">
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
