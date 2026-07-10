import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { CaretLeft } from "../components/icons";
import usePageTitle from "../hooks/usePageTitle";
import Card from "../components/Card";
import ConfirmModal from "../components/ConfirmModal";
import AlertBanner from "../components/AlertBanner";
import { useNotificationsInfinite, invalidateNotifications } from "../hooks/useNotificationQueries";
import useInfiniteScrollObserver from "../hooks/useInfiniteScrollObserver";

export default function NotificationsPage({ onBack }) {
  usePageTitle("Notifications");
  const navigate = useNavigate();
  const { user, checkUnread, basePath } = useAuth();
  const [handoverConfirm, setHandoverConfirm] = useState(null);
  const [handoverLoading, setHandoverLoading] = useState(false);
  const [alert, setAlert] = useState({ open: false, type: "success", message: "" });

  const {
    data, isLoading: loading, isFetchingNextPage: loadingMore,
    fetchNextPage, hasNextPage,
  } = useNotificationsInfinite(user?.id);
  const notifications = data?.pages?.flat() ?? [];
  const sentinelRef = useInfiniteScrollObserver(fetchNextPage, hasNextPage, loadingMore);

  async function markRead(id) {
    // TODO: replace with mock data
    invalidateNotifications(user.id);
    checkUnread(user.id);
  }

  async function handleAcceptHandover() {
    // TODO: replace with mock data
    setAlert({ open: true, type: "info", message: "This feature is not connected yet." });
    setHandoverLoading(false);
    setHandoverConfirm(null);
  }

  return (
    <div className="px-4 pt-24 md:py-16 pb-40">
      <button onClick={onBack} className="text-ink-soft p-1 mb-4 inline-flex items-center gap-1 cursor-pointer hover:text-ink">
        <CaretLeft size={18} /> Go back
      </button>
      <h2 className="text-heading font-bold text-ink mb-5">Notifications</h2>

      {loading ? (
        <div className="text-center text-body text-ink-soft py-12">Loading...</div>
      ) : notifications.length === 0 ? (
        <Card className="text-center text-body text-ink-soft py-8 mt-8">
          No notifications yet
        </Card>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`cursor-pointer ${n.read ? "" : "bg-paper2"}`}
              onClick={() => {
                if (n.type === "handover") return;
                if (!n.read) markRead(n.id);
                if (n.meeting_id) navigate(`${basePath}/together/${n.meeting_id}`);
                else if (n.homemeal_id) navigate(`${basePath}/homemeal/${n.homemeal_id}`);
              }}
            >
              <div className="flex items-start gap-3">
                {!n.read && <span className="w-2 h-2 rounded-full bg-flame-red mt-1.5 shrink-0" />}
                <div className="flex-1">
                  <p className="text-body text-ink">{n.message}</p>
                  <p className="text-tag text-ink-soft mt-1">
                    {new Date(n.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </p>
                  {n.type === "handover" && !n.read && (
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={(e) => { e.stopPropagation(); setHandoverConfirm(n); }}
                        className="px-3 py-1.5 rounded-lg bg-ember text-white text-tag font-bold cursor-pointer hover:bg-ember-deep transition-colors"
                      >
                        I'll take it
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); markRead(n.id); }}
                        className="px-3 py-1.5 rounded-lg bg-ink/6 text-ink-soft text-tag font-bold cursor-pointer hover:bg-ink/10 transition-colors"
                      >
                        No thanks
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
          <div ref={sentinelRef} />
          {loadingMore && <div className="text-center text-meta text-ink-soft py-4">Loading...</div>}
        </div>
      )}

      <ConfirmModal
        open={!!handoverConfirm}
        onClose={() => setHandoverConfirm(null)}
        onConfirm={handleAcceptHandover}
        title="Take over as host?"
        message={handoverConfirm?.homemeal_id
          ? "As host, you'll manage the meetup and need to enter a new address. You'll also receive an Ember bonus (+3) when the meetup is completed."
          : "As host, you'll manage the meetup. You'll receive an Ember bonus (+3) when it's completed."}
        confirmText={handoverLoading ? "Processing..." : "I'll take it"}
        cancelText="No thanks"
        confirmColor="bg-ember"
      />

      <AlertBanner open={alert.open} type={alert.type} message={alert.message}
        onClose={() => setAlert((a) => ({ ...a, open: false }))} />
    </div>
  );
}
