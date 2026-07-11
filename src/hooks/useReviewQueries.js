import { useState, useEffect } from "react";
import { mockReviews, DEMO_USER_ID } from "../mocks/data";

const store = { items: [...mockReviews], version: 0 };
const listeners = new Set();
function notify() {
  store.version++;
  listeners.forEach((fn) => fn(store.version));
}

export function useMyReviews(meetingId, homemealId, userId) {
  const [, setVer] = useState(0);
  useEffect(() => {
    const handler = (v) => setVer(v);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const filtered = store.items.filter((r) => {
    if (meetingId && r.meeting_id === meetingId && r.from_id === userId) return true;
    if (homemealId && r.homemeal_id === homemealId && r.from_id === userId) return true;
    return false;
  });
  return { data: filtered, isLoading: false };
}

export function useSubmitReview(meetingId, homemealId, userId) {
  return {
    mutateAsync: async ({ fromId, toId, points, reason }) => {
      store.items.push({
        id: `review-mock-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        meeting_id: meetingId || null,
        homemeal_id: homemealId || null,
        from_id: fromId,
        to_id: toId,
        type: points > 0 ? "plus" : "minus",
        points,
        reason: reason || null,
        created_at: new Date().toISOString(),
      });
      notify();
    },
  };
}
