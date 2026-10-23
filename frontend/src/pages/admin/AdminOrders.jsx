import { Fragment, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllOrders, updateOrderStatus } from '../../features/admin/adminSlice';
import Loader from '../../components/Loader';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'];

export default function AdminOrders() {
  const dispatch = useDispatch();
  const { orders, loading } = useSelector((s) => s.admin);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  useEffect(() => {
    dispatch(fetchAllOrders(filter));
  }, [dispatch, filter]);

  return (
    <>
      <div className="row between">
        <h1>Orders</h1>
        <select style={{ width: 180 }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading && orders.length === 0 ? (
        <Loader />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th>Order</th><th>Customer</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th><th /></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o._id}>
                  <tr>
                    <td>#{o._id.slice(-8).toUpperCase()}</td>
                    <td>{o.user?.name || 'Deleted user'}<div className="muted small">{o.user?.email}</div></td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>${o.totalPrice.toFixed(2)}</td>
                    <td>
                      <input
                        type="checkbox"
                        checked={o.isPaid}
                        onChange={(e) => dispatch(updateOrderStatus({ id: o._id, isPaid: e.target.checked }))}
                      />
                    </td>
                    <td>
                      <select
                        value={o.status}
                        onChange={(e) => dispatch(updateOrderStatus({ id: o._id, status: e.target.value }))}
                      >
                        {STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </td>
                    <td>
                      <button className="btn btn-sm" onClick={() => setOpen(open === o._id ? null : o._id)}>
                        {open === o._id ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {open === o._id && (
                    <tr className="detail-row">
                      <td colSpan="7">
                        <strong>Ship to:</strong> {o.shippingAddress.fullName}, {o.shippingAddress.phone},{' '}
                        {o.shippingAddress.address}, {o.shippingAddress.city} {o.shippingAddress.postalCode},{' '}
                        {o.shippingAddress.country} · <strong>Payment:</strong> {o.paymentMethod}
                        <ul>
                          {o.orderItems.map((i) => (
                            <li key={i._id}>{i.name} × {i.qty} — ${(i.price * i.qty).toFixed(2)}</li>
                          ))}
                        </ul>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
          {orders.length === 0 && <p className="muted card-body">No orders found.</p>}
        </div>
      )}
    </>
  );
}
