import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, NavigationArrow, Heart, Pencil } from "../components/icons";
import { useAuth } from "../lib/auth";
import { useRecosInfinite, useCreateReco, useUpdateReco, useToggleAgree } from "../hooks/useRecoQueries";
const notifyHost = async () => {};
import Card from "../components/Card";
import Chip from "../components/Chip";
import Fab from "../components/Fab";
import Modal from "../components/Modal";
import AlertBanner from "../components/AlertBanner";
import LoginModal from "../components/LoginModal";
import RecoForm, { RECO_DEFAULTS } from "../components/forms/RecoForm";
import useInfiniteScrollObserver from "../hooks/useInfiniteScrollObserver";
import useLoginGuard from "../hooks/useLoginGuard";
import { isValidMapUrl } from "../utils/validateUrl";
import usePageTitle from "../hooks/usePageTitle";

const ALL_CATEGORIES = ["Korean", "Asian", "Cafe", "Western", "Dessert/Bakery", "Other"];

export default function RecoPage() {
  usePageTitle("Local Eats");
  const navigate = useNavigate();
  const { user, profile, activeCityId, viewCityId, guest, basePath } = useAuth();
  const { requireLogin, showLoginModal, setShowLoginModal } = useLoginGuard();
  const isViewing = guest || (viewCityId && viewCityId !== profile?.city_id);
  const [catFilter, setCatFilter] = useState("All");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...RECO_DEFAULTS });
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const {
    data, isLoading: loading, isFetchingNextPage: loadingMore,
    fetchNextPage, hasNextPage,
  } = useRecosInfinite(activeCityId, catFilter);
  const recos = data?.pages?.flat() ?? [];

  const seenCats = useRef(new Set());
  recos.forEach(r => seenCats.current.add(r.category));
  const sentinelRef = useInfiniteScrollObserver(fetchNextPage, hasNextPage, loadingMore);

  const createMutation = useCreateReco();
  const updateMutation = useUpdateReco();
  const toggleMutation = useToggleAgree();

  function showAlertMsg(type, message) {
    setAlert({ open: true, type, message });
  }

  function isAgreed(r) {
    return r.agrees?.some((a) => a.user_id === user?.id);
  }

  function getAgreeCount(r) {
    return r.agree_count || 0;
  }

  function tryCreate() {
    if (!requireLogin()) return;
    if (isViewing) {
      showAlertMsg("info", "You can only recommend places in your own city. Try changing your city!");
      return;
    }
    setForm({ ...RECO_DEFAULTS, suburbId: profile?.suburb_id || null });
    setShowCreate(true);
  }

  async function handleAgree(r) {
    if (!requireLogin()) return;
    const wasAgreed = isAgreed(r);
    try {
      await toggleMutation.mutateAsync({ recoId: r.id, userId: user.id });
      if (!wasAgreed && r.author_id !== user.id) {
        notifyHost(r.author_id, "agree", `${profile?.nickname || "Someone"} liked your pick "${r.name}"!`);
      }
      showAlertMsg(wasAgreed ? "info" : "success", wasAgreed ? "Removed your like." : "Liked!");
    } catch (e) { showAlertMsg("info", "Something went wrong. Please try again."); }
  }

  function openEdit(r) {
    setEditItem(r);
    setForm({
      ...RECO_DEFAULTS,
      name: r.name,
      category: r.category,
      suburbId: r.suburb_id || null,
      note: r.note,
      mapUrl: r.map_url || "",
    });
    setShowCreate(true);
  }

  async function handleSave() {
    if (!editItem) return handleCreate();
    if (form.mapUrl && !isValidMapUrl(form.mapUrl)) {
      showAlertMsg("info", "Only Google Maps links are allowed.");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editItem.id,
        updates: {
          note: form.note,
          suburb_id: form.suburbId || null,
          map_url: form.mapUrl || null,
        },
      });
      setShowCreate(false);
      setEditItem(null);
      setForm({ ...RECO_DEFAULTS });
      showAlertMsg("success", "Updated!");
    } catch (e) { showAlertMsg("info", "Something went wrong."); }
  }

  async function handleCreate() {
    if (!form.name || !profile) return;
    if (form.mapUrl && !isValidMapUrl(form.mapUrl)) {
      showAlertMsg("info", "Only Google Maps links are allowed.");
      return;
    }
    try {
      await createMutation.mutateAsync({
        name: form.name,
        category: form.category,
        city_id: profile.city_id,
        suburb_id: form.suburbId || null,
        note: form.note,
        map_url: form.mapUrl || null,
        author_id: user.id,
      });
      setShowCreate(false);
      setForm({ ...RECO_DEFAULTS });
      showAlertMsg("success", "Posted!");
    } catch (e) { showAlertMsg("info", "Something went wrong: " + e.message); }
  }

  // Top 3 popular (1+ likes)
  const popular = recos.filter((r) => getAgreeCount(r) >= 1).slice(0, 3);
  const popularIds = new Set(popular.map((r) => r.id));
  const rest = recos.filter((r) => !popularIds.has(r.id));

  function renderCard(r, glow = false) {
    const agreed = isAgreed(r);
    const cnt = getAgreeCount(r);
    const authorName = r.author?.nickname || "Unknown";
    const suburbName = r.suburb?.name || "";

    return (
      <Card key={r.id} glow={glow} className="mb-3 cursor-pointer" onClick={() => navigate(`${basePath}/reco/${r.slug || r.id}`)}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex items-start gap-1.5">
            <span className="text-tag text-ink-soft bg-ink/6 rounded px-1.5 py-0.5 shrink-0 mt-0.5">{r.category}</span>
            <h3 className="text-title font-bold text-ink line-clamp-1">{r.name}</h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {suburbName && (
              <span className="text-meta text-ink-soft whitespace-nowrap inline-flex items-center gap-0.5">
                <MapPin size={12} /> {suburbName}
              </span>
            )}
            {r.author_id === user?.id && (
              <button onClick={(e) => { e.stopPropagation(); openEdit(r); }} className="text-ink-soft p-1 cursor-pointer hover:text-ink">
                <Pencil size={14} />
              </button>
            )}
          </div>
        </div>
        <p className="text-body leading-relaxed text-ink mt-2 mb-3 line-clamp-3">"{r.note}"</p>
        <div className="flex justify-between items-center">
          <span className="text-meta text-ink-soft inline-flex items-center gap-2">
            <span className="inline-flex items-center gap-1">
              <Heart size={14} weight={cnt > 0 ? "fill" : "regular"} className={cnt > 0 ? "text-flame" : ""} /> {cnt}
            </span>
            <span>Recommended by {authorName}</span>
          </span>
          <button
            onClick={(e) => { e.stopPropagation(); handleAgree(r); }}
            className={`border rounded-lg px-4 py-2 text-body-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer inline-flex items-center gap-1 ${
              agreed ? "border-flame bg-flame/15 text-ember-deep" : "border-line bg-transparent text-ink-soft"
            }`}>
            {agreed && <Heart size={13} weight="fill" className="text-flame" />} Like
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="px-4 pt-24 md:py-16 pb-40">
      <h2 className="text-heading font-bold text-ink">Where the locals actually eat</h2>
      <p className="text-body text-ink-soft mt-1 mb-3.5 leading-relaxed">Real recommendations from your neighbors — like it, and help others find it too</p>

      {loading ? (
        <div className="text-center text-body text-ink-soft py-12">Loading...</div>
      ) : recos.length === 0 && catFilter === "All" ? (
        <Card className="text-center text-body text-ink-soft py-8 mt-8">
          No recommendations yet — share a spot you love!
          <p className="text-meta text-ink-soft/70 mt-1.5">Reach 100 likes and earn the Foodie badge</p>
          <button
            onClick={() => tryCreate()}
            className="mt-3 px-4 py-2.5 rounded-lg bg-ink text-white text-body-sm font-bold cursor-pointer"
          >
            + Recommend a place
          </button>
        </Card>
      ) : (
        <>
        {(() => {
          const existingCats = ALL_CATEGORIES.filter((c) => seenCats.current.has(c));
          return existingCats.length > 1 && (
            <div className="flex gap-2 pb-4 overflow-x-auto hide-scrollbar">
              <Chip active={catFilter === "All"} onClick={() => setCatFilter("All")}>All</Chip>
              {existingCats.map((c) => (
                <Chip key={c} active={catFilter === c} onClick={() => setCatFilter(c)}>{c}</Chip>
              ))}
            </div>
          );
        })()}
        {recos.length === 0 ? (
          <Card className="text-center text-body text-ink-soft py-8">
            No recommendations in this category yet.
          </Card>
        ) : (
          <>
            {popular.length > 0 && catFilter === "All" && (
              <div className="mb-4">
                <div className="text-body font-bold text-ink mb-2 inline-flex items-center gap-1">
                  <Heart size={16} weight="fill" className="text-flame" /> Most loved spots
                </div>
                {popular.map((r) => renderCard(r, true))}
              </div>
            )}
            <div>
              {(catFilter === "All" ? rest : recos).map((r) => renderCard(r))}
              <div ref={sentinelRef} />
              {loadingMore && <div className="text-center text-meta text-ink-soft py-4">Loading...</div>}
            </div>
          </>
        )}
        </>
      )}

      {!isViewing && <Fab onClick={() => tryCreate()} label="+ Recommend a place" />}

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setEditItem(null); }}
        title={editItem ? "Edit recommendation" : "Know a great spot?"}
        subtitle={editItem ? null : "Your favorite place could become someone else's new regular"}
        action={<button
          className={`w-full py-3.5 rounded-xl font-bold text-title transition-colors cursor-pointer ${
            editItem || (form.name && form.note && form.suburbId) ? "bg-ember text-white hover:bg-ember-deep" : "bg-ink/20 text-ink-soft cursor-not-allowed"
          }`}
          disabled={!editItem && (!form.name || !form.note || !form.suburbId)}
          onClick={handleSave}>
          {editItem ? "Save" : "Recommend"}
        </button>}>
        <RecoForm form={form} setForm={setForm} editMode={!!editItem} showErrors={!editItem} />
      </Modal>

      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, open: false }))} />

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
