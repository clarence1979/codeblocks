import PythonWorker from '../workers/python.worker.ts?worker&inline';
import { MATERIALS } from '../data/materials';

/*
 * Starts Python (Pyodide) in a background worker and runs student code there.
 * When the page was built as one standalone file, Python is stored inside the page as
 * compressed text; it is unpacked once and reused, so Code Blocks works offline.
 */

export type PythonStatus = 'loading' | 'ready' | 'error';

type Assets = { asmJs: Blob; wasm: Blob; stdlib: Blob; lock: Blob };

let status: PythonStatus = 'loading';
let statusMessage = 'Loading Python…';
const statusListeners = new Set<() => void>();

function setStatus(next: PythonStatus, message: string) {
  status = next;
  statusMessage = message;
  statusListeners.forEach((l) => l());
}

export const pythonStatus = {
  get: () => status,
  message: () => statusMessage,
  subscribe(fn: () => void) {
    statusListeners.add(fn);
    return () => {
      statusListeners.delete(fn);
    };
  },
};

let assetsPromise: Promise<Assets | null> | null = null;

async function unpack(id: string): Promise<Blob | null> {
  const el = document.getElementById(id);
  if (!el || !el.textContent) return null;
  const base64 = el.textContent.trim();
  el.textContent = '';
  const packed = await (await fetch(`data:application/octet-stream;base64,${base64}`)).blob();
  const stream = packed.stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).blob();
}

function embeddedAssets(): Promise<Assets | null> {
  if (!assetsPromise) {
    assetsPromise = (async () => {
      if (!document.getElementById('py-asm-js')) return null;
      const [asmJs, wasm, stdlib, lock] = await Promise.all([
        unpack('py-asm-js'),
        unpack('py-asm-wasm'),
        unpack('py-stdlib'),
        unpack('py-lock'),
      ]);
      if (!asmJs || !wasm || !stdlib || !lock) return null;
      return { asmJs, wasm, stdlib, lock };
    })();
  }
  return assetsPromise;
}

let worker: Worker | null = null;
let workerReady: Promise<Worker> | null = null;
// Bumped when a worker is thrown away, so a start that was still loading doesn't come back to life.
let generation = 0;

interface RunHandlers {
  onBlocks: (packed: Int32Array) => void;
  onLines: (lines: string[]) => void;
  onClear: () => void;
}

interface ActiveRun {
  id: number;
  handlers: RunHandlers;
  resolve: (result: RunResult) => void;
}

export interface RunResult {
  ok: boolean;
  stopped: boolean;
}

let activeRun: ActiveRun | null = null;
let nextRunId = 1;

function startWorker(): Promise<Worker> {
  if (workerReady) return workerReady;
  setStatus('loading', 'Loading Python…');
  const gen = generation;
  workerReady = (async () => {
    const assets = await embeddedAssets();
    if (gen !== generation) return new Promise<Worker>(() => undefined);
    const w = new PythonWorker();
    worker = w;
    await new Promise<void>((resolve, reject) => {
      w.onmessage = (event: MessageEvent) => {
        const msg = event.data;
        if (msg.type === 'ready') resolve();
        else if (msg.type === 'init-error') reject(new Error(msg.message));
      };
      w.onerror = (e) => reject(new Error(e.message || 'Python could not start'));
      w.postMessage({ type: 'init', assets, materials: MATERIALS });
    });
    w.onmessage = handleMessage;
    w.onerror = null;
    setStatus('ready', 'Python ready');
    return w;
  })();
  workerReady.catch((err: Error) => {
    if (gen !== generation) return;
    worker?.terminate();
    worker = null;
    workerReady = null;
    setStatus('error', `Python could not start: ${err.message}`);
  });
  return workerReady;
}

function handleMessage(event: MessageEvent) {
  const msg = event.data;
  const run = activeRun;
  if (!run || msg.id !== run.id) return;
  switch (msg.type) {
    case 'blocks':
      run.handlers.onBlocks(msg.data as Int32Array);
      break;
    case 'lines':
      run.handlers.onLines(msg.lines as string[]);
      break;
    case 'clear':
      run.handlers.onClear();
      break;
    case 'done':
      activeRun = null;
      run.resolve({ ok: !!msg.ok, stopped: false });
      break;
  }
}

/** Begin loading Python in the background so the first Run is quick. */
export function preloadPython() {
  void startWorker().catch(() => undefined);
}

export function runPython(
  code: string,
  world: Int32Array,
  offset: { x: number; y: number; z: number },
  handlers: RunHandlers
): Promise<RunResult> {
  if (activeRun) return Promise.reject(new Error('Code is already running.'));
  const id = nextRunId++;
  return new Promise<RunResult>((resolve) => {
    activeRun = { id, handlers, resolve };
    startWorker().then(
      (w) => {
        if (activeRun?.id !== id) return; // stopped while Python was loading
        w.postMessage({ type: 'run', id, code, offset: [offset.x, offset.y, offset.z], world }, [world.buffer]);
      },
      (err: Error) => {
        if (activeRun?.id !== id) return;
        activeRun = null;
        handlers.onLines(['\u0001Error: Python could not start (' + err.message + '). Reload the page and try again.']);
        resolve({ ok: false, stopped: false });
      }
    );
  });
}

/** Stop the running program at once. Python restarts in the background for the next run. */
export function stopPython() {
  const run = activeRun;
  activeRun = null;
  generation++;
  worker?.terminate();
  worker = null;
  workerReady = null;
  if (run) run.resolve({ ok: false, stopped: true });
  preloadPython();
}

export function isPythonRunning() {
  return activeRun !== null;
}
