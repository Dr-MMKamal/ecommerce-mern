import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../../features/auth/authSlice';
import { clearAdminError } from '../../features/admin/adminSlice';
import Message from '../../components/Message';

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/users', label: 'Users' },
];

export default function AdminLayout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((s) => s.auth.user);
  const error = useSelector((s) => s.admin.error);

  const logout = async () => {
    await dispatch(logoutUser());
    navigate('/admin/login');
  };

  return (
    <div className="admin">
      <header className="admin-navbar">
        <Link to="/admin" className="brand">
          Shop<span>Hub</span> <small>Admin</small>
        </Link>
        <nav aria-label="Admin navigation">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="admin-navbar-actions">
          <span className="muted">Signed in as <strong>{user.name}</strong></span>
          <button className="link-btn" onClick={logout}>Logout</button>
        </div>
      </header>

      <div className="admin-main">
        <div className="admin-content">
          {error && (
            <div onClick={() => dispatch(clearAdminError())} style={{ cursor: 'pointer' }}>
              <Message>{error} (click to dismiss)</Message>
            </div>
          )}
          <Outlet />
        </div>
      </div>
    </div>
  );
}
