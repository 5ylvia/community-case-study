import { useNavigate } from "react-router-dom";
import { CaretLeft } from "../components/icons";
import symbol from "../assets/symbol.svg";

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center px-4 text-center">
      <img src={symbol} alt="Dajeong" className="h-16 mb-6 opacity-30" />
      <h1 className="text-heading font-bold text-ink mb-2">Page not found</h1>
      <p className="text-body text-ink-soft mb-6">We couldn't find the page you're looking for. Please check the URL and try again.</p>
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1 px-4 py-2.5 rounded-lg bg-ink text-white text-body-sm font-bold cursor-pointer hover:-translate-y-0.5 hover:shadow-md transition-all"
      >
        <CaretLeft size={14} /> Go back
      </button>
    </div>
  );
}
