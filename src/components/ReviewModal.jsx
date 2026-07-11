import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
import { mockHomemeals, mockMeetings } from "../mocks/data";
import { useMyReviews } from "../hooks/useReviewQueries";
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
    const dismissed = getDismissedIds();

    // Find completed homemeals where user is a participant and hasn't been dismissed
    const pendingHomemeal = mockHomemeals.find((h) =>
      h.completed && !h.review_closed && !dismissed.includes(h.id) &&
      h.claims?.some((c) => c.user_id === user.id)
    );
    if (pendingHomemeal) {
      setPending({
        type: "homemeal",
        item: pendingHomemeal,
        participants: pendingHomemeal.claims.filter((c) => c.status === "joined"),
        hostNickname: pendingHomemeal.host?.nickname || "Host",
      });
      return;
    }

    // Find completed meetings
    const pendingMeeting = mockMeetings.find((m) =>
      m.completed && !m.review_closed && !dismissed.includes(m.id) &&
      m.meeting_participants?.some((p) => p.user_id === user.id)
    );
    if (pendingMeeting) {
      setPending({
        type: "meeting",
        item: pendingMeeting,
        participants: pendingMeeting.meeting_participants.filter((p) => p.status === "joined"),
        hostNickname: pendingMeeting.host?.nickname || "Host",
      });
    }
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
        onComplete={() => { dismissId(pending.item.id); setPending(null); }}
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
