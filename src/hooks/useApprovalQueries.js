// Dead imports removed: getWaitlist, approveParticipant, rejectParticipant from "../lib/api/approval"

export function useWaitlist(meetingId, homemealId) {
  return { data: [], isLoading: false };
}

export function useApproveParticipant(meetingId, homemealId) {
  return { mutateAsync: async () => {} };
}

export function useRejectParticipant(meetingId, homemealId) {
  return { mutateAsync: async () => {} };
}
