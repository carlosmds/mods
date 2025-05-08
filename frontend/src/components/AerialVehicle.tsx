import React, { useEffect, useRef, useState } from 'react';
import { Group, Image, Text, Rect, Line } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';
import { Ad } from '../store/slices/adsSlice';

import { useDispatch } from 'react-redux';
import { setSelectedAd } from '../store/slices/adsSlice';

type VehicleType = 'airplane' | 'balloon' | 'airship';

interface AerialVehicleProps {
  ad: Ad;
  stageWidth: number;
  y: number;
}

// Vehicle image paths
const vehicleImages: Record<VehicleType, string> = {
  airplane: '/icons/airplane.svg',
  balloon: '/icons/balloon.svg',
  airship: '/icons/airship.svg',
};

// Vehicle-specific sizes (reduced to better fit with text)
const VEHICLE_SIZES: Record<VehicleType, number> = {
  airplane: 80,
  balloon: 80,
  airship: 80,
};

const SPEED = 24;

// Vehicle-specific speeds
const VEHICLE_SPEEDS: Record<VehicleType, number> = {
  airplane: SPEED * 1.2,
  balloon: SPEED * 0.6,
  airship: SPEED * 0.8,
};

// Utility to estimate text width (monospace for LED, sans-serif for others)
const estimateTextWidth = (text: string, fontSize: number, fontFamily: string = 'sans-serif') => {
  const factor = fontFamily === 'monospace' ? 0.6 : 0.55;
  return text.length * fontSize * factor + 16;
};

// Utility to estimate number of lines for a given width
const estimateLineCount = (text: string, width: number, fontSize: number, fontFamily: string = 'sans-serif') => {
  const factor = fontFamily === 'monospace' ? 0.6 : 0.55;
  const charsPerLine = Math.floor((width - 16) / (fontSize * factor));
  return Math.max(1, Math.ceil(text.length / charsPerLine));
};

// Helper to calculate banner dimensions
const getBannerDimensions = (
  text: string,
  scale: number,
  bannerWidth: number,
  fontFamily: string,
  padding: number,
  minLines: number = 2
) => {
  const fontSize = 14 * scale;
  const minHeight = fontSize * 1.2 * minLines + padding;
  const lineCount = estimateLineCount(text, bannerWidth, fontSize, fontFamily);
  const height = Math.max(minHeight, fontSize * 1.2 * lineCount + padding);
  return { fontSize, minLines, padding, minHeight, lineCount, height };
};

// LED Display Component
const LEDDisplay: React.FC<{ text: string; scale: number; bannerWidth: number }> = ({ text, scale, bannerWidth }) => {
  const fontFamily = 'monospace';
  const padding = 5;
  const { fontSize, height } = getBannerDimensions(text, scale, bannerWidth, fontFamily, padding);
  return (
    <Group 
      x={-bannerWidth - 10 * scale}
      y={-(height - VEHICLE_SIZES.airship * scale) / 2}
    >
      <Rect
        width={bannerWidth}
        height={height}
        fill="#000000"
        cornerRadius={5 * scale}
      />
      <Text
        text={text}
        width={bannerWidth}
        height={height}
        fontSize={fontSize}
        fontFamily={fontFamily}
        fill="#FFD700"
        align="center"
        verticalAlign="middle"
        wrap="word"
        padding={padding}
      />
    </Group>
  );
};

// Smoke Writing Component
const SmokeWriting: React.FC<{ text: string; scale: number; bannerWidth: number }> = ({ text, scale, bannerWidth }) => {
  const fontFamily = 'sans-serif';
  const padding = 5;
  const { fontSize, height } = getBannerDimensions(text, scale, bannerWidth, fontFamily, padding);
  return (
    <Group 
      x={-bannerWidth - 10 * scale}
      y={-(height - VEHICLE_SIZES.airplane * scale) / 2}
    >
      <Text
        text={text}
        width={bannerWidth}
        height={height}
        fontSize={fontSize}
        fontStyle="bold"
        fontFamily={fontFamily}
        fill="#FFFFFF"
        align="center"
        verticalAlign="middle"
        wrap="word"
        padding={padding}
        shadowColor="#CCCCCC"
        shadowBlur={10}
        shadowOpacity={0.8}
        opacity={0.9}
      />
    </Group>
  );
};

// Banner Component
const BannerDisplay: React.FC<{ text: string; scale: number; bannerWidth: number }> = ({ text, scale, bannerWidth }) => {
  const fontFamily = 'sans-serif';
  const padding = 5;
  const { fontSize, height } = getBannerDimensions(text, scale, bannerWidth, fontFamily, padding);
  return (
    <Group 
      x={-bannerWidth - 10 * scale}
      y={-(height - VEHICLE_SIZES.balloon * scale) / 2}
    >
      <Rect
        width={bannerWidth}
        height={height}
        fill="#FFFFFF"
        stroke="#000000"
        strokeWidth={1}
        shadowColor="#000000"
        shadowBlur={5}
        shadowOpacity={0.3}
        cornerRadius={2}
      />
      {[1, 2, 3].map((i) => (
        <Line
          key={i}
          points={[
            0,
            (height / 4) * i,
            bannerWidth,
            (height / 4) * i,
          ]}
          stroke="#000000"
          strokeWidth={0.5}
          opacity={0.1}
          tension={0.5}
        />
      ))}
      <Text
        text={text}
        width={bannerWidth}
        height={height}
        fontSize={fontSize}
        fontStyle="bold"
        fontFamily={fontFamily}
        fill="#000000"
        align="center"
        verticalAlign="middle"
        wrap="word"
        padding={padding}
      />
    </Group>
  );
};

// Utility to get max banner width based on device
const getMaxBannerWidth = (stageWidth: number) => {
  return window.innerWidth <= 600
    ? stageWidth * 0.99 // mobile: 99%
    : stageWidth * 0.6; // desktop: 60%
};

const AerialVehicle: React.FC<AerialVehicleProps> = ({ ad, stageWidth, y }) => {
  const vehicleType = ad.vehicleType as VehicleType;
  const [vehicleImage] = useImage(vehicleImages[vehicleType]);
  const groupRef = useRef<Konva.Group>(null);
  const vehicleSize = VEHICLE_SIZES[vehicleType];
  
  // Estimate banner width based on text and font
  const fontFamily = vehicleType === 'airship' ? 'monospace' : 'sans-serif';
  const baseFontSize = 14;
  const maxBannerWidth = getMaxBannerWidth(stageWidth) - vehicleSize - 10; // leave space for vehicle and margin
  const rawBannerWidth = estimateTextWidth(ad.message, baseFontSize, fontFamily);
  // Banner width: no more than maxBannerWidth, but at least 120px
  const bannerWidth = Math.max(120, Math.min(rawBannerWidth, maxBannerWidth));

  // Calculate scale so that vehicle + banner + margin fits in stageWidth (should always be 1 now)
  const scale = 1;
  
  // Initialize with a random position between -vehicleSize and stageWidth
  const [position, setPosition] = useState(() => {
    return Math.random() * (stageWidth + vehicleSize * 2) - vehicleSize;
  });
  
  const dispatch = useDispatch();
  
  // Keep track of animation state in a ref to prevent re-renders from affecting it
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());
  const positionRef = useRef<number>(position);

  // Move from left to right
  useEffect(() => {
    if (!groupRef.current) return;

    const animate = () => {
      const currentTime = Date.now();
      const timeDiff = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;

      const vehicleSpeed = VEHICLE_SPEEDS[vehicleType];
      const newX = positionRef.current + (timeDiff * vehicleSpeed / 1000);
      
      // Calculate the total width including message box and vehicle
      const scaledMessageWidth = bannerWidth;
      
      // Reset position only when the entire vehicle + message has completely left the screen
      if (newX - scaledMessageWidth > stageWidth) {
        positionRef.current = -scaledMessageWidth;
        setPosition(-scaledMessageWidth);
      } else {
        positionRef.current = newX;
        setPosition(newX);
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [stageWidth, vehicleType, scale, bannerWidth]); // Remove position from dependencies

  const handleClick = () => {
    dispatch(setSelectedAd(ad));
  };

  const renderMessage = () => {
    switch (vehicleType) {
      case 'airship':
        return <LEDDisplay text={ad.message} scale={scale} bannerWidth={bannerWidth} />;
      case 'airplane':
        return <SmokeWriting text={ad.message} scale={scale} bannerWidth={bannerWidth} />;
      case 'balloon':
        return <BannerDisplay text={ad.message} scale={scale} bannerWidth={bannerWidth} />;
      default:
        return null;
    }
  };

  return (
    <Group
      ref={groupRef}
      x={position}
      y={y}
      onClick={handleClick}
      onTap={handleClick}
      onMouseEnter={(e) => {
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = 'pointer';
        }
      }}
      onMouseLeave={(e) => {
        const container = e.target.getStage()?.container();
        if (container) {
          container.style.cursor = 'default';
        }
      }}
    >
      {renderMessage()}
      {vehicleImage && (
        <Image
          image={vehicleImage}
          width={vehicleSize * scale}
          height={vehicleSize * scale}
        />
      )}
    </Group>
  );
};

export default AerialVehicle; 