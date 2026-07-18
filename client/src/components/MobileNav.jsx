import { NavLink } from 'react-router-dom';
import { FaHome, FaSearch, FaPlusSquare, FaHeart, FaUser } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './MobileNav.css';

export default function MobileNav({ onCreatePost }) {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <nav className="mobile-nav">
      <NavLink to="/" end className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <FaHome />
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <FaSearch />
      </NavLink>
      <button className="mobile-nav-btn create" onClick={onCreatePost}>
        <FaPlusSquare />
      </button>
      <NavLink to="/notifications" className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <FaHeart />
      </NavLink>
      <NavLink to={`/profile/${user._id}`} className={({ isActive }) => `mobile-nav-btn ${isActive ? 'active' : ''}`}>
        <FaUser />
      </NavLink>
    </nav>
  );
}
