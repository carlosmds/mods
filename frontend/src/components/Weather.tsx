import React from 'react';
import { Group, Image } from 'react-konva';
import useImage from 'use-image';

interface WeatherProps {
  type: 'sun' | 'cloud' | 'rain';
  x: number;
  y: number;
  scale?: number;
}

const Weather: React.FC<WeatherProps> = ({ type, x, y, scale = 1 }) => {
  const [image] = useImage(`/icons/${type}.svg`);
  
  return (
    <Group x={x} y={y}>
      <Image
        image={image}
        width={24 * scale}
        height={24 * scale}
        opacity={0.8}
      />
    </Group>
  );
};

export default Weather; 