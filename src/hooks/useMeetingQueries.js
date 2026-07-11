import { useState, useEffect } from "react";
import { mockMeetings } from "../mocks/data";

const store = { items: mockMeetings, version: 0 };
const listeners = new Set();
function notify() {
  store.version++;
  listeners.forEach((fn) => fn(store.version));
}

export function useMeetingsInfinite(cityId, filter) {
  const [, setVer] = useState(0);
  useEffect(() => {
    const handler = (v) => setVer(v);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  let filtered = store.items.filter((m) => m.city_id === cityId);
  if (filter && filter !== "all") filtered = filtered.filter((m) => m.kind === filter);

  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function useCreateMeeting() {
  return { mutateAsync: async () => {}, isPending: false };
}

export function useUpdateMeeting() {
  return { mutateAsync: async () => {} };
}

export function useJoinMeeting() {
  return {
    mutateAsync: async ({ meetingId, userId, status }) => {
      const item = store.items.find((m) => m.id === meetingId);
      if (!item) return;
      if (item.meeting_participants.some((p) => p.user_id === userId)) return;
      const user = { id: userId, nickname: "mealbuddy" };
      item.meeting_participants.push({
        id: `mp-mock-${Date.now()}`,
        user_id: userId,
        status: status || "joined",
        user,
      });
      notify();
    },
  };
}

export function useLeaveMeeting() {
  return {
    mutateAsync: async ({ meetingId, userId }) => {
      const item = store.items.find((m) => m.id === meetingId);
      if (!item) return;
      item.meeting_participants = item.meeting_participants.filter((p) => p.user_id !== userId);
      notify();
    },
  };
}
