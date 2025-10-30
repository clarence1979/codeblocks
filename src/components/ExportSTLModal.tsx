import { X, Download, Box } from 'lucide-react';
import { Block } from '../types';
import { detectObjects } from '../utils/objectDetector';
import { exportToSTL } from '../utils/stlExporter';
import { useState } from 'react';

interface ExportSTLModalProps {
  blocks: Block[];
  onClose: () => void;
}

export function ExportSTLModal({ blocks, onClose }: ExportSTLModalProps) {
  const objects = detectObjects(blocks);
  const [selectedObjects, setSelectedObjects] = useState<Set<number>>(
    new Set(objects.map((_, idx) => idx))
  );

  const toggleObject = (index: number) => {
    const newSelected = new Set(selectedObjects);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedObjects(newSelected);
  };

  const handleExport = () => {
    if (selectedObjects.size === 0) {
      alert('Please select at least one object to export.');
      return;
    }

    const selectedBlocks = objects
      .filter((_, idx) => selectedObjects.has(idx))
      .flatMap(obj => obj.blocks);

    const stlContent = exportToSTL(selectedBlocks);
    const blob = new Blob([stlContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const timestamp = new Date().toISOString().slice(0, 16).replace('T', '-').replace(':', '-');
    const filename = `code-blocks-${timestamp}.stl`;

    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    onClose();
  };

  if (objects.length === 0) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-lg max-w-md w-full border border-gray-700 shadow-2xl">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between rounded-t-lg">
            <div className="flex items-center gap-3">
              <Download className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Export to STL</h2>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 rounded p-1 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6">
            <div className="flex flex-col items-center gap-4 text-center">
              <Box className="w-16 h-16 text-gray-600" />
              <div>
                <p className="text-white font-semibold mb-2">No Objects Detected</p>
                <p className="text-gray-400 text-sm">
                  There are no blocks in the 3D view to export. Run your code to create some blocks first!
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="w-6 h-6 text-white" />
            <h2 className="text-xl font-bold text-white">Export to STL</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-300 mb-4">
            Select the objects you want to export to STL format for 3D printing or animation:
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
            {objects.map((obj, idx) => (
              <label
                key={idx}
                className="flex items-center gap-3 p-3 bg-gray-900 hover:bg-gray-700 rounded-lg cursor-pointer transition-colors border border-gray-700"
              >
                <input
                  type="checkbox"
                  checked={selectedObjects.has(idx)}
                  onChange={() => toggleObject(idx)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Box className="w-4 h-4 text-blue-400" />
                    <span className="text-white font-medium">{obj.name}</span>
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {obj.blocks.length} blocks • Center: ({obj.center.x.toFixed(1)}, {obj.center.y.toFixed(1)}, {obj.center.z.toFixed(1)})
                  </div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={selectedObjects.size === 0}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Download size={18} />
              Export Selected ({selectedObjects.size})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
