import { mockNotifications } from "../mocks/data";

export function useNotificationsInfinite(userId) {
  const filtered = mockNotifications.filter((n) => n.user_id === userId);
  return { data: { pages: [filtered] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function invalidateNotifications(userId) {}
