import { Editor } from '@monaco-editor/react';
import { Play, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import type { editor } from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  onCodeChange: (code: string) => void;
  onRunCode: (code: string) => void;
  onClearWorld: () => void;
  isRunning: boolean;
}

export function CodeEditor({
  code,
  onCodeChange,
  onRunCode,
  onClearWorld,
  isRunning
}: CodeEditorProps) {
  const [localCode, setLocalCode] = useState(code);
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  // Sync local state when code prop changes (e.g., from quick examples or lessons)
  useEffect(() => {
    if (code !== localCode) {
      setLocalCode(code);
      // Also update the editor directly to ensure it reflects the change
      if (editorRef.current) {
        editorRef.current.setValue(code);
      }
    }
  }, [code, localCode]);

  const handleEditorChange = (value: string | undefined) => {
    const newCode = value || '';
    setLocalCode(newCode);
    onCodeChange(newCode);
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;

    // Override the default paste action with working one
    editor.addAction({
      id: 'editor.action.clipboardPasteAction',
      label: 'Paste',
      keybindings: [2086], // Ctrl+V
      precondition: undefined,
      keybindingContext: undefined,
      contextMenuGroupId: '9_cutcopypaste',
      contextMenuOrder: 2,
      run: async (ed) => {
        try {
          const text = await navigator.clipboard.readText();
          if (text) {
            ed.trigger('keyboard', 'type', { text });
          }
        } catch (err) {
          console.error('Clipboard paste failed:', err);
          alert('Unable to paste. Please use Ctrl+V (or Cmd+V on Mac) instead.');
        }
      }
    });
  };

  return (
    <div className="h-full flex flex-col bg-gray-900">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-200">Python Editor</h2>
        <div className="flex gap-2">
          <button
            onClick={onClearWorld}
            disabled={isRunning}
            className="px-3 py-1.5 text-sm font-medium text-gray-300 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Clear World
          </button>
          <button
            onClick={() => onRunCode(localCode)}
            disabled={isRunning}
            className="px-4 py-1.5 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <Play className="w-4 h-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="python"
          theme="vs-dark"
          value={localCode}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            wordWrap: 'on',
            contextmenu: true,
            contextmenuActions: [
              'editor.action.clipboardCutAction',
              'editor.action.clipboardCopyAction',
            ]
          }}
        />
      </div>
    </div>
  );
}
