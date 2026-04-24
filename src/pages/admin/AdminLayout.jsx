import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';
import { LayoutDashboard, BedDouble, CalendarCheck, Users, CreditCard, LogOut } from 'lucide-react';
import './Admin.css';

const AdminLayout = () => {
  const { currentUser, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  if (!currentUser || currentUser.role !== 'admin') {
    return <div style={{padding: '2rem', textAlign: 'center'}}>Unauthorized. Please <Link to="/admin">login</Link>.</div>;
  }

  const handleLogout = () => {
    logout();
    navigate('/admin');
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-header">
          <h2 style={{color: 'var(--color-primary-gold)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem'}}>Indian Atlantic Hotel Admin</h2>
        </div>
        
        <nav className="sidebar-nav">
          <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
            <LayoutDashboard size={20} /> Dashboard
          </Link>
          <Link to="/admin/rooms" className={location.pathname === '/admin/rooms' ? 'active' : ''}>
            <BedDouble size={20} /> Rooms
          </Link>
          <Link to="/admin/bookings" className={location.pathname === '/admin/bookings' ? 'active' : ''}>
            <CalendarCheck size={20} /> Bookings
          </Link>
          <Link to="/admin/payments" className={location.pathname === '/admin/payments' ? 'active' : ''}>
            <CreditCard size={20} /> Payments
          </Link>
        </nav>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-btn">
            <LogOut size={20} /> Logout
          </button>
        </div>
      </aside>
      
      <main className="admin-main">
        <header className="admin-header">
          <div className="header-title">
            {location.pathname.split('/').pop().charAt(0).toUpperCase() + location.pathname.split('/').pop().slice(1)}
          </div>
          <div className="header-user">
            <span>Admin</span>
            <div className="avatar">A</div>
          </div>
        </header>
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
