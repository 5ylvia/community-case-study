// TODO: replace with mock
// Dead imports removed: getMyReviews, submitReview from "../lib/api/reviews"

export function useMyReviews(meetingId, homemealId, userId) {
  return { data: [], isLoading: false };
}

export function useSubmitReview(meetingId, homemealId, userId) {
  return { mutateAsync: async () => {} };
}
