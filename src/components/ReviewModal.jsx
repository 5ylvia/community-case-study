import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import Modal from "./Modal";
import ReviewSection from "./ReviewSection";

function getDismissedIds() {
  try { return JSON.parse(localStorage.getItem("review_dismissed") || "[]"); } catch { return []; }
}
function dismissId(id) {
  const list = getDismissedIds();
  if (!list.includes(id)) list.push(id);
  localStorage.setItem("review_dismissed", JSON.stringify(list));
}

export default function ReviewModal() {
  const { user } = useAuth();
  const [pending, setPending] = useState(null);

  useEffect(() => {
    if (!user) return;
    // findPendingReview was fetching from supabase
  }, [user]);

  if (!pending) return null;

  return (
    <Modal
      open={true}
      onClose={() => setPending(null)}
      title={`How was "${pending.item.title}"?`}
    >
      <ReviewSection
        meetingId={pending.type === "meeting" ? pending.item.id : null}
        homemealId={pending.type === "homemeal" ? pending.item.id : null}
        participants={pending.participants.map(p => ({ ...p, nickname: p.user?.nickname || "Participant" }))}
        hostId={pending.item.host_id}
        hostNickname={pending.hostNickname}
        isHomemeal={pending.type === "homemeal"}
        onComplete={() => setPending(null)}
      />
      <div className="py-4 text-center">
        <button
          onClick={() => { dismissId(pending.item.id); setPending(null); }}
          className="text-body-sm text-ink-soft underline cursor-pointer"
        >
          I'll do it later
        </button>
      </div>
    </Modal>
  );
}
