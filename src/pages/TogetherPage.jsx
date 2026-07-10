import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ForkKnife, ShoppingCart, CalendarBlank, MapPin, NavigationArrow, Pizza, Shrimp, BowlSteam, Bird, ChatCircle, CheckCircle, HourglassSimple, ClockCounterClockwise, CrownSimple, Pencil } from "../components/icons";
import { useAuth } from "../lib/auth";
import { useMeetingsInfinite, useCreateMeeting, useUpdateMeeting, useJoinMeeting, useLeaveMeeting } from "../hooks/useMeetingQueries";
// TODO: replace with mock
const notifyHost = async () => {};
const notifyParticipants = async () => {};
const promoteNextWaitlist = async () => {};
const processCancellation = async () => ({ warning: null });
const checkTimeOverlap = async () => null;
import Card from "../components/Card";
import Chip from "../components/Chip";
import Fab from "../components/Fab";
import FlameIcon from "../components/FlameIcon";
import Modal from "../components/Modal";
import ConfirmModal from "../components/ConfirmModal";
import AlertBanner from "../components/AlertBanner";
import LoginModal from "../components/LoginModal";
import MeetingForm, { MEETING_DEFAULTS } from "../components/forms/MeetingForm";
import useInfiniteScrollObserver from "../hooks/useInfiniteScrollObserver";
import useLoginGuard from "../hooks/useLoginGuard";
import { formatDate } from "../utils/formatDate";
import usePageTitle from "../hooks/usePageTitle";
import { isUrlLike, isValidMapUrl } from "../utils/validateUrl";

const filters = [
  { key: "all", label: "All" },
  { key: "go", label: "Eat Together" },
  { key: "buy", label: "Buy Together" },
];

export default function TogetherPage() {
  usePageTitle("Let's Do Together — better with company");
  const navigate = useNavigate();
  const { user, profile, activeCityId, viewCityId, guest, basePath } = useAuth();
  const { requireLogin, showLoginModal, setShowLoginModal } = useLoginGuard();
  const isViewing = guest || (viewCityId && viewCityId !== profile?.city_id);
  const [filter, setFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ ...MEETING_DEFAULTS });
  const [confirm, setConfirm] = useState(null);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const {
    data, isLoading: loading, isFetchingNextPage: loadingMore,
    fetchNextPage, hasNextPage,
  } = useMeetingsInfinite(activeCityId, filter);
  const meetings = data?.pages?.flat() ?? [];
  const sentinelRef = useInfiniteScrollObserver(fetchNextPage, hasNextPage, loadingMore);

  const seenKinds = useRef(new Set());
  meetings.forEach(m => seenKinds.current.add(m.kind));

  const createMutation = useCreateMeeting();
  const updateMutation = useUpdateMeeting();
  const joinMutation = useJoinMeeting();
  const leaveMutation = useLeaveMeeting();

  function showAlertMsg(type, message) {
    setAlert({ open: true, type, message });
  }

  function tryCreate(overrides = {}) {
    if (!requireLogin()) return;
    if (isViewing) {
      showAlertMsg("info", "You can only create meetups in your own city. Try changing your city!");
      return;
    }
    if (profile?.flame_score <= 10) {
      showAlertMsg("info", "Your Ember is too low to host a meetup. Please keep your commitments.");
      return;
    }
    setForm({ ...MEETING_DEFAULTS, suburbId: profile?.suburb_id || null, ...overrides });
    setShowCreate(true);
  }

  function getMyStatus(m) {
    return m.meeting_participants?.find((p) => p.user_id === user?.id)?.status || null;
  }

  function getJoinedCount(m) {
    return m.meeting_participants?.filter((p) => p.status === "joined").length || 0;
  }

  async function handleJoin(m) {
    if (!requireLogin()) return;
    const myStatus = getMyStatus(m);
    if (myStatus) {
      const hoursLeft = Math.floor((new Date(m.meet_at).getTime() - Date.now()) / (1000 * 60 * 60));
      const hasWaitlist = m.meeting_participants?.some(p => p.status === "waitlist");
      const penaltyWarn = myStatus === "joined" && hoursLeft < 24 && !hasWaitlist ? "\n⚠️ Cancelling within 24 hours will cost 1 Ember point." : "";
      const configs = {
        joined: { title: "Cancel participation", message: `Cancel "${m.title}" ${m.kind === "go" ? "Eat Together" : "Buy Together"}?${penaltyWarn}`, confirmText: "Yes, cancel", cancelText: "Close", confirmColor: "bg-flame-red" },
        waitlist: { title: "Cancel waitlist", message: `Cancel your waitlist for "${m.title}"?`, confirmText: "Yes, cancel", cancelText: "Close", confirmColor: "bg-flame-red" },
        pending: { title: "Cancel request", message: `Cancel your ${m.kind === "go" ? "Eat Together" : "Buy Together"} request for "${m.title}"?`, confirmText: "Yes, cancel", cancelText: "Close", confirmColor: "bg-flame-red" },
      };
      setConfirm({ id: m.id, ...configs[myStatus] });
      return;
    }

    // 2-hour overlap check (cross-check with Together + Home Meal)
    const overlapTitle = await checkTimeOverlap(user.id, m.meet_at, m.id);
    if (overlapTitle) {
      showAlertMsg("info", `This overlaps with "${overlapTitle}" (within 2 hours). Please choose a different time.`);
      return;
    }

    const cnt = getJoinedCount(m);
    let status = "joined";
    let msg = `Joined ${m.title}!`;
    let alertType = "success";

    if (m.capacity && cnt >= m.capacity) {
      status = "waitlist";
      msg = `You're on the waitlist for ${m.title}! We'll let you know when a spot opens up`;
      alertType = "waitlist";
    }

    try {
      await joinMutation.mutateAsync({ meetingId: m.id, userId: user.id, status });
      const nick = profile?.nickname || "Someone";
      if (status === "waitlist") {
        notifyHost(m.host_id, "waitlist", `${nick} requested to join the waitlist for "${m.title}". Please review!`, { meetingId: m.id });
      } else {
        notifyHost(m.host_id, "approved", `${nick} joined "${m.title}"!`, { meetingId: m.id });
      }
      showAlertMsg(alertType, msg);
    } catch (e) { showAlertMsg("info", "Something went wrong."); }
  }

  async function handleConfirmCancel() {
    if (!confirm) return;
    try {
      const meeting = meetings.find((m) => m.id === confirm.id);
      if (meeting) {
        const hasWaitlist = meeting.meeting_participants?.some(p => p.status === "waitlist");
        const { warning } = await processCancellation({
          meetingId: confirm.id, userId: user.id,
          meetAt: meeting.meet_at, hasWaitlist,
        });
        await leaveMutation.mutateAsync({ meetingId: confirm.id, userId: user.id });
        notifyHost(meeting.host_id, "cancelled", `${profile?.nickname || "Someone"} cancelled their participation in "${meeting.title}".`, { meetingId: confirm.id });
        await promoteNextWaitlist({ meetingId: confirm.id, title: meeting.title });
        showAlertMsg("info", warning || "Cancelled.");
      }
    } catch (e) { showAlertMsg("info", "Something went wrong."); }
    setConfirm(null);
  }

  function openEdit(m) {
    setEditItem(m);
    setForm({
      ...MEETING_DEFAULTS,
      kind: m.kind,
      title: m.title,
      description: m.description,
      suburbId: m.suburb_id || null,
      address: m.address || "",
      meetAt: m.meet_at || "",
      budget: m.budget || "",
      limited: !!m.capacity,
      capacity: m.capacity || 4,
      minCapacity: m.min_capacity || 2,
      reasons: m.reasons || [],
    });
    setShowCreate(true);
  }

  async function handleSave() {
    if (!editItem) return handleCreate();
    if (isUrlLike(form.address) && !isValidMapUrl(form.address)) {
      showAlertMsg("info", "Only Google Maps links are allowed.");
      return;
    }
    try {
      await updateMutation.mutateAsync({
        id: editItem.id,
        updates: {
          kind: form.kind,
          title: form.title,
          description: form.description,
          suburb_id: form.suburbId || null,
          address: form.address || null,
          meet_at: form.meetAt || null,
          budget: form.budget || null,
          capacity: form.limited ? form.capacity : null,
          min_capacity: form.limited ? form.minCapacity || null : null,
          reasons: form.reasons || [],
        },
      });
      const pIds = editItem.meeting_participants?.filter(p => p.status === "joined").map(p => p.user_id) || [];
      if (pIds.length) notifyParticipants(pIds, "updated", `"${form.title}" has been updated.`, { meetingId: editItem.id });
      setShowCreate(false);
      setEditItem(null);
      setForm({ ...MEETING_DEFAULTS });
      showAlertMsg("success", "Updated!");
    } catch (e) { showAlertMsg("info", "Something went wrong."); }
  }

  async function handleCreate() {
    if (!form.title || !form.meetAt || !profile || createMutation.isPending) return;
    if (isUrlLike(form.address) && !isValidMapUrl(form.address)) {
      showAlertMsg("info", "Only Google Maps links are allowed.");
      return;
    }
    // 2-hour overlap check
    const overlapTitle = await checkTimeOverlap(user.id, form.meetAt);
    if (overlapTitle) {
      showAlertMsg("info", `This overlaps with "${overlapTitle}" (within 2 hours). Please choose a different time.`);
      return;
    }
    try {
      await createMutation.mutateAsync({
        kind: form.kind,
        title: form.title,
        description: form.description,
        city_id: profile.city_id,
        suburb_id: form.suburbId || null,
        address: form.address || null,
        meet_at: form.meetAt || new Date().toISOString(),
        capacity: form.limited ? form.capacity : null,
        min_capacity: form.limited ? form.minCapacity || null : null,
        flexible: form.flexible,
        host_id: user.id,
        reasons: form.reasons,
      });
      setShowCreate(false);
      setForm({ ...MEETING_DEFAULTS });
      showAlertMsg("success", "Posted!");
    } catch (e) { showAlertMsg("info", "Something went wrong: " + e.message); }
  }

  return (
    <div className="px-4 pt-24 md:py-16 pb-40">
      <h2 className="text-heading font-bold text-ink">Better with company? Let's do it together</h2>
      <p className="text-body text-ink-soft mt-1 mb-3.5 leading-relaxed">That restaurant with huge portions, those groceries too much for one... eat together, buy together</p>

      {loading ? (
        <div className="text-center text-body text-ink-soft py-12">Loading...</div>
      ) : meetings.length === 0 ? (
        <div>
          <Card className="text-center text-body text-ink-soft py-6 mb-4 mt-8">
            No meetups yet. Things are lighter when shared — want to start one?
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
            {[
              { kind: "buy", title: "Korean grocery group order", desc: "Ship from Korea together", icon: <Shrimp size={28} /> },
              { kind: "go", title: "No more eating alone", desc: "BBQ, anyone?", icon: <ForkKnife size={28} /> },
              { kind: "go", title: "Pizza and pasta", desc: "Big portions, let's share", icon: <Pizza size={28} /> },
              { kind: "go", title: "Dim sum", desc: "More variety together", icon: <BowlSteam size={28} /> },
              { kind: "buy", title: "Grocery buddy", desc: "Buy in bulk, split it up", icon: <ShoppingCart size={28} /> },
              { kind: "go", title: "Deal hunt", desc: "First Table together?", icon: <Bird size={28} /> },
            ].map((ex, i) => (
              <div key={i}
                className="py-6 px-3 rounded-2xl border-2 border-dashed border-ink/15 cursor-pointer hover:border-ink/30 hover:bg-card/50 hover:-translate-y-0.5 hover:shadow-md transition-all text-center"
                onClick={() => tryCreate({ kind: ex.kind })}>
                <span className="text-ink-soft inline-block mb-2.5">{ex.icon}</span>
                <p className="text-body-sm font-semibold text-ink-soft leading-snug">{ex.title}</p>
                <p className="text-tag text-ink-soft/60 mt-1">{ex.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          {(() => {
            const existingKinds = filters.filter(f => f.key === "all" || seenKinds.current.has(f.key));
            return existingKinds.length > 2 && (
              <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
                {existingKinds.map((f) => (
                  <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>
                    {f.key === "go" && <ForkKnife size={13} weight={filter === f.key ? "fill" : "regular"} className="inline mr-1 -mt-0.5" />}
                    {f.key === "buy" && <ShoppingCart size={13} weight={filter === f.key ? "fill" : "regular"} className="inline mr-1 -mt-0.5" />}
                    {f.label}
                  </Chip>
                ))}
              </div>
            );
          })()}
          {meetings.map((m) => {
            const myStatus = getMyStatus(m);
            const cnt = getJoinedCount(m);
            const full = m.capacity ? cnt >= m.capacity : false;
            const remaining = m.capacity ? m.capacity - cnt : 0;
            const hostName = m.host?.nickname || "Unknown";
            const suburbName = m.suburb?.name || "";

            return (
              <Card key={m.id} className="mb-3 cursor-pointer" onClick={() => navigate(`${basePath}/together/${m.slug || m.id}`)}>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-start gap-1.5">
                    <span className="text-body text-ink mt-1">
                      {m.kind === "go" ? <ForkKnife size={16} /> : <ShoppingCart size={16} />}
                    </span>
                    <h3 className="text-title font-bold text-ink line-clamp-1">{m.title}</h3>
                    {full && <span className="text-tag font-bold text-ink-soft bg-ink/8 rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap">Full</span>}
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {suburbName && (
                      <span className="text-meta text-ink-soft whitespace-nowrap inline-flex items-center gap-0.5">
                        <MapPin size={12} /> {suburbName}
                      </span>
                    )}
                    {m.host_id === user?.id && (
                      <button onClick={(e) => { e.stopPropagation(); openEdit(m); }} className="text-ink-soft p-1 cursor-pointer hover:text-ink">
                        <Pencil size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {m.reasons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {m.reasons.slice(0, 2).map((r) => (
                      <span key={r} className="text-tag font-semibold text-ink-soft bg-paper2 border border-line rounded-full px-2.5 py-0.5">{r}</span>
                    ))}
                  </div>
                )}

                <p className="text-body leading-relaxed text-ink mt-2 line-clamp-3">{m.description}</p>

                <div className="flex flex-wrap justify-between text-meta text-ink-soft mt-2 mb-2 gap-1">
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1">
                      <CalendarBlank size={14} /> {formatDate(m.meet_at)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <ChatCircle size={14} /> {m.comment_count > 0 && m.comment_count}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span>{hostName}</span>
                    <FlameIcon score={m.host?.flame_score || 30} size={11} />
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center -space-x-1.5">
                      {[...m.meeting_participants?.filter(p => p.status === "joined") || []].sort((a, b) => (a.user_id === m.host_id ? -1 : b.user_id === m.host_id ? 1 : 0)).slice(0, 3).map((p, i) => (
                        <span key={p.id} className={`w-6 h-6 rounded-full text-white text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-card ${p.user_id === m.host_id ? "bg-ember-deep text-tag" : "bg-ink-soft"}`} style={{ zIndex: 10 - i }} title={p.user?.nickname || "?"}>
                          {(p.user?.nickname || "?")[0]}
                        </span>
                      ))}
                      {cnt > 3 && <span className="w-6 h-6 rounded-full bg-ink/10 text-ink-soft text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-card" style={{ zIndex: 0 }}>+{cnt - 3}</span>}
                    </div>
                    <span className="text-meta text-ink-soft">
                      {!m.capacity || cnt > m.capacity
                        ? `${cnt} joined`
                        : <>{`${cnt}/${m.capacity}`}{remaining === 1 && !full ? <span className="font-bold text-herb"> · last spot!</span> : ""}</>
                      }
                    </span>
                  </div>
                  {m.host_id === user?.id && <span className="text-tag font-semibold text-ember border border-ember/30 rounded-lg px-2 py-0.5 inline-flex items-center gap-0.5"><CrownSimple size={12} weight="fill" /> My meetup</span>}
                  {m.host_id !== user?.id && myStatus === "joined" && <span className="text-tag font-semibold text-herb border border-herb/30 rounded-lg px-2 py-0.5 inline-flex items-center gap-0.5"><CheckCircle size={12} weight="fill" /> Joined</span>}
                  {m.host_id !== user?.id && myStatus === "waitlist" && <span className="text-tag font-semibold text-flame border border-flame/30 rounded-lg px-2 py-0.5 inline-flex items-center gap-0.5"><HourglassSimple size={12} weight="fill" /> Waitlisted</span>}
                </div>
              </Card>
            );
          })}
          <div ref={sentinelRef} />
          {loadingMore && <div className="text-center text-meta text-ink-soft py-4">Loading...</div>}
        </div>
      )}

      {!isViewing && <Fab onClick={() => tryCreate()} label="+ Find people to join" />}

      <Modal open={showCreate} onClose={() => { setShowCreate(false); setEditItem(null); }}
        title={editItem ? "Edit" : "Want to do it together?"}
        subtitle={editItem ? null : "Things that feel like too much alone become easy when shared"}
        action={<button
          className={`w-full py-3.5 rounded-xl font-bold text-title transition-colors cursor-pointer ${
            editItem || (form.title && form.meetAt) ? "bg-ember text-white hover:bg-ember-deep" : "bg-ink/20 text-ink-soft cursor-not-allowed"
          }`}
          disabled={!editItem && (!form.title || !form.meetAt)}
          onClick={handleSave}>
          {editItem ? "Save" : "Let's do it"}
        </button>}>
        <MeetingForm form={form} setForm={setForm} editMode={!!editItem} showErrors={!editItem} />
      </Modal>

      <ConfirmModal open={!!confirm} onClose={() => setConfirm(null)} onConfirm={handleConfirmCancel}
        title={confirm?.title} message={confirm?.message} confirmText={confirm?.confirmText}
        cancelText={confirm?.cancelText || "Close"} confirmColor={confirm?.confirmColor} />

      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, open: false }))} />

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
}
