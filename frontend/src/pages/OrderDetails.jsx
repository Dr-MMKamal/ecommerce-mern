import { useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrder, cancelOrder } from '../features/order/orderSlice';
import { imgUrl } from '../api/axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import StatusBadge from '../components/StatusBadge';

export default function OrderDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const location = useLocation();
  const { current: o, loading, error } = useSelector((s) => s.orders);

  useEffect(() => {
    dispatch(fetchOrder(id));
  }, [dispatch, id]);

  if (loading && !o) return <Loader />;
  if (error) return <Message>{error}</Message>;
  if (!o || o._id !== id) return <Loader />;

  const onCancel = () => {
    if (window.confirm('Cancel this order?')) dispatch(cancelOrder(o._id));
  };

  return (
    <>
      {location.state?.justPlaced && (
        <Message type="success">Order placed successfully. Thank you for shopping with us!</Message>
      )}
      <div className="row between">
        <h1>Order #{o._id.slice(-8).toUpperCase()}</h1>
        <StatusBadge status={o.status} />
      </div>
      <div className="cart-layout">
        <div>
          <div className="card card-body">
            <h3>Shipping</h3>
            <p>
              {o.shippingAddress.fullName} · {o.shippingAddress.phone}
              <br />
              {o.shippingAddress.address}, {o.shippingAddress.city} {o.shippingAddress.postalCode},{' '}
              {o.shippingAddress.country}
            </p>
            <p>
              Payment: <strong>{o.paymentMethod}</strong> —{' '}
              {o.isPaid ? <span className="ok">Paid on {new Date(o.paidAt).toLocaleDateString()}</span> : <span className="bad">Not paid</span>}
            </p>
          </div>

          <div className="card">
            {o.orderItems.map((i) => (
              <div key={i._id} className="cart-row">
                <img src={imgUrl(i.image)} alt={i.name} />
                <Link to={`/product/${i.product}`} className="grow">{i.name}</Link>
                <span>{i.qty} × ${i.price.toFixed(2)}</span>
                <strong>${(i.qty * i.price).toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </div>

        <aside className="card card-body summary">
          <h3>Summary</h3>
          <div className="row between"><span>Items</span><span>${o.itemsPrice.toFixed(2)}</span></div>
          <div className="row between"><span>Shipping</span><span>${o.shippingPrice.toFixed(2)}</span></div>
          <div className="row between"><span>Tax</span><span>${o.taxPrice.toFixed(2)}</span></div>
          <hr />
          <div className="row between"><strong>Total</strong><strong>${o.totalPrice.toFixed(2)}</strong></div>
          {o.status === 'Pending' && (
            <button className="btn btn-danger btn-block" onClick={onCancel}>
              Cancel order
            </button>
          )}
        </aside>
      </div>
    </>
  );
}
