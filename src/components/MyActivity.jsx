import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CookingPot, Handshake, ForkKnife, Heart, CaretDown, Pencil, Trash, Users, MapPin, Info, HourglassSimple } from "./icons";
import { useAuth } from "../lib/auth";
import { useMyHosted, useMyJoined, invalidateMyActivity } from "../hooks/useProfileQueries";
// TODO: replace with mock
const deleteMeeting = async () => {};
const updateMeeting = async () => {};
const deleteHomemeal = async () => {};
const updateHomemeal = async () => {};
const notifyParticipants = async () => {};
const proposeHandover = async () => ({ success: false, message: "Not available" });
const closeReviews = async () => ({ success: true });
const deleteReco = async () => {};
const updateReco = async () => {};
import ReviewSection from "./ReviewSection";
import { useMyReviews } from "../hooks/useReviewQueries";
import WaitlistSection from "./WaitlistSection";
import Card from "./Card";
import Chip from "./Chip";
import Modal from "./Modal";
import ConfirmModal from "./ConfirmModal";
import AlertBanner from "./AlertBanner";
import MeetingForm from "./forms/MeetingForm";
import HomemealForm from "./forms/HomemealForm";
import RecoForm from "./forms/RecoForm";
import { formatDate } from "../utils/formatDate";

function ActivityCard({ title, icon, category, subtitle, rightLabel, isPast, participants, participantLabel, isHosted, avatars, hostIndex, memberCount, onEdit, onDelete, onClick, children }) {
  const [showParticipants, setShowParticipants] = useState(false);

  return (
    <Card className={`mb-2 ${isPast ? "opacity-50" : ""} ${onClick ? "cursor-pointer" : ""}`} onClick={onClick}>
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="shrink-0">{icon}</span>
          {category && <span className="text-tag text-ink-soft bg-ink/6 rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap">{category}</span>}
          <span className="text-body font-semibold text-ink line-clamp-1">{title}</span>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!isPast && onEdit && (
            <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="text-ink-soft p-2 cursor-pointer hover:text-ink">
              <Pencil size={16} />
            </button>
          )}
          {onDelete && (
            <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="text-ink-soft p-2 cursor-pointer hover:text-flame-red">
              <Trash size={16} />
            </button>
          )}
          {!isHosted && avatars?.length > 0 && (
            <div className="flex items-center -space-x-1 ml-1">
              {avatars.slice(0, 3).map((a, i) => (
                <span key={i} className={`w-5 h-5 rounded-full text-white text-[8px] font-bold inline-flex items-center justify-center ring-2 ring-card ${i === hostIndex ? "bg-ember-deep" : "bg-ink-soft"}`} style={{ zIndex: 10 - i }} title={a}>
                  {a[0]}
                </span>
              ))}
              {avatars.length > 3 && <span className="w-5 h-5 rounded-full bg-ink/10 text-ink-soft text-[8px] font-bold inline-flex items-center justify-center ring-2 ring-card" style={{ zIndex: 0 }}>+{avatars.length - 3}</span>}
            </div>
          )}
        </div>
      </div>
      {(subtitle || rightLabel) && (
        <div className="flex justify-between items-center mt-1">
          {subtitle ? <span className="text-meta text-ink-soft">{subtitle}</span> : <span />}
          {rightLabel}
        </div>
      )}
      {/* Bottom: host=list names, participant=avatars */}
      {isHosted && avatars?.length > 0 && (
        <p className="text-tag text-ink-soft mt-2 line-clamp-2">
          Participants: {avatars.join(", ")}
        </p>
      )}
      {/* Joined gatherings: avatars top-right — no separate render below */}
      {children}
    </Card>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "hosted", label: "Hosted" },
  { key: "joined", label: "Joined" },
  { key: "waitlist", label: "Waitlist" },
];

export default function MyActivity() {
  const { user, basePath } = useAuth();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [showPast, setShowPast] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [editItem, setEditItem] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const { data: hosted = { meetings: [], homemeals: [], recos: [] }, isLoading: loadingHosted } = useMyHosted(user?.id);
  const { data: joined = { meetings: [], homemeals: [] }, isLoading: loadingJoined } = useMyJoined(user?.id);
  const loading = loadingHosted || loadingJoined;

  function openEdit(item) {
    setEditItem(item);
    if (item._type === "meeting") {
      setEditForm({
        ...item,
        meetAt: item.meet_at ? item.meet_at.slice(0, 16) : "",
        minCapacity: item.min_capacity || 1,
        suburbId: item.suburb_id || null,
        reasons: item.reasons || [],
      });
    } else if (item._type === "homemeal") {
      setEditForm({
        ...item,
        shareAt: item.share_at ? item.share_at.slice(0, 16) : "",
        minCapacity: item.min_capacity || 1,
        suburbId: item.suburb_id || null,
      });
    } else {
      setEditForm({
        ...item,
        mapUrl: item.map_url || "",
        suburbId: item.suburb_id || null,
      });
    }
  }

  async function handleSave() {
    if (!editItem) return;
    try {
      if (editItem._type === "meeting") {
        await updateMeeting(editItem.id, {
          kind: editForm.kind,
          title: editForm.title,
          description: editForm.description,
          suburb_id: editForm.suburbId || null,
          address: editForm.address || null,
          meet_at: editForm.meetAt || null,
          capacity: editForm.capacity,
          min_capacity: editForm.minCapacity || null,
          flexible: editForm.flexible,
          reasons: editForm.reasons || [],
        });
      } else if (editItem._type === "homemeal") {
        await updateHomemeal(editItem.id, {
          kind: editForm.kind,
          title: editForm.title,
          description: editForm.description,
          suburb_id: editForm.suburbId || null,
          address: editForm.address || null,
          share_at: editForm.shareAt || null,
          capacity: editForm.capacity,
          min_capacity: editForm.minCapacity || null,
          flexible: editForm.flexible,
        });
      } else if (editItem._type === "reco") {
        await updateReco(editItem.id, {
          note: editForm.note,
          suburb_id: editForm.suburbId || null,
          map_url: editForm.mapUrl || null,
        });
      }
      setEditItem(null);
      setAlert({ open: true, type: "success", message: "Updated!" });
      invalidateMyActivity();
    } catch (e) {
      setAlert({ open: true, type: "info", message: "Something went wrong while saving." });
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      // notify participants of cancellation
      if (deleteConfirm._type === "meeting") {
        const pIds = deleteConfirm.participants?.filter(p => p.status === "joined" && p.user_id !== user.id).map(p => p.user_id) || [];
        if (pIds.length) notifyParticipants(pIds, "cancelled", `"${deleteConfirm.name}" has been cancelled.`, { meetingId: deleteConfirm.id });
        await deleteMeeting(deleteConfirm.id);
      } else if (deleteConfirm._type === "homemeal") {
        const cIds = deleteConfirm.claims?.filter(c => c.status === "joined" && c.user_id !== user.id).map(c => c.user_id) || [];
        if (cIds.length) notifyParticipants(cIds, "cancelled", `"${deleteConfirm.name}" has been cancelled.`, { homemealId: deleteConfirm.id });
        await deleteHomemeal(deleteConfirm.id);
      } else if (deleteConfirm._type === "reco") {
        await deleteReco(deleteConfirm.id);
      }
      setAlert({ open: true, type: "info", message: "Deleted." });
      invalidateMyActivity();
    } catch (e) {
      setAlert({ open: true, type: "info", message: "Something went wrong." });
    }
    setDeleteConfirm(null);
  }

  const now = new Date();
  const isPast = (item) => new Date(item.meet_at || item.share_at) < now;
  const isCancelled = (item) => item.cancelled;

  const showHosted = filter === "all" || filter === "hosted";
  const showJoined = filter === "all" || filter === "joined";
  const showWaitlist = filter === "all" || filter === "waitlist";

  const [showCount, setShowCount] = useState(3);

  // gathering / home meal list (excluding food picks, deduplicated)
  const items = [];
  const seenIds = new Set();
  if (showHosted) {
    hosted.meetings.forEach((m) => { seenIds.add(m.id); items.push({ ...m, _type: "meeting", _role: "hosted", _date: m.meet_at }); });
    hosted.homemeals.forEach((m) => { seenIds.add(m.id); items.push({ ...m, _type: "homemeal", _role: "hosted", _date: m.share_at }); });
  }
  if (showJoined || showWaitlist) {
    joined.meetings.filter((m) => !seenIds.has(m.id)).forEach((m) => {
      const isWaitlist = m.myStatus === "waitlist";
      if ((showJoined && !isWaitlist) || (showWaitlist && isWaitlist)) {
        items.push({ ...m, _type: "meeting", _role: "joined", _date: m.meet_at });
      }
    });
    joined.homemeals.filter((m) => !seenIds.has(m.id)).forEach((m) => {
      const isWaitlist = m.myStatus === "waitlist";
      if ((showJoined && !isWaitlist) || (showWaitlist && isWaitlist)) {
        items.push({ ...m, _type: "homemeal", _role: "joined", _date: m.share_at });
      }
    });
  }

  // food picks separate
  const myRecos = hosted.recos || [];

  const upcomingItems = items.filter((i) => !isPast(i) && !isCancelled(i)).sort((a, b) => new Date(a._date) - new Date(b._date));
  const pastItems = items.filter((i) => isPast(i) || isCancelled(i));
  const hasAny = items.length > 0 || myRecos.length > 0;

  const visibleUpcoming = upcomingItems.slice(0, showCount);
  const hasMoreUpcoming = upcomingItems.length > showCount;

  function getJoinedCount(item) {
    if (item._type === "meeting") return item.meeting_participants?.filter(p => p.status === "joined").length || 0;
    if (item._type === "homemeal") return item.claims?.filter(c => c.status === "joined").length || 0;
    return 0;
  }

  function getMyStatus(item) {
    if (item._role === "hosted") return null;
    return item.myStatus || null;
  }

  function statusChip(status) {
    if (status === "waitlist") return <span className="text-tag rounded-full px-2 py-0.5 bg-flame/15 text-flame font-semibold">Waitlist</span>;
    return null;
  }

  function renderItem(item) {
    const isHosted = item._role === "hosted";
    const cnt = getJoinedCount(item);
    const suburbName = item.suburb?.name || "";
    const myStatus = getMyStatus(item);

    const isWaitlist = myStatus === "waitlist";

    if (item._type === "meeting") {
      const joined = (item.meeting_participants || []).filter(p => p.status === "joined");
      const hostFirst = [...joined].sort((a, b) => (a.user_id === item.host_id ? -1 : b.user_id === item.host_id ? 1 : 0));
      const pNames = hostFirst.map(p => p.user?.nickname || "?");
      const memberCount = item.capacity && cnt <= item.capacity ? `${cnt}/${item.capacity}` : `${cnt} joined`;
      return (
        <div key={`m-${item._role}-${item.id}`}>
          <ActivityCard title={item.title} category="Together"
            icon={<ForkKnife size={14} className="text-ink" />}
            subtitle={`${formatDate(item.meet_at)}${suburbName ? ` · ${suburbName}` : ""} · ${memberCount}`}
            isHosted={isHosted}
            rightLabel={isWaitlist ? <span className="text-tag font-semibold text-flame inline-flex items-center gap-0.5"><HourglassSimple size={12} weight="fill" /> Waitlisted</span> : null}
            avatars={isWaitlist ? null : pNames}
            hostIndex={0}
            onClick={() => navigate(`${basePath}/together/${item.slug || item.id}`)}
            {...(isHosted ? {
              onEdit: () => openEdit({ ...item, _type: "meeting" }),
              onDelete: () => setDeleteConfirm({ ...item, _type: "meeting", name: item.title, joined: cnt }),
            } : {})}>
            {isHosted && <WaitlistSection meetingId={item.id} title={item.title} />}
          </ActivityCard>
        </div>
      );
    }
    if (item._type === "homemeal") {
      const joined = (item.claims || []).filter(c => c.status === "joined");
      const hostFirst = [...joined].sort((a, b) => (a.user_id === item.host_id ? -1 : b.user_id === item.host_id ? 1 : 0));
      const cNames = hostFirst.map(c => c.user?.nickname || "?");
      const memberCount = item.capacity && cnt <= item.capacity ? `${cnt}/${item.capacity}` : `${cnt} joined`;
      return (
        <div key={`h-${item._role}-${item.id}`}>
          <ActivityCard title={item.title} category="Home Meal"
            icon={<CookingPot size={14} className="text-ink" />}
            subtitle={`${formatDate(item.share_at)}${suburbName ? ` · ${suburbName}` : ""} · ${memberCount}`}
            isHosted={isHosted}
            rightLabel={isWaitlist ? <span className="text-tag font-semibold text-flame inline-flex items-center gap-0.5"><HourglassSimple size={12} weight="fill" /> Waitlisted</span> : null}
            avatars={isWaitlist ? null : cNames}
            hostIndex={0}
            onClick={() => navigate(`${basePath}/homemeal/${item.slug || item.id}`)}
            {...(isHosted ? {
              onEdit: () => openEdit({ ...item, _type: "homemeal" }),
              onDelete: () => setDeleteConfirm({ ...item, _type: "homemeal", name: item.title, joined: cnt }),
            } : {})}>
            {isHosted && <WaitlistSection homemealId={item.id} title={item.title} />}
          </ActivityCard>
        </div>
      );
    }
    // reco
    return (
      <ActivityCard key={`r-${item.id}`} title={item.name}
        category={item.category}
        icon={<ForkKnife size={14} className="text-ink" />}
        subtitle={suburbName ? <span className="inline-flex items-center gap-0.5"><MapPin size={11} /> {suburbName}</span> : null}
        rightLabel={<span className="text-meta text-ink-soft inline-flex items-center gap-0.5"><Heart size={12} weight="fill" className="text-flame" /> {item.agree_count}</span>}
        onClick={() => navigate(`${basePath}/reco/${item.slug || item.id}`)}
        onEdit={() => openEdit({ ...item, _type: "reco" })}
        onDelete={() => setDeleteConfirm({ ...item, _type: "reco", name: item.name })} />
    );
  }

  if (loading) return <div className="text-center text-body text-ink-soft py-6">Loading...</div>;

  return (
    <>
      <div className="text-body font-bold mb-2.5 px-0.5">Current activity</div>

      {(() => {
        const hasHosted = hosted.meetings.length + hosted.homemeals.length > 0;
        const hasJoined = joined.meetings.some(m => m.myStatus !== "waitlist") || joined.homemeals.some(m => m.myStatus !== "waitlist");
        const hasWaitlist = joined.meetings.some(m => m.myStatus === "waitlist") || joined.homemeals.some(m => m.myStatus === "waitlist");
        const visible = FILTERS.filter(f => f.key === "all" || (f.key === "hosted" && hasHosted) || (f.key === "joined" && hasJoined) || (f.key === "waitlist" && hasWaitlist));
        return visible.length > 2 && (
          <div className="flex gap-2 mb-4 overflow-x-auto hide-scrollbar">
            {visible.map((f) => (
              <Chip key={f.key} active={filter === f.key} onClick={() => setFilter(f.key)}>{f.label}</Chip>
            ))}
          </div>
        );
      })()}

      {visibleUpcoming.map(renderItem)}
      {hasMoreUpcoming && (
        <button onClick={() => setShowCount((c) => c + 5)}
          className="w-full text-center text-body-sm text-ink-soft py-2 cursor-pointer hover:underline">
          Show more ({upcomingItems.length - showCount} remaining)
        </button>
      )}

      {pastItems.length > 0 && (
        <>
          <button onClick={() => setShowPast((v) => !v)}
            className="text-body-sm text-ink-soft inline-flex items-center gap-0.5 cursor-pointer mt-2 mb-1">
            <CaretDown size={12} className={`transition-transform ${showPast ? "rotate-180" : ""}`} />
            Past ({pastItems.length})
          </button>
          {showPast && pastItems.map((item) => (
            <PastItem key={`past-${item._type}-${item.id}`} item={item} />
          ))}
        </>
      )}

      {/* My Food Picks */}
      {myRecos.length > 0 && (
        <>
          <div className="text-body font-bold mb-2.5 px-0.5 mt-6">My Food Picks</div>
          {myRecos.map((r) => renderItem({ ...r, _type: "reco", _role: "hosted" }))}
        </>
      )}

      {!hasAny && (
        <Card className="text-center text-body text-ink-soft py-6">
          No activity yet. Start your first gathering!
        </Card>
      )}

      <ConfirmModal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Delete"
        message={deleteConfirm?.joined > 1
          ? `"${deleteConfirm?.name}" has ${deleteConfirm.joined - 1} participant(s).`
          : `Delete "${deleteConfirm?.name}"?`}
        confirmText={deleteConfirm?.joined > 1 ? "Delete anyway" : "Delete"}
        cancelText="Close" confirmColor="bg-flame-red"
        {...(deleteConfirm?.joined > 1 && deleteConfirm?.kind !== "share" ? {
          onHandover: async () => {
            const meetingId = deleteConfirm._type === "meeting" ? deleteConfirm.id : null;
            const homemealId = deleteConfirm._type === "homemeal" ? deleteConfirm.id : null;
            const result = await proposeHandover(meetingId, homemealId, user.id, deleteConfirm.name);
            setAlert({ open: true, type: result.success ? "success" : "info", message: result.message });
            setDeleteConfirm(null);
          },
          handoverText: "Hand over",
        } : {})} />

      <Modal open={!!editItem} onClose={() => setEditItem(null)}
        title={editItem?._type === "reco" ? "Edit Food Pick" : "Edit"}
        action={<button className="w-full py-3.5 rounded-xl bg-ember text-white font-bold text-title hover:bg-ember-deep transition-colors cursor-pointer" onClick={handleSave}>Save</button>}>
        {editItem?._type === "meeting" && <MeetingForm form={editForm} setForm={setEditForm} editMode />}
        {editItem?._type === "homemeal" && <HomemealForm form={editForm} setForm={setEditForm} editMode />}
        {editItem?._type === "reco" && <RecoForm form={editForm} setForm={setEditForm} editMode />}
      </Modal>

      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, open: false }))} />
    </>
  );
}

function PastItem({ item }) {
  const { user } = useAuth();
  const [showReview, setShowReview] = useState(false);
  const [closing, setClosing] = useState(false);
  const [closeError, setCloseError] = useState(null);
  const [alert, setAlert] = useState({ open: false, message: "" });
  const participants = item._type === "meeting" ? item.meeting_participants : item.claims;
  const meetingId = item._type === "meeting" ? item.id : null;
  const homemealId = item._type === "homemeal" ? item.id : null;
  const { data: myReviews = [] } = useMyReviews(meetingId, homemealId, user?.id);
  const alreadyReviewed = myReviews.length > 0;
  const isHost = user?.id === item.host_id;
  const isClosed = item.review_closed;
  const meetTime = new Date(item._date).getTime();
  const canClose = (Date.now() - meetTime) / (1000 * 60 * 60) >= 48;

  async function handleClose() {
    setClosing(true);
    setCloseError(null);
    setAlert({ open: false, message: "" });
    try {
      const result = await closeReviews(meetingId, homemealId);
      if (result?.error === "too_early") {
        setCloseError(`You can close reviews in ${result.remainHours} hours`);
        setClosing(false);
      } else if (result?.success) {
        setAlert({ open: true, message: "Reviews closed! Host bonus (+3) applied." });
        setTimeout(() => { setClosing(false); invalidateMyActivity(); }, 1500);
      } else {
        setCloseError("Something went wrong while closing.");
        setClosing(false);
      }
    } catch (e) {
      setCloseError("Something went wrong while closing.");
      setClosing(false);
    }
  }

  function handleReviewComplete() {
    setShowReview(false);
    if (isHost) {
      const hoursSince = (Date.now() - meetTime) / (1000 * 60 * 60);
      if (hoursSince >= 48) {
        setAlert({ open: true, message: "Press 'Close reviews' to finalize scores and earn your host bonus (+3)!" });
      } else {
        const remainHours = Math.ceil(48 - hoursSince);
        const remainDays = Math.ceil(remainHours / 24);
        setAlert({ open: true, message: `The 'Close reviews' button will appear in ${remainDays > 1 ? `${remainDays} days` : `${remainHours} hours`}. Closing applies all scores and earns you the host bonus (+3).` });
      }
    }
  }

  // determine status
  function renderAction() {
    if (item.cancelled) {
      return <span className="text-tag rounded px-1.5 py-0.5 ml-auto shrink-0 bg-flame-red/10 text-flame-red">Cancelled</span>;
    }
    if (isClosed) {
      if (isHost || alreadyReviewed) {
        return <span className="text-tag rounded px-1.5 py-0.5 ml-auto shrink-0 bg-herb/15 text-herb">Review done</span>;
      }
      return <span className="text-tag rounded px-1.5 py-0.5 ml-auto shrink-0 bg-ink/8 text-ink-soft">Ended</span>;
    }
    if (isHost && alreadyReviewed && canClose) {
      return (
        <button
          onClick={handleClose}
          disabled={closing}
          className="text-tag font-bold text-ember ml-auto shrink-0 cursor-pointer hover:underline disabled:opacity-50"
        >
          {closing ? "Closing..." : <>Close reviews <Info size={14} weight="fill" className="inline -mt-0.5" /></>}
        </button>
      );
    }
    if (isHost && alreadyReviewed && !canClose) {
      return (
        <span className="text-tag text-ink-soft ml-auto shrink-0 opacity-50">
          Close reviews
        </span>
      );
    }
    if (!alreadyReviewed && participants?.length > 0) {
      return (
        <button
          onClick={() => setShowReview(true)}
          className="text-tag font-bold text-ink-soft underline ml-auto shrink-0 cursor-pointer"
        >
          Leave a review
        </button>
      );
    }
    // participant already reviewed
    if (alreadyReviewed) {
      return <span className="text-tag rounded px-1.5 py-0.5 ml-auto shrink-0 bg-herb/15 text-herb">Review done</span>;
    }
    return <span className="text-tag rounded px-1.5 py-0.5 ml-auto shrink-0 bg-ink/8 text-ink-soft">Ended</span>;
  }

  return (
    <>
      <div className="mb-2 rounded-xl bg-white/30 px-4 py-2.5">
        <div className="flex items-center gap-2 text-meta text-ink-soft">
          <span className="text-tag bg-ink/8 rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap">{item._type === "meeting" ? "Together" : "Home Meal"}</span>
          {item._role === "hosted" && <span className="text-tag text-ember font-semibold shrink-0">Hosted</span>}
          <span className="line-clamp-1 flex-1 min-w-0">{item.title}</span>
          {renderAction()}
        </div>
        {closeError && <p className="text-tag text-flame-red mt-1">{closeError}</p>}
      </div>

      {alert.open && (
        <div className="mb-2 mx-1 px-3 py-2.5 rounded-xl bg-flame/10 border border-flame/20">
          <p className="text-tag text-ink leading-relaxed">{alert.message}</p>
        </div>
      )}

      <Modal
        open={showReview}
        onClose={() => setShowReview(false)}
        title={`How was "${item.title}"?`}
      >
        <ReviewSection
          meetingId={meetingId}
          homemealId={homemealId}
          participants={participants?.map((p) => ({ ...p, nickname: p.user?.nickname || p.nickname || "Participant" })) || []}
          hostId={item.host_id}
          hostNickname={item.host?.nickname}
          isHomemeal={item._type === "homemeal"}
          onComplete={handleReviewComplete}
        />
        <div className="py-4 text-center">
          <button
            onClick={() => setShowReview(false)}
            className="text-body-sm text-ink-soft underline cursor-pointer"
          >
            I'll do it later
          </button>
        </div>
      </Modal>
    </>
  );
}
