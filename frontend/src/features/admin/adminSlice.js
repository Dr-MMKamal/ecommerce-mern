import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../../api/axios';

const thunk = (name, fn) =>
  createAsyncThunk(`admin/${name}`, async (arg, { rejectWithValue }) => {
    try {
      return await fn(arg);
    } catch (e) {
      return rejectWithValue(errMsg(e));
    }
  });

export const fetchStats = thunk('stats', async () => (await api.get('/dashboard/stats')).data);

// Products
export const adminSaveProduct = thunk('saveProduct', async ({ id, data }) =>
  (id ? await api.put(`/products/${id}`, data) : await api.post('/products', data)).data
);
export const adminDeleteProduct = thunk('deleteProduct', async (id) => {
  await api.delete(`/products/${id}`);
  return id;
});
export const uploadImage = thunk('uploadImage', async (file) => {
  const form = new FormData();
  form.append('image', file);
  return (await api.post('/upload', form)).data.url;
});

// Orders
export const fetchAllOrders = thunk('orders', async (status) =>
  (await api.get('/orders', { params: status ? { status } : {} })).data
);
export const updateOrderStatus = thunk('updateOrder', async ({ id, ...body }) =>
  (await api.put(`/orders/${id}/status`, body)).data
);

// Users
export const fetchUsers = thunk('users', async () => (await api.get('/users')).data);
export const updateUser = thunk('updateUser', async ({ id, ...body }) => (await api.put(`/users/${id}`, body)).data);
export const deleteUser = thunk('deleteUser', async (id) => {
  await api.delete(`/users/${id}`);
  return id;
});

// Categories
export const saveCategory = thunk('saveCategory', async ({ id, ...body }) =>
  (id ? await api.put(`/categories/${id}`, body) : await api.post('/categories', body)).data
);
export const deleteCategory = thunk('deleteCategory', async (id) => {
  await api.delete(`/categories/${id}`);
  return id;
});

const adminSlice = createSlice({
  name: 'admin',
  initialState: { stats: null, orders: [], users: [], loading: false, error: null },
  reducers: {
    clearAdminError: (s) => {
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStats.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchStats.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.stats = payload;
      })
      .addCase(fetchAllOrders.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchAllOrders.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.orders = payload;
      })
      .addCase(updateOrderStatus.fulfilled, (s, { payload }) => {
        s.orders = s.orders.map((o) => (o._id === payload._id ? { ...o, ...payload, user: o.user } : o));
      })
      .addCase(fetchUsers.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchUsers.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.users = payload;
      })
      .addCase(updateUser.fulfilled, (s, { payload }) => {
        s.users = s.users.map((u) => (u._id === payload._id ? payload : u));
      })
      .addCase(deleteUser.fulfilled, (s, { payload }) => {
        s.users = s.users.filter((u) => u._id !== payload);
      })
      .addMatcher(
        (a) => a.type.startsWith('admin/') && a.type.endsWith('/rejected'),
        (s, { payload }) => {
          s.loading = false;
          s.error = payload;
        }
      );
  },
});

export const { clearAdminError } = adminSlice.actions;
export default adminSlice.reducer;
