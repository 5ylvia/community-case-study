import { useState, useEffect } from "react";
import { MapPin, CalendarBlank, ChefHat, PuzzlePiece, Heart, ForkKnife, ShoppingCart, NavigationArrow, MapPinSimple, HourglassSimple, ClockCounterClockwise, ClockCountdown, Pencil, ChatCircle, Copy, Info } from "./icons";
import Modal from "./Modal";
import FlameIcon from "./FlameIcon";
import CommentSection from "./CommentSection";
import ReportModal from "./ReportModal";
import { formatDate } from "../utils/formatDate";
import { useAuth } from "../lib/auth";
// TODO: replace with mock
const getHomemealAddress = async () => null;
import { safeHref } from "../utils/validateUrl";

export default function DetailModal({ open, onClose, item, type, myStatus, joinedCount, isFull, isHost, isViewing, isGuest, onJoin, onEdit, onAgree, isAgreed, agreeCount }) {
  const { user } = useAuth();
  const [showReport, setShowReport] = useState(false);
  const [secureAddress, setSecureAddress] = useState(null);

  useEffect(() => {
    if (open && item && type === "homemeal" && user) {
      getHomemealAddress(item.id).then(setSecureAddress);
    } else {
      setSecureAddress(null);
    }
  }, [open, item?.id, type, user]);

  if (!open || !item) return null;

  const isHomemeal = type === "homemeal";
  const isMeeting = type === "meeting";
  const isReco = type === "reco";
  const isOwner = isHost || (isReco && item.author_id === user?.id);

  // kind icon
  function kindIcon() {
    if (isHomemeal) {
      return item.kind === "cook" ? <ChefHat size={18} /> : item.kind === "potluck" ? <PuzzlePiece size={18} /> : <Heart size={18} />;
    }
    if (isMeeting) {
      return item.kind === "go" ? <ForkKnife size={18} /> : <ShoppingCart size={18} />;
    }
    return null;
  }

  function kindLabel() {
    if (isHomemeal) return item.kind === "cook" ? "Cook Together" : item.kind === "potluck" ? "Pumasi" : "Share";
    if (isMeeting) return item.kind === "go" ? "Eat Together" : "Buy Together";
    return "";
  }

  const hostName = item.host?.nickname || "Unknown";
  const suburbName = item.suburb?.name || "";
  const participants = isHomemeal ? item.claims : isMeeting ? item.meeting_participants : [];
  const joinedParticipants = (participants || []).filter((p) => p.status === "joined");
  const remaining = item.capacity ? item.capacity - joinedCount : 0;

  // action button
  function actionButton() {
    if (isReco) {
      return (
        <button
          onClick={() => { onAgree?.(item); }}
          className={`px-4 py-2.5 rounded-lg font-bold text-body-sm transition-all cursor-pointer inline-flex items-center gap-1 hover:-translate-y-0.5 hover:shadow-md ${
            isAgreed ? "border border-flame bg-flame/15 text-ember-deep" : "bg-ink text-white"
          }`}>
          {isAgreed && <Heart size={13} weight="fill" className="text-flame" />}
          {isAgreed ? "Unlike" : "Like"}
        </button>
      );
    }

    if (isGuest) {
      return (
        <button onClick={() => onJoin?.(item)}
          className="px-4 py-2.5 rounded-lg bg-ink text-white font-bold text-body-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          {isHomemeal
            ? (item.kind === "cook" ? "Cook Together" : item.kind === "potluck" ? "Join Pumasi" : "Claim Share")
            : (item.kind === "go" ? "Eat Together" : "Buy Together")}
        </button>
      );
    }

    if (isHost) return null;

    if (myStatus === "joined") {
      return (
        <button onClick={() => onJoin?.(item)}
          className="px-4 py-2.5 rounded-lg text-herb font-bold text-body-sm bg-paper2 border border-herb cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all">
          ✓ {isHomemeal && item.kind === "share" ? "Claimed" : "Joined"}
        </button>
      );
    }
    if (myStatus === "waitlist") {
      return (
        <button onClick={() => onJoin?.(item)}
          className="px-4 py-2.5 rounded-lg text-flame font-bold text-body-sm bg-flame/10 border border-flame cursor-pointer inline-flex items-center gap-1 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <HourglassSimple size={14} weight="fill" /> Waitlisted
        </button>
      );
    }
    if (myStatus === "pending") {
      return (
        <button onClick={() => onJoin?.(item)}
          className="px-4 py-2.5 rounded-lg text-ink-soft font-bold text-body-sm bg-paper2 border border-line cursor-pointer inline-flex items-center gap-1 hover:-translate-y-0.5 hover:shadow-md transition-all">
          <ClockCounterClockwise size={14} /> Pending approval
        </button>
      );
    }

    if (isViewing) return null;

    return (
      <button onClick={() => onJoin?.(item)}
        className={`px-4 py-2.5 rounded-lg text-white font-bold text-body-sm cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all ${isFull ? "bg-ink-soft" : "bg-ink"}`}>
        {isFull
          ? <><ClockCountdown size={14} className="inline -mt-0.5" /> Join waitlist</>
          : isHomemeal
            ? (item.kind === "cook" ? "Cook Together" : item.kind === "potluck" ? "Join Pumasi" : "Claim Share")
            : (item.kind === "go" ? "Eat Together" : "Buy Together")}
      </button>
    );
  }

  // Bottom bar: participant avatars + count + action button
  function renderActionBar() {
    if (isReco) {
      return (
        <div className="flex justify-between items-center">
          <div className="inline-flex items-center gap-1 text-meta text-ink-soft">
            <Heart size={14} weight={agreeCount > 0 ? "fill" : "regular"} className={agreeCount > 0 ? "text-flame" : ""} /> {agreeCount} {agreeCount === 1 ? "like" : "likes"}
          </div>
          {actionButton()}
        </div>
      );
    }

    return (
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center -space-x-1.5">
            {[...joinedParticipants].sort((a, b) => (a.user_id === item.host_id ? -1 : b.user_id === item.host_id ? 1 : 0)).slice(0, 3).map((p, i) => (
              <span key={p.id} className={`w-6 h-6 rounded-full text-white text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-card ${p.user_id === item.host_id ? "bg-ember-deep text-tag" : "bg-ink-soft"}`} style={{ zIndex: 10 - i }} title={p.user?.nickname || "?"}>
                {(p.user?.nickname || "?")[0]}
              </span>
            ))}
            {joinedCount > 3 && <span className="w-6 h-6 rounded-full bg-ink/10 text-ink-soft text-[9px] font-bold inline-flex items-center justify-center ring-2 ring-card" style={{ zIndex: 0 }}>+{joinedCount - 3}</span>}
          </div>
          <span className="text-meta text-ink-soft">
            {!item.capacity
              ? `${joinedCount} joined`
              : <>{`${joinedCount}/${item.capacity}`}{remaining === 1 && !isFull ? <span className="font-bold text-herb"> · Last spot!</span> : ""}</>
            }
          </span>
        </div>
        {actionButton()}
      </div>
    );
  }

  // check address availability
  const hasAddress = isHomemeal ? (myStatus === "joined" && item.address) : isMeeting ? !!item.address : !!item.map_url;

  // modal title with icon
  const modalTitle = (
    <span className="inline-flex items-start gap-1.5">
      {(isHomemeal || isMeeting) && <span className="shrink-0 mt-2">{kindIcon()}</span>}
      {isReco && <span className="text-tag text-ink-soft bg-ink/6 rounded px-1.5 py-0.5 shrink-0">{item.category}</span>}
      {item.title || item.name}
      {(isHomemeal || isMeeting) && isFull && <span className="text-tag font-bold text-ink-soft bg-ink/8 rounded px-1.5 py-0.5 shrink-0 whitespace-nowrap">Full</span>}
    </span>
  );

  return (
    <Modal open={open} onClose={onClose} title={modalTitle} action={renderActionBar()}>
      <div className="space-y-3">

        {/* Tags */}
        {isMeeting && item.reasons?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {item.reasons.map((r) => (
              <span key={r} className="text-tag font-semibold text-ink-soft bg-paper2 border border-line rounded-full px-2 py-0.5">{r}</span>
            ))}
          </div>
        )}

        {/* Description */}
        <p className="text-body leading-relaxed text-ink">
          {isReco ? `"${item.note}"` : item.description}
        </p>

        {/* Meta: host / date / address (Home Meal / Together) */}
        {(isHomemeal || isMeeting) && (
          <div className="flex flex-wrap items-center text-meta text-ink-soft gap-x-2.5 gap-y-1 mb-3">
            <div className="flex items-center gap-1.5 shrink-0 w-full md:w-auto">
              <span className="w-5 h-5 rounded-full bg-ember-deep text-white text-[9px] font-bold inline-flex items-center justify-center">
                {hostName[0]}
              </span>
              <span className="whitespace-nowrap">{hostName}</span>
              <FlameIcon score={item.host?.flame_score || 30} size={11} />
            </div>
            <span className="inline-flex items-center gap-1 shrink-0 whitespace-nowrap">
              <CalendarBlank size={14} /> {formatDate(isHomemeal ? item.share_at : item.meet_at)}
            </span>
            <span className="text-meta text-ink-soft inline-flex items-center gap-0.5 shrink-0 md:ml-auto">
              {isMeeting && item.address?.startsWith("http") ? (
                <a href={safeHref(item.address)} target="_blank" rel="noopener noreferrer" className="text-ink underline inline-flex items-center gap-0.5">
                  <NavigationArrow size={12} /> View map
                </a>
              ) : isMeeting && item.address ? (
                <span className="inline-flex items-center gap-0.5"><NavigationArrow size={12} /> <CopyableAddress address={item.address} /></span>
              ) : isHomemeal && myStatus === "joined" ? (
                secureAddress
                  ? secureAddress.startsWith("http")
                    ? <a href={safeHref(secureAddress)} target="_blank" rel="noopener noreferrer" className="text-ink underline inline-flex items-center gap-0.5"><MapPinSimple size={12} /> View map</a>
                    : <span className="inline-flex items-center gap-0.5"><MapPinSimple size={12} /> <CopyableAddress address={secureAddress} /></span>
                  : <span className="italic inline-flex items-center gap-0.5"><MapPinSimple size={12} /> Address shared 24 hours before</span>
              ) : suburbName ? (
                <><MapPin size={12} /> {suburbName}</>
              ) : null}
            </span>
          </div>
        )}

        {/* Food Picks meta */}
        {isReco && (
          <div className="flex justify-between text-meta text-ink-soft mb-3">
            <div className="flex items-center gap-1.5">
              <span>Recommended by {item.author?.nickname || "Unknown"}</span>
              {suburbName && (
                <>
                  <span>·</span>
                  <span className="inline-flex items-center gap-0.5">
                    <MapPin size={12} /> {suburbName}
                  </span>
                </>
              )}
            </div>
            {item.map_url && (
              <a href={safeHref(item.map_url)} target="_blank" rel="noopener noreferrer"
                className="text-ink underline inline-flex items-center gap-0.5">
                <NavigationArrow size={12} /> View map
              </a>
            )}
          </div>
        )}

        {/* Comments (gatherings / home meals only) */}
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
            className="text-tag text-ink-soft/50 hover:text-ink-soft cursor-pointer mt-3 inline-flex items-center gap-0.5"
          >
            <Info size={12} /> Report
          </button>
        )}
      </div>

      <ReportModal
        open={showReport}
        onClose={() => setShowReport(false)}
        targetType={type}
        targetId={item.id}
      />
    </Modal>
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
