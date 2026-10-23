import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../../api/axios';
import { clearCart } from '../cart/cartSlice';

export const createOrder = createAsyncThunk('orders/create', async (order, { rejectWithValue, dispatch }) => {
  try {
    const { data } = await api.post('/orders', order);
    dispatch(clearCart());
    return data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchMyOrders = createAsyncThunk('orders/mine', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/orders/mine')).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchOrder = createAsyncThunk('orders/one', async (id, { rejectWithValue }) => {
  try {
    return (await api.get(`/orders/${id}`)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const cancelOrder = createAsyncThunk('orders/cancel', async (id, { rejectWithValue }) => {
  try {
    return (await api.put(`/orders/${id}/cancel`)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: { mine: [], current: null, loading: false, error: null, created: null },
  reducers: {
    resetCreated: (s) => {
      s.created = null;
      s.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(createOrder.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.created = payload;
      })
      .addCase(createOrder.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
      .addCase(fetchMyOrders.pending, (s) => {
        s.loading = true;
      })
      .addCase(fetchMyOrders.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.mine = payload;
      })
      .addCase(fetchMyOrders.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
      .addCase(fetchOrder.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchOrder.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.current = payload;
      })
      .addCase(fetchOrder.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
      .addCase(cancelOrder.fulfilled, (s, { payload }) => {
        s.current = { ...s.current, ...payload };
        s.mine = s.mine.map((o) => (o._id === payload._id ? payload : o));
      });
  },
});

export const { resetCreated } = orderSlice.actions;
export default orderSlice.reducer;
