import { mockRecos } from "../mocks/data";

export function useRecosInfinite(cityId, category) {
  let filtered = mockRecos.filter((r) => r.city_id === cityId);
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
  return { mutateAsync: async () => {} };
}
