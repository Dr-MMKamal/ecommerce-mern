import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, clearAuthError } from '../features/auth/authSlice';
import Message from '../components/Message';

export default function Login({ adminOnly = false }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ email: '', password: '' });

  const redirect = location.state?.from || (adminOnly ? '/admin' : '/');

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (!user) return;
    if (adminOnly && user.role !== 'admin') {
      navigate('/store', { replace: true });
      return;
    }
    navigate(user.role === 'admin' && (redirect === '/' || redirect === '/store') ? '/admin' : redirect, {
      replace: true,
    });
  }, [user, navigate, redirect, adminOnly]);

  const submit = (e) => {
    e.preventDefault();
    dispatch(loginUser(form));
  };

  return (
    <form className="card card-body form auth-form" onSubmit={submit}>
      <h1>{adminOnly ? 'Admin sign in' : 'Sign in'}</h1>
      <Message>{error}</Message>
      <label>Email</label>
      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label>Password</label>
      <input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      {!adminOnly && (
        <p className="muted">
          New customer? <Link to="/register" state={location.state}>Create an account</Link>
        </p>
      )}
    </form>
  );
}
