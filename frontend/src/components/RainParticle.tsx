import React, { useEffect, useRef } from 'react';
import { Circle } from 'react-konva';
import Konva from 'konva';

interface RainParticleProps {
  x: number;
  y: number;
  stageWidth: number;
  stageHeight: number;
  speed: number;
}

const RainParticle: React.FC<RainParticleProps> = ({ 
  x, 
  y, 
  stageWidth, 
  stageHeight,
  speed 
}) => {
  const circleRef = useRef<Konva.Circle>(null);
  const angle = (84 * Math.PI) / 180; // 84 degrees for near-vertical movement
  const xSpeed = speed * Math.cos(angle);
  const ySpeed = speed * Math.sin(angle);

  useEffect(() => {
    if (!circleRef.current) return;

    const anim = new Konva.Animation((frame) => {
      if (!frame || !circleRef.current) return;

      const newX = circleRef.current.x() - (frame.timeDiff * xSpeed / 1000);
      const newY = circleRef.current.y() + (frame.timeDiff * ySpeed / 1000);
      
      // Reset position when particle goes off screen
      if (newX < -10 || newY > stageHeight + 10) {
        // Reset to a random position along the top edge, extending beyond the width
        // This creates an infinite rain effect across the full width
        circleRef.current.x(Math.random() * (stageWidth * 1.5)); // Extend beyond right edge
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
  }, [stageWidth, stageHeight, xSpeed, ySpeed]);

  return (
    <Circle
      ref={circleRef}
      x={x}
      y={y}
      radius={1.2}
      fill="#00329a"
      opacity={0.8}
    />
  );
};

export default RainParticle; 