import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProduct, addReview } from '../features/product/productSlice';
import { addToCart } from '../features/cart/cartSlice';
import { imgUrl } from '../api/axios';
import Loader from '../components/Loader';
import Message from '../components/Message';
import Rating from '../components/Rating';

export default function ProductDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { current: p, loading, error, reviewError } = useSelector((s) => s.products);
  const user = useSelector((s) => s.auth.user);

  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  useEffect(() => {
    dispatch(fetchProduct(id));
    setQty(1);
    setActiveImg(0);
  }, [dispatch, id]);

  if (loading && !p) return <Loader />;
  if (error) return <Message>{error}</Message>;
  if (!p || p._id !== id) return <Loader />;

  const add = (goToCart) => {
    dispatch(
      addToCart({
        product: p._id,
        name: p.name,
        image: p.images[0],
        price: p.price,
        countInStock: p.countInStock,
        qty,
      })
    );
    if (goToCart) navigate('/cart');
  };

  const submitReview = async (e) => {
    e.preventDefault();
    const res = await dispatch(addReview({ id: p._id, rating, comment }));
    if (!res.error) setComment('');
  };

  return (
    <>
      <Link to="/shop" className="muted">
        ← Back to shop
      </Link>
      <div className="details">
        <div>
          <img className="details-img" src={imgUrl(p.images[activeImg])} alt={p.name} />
          {p.images.length > 1 && (
            <div className="thumbs">
              {p.images.map((img, i) => (
                <img key={img} src={imgUrl(img)} alt="" className={i === activeImg ? 'active' : ''} onClick={() => setActiveImg(i)} />
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="muted">{p.category?.name} {p.brand && `· ${p.brand}`}</div>
          <h1>{p.name}</h1>
          <Rating value={p.rating} count={p.numReviews} />
          <h2 className="price">${p.price.toFixed(2)}</h2>
          <p>{p.description}</p>
          <p>
            Status:{' '}
            {p.countInStock > 0 ? (
              <span className="ok">In stock ({p.countInStock})</span>
            ) : (
              <span className="bad">Out of stock</span>
            )}
          </p>

          {p.countInStock > 0 && (
            <div className="row">
              <select value={qty} onChange={(e) => setQty(Number(e.target.value))} style={{ width: 80 }}>
                {Array.from({ length: Math.min(p.countInStock, 10) }, (_, i) => i + 1).map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <button className="btn" onClick={() => add(false)}>
                Add to cart
              </button>
              <button className="btn btn-primary" onClick={() => add(true)}>
                Buy now
              </button>
            </div>
          )}
        </div>
      </div>

      <section className="reviews">
        <h2>Reviews</h2>
        {p.reviews.length === 0 && <p className="muted">No reviews yet.</p>}
        {p.reviews.map((r) => (
          <div key={r._id} className="card card-body">
            <strong>{r.name}</strong> <Rating value={r.rating} />
            <div className="muted small">{new Date(r.createdAt).toLocaleDateString()}</div>
            <p>{r.comment}</p>
          </div>
        ))}

        {user ? (
          <form onSubmit={submitReview} className="card card-body form">
            <h3>Write a review</h3>
            <Message>{reviewError}</Message>
            <label>Rating</label>
            <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
              <option value={5}>5 – Excellent</option>
              <option value={4}>4 – Very good</option>
              <option value={3}>3 – Good</option>
              <option value={2}>2 – Fair</option>
              <option value={1}>1 – Poor</option>
            </select>
            <label>Comment</label>
            <textarea rows="3" required value={comment} onChange={(e) => setComment(e.target.value)} />
            <button className="btn btn-primary">Submit review</button>
          </form>
        ) : (
          <p>
            <Link to="/login" state={{ from: `/product/${p._id}` }}>Sign in</Link> to write a review.
          </p>
        )}
      </section>
    </>
  );
}
