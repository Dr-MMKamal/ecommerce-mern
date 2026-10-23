import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateProfile } from '../features/auth/authSlice';
import Message from '../components/Message';

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((s) => s.auth);
  const [form, setForm] = useState({ name: user.name, email: user.email, password: '' });
  const [saved, setSaved] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const body = { name: form.name, email: form.email };
    if (form.password) body.password = form.password;
    const res = await dispatch(updateProfile(body));
    setSaved(!res.error);
    setForm((f) => ({ ...f, password: '' }));
  };

  return (
    <form className="card card-body form auth-form" onSubmit={submit}>
      <h1>My profile</h1>
      <Message>{error}</Message>
      {saved && <Message type="success">Profile updated</Message>}
      <label>Name</label>
      <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      <label>Email</label>
      <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <label>New password (leave blank to keep current)</label>
      <input type="password" minLength={6} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
      <button className="btn btn-primary" disabled={loading}>Save changes</button>
    </form>
  );
}
