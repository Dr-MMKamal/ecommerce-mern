import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories } from '../features/product/productSlice';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import Loader from '../components/Loader';
import Message from '../components/Message';

export default function Shop() {
  const dispatch = useDispatch();
  const [params, setParams] = useSearchParams();
  const { items, categories, page, pages, total, loading, error } = useSelector((s) => s.products);

  const keyword = params.get('keyword') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || 'newest';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const currentPage = Number(params.get('page')) || 1;

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    dispatch(fetchProducts({ keyword, category, sort, minPrice, maxPrice, page: currentPage, limit: 8 }));
  }, [dispatch, keyword, category, sort, minPrice, maxPrice, currentPage]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  return (
    <div className="shop-layout">
      <aside className="filters card">
        <h3>Filters</h3>
        <label>Category</label>
        <select value={category} onChange={(e) => update('category', e.target.value)}>
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Price range</label>
        <div className="row">
          <input type="number" min="0" placeholder="Min" value={minPrice} onChange={(e) => update('minPrice', e.target.value)} />
          <input type="number" min="0" placeholder="Max" value={maxPrice} onChange={(e) => update('maxPrice', e.target.value)} />
        </div>

        <label>Sort by</label>
        <select value={sort} onChange={(e) => update('sort', e.target.value)}>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="rating">Top rated</option>
        </select>

        <button className="btn btn-block" onClick={() => setParams({})}>
          Clear filters
        </button>
      </aside>

      <section>
        <div className="row between">
          <h2>{keyword ? `Results for “${keyword}”` : 'All products'}</h2>
          <span className="muted">{total} items</span>
        </div>
        <Message>{error}</Message>
        {loading ? (
          <Loader />
        ) : items.length === 0 ? (
          <p className="muted">No products found.</p>
        ) : (
          <div className="grid">
            {items.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
        <Pagination page={page} pages={pages} onChange={(n) => update('page', String(n))} />
      </section>
    </div>
  );
}
