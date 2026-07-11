import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapPin, CalendarBlank, ChefHat, PuzzlePiece, Heart, ForkKnife, ShoppingCart, NavigationArrow, MapPinSimple, HourglassSimple, ClockCounterClockwise, ClockCountdown, Pencil, ChatCircle, Copy, Info, CaretLeft, Money } from "../components/icons";
import FlameIcon from "../components/FlameIcon";
import CommentSection from "../components/CommentSection";
import Card from "../components/Card";
import NotFoundPage from "./NotFoundPage";
import ReportModal from "../components/ReportModal";
import { formatDate } from "../utils/formatDate";
import { safeHref } from "../utils/validateUrl";
import usePageTitle from "../hooks/usePageTitle";
import { useAuth } from "../lib/auth";
import { mockHomemeals, mockMeetings, mockRecos } from "../mocks/data";
import { useJoinHomemeal, useLeaveHomemeal, invalidateHomemeals } from "../hooks/useHomemealQueries";
import { useJoinMeeting, useLeaveMeeting } from "../hooks/useMeetingQueries";
import { useToggleAgree } from "../hooks/useRecoQueries";
import AlertBanner from "../components/AlertBanner";
import LoginModal from "../components/LoginModal";
import ConfirmModal from "../components/ConfirmModal";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, guest, basePath, activeCityId } = useAuth();
  const [item, setItem] = useState(null);
  const [type, setType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });
  const [secureAddress, setSecureAddress] = useState(null);
  const [, forceUpdate] = useState(0);
  const joinHomemeal = useJoinHomemeal();
  const leaveHomemeal = useLeaveHomemeal();
  const joinMeeting = useJoinMeeting();
  const leaveMeeting = useLeaveMeeting();
  const toggleAgree = useToggleAgree();

  const typeLabel = type === "homemeal" ? "Home Meal" : type === "meeting" ? "Together" : type === "reco" ? "Local Eats" : "";
  const itemTitle = item?.title || item?.name || "";
  usePageTitle(itemTitle ? `${itemTitle} — ${typeLabel}` : null);

  // Load item — query by slug or UUID
  const isUuid = /^[0-9a-f]{8}-/.test(id);
  const field = isUuid ? "id" : "slug";

  useEffect(() => {
    // Look up item by slug or id from mock data
    const lookup = (arr) => arr.find((x) => x[field] === id) || null;

    let found = lookup(mockHomemeals);
    if (found) { setItem(found); setType("homemeal"); setSecureAddress("123 Example Street, Mt Albert"); setLoading(false); return; }

    found = lookup(mockMeetings);
    if (found) { setItem(found); setType("meeting"); setLoading(false); return; }

    found = lookup(mockRecos);
    if (found) { setItem(found); setType("reco"); setLoading(false); return; }

    setLoading(false);
  }, [id, field]);

  if (loading) return <div className="text-center text-body text-ink-soft py-12">Loading...</div>;
  if (!item) return <NotFoundPage />;

  const isHomemeal = type === "homemeal";
  const isMeeting = type === "meeting";
  const isReco = type === "reco";

  const hostName = item.host?.nickname || "Unknown";
  const suburbName = item.suburb?.name || "";
  const participants = isHomemeal ? item.claims : isMeeting ? item.meeting_participants : [];
  const joinedParticipants = (participants || []).filter((p) => p.status === "joined");
  const joinedCount = joinedParticipants.length;
  const myStatus = (participants || []).find((p) => p.user_id === user?.id)?.status || null;
  const isHost = item.host_id === user?.id;
  const isFull = item.capacity ? joinedCount >= item.capacity : false;
  const remaining = item.capacity ? item.capacity - joinedCount : 0;
  const isOwner = isHost || (isReco && item.author_id === user?.id);
  const isAgreed = isReco && item.agrees?.some((a) => a.user_id === user?.id);
  const agreeCount = isReco ? (item.agree_count || 0) : 0;

  function showAlertMsg(type, message) {
    setAlert({ open: true, type, message });
  }

  async function reload() {}

  // Join/cancel
  async function handleJoin() {
    if (!user) { setShowLoginModal(true); return; }
    if (myStatus) {
      const label = isHomemeal ? "Cancel participation" : "Cancel participation";
      setConfirm({ title: label, message: `Cancel your spot in "${item.title}"?`, cancelText: "Close", confirmColor: "bg-flame-red" });
      return;
    }
    const cnt = joinedCount;
    const status = (item.capacity && cnt >= item.capacity) ? "waitlist" : "joined";
    if (isHomemeal) await joinHomemeal.mutateAsync({ homemealId: item.id, userId: user.id, status });
    if (isMeeting) await joinMeeting.mutateAsync({ meetingId: item.id, userId: user.id, status });
    forceUpdate((v) => v + 1);
    showAlertMsg(status === "waitlist" ? "waitlist" : "success", status === "waitlist" ? `You're on the waitlist!` : `Joined ${item.title}!`);
  }

  async function handleConfirmCancel() {
    if (isHomemeal) await leaveHomemeal.mutateAsync({ homemealId: item.id, userId: user.id });
    if (isMeeting) await leaveMeeting.mutateAsync({ meetingId: item.id, userId: user.id });
    forceUpdate((v) => v + 1);
    setConfirm(null);
    showAlertMsg("success", "Cancelled.");
  }

  // Local eats like
  async function handleAgree() {
    if (!user) { setShowLoginModal(true); return; }
    await toggleAgree.mutateAsync({ recoId: item.id, userId: user.id });
    forceUpdate((v) => v + 1);
  }

  function kindIcon() {
    if (isHomemeal) return item.kind === "cook" ? <ChefHat size={20} /> : item.kind === "potluck" ? <PuzzlePiece size={20} /> : <Heart size={20} />;
    if (isMeeting) return item.kind === "go" ? <ForkKnife size={20} /> : <ShoppingCart size={20} />;
    return null;
  }

  return (
    <div className="px-4 pt-24 md:py-16 pb-40">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="text-ink-soft p-1 mb-4 inline-flex items-center gap-1 cursor-pointer hover:text-ink">
        <CaretLeft size={18} /> Go back
      </button>

      <Card>
      {/* Title */}
      <div className="flex items-start gap-2 mb-4">
        {(isHomemeal || isMeeting) && <span className="text-ink shrink-0 mt-1">{kindIcon()}</span>}
        {isReco && <span className="text-tag text-ink-soft bg-ink/6 rounded px-1.5 py-0.5 shrink-0 mt-1">{item.category}</span>}
        <h1 className="text-heading font-bold text-ink">
          {item.title || item.name}
          {isFull && <span className="text-tag font-bold text-ink-soft bg-ink/8 rounded px-1.5 py-0.5 ml-2">Full</span>}
        </h1>
      </div>

      {/* Tags (Together only) */}
      {isMeeting && item.reasons?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {item.reasons.map((r) => (
            <span key={r} className="text-tag font-semibold text-ink-soft bg-paper2 border border-line rounded-full px-2 py-0.5">{r}</span>
          ))}
        </div>
      )}

      {/* Meta: host + date + suburb + budget + address */}
      {(isHomemeal || isMeeting) && (
        <div className="flex flex-wrap items-center text-meta text-ink-soft gap-x-3 gap-y-1 mb-4">
          <div className="py-0.5 flex items-center gap-1.5 shrink-0">
            <span className="w-5 h-5 rounded-full bg-ember-deep text-white text-[9px] font-bold inline-flex items-center justify-center">
              {hostName[0]}
            </span>
            <span>{hostName}</span>
            <FlameIcon score={item.host?.flame_score || 30} size={11} />
          </div>
          <span className="inline-flex items-center gap-1 shrink-0">
            <CalendarBlank size={14} /> {formatDate(isHomemeal ? item.share_at : item.meet_at)}
          </span>
          {suburbName && !(isMeeting && item.address && !item.address.startsWith("http")) && !(isHomemeal && myStatus === "joined" && secureAddress && !secureAddress.startsWith("http")) && (
            <span className="inline-flex items-center gap-0.5 shrink-0"><MapPin size={12} /> {suburbName}</span>
          )}
          {item.budget && <span className="inline-flex items-center gap-0.5 shrink-0"><Money size={14} /> {item.budget}</span>}
          {isMeeting && item.address?.startsWith("http") && (
            <a href={safeHref(item.address)} target="_blank" rel="noopener noreferrer" className="text-ink underline inline-flex items-center gap-0.5 shrink-0">
              <NavigationArrow size={12} /> View map
            </a>
          )}
          {isMeeting && item.address && !item.address.startsWith("http") && (
            <span className="inline-flex items-center gap-0.5 shrink-0"><MapPinSimple size={12} /> <CopyableAddress address={item.address} /></span>
          )}
          {isHomemeal && myStatus === "joined" && (
            secureAddress
              ? secureAddress.startsWith("http")
                ? <a href={safeHref(secureAddress)} target="_blank" rel="noopener noreferrer" className="text-ink underline inline-flex items-center gap-0.5 shrink-0"><NavigationArrow size={12} /> View map</a>
                : <span className="inline-flex items-center gap-0.5 shrink-0"><MapPinSimple size={12} /> <CopyableAddress address={secureAddress} /></span>
              : <span className="italic inline-flex items-center gap-0.5 shrink-0"><MapPinSimple size={12} /> Revealed 24h before</span>
          )}
        </div>
      )}

      {/* Local eats meta */}
      {isReco && (
        <div className="flex gap-x-3 gap-y-1 text-meta text-ink-soft mb-4">
          <span>Recommended by {item.author?.nickname || "Unknown"}</span>
          {suburbName && <span className="inline-flex items-center gap-0.5"><MapPin size={12} /> {suburbName}</span>}
          {item.map_url && (
            <a href={safeHref(item.map_url)} target="_blank" rel="noopener noreferrer" className="text-ink underline inline-flex items-center gap-0.5">
              <NavigationArrow size={12} /> View map
            </a>
          )}
        </div>
      )}

      {/* Description */}
      <p className="text-body leading-relaxed text-ink mb-4">
        {isReco ? `"${item.note}"` : item.description}
      </p>

      {/* Participants + action (meetup/homemeal) */}
      {(isHomemeal || isMeeting) && (
        <div className="flex justify-between items-center py-3 border-t border-line">
          <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-1.5">
              {[...joinedParticipants].sort((a, b) => (a.user_id === item.host_id ? -1 : b.user_id === item.host_id ? 1 : 0)).slice(0, 3).map((p, i) => (
                <span key={p.id} className={`w-6 h-6 rounded-full text-white text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-paper ${p.user_id === item.host_id ? "bg-ember-deep text-tag" : "bg-ink-soft"}`} style={{ zIndex: 10 - i }} title={p.user?.nickname || "?"}>
                  {(p.user?.nickname || "?")[0]}
                </span>
              ))}
              {joinedCount > 3 && <span className="w-6 h-6 rounded-full bg-ink/10 text-ink-soft text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-paper" style={{ zIndex: 0 }}>+{joinedCount - 3}</span>}
            </div>
            <span className="text-meta text-ink-soft">
              {!item.capacity ? `${joinedCount}` : <>{`${joinedCount}/${item.capacity}`}{remaining === 1 && !isFull ? <span className="font-bold text-herb"> · last spot!</span> : ""}</>}
            </span>
          </div>
          {!isHost && (
            myStatus === "joined" ? (
              <button onClick={handleJoin} className="px-4 py-2.5 rounded-lg text-herb font-bold text-body-sm bg-paper2 border border-herb cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
                ✓ {isHomemeal && item.kind === "share" ? "Requested" : "Joined"}
              </button>
            ) : myStatus === "waitlist" ? (
              <button onClick={handleJoin} className="px-4 py-2.5 rounded-lg text-flame font-bold text-body-sm bg-flame/10 border border-flame cursor-pointer inline-flex items-center gap-1 hover:-translate-y-0.5 hover:shadow-md transition-all">
                <HourglassSimple size={14} weight="fill" /> Waitlisted
              </button>
            ) : (
              <button onClick={handleJoin} className={`px-4 py-2.5 rounded-lg text-white font-bold text-body-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all ${isFull ? "bg-ink-soft" : "bg-ink"}`}>
                {isFull ? "Join waitlist"
                  : isHomemeal ? (item.kind === "cook" ? "Cook together" : item.kind === "potluck" ? "Join in" : "Get it free")
                  : (item.kind === "go" ? "Eat together" : "Buy together")}
              </button>
            )
          )}
        </div>
      )}

      {/* Local eats like */}
      {isReco && (
        <div className="flex justify-between items-center pt-3 border-t border-line">
          <span className="inline-flex items-center gap-1 text-meta text-ink-soft">
            <Heart size={14} weight={agreeCount > 0 ? "fill" : "regular"} className={agreeCount > 0 ? "text-flame" : ""} /> {agreeCount} likes
          </span>
          <button onClick={handleAgree}
            className={`border rounded-lg px-4 py-2 text-body-sm font-bold transition-all duration-150 hover:-translate-y-0.5 hover:shadow-md cursor-pointer inline-flex items-center gap-1 ${
              isAgreed ? "border-flame bg-flame/15 text-ember-deep" : "border-line bg-transparent text-ink-soft"
            }`}>
            {isAgreed && <Heart size={13} weight="fill" className="text-flame" />} Like
          </button>
        </div>
      )}

      {/* Comments */}
      {(isHomemeal || isMeeting) && (
        <CommentSection
          meetingId={isMeeting ? item.id : null}
          homemealId={isHomemeal ? item.id : null}
          hostId={item.host_id}
        />
      )}

      {/* Report */}
      {user && !isOwner && (
        <button
          onClick={() => setShowReport(true)}
          className="text-tag text-ink-soft/50 hover:text-ink-soft cursor-pointer mt-4 inline-flex items-center gap-0.5"
        >
          <Info size={12} /> Report
        </button>
      )}

      </Card>

      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        targetType={type}
        targetId={item.id}
      />

      <LoginModal open={showLoginModal} onClose={() => setShowLoginModal(false)} />

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirmCancel}
        title={confirm?.title || "Cancel"}
        message={confirm?.message || ""}
        confirmText="Yes, cancel"
        cancelText="Close"
        confirmColor="bg-flame-red"
      />

      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, open: false }))} />
    </div>
  );
}

function CopyableAddress({ address }) {
  const [copied, setCopied] = useState(false);
  async function handleCopy() {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button onClick={handleCopy} className="inline-flex items-center gap-1 text-ink-soft hover:text-ink cursor-pointer group">
      <span>{address}</span>
      <Copy size={12} className={`shrink-0 opacity-0 group-hover:opacity-100 transition-opacity ${copied ? "text-herb opacity-100" : ""}`} />
      {copied && <span className="text-tag text-herb">Copied</span>}
    </button>
  );
}
