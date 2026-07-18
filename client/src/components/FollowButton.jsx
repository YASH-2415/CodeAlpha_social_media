import { useState } from 'react';
import userService from '../services/userService';
import toast from 'react-hot-toast';
import './FollowButton.css';

export default function FollowButton({ userId, isFollowing: initialFollowing, onToggle, compact = false }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [loading, setLoading] = useState(false);

  const handleToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      if (isFollowing) {
        await userService.unfollowUser(userId);
        setIsFollowing(false);
        toast.success('Unfollowed');
      } else {
        await userService.followUser(userId);
        setIsFollowing(true);
        toast.success('Following!');
      }
      if (onToggle) onToggle(!isFollowing);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className={`follow-btn ${isFollowing ? 'following' : 'not-following'} ${compact ? 'compact' : ''}`}
      onClick={handleToggle}
      disabled={loading}
    >
      {loading ? '...' : isFollowing ? 'Following' : 'Follow'}
    </button>
  );
}
