import { mockMeetings } from "../mocks/data";

export function useMeetingsInfinite(cityId, filter) {
  let filtered = mockMeetings.filter((m) => m.city_id === cityId);
  if (filter && filter !== "all") filtered = filtered.filter((m) => m.kind === filter);
  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function useCreateMeeting() {
  return { mutateAsync: async () => {}, isPending: false };
}

export function useUpdateMeeting() {
  return { mutateAsync: async () => {} };
}

export function useJoinMeeting() {
  return { mutateAsync: async () => {} };
}

export function useLeaveMeeting() {
  return { mutateAsync: async () => {} };
}
