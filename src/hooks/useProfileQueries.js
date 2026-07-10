import { mockCities, mockSuburbs, mockBadges, mockRankings, mockHomemeals, mockMeetings, mockRecos, mockProfiles } from "../mocks/data";

export function useCities() {
  return { data: mockCities, isLoading: false };
}

export function useSuburbs(cityId) {
  const filtered = mockSuburbs.filter((s) => s.city_id === cityId);
  return { data: filtered, isLoading: false };
}

export function useBadges(userId) {
  const filtered = mockBadges.filter((b) => b.user_id === userId);
  return { data: filtered, isLoading: false };
}

export function useRanking(cityId) {
  const filtered = mockRankings.filter((r) => r.city_id === cityId);
  return { data: filtered, isLoading: false };
}

export function useMyHosted(userId) {
  const meetings = mockMeetings.filter((m) => m.host_id === userId);
  const homemeals = mockHomemeals.filter((h) => h.host_id === userId);
  const recos = mockRecos.filter((r) => r.author_id === userId);
  return { data: { meetings, homemeals, recos }, isLoading: false };
}

export function useMyJoined(userId) {
  const meetings = mockMeetings
    .filter((m) => m.host_id !== userId && m.meeting_participants?.some((p) => p.user_id === userId))
    .map((m) => {
      const myPart = m.meeting_participants.find((p) => p.user_id === userId);
      return { ...m, myStatus: myPart?.status || null };
    });
  const homemeals = mockHomemeals
    .filter((h) => h.host_id !== userId && h.claims?.some((p) => p.user_id === userId))
    .map((h) => {
      const myPart = h.claims.find((p) => p.user_id === userId);
      return { ...h, myStatus: myPart?.status || null };
    });
  return { data: { meetings, homemeals }, isLoading: false };
}

export function useUpdateProfile() {
  return { mutateAsync: async () => {} };
}

export function useSelectCity() {
  return { mutateAsync: async () => {} };
}

export function invalidateMyActivity() {}
