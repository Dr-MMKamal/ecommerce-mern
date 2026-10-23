import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { errMsg } from '../../api/axios';

export const registerUser = createAsyncThunk('auth/register', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/auth/register', data)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const loginUser = createAsyncThunk('auth/login', async (data, { rejectWithValue }) => {
  try {
    return (await api.post('/auth/login', data)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const logoutUser = createAsyncThunk('auth/logout', async () => {
  await api.post('/auth/logout');
});

// Restores the session on page load using the cookie
export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return (await api.get('/auth/me')).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    return (await api.put('/users/profile', data)).data;
  } catch (e) {
    return rejectWithValue(errMsg(e));
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: { user: null, loading: false, initializing: true, error: null },
  reducers: {
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    const pending = (state) => {
      state.loading = true;
      state.error = null;
    };
    const fulfilled = (state, { payload }) => {
      state.loading = false;
      state.user = payload;
    };
    const rejected = (state, { payload }) => {
      state.loading = false;
      state.error = payload;
    };

    builder
      .addCase(registerUser.pending, pending)
      .addCase(registerUser.fulfilled, fulfilled)
      .addCase(registerUser.rejected, rejected)
      .addCase(loginUser.pending, pending)
      .addCase(loginUser.fulfilled, fulfilled)
      .addCase(loginUser.rejected, rejected)
      .addCase(updateProfile.pending, pending)
      .addCase(updateProfile.fulfilled, fulfilled)
      .addCase(updateProfile.rejected, rejected)
      .addCase(logoutUser.fulfilled, (state) => {
        state.user = null;
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.user = payload;
        state.initializing = false;
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null;
        state.initializing = false;
      });
  },
});

export const { clearAuthError } = authSlice.actions;
export default authSlice.reducer;
