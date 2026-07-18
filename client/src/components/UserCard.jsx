import { Link } from 'react-router-dom';
import Avatar from './Avatar';
import FollowButton from './FollowButton';
import { useAuth } from '../hooks/useAuth';
import './UserCard.css';

export default function UserCard({ user, isFollowing, showFollow = true }) {
  const { user: currentUser } = useAuth();
  const isSelf = currentUser && currentUser._id === user._id;

  return (
    <div className="user-card">
      <Link to={`/profile/${user._id}`} className="user-card-info">
        <Avatar src={user.profileImage} alt={user.fullName} size="sm" />
        <div className="user-card-text">
          <span className="user-card-username">{user.username}</span>
          <span className="user-card-fullname">{user.fullName}</span>
        </div>
      </Link>
      {showFollow && !isSelf && (
        <FollowButton userId={user._id} isFollowing={isFollowing} compact />
      )}
    </div>
  );
}
