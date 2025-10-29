import { create } from 'zustand';
import { Block } from '../types';

interface CodeCraftStore {
  blocks: Block[];
  consoleOutput: string[];
  isRunning: boolean;
  currentLesson: number;
  showWelcomeModal: boolean;
  blockCount: number;
  isFullscreen3D: boolean;

  addBlock: (block: Block) => void;
  clearBlocks: () => void;
  addConsoleOutput: (message: string) => void;
  clearConsole: () => void;
  setIsRunning: (running: boolean) => void;
  setCurrentLesson: (lessonId: number) => void;
  setShowWelcomeModal: (show: boolean) => void;
  setIsFullscreen3D: (fullscreen: boolean) => void;
}

export const useCodeCraftStore = create<CodeCraftStore>((set) => ({
  blocks: [],
  consoleOutput: [],
  isRunning: false,
  currentLesson: 1,
  showWelcomeModal: true,
  blockCount: 0,
  isFullscreen3D: false,

  addBlock: (block) =>
    set((state) => {
      const existingIndex = state.blocks.findIndex(
        (b) =>
          b.position.x === block.position.x &&
          b.position.y === block.position.y &&
          b.position.z === block.position.z
      );

      let newBlocks;
      if (existingIndex !== -1) {
        newBlocks = [...state.blocks];
        newBlocks[existingIndex] = block;
      } else {
        if (state.blocks.length >= 10000) {
          console.warn('Block limit reached (10,000 blocks)');
          return state;
        }
        newBlocks = [...state.blocks, block];
      }

      return {
        blocks: newBlocks,
        blockCount: newBlocks.filter(b => b.material !== 0).length
      };
    }),

  clearBlocks: () => set({ blocks: [], blockCount: 0 }),

  addConsoleOutput: (message) =>
    set((state) => ({
      consoleOutput: [...state.consoleOutput, message]
    })),

  clearConsole: () => set({ consoleOutput: [] }),

  setIsRunning: (running) => set({ isRunning: running }),

  setCurrentLesson: (lessonId) => set({ currentLesson: lessonId }),

  setShowWelcomeModal: (show) => set({ showWelcomeModal: show }),

  setIsFullscreen3D: (fullscreen) => set({ isFullscreen3D: fullscreen })
}));
