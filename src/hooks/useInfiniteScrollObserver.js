import { useCallback, useRef } from "react";

export default function useInfiniteScrollObserver(fetchNextPage, hasNextPage, isFetchingNextPage) {
  const observerRef = useRef(null);

  const sentinelRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();
      if (!node || !hasNextPage) return;

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      });
      observerRef.current.observe(node);
    },
    [hasNextPage, isFetchingNextPage, fetchNextPage]
  );

  return sentinelRef;
}
