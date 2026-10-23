import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchStats } from '../../features/admin/adminSlice';
import Loader from '../../components/Loader';
import StatusBadge from '../../components/StatusBadge';

function SalesChart({ data }) {
  const max = Math.max(...data.map((d) => d.sales), 1);
  return (
    <div className="chart">
      {data.map((d) => (
        <div key={d.date} className="bar-col" title={`${d.date}: $${d.sales.toFixed(2)} (${d.orders} orders)`}>
          <span className="bar-val">{d.sales > 0 ? `$${Math.round(d.sales)}` : ''}</span>
          <div className="bar" style={{ height: `${(d.sales / max) * 100}%` }} />
          <span className="bar-label">{new Date(d.date).toLocaleDateString(undefined, { weekday: 'short' })}</span>
        </div>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, loading } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  if (!stats) return <Loader />;

  const cards = [
    { label: 'Total revenue', value: `$${stats.totalRevenue.toFixed(2)}` },
    { label: 'Orders', value: stats.totalOrders },
    { label: 'Products', value: stats.totalProducts },
    { label: 'Customers', value: stats.totalUsers },
  ];

  return (
    <>
      <div className="row between">
        <h1>Dashboard</h1>
        {loading && <span className="muted">Refreshing…</span>}
      </div>

      <div className="stat-grid">
        {cards.map((c) => (
          <div key={c.label} className="card card-body stat">
            <span className="muted">{c.label}</span>
            <strong>{c.value}</strong>
          </div>
        ))}
      </div>

      <div className="two-col">
        <div className="card card-body">
          <h3>Sales — last 7 days</h3>
          <SalesChart data={stats.salesByDay} />
        </div>

        <div className="card card-body">
          <h3>Orders by status</h3>
          {stats.ordersByStatus.length === 0 && <p className="muted">No orders yet.</p>}
          {stats.ordersByStatus.map((s) => (
            <div key={s.status} className="row between" style={{ margin: '8px 0' }}>
              <StatusBadge status={s.status} />
              <strong>{s.count}</strong>
            </div>
          ))}
        </div>
      </div>

      <div className="two-col">
        <div className="card card-body">
          <div className="row between">
            <h3>Recent orders</h3>
            <Link to="/admin/orders">Manage orders</Link>
          </div>
          <table className="table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Status</th></tr>
            </thead>
            <tbody>
              {stats.recentOrders.map((o) => (
                <tr key={o._id}>
                  <td><Link to="/admin/orders">#{o._id.slice(-6).toUpperCase()}</Link></td>
                  <td>
                    {o.user?.name || 'Deleted user'}
                    {o.user?.email && <div className="muted small">{o.user.email}</div>}
                  </td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>${o.totalPrice.toFixed(2)}</td>
                  <td><StatusBadge status={o.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentOrders.length === 0 && <p className="muted">No orders yet.</p>}
        </div>

        <div className="card card-body">
          <div className="row between">
            <h3>Recent customers</h3>
            <Link to="/admin/users">Manage users</Link>
          </div>
          <table className="table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Joined</th><th>Account</th></tr>
            </thead>
            <tbody>
              {stats.recentUsers.map((user) => (
                <tr key={user._id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td><span className={user.isActive ? 'ok' : 'bad'}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          {stats.recentUsers.length === 0 && <p className="muted">No customers yet.</p>}
        </div>

        <div className="card card-body">
          <h3>Low stock</h3>
          {stats.lowStock.length === 0 && <p className="muted">All products are well stocked.</p>}
          {stats.lowStock.map((p) => (
            <div key={p._id} className="row between" style={{ margin: '8px 0' }}>
              <Link to={`/admin/products/${p._id}/edit`}>{p.name}</Link>
              <span className={p.countInStock === 0 ? 'bad' : 'warn'}>{p.countInStock} left</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
