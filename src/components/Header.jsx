import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Bell, CaretDown, ShareNetwork, Heart } from "./icons";
import { useAuth } from "../lib/auth";
// TODO: replace with mock
const fetchCities = async () => [];
const selectCity = async () => {};
import Modal from "./Modal";
import LoginModal from "./LoginModal";
import AlertBanner from "./AlertBanner";
import symbol from "../assets/symbol.svg";

const taglines = [
  "Don't eat alone",
  <span key="t2">Let's share a meal <Heart size={12} weight="regular" className="inline -mt-0.5" /></span>,
];

export default function Header() {
  const navigate = useNavigate();
  const { user, profile, guest, viewCityId, setViewCityId, setViewCitySlug, basePath, hasUnread, fetchProfile } = useAuth();
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const [showCities, setShowCities] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });
  const [allCities, setAllCities] = useState([]);
  const [modalCountry, setModalCountry] = useState(null);

  const myCityId = profile?.city_id;
  const myCityName = profile?.cities?.name || "Select city";
  const profileCitySlug = profile?.cities
    ? `/${(profile.cities.country || "nz").toLowerCase()}/${profile.cities.name.toLowerCase().replace(/\s+/g, "-")}`
    : "";

  // viewing city name
  const viewCity = viewCityId ? allCities.find((c) => c.id === viewCityId) : null;
  const cities = modalCountry ? allCities.filter((c) => c.country === modalCountry) : allCities;
  const displayName = viewCity ? viewCity.name : myCityName;
  const isViewing = guest || (viewCityId && viewCityId !== myCityId);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIdx((i) => (i + 1) % taglines.length);
        setFade(true);
      }, 500);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (profile || guest) {
      fetchCities().then((all) => {
        setAllCities(all);
        // initial country setup
        if (profile) {
          setModalCountry(profile.cities?.country || "NZ");
        } else if (guest && viewCityId) {
          const guestCity = all.find((c) => c.id === viewCityId);
          setModalCountry(guestCity?.country || "NZ");
        }
      }).catch(console.error);
    }
  }, [profile, guest]);

  function openCities() {
    setShowCities(true);
  }

  function selectView(c) {
    if (c.id === myCityId) {
      setViewCityId(null);
      setViewCitySlug("");
      navigate(`${profileCitySlug}/homemeal`);
    } else {
      const slug = `/${(c.country || "nz").toLowerCase()}/${c.name.toLowerCase().replace(/\s+/g, "-")}`;
      setViewCityId(c.id);
      setViewCitySlug(slug);
      navigate(`${slug}/homemeal`);
    }
    setShowCities(false);
  }

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-100 bg-paper flex items-center justify-between px-4 py-4 md:left-20 md:justify-end">
        <img src={symbol} alt="Dajeong" className="h-9 md:hidden" />

        <div className="flex md:hidden items-center flex-col -mb-1">
          <span className={`text-meta text-ink-soft transition-all duration-500 ease-in-out ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
            {taglines[idx]}
          </span>
          <button onClick={openCities} className="flex items-center gap-1 text-body font-semibold text-ink cursor-pointer hover:underline htransition-colors">
            <MapPin size={16} /> {displayName} <CaretDown size={14} weight="bold" />
          </button>
        </div>

        {guest ? (
          <button onClick={() => setShowLoginModal(true)} className="px-3 py-1.5 rounded-lg bg-ember text-white text-body-sm font-bold md:hidden cursor-pointer hover:bg-ember-deep transition-colors">
            Log in
          </button>
        ) : (
          <button onClick={() => navigate("/notifications")} className="relative p-1 md:hidden transition-colors cursor-pointer">
            <Bell size={24} className="text-ink-soft hover:text-ink" />
            {hasUnread && <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-flame-red rounded-full border border-paper" />}
          </button>
        )}
        <div className="hidden md:flex items-center gap-3">
          <span className={`text-meta text-ink-soft transition-all duration-500 ease-in-out ${fade ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"}`}>
            {taglines[idx]}
          </span>
          <button onClick={openCities} className="flex items-center gap-1 text-body font-semibold text-ink cursor-pointer hover:underline htransition-colors">
            <MapPin size={16} /> {displayName}
          </button>
        </div>
      </header>
      {isViewing && (
        <div className="fixed bottom-20 md:bottom-6 left-0 md:left-20 right-0 px-4 z-100">
          <div className="max-w-120 mx-auto py-3 rounded-xl bg-paper2/60 backdrop-blur-xs text-body-sm text-ink-soft text-center shadow-sm">
            {guest ? (
              <>
                Browsing {viewCity?.name} ·{" "}
                <button onClick={() => navigate("/login")} className="text-ember hover:text-ember-deep font-semibold underline cursor-pointer">
                  Log in
                </button>
              </>
            ) : (
              <>
                Browsing {viewCity?.name} ·{" "}
                <button onClick={() => { setViewCityId(null); setViewCitySlug(""); navigate(`${profileCitySlug}/homemeal`); }} className="text-ink font-semibold underline cursor-pointer">
                  Back to my city
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Modal className="!max-h-[80vh]" open={showCities} onClose={() => setShowCities(false)} title="Browse other cities"
        action={
          <div className="text-center">
            <p className="text-body-sm text-ink-soft mb-4">Invite a friend and make your neighbourhood warmer</p>
            <button
              onClick={async () => {
                const url = `${window.location.origin}${basePath}/homemeal`;
                try {
                  await navigator.clipboard.writeText(url);
                  setAlert({ open: true, type: "success", message: "Link copied!" });
                } catch {
                  prompt("Copy this link:", url);
                }
              }}
              className="w-full md:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 rounded-lg bg-ink text-white text-body md:text-body-sm font-bold cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <ShareNetwork size={14} weight="fill" /> Share with friends
            </button>
          </div>
        }
      >
        <div className="pb-2 space-y-1">
          <div className="flex gap-2 mb-3">
            {[
              { code: "NZ", label: "🇳🇿 NZ" },
              { code: "AU", label: "🇦🇺 AU" },
            ].map(({ code, label }) => (
              <button
                key={code}
                onClick={() => setModalCountry(code)}
                className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold cursor-pointer transition-colors ${
                  modalCountry === code ? "bg-ink text-white" : "bg-ink/6 text-ink-soft hover:bg-ink/10"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {cities.length === 0 && (
            <div className="text-center text-body text-ink-soft py-6">Loading...</div>
          )}
          {cities.map((c) => {
            const isActive = c.member_count > 0 || c.id === myCityId;
            const isMine = c.id === myCityId;
            return (
              <div key={c.id} className={`flex items-center justify-between px-3 py-3 rounded-xl transition-colors ${
                (viewCityId || myCityId) === c.id ? "bg-ink/6 font-semibold" : "hover:bg-ink/4"
              } ${!isActive ? "opacity-50" : ""}`}>
                <button
                  onClick={() => selectView(c)}
                  className="flex items-center gap-2 flex-1 min-w-0 text-left cursor-pointer"
                >
                  <MapPin size={14} className="text-ink-soft shrink-0" />
                  <span className="text-body text-ink">{c.name}</span>
                  {c.name_ko && <span className="text-meta text-ink-soft">{c.name_ko}</span>}
                </button>
                <span className="text-tag text-ink-soft shrink-0 ml-2 flex items-center gap-1.5">
                  {!isMine && (
                    c.member_count >= 100 ? "Buzzing"
                    : c.member_count >= 30 ? "Active"
                    : c.member_count >= 10 ? "Warm"
                    : c.member_count >= 1 ? "Getting cozy"
                    : "Quiet"
                  )}
                  {isMine ? <span className="text-ember font-bold">My city</span>
                    : user && !guest && !c.is_demo && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          await selectCity(user.id, c.id);
                          await fetchProfile(user.id);
                          setViewCityId(null);
                          setViewCitySlug("");
                          setShowCities(false);
                          const slug = `/${(c.country || "nz").toLowerCase()}/${c.name.toLowerCase().replace(/\s+/g, "-")}`;
                          navigate(`${slug}/homemeal`);
                        }}
                        className="text-ink font-semibold underline cursor-pointer"
                      >
                        Move here
                      </button>
                    )}
                </span>
              </div>
            );
          })}
        </div>
      </Modal>

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert(a => ({ ...a, open: false }))} />
    </>
  );
}
