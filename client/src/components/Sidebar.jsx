import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaPlusSquare, FaHeart, FaUser, FaChartBar, FaShieldAlt } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './Sidebar.css';

export default function Sidebar({ onCreatePost }) {
  const { user } = useAuth();

  const links = [
    { to: '/', icon: FaHome, label: 'Home' },
    { to: '/search', icon: FaSearch, label: 'Search' },
    { to: '/notifications', icon: FaHeart, label: 'Notifications' },
    { to: '/dashboard', icon: FaChartBar, label: 'Dashboard' },
    { to: `/profile/${user?._id}`, icon: FaUser, label: 'Profile' },
  ];

  if (user?.isAdmin) {
    links.push({ to: '/admin', icon: FaShieldAlt, label: 'Admin' });
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <span className="logo-text">Alpha</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <link.icon />
            <span>{link.label}</span>
          </NavLink>
        ))}

        <button className="sidebar-link create-btn" onClick={onCreatePost}>
          <FaPlusSquare />
          <span>Create Post</span>
        </button>
      </nav>
    </aside>
  );
}
