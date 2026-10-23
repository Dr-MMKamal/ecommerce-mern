import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../../api/axios';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v != null));
    return (await api.get('/products', { params: clean })).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchFeatured = createAsyncThunk('products/fetchFeatured', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/products', { params: { featured: true, limit: 4 } })).data.products;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    return (await api.get(`/products/${id}`)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const fetchCategories = createAsyncThunk('products/fetchCategories', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/categories')).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const addReview = createAsyncThunk('products/addReview', async ({ id, rating, comment }, { rejectWithValue, dispatch }) => {
  try {
    await api.post(`/products/${id}/reviews`, { rating, comment });
    dispatch(fetchProduct(id));
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    featured: [],
    categories: [],
    current: null,
    page: 1,
    pages: 1,
    total: 0,
    loading: false,
    error: null,
    reviewError: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProducts.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.items = payload.products;
        s.page = payload.page;
        s.pages = payload.pages;
        s.total = payload.total;
      })
      .addCase(fetchProducts.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
      .addCase(fetchFeatured.fulfilled, (s, { payload }) => {
        s.featured = payload;
      })
      .addCase(fetchProduct.pending, (s) => {
        s.loading = true;
        s.error = null;
      })
      .addCase(fetchProduct.fulfilled, (s, { payload }) => {
        s.loading = false;
        s.current = payload;
      })
      .addCase(fetchProduct.rejected, (s, { payload }) => {
        s.loading = false;
        s.error = payload;
      })
      .addCase(fetchCategories.fulfilled, (s, { payload }) => {
        s.categories = payload;
      })
      .addCase(addReview.pending, (s) => {
        s.reviewError = null;
      })
      .addCase(addReview.rejected, (s, { payload }) => {
        s.reviewError = payload;
      });
  },
});

export default productSlice.reducer;
