import { mockReviews } from "../mocks/data";

export function useMyReviews(meetingId, homemealId, userId) {
  return { data: [], isLoading: false };
}

export function useSubmitReview(meetingId, homemealId, userId) {
  return { mutateAsync: async () => {} };
}
