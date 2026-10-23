import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyOrders } from '../features/order/orderSlice';
import Loader from '../components/Loader';
import Message from '../components/Message';
import StatusBadge from '../components/StatusBadge';

export default function MyOrders() {
  const dispatch = useDispatch();
  const { mine, loading, error } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchMyOrders());
  }, [dispatch]);

  return (
    <>
      <h1>My orders</h1>
      <Message>{error}</Message>
      {loading ? (
        <Loader />
      ) : mine.length === 0 ? (
        <p className="muted">
          You have no orders yet. <Link to="/shop">Start shopping</Link>
        </p>
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th>Order</th><th>Date</th><th>Total</th><th>Paid</th><th>Status</th><th />
              </tr>
            </thead>
            <tbody>
              {mine.map((o) => (
                <tr key={o._id}>
                  <td>#{o._id.slice(-8).toUpperCase()}</td>
                  <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td>${o.totalPrice.toFixed(2)}</td>
                  <td>{o.isPaid ? '✔' : '—'}</td>
                  <td><StatusBadge status={o.status} /></td>
                  <td><Link to={`/orders/${o._id}`} className="btn btn-sm">Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
