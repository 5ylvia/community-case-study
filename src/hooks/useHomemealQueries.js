// TODO: replace with mock
// Dead imports removed: fetchHomemeals, createHomemeal, updateHomemeal, joinHomemeal, leaveHomemeal from "../lib/api/homemeals"

export function useHomemealsInfinite(cityId, filter) {
  return { data: { pages: [] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function invalidateHomemeals() {
  // TODO: replace with mock
}

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
