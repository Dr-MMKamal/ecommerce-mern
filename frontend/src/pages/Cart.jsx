import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setQty, removeFromCart, selectCartTotal, selectCartCount } from '../features/cart/cartSlice';
import { imgUrl } from '../api/axios';

export default function Cart() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const items = useSelector((s) => s.cart.items);
  const total = useSelector(selectCartTotal);
  const count = useSelector(selectCartCount);

  if (items.length === 0) {
    return (
      <div className="empty">
        <h2>Your cart is empty</h2>
        <Link to="/shop" className="btn btn-primary">
          Continue shopping
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1>Shopping cart</h1>
      <div className="cart-layout">
        <div className="card">
          {items.map((i) => (
            <div key={i.product} className="cart-row">
              <img src={imgUrl(i.image)} alt={i.name} />
              <Link to={`/product/${i.product}`} className="grow">
                {i.name}
              </Link>
              <span>${i.price.toFixed(2)}</span>
              <select
                style={{ width: 70 }}
                value={i.qty}
                onChange={(e) => dispatch(setQty({ product: i.product, qty: Number(e.target.value) }))}
              >
                {Array.from({ length: Math.min(i.countInStock, 10) }, (_, n) => n + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <strong>${(i.price * i.qty).toFixed(2)}</strong>
              <button className="btn btn-sm btn-danger" onClick={() => dispatch(removeFromCart(i.product))}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <aside className="card card-body summary">
          <h3>Subtotal ({count} items)</h3>
          <h2>${total.toFixed(2)}</h2>
          <p className="muted small">Shipping and tax are calculated at checkout.</p>
          <button className="btn btn-primary btn-block" onClick={() => navigate('/checkout')}>
            Proceed to checkout
          </button>
        </aside>
      </div>
    </>
  );
}
