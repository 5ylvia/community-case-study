export default function ConfirmModal({ open, onClose, onConfirm, onHandover, title, message, confirmText = "Confirm", cancelText = "Cancel", confirmColor = "bg-ember", handoverText }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-200 px-6" onClick={onClose}>
      <div
        className="bg-card rounded-2xl p-6 w-full max-w-80 shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-title font-bold text-ink mb-2">{title}</h3>
        <p className="text-body text-ink-soft leading-relaxed mb-4 whitespace-pre-line">
          {message}
          {onHandover && (
            <>
              {" "}Instead of deleting, would you like to{" "}
              <button onClick={() => { onHandover(); onClose(); }} className="text-ember font-bold underline cursor-pointer inline">hand over hosting?</button>
              <span className="block mt-1">The new host will need to enter a new address, and all participants will be notified</span>
            </>
          )}
        </p>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-line text-ink-soft font-semibold text-body cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={() => { onConfirm(); }}
            className={`flex-1 py-2.5 rounded-xl text-white font-semibold text-body cursor-pointer ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
