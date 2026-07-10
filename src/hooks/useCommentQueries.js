// TODO: replace with mock
// Dead imports removed: fetchComments, addComment, updateComment, deleteComment from "../lib/api/comments"

export function useCommentsInfinite(meetingId, homemealId) {
  return { data: { pages: [] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
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
