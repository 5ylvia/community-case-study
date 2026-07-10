import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeSlash, MapPin } from "../components/icons";
import { useAuth } from "../lib/auth";
// TODO: replace with mock
const checkNickname = async () => false; // stub: always available
import { useCities } from "../hooks/useProfileQueries";
import FormField, { inputClass } from "../components/FormField";
import Dropdown from "../components/Dropdown";
import symbol from "../assets/symbol.svg";

export default function AuthPage() {
  const navigate = useNavigate();
  const { signUp, signIn, profileError, enterGuest } = useAuth();
  const { data: cities = [] } = useCities();
  const [mode, setMode] = useState("login"); // login | signup | done
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState(profileError || "");
  const [nickError, setNickError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNickError("");
    setLoading(true);

    if (mode === "signup") {
      const isDup = await checkNickname(nickname.trim());
      if (isDup) { setNickError("This nickname is already taken."); setLoading(false); return; }
      const { data, error } = await signUp(email, password, nickname.trim());
      if (error) setError(error.message);
      else if (data?.user?.identities?.length === 0) setError("This email is already registered.");
      else setMode("done");
    } else {
      const { error } = await signIn(email, password);
      if (error) setError("Please check your email or password.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src={symbol} alt="Dajeong" className="h-16 mx-auto mb-3" />
          <h1 className="text-heading font-bold text-ink">Dajeong</h1>
          <p className="text-body text-ink-soft mt-1">Don't eat alone — let's share a meal</p>
        </div>

        {mode === "done" ? (
          <div className="text-center">
            <p className="text-title font-bold text-herb mb-2">Sign-up complete!</p>
            <p className="text-body text-ink-soft mb-6">Please verify your email, then log in</p>
            <button
              onClick={() => { setMode("login"); setEmail(""); setPassword(""); setNickname(""); setError(""); }}
              className="w-full py-3.5 rounded-xl bg-ember text-white font-bold text-title hover:bg-ember-deep transition-colors cursor-pointer"
            >
              Log in
            </button>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit}>
              {mode === "signup" && (
                <FormField label="Nickname">
                  <div className="relative">
                    <input
                      className={inputClass}
                      placeholder="Nickname"
                      value={nickname}
                      onChange={(e) => { setNickname(e.target.value); setNickError(""); }}
                      required
                    />
                    {nickError && <p className="absolute left-0 top-full mt-0.5 text-tag text-flame-red">{nickError}</p>}
                  </div>
                </FormField>
              )}
              <FormField label="Email">
                <input
                  type="email"
                  className={inputClass}
                  placeholder="email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </FormField>
              <FormField label="Password">
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className={inputClass + " pr-10"}
                    placeholder="6+ characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-soft cursor-pointer hover:text-ink"
                  >
                    {showPw ? <EyeSlash size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </FormField>

              {error && <p className="text-body text-flame-red mb-3">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-ember text-white font-bold text-title hover:bg-ember-deep transition-colors cursor-pointer mt-2 disabled:opacity-50"
              >
                {loading ? "..." : mode === "login" ? "Log in" : "Sign up"}
              </button>
            </form>

            <button
              className="w-full text-center mt-4 text-body text-ink-soft underline cursor-pointer"
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(""); }}
            >
              {mode === "login" ? "Don't have an account? Sign up" : "Already have an account? Log in"}
            </button>

            {mode === "login" && cities.some((c) => c.member_count > 0) && (
              <div className="mt-8 pt-6 border-t border-line text-center">
                <p className="text-body-sm text-ink-soft mb-3">Browse without signing up</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {cities.filter((c) => c.member_count > 0).slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        const slug = `/${c.name.toLowerCase().replace(/\s+/g, "-")}`;
                        enterGuest(c.id, slug);
                        navigate(`${slug}/homemeal`);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-line text-body-sm text-ink-soft hover:text-ink hover:border-ink/30 hover:bg-card/50 cursor-pointer transition-all"
                    >
                      <MapPin size={12} /> {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
        <p className="text-center text-tag text-ink-soft/50 mt-8">
          By signing up, you agree to our <a href="/terms" className="underline">Terms of Service and Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
