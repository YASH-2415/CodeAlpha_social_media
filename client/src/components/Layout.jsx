import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';
import MobileNav from './MobileNav';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

export default function Layout({ onCreatePost }) {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="auth-layout">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar onCreatePost={onCreatePost} />
      <Sidebar onCreatePost={onCreatePost} />
      <main className="main-content">
        <Outlet />
      </main>
      <RightSidebar />
      <MobileNav onCreatePost={onCreatePost} />
    </div>
  );
}
