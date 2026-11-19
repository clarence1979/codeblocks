import { create } from 'zustand';
import { Block } from '../types';

/*
 * The world is kept in a Map keyed by "x,y,z" so finding, replacing and removing a block
 * is instant however big the build gets. There is no block limit.
 * `blocks` is a fresh array built from the Map after each batch, for the 3D view and STL export.
 */
const world = new Map<string, Block>();

function keyOf(x: number, y: number, z: number) {
  return `${x},${y},${z}`;
}

interface CodeCraftStore {
  blocks: Block[];
  consoleOutput: string[];
  isRunning: boolean;
  currentLesson: number;
  showWelcomeModal: boolean;
  blockCount: number;
  isFullscreen3D: boolean;

  /** Apply a batch of placements packed as [x, y, z, material, x, y, z, material, ...]. Material 0 removes the block. */
  applyBlocks: (packed: Int32Array) => void;
  clearBlocks: () => void;
  /** The whole world packed as [x, y, z, material, ...], for handing to Python at the start of a run. */
  snapshotWorld: () => Int32Array;
  /** Largest x of any block, or null when the world is empty. */
  maxBlockX: () => number | null;
  addConsoleOutput: (message: string) => void;
  addConsoleLines: (lines: string[]) => void;
  clearConsole: () => void;
  setIsRunning: (running: boolean) => void;
  setCurrentLesson: (lessonId: number) => void;
  setShowWelcomeModal: (show: boolean) => void;
  setIsFullscreen3D: (fullscreen: boolean) => void;
}

// Keep the console readable and the page light if a program prints in a long loop.
const MAX_CONSOLE_LINES = 2000;

const HIDDEN_RE = /^… ([\d,]+) earlier lines hidden …$/;

function trimConsole(lines: string[]) {
  if (lines.length <= MAX_CONSOLE_LINES) return lines;
  let alreadyHidden = 0;
  let start = 0;
  const m = HIDDEN_RE.exec(lines[0]);
  if (m) {
    alreadyHidden = Number(m[1].replace(/,/g, ''));
    start = 1;
  }
  const body = lines.slice(start);
  const keep = body.slice(body.length - (MAX_CONSOLE_LINES - 1));
  const hidden = alreadyHidden + (body.length - keep.length);
  return [`… ${hidden.toLocaleString('en-US')} earlier lines hidden …`, ...keep];
}

export const useCodeCraftStore = create<CodeCraftStore>((set) => ({
  blocks: [],
  consoleOutput: [],
  isRunning: false,
  currentLesson: 1,
  showWelcomeModal: true,
  blockCount: 0,
  isFullscreen3D: false,

  applyBlocks: (packed) => {
    if (packed.length === 0) return;
    for (let i = 0; i + 3 < packed.length; i += 4) {
      const x = packed[i];
      const y = packed[i + 1];
      const z = packed[i + 2];
      const material = packed[i + 3];
      const key = keyOf(x, y, z);
      if (material === 0) world.delete(key);
      else world.set(key, { position: { x, y, z }, material });
    }
    set({ blocks: Array.from(world.values()), blockCount: world.size });
  },

  clearBlocks: () => {
    world.clear();
    set({ blocks: [], blockCount: 0 });
  },

  snapshotWorld: () => {
    const out = new Int32Array(world.size * 4);
    let i = 0;
    world.forEach((b) => {
      out[i++] = b.position.x;
      out[i++] = b.position.y;
      out[i++] = b.position.z;
      out[i++] = b.material;
    });
    return out;
  },

  maxBlockX: () => {
    let max: number | null = null;
    world.forEach((b) => {
      if (max === null || b.position.x > max) max = b.position.x;
    });
    return max;
  },

  addConsoleOutput: (message) =>
    set((state) => ({
      consoleOutput: trimConsole([...state.consoleOutput, message])
    })),

  addConsoleLines: (lines) =>
    set((state) => ({
      consoleOutput: trimConsole([...state.consoleOutput, ...lines])
    })),

  clearConsole: () => set({ consoleOutput: [] }),

  setIsRunning: (running) => set({ isRunning: running }),

  setCurrentLesson: (lessonId) => set({ currentLesson: lessonId }),

  setShowWelcomeModal: (show) => set({ showWelcomeModal: show }),

  setIsFullscreen3D: (fullscreen) => set({ isFullscreen3D: fullscreen })
}));
