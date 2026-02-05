import { loadPyodide, PyodideInterface } from 'pyodide';
import { MATERIALS } from '../data/materials';

let pyodideInstance: PyodideInterface | null = null;

export async function initializePyodide(): Promise<PyodideInterface> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  pyodideInstance = await loadPyodide({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.29.0/full/'
  });

  return pyodideInstance;
}

export async function executePythonCode(
  code: string,
  onBlockPlaced: (x: number, y: number, z: number, material: number) => void,
  onConsoleOutput: (message: string) => void,
  onConsoleClear: () => void,
  isPositionOccupied?: (x: number, y: number, z: number) => boolean,
  offset?: { x: number; y: number; z: number }
): Promise<void> {
  try {
    const pyodide = await initializePyodide();

    // Track blocks placed during this execution for immediate collision detection
    const placedBlocksThisExecution = new Set<string>();

    // Wrapper for block placement that tracks placements
    const trackingBlockCallback = (x: number, y: number, z: number, material: number) => {
      const key = `${x},${y},${z}`;
      placedBlocksThisExecution.add(key);
      onBlockPlaced(x, y, z, material);
    };

    // Enhanced position check that includes currently-being-placed blocks
    const enhancedPositionCheck = (x: number, y: number, z: number): boolean => {
      const key = `${x},${y},${z}`;
      // Check if block was just placed in this execution
      if (placedBlocksThisExecution.has(key)) {
        return true;
      }
      // Check existing blocks in store
      if (isPositionOccupied) {
        return isPositionOccupied(x, y, z);
      }
      return false;
    };

    const offsetX = offset?.x || 0;
    const offsetY = offset?.y || 0;
    const offsetZ = offset?.z || 0;

    const codeCraftModule = `
import sys
from types import ModuleType

# Global callbacks that all Game instances will use
_global_block_callback = None
_global_console_callback = None
_global_clear_callback = None
_global_position_check_callback = None
_global_offset = (${offsetX}, ${offsetY}, ${offsetZ})

class Position:
    def __init__(self, x, y, z):
        self.x = x + _global_offset[0]
        self.y = y + _global_offset[1]
        self.z = z + _global_offset[2]

    def __repr__(self):
        return f"Position(x={self.x}, y={self.y}, z={self.z})"

class Game:
    def __init__(self):
        self.materials = ${JSON.stringify(MATERIALS)}
        # Use global callbacks so all Game instances work
        self._block_callback = _global_block_callback
        self._console_callback = _global_console_callback
        self._clear_callback = _global_clear_callback
        self._position_check_callback = _global_position_check_callback
        self.collision_detection_enabled = True

    def set_block(self, position, material):
        # Check for collision before placing
        if self.collision_detection_enabled and self._position_check_callback:
            if self._position_check_callback(position.x, position.y, position.z):
                # Position is occupied, don't place block
                return False

        if self._block_callback:
            self._block_callback(position.x, position.y, position.z, material)
            return True
        return False

    def is_position_occupied(self, position):
        """Check if a position is already occupied by a block"""
        if self._position_check_callback:
            return self._position_check_callback(position.x, position.y, position.z)
        return False

    def can_place_block(self, position):
        """Check if a block can be placed at this position (opposite of is_position_occupied)"""
        return not self.is_position_occupied(position)

    def disable_collision_detection(self):
        """Disable collision detection to allow overwriting blocks"""
        self.collision_detection_enabled = False

    def enable_collision_detection(self):
        """Enable collision detection to prevent overwriting blocks"""
        self.collision_detection_enabled = True

    def clear_console(self):
        if self._clear_callback:
            self._clear_callback()

def _set_global_callbacks(block_cb, console_cb, clear_cb, position_check_cb):
    global _global_block_callback, _global_console_callback, _global_clear_callback, _global_position_check_callback
    _global_block_callback = block_cb
    _global_console_callback = console_cb
    _global_clear_callback = clear_cb
    _global_position_check_callback = position_check_cb

# Create codeblocks module
codeblocks = ModuleType('codeblocks')
codeblocks.Position = Position
codeblocks.Game = Game

# Register the module
sys.modules['codeblocks'] = codeblocks

# Also register as codecraft for backwards compatibility
sys.modules['codecraft'] = codeblocks
`;

    await pyodide.runPythonAsync(codeCraftModule);

    pyodide.globals.set('js_block_callback', trackingBlockCallback);
    pyodide.globals.set('js_console_callback', onConsoleOutput);
    pyodide.globals.set('js_clear_callback', onConsoleClear);
    pyodide.globals.set('js_position_check_callback', enhancedPositionCheck);

    const setupCallbacks = `
_set_global_callbacks(js_block_callback, js_console_callback, js_clear_callback, js_position_check_callback)
`;
    await pyodide.runPythonAsync(setupCallbacks);

    const wrappedCode = `
import sys
import io
import traceback

output_buffer = io.StringIO()
sys.stdout = output_buffer
sys.stderr = output_buffer

try:
${code.split('\n').map(line => '    ' + line).join('\n')}
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    traceback.print_exc()

output = output_buffer.getvalue()
output
`;

    const output = await pyodide.runPythonAsync(wrappedCode);

    if (output && typeof output === 'string') {
      const lines = output.split('\n').filter(line => line.trim());
      lines.forEach(line => onConsoleOutput(line));
    }

  } catch (error) {
    if (error instanceof Error) {
      onConsoleOutput(`Error: ${error.message}`);
    } else {
      onConsoleOutput('An unknown error occurred');
    }
  }
}
