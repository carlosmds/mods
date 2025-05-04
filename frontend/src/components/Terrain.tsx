import React, { useMemo } from 'react';
import { Group, Shape, Circle } from 'react-konva';
import { Season } from '../store/slices/uiSlice';

interface TerrainProps {
  width: number;
  height: number;
  season: Season;
}

const TERRAIN_HEIGHT = 80; // Reduced by 20% from 100

// Autumn tree colors
const AUTUMN_TREE_COLORS = [
  '#8B4513', // Saddle Brown
  '#D2691E', // Chocolate
  '#CD853F', // Peru
  '#DEB887', // Burlywood
  '#D2691E', // Chocolate
  '#FF8C00', // Dark Orange
];

const Terrain: React.FC<TerrainProps> = ({ width, height, season }) => {
  // Colors based on season
  const getSeasonColors = () => {
    switch (season) {
      case 'spring':
        return {
          ground: '#73a944',
          trees: ['#31572C'],
          decorations: [
            // Pink and red flowers
            '#FF69B4', '#FFB6C1', '#FF1493',
            // Purple and blue flowers
            '#9932CC', '#8A2BE2', '#4169E1', '#6495ED',
            // Yellow and white flowers
            '#FFD700', '#FFFF00', '#FFFAFA',
            // Orange and coral flowers
            '#FFA500', '#FF7F50',
          ],
        };
      case 'summer':
        return {
          ground: '#4F772D',
          trees: ['#31572C'],
          decorations: ['#90A955'], // Light green patches
        };
      case 'autumn':
        return {
          ground: '#9C6644',
          trees: AUTUMN_TREE_COLORS,
          decorations: ['#D4A373', '#E9BC88', '#FAEDCD'], // Fall colors
        };
      case 'winter':
        return {
          ground: '#F8F9FA',
          trees: ['#1c3801'],
          decorations: ['#FFFFFF'], // Snow
        };
    };
  };

  const colors = getSeasonColors();

  // Generate random tree positions
  const trees = useMemo(() => {
    const minSpacing = 60; // Minimum space between trees
    const numTrees = Math.floor((width * 1.2) / minSpacing); // 20% more trees for denser forest
    
    return Array.from({ length: numTrees }, () => {
      const x = Math.random() * width;
      const scale = Math.random() * 0.4 + 0.8; // Random scale between 0.8 and 1.2
      const treeColor = colors.trees[Math.floor(Math.random() * colors.trees.length)];
      return { x, scale, color: treeColor };
    }).sort((a, b) => a.x - b.x); // Sort by x position for consistent rendering
  }, [width, colors.trees]);

  // Generate random decorations with season-specific density and distribution
  const decorations = useMemo(() => {
    let decorationCount;
    let sizeRange;
    
    switch (season) {
      case 'spring':
        decorationCount = 60; // Much more flowers in spring
        sizeRange = { min: 2, max: 6 }; // Larger variety in flower sizes
        break;
      case 'summer':
        decorationCount = 20;
        sizeRange = { min: 3, max: 8 }; // Larger grass patches
        break;
      case 'autumn':
        decorationCount = 60; // More fallen leaves
        sizeRange = { min: 2, max: 4 };
        break;
      case 'winter':
        decorationCount = 30;
        sizeRange = { min: 1, max: 3 }; // Smaller snow particles
        break;
    }

    return Array.from({ length: decorationCount }, () => {
      // Create clusters of decorations for spring flowers
      let x, y;
      if (season === 'spring') {
        // 70% chance to create a flower cluster
        if (Math.random() < 0.7) {
          // Pick a random center point for the cluster
          const centerX = Math.random() * width;
          const centerY = height - Math.random() * (TERRAIN_HEIGHT - 15);
          // Add some random offset from the center
          x = centerX + (Math.random() - 0.5) * 30;
          y = centerY + (Math.random() - 0.5) * 15;
        } else {
          // Regular random position for remaining flowers
          x = Math.random() * width;
          y = height - Math.random() * (TERRAIN_HEIGHT - 10);
        }
      } else {
        // Regular distribution for other seasons
        x = Math.random() * width;
        y = height - Math.random() * (TERRAIN_HEIGHT - 10);
      }

      return {
        x,
        y,
        color: colors.decorations[Math.floor(Math.random() * colors.decorations.length)],
        size: Math.random() * (sizeRange.max - sizeRange.min) + sizeRange.min,
      };
    });
  }, [width, height, season, colors.decorations]);

  const renderTree = (x: number, y: number, scale: number, color: string) => {
    const treeHeight = (60 + Math.random() * 20) * scale;
    const trunkWidth = (8 + Math.random() * 4) * scale;
    
    return (
      <Group key={`tree-${x}`}>
        {/* Tree trunk */}
        <Shape
          sceneFunc={(context, shape) => {
            context.beginPath();
            context.moveTo(x, y);
            context.lineTo(x - trunkWidth/2, y);
            context.lineTo(x - trunkWidth/3, y - treeHeight * 0.3);
            context.lineTo(x + trunkWidth/3, y - treeHeight * 0.3);
            context.lineTo(x + trunkWidth/2, y);
            context.closePath();
            context.fillStrokeShape(shape);
          }}
          fill="#5C4033"
        />
        
        {/* Tree foliage */}
        <Shape
          sceneFunc={(context, shape) => {
            const levels = 3;
            const baseWidth = 30 * scale;
            
            for (let i = 0; i < levels; i++) {
              const levelHeight = treeHeight * 0.4;
              const yPos = y - treeHeight * 0.3 - (levelHeight * i);
              const width = baseWidth * (1 - i * 0.2);
              
              context.beginPath();
              context.moveTo(x, yPos);
              context.lineTo(x - width, yPos + levelHeight);
              context.lineTo(x + width, yPos + levelHeight);
              context.closePath();
              context.fillStrokeShape(shape);
            }
          }}
          fill={color}
        />
      </Group>
    );
  };

  return (
    <Group>
      {/* Ground */}
      <Shape
        sceneFunc={(context, shape) => {
          context.beginPath();
          context.moveTo(0, height - TERRAIN_HEIGHT);
          
          // Create a slightly wavy terrain
          for (let x = 0; x <= width; x += 50) {
            const y = height - TERRAIN_HEIGHT + Math.sin(x * 0.02) * 10;
            context.lineTo(x, y);
          }
          
          context.lineTo(width, height);
          context.lineTo(0, height);
          context.closePath();
          context.fillStrokeShape(shape);
        }}
        fill={colors.ground}
      />

      {/* Season-specific decorations */}
      {decorations.map((dec, i) => (
        <Circle
          key={`decoration-${i}`}
          x={dec.x}
          y={dec.y}
          radius={dec.size}
          fill={dec.color}
        />
      ))}

      {/* Trees */}
      {trees.map((tree) => {
        const y = height - TERRAIN_HEIGHT + Math.sin(tree.x * 0.02) * 10;
        return renderTree(tree.x, y, tree.scale, tree.color);
      })}
    </Group>
  );
};

export default Terrain; 