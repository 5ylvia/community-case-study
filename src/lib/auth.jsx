import { createContext, useContext, useState } from "react";

// TODO: replace with real auth provider (Supabase removed)

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user] = useState(null);
  const [profile] = useState(null);
  const [guest, setGuest] = useState(false);
  const [viewCityId, setViewCityId] = useState(null);
  const [viewCitySlug, setViewCitySlug] = useState("");
  const [hasUnread] = useState(false);

  const basePath = viewCitySlug || "";

  function signUp() {
    // TODO: replace with mock data
    return Promise.resolve({ data: null, error: { message: "Auth not configured" } });
  }

  function signIn() {
    // TODO: replace with mock data
    return Promise.resolve({ data: null, error: { message: "Auth not configured" } });
  }

  function signOut() {
    // TODO: replace with mock data
    return Promise.resolve();
  }

  function enterGuest(cityId, slug) {
    setGuest(true);
    setViewCityId(cityId);
    setViewCitySlug(slug || "");
  }

  function exitGuest() {
    setGuest(false);
    setViewCityId(null);
    setViewCitySlug("");
  }

  function fetchProfile() {
    // TODO: replace with mock data
    return Promise.resolve();
  }

  function checkUnread() {
    // TODO: replace with mock data
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      profileError: null,
      guest,
      enterGuest,
      exitGuest,
      signUp,
      signIn,
      signOut,
      fetchProfile,
      viewCityId,
      setViewCityId,
      setViewCitySlug,
      activeCityId: viewCityId || profile?.city_id,
      basePath,
      hasUnread,
      checkUnread,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
