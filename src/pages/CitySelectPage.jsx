import { useState, useEffect } from "react";
import { ShareNetwork } from "../components/icons";
import { useAuth } from "../lib/auth";
const selectCity = async () => {}; // stub
const requestCity = async () => {}; // stub
import { useCities } from "../hooks/useProfileQueries";
import { inputClass } from "../components/FormField";
import Dropdown from "../components/Dropdown";
import Modal from "../components/Modal";
import Card from "../components/Card";
import AlertBanner from "../components/AlertBanner";
import symbol from "../assets/symbol.svg";


export default function CitySelectPage() {
  const { user, fetchProfile } = useAuth();
  const { data: cities = [], isLoading: loading } = useCities();
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showRequest, setShowRequest] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });
  const [requestName, setRequestName] = useState("");
  const [requested, setRequested] = useState(false);

  const filteredCities = cities.filter((c) => !c.is_demo);

  const cityOptions = filteredCities.map((c) => ({
    value: c.id,
    label: `${c.name}${c.name_ko ? ` (${c.name_ko})` : ""}${c.member_count > 0 ? ` · ${c.member_count} members` : ""}`,
  }));

  async function handleSelect() {
    if (!selected || !user) return;
    setSaving(true);
    setError("");
    try {
      await selectCity(user.id, selected);
      await fetchProfile(user.id);
    } catch (e) {
      setError("Something went wrong. Please try again.");
    }
    setSaving(false);
  }

  async function handleRequest() {
    if (!requestName.trim() || !user) return;
    try {
      await requestCity(user.id, requestName.trim());
      setRequested(true);
      setRequestName("");
    } catch (e) {
      setError("Something went wrong while submitting your request.");
    }
  }

  const selectedCity = cities.find((c) => c.id === selected);
  const isFirstMember = selectedCity && selectedCity.member_count === 0;
  const nickname = user?.user_metadata?.nickname || "";

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm relative">
        <div className="text-center mb-6">
          <img src={symbol} alt="Dajeong" className="h-14 mx-auto mb-3" />
          <h2 className="text-heading font-bold text-ink">{nickname}, where do you live?</h2>
          <p className="text-body text-ink-soft mt-1 leading-relaxed">
            We'll show you nearby meetups, home meals, and local eats
          </p>
        </div>

        {loading ? (
          <div className="text-center text-body text-ink-soft py-8">Loading...</div>
        ) : (
          <div className="space-y-3 mb-4">
            <Dropdown
              value={selected}
              onChange={setSelected}
              options={cityOptions}
              placeholder="Select your city"
            />
          </div>
        )}

        {error && <p className="text-body text-flame-red mb-3 text-center">{error}</p>}

        <button
          onClick={handleSelect}
          disabled={!selected || saving}
          className="w-full py-3.5 rounded-xl bg-ember text-white font-bold text-title hover:bg-ember-deep transition-colors cursor-pointer disabled:opacity-50"
        >
          {saving ? "Setting up..." : "Start with this city"}
        </button>

        {/* Below button — absolute so layout doesn't shift */}
        <div className="absolute left-0 right-0 mt-4 space-y-3">
          {isFirstMember && (
            <Card className="text-center bg-flame/8 border-flame/20">
              <p className="text-body font-bold text-ink">
                🔥 You could be the first Ember in {selectedCity.name_ko || selectedCity.name}.
              </p>
              <p className="text-meta text-ink-soft mt-1">
                It'll be even warmer with friends.
              </p>
              <button
                onClick={async () => {
                  const slug = selectedCity ? `/${selectedCity.name.toLowerCase().replace(/\s+/g, "-")}/homemeal` : "";
                  const url = `${window.location.origin}${slug}`;
                  try {
                    await navigator.clipboard.writeText(url);
                    setAlert({ open: true, type: "success", message: "Link copied!" });
                  } catch {
                    prompt("Copy this link:", url);
                  }
                }}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg bg-ink text-white text-body-sm font-bold cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
              >
                <ShareNetwork size={14} weight="fill" /> Share with friends
              </button>
            </Card>
          )}
          <button
            onClick={() => setShowRequest(true)}
            className="w-full text-center text-body-sm text-ink-soft underline cursor-pointer"
          >
            My city isn't listed
          </button>
        </div>
      </div>

      {/* City request modal */}
      <Modal
        open={showRequest}
        onClose={() => { setShowRequest(false); setRequested(false); setRequestName(""); }}
        title="My city isn't listed"
        action={
          !requested && (
            <button
              onClick={handleRequest}
              disabled={!requestName.trim()}
              className="w-full py-3.5 rounded-xl bg-ink text-white font-bold text-title disabled:opacity-50"
            >
              Submit request
            </button>
          )
        }
      >
        {requested ? (
          <p className="text-body text-herb text-center pt-4 pb-6">Request submitted! We'll review and add it soon.</p>
        ) : (
          <div className="space-y-3 pb-4">
            <div>
              <p className="text-body-sm text-ink-soft mb-1.5">City</p>
              <input
                className={inputClass}
                placeholder="e.g. Tauranga"
                value={requestName}
                onChange={(e) => setRequestName(e.target.value)}
                maxLength={50}
              />
            </div>
          </div>
        )}
      </Modal>
      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert(a => ({ ...a, open: false }))} />
    </div>
  );
}
