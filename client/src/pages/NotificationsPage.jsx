import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import NotificationItem from '../components/NotificationItem';
import { LoadingSpinner } from '../components/LoadingSpinner';
import notificationService from '../services/notificationService';
import './NotificationsPage.css';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, [page]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getNotifications({ page, limit: 20 });
      if (page === 1) {
        setNotifications(data.notifications || []);
      } else {
        setNotifications(prev => [...prev, ...(data.notifications || [])]);
      }
      setHasMore(page < data.totalPages);
    } catch (error) {
      console.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev =>
        prev.map(n => n._id === id ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification');
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to update notifications');
    }
  };

  return (
    <div className="notifications-page">
      <div className="notifications-header">
        <h2>Notifications</h2>
        <button onClick={markAllAsRead} className="mark-read-btn">Mark all as read</button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : notifications.length === 0 ? (
        <div className="empty-notifications">
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="notifications-list">
          {notifications.map(n => (
            <NotificationItem key={n._id} notification={n} onRead={markAsRead} />
          ))}
          {hasMore && (
            <button className="load-more-btn" onClick={() => setPage(p => p + 1)}>
              Load more
            </button>
          )}
        </div>
      )}
    </div>
  );
}
