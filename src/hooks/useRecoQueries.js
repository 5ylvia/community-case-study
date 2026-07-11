import { useState, useEffect } from "react";
import { mockRecos } from "../mocks/data";

const store = { items: mockRecos, version: 0 };
const listeners = new Set();
function notify() {
  store.version++;
  listeners.forEach((fn) => fn(store.version));
}

export function useRecosInfinite(cityId, category) {
  const [, setVer] = useState(0);
  useEffect(() => {
    const handler = (v) => setVer(v);
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  let filtered = store.items.filter((r) => r.city_id === cityId);
  if (category && category !== "all") filtered = filtered.filter((r) => r.category === category);

  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function useCreateReco() {
  return { mutateAsync: async () => {}, isPending: false };
}

export function useUpdateReco() {
  return { mutateAsync: async () => {} };
}

export function useToggleAgree() {
  return {
    mutateAsync: async ({ recoId, userId }) => {
      const item = store.items.find((r) => r.id === recoId);
      if (!item) return;
      const idx = item.agrees.findIndex((a) => a.user_id === userId);
      if (idx >= 0) {
        item.agrees.splice(idx, 1);
        item.agree_count = Math.max(0, item.agree_count - 1);
      } else {
        item.agrees.push({ id: `agree-mock-${Date.now()}`, reco_id: recoId, user_id: userId });
        item.agree_count += 1;
      }
      notify();
    },
  };
}
