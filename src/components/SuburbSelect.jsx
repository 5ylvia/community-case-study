import { useAuth } from "../lib/auth";
import { useSuburbs } from "../hooks/useProfileQueries";
import Dropdown from "./Dropdown";

export default function SuburbSelect({ value, onChange }) {
  const { profile } = useAuth();
  const { data: suburbs = [] } = useSuburbs(profile?.city_id);

  const options = suburbs.map((s) => ({ value: s.id, label: s.name }));

  return (
    <Dropdown
      value={value}
      onChange={onChange}
      options={options}
      placeholder="Select suburb"
    />
  );
}
