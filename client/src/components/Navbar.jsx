import { Link, useNavigate } from 'react-router-dom';
import { FaHome, FaSearch, FaPlusSquare, FaHeart, FaUser, FaSignOutAlt, FaMoon, FaSun, FaChartBar } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import SearchBar from './SearchBar';
import Avatar from './Avatar';
import notificationService from '../services/notificationService';
import { useState, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({ onCreatePost }) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [unreadCount, setUnreadCount] = useState(0);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      notificationService.getNotifications({ limit: 1 })
        .then(data => setUnreadCount(data.unreadCount || 0))
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-text">Alpha</span>
        </Link>

        <SearchBar />

        <div className="navbar-actions">
          <Link to="/" className="nav-btn" title="Home"><FaHome /></Link>
          <Link to="/dashboard" className="nav-btn" title="Dashboard"><FaChartBar /></Link>
          <button className="nav-btn" onClick={onCreatePost} title="Create Post"><FaPlusSquare /></button>
          <Link to="/notifications" className="nav-btn notification-btn" title="Notifications">
            <FaHeart />
            {unreadCount > 0 && <span className="badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
          </Link>
          <button className="nav-btn" onClick={toggleTheme} title="Toggle Theme">
            {theme === 'light' ? <FaMoon /> : <FaSun />}
          </button>

          <div className="nav-profile">
            <button onClick={() => setShowProfileMenu(!showProfileMenu)}>
              <Avatar src={user.profileImage} alt={user.fullName} size="sm" />
            </button>
            {showProfileMenu && (
              <div className="profile-dropdown">
                <Link to={`/profile/${user._id}`} onClick={() => setShowProfileMenu(false)}>
                  <FaUser /> Profile
                </Link>
                <Link to="/edit-profile" onClick={() => setShowProfileMenu(false)}>
                  <FaUser /> Edit Profile
                </Link>
                {user.isAdmin && (
                  <Link to="/admin" onClick={() => setShowProfileMenu(false)}>
                    <FaChartBar /> Admin Panel
                  </Link>
                )}
                <button onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
