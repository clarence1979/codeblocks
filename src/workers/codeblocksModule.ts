/*
 * The `codeblocks` Python module students import: Game, Position and the materials list.
 * The world is tracked in a Python dict so collision checks are instant, and placed blocks are
 * sent to the 3D view in batches while the program runs.
 */
export const CODEBLOCKS_MODULE = String.raw`
import sys, math, time, array, json, linecache, traceback, difflib
from types import ModuleType
import _codeblocks_js as _js

_MATERIALS = json.loads(_cb_materials_json)
_IDS = {v: k for k, v in _MATERIALS.items()}
_LIMIT = 1_000_000

_world = {}
_pending = array.array('i')
_offset = (0, 0, 0)
_last_flush = 0.0


def _flush():
    global _pending, _last_flush
    if len(_pending):
        _js.emit(_pending)
        _pending = array.array('i')
    _last_flush = time.monotonic()


class UnknownMaterialError(KeyError):
    def __str__(self):
        return self.args[0]


class _Materials(dict):
    def __missing__(self, name):
        hint = ''
        if isinstance(name, str):
            close = difflib.get_close_matches(name, list(self.keys()), n=3, cutoff=0.5)
            if close:
                hint = ' Did you mean ' + ' or '.join(repr(c) for c in close) + '?'
        raise UnknownMaterialError(
            f"There is no material called {name!r}.{hint} The Materials list under the editor shows every name."
        )


def _coord(value, name):
    if isinstance(value, bool) or not isinstance(value, (int, float)):
        raise TypeError(f"Position {name} must be a number, not {type(value).__name__} ({value!r})")
    if isinstance(value, float):
        if math.isnan(value) or math.isinf(value):
            raise ValueError(f"Position {name} must be a real number, not {value}")
        value = int(math.floor(value + 0.5))
    return value


class Position:
    def __init__(self, x, y, z):
        self.x = _coord(x, 'x') + _offset[0]
        self.y = _coord(y, 'y') + _offset[1]
        self.z = _coord(z, 'z') + _offset[2]
        for v, n in ((self.x, 'x'), (self.y, 'y'), (self.z, 'z')):
            if v > _LIMIT or v < -_LIMIT:
                raise ValueError(f"Position {n}={v} is too far away. Keep positions between -{_LIMIT:,} and {_LIMIT:,}.")

    def __repr__(self):
        return f"Position(x={self.x}, y={self.y}, z={self.z})"


class Game:
    def __init__(self):
        self.materials = _Materials(_MATERIALS)
        self.collision_detection_enabled = True

    def _material_id(self, material):
        if isinstance(material, bool):
            raise TypeError("A material must be something like materials['stone'], not True or False")
        if isinstance(material, str):
            return self.materials[material]
        if isinstance(material, int):
            if material in _IDS:
                return material
            raise ValueError(f"{material} is not a material number. Use a name, like materials['stone'].")
        raise TypeError(f"A material must be something like materials['stone'], not {type(material).__name__}")

    def set_block(self, position, material):
        """Place a block. Returns False if the spot was already taken (while collision detection is on)."""
        if not isinstance(position, Position):
            raise TypeError("set_block needs a Position first, like game.set_block(Position(0, 1, 0), materials['stone'])")
        m = self._material_id(material)
        key = (position.x, position.y, position.z)
        if m == 0:
            # Air removes whatever is there.
            if key not in _world:
                return True
            del _world[key]
        else:
            if self.collision_detection_enabled and key in _world:
                return False
            _world[key] = m
        _pending.extend(key)
        _pending.append(m)
        n = len(_pending)
        if n >= 40000 or (n % 1024 == 0 and time.monotonic() - _last_flush > 0.05):
            _flush()
        return True

    def is_position_occupied(self, position):
        """True if a block is already at this position."""
        return (position.x, position.y, position.z) in _world

    def can_place_block(self, position):
        """True if this position is empty."""
        return not self.is_position_occupied(position)

    def disable_collision_detection(self):
        """Let set_block replace blocks that are already there."""
        self.collision_detection_enabled = False

    def enable_collision_detection(self):
        """Stop set_block from replacing blocks that are already there (the default)."""
        self.collision_detection_enabled = True

    def clear_console(self):
        _flush()
        sys.stdout.flush()
        _js.clear()


codeblocks = ModuleType('codeblocks')
codeblocks.Position = Position
codeblocks.Game = Game
codeblocks.UnknownMaterialError = UnknownMaterialError
sys.modules['codeblocks'] = codeblocks
sys.modules['codecraft'] = codeblocks


def _cb_begin(ox, oy, oz, world):
    global _offset, _world, _pending, _last_flush
    _offset = (int(ox), int(oy), int(oz))
    _pending = array.array('i')
    _last_flush = time.monotonic()
    data = world.to_py().tolist()
    _world = {(data[i], data[i + 1], data[i + 2]): data[i + 3] for i in range(0, len(data) - 3, 4)}


def _cb_run(code):
    name = '<your code>'
    linecache.cache[name] = (len(code), None, code.splitlines(True), name)
    ns = {'__name__': '__main__', '__builtins__': __builtins__}
    ok = False
    try:
        exec(compile(code, name, 'exec'), ns)
        ok = True
    except SystemExit:
        ok = True
    except SyntaxError as e:
        print(f"Error: {type(e).__name__} on line {e.lineno}: {e.msg}", file=sys.stderr)
        if e.text:
            print("    " + e.text.rstrip(), file=sys.stderr)
    except BaseException as e:
        frames = [f for f in traceback.extract_tb(e.__traceback__) if f.filename == name]
        if frames:
            print("Traceback (most recent call last):", file=sys.stderr)
            for f in frames:
                where = '' if f.name == '<module>' else f' (in {f.name})'
                print(f"  Line {f.lineno}{where}: {(f.line or '').strip()}", file=sys.stderr)
        print(f"Error: {type(e).__name__}: {e}", file=sys.stderr)
    finally:
        _flush()
        sys.stdout.flush()
        sys.stderr.flush()
    return ok
`;
