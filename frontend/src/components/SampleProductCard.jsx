import { Link } from 'react-router-dom';

export default function SampleProductCard({ product }) {
  return (
    <article className="card sample-product-card">
      <Link to="/shop" className="sample-product-image">
        <img src={product.image} alt={product.alt} loading="lazy" />
        <span className="sample-product-label">Sample pick</span>
      </Link>
      <div className="card-body">
        <span className="muted small">{product.category}</span>
        <h3>{product.name}</h3>
        <div className="row between">
          <strong className="price">${product.price.toFixed(2)}</strong>
          <Link to="/shop" className="sample-product-link">
            Explore <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
