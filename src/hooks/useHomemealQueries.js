import { mockHomemeals } from "../mocks/data";

export function useHomemealsInfinite(cityId, filter) {
  let filtered = mockHomemeals.filter((h) => h.city_id === cityId);
  if (filter && filter !== "all") filtered = filtered.filter((h) => h.kind === filter);
  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function invalidateHomemeals() {}

export function useCreateHomemeal() {
  return { mutateAsync: async () => {}, isPending: false };
}

export function useUpdateHomemeal() {
  return { mutateAsync: async () => {} };
}

export function useJoinHomemeal() {
  return { mutateAsync: async () => {} };
}

export function useLeaveHomemeal() {
  return { mutateAsync: async () => {} };
}
