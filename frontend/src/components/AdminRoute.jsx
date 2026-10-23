import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

// UI guard only - the real enforcement is the `admin` middleware on the API
export default function AdminRoute() {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  if (!user) return <Navigate to="/admin/login" state={{ from: location.pathname }} replace />;
  if (user.role !== 'admin') return <Navigate to="/store" replace />;
  return <Outlet />;
}
