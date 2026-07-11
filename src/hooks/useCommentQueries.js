import { useState, useEffect } from "react";
import { mockComments, DEMO_USER_ID } from "../mocks/data";

const store = { items: [...mockComments], version: 0 };
const listeners = new Set();
function notify() {
  store.version++;
  listeners.forEach((fn) => fn(store.version));
}

export function useCommentsInfinite(meetingId, homemealId) {
  const [, setVer] = useState(0);
  useEffect(() => {
    const handler = (v) => setVer(v);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  const filtered = store.items.filter((c) => {
    if (meetingId) return c.meeting_id === meetingId;
    if (homemealId) return c.homemeal_id === homemealId;
    return false;
  });
  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function useAddComment(meetingId, homemealId) {
  return {
    mutateAsync: async ({ content }) => {
      const now = new Date().toISOString();
      store.items.push({
        id: `cmt-mock-${Date.now()}`,
        meeting_id: meetingId || null,
        homemeal_id: homemealId || null,
        user_id: DEMO_USER_ID,
        content,
        created_at: now,
        updated_at: now,
        deleted_at: null,
        user: { id: DEMO_USER_ID, nickname: "mealbuddy" },
      });
      notify();
    },
  };
}

export function useUpdateComment(meetingId, homemealId) {
  return {
    mutateAsync: async ({ commentId, content }) => {
      const comment = store.items.find((c) => c.id === commentId);
      if (!comment) return;
      comment.content = content;
      comment.updated_at = new Date().toISOString();
      notify();
    },
  };
}

export function useDeleteComment(meetingId, homemealId) {
  return {
    mutateAsync: async ({ commentId }) => {
      store.items = store.items.filter((c) => c.id !== commentId);
      notify();
    },
  };
}
