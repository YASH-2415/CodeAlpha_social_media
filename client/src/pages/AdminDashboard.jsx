import { useState, useEffect } from 'react';
import { FaUsers, FaImages, FaComments, FaHeart, FaTrash, FaUserFriends, FaThumbsUp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import api from '../services/api';
import Avatar from '../components/Avatar';
import { LoadingSpinner } from '../components/LoadingSpinner';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'overview') {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } else if (activeTab === 'users') {
        const { data } = await api.get('/admin/users', { params: { search: searchQuery } });
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Admin fetch error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id, username) => {
    if (!window.confirm(`Delete user "${username}" and all their data?`)) return;
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(prev => prev.filter(u => u._id !== id));
      toast.success(`User ${username} deleted`);
    } catch (error) {
      toast.error('Failed to delete user');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/admin/posts/${id}`);
      toast.success('Post deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  return (
    <div className="admin-page">
      <h2>Admin Dashboard</h2>

      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>Overview</button>
        <button className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {activeTab === 'overview' && stats && (
            <div className="admin-stats-grid">
              <div className="admin-stat"><FaUsers /><span>{stats.totalUsers}</span><p>Users</p></div>
              <div className="admin-stat"><FaImages /><span>{stats.totalPosts}</span><p>Posts</p></div>
              <div className="admin-stat"><FaComments /><span>{stats.totalComments}</span><p>Comments</p></div>
              <div className="admin-stat"><FaUserFriends /><span>{stats.totalFollows}</span><p>Follows</p></div>
              <div className="admin-stat"><FaThumbsUp /><span>{stats.totalLikes}</span><p>Likes</p></div>
            </div>
          )}

          {activeTab === 'users' && (
            <>
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search"
                onKeyDown={(e) => e.key === 'Enter' && fetchData()}
              />
              <div className="admin-users-list">
                {users.map(user => (
                  <div key={user._id} className="admin-user-card">
                    <Avatar src={user.profileImage} alt={user.fullName} size="sm" />
                    <div className="admin-user-info">
                      <strong>{user.username}</strong>
                      <span>{user.email}</span>
                      <span>{user.postCount || 0} posts</span>
                    </div>
                    <button className="admin-delete-btn" onClick={() => handleDeleteUser(user._id, user.username)}>
                      <FaTrash />
                    </button>
                  </div>
                ))}
                {users.length === 0 && <p className="no-results">No users found</p>}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
