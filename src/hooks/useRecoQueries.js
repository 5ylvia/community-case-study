// TODO: replace with mock
// Dead imports removed: fetchRecos, createReco, updateReco, toggleAgree from "../lib/api/recos"

export function useRecosInfinite(cityId, category) {
  return { data: { pages: [] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
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
