/// <reference lib="webworker" />
/*
 * Runs student Python in its own thread, so the page stays responsive during big builds and a
 * runaway loop can be stopped by ending this worker.
 *
 * Python itself (Pyodide) is built into the page. The page hands this worker the files as
 * Blobs; requests for them are answered from memory, so nothing is downloaded.
 */
import { loadPyodide, type PyodideInterface } from 'pyodide';
import { CODEBLOCKS_MODULE } from './codeblocksModule';

declare const self: DedicatedWorkerGlobalScope;

const EMBEDDED_URL = 'https://codeblocks.invalid/pyodide/';
const CDN_URL = 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/';

type Assets = { asmJs: Blob; wasm: Blob; stdlib: Blob; lock: Blob };

type InMsg =
  | { type: 'init'; assets: Assets | null; materials: Record<string, number> }
  | { type: 'run'; id: number; code: string; offset: [number, number, number]; world: Int32Array };

let py: PyodideInterface | null = null;
let runId = 0;
let stdoutLines: string[] = [];
let lastTextPost = 0;

function post(msg: unknown, transfer: Transferable[] = []) {
  self.postMessage(msg, transfer);
}

function flushText(force = false) {
  const now = performance.now();
  if (stdoutLines.length && (force || now - lastTextPost > 60 || stdoutLines.length > 500)) {
    post({ type: 'lines', id: runId, lines: stdoutLines });
    stdoutLines = [];
    lastTextPost = now;
  }
}

function serveEmbedded(assets: Assets) {
  const files: Record<string, { blob: Blob; type: string }> = {
    'pyodide.asm.wasm': { blob: assets.wasm, type: 'application/wasm' },
    'python_stdlib.zip': { blob: assets.stdlib, type: 'application/zip' },
    'pyodide-lock.json': { blob: assets.lock, type: 'application/json' },
  };
  const realFetch = self.fetch.bind(self);
  self.fetch = (input: RequestInfo | URL, init?: RequestInit) => {
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
    if (url.startsWith(EMBEDDED_URL)) {
      const file = files[url.slice(EMBEDDED_URL.length).split('?')[0]];
      if (file) {
        return Promise.resolve(new Response(file.blob, { status: 200, headers: { 'Content-Type': file.type } }));
      }
      return Promise.resolve(new Response('Not built into this page', { status: 404 }));
    }
    return realFetch(input, init);
  };
}

async function init(assets: Assets | null, materials: Record<string, number>) {
  let indexURL = CDN_URL;
  if (assets) {
    serveEmbedded(assets);
    // pyodide.asm.js ends by setting globalThis._createPyodideModule, which the loader then uses.
    const source = await assets.asmJs.text();
    (0, eval)(`${source}\n//# sourceURL=pyodide.asm.js`);
    indexURL = EMBEDDED_URL;
  }

  py = await loadPyodide({ indexURL });

  py.setStdout({
    batched: (line: string) => {
      stdoutLines.push(line);
      flushText();
    },
  });
  py.setStderr({
    batched: (line: string) => {
      stdoutLines.push('\u0001' + line);
      flushText();
    },
  });

  py.registerJsModule('_codeblocks_js', {
    emit(proxy: { getBuffer: (t: string) => { data: Int32Array; release: () => void }; destroy: () => void }) {
      const buf = proxy.getBuffer('i32');
      const copy = new Int32Array(buf.data);
      buf.release();
      proxy.destroy();
      flushText(true);
      post({ type: 'blocks', id: runId, data: copy }, [copy.buffer]);
    },
    clear() {
      stdoutLines = [];
      post({ type: 'clear', id: runId });
    },
  });

  py.globals.set('_cb_materials_json', JSON.stringify(materials));
  py.runPython(CODEBLOCKS_MODULE);
}

self.onmessage = async (event: MessageEvent<InMsg>) => {
  const msg = event.data;
  if (msg.type === 'init') {
    try {
      await init(msg.assets, msg.materials);
      post({ type: 'ready' });
    } catch (err) {
      post({ type: 'init-error', message: err instanceof Error ? err.message : String(err) });
    }
    return;
  }

  if (msg.type === 'run') {
    if (!py) {
      post({ type: 'done', id: msg.id, ok: false, error: 'Python is not ready yet.' });
      return;
    }
    runId = msg.id;
    stdoutLines = [];
    let ok = false;
    try {
      const begin = py.globals.get('_cb_begin');
      begin(msg.offset[0], msg.offset[1], msg.offset[2], msg.world);
      begin.destroy();
      const run = py.globals.get('_cb_run');
      ok = run(msg.code) as boolean;
      run.destroy();
    } catch (err) {
      stdoutLines.push('\u0001Error: ' + (err instanceof Error ? err.message : String(err)));
    }
    flushText(true);
    post({ type: 'done', id: msg.id, ok });
  }
};
