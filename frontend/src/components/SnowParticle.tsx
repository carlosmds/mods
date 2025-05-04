import React, { useEffect, useRef } from 'react';
import { Circle } from 'react-konva';
import Konva from 'konva';

interface SnowParticleProps {
  x: number;
  y: number;
  stageWidth: number;
  stageHeight: number;
  speed: number;
}

const SnowParticle: React.FC<SnowParticleProps> = ({ 
  x, 
  y, 
  stageWidth, 
  stageHeight,
  speed 
}) => {
  const circleRef = useRef<Konva.Circle>(null);
  const timeOffset = useRef(Math.random() * Math.PI * 2); // Random starting phase
  const amplitude = useRef(Math.random() * 30 + 20); // Random sway amplitude between 20-50
  const frequency = useRef(Math.random() * 0.001 + 0.001); // Random sway frequency

  useEffect(() => {
    if (!circleRef.current) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame || !circleRef.current) return;

      const time = frame.time;
      const sineWave = Math.sin((time * frequency.current) + timeOffset.current);
      
      // Vertical movement with slight horizontal sway
      const newX = circleRef.current.x() + (sineWave * 0.5); // Gentle horizontal movement
      const newY = circleRef.current.y() + (frame.timeDiff * speed / 1000);
      
      // Reset position when particle goes off screen
      if (newY > stageHeight + 10) {
        // Reset to a random position along the top edge, extending beyond the width
        circleRef.current.x(Math.random() * (stageWidth * 1.2)); // Extend beyond edges
        circleRef.current.y(-10);
      } else {
        circleRef.current.x(newX);
        circleRef.current.y(newY);
      }
    }, circleRef.current.getLayer());

    anim.start();
    
    return () => {
      anim.stop();
    };
  }, [stageWidth, stageHeight, speed]);

  return (
    <Circle
      ref={circleRef}
      x={x}
      y={y}
      radius={2}
      fill="#FFFFFF"
      opacity={0.8}
      shadowColor="#FFFFFF"
      shadowBlur={2}
      shadowOpacity={0.3}
    />
  );
};

export default SnowParticle; 