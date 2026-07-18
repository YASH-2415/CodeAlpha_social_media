import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaTimes } from 'react-icons/fa';
import searchService from '../services/searchService';
import Avatar from './Avatar';
import './SearchBar.css';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const wrapperRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (query.trim().length < 1) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const results = await searchService.suggestions(query);
        setSuggestions(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setShowDropdown(false);
    }
  };

  const handleSuggestionClick = (userId) => {
    navigate(`/profile/${userId}`);
    setShowDropdown(false);
    setQuery('');
  };

  return (
    <div className="search-bar" ref={wrapperRef}>
      <form onSubmit={handleSubmit}>
        <FaSearch className="search-icon" />
        <input
          type="text"
          placeholder="Search users..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        {query && (
          <button type="button" className="search-clear" onClick={() => { setQuery(''); setSuggestions([]); }}>
            <FaTimes />
          </button>
        )}
      </form>

      {showDropdown && (
        <div className="search-dropdown">
          {suggestions.map(user => (
            <div key={user._id} className="search-suggestion" onClick={() => handleSuggestionClick(user._id)}>
              <Avatar src={user.profileImage} alt={user.fullName} size="sm" />
              <div className="suggestion-info">
                <span className="suggestion-username">{user.username}</span>
                <span className="suggestion-fullname">{user.fullName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
