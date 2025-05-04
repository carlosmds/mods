import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type TimeOfDay = 'day' | 'night';
export type Season = 'spring' | 'summer' | 'autumn' | 'winter';
export type Weather = 'clear' | 'cloudy' | 'rainy' | 'snowy';

export interface UIState {
  timeOfDay: TimeOfDay;
  season: Season;
  weather: Weather;
  isAdCreatorOpen: boolean;
}

const initialState: UIState = {
  timeOfDay: 'day', // 'day', 'night'
  season: 'spring', // 'spring', 'summer', 'autumn', 'winter'
  weather: 'cloudy', // 'clear', 'cloudy', 'rainy', 'snowy'
  isAdCreatorOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setTimeOfDay: (state, action: PayloadAction<TimeOfDay>) => {
      state.timeOfDay = action.payload;
    },
    setSeason: (state, action: PayloadAction<Season>) => {
      state.season = action.payload;
    },
    setWeather: (state, action: PayloadAction<Weather>) => {
      state.weather = action.payload;
    },
    toggleAdCreator: (state) => {
      state.isAdCreatorOpen = !state.isAdCreatorOpen;
    },
  },
});

export const { setTimeOfDay, setSeason, setWeather, toggleAdCreator } = uiSlice.actions;
export default uiSlice.reducer; 