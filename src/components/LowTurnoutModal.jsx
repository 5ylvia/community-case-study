import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth";
const checkLowTurnout = async () => [];
const cancelLowTurnout = async () => {};
import { invalidateMyActivity } from "../hooks/useProfileQueries";
import { queryClient } from "../lib/queryClient";
import { queryKeys } from "../lib/queryKeys";
import ConfirmModal from "./ConfirmModal";

export default function LowTurnoutModal() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [current, setCurrent] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    if (!user) return;
    check();
  }, [user]);

  async function check() {
    const results = await checkLowTurnout(user.id);
    if (results.length) {
      setItems(results);
      setCurrent(results[0]);
    }
  }

  function handleProceed() {
    // proceed — move to next item
    const remaining = items.filter(i => i.id !== current.id);
    setItems(remaining);
    setCurrent(remaining[0] || null);
  }

  function handleCancelClick() {
    const hasParticipants = current.joined > 1;
    setConfirm({
      title: "Cancel gathering",
      message: hasParticipants
        ? `Cancel "${current.title}" due to low turnout?\nParticipants will be notified.`
        : `Cancel "${current.title}"?`,
      confirmText: "Yes, cancel",
      cancelText: "Go back",
      confirmColor: "bg-flame-red",
    });
  }

  async function handleConfirmCancel() {
    const meetingId = current.type === "meeting" ? current.id : null;
    const homemealId = current.type === "homemeal" ? current.id : null;
    await cancelLowTurnout(meetingId, homemealId);
    invalidateMyActivity();
    queryClient.invalidateQueries({ queryKey: queryKeys.meetings.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.homemeals.all });
    setConfirm(null);
    handleProceed();
  }

  if (!current) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-200 px-6" onClick={handleProceed}>
        <div className="bg-card rounded-2xl p-6 w-full max-w-80 shadow-lg" onClick={(e) => e.stopPropagation()}>
          <p className="text-heading font-bold text-ink mb-2">Not enough people yet</p>
          <p className="text-body-sm text-ink-soft leading-relaxed mb-5 whitespace-pre-line">
            <b className="text-ink">"{current.title}"</b> {current.joined <= 1 ? "has no one signed up yet." : `has ${current.joined - 1} people so far.`}{"\n"}At least {current.minCapacity - 1} {current.minCapacity - 1 === 1 ? "person is" : "people are"} needed.
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleCancelClick}
              className="py-2.5 rounded-lg bg-card border border-line text-ink-soft font-bold text-body-sm hover:-translate-y-0.5 transition-all cursor-pointer"
            >
              <span className="hidden md:inline">Unfortunately, </span>cancel
            </button>
            <button
              onClick={handleProceed}
              className="py-2.5 rounded-lg bg-ember text-white font-bold text-body-sm hover:bg-ember-deep transition-colors cursor-pointer"
            >
              <span className="hidden md:inline">Still </span>proceed
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirmCancel}
        {...(confirm || {})}
      />
    </>
  );
}
