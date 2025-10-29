import { useState } from 'react';
import { Palette, ChevronDown, ChevronUp } from 'lucide-react';
import { MATERIALS, MATERIAL_COLORS } from '../data/materials';

export function MaterialsPalette() {
  const [isExpanded, setIsExpanded] = useState(false);

  const materialEntries = Object.entries(MATERIALS)
    .filter(([name]) => name !== 'air')
    .slice(0, 24);

  return (
    <div className="bg-gray-900 border-t border-gray-700">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-purple-400" />
          <h3 className="text-sm font-semibold text-gray-200">Materials Palette</h3>
          <span className="text-xs text-gray-500">({Object.keys(MATERIALS).length - 1} types)</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>
      {isExpanded && (
        <div className="p-3 grid grid-cols-6 gap-2 max-h-32 overflow-y-auto">
          {materialEntries.map(([name, id]) => (
            <div
              key={name}
              className="group relative"
              title={name.replace(/_/g, ' ')}
            >
              <div
                className="w-full aspect-square rounded border border-gray-700 cursor-pointer hover:border-blue-500 transition-colors"
                style={{ backgroundColor: MATERIAL_COLORS[id] }}
              />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                {name.replace(/_/g, ' ')}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
