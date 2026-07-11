import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Log, CaretDown } from "./icons";
import { useAuth } from "../lib/auth";
import { useMyReviews, useSubmitReview } from "../hooks/useReviewQueries";
const voteCook = async () => {};
import AlertBanner from "./AlertBanner";

const REMOVE_REASONS = [
  { value: "manner", label: "Poor manners", desc: "Rude or unpleasant behavior", points: -1 },
  { value: "promise", label: "Didn't keep promises", desc: "Food quality, lack of preparation, etc.", points: -2 },
  { value: "serious", label: "Serious issue", desc: "Spoiled food, hygiene problems, etc.", points: -3 },
];

export default function ReviewSection({ meetingId, homemealId, participants, hostId, hostNickname, isHomemeal, onComplete }) {
  const { user } = useAuth();
  const { data: myReviews = [] } = useMyReviews(meetingId, homemealId, user?.id);
  const submitMutation = useSubmitReview(meetingId, homemealId, user?.id);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });
  const [submitting, setSubmitting] = useState(false);

  const [addSet, setAddSet] = useState(new Set());
  const [removeMap, setRemoveMap] = useState({}); // userId → reason
  const [noshowSet, setNoshowSet] = useState(new Set());
  const [cookVote, setCookVote] = useState(null);
  const [noshowDone, setNoshowDone] = useState(false);
  const [showIssue, setShowIssue] = useState(false);

  const isHost = user?.id === hostId;
  const alreadySubmitted = myReviews.length > 0;

  const allMembers = [
    ...(hostId && hostId !== user?.id ? [{ user_id: hostId, status: "joined", nickname: hostNickname || "Host", isHost: true }] : []),
    ...participants.filter((p) => p.user_id !== user?.id && p.user_id !== hostId && p.status === "joined"),
  ];

  const presentMembers = allMembers.filter((p) => !noshowSet.has(p.user_id));
  const hasAnySelection = addSet.size > 0 || Object.keys(removeMap).length > 0 || noshowSet.size > 0 || (isHost && noshowDone);

  function toggleAdd(userId) {
    if (removeMap[userId]) return; // can't add someone marked for removal
    setAddSet((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
  }

  function selectAllAdd() {
    setAddSet(new Set(presentMembers.filter(p => !removeMap[p.user_id]).map(p => p.user_id)));
  }

  function setRemove(userId, reason) {
    setRemoveMap((prev) => ({ ...prev, [userId]: reason }));
    setAddSet((prev) => { const next = new Set(prev); next.delete(userId); return next; });
  }

  function clearRemove(userId) {
    setRemoveMap((prev) => { const next = { ...prev }; delete next[userId]; return next; });
  }

  function toggleNoshow(userId) {
    setNoshowSet((prev) => {
      const next = new Set(prev);
      next.has(userId) ? next.delete(userId) : next.add(userId);
      return next;
    });
    setAddSet((prev) => { const next = new Set(prev); next.delete(userId); return next; });
    setRemoveMap((prev) => { const next = { ...prev }; delete next[userId]; return next; });
  }

  async function handleSubmitAll() {
    setSubmitting(true);
    try {
      for (const userId of noshowSet) {
        await submitMutation.mutateAsync({ meetingId, homemealId, fromId: user.id, toId: userId, points: -5, reason: "noshow" });
      }
      for (const userId of addSet) {
        await submitMutation.mutateAsync({ meetingId, homemealId, fromId: user.id, toId: userId, points: 2 });
      }
      const reasonPoints = { manner: -1, promise: -2, serious: -3 };
      for (const [userId, reason] of Object.entries(removeMap)) {
        await submitMutation.mutateAsync({ meetingId, homemealId, fromId: user.id, toId: userId, points: reasonPoints[reason] || -3, reason });
      }
      if (isHomemeal && cookVote) {
        await voteCook(homemealId, user.id, cookVote);
      }
      setAlert({ open: true, type: "success", message: "Review submitted!" });
      onComplete?.();
    } catch (e) {
      setAlert({ open: true, type: "info", message: "Something went wrong." });
    }
    setSubmitting(false);
  }

  async function handleCookVote(userId) {
    setCookVote(userId);
  }

  if (allMembers.length === 0) return null;

  if (alreadySubmitted) return null;

  return (
    <div onClick={(e) => e.stopPropagation()}>
      {!isHost && (
        <p className="text-meta text-ink-soft mb-4 leading-relaxed">
          Add a log for people you'd love to meet again — it'll grow their Ember score.<br></br>All reviews take effect after the host closes them.
        </p>
      )}

      {/* 1. Host: No-shows */}
      {isHost && (
        <div className="mb-3 rounded-xl border border-line p-4">
          <button onClick={() => setNoshowDone((v) => !v)}
            className="flex items-center w-full text-left cursor-pointer">
            <span className="text-body-sm font-bold text-ink flex-1">1. Did anyone not show up?</span>
            {noshowDone && <span className="text-tag text-ink-soft mr-1">{noshowSet.size > 0 ? `No-show: ${noshowSet.size}` : "All attended"}</span>}
            <CaretDown size={14} className={`text-ink-soft shrink-0 transition-transform ${!noshowDone ? "rotate-0" : "-rotate-90"}`} />
          </button>
          {!noshowDone && (
            <div className="mt-3">
              <div className="flex items-baseline gap-2 mb-3">
                <p className="text-meta text-ink-soft leading-relaxed">Let us know if anyone didn't show up.</p>
                <button onClick={() => setNoshowDone(true)}
                  className="text-tag text-ember hover:text-ember-deep cursor-pointer shrink-0">
                  Everyone attended
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {allMembers.map((p) => {
                  const nickname = p.nickname || p.user?.nickname || "Participant";
                  const selected = noshowSet.has(p.user_id);
                  return (
                    <button key={p.user_id} onClick={() => { toggleNoshow(p.user_id); setNoshowDone(true); }}
                      className={`px-3 py-1.5 rounded-full text-body-sm font-semibold transition-all cursor-pointer ${
                        selected ? "bg-flame-red/10 text-flame-red border border-flame-red/25" : "bg-card border border-line text-ink-soft hover:border-ink/30"
                      }`}>
                      {nickname}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 2. Add logs (Host: bordered box) */}
      {isHost && (
        <div className={`mb-4 rounded-xl border border-line p-4 ${!noshowDone ? "opacity-40" : ""}`}>
          <div className="flex justify-between items-center">
            <span className="text-body-sm font-bold text-ink">2. Add logs</span>
            {noshowDone && (
              <button onClick={selectAllAdd} className="text-tag underline font-bold text-ink-soft cursor-pointer hover:underline">
                Select all
              </button>
            )}
          </div>
          {noshowDone && (
            <p className="text-meta text-ink-soft mt-2 mb-3 leading-relaxed">Add a log for people you'd love to meet again — it'll grow their Ember score.</p>
          )}

          {noshowDone && (
            <>
              <div className="flex flex-wrap gap-2 mb-3">
                {presentMembers.filter(p => !removeMap[p.user_id]).map((p) => {
                  const added = addSet.has(p.user_id);
                  const nickname = p.nickname || p.user?.nickname || "Participant";
                  return (
                    <button key={p.user_id} onClick={() => toggleAdd(p.user_id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm font-semibold transition-all cursor-pointer ${
                        added ? "bg-ember/12 text-ember border border-ember/20"
                        : "bg-card border border-line text-ink-soft hover:border-ink/30 hover:-translate-y-0.5"
                      }`}>
                      <Log size={13} weight={added ? "fill" : "regular"} className={`shrink-0 ${added ? "text-ember" : "text-ink-soft/30"}`} />
                      {nickname}
                    </button>
                  );
                })}
              </div>

              {!showIssue ? (
                presentMembers.some(p => !addSet.has(p.user_id)) && (
                <button onClick={() => setShowIssue(true)} className="text-body-sm text-ink-soft underline cursor-pointer block">
                  Had an issue at the gathering?
                </button>)
              ) : (
                <div className="pt-3 border-t border-line">
                  <span className="text-body-sm font-bold text-ink-soft block mb-2">Remove logs</span>
                  <div className="flex flex-wrap gap-2">
                    {presentMembers.filter(p => !addSet.has(p.user_id)).map((p) => {
                      const removed = removeMap[p.user_id];
                      const nickname = p.nickname || p.user?.nickname || "Participant";
                      return (
                        <ReasonTag
                          key={p.user_id}
                          nickname={nickname}
                          selected={removed}
                          onSelect={(reason) => setRemove(p.user_id, reason)}
                          onClear={() => clearRemove(p.user_id)}
                        />
                      );
                    })}
                  </div>
                </div>
              )}

              {isHomemeal && presentMembers.length > 0 && (
                <div className="pt-3 border-t border-line mt-3">
                  <span className="text-body-sm font-bold text-ink block mb-2">Who was the best cook?</span>
                  <div className="flex flex-wrap gap-1.5">
                    {presentMembers.map((p) => {
                      const nickname = p.nickname || p.user?.nickname || "Participant";
                      return (
                        <button key={p.user_id} onClick={() => handleCookVote(p.user_id)}
                          className={`px-3 py-1.5 rounded-full text-tag font-semibold cursor-pointer transition-all ${
                            cookVote === p.user_id ? "bg-ink text-white" : "bg-ink/6 text-ink-soft hover:bg-ink/10"
                          }`}>
                          {nickname}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-tag text-ink-soft/50 mt-1.5">You can only pick one</p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Host: Submit review (outside box) */}
      {isHost && (
        <button onClick={handleSubmitAll} disabled={!hasAnySelection || submitting}
          className="w-full py-3 rounded-xl bg-ember text-white font-bold text-body-sm hover:bg-ember-deep transition-colors cursor-pointer disabled:opacity-50">
          {submitting ? "Submitting..." : "Submit review"}
        </button>
      )}

      {/* Participant: no border */}
      {!isHost && (
        <>
          <div className="flex justify-between items-center mb-2">
            <span className="text-body-sm font-bold text-ink">Add logs</span>
            <button onClick={selectAllAdd} className="text-tag underline font-bold text-ink-soft cursor-pointer hover:underline">
              Select all
            </button>
          </div>

          <div className="flex flex-wrap gap-2 mb-3">
            {presentMembers.filter(p => !removeMap[p.user_id]).map((p) => {
              const added = addSet.has(p.user_id);
              const nickname = p.nickname || p.user?.nickname || "Participant";
              return (
                <button key={p.user_id} onClick={() => toggleAdd(p.user_id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm font-semibold transition-all cursor-pointer ${
                    added ? "bg-ember/12 text-ember border border-ember/20"
                    : "bg-card border border-line text-ink-soft hover:border-ink/30 hover:-translate-y-0.5"
                  }`}>
                  <Log size={13} weight={added ? "fill" : "regular"} className={`shrink-0 ${added ? "text-ember" : "text-ink-soft/30"}`} />
                  {nickname}
                </button>
              );
            })}
          </div>

          {!showIssue ? (
            presentMembers.some(p => !addSet.has(p.user_id)) && (
            <button onClick={() => setShowIssue(true)} className="text-body-sm text-ink-soft underline cursor-pointer block mb-3">
              Had an issue at the gathering?
            </button>)
          ) : (
            <div className="pt-3 border-t border-line mb-3">
              <span className="text-body-sm font-bold text-ink-soft block mb-2">Remove logs</span>
              <div className="flex flex-wrap gap-2">
                {presentMembers.filter(p => !addSet.has(p.user_id)).map((p) => {
                  const removed = removeMap[p.user_id];
                  const nickname = p.nickname || p.user?.nickname || "Participant";
                  return (
                    <ReasonTag
                      key={p.user_id}
                      nickname={nickname}
                      selected={removed}
                      onSelect={(reason) => setRemove(p.user_id, reason)}
                      onClear={() => clearRemove(p.user_id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {isHomemeal && presentMembers.length > 0 && (
            <div className="pt-3 border-t border-line mb-3">
              <span className="text-body-sm font-bold text-ink block mb-2">Who was the best cook?</span>
              <div className="flex flex-wrap gap-1.5">
                {presentMembers.map((p) => {
                  const nickname = p.nickname || p.user?.nickname || "Participant";
                  return (
                    <button key={p.user_id} onClick={() => handleCookVote(p.user_id)}
                      className={`px-3 py-1.5 rounded-full text-tag font-semibold cursor-pointer transition-all ${
                        cookVote === p.user_id ? "bg-ink text-white" : "bg-ink/6 text-ink-soft hover:bg-ink/10"
                      }`}>
                      {nickname}
                    </button>
                  );
                })}
              </div>
              <p className="text-tag text-ink-soft/50 mt-1.5">You can only pick one</p>
            </div>
          )}

          <button onClick={handleSubmitAll} disabled={!hasAnySelection || submitting}
            className="w-full py-3 rounded-xl bg-ember text-white font-bold text-body-sm hover:bg-ember-deep transition-colors cursor-pointer disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit review"}
          </button>
        </>
      )}

      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, open: false }))} />
    </div>
  );
}

function ReasonTag({ nickname, selected, onSelect, onClear }) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef(null);
  const dropRef = useRef(null);
  const [pos, setPos] = useState(null);
  const label = selected ? REMOVE_REASONS.find(r => r.value === selected)?.label : null;

  function openDropdown() {
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 4, left: rect.left });
    }
    setOpen(true);
  }

  useEffect(() => {
    if (!open) return;
    function handleClose(e) {
      if (btnRef.current?.contains(e.target)) return;
      if (dropRef.current?.contains(e.target)) return;
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClose, true);
    return () => document.removeEventListener("mousedown", handleClose, true);
  }, [open]);

  return (
    <div className="relative">
      <button ref={btnRef} onClick={() => selected ? onClear() : open ? setOpen(false) : openDropdown()}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-body-sm font-semibold transition-all cursor-pointer ${
          selected
            ? "bg-flame-red/10 text-flame-red border border-flame-red/20"
            : "bg-card border border-line text-ink-soft hover:border-ink/30 hover:-translate-y-0.5"
        }`}>
        <Log size={13} weight={selected ? "fill" : "regular"} className={`shrink-0 ${selected ? "text-flame-red" : "text-ink-soft/30"}`} />
        {nickname}
        {selected ? (
          <span className="text-tag">· {label} ✕</span>
        ) : (
          <CaretDown size={12} className="text-ink-soft/40" />
        )}
      </button>
      {open && pos && createPortal(
        <div
          ref={dropRef}
          style={{ position: "fixed", top: pos.top, left: pos.left, zIndex: 9999 }}
          className="bg-card border border-line rounded-xl shadow-lg py-1 w-56"
        >
          {REMOVE_REASONS.map((r) => (
            <button key={r.value} onClick={() => { onSelect(r.value); setOpen(false); }}
              className="w-full text-left px-3 py-2.5 hover:bg-ink/4 cursor-pointer">
              <span className="text-body-sm text-ink block">{r.label}</span>
              <span className="text-tag text-ink-soft/60">{r.desc}</span>
            </button>
          ))}
        </div>,
        document.body
      )}
    </div>
  );
}
