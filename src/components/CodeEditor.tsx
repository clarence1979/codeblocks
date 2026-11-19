import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor/esm/vs/editor/edcore.main.js';
import 'monaco-editor/esm/vs/basic-languages/python/python.contribution.js';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker&inline';
import { Play, RotateCcw, Square, Loader } from 'lucide-react';
import { useState, useRef, useEffect, useSyncExternalStore } from 'react';
import type { editor } from 'monaco-editor';
import { pythonStatus } from '../utils/pythonExecutor';
import { INSERT_CODE_EVENT } from '../utils/events';

// The editor is built into the page (no download from a CDN), so it also works offline.
(self as unknown as { MonacoEnvironment: unknown }).MonacoEnvironment = {
  getWorker: () => new EditorWorker(),
};
loader.config({ monaco });


interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRunCode: (code: string) => void;
  onStop: () => void;
  onClearWorld: () => void;
  isRunning: boolean;
  /** Leave room on the left of the toolbar for the panel's hide button. */
  reserveLeft?: boolean;
}

export function CodeEditor({
  code,
  onCodeChange,
  onRunCode,
  onStop,
  onClearWorld,
  isRunning,
  reserveLeft = false
}: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(code);
  const [notice, setNotice] = useState('');
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const py = useSyncExternalStore(pythonStatus.subscribe, pythonStatus.get);
  const noticeTimer = useRef<number>();

  const showNotice = (text: string) => {
    setNotice(text);
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(''), 5000);
  };

  // Sync local state when code prop changes (e.g., from quick examples, lessons or AI)
  useEffect(() => {
    if (code !== localCode) {
      setLocalCode(code);
      if (editorRef.current && editorRef.current.getValue() !== code) {
        editorRef.current.setValue(code);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  // Clicking a material in the Materials Palette types it at the cursor.
  useEffect(() => {
    const onInsert = (e: Event) => {
      const text = (e as CustomEvent<string>).detail;
      const ed = editorRef.current;
      if (!ed || !text) return;
      const selection = ed.getSelection();
      if (!selection) return;
      ed.executeEdits('materials-palette', [{ range: selection, text, forceMoveMarkers: true }]);
      ed.focus();
    };
    window.addEventListener(INSERT_CODE_EVENT, onInsert);
    return () => window.removeEventListener(INSERT_CODE_EVENT, onInsert);
  }, []);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setLocalCode(newCode);
    onCodeChange(newCode);
  };

  const handleEditorDidMount = (ed: editor.IStandaloneCodeEditor) => {
    editorRef.current = ed;

    // Keyboard paste (Ctrl+V / Cmd+V) is left to the browser, which always works.
    // The right-click menu's Paste needs clipboard permission, so explain if the browser says no.
    ed.addAction({
      id: 'codeblocks.paste',
      label: 'Paste',
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 3,
      run: async (target) => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) target.trigger('keyboard', 'type', { text });
        } catch {
          showNotice('Your browser blocked Paste from this menu. Press Ctrl+V (Cmd+V on a Mac) to paste.');
        }
      }
    });
  };

  const handleRun = () => {
    if (isRunning) {
      showNotice('Your code is already running. Press Stop to end it.');
      return;
    }
    if (!localCode.trim()) {
      showNotice('The editor is empty. Pick a lesson or type some Python first.');
      return;
    }
    onRunCode(localCode);
  };

  const handleClear = () => {
    if (isRunning) {
      showNotice('Stop the running code before clearing the world.');
      return;
    }
    onClearWorld();
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className={`flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 ${reserveLeft ? 'pl-12' : ''}`}>
        <h2 className="text-sm font-semibold text-gray-200">Python Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            aria-disabled={isRunning}
            className={`px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded flex items-center gap-2 transition-colors ${isRunning ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-600'}`}
          >
            <RotateCcw className="w-4 h-4" />
            Clear World
          </button>
          {isRunning ? (
            <button
              onClick={onStop}
              className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-500 flex items-center gap-2 transition-colors"
              title="Stop the program now"
            >
              <Square className="w-4 h-4" />
              Stop
            </button>
          ) : (
            <button
              onClick={handleRun}
              className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-500 flex items-center gap-2 transition-colors"
              title={py === 'loading' ? 'Python is still loading. Your code will run as soon as it is ready.' : 'Run your Python code'}
            >
              {py === 'loading' ? <Loader className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Run Code
            </button>
          )}
        </div>
      </div>
      {notice && (
        <div role="status" className="px-4 py-1.5 text-xs bg-amber-900/60 text-amber-100 border-b border-amber-700/60">
          {notice}
        </div>
      )}

      <div className="flex-1 min-h-0">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={localCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          loading={<div className="text-gray-400 text-sm p-4">Loading editor…</div>}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            contextmenu: true
          }}
        />
      </div>
    </div>
  );
}
