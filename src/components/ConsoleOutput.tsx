import { useEffect, useRef, useState } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { AiInputPanel } from './AiInputPanel';

interface ConsoleOutputProps {
  output: string[];
  aiInputText: string;
  onAiInputChange: (text: string) => void;
  onGenerateCode: (prompt: string) => void;
  isGenerating: boolean;
  /** Height when open, e.g. 'h-64' on phones or 'h-full' inside a sized panel. */
  expandedHeight?: string;
  /** Optional: let the parent own the open/closed state (so it can resize around it). */
  expanded?: boolean;
  onToggle?: () => void;
}

// Lines Python wrote to stderr start with this marker; they are shown in red without it.
const ERR = '\u0001';

function isErrorLine(line: string) {
  return line.startsWith(ERR) || line.startsWith('Error:') || line.startsWith('Traceback') || line.startsWith('AI Error:');
}

export function ConsoleOutput({
  output,
  aiInputText,
  onAiInputChange,
  onGenerateCode,
  isGenerating,
  expandedHeight = 'h-64',
  expanded,
  onToggle
}: ConsoleOutputProps) {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [localExpanded, setLocalExpanded] = useState(true);
  const isExpanded = expanded ?? localExpanded;
  const toggle = onToggle ?? (() => setLocalExpanded((v) => !v));

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className={`bg-gray-950 border-t border-gray-700 flex flex-col ${isExpanded ? expandedHeight : 'h-auto'}`}>
      <button
        onClick={toggle}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-900 border-b border-gray-700 hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-gray-200">Console & AI Assistant</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="flex-1 flex flex-col sm:flex-row overflow-hidden min-h-0">
          {/* Left Column - AI Input */}
          <div className="flex-1 sm:flex-none sm:w-1/2 flex flex-col min-h-0">
            <AiInputPanel
              onGenerateCode={onGenerateCode}
              isGenerating={isGenerating}
              inputText={aiInputText}
              onInputChange={onAiInputChange}
            />
          </div>

          {/* Right Column - Console Output */}
          <div className="flex-1 sm:flex-none sm:w-1/2 flex flex-col min-h-0 border-t border-gray-700 sm:border-t-0">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
              <Terminal className="w-4 h-4 text-green-400" />
              <h4 className="text-xs font-semibold text-gray-300">Console Output</h4>
            </div>
            <div
              ref={consoleRef}
              role="log"
              aria-label="Console output"
              className="flex-1 overflow-y-auto p-4 font-mono text-sm"
            >
              {output.length === 0 ? (
                <div className="text-gray-500 italic">
                  Click "Run Code" to see output here...
                </div>
              ) : (
                output.map((line, index) => (
                  <div
                    key={index}
                    className={`py-0.5 whitespace-pre-wrap break-words ${isErrorLine(line) ? 'text-red-400' : 'text-green-400'}`}
                  >
                    {line.startsWith(ERR) ? line.slice(1) : line}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
