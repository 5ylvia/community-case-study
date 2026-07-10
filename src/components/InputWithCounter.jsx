import { inputClass } from "./FormField";

export default function InputWithCounter({ value, onChange, maxLength, as = "input", ...props }) {
  const Tag = as;
  return (
    <div className="relative">
      <Tag
        className={`${inputClass} ${as === "textarea" ? "min-h-15 block resize-y" : ""} ${props.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        value={value}
        onChange={onChange}
        maxLength={maxLength}
        {...props}
      />
      {maxLength && (
        <span className="absolute bottom-0 right-3 text-[10px] text-ink-soft/50">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}
