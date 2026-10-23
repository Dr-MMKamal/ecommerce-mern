import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function ProtectedRoute() {
  const user = useSelector((s) => s.auth.user);
  const location = useLocation();
  return user ? <Outlet /> : <Navigate to="/login" state={{ from: location.pathname }} replace />;
}
