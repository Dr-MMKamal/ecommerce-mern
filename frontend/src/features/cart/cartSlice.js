import { createSlice } from '@reduxjs/toolkit';

const saved = (() => {
  try {
    return JSON.parse(localStorage.getItem('cart'));
  } catch {
    return null;
  }
})();

const initialState = {
  items: saved?.items || [],
  shippingAddress: saved?.shippingAddress || {},
  paymentMethod: saved?.paymentMethod || 'COD',
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, { payload }) => {
      // payload: { product, name, image, price, countInStock, qty }
      const existing = state.items.find((i) => i.product === payload.product);
      if (existing) {
        existing.qty = Math.min(existing.qty + payload.qty, payload.countInStock);
        existing.countInStock = payload.countInStock;
      } else {
        state.items.push({ ...payload, qty: Math.min(payload.qty, payload.countInStock) });
      }
    },
    setQty: (state, { payload }) => {
      const item = state.items.find((i) => i.product === payload.product);
      if (item) item.qty = Math.max(1, Math.min(payload.qty, item.countInStock));
    },
    removeFromCart: (state, { payload }) => {
      state.items = state.items.filter((i) => i.product !== payload);
    },
    saveShippingAddress: (state, { payload }) => {
      state.shippingAddress = payload;
    },
    savePaymentMethod: (state, { payload }) => {
      state.paymentMethod = payload;
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const selectCartCount = (state) => state.cart.items.reduce((s, i) => s + i.qty, 0);
export const selectCartTotal = (state) => state.cart.items.reduce((s, i) => s + i.qty * i.price, 0);

export const { addToCart, setQty, removeFromCart, saveShippingAddress, savePaymentMethod, clearCart } =
  cartSlice.actions;
export default cartSlice.reducer;
