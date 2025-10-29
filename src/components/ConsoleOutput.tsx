import { useEffect, useRef, useState } from 'react';
import { Terminal, ChevronDown, ChevronUp } from 'lucide-react';
import { AiInputPanel } from './AiInputPanel';

interface ConsoleOutputProps {
  output: string[];
  aiInputText: string;
  onAiInputChange: (text: string) => void;
  onGenerateCode: (prompt: string) => void;
  isGenerating: boolean;
  hasApiKey: boolean;
}

export function ConsoleOutput({
  output,
  aiInputText,
  onAiInputChange,
  onGenerateCode,
  isGenerating,
  hasApiKey
}: ConsoleOutputProps) {
  const consoleRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight;
    }
  }, [output]);

  return (
    <div className={`bg-gray-950 border-t border-gray-700 flex flex-col ${isExpanded ? 'h-64' : 'h-auto'}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
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
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - AI Input */}
          <div className="w-1/2 flex flex-col">
            <AiInputPanel
              onGenerateCode={onGenerateCode}
              isGenerating={isGenerating}
              hasApiKey={hasApiKey}
              inputText={aiInputText}
              onInputChange={onAiInputChange}
            />
          </div>

          {/* Right Column - Console Output */}
          <div className="w-1/2 flex flex-col">
            <div className="flex items-center gap-2 px-4 py-2 bg-gray-900 border-b border-gray-700">
              <Terminal className="w-4 h-4 text-green-400" />
              <h4 className="text-xs font-semibold text-gray-300">Console Output</h4>
            </div>
            <div
              ref={consoleRef}
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
                    className={`py-0.5 ${
                      line.startsWith('Error:') || line.startsWith('Traceback')
                        ? 'text-red-400'
                        : 'text-green-400'
                    }`}
                  >
                    {line}
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
