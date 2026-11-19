import { Block } from '../types';

/*
 * Builds a binary STL from blocks. Each block is a 1 x 1 x 1 cube, and faces shared by two
 * touching blocks are left out, so the file is a clean outer surface that slicers accept and
 * stays small even for very large builds. The model is turned so "up" in Code Blocks (y) is
 * "up" in a slicer (z).
 */

// Face directions in Code Blocks space (y is up), with the 4 corners of each face, wound
// counter-clockwise when seen from outside.
const FACES: { n: [number, number, number]; c: [number, number, number][] }[] = [
  { n: [1, 0, 0], c: [[1, 0, 0], [1, 1, 0], [1, 1, 1], [1, 0, 1]] },
  { n: [-1, 0, 0], c: [[0, 0, 0], [0, 0, 1], [0, 1, 1], [0, 1, 0]] },
  { n: [0, 1, 0], c: [[0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 1, 0]] },
  { n: [0, -1, 0], c: [[0, 0, 0], [1, 0, 0], [1, 0, 1], [0, 0, 1]] },
  { n: [0, 0, 1], c: [[0, 0, 1], [1, 0, 1], [1, 1, 1], [0, 1, 1]] },
  { n: [0, 0, -1], c: [[0, 0, 0], [0, 1, 0], [1, 1, 0], [1, 0, 0]] },
];

// Code Blocks (x, y, z) with y up  ->  STL (x, -z, y) with z up. A proper rotation, so windings stay outward.
function toStl(x: number, y: number, z: number): [number, number, number] {
  return [x, -z, y];
}

export function exportToSTL(blocks: Block[]): Blob {
  const solid = blocks.filter((b) => b.material !== 0);
  const filled = new Set<string>();
  for (const b of solid) filled.add(`${b.position.x},${b.position.y},${b.position.z}`);

  const faces: { b: Block; f: (typeof FACES)[number] }[] = [];
  for (const b of solid) {
    const { x, y, z } = b.position;
    for (const f of FACES) {
      if (!filled.has(`${x + f.n[0]},${y + f.n[1]},${z + f.n[2]}`)) faces.push({ b, f });
    }
  }

  const triangles = faces.length * 2;
  const buffer = new ArrayBuffer(84 + triangles * 50);
  const view = new DataView(buffer);
  const header = 'Code Blocks export - binary STL, 1 block = 1 unit';
  for (let i = 0; i < 80; i++) view.setUint8(i, i < header.length ? header.charCodeAt(i) : 0);
  view.setUint32(80, triangles, true);

  let o = 84;
  const writeTri = (n: [number, number, number], a: number[], b: number[], c: number[]) => {
    for (const v of [n, a, b, c]) {
      view.setFloat32(o, v[0], true);
      view.setFloat32(o + 4, v[1], true);
      view.setFloat32(o + 8, v[2], true);
      o += 12;
    }
    view.setUint16(o, 0, true);
    o += 2;
  };

  for (const { b, f } of faces) {
    const { x, y, z } = b.position;
    // Blocks are drawn centred on their position, so the cube spans position - 0.5 to position + 0.5.
    const pts = f.c.map(([dx, dy, dz]) => toStl(x - 0.5 + dx, y - 0.5 + dy, z - 0.5 + dz));
    const n = toStl(f.n[0], f.n[1], f.n[2]);
    writeTri(n, pts[0], pts[1], pts[2]);
    writeTri(n, pts[0], pts[2], pts[3]);
  }

  return new Blob([buffer], { type: 'model/stl' });
}

export function stlFileName(): string {
  const d = new Date();
  const pad = (v: number) => String(v).padStart(2, '0');
  return `code-blocks-${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}.stl`;
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}
