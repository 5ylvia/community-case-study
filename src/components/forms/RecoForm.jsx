import FormField, { inputClass } from "../FormField";
import InputWithCounter from "../InputWithCounter";
import SuburbSelect from "../SuburbSelect";
import Dropdown from "../Dropdown";

const CATEGORIES = ["Korean", "Asian", "Cafe", "Western", "Dessert / Bakery", "Other"];
const CATEGORY_OPTIONS = CATEGORIES.map((c) => ({ value: c, label: c }));

export default function RecoForm({ form, setForm, editMode }) {
  return (
    <>
      <FormField label="Restaurant name">
        <InputWithCounter placeholder="Restaurant name" value={form.name} maxLength={50}
          disabled={editMode}
          onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
      </FormField>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-3">
        <FormField label="Category">
          <Dropdown
            value={form.category}
            onChange={(v) => setForm(f => ({ ...f, category: v || "Korean" }))}
            options={CATEGORY_OPTIONS}
            placeholder="Category"
            disabled={editMode}
          />
        </FormField>
        <FormField label="Suburb">
          <SuburbSelect value={form.suburbId}
            onChange={(id) => setForm(f => ({ ...f, suburbId: id }))} />
        </FormField>
      </div>
      <FormField label="One-line review">
        <InputWithCounter placeholder="What's good here?" value={form.note} maxLength={100}
          onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} />
      </FormField>
      <FormField label="Google Maps link (optional)">
        <input className={inputClass} placeholder="https://maps.google.com/..." value={form.mapUrl}
          onChange={(e) => setForm(f => ({ ...f, mapUrl: e.target.value }))} />
      </FormField>
    </>
  );
}

export const RECO_DEFAULTS = { name: "", category: "Korean", suburbId: null, note: "", mapUrl: "" };
