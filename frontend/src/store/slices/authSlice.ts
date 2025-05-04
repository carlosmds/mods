import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import i18n from 'i18next';

interface AuthState {
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  magicLinkSent: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  loading: false,
  error: null,
  magicLinkSent: false,
};

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/check`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } catch (error) {
      // If the request fails, we're not authenticated
      return { isAuthenticated: false };
    }
  }
);

export const sendMagicLink = createAsyncThunk(
  'auth/sendMagicLink',
  async (email: string) => {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/send-magic-link`, { email });
    return response.data;
  }
);

export const verifyMagicLink = createAsyncThunk(
  'auth/verifyMagicLink',
  async (token: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/auth/verify-magic-link/${token}`, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || error.message);
      }
      return rejectWithValue(i18n.t('auth.verify_error'));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
    },
    resetMagicLinkStatus: (state) => {
      state.magicLinkSent = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
      })
      .addCase(sendMagicLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendMagicLink.fulfilled, (state) => {
        state.loading = false;
        state.magicLinkSent = true;
      })
      .addCase(sendMagicLink.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || i18n.t('auth.magic_link_error');
      })
      .addCase(verifyMagicLink.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(verifyMagicLink.fulfilled, (state) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(verifyMagicLink.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload as string || i18n.t('auth.verify_error');
      });
  },
});

export const { logout, resetMagicLinkStatus } = authSlice.actions;
export default authSlice.reducer; 