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

  let filtered = store.items.filter((h) => h.city_id === cityId);
  if (filter && filter !== "all") filtered = filtered.filter((h) => h.kind === filter);

  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function invalidateHomemeals() { notify(); }

export function useCreateHomemeal() {
  return { mutateAsync: async () => {}, isPending: false };
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
