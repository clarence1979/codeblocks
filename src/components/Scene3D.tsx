import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Download, Focus } from 'lucide-react';
import { Block } from '../types';
import { MATERIAL_COLORS } from '../data/materials';
import { ExportSTLModal } from './ExportSTLModal';

interface Scene3DProps {
  blocks: Block[];
  blockCount: number;
}

// See-through materials, and ones that glow a little.
const TRANSLUCENT: Record<number, number> = { 5: 0.45, 21: 0.75, 88: 0.6 };
const GLOWING = new Set([77, 79, 81]);

function colorFor(material: number): string {
  const c = MATERIAL_COLORS[material] || '#888888';
  return c.length === 9 ? c.slice(0, 7) : c; // drop any alpha digits; opacity is set separately
}

function makeMaterial(material: number): THREE.MeshStandardMaterial {
  const color = colorFor(material);
  const opacity = TRANSLUCENT[material];
  return new THREE.MeshStandardMaterial({
    color,
    transparent: opacity !== undefined,
    opacity: opacity ?? 1,
    depthWrite: opacity === undefined,
    emissive: GLOWING.has(material) ? new THREE.Color(color) : new THREE.Color(0x000000),
    emissiveIntensity: GLOWING.has(material) ? 0.45 : 0,
  });
}

export function Scene3D({ blocks, blockCount }: Scene3DProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [cameraPos, setCameraPos] = useState({ x: 0, y: 0, z: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const geometryRef = useRef<THREE.BoxGeometry | null>(null);
  const meshesRef = useRef<Map<number, THREE.InstancedMesh>>(new Map());
  const materialsRef = useRef<Map<number, THREE.MeshStandardMaterial>>(new Map());
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 6 });
  const cameraDistanceRef = useRef(40);
  const cameraPosRef = useRef({ x: 0, y: 0, z: 0 });
  const needsRenderRef = useRef(true);
  const updateCameraRef = useRef<() => void>(() => undefined);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const blocksRef = useRef<Block[]>(blocks);
  blocksRef.current = blocks;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;
    geometryRef.current = new THREE.BoxGeometry(1, 1, 1);

    const camera = new THREE.PerspectiveCamera(75, container.clientWidth / Math.max(1, container.clientHeight), 0.1, 3000);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.domElement.style.touchAction = 'none';
    renderer.domElement.setAttribute('aria-label', '3D world. Drag to rotate, scroll or pinch to zoom, W A S D to move.');
    renderer.domElement.setAttribute('role', 'img');
    container.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const gridSize = 100;
    scene.add(new THREE.GridHelper(gridSize, gridSize, 0x444444, 0x222222));
    scene.add(new THREE.AxesHelper(10));

    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(gridSize, gridSize),
      new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide })
    );
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    const updateCamera = () => {
      const distance = cameraDistanceRef.current;
      const { theta, phi } = cameraAngleRef.current;
      const target = cameraPosRef.current;
      camera.position.set(
        target.x + distance * Math.sin(phi) * Math.cos(theta),
        target.y + distance * Math.cos(phi),
        target.z + distance * Math.sin(phi) * Math.sin(theta)
      );
      camera.lookAt(target.x, target.y, target.z);
      needsRenderRef.current = true;
    };
    updateCameraRef.current = () => {
      updateCamera();
      setCameraPos({ ...cameraPosRef.current });
    };
    updateCamera();

    // Mouse, pen and touch: one pointer rotates, two pointers pinch to zoom.
    const pointers = new Map<number, { x: number; y: number }>();
    let pinchStart = 0;
    let pinchDistanceStart = 0;

    const pinchGap = () => {
      const [a, b] = Array.from(pointers.values());
      return Math.hypot(a.x - b.x, a.y - b.y);
    };

    const handlePointerDown = (e: PointerEvent) => {
      renderer.domElement.setPointerCapture(e.pointerId);
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        pinchStart = pinchGap();
        pinchDistanceStart = cameraDistanceRef.current;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      const last = pointers.get(e.pointerId);
      if (!last) return;
      const deltaX = e.clientX - last.x;
      const deltaY = e.clientY - last.y;
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });

      if (pointers.size === 1) {
        cameraAngleRef.current.theta -= deltaX * 0.01;
        cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngleRef.current.phi - deltaY * 0.01));
        updateCamera();
      } else if (pointers.size === 2 && pinchStart > 0) {
        cameraDistanceRef.current = Math.max(5, Math.min(400, pinchDistanceStart * (pinchStart / Math.max(1, pinchGap()))));
        updateCamera();
      }
    };

    const handlePointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinchStart = 0;
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(5, Math.min(400, cameraDistanceRef.current * Math.exp(e.deltaY * 0.001)));
      updateCamera();
    };

    const keys = new Set<string>();
    const typingTarget = () => {
      const el = document.activeElement as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (typingTarget() || e.ctrlKey || e.metaKey || e.altKey) return;
      const k = e.key.toLowerCase();
      if ('wasd'.includes(k) && k.length === 1) keys.add(k);
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keys.delete(e.key.toLowerCase());
    };
    const handleBlur = () => keys.clear();

    let frame = 0;
    let rafId = 0;
    const animate = () => {
      rafId = requestAnimationFrame(animate);

      if (keys.size) {
        const moveSpeed = 0.5 * Math.max(1, cameraDistanceRef.current / 40);
        const { theta } = cameraAngleRef.current;
        const fx = -Math.cos(theta), fz = -Math.sin(theta);
        const rx = -Math.sin(theta), rz = Math.cos(theta);
        const p = cameraPosRef.current;
        if (keys.has('w')) { p.x += fx * moveSpeed; p.z += fz * moveSpeed; }
        if (keys.has('s')) { p.x -= fx * moveSpeed; p.z -= fz * moveSpeed; }
        if (keys.has('a')) { p.x -= rx * moveSpeed; p.z -= rz * moveSpeed; }
        if (keys.has('d')) { p.x += rx * moveSpeed; p.z += rz * moveSpeed; }
        updateCamera();
        if (++frame % 6 === 0) setCameraPos({ ...p });
      }

      if (needsRenderRef.current) {
        needsRenderRef.current = false;
        renderer.render(scene, camera);
      }
    };
    animate();

    const canvas = renderer.domElement;
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('pointerup', handlePointerUp);
    canvas.addEventListener('pointercancel', handlePointerUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleBlur);

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      needsRenderRef.current = true;
    };
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    const meshes = meshesRef.current;
    const mats = materialsRef.current;

    return () => {
      cancelAnimationFrame(rafId);
      observer.disconnect();
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerup', handlePointerUp);
      canvas.removeEventListener('pointercancel', handlePointerUp);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
      meshes.forEach((m) => m.dispose());
      meshes.clear();
      mats.forEach((m) => m.dispose());
      mats.clear();
      geometryRef.current?.dispose();
      geometryRef.current = null;
      sceneRef.current = null;
      renderer.dispose();
      if (canvas.parentElement === container) container.removeChild(canvas);
    };
  }, []);

  // Draw the blocks: one instanced mesh per material, so even very large builds stay smooth.
  useEffect(() => {
    const scene = sceneRef.current;
    const geometry = geometryRef.current;
    if (!scene || !geometry) return;

    const counts = new Map<number, number>();
    for (const b of blocks) {
      if (b.material !== 0) counts.set(b.material, (counts.get(b.material) || 0) + 1);
    }

    const meshes = meshesRef.current;
    meshes.forEach((mesh, material) => {
      if (!counts.has(material)) mesh.count = 0;
    });

    counts.forEach((count, material) => {
      let mesh = meshes.get(material);
      if (!mesh || mesh.instanceMatrix.count < count) {
        if (mesh) {
          scene.remove(mesh);
          mesh.dispose();
        }
        let mat = materialsRef.current.get(material);
        if (!mat) {
          mat = makeMaterial(material);
          materialsRef.current.set(material, mat);
        }
        let capacity = 64;
        while (capacity < count) capacity *= 2;
        mesh = new THREE.InstancedMesh(geometry, mat, capacity);
        mesh.frustumCulled = false;
        if (TRANSLUCENT[material] !== undefined) mesh.renderOrder = 1;
        scene.add(mesh);
        meshes.set(material, mesh);
      }
      mesh.count = count;
    });

    const filled = new Map<number, number>();
    for (const b of blocks) {
      if (b.material === 0) continue;
      const mesh = meshes.get(b.material)!;
      const i = filled.get(b.material) || 0;
      filled.set(b.material, i + 1);
      const a = mesh.instanceMatrix.array as Float32Array;
      const o = i * 16;
      a[o] = 1; a[o + 1] = 0; a[o + 2] = 0; a[o + 3] = 0;
      a[o + 4] = 0; a[o + 5] = 1; a[o + 6] = 0; a[o + 7] = 0;
      a[o + 8] = 0; a[o + 9] = 0; a[o + 10] = 1; a[o + 11] = 0;
      a[o + 12] = b.position.x; a[o + 13] = b.position.y; a[o + 14] = b.position.z; a[o + 15] = 1;
    }
    meshes.forEach((mesh) => {
      mesh.instanceMatrix.needsUpdate = true;
    });
    needsRenderRef.current = true;
  }, [blocks]);

  const fitView = () => {
    const list = blocksRef.current;
    if (!list.length) {
      cameraPosRef.current = { x: 0, y: 0, z: 0 };
      cameraDistanceRef.current = 40;
    } else {
      let minX = Infinity, minY = Infinity, minZ = Infinity, maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
      for (const b of list) {
        const { x, y, z } = b.position;
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
        if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
      }
      cameraPosRef.current = { x: (minX + maxX) / 2, y: (minY + maxY) / 2, z: (minZ + maxZ) / 2 };
      // Distance that fits a sphere around the build inside the narrower side of the view.
      const radius = 0.5 * Math.hypot(maxX - minX + 1, maxY - minY + 1, maxZ - minZ + 1);
      const cam = cameraRef.current;
      const vHalf = THREE.MathUtils.degToRad((cam?.fov ?? 75) / 2);
      const hHalf = Math.atan(Math.tan(vHalf) * (cam?.aspect ?? 1));
      cameraDistanceRef.current = Math.max(8, Math.min(400, (radius / Math.sin(Math.min(vHalf, hHalf))) * 1.05));
    }
    updateCameraRef.current();
  };

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-4 left-16 bg-gray-900/90 text-white px-3 py-1.5 rounded text-xs font-mono pointer-events-none">
        <div>Camera: ({cameraPos.x.toFixed(1)}, {cameraPos.y.toFixed(1)}, {cameraPos.z.toFixed(1)})</div>
        <div>Blocks: {blockCount.toLocaleString('en-US')}</div>
      </div>

      <div className="absolute bottom-4 right-4 flex gap-2">
        <button
          onClick={fitView}
          className="bg-gray-900/90 hover:bg-gray-800 text-white p-3 rounded-lg shadow-lg transition-colors flex items-center gap-2"
          title="Move the camera so the whole build is in view"
        >
          <Focus size={20} />
          <span className="text-sm font-medium">Fit view</span>
        </button>
        <button
          onClick={() => setShowExportModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-2"
          title="Export as STL for 3D printing"
        >
          <Download size={20} />
          <span className="text-sm font-medium">Export STL</span>
        </button>
      </div>

      {showExportModal && (
        <ExportSTLModal
          blocks={blocks}
          onClose={() => setShowExportModal(false)}
        />
      )}

      <div className="absolute bottom-20 sm:bottom-4 left-4 bg-gray-900/90 text-white px-4 py-2 rounded text-xs pointer-events-none">
        <div className="font-semibold mb-1">Controls:</div>
        <div>Drag: Rotate</div>
        <div>Scroll or pinch: Zoom</div>
        <div>W A S D: Move</div>
      </div>
    </div>
  );
}
