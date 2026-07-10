import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarBlank } from "./icons";
import Dropdown from "./Dropdown";

const HOURS = Array.from({ length: 24 }, (_, i) => {
  const h = i.toString().padStart(2, "0");
  return [
    { value: `${h}:00`, label: `${h}:00` },
    { value: `${h}:30`, label: `${h}:30` },
  ];
}).flat();

export default function DateTimePicker({ value, onChange }) {
  const date = value ? new Date(value) : null;
  const timeStr = date ? `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes() < 30 ? "00" : "30"}` : null;

  function handleDateChange(d) {
    if (!d) { onChange(""); return; }
    const existing = date || new Date();
    d.setHours(existing.getHours(), existing.getMinutes());
    onChange(d.toISOString());
  }

  function handleTimeChange(t) {
    if (!t) return;
    const [h, m] = t.split(":").map(Number);
    const d = date ? new Date(date) : new Date();
    d.setHours(h, m, 0, 0);
    onChange(d.toISOString());
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
      <div className="relative">
        <DatePicker
          selected={date}
          onChange={handleDateChange}
          dateFormat="yyyy/MM/dd"
          placeholderText="Select date"
          minDate={new Date()}
          className="w-full px-3 py-2.5 pl-9 rounded-[10px] border border-line bg-paper text-ink text-sm outline-none focus:border-ember transition-colors"
          calendarClassName="dajeong-calendar"
          wrapperClassName="w-full"
          popperClassName="!z-[9999]"
          popperPlacement="bottom-end"
          portalId="datepicker-portal"
        />
        <CalendarBlank size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none" />
      </div>
      <Dropdown
        value={timeStr}
        onChange={handleTimeChange}
        options={HOURS}
        placeholder="Select time"
      />
    </div>
  );
}
