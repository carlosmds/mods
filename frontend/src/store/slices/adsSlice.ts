import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';

export type AdDuration = '1d' | '1w' | '1m';

export interface Ad {
  id: string;
  message: string;
  vehicleType: 'airplane' | 'balloon' | 'airship';
  createdAt: string;
  duration: AdDuration;
  active: boolean;
  userEmail?: string;
  expiresAt?: number;
}

interface AdsState {
  ads: Ad[];
  selectedAd: Ad | null;
  loading: boolean;
  error: string | null;
}

const initialState: AdsState = {
  ads: [],
  selectedAd: null,
  loading: false,
  error: null,
};

// Create a new ad
export const createAd = createAsyncThunk(
  'ads/createAd',
  async (adData: Omit<Ad, 'id' | 'createdAt' | 'active' | 'userEmail' | 'expiresAt'>, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ads`,
        adData,
        {
          withCredentials: true
        }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return rejectWithValue(error.response?.data?.error || error.message);
      }
      return rejectWithValue('Failed to create ad');
    }
  }
);

// Create Stripe checkout session
export const createCheckoutSession = createAsyncThunk(
  'ads/createCheckoutSession',
  async ({ adId, duration }: { adId: string; duration: AdDuration }) => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/payments/create-checkout-session`,
        { adId, duration },
        {
          withCredentials: true
        }
      );
      
      // Redirect to Stripe Checkout
      const stripe = await loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
      if (!stripe) {
        throw new Error('Failed to load Stripe');
      }
      
      const { error } = await stripe.redirectToCheckout({
        sessionId: response.data.sessionId,
      });
      
      if (error) {
        throw new Error(error.message || 'Failed to redirect to Stripe checkout');
      }
      
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.error || error.message);
      }
      throw error;
    }
  }
);

// Fetch active ads
export const fetchActiveAds = createAsyncThunk(
  'ads/fetchActiveAds',
  async () => {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/ads/active`);
    return response.data;
  }
);

const adsSlice = createSlice({
  name: 'ads',
  initialState,
  reducers: {
    setAds: (state, action: PayloadAction<Ad[]>) => {
      state.ads = action.payload;
    },
    addAd: (state, action: PayloadAction<Ad>) => {
      state.ads.push(action.payload);
    },
    updateAd: (state, action: PayloadAction<Ad>) => {
      const index = state.ads.findIndex(ad => ad.id === action.payload.id);
      if (index !== -1) {
        state.ads[index] = action.payload;
      }
    },
    removeAd: (state, action: PayloadAction<string>) => {
      state.ads = state.ads.filter(ad => ad.id !== action.payload);
    },
    setSelectedAd: (state, action: PayloadAction<Ad | null>) => {
      state.selectedAd = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Ad
      .addCase(createAd.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAd.fulfilled, (state) => {
        state.loading = false;
        // Don't add the ad to the list since it's not active yet
        state.error = null;
      })
      .addCase(createAd.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) || action.error.message || 'Failed to create ad';
      })
      // Fetch Active Ads
      .addCase(fetchActiveAds.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveAds.fulfilled, (state, action) => {
        state.loading = false;
        state.ads = action.payload;
      })
      .addCase(fetchActiveAds.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch ads';
      })
      // Create Checkout Session
      .addCase(createCheckoutSession.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCheckoutSession.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(createCheckoutSession.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create checkout session';
      });
  },
});

export const {
  setAds,
  addAd,
  updateAd,
  removeAd,
  setSelectedAd,
  setLoading,
  setError,
} = adsSlice.actions;

export default adsSlice.reducer; 