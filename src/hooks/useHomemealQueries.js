import { useState, useEffect, useCallback } from "react";
import { mockHomemeals } from "../mocks/data";

// Shared mutable store
const store = { items: mockHomemeals, version: 0 };
const listeners = new Set();
function notify() {
  store.version++;
  listeners.forEach((fn) => fn(store.version));
}

export function useHomemealsInfinite(cityId, filter) {
  const [, setVer] = useState(0);
  useEffect(() => {
    const handler = (v) => setVer(v);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  let filtered = store.items.filter((h) => h.city_id === cityId && !h.cancelled && !h.deleted_at);
  if (filter && filter !== "all") filtered = filtered.filter((h) => h.kind === filter);

  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function invalidateHomemeals() { notify(); }

export function useCreateHomemeal() {
  return {
    mutateAsync: async (data) => {
      const id = `hm-new-${Date.now()}`;
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
        share_at: data.share_at,
        capacity: data.capacity,
        min_capacity: data.min_capacity,
        budget: null,
        host_id: data.host_id,
        completed: false,
        review_closed: false,
        cancelled: false,
        deleted_at: null,
        comment_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        host: { id: data.host_id, nickname: "mealbuddy", flame_score: 72 },
        suburb: data.suburb_id ? { id: data.suburb_id, name: "" } : null,
        claims: [
          { id: `hmp-new-${Date.now()}`, user_id: data.host_id, status: "joined", user: { id: data.host_id, nickname: "mealbuddy" } },
        ],
      });
      notify();
    },
    isPending: false,
  };
}

export function useUpdateHomemeal() {
  return { mutateAsync: async () => {} };
}

export function useJoinHomemeal() {
  return {
    mutateAsync: async ({ homemealId, userId, status }) => {
      const item = store.items.find((h) => h.id === homemealId);
      if (!item) return;
      if (item.claims.some((c) => c.user_id === userId)) return;
      const user = { id: userId, nickname: "mealbuddy" };
      item.claims.push({
        id: `hmp-mock-${Date.now()}`,
        user_id: userId,
        status: status || "joined",
        user,
      });
      notify();
    },
  };
}

export function useLeaveHomemeal() {
  return {
    mutateAsync: async ({ homemealId, userId }) => {
      const item = store.items.find((h) => h.id === homemealId);
      if (!item) return;
      item.claims = item.claims.filter((c) => c.user_id !== userId);
      notify();
    },
  };
}
