import { Block } from '../types';

/**
 * Converts blocks to STL format (ASCII)
 * Each block becomes a 1x1x1 unit cube in the STL
 */
export function exportToSTL(blocks: Block[]): string {
  const triangles: string[] = [];

  blocks.forEach((block) => {
    if (block.material === 0) return; // Skip air blocks

    const { x, y, z } = block.position;

    // Define 8 vertices of a unit cube
    const vertices = [
      [x, y, z],           // 0: bottom-front-left
      [x + 1, y, z],       // 1: bottom-front-right
      [x + 1, y, z + 1],   // 2: bottom-back-right
      [x, y, z + 1],       // 3: bottom-back-left
      [x, y + 1, z],       // 4: top-front-left
      [x + 1, y + 1, z],   // 5: top-front-right
      [x + 1, y + 1, z + 1], // 6: top-back-right
      [x, y + 1, z + 1],   // 7: top-back-left
    ];

    // Define 6 faces, each with 2 triangles (12 triangles per cube)
    const faces = [
      // Bottom face (y = y)
      { vertices: [0, 2, 1], normal: [0, -1, 0] },
      { vertices: [0, 3, 2], normal: [0, -1, 0] },
      // Top face (y = y+1)
      { vertices: [4, 5, 6], normal: [0, 1, 0] },
      { vertices: [4, 6, 7], normal: [0, 1, 0] },
      // Front face (z = z)
      { vertices: [0, 1, 5], normal: [0, 0, -1] },
      { vertices: [0, 5, 4], normal: [0, 0, -1] },
      // Back face (z = z+1)
      { vertices: [3, 7, 6], normal: [0, 0, 1] },
      { vertices: [3, 6, 2], normal: [0, 0, 1] },
      // Left face (x = x)
      { vertices: [0, 4, 7], normal: [-1, 0, 0] },
      { vertices: [0, 7, 3], normal: [-1, 0, 0] },
      // Right face (x = x+1)
      { vertices: [1, 2, 6], normal: [1, 0, 0] },
      { vertices: [1, 6, 5], normal: [1, 0, 0] },
    ];

    faces.forEach((face) => {
      const [i1, i2, i3] = face.vertices;
      const v1 = vertices[i1];
      const v2 = vertices[i2];
      const v3 = vertices[i3];
      const normal = face.normal;

      triangles.push(`  facet normal ${normal[0]} ${normal[1]} ${normal[2]}`);
      triangles.push(`    outer loop`);
      triangles.push(`      vertex ${v1[0]} ${v1[1]} ${v1[2]}`);
      triangles.push(`      vertex ${v2[0]} ${v2[1]} ${v2[2]}`);
      triangles.push(`      vertex ${v3[0]} ${v3[1]} ${v3[2]}`);
      triangles.push(`    endloop`);
      triangles.push(`  endfacet`);
    });
  });

  const stlContent = [
    'solid CodeBlocks',
    ...triangles,
    'endsolid CodeBlocks'
  ].join('\n');

  return stlContent;
}

/**
 * Triggers download of STL file
 */
export function downloadSTL(blocks: Block[]): void {
  if (blocks.length === 0) {
    alert('No blocks to export! Build something first.');
    return;
  }

  const stlContent = exportToSTL(blocks);
  const blob = new Blob([stlContent], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
  const filename = `code-blocks-${timestamp}.stl`;

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
