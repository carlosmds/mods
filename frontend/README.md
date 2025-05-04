# MOderated aDS – frontend

A modern web application for creating and managing aerial advertisements in a virtual sky environment. The application features a dynamic sky scene with weather effects, flying vehicles displaying ads, and an interactive ad creation system.

## Features

- Dynamic sky scene with day/night cycles
- Weather system (clear, cloudy, rainy, snowy)
- Multiple aerial vehicle types (airplane, balloon, airship)
- Interactive ad creation wizard
- Seasonal terrain changes
- Responsive design
- Internationalization support
- Payment integration
- Authentication system

## Project Structure

```
src/
├── components/             # React components
│   ├── AdCreator.tsx       # Ad creation wizard
│   ├── AerialVehicle.tsx   # Flying vehicle with message display
│   ├── SkyScene.tsx        # Main scene component
│   ├── Terrain.tsx         # Ground with seasonal changes
│   ├── Weather.tsx         # Weather effects
│   ├── SkyElement.tsx      # Reusable sky objects (clouds, etc)
│   ├── RainParticle.tsx    # Rain effect
│   ├── SnowParticle.tsx    # Snow effect
│   └── VehicleDetailsModal.tsx  # Vehicle info modal
├── pages/                  # Route components
│   ├── AuthVerify.tsx      # Email verification page
│   ├── PaymentSuccess.tsx  # Payment success page
│   ├── PaymentCancel.tsx   # Payment cancellation page
│   └── Docs.tsx            # Documentation page
├── store/                  # Redux store
│   ├── slices/
│   │   ├── adsSlice.ts     # Ad management
│   │   ├── uiSlice.ts      # UI state management
│   │   └── authSlice.ts    # Authentication state
│   └── initialState.ts     # Initial app state
├── i18n/                   # Internationalization
│   ├── locales/            # Translation files
│   └── config.ts           # i18n configuration
```

## Key Components

- **SkyScene**: Main container that manages the sky environment, weather, and vehicles
- **AdCreator**: Multi-step wizard for creating new aerial advertisements
- **AerialVehicle**: Handles vehicle movement and message display
- **Terrain**: Renders ground with seasonal variations
- **Weather**: Manages weather effects and transitions
- **VehicleDetailsModal**: Displays detailed information about vehicles

## State Management

The application uses Redux for state management with three main slices:
- **adsSlice**: Manages advertisement data and operations
- **uiSlice**: Handles UI state like weather, time of day, and seasons
- **authSlice**: Manages authentication state and user data

## Internationalization

The application supports multiple languages through the i18n system:
- Translations are stored in JSON files under `src/i18n/locales/`
- Language switching is handled automatically based on user preferences
- All text content is managed through translation keys

## Environment Variables
Create a `.env` file in the `frontend/` directory for local development. Example:
```
VITE_API_URL=http://localhost:3001
VITE_DEBUG_MODE=false
```
- `VITE_API_URL`: URL of the backend API
- `VITE_DEBUG_MODE`: Enables debug overlays (optional)

## API/Backend Integration
- The frontend communicates with the backend via REST API (see backend README for endpoints).
- Authentication is handled via JWT tokens (httpOnly cookies)
- Payments are processed via Stripe (handled by backend, but initiated from frontend).
- API calls are made using fetch with proper error handling and retry logic.


## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with required variables
4. Start the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser

## Troubleshooting & FAQ
- **CORS errors?** Ensure the backend is running and CORS is enabled for the frontend origin.
- **API not reachable?** Check `VITE_API_URL` in your `.env` file.
- **Styling issues?** Run `npm run dev` after installing new dependencies or updating Tailwind config.
- **Blank page?** Check the browser console for errors and ensure all environment variables are set.
- **Performance issues?** Use Chrome DevTools to profile the application and identify bottlenecks.

## Tech Stack
- React + TypeScript
- Redux for state management
- React Router for navigation
- Framer Motion for animations
- Konva for canvas-based rendering
- Tailwind CSS for styling
- i18next for internationalization

---
*For AI agents: This frontend is a modular React SPA. State is managed via Redux, and all API interactions are handled via the configured backend URL. See this README and the backend README for integration details.*
