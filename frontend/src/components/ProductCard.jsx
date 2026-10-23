import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { addToCart } from '../features/cart/cartSlice';
import { imgUrl } from '../api/axios';
import Rating from './Rating';

export default function ProductCard({ product }) {
  const dispatch = useDispatch();
  const out = product.countInStock === 0;

  const add = () =>
    dispatch(
      addToCart({
        product: product._id,
        name: product.name,
        image: product.images[0],
        price: product.price,
        countInStock: product.countInStock,
        qty: 1,
      })
    );

  return (
    <div className="card product-card">
      <Link to={`/product/${product._id}`} className="product-img">
        <img src={imgUrl(product.images[0])} alt={product.name} loading="lazy" />
        {out && <span className="tag tag-out">Out of stock</span>}
      </Link>
      <div className="card-body">
        <div className="muted small">{product.category?.name}</div>
        <Link to={`/product/${product._id}`} className="product-name">
          {product.name}
        </Link>
        <Rating value={product.rating} count={product.numReviews} />
        <div className="row between">
          <strong className="price">${product.price.toFixed(2)}</strong>
          <button className="btn btn-sm btn-primary" disabled={out} onClick={add}>
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
