import { useState } from "react";
// TODO: replace with mock
const submitReport = async () => {};

const REASONS = [
  { value: "spam", label: "Spam" },
  { value: "inappropriate", label: "Inappropriate content" },
  { value: "scam", label: "Scam / phishing" },
  { value: "closed", label: "Closed / incorrect info" },
  { value: "other", label: "Other" },
];

export default function ReportModal({ open, onClose, targetType, targetId }) {
  const [reason, setReason] = useState(null);
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  async function handleSubmit() {
    if (!reason) return;
    setSubmitting(true);
    try {
      await submitReport({ targetType, targetId, reason, note });
      setDone(true);
    } catch (e) {
      // fail silently
    }
    setSubmitting(false);
  }

  function handleClose() {
    setReason(null);
    setNote("");
    setDone(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-200 px-6" onClick={handleClose}>
      <div className="bg-card rounded-2xl p-6 w-full max-w-80 shadow-lg" onClick={(e) => e.stopPropagation()}>
        {done ? (
          <div className="text-center py-4">
            <p className="text-title font-bold text-ink mb-2">Report submitted</p>
            <p className="text-body text-ink-soft mb-4">We'll review and take action. Thank you.</p>
            <button onClick={handleClose} className="px-6 py-2.5 rounded-xl bg-ink text-white font-semibold cursor-pointer">
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-title font-bold text-ink mb-3">Report</h3>
            <div className="space-y-2 mb-4">
              {REASONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setReason(r.value)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-body-sm cursor-pointer transition-colors ${
                    reason === r.value ? "bg-ink/8 font-semibold text-ink" : "hover:bg-ink/4 text-ink-soft"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
            {reason === "other" && (
              <textarea
                className="w-full px-3 py-2 rounded-xl border border-line bg-paper text-ink text-body-sm resize-none mb-4"
                rows={2}
                placeholder="Details (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
              />
            )}
            <div className="flex gap-2">
              <button onClick={handleClose} className="flex-1 py-2.5 rounded-xl border border-line text-ink-soft font-semibold text-body cursor-pointer">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!reason || submitting}
                className="flex-1 py-2.5 rounded-xl bg-flame-red text-white font-semibold text-body cursor-pointer disabled:opacity-50"
              >
                {submitting ? "..." : "Report"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
