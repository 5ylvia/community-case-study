import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export default function LoginModal({ open, onClose }) {
  const navigate = useNavigate();
  const { exitGuest } = useAuth();

  if (!open) return null;

  function goLogin() {
    onClose();
    exitGuest();
    navigate("/login");
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-200 px-6" onClick={onClose}>
      <div
        className="bg-card rounded-2xl p-6 w-full max-w-80 shadow-lg text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="text-title font-bold text-ink mb-2">Login required</p>
        <p className="text-body text-ink-soft leading-relaxed mb-5">
          Please log in to join and share with others
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-line text-ink-soft font-semibold text-body cursor-pointer"
          >
            Just browsing
          </button>
          <button
            onClick={goLogin}
            className="flex-1 py-2.5 rounded-xl bg-ember text-white font-semibold text-body cursor-pointer hover:bg-ember-deep transition-colors"
          >
            Log in
          </button>
        </div>
      </div>
    </div>
  );
}
