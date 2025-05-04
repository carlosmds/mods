import React, { useEffect, useRef } from 'react';
import { Group, Image } from 'react-konva';
import useImage from 'use-image';
import Konva from 'konva';

interface SkyElementProps {
  type: 'cloud' | 'bird' | 'rain' | 'sun';
  x: number;
  y: number;
  stageWidth: number;
  scale?: number;
  speed?: number;
}

interface AnimationFrame {
  timeDiff: number;
  lastTime?: number;
  time?: number;
}

// Element image paths - these will be SVG icons
const elementImages = {
  cloud: '/icons/cloud.svg',
  bird: '/icons/bird.svg',
  rain: '/icons/rain.svg',
  sun: '/icons/sun.svg',
};

const ELEMENT_SIZE = {
  cloud: 160, // 4x bigger than before (was 40)
  bird: 40,
  rain: 40,
  sun: 40
};

const DEFAULT_SPEED = {
  cloud: 6, // 80% slower than before (was 30)
  bird: 30,
  rain: 30,
  sun: 30
};

const SkyElement: React.FC<SkyElementProps> = ({ 
  type, 
  x, 
  y, 
  stageWidth, 
  scale = 1,
  speed
}) => {
  const [image] = useImage(elementImages[type]);
  const groupRef = useRef<Konva.Group>(null);

  // Use type-specific speed if none provided
  const elementSpeed = speed ?? DEFAULT_SPEED[type];
  const elementSize = ELEMENT_SIZE[type];

  // Move from right to left
  useEffect(() => {
    if (!groupRef.current) return;

    const anim = new Konva.Animation((frame?: AnimationFrame) => {
      if (!frame || !groupRef.current) return;

      const newX = groupRef.current.x() - (frame.timeDiff * elementSpeed / 1000);
      
      // Reset position when element goes off screen
      if (newX < -elementSize) {
        groupRef.current.x(stageWidth + elementSize);
      } else {
        groupRef.current.x(newX);
      }
    }, groupRef.current.getLayer());

    anim.start();
    
    // Return cleanup function that stops the animation
    return () => {
      anim.stop();
    };
  }, [stageWidth, elementSpeed, elementSize]);

  return (
    <Group
      ref={groupRef}
      x={x}
      y={y}
      scaleX={scale}
      scaleY={scale}
      opacity={type === 'cloud' ? 0.8 : 1} // Make clouds slightly transparent
    >
      {image && (
        <Image
          image={image}
          width={elementSize}
          height={elementSize}
          shadowColor={type === 'cloud' ? '#000000' : undefined}
          shadowBlur={type === 'cloud' ? 5 : undefined}
          shadowOpacity={type === 'cloud' ? 0.2 : undefined}
        />
      )}
    </Group>
  );
};

export default SkyElement; 