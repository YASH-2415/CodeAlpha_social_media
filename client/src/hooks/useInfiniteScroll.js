import { useEffect, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';

export function useInfiniteScroll(fetchMore, hasMore, loading) {
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  const handleObserver = useCallback(() => {
    if (inView && hasMore && !loading) {
      fetchMore();
    }
  }, [inView, hasMore, loading, fetchMore]);

  useEffect(() => {
    handleObserver();
  }, [handleObserver]);

  return { ref };
}
