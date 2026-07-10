import { useState, useEffect } from "react";
import { Trophy, Fire, Log, CaretDown, Pencil, SignOut } from "../components/icons";
import { useAuth } from "../lib/auth";
import usePageTitle from "../hooks/usePageTitle";
import { useBadges, useRanking, useCities, useSuburbs } from "../hooks/useProfileQueries";
// TODO: replace with mock
const selectCity = async () => {};
const updateProfile = async () => {};
const checkNickname = async () => false; // stub: always available
import Card from "../components/Card";
import FlameGauge from "../components/FlameGauge";
import Modal from "../components/Modal";
import Dropdown from "../components/Dropdown";
import { inputClass } from "../components/FormField";
import MyActivity from "../components/MyActivity";

const BADGE_META = {
  pioneer: { icon: "🏅", name: "Pioneer" },
  sharer: { icon: "❤️", name: "Sharer" },
  foodie: { icon: "🍽", name: "Foodie" },
};

const BADGE_DESCS = {
  pioneer: () => "Completed your first meetup",
  sharer: () => "Shared 5 home meals",
  foodie: () => "Your food pick reached 100 likes",
};


export default function MePage() {
  usePageTitle("Profile — sharing Jeong");
  const { user, profile, signOut, fetchProfile } = useAuth();
  const [showFlameInfo, setShowFlameInfo] = useState(false);

  // Nickname
  const [editingNick, setEditingNick] = useState(false);
  const [nickname, setNickname] = useState("");
  const [nickError, setNickError] = useState("");
  const [saving, setSaving] = useState(false);

  // City/suburb
  const { data: cities = [] } = useCities();
  const [selectedCity, setSelectedCity] = useState(null);
  const [selectedSuburb, setSelectedSuburb] = useState(null);
  const [showLocation, setShowLocation] = useState(false);
  const { data: suburbs = [] } = useSuburbs(selectedCity);

  const { data: badges = [] } = useBadges(profile?.id);
  const { data: ranking = [] } = useRanking(profile?.city_id);

  useEffect(() => {
    if (profile && cities.length > 0) {
      setSelectedCity(profile.city_id || null);
      setSelectedSuburb(profile.suburb_id || null);
    }
  }, [profile, cities]);

  if (!profile) return <div className="text-center text-body text-ink-soft py-12">Loading...</div>;

  const cityName = profile.cities?.name || "Auckland";
  const suburbName = suburbs.find(s => s.id === selectedSuburb)?.name;
  const score = profile.flame_score || 30;

  function startEditNick() {
    setNickname(profile?.nickname || "");
    setEditingNick(true);
  }

  async function saveNick() {
    if (!nickname.trim() || !user) return;
    if (nickname.trim() === profile?.nickname) { setEditingNick(false); return; }
    setSaving(true);
    const isDup = await checkNickname(nickname.trim(), user.id);
    if (isDup) { setNickError("This nickname is already taken."); setSaving(false); return; }
    await updateProfile(user.id, { nickname: nickname.trim() });
    await fetchProfile(user.id);
    setSaving(false);
    setEditingNick(false);
  }

  async function handleCityChange(cityId) {
    setSelectedCity(cityId);
    setSelectedSuburb(null);
    if (!cityId || !user) return;
    await selectCity(user.id, cityId);
    await updateProfile(user.id, { suburb_id: null });
    await fetchProfile(user.id);
  }

  async function handleSuburbChange(suburbId) {
    setSelectedSuburb(suburbId);
    if (!user) return;
    await updateProfile(user.id, { suburb_id: suburbId });
    await fetchProfile(user.id);
  }

  const currentCityBadges = ["pioneer", "sharer", "foodie"].map((type) => {
    const earned = badges.find((b) => b.badge_type === type && b.city_id === profile.city_id);
    return { type, ...BADGE_META[type], name: `${cityName} ${BADGE_META[type].name}`, desc: BADGE_DESCS[type](), got: !!earned };
  });
  const otherBadges = badges
    .filter((b) => b.city_id !== profile.city_id)
    .map((b) => ({ type: b.badge_type, ...BADGE_META[b.badge_type], cityName: b.city?.name || "?", desc: BADGE_DESCS[b.badge_type](), got: true }));

  const cityOptions = cities.filter((c) => !c.is_demo).map((c) => ({ value: c.id, label: c.name }));

  return (
    <div className="px-4 pt-24 md:py-16 pb-40">

      {/* Title */}
      <div className="mb-3.5">
        <h2 className="text-heading font-bold text-ink">The more you share, the brighter your Ember</h2>
        <p className="text-body text-ink-soft mt-1 leading-relaxed">Trust grows into Embers, and your activity is captured in rankings and badges</p>
      </div>

      {/* Ember */}
      <Card className="mb-3 text-center">
        <FlameGauge score={score} />
        <div className="text-meta text-ink-soft mt-1">
          {score > 80 ? "Burning bright! You're a truly warm person"
            : score > 60 ? "Your Jeong is growing well. Keep sharing!"
            : score > 40 ? "Your Ember is growing. Almost there!"
            : score > 20 ? "Let's make the neighborhood warmer together"
            : score > 10 ? "Your Ember is getting low — please keep your commitments"
            : "Your Ember is going out — you can't host meetups"}
        </div>
      </Card>
      <p className="text-meta text-ink-soft text-center mb-6 leading-relaxed px-1">
        Embers represent <b>trust</b>. They glow brighter when you share good times, and dim when things don't go well.{" "}
        <button onClick={() => setShowFlameInfo(true)} className="text-ink underline cursor-pointer font-semibold">
          Learn more
        </button>
      </p>

      {/* My info */}
      <Card className="mb-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-tag text-ink-soft mb-0.5">Nickname</div>
              {editingNick ? (
                <div className="flex gap-2 mt-1">
                  <div className="relative flex-1">
                    <input
                      className={inputClass + " w-full"}
                      value={nickname}
                      onChange={(e) => { setNickname(e.target.value); setNickError(""); }}
                      onKeyDown={(e) => e.key === "Enter" && saveNick()}
                      maxLength={20}
                      autoFocus
                    />
                    {nickError && <p className="absolute left-0 top-full mt-0.5 text-tag text-flame-red">{nickError}</p>}
                  </div>
                  <button onClick={saveNick} disabled={!nickname.trim() || saving}
                    className="px-3 py-2 rounded-lg bg-ink text-white text-body-sm font-bold shrink-0 disabled:opacity-50 cursor-pointer">
                    {saving ? "..." : "Save"}
                  </button>
                </div>
              ) : (
                <div className="text-body font-semibold text-ink">{profile.nickname}</div>
              )}
            </div>
            {!editingNick && (
              <button onClick={startEditNick} className="text-ink-soft/40 hover:text-ink cursor-pointer p-1">
                <Pencil size={14} />
              </button>
            )}
          </div>

          <div className="border-t border-line" />

          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-tag text-ink-soft">My city (suburb)</div>
              <button onClick={() => setShowLocation(v => !v)} className="text-tag text-ink-soft cursor-pointer">
                <CaretDown size={12} className={`transition-transform ${showLocation ? "rotate-180" : ""}`} />
              </button>
            </div>
            {!showLocation && (
              <div className="text-body font-semibold text-ink">{suburbName ? `${suburbName}, ` : ""}{cityName}</div>
            )}
            {showLocation && (
              <div className="space-y-2.5 mt-1">
                <Dropdown value={selectedCity} onChange={handleCityChange}
                  options={cityOptions} placeholder="City" />
                <Dropdown value={selectedSuburb} onChange={handleSuburbChange}
                  options={[{ value: "", label: "None" }, ...suburbs.map((s) => ({ value: s.id, label: s.name }))]}
                  placeholder="Suburb" disabled={!selectedCity} />
                <p className="text-tag text-ink-soft/60">Your suburb will be auto-filled when you create a post</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Ranking */}
      {ranking.length > 0 && (
        <>
          <div className="text-body font-bold mb-2.5 px-0.5 inline-flex items-center gap-1">
            <Trophy size={16} weight="fill" className="text-flame" /> This month's {cityName} Ember Keepers
          </div>
          <Card className="mb-6">
            {ranking.map((r, i) => (
              <div key={r.id} className={`flex items-center gap-3 ${i > 0 ? "mt-3 pt-3 border-t border-line" : ""}`}>
                <span className="text-body font-bold text-ink w-5 text-center">{i + 1}</span>
                <span className="w-6 h-6 rounded-full bg-ember-deep text-white text-tag font-bold inline-flex items-center justify-center">
                  {r.user?.nickname?.[0] || "?"}
                </span>
                <span className="text-body font-semibold text-ink flex-1">{r.user?.nickname || "Unknown"}</span>
                <span className="text-meta text-ink-soft">{r.hosted_count}x hosted</span>
              </div>
            ))}
          </Card>
        </>
      )}

      {/* Activity */}
      <MyActivity />

      {/* Badges */}
      <div className="text-body font-bold mb-2.5 px-0.5 mt-6">My Badges</div>
      <div className="grid grid-cols-3 gap-2.5 mb-3">
        {currentCityBadges.map((b) => (
          <Card key={b.type} className={`text-center ${b.got ? "" : "opacity-45"}`}>
            <div className={`text-[26px] ${b.got ? "" : "grayscale"}`}>{b.icon}</div>
            <div className="text-tag text-ink-soft mt-1">{cityName}</div>
            <div className="text-body font-bold">{BADGE_META[b.type].name}</div>
            <div className="text-tag text-ink-soft mt-0.5 leading-tight">{b.desc}</div>
            {!b.got && <div className="text-tag text-ink-soft mt-1">Locked</div>}
          </Card>
        ))}
      </div>
      {otherBadges.length > 0 && (
        <>
          <div className="text-body-sm font-bold text-ink-soft mb-2 px-0.5 mt-4">Badges from other cities</div>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {otherBadges.map((b, i) => (
              <Card key={i} className="text-center">
                <div className="text-[26px]">{b.icon}</div>
                <div className="text-tag text-ink-soft mt-1">{b.cityName}</div>
                <div className="text-body font-bold">{BADGE_META[b.type].name}</div>
                <div className="text-tag text-ink-soft mt-0.5 leading-tight">{b.desc}</div>
              </Card>
            ))}
          </div>
        </>
      )}
      <p className="text-tag text-ink-soft text-center mt-4 mb-5 leading-relaxed">
        Badges are a <b>record of your activity</b>.
      </p>

      {/* Sign out */}
      <button
        onClick={signOut}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-line text-ink-soft text-body-sm cursor-pointer hover:text-flame-red transition-colors"
      >
        <SignOut size={16} />
        Sign out
      </button>

      <a href="/terms" className="block text-center text-tag text-ink-soft/50 mt-4 underline">
        Terms of Service · Privacy Policy
      </a>

      <Modal open={showFlameInfo} onClose={() => setShowFlameInfo(false)} title="How does my Ember change?">
        <FlameInfoContent />
      </Modal>
    </div>
  );
}

function FlameInfoContent() {
  const [openQ, setOpenQ] = useState(0);
  const toggle = (q) => setOpenQ(openQ === q ? null : q);

  return (
    <div className="pb-4 space-y-2.5">
      <QA open={openQ === 0} onToggle={() => toggle(0)}
        q="How does my Ember grow?"
        a={<div>
          <div className="space-y-2 mb-2.5">
            <div className="flex justify-between"><span>When someone adds a log after a meetup</span><b className="text-ember">+2</b></div>
            <div className="flex justify-between"><span>When you close reviews as host</span><b className="text-ember">+3</b></div>
          </div>
          <p className="text-tag text-ink-soft">* Max +2 per meetup (same even if multiple people add logs)</p>
        </div>} />
      <QA open={openQ === 1} onToggle={() => toggle(1)}
        q="Can my Ember decrease?"
        a={<div>
          <div className="space-y-2 mb-2">
            <div className="flex justify-between"><span>Manners could have been better</span><b className="text-flame-red">−1</b></div>
            <div className="flex justify-between"><span>Didn't keep the commitment</span><b className="text-flame-red">−2</b></div>
            <div className="flex justify-between"><span>Serious hygiene/safety issue</span><b className="text-flame-red">−3</b></div>
          </div>
          <p className="text-tag text-ink-soft mb-3">* Applied by majority vote from reviews. If there are multiple negatives, the most severe score applies.</p>
          <div className="border-t border-line pt-2.5 space-y-2">
            <div className="flex justify-between"><span>No-show (marked by host)</span><b className="text-flame-red">−5</b></div>
            <div className="flex justify-between"><span>Last-minute cancellation (within 24h, no waitlist)</span><b className="text-flame-red">−1</b></div>
          </div>
        </div>} />
      <QA open={openQ === 2} onToggle={() => toggle(2)}
        q="Are reviews applied immediately?"
        a="No. All reviews are applied at once after the host closes them. The host can close reviews starting 2 days after the meetup. After closing, participants can no longer leave reviews." />
      <QA open={openQ === 3} onToggle={() => toggle(3)}
        q="What are the Ember tiers?"
        a={<div>
          <div className="flex h-5 rounded-full overflow-hidden mb-2.5">
            <div className="bg-ink-soft/15 flex-[10]" />
            <div className="bg-ink-soft/30 flex-[30]" />
            <div className="bg-ember/60 flex-[40]" />
            <div className="bg-flame-red/70 flex-[20]" />
          </div>
          <div className="grid grid-cols-4 text-center text-[10px] leading-tight text-ink-soft">
            <div><p className="font-bold">0~10 *</p><p className="text-ink-soft/60">Frozen</p></div>
            <div><p className="font-bold">11~40</p><p className="text-ink-soft/60">Small Ember</p></div>
            <div><p className="font-bold">41~80</p><p className="text-ink-soft/60">Warm Ember</p></div>
            <div><p className="font-bold">81~100</p><p className="text-ink-soft/60">Blazing</p></div>
          </div>
          <p className="text-tag text-ink-soft mt-2.5">* When frozen, you can't host meetups. At 5 or below, your account is suspended.</p>
        </div>} />

      <p className="text-tag text-ink-soft/60 leading-relaxed pt-1 text-center">
        Trust is hard to build and easy to break.<br />Keep having great meetups and your Ember will burn bright.
      </p>
    </div>
  );
}

function QA({ q, a, open, onToggle }) {
  return (
    <div className="rounded-xl border border-line">
      <button onClick={onToggle} className="flex items-center w-full text-left px-4 py-3.5 cursor-pointer">
        {open && <Fire size={16} weight="fill" className="text-ember shrink-0 mr-1.5" />}
        <span className="text-body font-semibold text-ink flex-1">{q}</span>
        <CaretDown size={14} className={`text-ink-soft shrink-0 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-4 pb-3.5 text-body-sm text-ink-soft leading-relaxed">
          {a}
        </div>
      )}
    </div>
  );
}
