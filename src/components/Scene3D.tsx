import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { Block } from '../types';
import { MATERIAL_COLORS } from '../data/materials';

interface Scene3DProps {
  blocks: Block[];
  blockCount: number;
}

export function Scene3D({ blocks, blockCount }: Scene3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const blockMeshesRef = useRef<Map<string, THREE.Mesh>>(new Map());
  const mouseDownRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 6 });
  const cameraDistanceRef = useRef(40);
  const keysRef = useRef<Set<string>>(new Set());
  const cameraPosRef = useRef({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    scene.add(directionalLight);

    const gridSize = 50;
    const gridHelper = new THREE.GridHelper(gridSize, gridSize, 0x444444, 0x222222);
    scene.add(gridHelper);

    const axesHelper = new THREE.AxesHelper(10);
    scene.add(axesHelper);

    const groundGeometry = new THREE.PlaneGeometry(gridSize, gridSize);
    const groundMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22,
      side: THREE.DoubleSide
    });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    scene.add(ground);

    const updateCamera = () => {
      const distance = cameraDistanceRef.current;
      const theta = cameraAngleRef.current.theta;
      const phi = cameraAngleRef.current.phi;

      camera.position.x = cameraPosRef.current.x + distance * Math.sin(phi) * Math.cos(theta);
      camera.position.y = cameraPosRef.current.y + distance * Math.cos(phi);
      camera.position.z = cameraPosRef.current.z + distance * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(cameraPosRef.current.x, cameraPosRef.current.y, cameraPosRef.current.z);
    };

    updateCamera();

    const handleMouseDown = (e: MouseEvent) => {
      mouseDownRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
      mouseDownRef.current = false;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!mouseDownRef.current) return;

      const deltaX = e.clientX - lastMouseRef.current.x;
      const deltaY = e.clientY - lastMouseRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.01;
      cameraAngleRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI - 0.1, cameraAngleRef.current.phi - deltaY * 0.01)
      );

      lastMouseRef.current = { x: e.clientX, y: e.clientY };
      updateCamera();
    };

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraDistanceRef.current = Math.max(
        10,
        Math.min(100, cameraDistanceRef.current + e.deltaY * 0.05)
      );
      updateCamera();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' ||
          document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      keysRef.current.delete(e.key.toLowerCase());
    };

    let frameCount = 0;
    const animate = () => {
      requestAnimationFrame(animate);

      const moveSpeed = 0.5;
      const forward = new THREE.Vector3(
        -Math.cos(cameraAngleRef.current.theta),
        0,
        -Math.sin(cameraAngleRef.current.theta)
      );
      const right = new THREE.Vector3(
        -Math.sin(cameraAngleRef.current.theta),
        0,
        Math.cos(cameraAngleRef.current.theta)
      );

      let moved = false;
      if (keysRef.current.has('w')) {
        cameraPosRef.current.x += forward.x * moveSpeed;
        cameraPosRef.current.z += forward.z * moveSpeed;
        moved = true;
      }
      if (keysRef.current.has('s')) {
        cameraPosRef.current.x -= forward.x * moveSpeed;
        cameraPosRef.current.z -= forward.z * moveSpeed;
        moved = true;
      }
      if (keysRef.current.has('a')) {
        cameraPosRef.current.x -= right.x * moveSpeed;
        cameraPosRef.current.z -= right.z * moveSpeed;
        moved = true;
      }
      if (keysRef.current.has('d')) {
        cameraPosRef.current.x += right.x * moveSpeed;
        cameraPosRef.current.z += right.z * moveSpeed;
        moved = true;
      }

      if (moved) {
        updateCamera();
        frameCount++;
        if (frameCount % 10 === 0) {
          setCameraPos({
            x: cameraPosRef.current.x,
            y: cameraPosRef.current.y,
            z: cameraPosRef.current.z
          });
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    const canvas = renderer.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      containerRef.current?.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!sceneRef.current || !rendererRef.current) return;

      const scene = sceneRef.current;
      const currentBlocks = new Set<string>();

      blocks.forEach((block) => {
        const key = `${block.position.x},${block.position.y},${block.position.z}`;
        currentBlocks.add(key);

        if (block.material === 0) {
          const existingMesh = blockMeshesRef.current.get(key);
          if (existingMesh) {
            scene.remove(existingMesh);
            existingMesh.geometry.dispose();
            (existingMesh.material as THREE.Material).dispose();
            blockMeshesRef.current.delete(key);
          }
          return;
        }

        const existingMesh = blockMeshesRef.current.get(key);
        if (existingMesh) {
          const color = MATERIAL_COLORS[block.material] || '#888888';
          (existingMesh.material as THREE.MeshStandardMaterial).color.set(color);
          return;
        }

        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const color = MATERIAL_COLORS[block.material] || '#888888';
        const material = new THREE.MeshStandardMaterial({
          color: color,
          transparent: block.material === 5,
          opacity: block.material === 5 ? 0.5 : 1
        });
        const mesh = new THREE.Mesh(geometry, material);

        mesh.position.set(
          block.position.x,
          block.position.y,
          block.position.z
        );

        scene.add(mesh);
        blockMeshesRef.current.set(key, mesh);
      });

      blockMeshesRef.current.forEach((mesh, key) => {
        if (!currentBlocks.has(key)) {
          scene.remove(mesh);
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
          blockMeshesRef.current.delete(key);
        }
      });
    }, 0);

    return () => clearTimeout(timer);
  }, [blocks]);

  return (
    <div className="relative w-full h-full">
      <div ref={containerRef} className="w-full h-full" />

      <div className="absolute top-4 left-4 bg-gray-900/90 text-white px-4 py-2 rounded text-sm font-mono">
        <div>Camera: ({cameraPosRef.current.x.toFixed(1)}, {cameraPosRef.current.y.toFixed(1)}, {cameraPosRef.current.z.toFixed(1)})</div>
        <div>Blocks: {blockCount}</div>
      </div>

      <div className="absolute bottom-4 left-4 bg-gray-900/90 text-white px-4 py-2 rounded text-xs">
        <div className="font-semibold mb-1">Controls:</div>
        <div>Mouse Drag: Rotate</div>
        <div>Scroll: Zoom</div>
        <div>WASD: Move</div>
      </div>
    </div>
  );
}
