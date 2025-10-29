import { Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { QUICK_EXAMPLES } from '../data/examples';

interface QuickExamplesProps {
  onLoadExample: (code: string) => void;
}

export function QuickExamples({ onLoadExample }: QuickExamplesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gray-900 border-t border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Code2 className="w-4 h-4 text-green-400" />
          <h3 className="text-sm font-semibold text-gray-200">Quick Examples</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="p-3 max-h-40 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2">
            {QUICK_EXAMPLES.map((example) => (
              <button
                key={example.id}
                onClick={() => onLoadExample(example.code)}
                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-left rounded border border-gray-700 hover:border-green-500 transition-colors group"
              >
                <div className="text-sm font-medium text-gray-200 group-hover:text-green-400">
                  {example.title}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
