import { ChefHat, PuzzlePiece, Gift } from "../icons";
import FormField, { inputClass, inputSmClass } from "../FormField";
import InputWithCounter from "../InputWithCounter";
import Chip from "../Chip";
import SuburbSelect from "../SuburbSelect";
import DateTimePicker from "../DateTimePicker";

export default function HomemealForm({ form, setForm, editMode, showErrors }) {
  const isCook = form.kind === "cook";
  const isPotluck = form.kind === "potluck";
  const isShare = form.kind === "share";

  return (
    <>
      <FormField label="Type">
        <div className="flex gap-2 flex-wrap">
          <Chip active={isCook} onClick={() => setForm(f => ({ ...f, kind: "cook" }))}>
            <ChefHat size={14} weight="fill" className="inline mr-1 -mt-0.5" /> Cook Together
          </Chip>
          <Chip active={isPotluck} onClick={() => setForm(f => ({ ...f, kind: "potluck" }))}>
            <PuzzlePiece size={14} weight="fill" className="inline mr-1 -mt-0.5" /> Share
          </Chip>
          <Chip active={isShare} onClick={() => setForm(f => ({ ...f, kind: "share" }))}>
            <Gift size={14} weight="fill" className="inline mr-1 -mt-0.5" /> Free
          </Chip>
        </div>
      </FormField>

      <FormField label="Title *">
        <InputWithCounter
          placeholder={isCook ? "What are we cooking together?" : isPotluck ? "What are you sharing?" : "What are you giving away?"}
          value={form.title} maxLength={50}
          onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} />
      </FormField>

      <FormField label="Description">
        <InputWithCounter as="textarea"
          placeholder={isCook ? "Ingredients, what to bring, how we'll cook, etc." : isPotluck ? "What you're sharing and how to pick up" : "Brief description"}
          value={form.description} maxLength={300}
          onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
      </FormField>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
        <FormField label="Suburb *">
          <SuburbSelect value={form.suburbId}
            onChange={(id) => setForm(f => ({ ...f, suburbId: id }))} />
        </FormField>
        <FormField label={<>Address * <span className="text-tag text-ink-soft font-normal">· Shared with participants 24h before</span></>}>
          <InputWithCounter placeholder="Google Maps link or address" value={form.address || ""} maxLength={100}
            onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))} />
        </FormField>
      </div>

      <FormField label="Date & time *">
        <DateTimePicker value={form.shareAt}
          onChange={(v) => setForm(f => ({ ...f, shareAt: v }))} />
      </FormField>

      {/* Estimated ingredient cost — Cook Together / Potluck only */}
      {!isShare && (
        <FormField label="Estimated ingredient cost">
          <InputWithCounter
            placeholder="e.g. ~$10 per person"
            value={form.budget || ""} maxLength={50}
            onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))} />
        </FormField>
      )}

      {/* Capacity limit */}
      <FormField label="People">
        <label className="flex items-center gap-1.5 text-body-sm text-ink-soft cursor-pointer mb-2">
          <input type="checkbox" checked={form.limited || false}            onChange={(e) => setForm(f => ({ ...f, limited: e.target.checked }))} />
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
    </>
  );
}

export const HOMEMEAL_DEFAULTS = { kind: "cook", title: "", description: "", suburbId: null, address: "", shareAt: "", budget: "", limited: false, capacity: 4, minCapacity: 2 };
