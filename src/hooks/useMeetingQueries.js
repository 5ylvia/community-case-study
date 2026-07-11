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
  return {
    mutateAsync: async (data) => {
      const id = `meet-new-${Date.now()}`;
      const slug = data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30) + "-" + Math.random().toString(36).slice(2, 6);
      store.items.unshift({
        id,
        slug,
        kind: data.kind,
        title: data.title,
        description: data.description || "",
        city_id: data.city_id,
        suburb_id: data.suburb_id,
        address: data.address,
        meet_at: data.meet_at,
        capacity: data.capacity,
        min_capacity: data.min_capacity,
        budget: null,
        host_id: data.host_id,
        completed: false,
        review_closed: false,
        cancelled: false,
        deleted_at: null,
        comment_count: 0,
        reasons: data.reasons || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        host: { id: data.host_id, nickname: "mealbuddy", flame_score: 72 },
        suburb: data.suburb_id ? { id: data.suburb_id, name: "" } : null,
        meeting_participants: [
          { id: `mp-new-${Date.now()}`, user_id: data.host_id, status: "joined", user: { id: data.host_id, nickname: "mealbuddy" } },
        ],
      });
      notify();
    },
    isPending: false,
  };
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
