import { useState, useEffect } from 'react';
import { FaImages, FaHeart, FaUsers, FaUserPlus } from 'react-icons/fa';
import userService from '../services/userService';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './DashboardPage.css';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await userService.getDashboard();
        setStats(data);
      } catch (error) {
        console.error('Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;
  if (!stats) return <div className="error-page">Failed to load dashboard</div>;

  const statCards = [
    { icon: FaImages, label: 'Total Posts', value: stats.totalPosts, color: '#6366f1' },
    { icon: FaHeart, label: 'Likes Received', value: stats.likesReceived, color: '#dc2626' },
    { icon: FaUsers, label: 'Followers', value: stats.totalFollowers, color: '#16a34a' },
    { icon: FaUserPlus, label: 'Following', value: stats.totalFollowing, color: '#f59e0b' },
  ];

  return (
    <div className="dashboard-page">
      <h2>Your Dashboard</h2>
      <div className="stats-grid">
        {statCards.map((stat, i) => (
          <div key={i} className="stat-card" style={{ '--card-color': stat.color }}>
            <div className="stat-icon"><stat.icon /></div>
            <div className="stat-info">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {stats.recentPosts && stats.recentPosts.length > 0 && (
        <div className="recent-posts-section">
          <h3>Recent Posts Performance</h3>
          <div className="recent-posts-list">
            {stats.recentPosts.map(post => (
              <div key={post._id} className="recent-post-item">
                <p className="recent-post-caption">{post.caption || 'No caption'}</p>
                <div className="recent-post-stats">
                  <span><FaHeart /> {post.likeCount}</span>
                  <span>Comments: {post.commentCount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
