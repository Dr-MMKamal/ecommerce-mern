import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../features/product/productSlice';
import { adminDeleteProduct } from '../../features/admin/adminSlice';
import { imgUrl } from '../../api/axios';
import Loader from '../../components/Loader';
import Pagination from '../../components/Pagination';

export default function AdminProducts() {
  const dispatch = useDispatch();
  const { items, page, pages, total, loading } = useSelector((s) => s.products);
  const [keyword, setKeyword] = useState('');
  const [pg, setPg] = useState(1);

  useEffect(() => {
    dispatch(fetchProducts({ keyword, page: pg, limit: 10 }));
  }, [dispatch, keyword, pg]);

  const onDelete = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    const res = await dispatch(adminDeleteProduct(p._id));
    if (!res.error) dispatch(fetchProducts({ keyword, page: pg, limit: 10 }));
  };

  return (
    <>
      <div className="row between">
        <h1>Products <span className="muted small">({total})</span></h1>
        <Link to="/admin/products/new" className="btn btn-primary">+ New product</Link>
      </div>

      <input
        placeholder="Search products…"
        value={keyword}
        onChange={(e) => {
          setKeyword(e.target.value);
          setPg(1);
        }}
        style={{ maxWidth: 320, marginBottom: 12 }}
      />

      {loading ? (
        <Loader />
      ) : (
        <div className="card table-wrap">
          <table className="table">
            <thead>
              <tr><th /><th>Name</th><th>Category</th><th>Price</th><th>Stock</th><th>Featured</th><th /></tr>
            </thead>
            <tbody>
              {items.map((p) => (
                <tr key={p._id}>
                  <td><img className="thumb" src={imgUrl(p.images[0])} alt="" /></td>
                  <td>{p.name}</td>
                  <td>{p.category?.name}</td>
                  <td>${p.price.toFixed(2)}</td>
                  <td className={p.countInStock <= 5 ? 'warn' : ''}>{p.countInStock}</td>
                  <td>{p.featured ? '★' : ''}</td>
                  <td className="actions">
                    <Link to={`/admin/products/${p._id}/edit`} className="btn btn-sm">Edit</Link>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(p)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={page} pages={pages} onChange={setPg} />
    </>
  );
}
