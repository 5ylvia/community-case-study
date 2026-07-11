import { useState, useMemo } from "react";
import { mockRecos } from "../mocks/data";

const store = { items: [...mockRecos] };
const listeners = new Set();
function notify() { listeners.forEach((fn) => fn({})); }

export function useRecosInfinite(cityId, category) {
  const [, rerender] = useState({});
  useState(() => { listeners.add(rerender); return () => listeners.delete(rerender); });

  const filtered = useMemo(() => {
    let result = store.items.filter((r) => r.city_id === cityId);
    if (category && category !== "all") result = result.filter((r) => r.category === category);
    return result;
  }, [cityId, category, store.items]);

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
