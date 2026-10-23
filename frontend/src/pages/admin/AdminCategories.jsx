import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCategories } from '../../features/product/productSlice';
import { saveCategory, deleteCategory } from '../../features/admin/adminSlice';

export default function AdminCategories() {
  const dispatch = useDispatch();
  const categories = useSelector((s) => s.products.categories);
  const [form, setForm] = useState({ id: null, name: '', description: '' });

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  const reset = () => setForm({ id: null, name: '', description: '' });

  const submit = async (e) => {
    e.preventDefault();
    const res = await dispatch(saveCategory(form));
    if (!res.error) {
      reset();
      dispatch(fetchCategories());
    }
  };

  const onDelete = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    const res = await dispatch(deleteCategory(c._id));
    if (!res.error) dispatch(fetchCategories());
  };

  return (
    <>
      <h1>Categories</h1>
      <div className="two-col">
        <div className="card table-wrap">
          <table className="table">
            <thead><tr><th>Name</th><th>Description</th><th /></tr></thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c._id}>
                  <td>{c.name}</td>
                  <td className="muted">{c.description}</td>
                  <td className="actions">
                    <button className="btn btn-sm" onClick={() => setForm({ id: c._id, name: c.name, description: c.description || '' })}>Edit</button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete(c)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <form className="card card-body form" onSubmit={submit}>
          <h3>{form.id ? 'Edit category' : 'Add category'}</h3>
          <label>Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label>Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="row">
            <button className="btn btn-primary">{form.id ? 'Update' : 'Add'}</button>
            {form.id && <button type="button" className="btn" onClick={reset}>Cancel</button>}
          </div>
        </form>
      </div>
    </>
  );
}
