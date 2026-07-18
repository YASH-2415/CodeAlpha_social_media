import { useState, useEffect, useCallback } from 'react';
import PostCard from '../components/PostCard';
import { SkeletonLoader } from '../components/LoadingSpinner';
import { LoadingSpinner } from '../components/LoadingSpinner';
import postService from '../services/postService';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import './HomePage.css';

export default function HomePage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [feedType, setFeedType] = useState('all');

  const fetchPosts = useCallback(async () => {
    if (loading && page > 1) return;
    try {
      const params = { page, limit: 10 };
      if (feedType === 'feed') params.type = 'feed';

      const data = feedType === 'trending'
        ? await postService.getTrending({ limit: 20 })
        : await postService.getPosts(params);

      const newPosts = data.posts || [];

      if (page === 1) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }

      if (feedType === 'trending') {
        setHasMore(false);
      } else {
        setHasMore(page < data.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch posts');
    } finally {
      setLoading(false);
    }
  }, [page, feedType]);

  useEffect(() => {
    setPage(1);
    setPosts([]);
    setHasMore(true);
    setLoading(true);
  }, [feedType]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const loadMore = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const { ref: loadMoreRef } = useInfiniteScroll(loadMore, hasMore, loading);

  const handleDeletePost = (postId) => {
    setPosts(prev => prev.filter(p => p._id !== postId));
  };

  const handlePostCreated = (newPost) => {
    setPosts(prev => [newPost, ...prev]);
  };

  // Expose for parent
  window.__addPost = handlePostCreated;

  return (
    <div className="home-page">
      <div className="feed-tabs">
        <button
          className={`feed-tab ${feedType === 'all' ? 'active' : ''}`}
          onClick={() => setFeedType('all')}
        >
          All Posts
        </button>
        <button
          className={`feed-tab ${feedType === 'feed' ? 'active' : ''}`}
          onClick={() => setFeedType('feed')}
        >
          Following
        </button>
        <button
          className={`feed-tab ${feedType === 'trending' ? 'active' : ''}`}
          onClick={() => setFeedType('trending')}
        >
          Trending
        </button>
      </div>

      <div className="posts-feed">
        {loading && page === 1 ? (
          <SkeletonLoader type="post" count={3} />
        ) : posts.length === 0 ? (
          <div className="empty-feed">
            <h3>No posts yet</h3>
            <p>
              {feedType === 'feed'
                ? 'Follow some users to see their posts here!'
                : 'Be the first to share something!'}
            </p>
          </div>
        ) : (
          <>
            {posts.map(post => (
              <PostCard key={post._id} post={post} onDelete={handleDeletePost} />
            ))}
            {hasMore && (
              <div ref={loadMoreRef}>
                <LoadingSpinner size="sm" />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
