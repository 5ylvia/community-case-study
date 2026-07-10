import { useWaitlist, useApproveParticipant, useRejectParticipant } from "../hooks/useApprovalQueries";

export default function WaitlistSection({ meetingId, homemealId, title }) {
  const { data: waitlist = [] } = useWaitlist(meetingId, homemealId);
  const approveMutation = useApproveParticipant(meetingId, homemealId);
  const rejectMutation = useRejectParticipant(meetingId, homemealId);

  async function handleApprove(item) {
    try {
      const table = meetingId ? "meeting_participants" : "homemeal_participants";
      await approveMutation.mutateAsync({ table, id: item.id, userId: item.user_id, title });
    } catch (e) { /* mutation handles cache invalidation */ }
  }

  async function handleReject(item) {
    try {
      const table = meetingId ? "meeting_participants" : "homemeal_participants";
      await rejectMutation.mutateAsync({ table, id: item.id, userId: item.user_id, title });
    } catch (e) { /* mutation handles cache invalidation */ }
  }

  if (waitlist.length === 0) return null;

  return (
    <div className="mt-3 pt-3 border-t border-line" onClick={(e) => e.stopPropagation()}>
      <span className="text-body-sm font-bold text-ink mb-2 block">Waitlist requests: {waitlist.length}</span>
      <div className="space-y-2">
        {waitlist.map((w) => {
          const nickname = w.user?.nickname || "Unknown";
          return (
            <div key={w.id} className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-ink-soft text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
                {nickname[0]}
              </span>
              <span className="text-body-sm text-ink flex-1">{nickname}</span>
              <div className="flex gap-1">
                <button
                  onClick={() => handleApprove(w)}
                  className="px-2.5 py-1 rounded-lg text-tag font-bold text-herb bg-herb/10 border border-herb/20 cursor-pointer hover:-translate-y-0.5 transition-all"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReject(w)}
                  className="px-2.5 py-1 rounded-lg text-tag font-bold text-ink-soft bg-ink/6 border border-line cursor-pointer hover:-translate-y-0.5 transition-all"
                >
                  Decline
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
