import { useState } from 'react';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { MATERIALS, MATERIAL_COLORS } from '../data/materials';
import { INSERT_CODE_EVENT } from '../utils/events';

const ENTRIES = Object.entries(MATERIALS).filter(([name]) => name !== 'air');

function swatch(id: number) {
  const c = MATERIAL_COLORS[id] || '#888888';
  return c.length === 9 ? c.slice(0, 7) : c;
}

export function MaterialsPalette() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [last, setLast] = useState('');

  const insert = (name: string) => {
    const text = `materials['${name}']`;
    window.dispatchEvent(new CustomEvent(INSERT_CODE_EVENT, { detail: text }));
    setLast(text);
  };

  return (
    <div className="bg-gray-900 border-t border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 hover:bg-gray-700 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-200">Materials Palette</h3>
          <span className="text-xs text-gray-500">({ENTRIES.length} types)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-2">
          <p className="text-xs text-gray-400 mb-2 px-1">
            Click a material to type it into your code at the cursor.
            {last && <span className="text-green-400"> Added {last}</span>}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-1 max-h-36 overflow-y-auto">
            {ENTRIES.map(([name, id]) => (
              <button
                key={name}
                type="button"
                onClick={() => insert(name)}
                className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-gray-800 text-left focus:outline-none focus:ring-2 focus:ring-blue-500"
                title={`Insert materials['${name}']`}
              >
                <span
                  className="w-4 h-4 rounded-sm border border-gray-600 flex-shrink-0"
                  style={{ backgroundColor: swatch(id) }}
                />
                <span className="text-xs text-gray-300 truncate">{name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
