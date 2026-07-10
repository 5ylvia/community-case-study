import { mockComments } from "../mocks/data";

export function useCommentsInfinite(meetingId, homemealId) {
  const filtered = mockComments.filter((c) => {
    if (meetingId) return c.meeting_id === meetingId;
    if (homemealId) return c.homemeal_id === homemealId;
    return false;
  });
  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function useAddComment(meetingId, homemealId) {
  return { mutateAsync: async () => {} };
}

export function useUpdateComment(meetingId, homemealId) {
  return { mutateAsync: async () => {} };
}

export function useDeleteComment(meetingId, homemealId) {
  return { mutateAsync: async () => {} };
}
