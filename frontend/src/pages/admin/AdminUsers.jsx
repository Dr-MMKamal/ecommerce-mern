import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers, updateUser, deleteUser } from '../../features/admin/adminSlice';
import Loader from '../../components/Loader';

export default function AdminUsers() {
  const dispatch = useDispatch();
  const { users, loading } = useSelector((s) => s.admin);
  const me = useSelector((s) => s.auth.user);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const onDelete = (u) => {
    if (window.confirm(`Delete user ${u.email}?`)) dispatch(deleteUser(u._id));
  };

  if (loading && users.length === 0) return <Loader />;

  return (
    <>
      <h1>Users <span className="muted small">({users.length})</span></h1>
      <div className="card table-wrap">
        <table className="table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Joined</th><th>Active</th><th /></tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const self = u._id === me._id;
              return (
                <tr key={u._id}>
                  <td>{u.name} {self && <span className="muted small">(you)</span>}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      value={u.role}
                      disabled={self}
                      onChange={(e) => dispatch(updateUser({ id: u._id, role: e.target.value }))}
                    >
                      <option value="user">user</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={u.isActive}
                      disabled={self}
                      onChange={(e) => dispatch(updateUser({ id: u._id, isActive: e.target.checked }))}
                    />
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" disabled={self} onClick={() => onDelete(u)}>
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
