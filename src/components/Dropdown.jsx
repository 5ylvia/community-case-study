import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { CaretDown } from "./icons";

export default function Dropdown({ value, onChange, options, placeholder = "Select", disabled = false, className = "" }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

  const selected = options.find((o) => o.value === value);

  const updatePos = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePos();
    function handleClickOutside(e) {
      if (btnRef.current?.contains(e.target)) return;
      if (listRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    function handleScroll() { updatePos(); }
    document.addEventListener("mousedown", handleClickOutside, true);
    window.addEventListener("scroll", handleScroll, true);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside, true);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [open, updatePos]);

  function handleSelect(opt) {
    onChange(opt.value);
    setOpen(false);
  }

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={`w-full px-3 py-2.5 rounded-[10px] border bg-paper text-body outline-none transition-colors text-left flex items-center justify-between gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          open ? "border-ember" : "border-line"
        }`}
      >
        <span className={selected ? "text-ink" : "text-ink-soft"}>{selected ? selected.label : placeholder}</span>
        <CaretDown size={14} className={`text-ink-soft shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <ul
          ref={listRef}
          className="fixed max-h-60 overflow-y-auto rounded-xl border border-line bg-paper shadow-lg py-1"
          style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 9999 }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              onClick={() => handleSelect(opt)}
              className={`px-3 py-2.5 text-body cursor-pointer transition-colors ${
                opt.value === value
                  ? "bg-ink/6 text-ink font-semibold"
                  : "text-ink hover:bg-ink/4"
              }`}
            >
              {opt.label}
            </li>
          ))}
          {options.length === 0 && (
            <li className="px-3 py-2.5 text-body text-ink-soft">No items available</li>
          )}
        </ul>,
        document.body
      )}
    </div>
  );
}
