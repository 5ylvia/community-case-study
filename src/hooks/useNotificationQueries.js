// TODO: replace with mock
// Dead imports removed: fetchNotifications from "../lib/api/notifications"

export function useNotificationsInfinite(userId) {
  return { data: { pages: [] }, isLoading: false, isFetchingNextPage: false, fetchNextPage: () => {}, hasNextPage: false };
}

export function invalidateNotifications(userId) {
  // TODO: replace with mock
}
