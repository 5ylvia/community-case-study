// TODO: replace with mock
// Dead imports removed: fetchMeetings, createMeeting, updateMeeting, joinMeeting, leaveMeeting from "../lib/api/meetings"

export function useMeetingsInfinite(cityId, filter) {
  return { data: { pages: [] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
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
