import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearAuthError } from '../features/auth/authSlice';
import Message from '../components/Message';

export default function Register() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [localError, setLocalError] = useState('');

  const redirect = location.state?.from || '/';

  useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  useEffect(() => {
    if (user) navigate(redirect, { replace: true });
  }, [user, navigate, redirect]);

  const submit = (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setLocalError('Passwords do not match');
    setLocalError('');
    dispatch(registerUser({ name: form.name, email: form.email, password: form.password }));
  };

  return (
    <form className="card card-body form auth-form" onSubmit={submit}>
      <h1>Create account</h1>
      <Message>{localError || error}</Message>
      <label>Name</label>
      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <label>Email</label>
      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label>Password</label>
      <input type="password" minLength={6} required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <label>Confirm password</label>
      <input type="password" minLength={6} required value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
      <button className="btn btn-primary btn-block" disabled={loading}>
        {loading ? 'Creating…' : 'Register'}
      </button>
      <p className="muted">
        Already have an account? <Link to="/login" state={location.state}>Sign in</Link>
      </p>
    </form>
  );
}
