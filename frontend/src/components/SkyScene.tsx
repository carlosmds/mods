import React, { useRef, useMemo } from 'react';
import { Stage, Layer, Text, Circle, Group } from 'react-konva';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import AerialVehicle from './AerialVehicle';
import SkyElement from './SkyElement';
import RainParticle from './RainParticle';
import SnowParticle from './SnowParticle';
import Terrain from './Terrain';
import { Ad } from '../store/slices/adsSlice';
import { TimeOfDay, Weather, UIState } from '../store/slices/uiSlice';

interface SkySceneProps {
  width: number;
  height: number;
}

// Lane configuration constants
const LANES = {
  CLOUDS: {
    START: 0,
    END: 0.25, // Top 25% of screen for clouds
  },
  VEHICLES: {
    FIRST: {
      START: 0.23,
      END: 0.31,
    },
    SECOND: {
      START: 0.31,
      END: 0.39,
    },
    THIRD: {
      START: 0.39,
      END: 0.47,
    },
    FOURTH: {
      START: 0.47,
      END: 0.55,
    },
    FIFTH: {
      START: 0.55,
      END: 0.63,
    },
    SIXTH: {
      START: 0.63,
      END: 0.71,
    },
  },
  TERRAIN: {
    START: 0.71,
    END: 1.0,
  },
};

export const MAX_ADS = 6; // Export this constant for use in other components

// Debug mode from environment variable
const isDebugMode = import.meta.env.VITE_DEBUG_MODE === 'true';

// Function to calculate vehicle height based on index
const getVehicleHeight = (index: number, totalHeight: number): number => {
  // One vehicle per lane, up to 6 lanes
  if (index >= MAX_ADS) return 0;
  
  switch (index) {
    case 0:
    return totalHeight * (LANES.VEHICLES.FIRST.START + ((LANES.VEHICLES.FIRST.END - LANES.VEHICLES.FIRST.START) / 2));
    case 1:
    return totalHeight * (LANES.VEHICLES.SECOND.START + ((LANES.VEHICLES.SECOND.END - LANES.VEHICLES.SECOND.START) / 2));
    case 2:
      return totalHeight * (LANES.VEHICLES.THIRD.START + ((LANES.VEHICLES.THIRD.END - LANES.VEHICLES.THIRD.START) / 2));
    case 3:
      return totalHeight * (LANES.VEHICLES.FOURTH.START + ((LANES.VEHICLES.FOURTH.END - LANES.VEHICLES.FOURTH.START) / 2));
    case 4:
      return totalHeight * (LANES.VEHICLES.FIFTH.START + ((LANES.VEHICLES.FIFTH.END - LANES.VEHICLES.FIFTH.START) / 2));
    case 5:
      return totalHeight * (LANES.VEHICLES.SIXTH.START + ((LANES.VEHICLES.SIXTH.END - LANES.VEHICLES.SIXTH.START) / 2));
    default:
      return totalHeight * LANES.VEHICLES.FIRST.START;
  }
};

// Add a function to render the sun or moon
const renderCelestialBody = (timeOfDay: TimeOfDay, width: number, height: number) => {
  if (timeOfDay === 'night') {
    // Moon
    return (
      <>
        <Circle
          x={width * 0.85}
          y={height * (LANES.CLOUDS.END / 2)}
          radius={40}
          fill="#FFFFFF"
          shadowColor="#FFFFFF"
          shadowBlur={20}
          shadowOpacity={0.8}
        />
        <Circle
          x={width * 0.85}
          y={height * (LANES.CLOUDS.END / 2)}
          radius={45}
          fill="transparent"
          shadowColor="#FFFFFF"
          shadowBlur={30}
          shadowOpacity={0.4}
        />
      </>
    );
  } else {
    // Sun
    return (
      <>
        <Circle
          x={width * 0.15}
          y={height * (LANES.CLOUDS.END / 2)}
          radius={40}
          fill="#FFD700"
          shadowColor="#FFD700"
          shadowBlur={40}
          shadowOpacity={0.5}
        />
        <Circle
          x={width * 0.15}
          y={height * (LANES.CLOUDS.END / 2)}
          radius={60}
          fill="transparent"
          shadowColor="#FFD700"
          shadowBlur={60}
          shadowOpacity={0.2}
        />
      </>
    );
  }
};

// Update getBackgroundColor to be DRY and handle day/night
const getBackgroundColor = (timeOfDay: TimeOfDay, weather: Weather): string => {
  const baseDay = '#87CEEB'; // Blue sky
  const baseNight = '#0a1428';
  if (timeOfDay === 'night') {
    switch (weather) {
      // case 'cloudy': return '#1a1a2e';
      // case 'rainy': return '#0a0a1e';
      // case 'snowy': return '#1a1a3e';
      default: return baseNight;
    }
  } else {
    switch (weather) {
      // case 'cloudy': return '#C0C0C0';
      // case 'rainy': return '#708090';
      // case 'snowy': return '#FFFFFF';
      default: return baseDay;
    }
  }
};

// Update renderNightSky to render stars only at night
const renderSkyExtras = (timeOfDay: TimeOfDay, width: number, height: number) => {
  if (timeOfDay !== 'night') return null;
  // Create stars only in the upper portion of the sky
  const stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * width,
    y: Math.random() * (height * LANES.VEHICLES.FIRST.START),
    radius: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.5,
  }));
  return stars.map((star, i) => (
    <Circle
      key={i}
      x={star.x}
      y={star.y}
      radius={star.radius}
      fill="#FFFFFF"
      opacity={star.opacity}
      shadowColor="#FFFFFF"
      shadowBlur={5}
      shadowOpacity={0.3}
    />
  ));
};

const SkyScene: React.FC<SkySceneProps> = ({ width, height }) => {
  const stageRef = useRef<any>(null);
  const ads = useSelector((state: RootState) => state.ads.ads);
  const ui = useSelector((state: RootState) => state.ui as UIState);

  // Generate cloud positions - memoized to prevent regeneration on every render
  const clouds = useMemo(() => {
    const numClouds = ui.weather === 'clear' ? 1 : (ui.weather === 'cloudy' ? 8 : 12);
    
    const getCloudScale = () => {
      switch (ui.weather) {
        case 'rainy':
        case 'snowy':
          return { min: 1.6, max: 2.4 };
        case 'cloudy':
          return { min: 0.8, max: 1.8 };
        default:
          return { min: 0.5, max: 0.8 };
      }
    };

    const scaleRange = getCloudScale();
    const cloudLaneHeight = height * LANES.CLOUDS.END;

    return Array.from({ length: numClouds }, () => {
      const scale = Math.random() * (scaleRange.max - scaleRange.min) + scaleRange.min;
      // Calculate y position within cloud lane, accounting for cloud height to prevent overflow
      const maxY = cloudLaneHeight - (100 * scale); // 100 is approximate cloud height
      const minY = height * LANES.CLOUDS.START; // Some padding from top
      return {
        x: Math.random() * width,
        y: Math.random() * (maxY - minY) + minY,
        speed: Math.random() * 4 + 2,
        scale: scale,
      };
    });
  }, [width, height, ui.weather]);

  const renderWeatherElements = () => {
    switch (ui.weather) {
      case 'clear':
        // Render a few scattered clouds
        return clouds.map((cloud, i) => (
          <SkyElement
            key={`cloud-${i}`}
            type="cloud"
            x={cloud.x}
            y={cloud.y}
            stageWidth={width}
            scale={cloud.scale}
            speed={cloud.speed}
          />
        ));
      case 'cloudy':
        // Render more clouds
        return clouds.map((cloud, i) => (
          <SkyElement
            key={`cloud-${i}`}
            type="cloud"
            x={cloud.x}
            y={cloud.y}
            stageWidth={width}
            scale={cloud.scale}
            speed={cloud.speed}
          />
        ));
      case 'rainy':
        return (
          <>
            {clouds.map((cloud, i) => (
              <SkyElement
                key={`cloud-${i}`}
                type="cloud"
                x={cloud.x}
                y={cloud.y}
                stageWidth={width}
                scale={cloud.scale}
                speed={cloud.speed}
              />
            ))}
            {Array.from({ length: 300 }).map((_, i) => (
              <RainParticle
                key={`rain-${i}`}
                x={Math.random() * (width * 1.5)} // Start particles beyond the right edge
                y={Math.random() * height} // Distribute across full height
                stageWidth={width}
                stageHeight={height}
                speed={Math.random() * 400 + 300} // Faster speed between 300-700
              />
            ))}
          </>
        );
      case 'snowy':
        return (
          <>
            {clouds.map((cloud, i) => (
              <SkyElement
                key={`cloud-${i}`}
                type="cloud"
                x={cloud.x}
                y={cloud.y}
                stageWidth={width}
                scale={cloud.scale}
                speed={cloud.speed}
              />
            ))}
            {Array.from({ length: 200 }).map((_, i) => (
              <SnowParticle
                key={`snow-${i}`}
                x={Math.random() * (width * 1.2)} // Start particles beyond the edges
                y={Math.random() * height} // Distribute across full height
                stageWidth={width}
                stageHeight={height}
                speed={Math.random() * 50 + 30} // Slower speed between 30-80
              />
            ))}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        style={{ backgroundColor: getBackgroundColor(ui.timeOfDay, ui.weather) }}
      >
        <Layer>
          {renderCelestialBody(ui.timeOfDay, width, height)}
          {renderSkyExtras(ui.timeOfDay, width, height)}
          {renderWeatherElements()}
          {ads.map((ad: Ad, index: number) => (
            <AerialVehicle
              key={ad.id}
              ad={ad}
              stageWidth={width}
              y={getVehicleHeight(index, height)}
            />
          ))}
          <Group y={height * LANES.TERRAIN.START}>
            <Terrain
              width={width + 100} // Add extra width to prevent edge gap
              height={height * (LANES.TERRAIN.END - LANES.TERRAIN.START)}
              season={ui.season}
            />
          </Group>
          {isDebugMode && (
          <Text
            text={`Debug Info:
Time: ${ui.timeOfDay}
Season: ${ui.season}
Weather: ${ui.weather}
Ads: ${ads.length}`}
            x={10}
            y={10}
            fill={ui.timeOfDay === 'night' ? 'white' : 'black'}
            fontSize={14}
          />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default SkyScene; 