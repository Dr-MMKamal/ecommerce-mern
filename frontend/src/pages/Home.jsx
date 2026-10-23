import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchFeatured, fetchCategories } from '../features/product/productSlice';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const dispatch = useDispatch();
  const { featured, categories } = useSelector((s) => s.products);

  useEffect(() => {
    dispatch(fetchFeatured());
    dispatch(fetchCategories());
  }, [dispatch]);

  return (
    <>
      <section className="hero">
        <div>
          <h1>Everything you need, delivered.</h1>
          <p>Discover quality products across electronics, fashion and home — at honest prices.</p>
          <Link to="/shop" className="btn btn-primary btn-lg">
            Shop now
          </Link>
        </div>
      </section>

      <section>
        <h2>Shop by category</h2>
        <div className="chips">
          {categories.map((c) => (
            <Link key={c._id} to={`/shop?category=${c._id}`} className="chip">
              {c.name}
            </Link>
          ))}
        </div>
      </section>

      <section>
        <div className="row between">
          <h2>Featured products</h2>
          <Link to="/shop">View all →</Link>
        </div>
        <div className="grid">
          {featured.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      </section>
    </>
  );
}
