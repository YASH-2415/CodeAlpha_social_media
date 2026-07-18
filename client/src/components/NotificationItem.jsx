import { Link } from 'react-router-dom';
import { FaHeart, FaComment, FaUserPlus } from 'react-icons/fa';
import Avatar from './Avatar';
import './NotificationItem.css';

const typeConfig = {
  like: { icon: FaHeart, color: '#dc2626', text: 'liked your post' },
  comment: { icon: FaComment, color: '#2563eb', text: 'commented on your post' },
  follow: { icon: FaUserPlus, color: '#16a34a', text: 'started following you' },
};

function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

export default function NotificationItem({ notification, onRead }) {
  const config = typeConfig[notification.type] || typeConfig.follow;
  const Icon = config.icon;

  const link = notification.type === 'follow'
    ? `/profile/${notification.fromUser?._id}`
    : notification.postId
    ? `/`
    : `/profile/${notification.fromUser?._id}`;

  return (
    <Link
      to={link}
      className={`notification-item ${notification.read ? '' : 'unread'}`}
      onClick={() => onRead && onRead(notification._id)}
    >
      <div className="notification-avatar">
        <Avatar
          src={notification.fromUser?.profileImage}
          alt={notification.fromUser?.fullName}
          size="sm"
        />
        <div className="notification-type-icon" style={{ background: config.color }}>
          <Icon size={10} color="white" />
        </div>
      </div>
      <div className="notification-content">
        <p>
          <strong>{notification.fromUser?.username}</strong>{' '}
          {config.text}
        </p>
        <span className="notification-time">{timeAgo(notification.createdAt)}</span>
      </div>
    </Link>
  );
}
