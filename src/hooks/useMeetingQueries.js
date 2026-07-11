import { useState, useMemo } from "react";
import { mockMeetings } from "../mocks/data";

const store = { items: [...mockMeetings] };
const listeners = new Set();
function notify() { listeners.forEach((fn) => fn({})); }

export function useMeetingsInfinite(cityId, filter) {
  const [, rerender] = useState({});
  useState(() => { listeners.add(rerender); return () => listeners.delete(rerender); });

  const filtered = useMemo(() => {
    let result = store.items.filter((m) => m.city_id === cityId);
    if (filter && filter !== "all") result = result.filter((m) => m.kind === filter);
    return result;
  }, [cityId, filter, store.items]);

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
