import { useState, useMemo } from "react";
import { mockHomemeals } from "../mocks/data";

// Shared mutable store so join/leave persists across re-renders
const store = { items: [...mockHomemeals] };
const listeners = new Set();
function notify() { listeners.forEach((fn) => fn({})); }

export function useHomemealsInfinite(cityId, filter) {
  const [, rerender] = useState({});
  useState(() => { listeners.add(rerender); return () => listeners.delete(rerender); });

  const filtered = useMemo(() => {
    let result = store.items.filter((h) => h.city_id === cityId);
    if (filter && filter !== "all") result = result.filter((h) => h.kind === filter);
    return result;
  }, [cityId, filter, store.items]);

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
      // Don't add duplicates
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
