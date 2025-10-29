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
  onConsoleClear: () => void
): Promise<void> {
  try {
    const pyodide = await initializePyodide();

    const codeCraftModule = `
import sys
from types import ModuleType

# Global callbacks that all Game instances will use
_global_block_callback = None
_global_console_callback = None
_global_clear_callback = None

class Position:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z

    def __repr__(self):
        return f"Position(x={self.x}, y={self.y}, z={self.z})"

class Game:
    def __init__(self):
        self.materials = ${JSON.stringify(MATERIALS)}
        # Use global callbacks so all Game instances work
        self._block_callback = _global_block_callback
        self._console_callback = _global_console_callback
        self._clear_callback = _global_clear_callback

    def set_block(self, position, material):
        if self._block_callback:
            self._block_callback(position.x, position.y, position.z, material)

    def clear_console(self):
        if self._clear_callback:
            self._clear_callback()

def _set_global_callbacks(block_cb, console_cb, clear_cb):
    global _global_block_callback, _global_console_callback, _global_clear_callback
    _global_block_callback = block_cb
    _global_console_callback = console_cb
    _global_clear_callback = clear_cb

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

    pyodide.globals.set('js_block_callback', onBlockPlaced);
    pyodide.globals.set('js_console_callback', onConsoleOutput);
    pyodide.globals.set('js_clear_callback', onConsoleClear);

    const setupCallbacks = `
_set_global_callbacks(js_block_callback, js_console_callback, js_clear_callback)
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
