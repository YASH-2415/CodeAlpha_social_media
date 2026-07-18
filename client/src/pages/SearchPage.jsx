import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaSearch, FaUsers, FaImage } from 'react-icons/fa';
import searchService from '../services/searchService';
import UserCard from '../components/UserCard';
import PostCard from '../components/PostCard';
import { SkeletonLoader } from '../components/LoadingSpinner';
import './SearchPage.css';

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState({ users: [], posts: [] });
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users');

  useEffect(() => {
    const q = searchParams.get('q');
    if (q) {
      setQuery(q);
      performSearch(q);
    }
  }, [searchParams]);

  const performSearch = async (q) => {
    if (!q.trim()) return;
    setLoading(true);
    try {
      const data = await searchService.search(q);
      setResults(data);
    } catch (error) {
      console.error('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
    }
  };

  return (
    <div className="search-page">
      <form className="search-page-form" onSubmit={handleSubmit}>
        <FaSearch className="search-page-icon" />
        <input
          type="text"
          placeholder="Search users and posts..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      {(results.users.length > 0 || results.posts.length > 0 || loading) && (
        <div className="search-tabs">
          <button
            className={`search-tab ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <FaUsers /> Users ({results.users.length})
          </button>
          <button
            className={`search-tab ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            <FaImage /> Posts ({results.posts.length})
          </button>
        </div>
      )}

      {loading ? (
        <SkeletonLoader type={activeTab === 'users' ? 'user' : 'post'} count={3} />
      ) : (
        <div className="search-results">
          {activeTab === 'users' ? (
            results.users.length > 0 ? (
              results.users.map(user => <UserCard key={user._id} user={user} />)
            ) : (
              <p className="no-results">No users found</p>
            )
          ) : (
            results.posts.length > 0 ? (
              results.posts.map(post => <PostCard key={post._id} post={post} />)
            ) : (
              <p className="no-results">No posts found</p>
            )
          )}
        </div>
      )}
    </div>
  );
}
