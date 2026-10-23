import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import api, { imgUrl } from '../../api/axios';
import { fetchCategories } from '../../features/product/productSlice';
import { adminSaveProduct, uploadImage } from '../../features/admin/adminSlice';
import Message from '../../components/Message';
import Loader from '../../components/Loader';

const empty = {
  name: '',
  description: '',
  price: '',
  countInStock: '',
  brand: '',
  category: '',
  featured: false,
  images: [],
};

export default function ProductForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const categories = useSelector((s) => s.products.categories);
  const [form, setForm] = useState(empty);
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (!isEdit) return;
    api
      .get(`/products/${id}`)
      .then(({ data }) => {
        setForm({
          name: data.name,
          description: data.description,
          price: data.price,
          countInStock: data.countInStock,
          brand: data.brand || '',
          category: data.category?._id || '',
          featured: data.featured,
          images: data.images,
        });
      })
      .catch((e) => setError(e.response?.data?.message || e.message))
      .finally(() => setLoading(false));
  }, [id, isEdit]);

  const set = (k) => (e) =>
    setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  const onFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const res = await dispatch(uploadImage(file));
    if (!res.error) setForm((f) => ({ ...f, images: [...f.images, res.payload] }));
    else setError(res.payload);
    e.target.value = '';
  };

  const addUrl = () => {
    if (urlInput.trim()) setForm({ ...form, images: [...form.images, urlInput.trim()] });
    setUrlInput('');
  };

  const removeImg = (i) => setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const data = { ...form, price: Number(form.price), countInStock: Number(form.countInStock) };
    const res = await dispatch(adminSaveProduct({ id, data }));
    setSaving(false);
    if (res.error) setError(res.payload);
    else navigate('/admin/products');
  };

  if (loading) return <Loader />;

  return (
    <>
      <h1>{isEdit ? 'Edit product' : 'New product'}</h1>
      <form className="card card-body form" onSubmit={submit} style={{ maxWidth: 720 }}>
        <Message>{error}</Message>

        <label>Name</label>
        <input required value={form.name} onChange={set('name')} />

        <label>Description</label>
        <textarea required rows="4" value={form.description} onChange={set('description')} />

        <div className="row">
          <div className="grow">
            <label>Price ($)</label>
            <input type="number" min="0" step="0.01" required value={form.price} onChange={set('price')} />
          </div>
          <div className="grow">
            <label>Stock</label>
            <input type="number" min="0" required value={form.countInStock} onChange={set('countInStock')} />
          </div>
        </div>

        <div className="row">
          <div className="grow">
            <label>Brand</label>
            <input value={form.brand} onChange={set('brand')} />
          </div>
          <div className="grow">
            <label>Category</label>
            <select required value={form.category} onChange={set('category')}>
              <option value="">Select…</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <label className="radio">
          <input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured on home page
        </label>

        <label>Images</label>
        <div className="thumbs">
          {form.images.map((img, i) => (
            <div key={img + i} className="thumb-wrap">
              <img src={imgUrl(img)} alt="" />
              <button type="button" onClick={() => removeImg(i)}>✕</button>
            </div>
          ))}
        </div>
        <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} />
        <div className="row">
          <input placeholder="…or paste an image URL" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} />
          <button type="button" className="btn" onClick={addUrl}>Add</button>
        </div>

        <div className="row">
          <button className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : 'Save product'}</button>
          <button type="button" className="btn" onClick={() => navigate('/admin/products')}>Cancel</button>
        </div>
      </form>
    </>
  );
}
