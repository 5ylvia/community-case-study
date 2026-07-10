import { useEffect } from "react";
import { X } from "./icons";

export default function Modal({ open, onClose, title, subtitle, action, children, className = "" }) {
  useEffect(() => {
    if (open) {
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflow = "";
        window.scrollTo(0, scrollY);
      };
    }
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-end md:items-center justify-center z-200 md:pl-20" onClick={onClose}>
      <div
        className={`bg-card rounded-t-[20px] md:rounded-2xl w-full max-w-120 md:max-w-[500px] max-h-[85vh] flex flex-col ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start p-8 pb-4">
          <div>
            <h3 className="text-heading font-bold text-ink">{title}</h3>
            {subtitle && <p className="text-meta text-ink-soft mt-0.5">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-ink-soft p-1 cursor-pointer hover:text-ink">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto px-8">
          {children}
        </div>
        {action && (
          <div className="sticky bottom-0 px-8 pt-4 pb-8 bg-card rounded-b-none md:rounded-b-2xl"
            style={{ paddingBottom: "calc(2rem + env(safe-area-inset-bottom, 0px))" }}>
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
