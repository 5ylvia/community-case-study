// TODO: replace with mock
// Dead imports removed: fetchCities, fetchSuburbs, fetchBadges, fetchRanking,
//   fetchMyHosted, fetchMyJoined, updateProfile, selectCity from "../lib/api/profile"

export function useCities() {
  return { data: [], isLoading: false };
}

export function useSuburbs(cityId) {
  return { data: [], isLoading: false };
}

export function useBadges(userId) {
  return { data: [], isLoading: false };
}

export function useRanking(cityId) {
  return { data: [], isLoading: false };
}

export function useMyHosted(userId) {
  return { data: { meetings: [], homemeals: [], recos: [] }, isLoading: false };
}

export function useMyJoined(userId) {
  return { data: { meetings: [], homemeals: [] }, isLoading: false };
}

export function useUpdateProfile() {
  return { mutateAsync: async () => {} };
}

export function useSelectCity() {
  return { mutateAsync: async () => {} };
}

export function invalidateMyActivity() {
  // TODO: replace with mock
}
