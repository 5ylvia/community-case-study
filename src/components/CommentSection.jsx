import { useState } from "react";
import { Trash, Pencil, WarningCircle } from "./icons";
import { useAuth } from "../lib/auth";
import { useCommentsInfinite, useAddComment, useUpdateComment, useDeleteComment } from "../hooks/useCommentQueries";
import { inputClass } from "./FormField";
import ReportModal from "./ReportModal";

const EDIT_WINDOW = 15 * 60 * 1000;

export default function CommentSection({ meetingId, homemealId, hostId }) {
  const { user } = useAuth();
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [lastSentAt, setLastSentAt] = useState(0);
  const [reportTarget, setReportTarget] = useState(null);

  const {
    data, isLoading: initialLoading, isFetchingNextPage: loadingMore,
    fetchNextPage, hasNextPage,
  } = useCommentsInfinite(meetingId, homemealId);
  const comments = [...(data?.pages?.flat() ?? [])].reverse();

  const addMutation = useAddComment(meetingId, homemealId);
  const updateMutation = useUpdateComment(meetingId, homemealId);
  const deleteMutation = useDeleteComment(meetingId, homemealId);

  async function handleSend() {
    if (!text.trim() || !user || sending) return;
    if (Date.now() - lastSentAt < 3000) return; // 3s cooldown
    setSending(true);
    setLastSentAt(Date.now());
    try {
      await addMutation.mutateAsync({ userId: user.id, content: text.trim() });
      setText("");
    } catch (e) { /* keep text — allow retry */ }
    setSending(false);
  }

  function startEdit(c) {
    setEditingId(c.id);
    setEditText(c.content);
  }

  async function handleEdit(id) {
    if (!editText.trim()) return;
    try {
      await updateMutation.mutateAsync({ id, content: editText.trim() });
      setEditingId(null);
      setEditText("");
    } catch (e) { /* keep edit state — allow retry */ }
  }

  async function handleDelete(id) {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (e) { /* delete failed — ignore */ }
  }

  function canEdit(c) {
    return c.user_id === user?.id && (Date.now() - new Date(c.created_at).getTime()) < EDIT_WINDOW;
  }

  function timeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    return `${days}d ago`;
  }

  return (
    <div className="pt-3 border-t border-line transition-all duration-200" onClick={(e) => e.stopPropagation()}>
      {/* Input */}
      {user ? (
        <div className="flex gap-2 mb-3">
          <input
            className={inputClass + " flex-1 !py-2 !text-body-sm"}
            placeholder="Leave a comment"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            maxLength={200}
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="px-3 py-2 rounded-lg bg-ink text-white text-tag font-bold shrink-0 disabled:opacity-50 cursor-pointer"
          >
            {sending ? "..." : "Post"}
          </button>
        </div>
      ) : (
        <p className="text-body-sm text-ink-soft/50 text-center mb-3">Log in to leave a comment</p>
      )}

      {/* Loading */}
      {initialLoading && <div className="text-center text-tag text-ink-soft py-1 animate-pulse">···</div>}

      {/* Comment list */}
      {!initialLoading && comments.length > 0 && (
        <div className="space-y-2 animate-[fadeIn_200ms_ease-in]">
          {hasNextPage && (
            <button
              onClick={() => fetchNextPage()}
              disabled={loadingMore}
              className="text-body-sm text-ink-soft underline cursor-pointer"
            >
              {loadingMore ? "Loading..." : "Show earlier comments"}
            </button>
          )}
          {comments.map((c) => (
            <div key={c.id} className="flex gap-2">
              <span className={`w-5 h-5 rounded-full text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0 mt-0.5 ${c.user_id === hostId ? "bg-ember-deep" : "bg-ink-soft"}`}>
                {c.user?.nickname?.[0] || "?"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-tag font-semibold text-ink">{c.user?.nickname || "Unknown"}</span>
                  <span className="text-tag text-ink-soft/50">{timeAgo(c.created_at)}</span>
                </div>
                {editingId === c.id ? (
                  <div className="flex gap-1.5 mt-1">
                    <input
                      className={inputClass + " flex-1 !py-1.5 !text-body-sm"}
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleEdit(c.id)}
                      maxLength={200}
                      autoFocus
                    />
                    <button onClick={() => handleEdit(c.id)} className="text-body-sm font-bold text-ink cursor-pointer">Save</button>
                    <button onClick={() => setEditingId(null)} className="text-body-sm text-ink-soft cursor-pointer">Cancel</button>
                  </div>
                ) : (
                  <p className="text-body-sm text-ink leading-snug">{c.content}</p>
                )}
              </div>
              {editingId !== c.id && (
                <div className="flex items-center gap-0.5 shrink-0">
                  {c.user_id === user?.id ? (
                    <>
                      {canEdit(c) && (
                        <button onClick={() => startEdit(c)} className="text-ink-soft/40 hover:text-ink shrink-0 p-1 cursor-pointer">
                          <Pencil size={14} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(c.id)} className="text-ink-soft/40 hover:text-flame-red shrink-0 p-1 cursor-pointer">
                        <Trash size={14} />
                      </button>
                    </>
                  ) : user && (
                    <button onClick={() => setReportTarget(c.id)} className="text-ink-soft/20 hover:text-flame-red shrink-0 p-1 cursor-pointer" title="Report">
                      <WarningCircle size={14} />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      <ReportModal
        open={!!reportTarget}
        onClose={() => setReportTarget(null)}
        targetType="comment"
        targetId={reportTarget}
      />
    </div>
  );
}
