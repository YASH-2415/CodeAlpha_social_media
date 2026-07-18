import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import userService from '../services/userService';
import UserCard from './UserCard';
import { SkeletonLoader } from './LoadingSpinner';
import { useAuth } from '../hooks/useAuth';
import './RightSidebar.css';

export default function RightSidebar() {
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await userService.getUsers({ limit: 5 });
        setSuggestions(data.users || []);
      } catch (error) {
        console.error('Failed to load suggestions');
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSuggestions();
  }, [user]);

  if (!user) return null;

  return (
    <aside className="right-sidebar">
      {/* Current user card */}
      <div className="right-sidebar-section current-user">
        <Link to={`/profile/${user._id}`} className="current-user-card">
          <div className="current-user-info">
            <span className="current-username">{user.username}</span>
            <span className="current-fullname">{user.fullName}</span>
          </div>
        </Link>
      </div>

      {/* Suggestions */}
      <div className="right-sidebar-section">
        <div className="section-header">
          <h4>Suggested for you</h4>
        </div>
        {loading ? (
          <SkeletonLoader type="user" count={3} />
        ) : (
          <div className="suggestions-list">
            {suggestions.map(u => (
              <UserCard key={u._id} user={u} />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="right-sidebar-footer">
        <p>&copy; 2026 Alpha Social</p>
      </div>
    </aside>
  );
}
