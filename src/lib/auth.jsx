import { createContext, useContext, useState } from "react";
import { DEMO_USER_ID, mockProfiles, mockCities } from "../mocks/data";

const AuthContext = createContext(null);

const demoProfile = (() => {
  const p = mockProfiles.find((p) => p.id === DEMO_USER_ID);
  if (!p) return null;
  const city = mockCities.find((c) => c.id === p.city_id);
  return { ...p, cities: city ? { id: city.id, name: city.name, country: city.country } : null };
})();

export function AuthProvider({ children }) {
  const [user] = useState({ id: DEMO_USER_ID });
  const [profile] = useState(demoProfile);
  const [guest, setGuest] = useState(false);
  const [viewCityId, setViewCityId] = useState(null);
  const [viewCitySlug, setViewCitySlug] = useState("");
  const [hasUnread] = useState(true);

  const basePath = viewCitySlug || (profile?.cities
    ? `/${profile.cities.name.toLowerCase().replace(/\s+/g, "-")}`
    : "");

  function signUp() {
    return Promise.resolve({ data: null, error: { message: "Auth not configured" } });
  }

  function signIn() {
    return Promise.resolve({ data: null, error: { message: "Auth not configured" } });
  }

  function signOut() {
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
    return Promise.resolve();
  }

  function checkUnread() {}

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
