import { X, Sparkles, Code, Box } from 'lucide-react';

interface WelcomeModalProps {
  onClose: () => void;
}

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700 shadow-2xl">
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-white" />
            <h2 className="text-2xl font-bold text-white">Welcome to Code Blocks!</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded p-1 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <p className="text-gray-300 text-lg leading-relaxed">
              Learn Python programming by building amazing 3D structures! Code Blocks combines coding education
              with interactive block building to make learning fun and visual.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h3 className="font-semibold text-white">Code Editor</h3>
              </div>
              <p className="text-sm text-gray-400">
                Write Python code with syntax highlighting. Use the Code Blocks API to place blocks in 3D space.
              </p>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <Box className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-white">3D World</h3>
              </div>
              <p className="text-sm text-gray-400">
                Watch your code come to life! Drag to rotate, scroll to zoom, and use WASD to move around.
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-900/50 to-cyan-900/50 p-4 rounded-lg border border-blue-700/50">
            <h3 className="font-semibold text-white mb-2">Getting Started:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-300">
              <li>Start with Lesson 1 to learn the basics</li>
              <li>Click "Run Code" to execute your Python program</li>
              <li>Watch blocks appear in the 3D world</li>
              <li>Experiment and modify the code to learn</li>
              <li>Progress through 20 interactive lessons</li>
            </ol>
          </div>

          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <h3 className="font-semibold text-white mb-2">What You'll Learn:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div>
                <div className="text-blue-400 font-medium">Volume 1</div>
                <div className="text-gray-400">Python basics, loops, functions</div>
              </div>
              <div>
                <div className="text-cyan-400 font-medium">Volume 2</div>
                <div className="text-gray-400">Data types, lists, conditionals</div>
              </div>
              <div>
                <div className="text-green-400 font-medium">Volume 3</div>
                <div className="text-gray-400">Complex structures, patterns</div>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-cyan-500 transition-all transform hover:scale-105"
          >
            Start Learning!
          </button>
        </div>
      </div>
    </div>
  );
}
