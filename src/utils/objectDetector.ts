import { Block, Position } from '../types';

export interface DetectedObject {
  name: string;
  blocks: Block[];
  center: Position;
  bounds: {
    min: Position;
    max: Position;
  };
}

function getBlockKey(pos: Position): string {
  return `${pos.x},${pos.y},${pos.z}`;
}

function areAdjacent(pos1: Position, pos2: Position): boolean {
  const dx = Math.abs(pos1.x - pos2.x);
  const dy = Math.abs(pos1.y - pos2.y);
  const dz = Math.abs(pos1.z - pos2.z);

  return (dx === 1 && dy === 0 && dz === 0) ||
         (dx === 0 && dy === 1 && dz === 0) ||
         (dx === 0 && dy === 0 && dz === 1);
}

function calculateCenter(blocks: Block[]): Position {
  if (blocks.length === 0) return { x: 0, y: 0, z: 0 };

  const sum = blocks.reduce(
    (acc, block) => ({
      x: acc.x + block.position.x,
      y: acc.y + block.position.y,
      z: acc.z + block.position.z,
    }),
    { x: 0, y: 0, z: 0 }
  );

  return {
    x: Math.round(sum.x / blocks.length),
    y: Math.round(sum.y / blocks.length),
    z: Math.round(sum.z / blocks.length),
  };
}

function calculateBounds(blocks: Block[]): { min: Position; max: Position } {
  if (blocks.length === 0) {
    return {
      min: { x: 0, y: 0, z: 0 },
      max: { x: 0, y: 0, z: 0 },
    };
  }

  const min = { x: Infinity, y: Infinity, z: Infinity };
  const max = { x: -Infinity, y: -Infinity, z: -Infinity };

  blocks.forEach(block => {
    min.x = Math.min(min.x, block.position.x);
    min.y = Math.min(min.y, block.position.y);
    min.z = Math.min(min.z, block.position.z);
    max.x = Math.max(max.x, block.position.x);
    max.y = Math.max(max.y, block.position.y);
    max.z = Math.max(max.z, block.position.z);
  });

  return { min, max };
}

function getObjectName(blocks: Block[], index: number): string {
  const bounds = calculateBounds(blocks);
  const width = bounds.max.x - bounds.min.x + 1;
  const height = bounds.max.y - bounds.min.y + 1;
  const depth = bounds.max.z - bounds.min.z + 1;

  const volume = width * height * depth;
  const blockCount = blocks.length;
  const density = blockCount / volume;

  if (height > width && height > depth && density > 0.7) {
    return `Tower ${index + 1}`;
  } else if (height < 3 && (width > 5 || depth > 5) && density < 0.4) {
    return `Platform ${index + 1}`;
  } else if (width === depth && Math.abs(width - height) <= 2 && density > 0.5) {
    return `Cube ${index + 1}`;
  } else if (height < width / 2 && height < depth / 2) {
    return `Floor ${index + 1}`;
  } else if ((width === 1 || depth === 1) && height > 3) {
    return `Wall ${index + 1}`;
  } else if (density > 0.8) {
    return `Solid Structure ${index + 1}`;
  } else if (density < 0.3) {
    return `Sparse Structure ${index + 1}`;
  } else {
    return `Structure ${index + 1}`;
  }
}

export function detectObjects(blocks: Block[]): DetectedObject[] {
  const validBlocks = blocks.filter(block => block.material !== 0);

  if (validBlocks.length === 0) {
    return [];
  }

  const visited = new Set<string>();
  const objects: DetectedObject[] = [];

  function floodFill(startBlock: Block): Block[] {
    const objectBlocks: Block[] = [];
    const queue: Block[] = [startBlock];
    const key = getBlockKey(startBlock.position);
    visited.add(key);

    while (queue.length > 0) {
      const current = queue.shift()!;
      objectBlocks.push(current);

      for (const block of validBlocks) {
        const blockKey = getBlockKey(block.position);
        if (!visited.has(blockKey) && areAdjacent(current.position, block.position)) {
          visited.add(blockKey);
          queue.push(block);
        }
      }
    }

    return objectBlocks;
  }

  for (const block of validBlocks) {
    const key = getBlockKey(block.position);
    if (!visited.has(key)) {
      const objectBlocks = floodFill(block);
      const center = calculateCenter(objectBlocks);
      const bounds = calculateBounds(objectBlocks);

      objects.push({
        name: getObjectName(objectBlocks, objects.length),
        blocks: objectBlocks,
        center,
        bounds,
      });
    }
  }

  objects.sort((a, b) => b.blocks.length - a.blocks.length);

  return objects;
}
