import { useState } from "react";
import { ForkKnife, ShoppingCart, Plus } from "../icons";
import FormField, { inputClass, inputSmClass } from "../FormField";
import InputWithCounter from "../InputWithCounter";
import Chip from "../Chip";
import SuburbSelect from "../SuburbSelect";
import DateTimePicker from "../DateTimePicker";

const REASON_OPTIONS_GO = [
  "🍖 Big portions",
  "🍽 Share variety",
  "🙈 Too shy to go alone",
  "🎫 Discount reservation",
];

const REASON_OPTIONS_BUY = [
  "🏷️ Group deal",
  "📦 Bulk buy",
  "✂️ Split 1/n",
];

function CustomTagInput({ onAdd, existing }) {
  const [text, setText] = useState("");
  function handleAdd() {
    const tag = text.trim();
    if (!tag || existing.includes(tag)) return;
    onAdd(tag);
    setText("");
  }
  return (
    <div className="flex gap-1.5 mt-2">
      <input
        className={inputClass + " flex-1 !py-1.5 !text-body-sm"}
        placeholder="Custom tag"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && !e.nativeEvent.isComposing && (e.preventDefault(), handleAdd())}
        maxLength={20}
      />
      <button type="button" onClick={handleAdd} disabled={!text.trim()}
        className="px-2.5 py-1.5 rounded-lg bg-ink text-white text-body-sm font-bold shrink-0 disabled:opacity-30 cursor-pointer">
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function MeetingForm({ form, setForm, editMode }) {
  const isGo = form.kind === "go";

  function toggleReason(r) {
    setForm((f) => ({
      ...f,
      reasons: f.reasons.includes(r) ? f.reasons.filter((x) => x !== r) : [...f.reasons, r],
    }));
  }

  return (
    <>
      <FormField label="Type">
        <div className="flex gap-2">
          <Chip active={isGo} onClick={() => setForm(f => ({ ...f, kind: "go" }))}>
            <ForkKnife size={14} weight="fill" className="inline mr-1 -mt-0.5" /> Eat Together
          </Chip>
          <Chip active={!isGo} onClick={() => setForm(f => ({ ...f, kind: "buy" }))}>
            <ShoppingCart size={14} weight="fill" className="inline mr-1 -mt-0.5" /> Buy Together
          </Chip>
        </div>
      </FormField>

      <FormField label="Title *">
        <InputWithCounter
          placeholder={isGo ? "Where are we eating?" : "What are we buying?"}
          value={form.title} maxLength={50}
          onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
      </FormField>

      <FormField label="Description">
        <InputWithCounter as="textarea"
          placeholder={isGo ? "Why go together? What's the place like?" : "What to buy and how to split?"}
          value={form.description} maxLength={300}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
        <FormField label="Suburb">
          <SuburbSelect value={form.suburbId}
            onChange={(id) => setForm(f => ({ ...f, suburbId: id }))} />
        </FormField>
        <FormField label="Address">
          <input className={inputClass} placeholder="Google Maps link or address" value={form.address || ""}
            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
        </FormField>
      </div>

      <FormField label="Date & time *">
        <DateTimePicker value={form.meetAt}
          onChange={(v) => setForm(f => ({ ...f, meetAt: v }))} />
      </FormField>

      {/* Estimated cost */}
      <FormField label="Estimated cost">
        <InputWithCounter
          placeholder={isGo ? "e.g. ~$20 per person" : "e.g. $50 total, ~$10 each"}
          value={form.budget || ""} maxLength={50}
          onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))} />
      </FormField>

      {/* Capacity limit */}
      <FormField label="People">
        <label className="flex items-center gap-1.5 text-body-sm text-ink-soft cursor-pointer mb-2">
          <input type="checkbox" checked={form.limited || false}
            onChange={(e) => setForm(f => ({ ...f, limited: e.target.checked }))} />
          Limit the number of people
        </label>
        {form.limited && (
          <div className="flex items-center gap-2 mb-2">
            <input type="number" min={2} max={20} className={inputSmClass} value={form.minCapacity || 2}
              onChange={(e) => setForm(f => ({ ...f, minCapacity: Number(e.target.value) }))} />
            <span className="text-body-sm text-ink-soft">~</span>
            <input type="number" min={2} max={20} className={inputSmClass} value={form.capacity}
              onChange={(e) => setForm(f => ({ ...f, capacity: Number(e.target.value) }))} />
            <span className="text-body text-ink-soft">people <span className="text-tag text-ink-soft/60">(incl. yourself)</span></span>
          </div>
        )}
        <p className="text-tag text-ink-soft/60">
          {form.limited
            ? "If the minimum isn't met, we'll notify everyone the day before"
            : "Open to everyone — no limit"}
        </p>
      </FormField>

      {/* Reason tags */}
      <FormField label="Tags">
        <div className="flex flex-wrap gap-1.5">
          {(isGo ? REASON_OPTIONS_GO : REASON_OPTIONS_BUY).map((r) => (
            <Chip key={r} active={form.reasons.includes(r)} onClick={() => toggleReason(r)}>{r}</Chip>
          ))}
          {form.reasons.filter(r => !(isGo ? REASON_OPTIONS_GO : REASON_OPTIONS_BUY).includes(r)).map((r) => (
            <Chip key={r} active onClick={() => toggleReason(r)}>{r} ✕</Chip>
          ))}
        </div>
        <CustomTagInput onAdd={(tag) => setForm(f => ({ ...f, reasons: [...f.reasons, tag] }))} existing={form.reasons} />
      </FormField>
    </>
  );
}

export const MEETING_DEFAULTS = { kind: "go", title: "", description: "", suburbId: null, address: "", meetAt: "", budget: "", limited: false, capacity: 4, minCapacity: 2, reasons: [] };
