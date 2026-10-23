import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import productReducer from '../features/product/productSlice';
import cartReducer from '../features/cart/cartSlice';
import orderReducer from '../features/order/orderSlice';
import adminReducer from '../features/admin/adminSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    cart: cartReducer,
    orders: orderReducer,
    admin: adminReducer,
  },
});

// Persist only the cart (the auth session lives in the httpOnly cookie, not localStorage)
store.subscribe(() => {
  try {
    localStorage.setItem('cart', JSON.stringify(store.getState().cart));
  } catch {
    /* ignore storage errors */
  }
});
