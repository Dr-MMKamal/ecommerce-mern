import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { saveShippingAddress, savePaymentMethod, selectCartTotal } from '../features/cart/cartSlice';
import { createOrder, resetCreated } from '../features/order/orderSlice';
import Message from '../components/Message';

export default function Checkout() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, shippingAddress, paymentMethod } = useSelector((s) => s.cart);
  const itemsPrice = useSelector(selectCartTotal);
  const user = useSelector((s) => s.auth.user);
  const { loading, error, created } = useSelector((s) => s.orders);

  const [addr, setAddr] = useState({
    fullName: shippingAddress.fullName || user?.name || '',
    phone: shippingAddress.phone || '',
    address: shippingAddress.address || '',
    city: shippingAddress.city || '',
    postalCode: shippingAddress.postalCode || '',
    country: shippingAddress.country || '',
  });
  const [payment, setPayment] = useState(paymentMethod);

  // Estimates for display only - the server recalculates the real totals
  const shipping = itemsPrice > 100 ? 0 : 10;
  const tax = Math.round(itemsPrice * 0.05 * 100) / 100;
  const total = itemsPrice + shipping + tax;

  useEffect(() => {
    if (created) {
      const id = created._id;
      dispatch(resetCreated());
      navigate(`/orders/${id}`, { replace: true, state: { justPlaced: true } });
    }
  }, [created, dispatch, navigate]);

  if (items.length === 0 && !created) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn btn-primary">Go shopping</Link>
      </div>
    );
  }

  const set = (k) => (e) => setAddr({ ...addr, [k]: e.target.value });

  const submit = (e) => {
    e.preventDefault();
    dispatch(saveShippingAddress(addr));
    dispatch(savePaymentMethod(payment));
    dispatch(
      createOrder({
        orderItems: items.map((i) => ({ product: i.product, qty: i.qty })),
        shippingAddress: addr,
        paymentMethod: payment,
      })
    );
  };

  return (
    <>
      <h1>Checkout</h1>
      <div className="cart-layout">
        <form className="card card-body form" onSubmit={submit}>
          <h3>Shipping address</h3>
          <Message>{error}</Message>
          <label>Full name</label>
          <input required value={addr.fullName} onChange={set('fullName')} />
          <label>Phone</label>
          <input required value={addr.phone} onChange={set('phone')} />
          <label>Address</label>
          <input required value={addr.address} onChange={set('address')} />
          <div className="row">
            <div className="grow">
              <label>City</label>
              <input required value={addr.city} onChange={set('city')} />
            </div>
            <div className="grow">
              <label>Postal code</label>
              <input required value={addr.postalCode} onChange={set('postalCode')} />
            </div>
          </div>
          <label>Country</label>
          <input required value={addr.country} onChange={set('country')} />

          <h3>Payment method</h3>
          <label className="radio">
            <input type="radio" checked={payment === 'COD'} onChange={() => setPayment('COD')} /> Cash on delivery
          </label>
          <label className="radio">
            <input type="radio" checked={payment === 'Card'} onChange={() => setPayment('Card')} /> Card (pay on confirmation)
          </label>

          <button className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? 'Placing order…' : 'Place order'}
          </button>
        </form>

        <aside className="card card-body summary">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div key={i.product} className="row between small">
              <span>{i.name} × {i.qty}</span>
              <span>${(i.price * i.qty).toFixed(2)}</span>
            </div>
          ))}
          <hr />
          <div className="row between"><span>Items</span><span>${itemsPrice.toFixed(2)}</span></div>
          <div className="row between"><span>Shipping</span><span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span></div>
          <div className="row between"><span>Tax (5%)</span><span>${tax.toFixed(2)}</span></div>
          <hr />
          <div className="row between"><strong>Total</strong><strong>${total.toFixed(2)}</strong></div>
        </aside>
      </div>
    </>
  );
}
