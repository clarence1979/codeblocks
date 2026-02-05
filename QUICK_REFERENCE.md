# CodeCraft Quick Reference

## 🎯 Copy & Paste Ready Examples

### Test 1: Verify Import Works
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

print("✓ CodeCraft loaded successfully!")
print(f"✓ {len(materials)} materials available")
```

### Test 2: Show Materials Dictionary
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

print("Materials Dictionary:")
print(materials)
```

### Test 3: Single Diamond Block
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

game.set_block(Position(0, 1, -10), materials['diamond'])
print("Diamond placed at (0, 1, -10)")
```

### Test 4: Three Blocks in a Row
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

game.set_block(Position(0, 1, -10), materials['gold'])
game.set_block(Position(1, 1, -10), materials['diamond'])
game.set_block(Position(2, 1, -10), materials['emerald'])

print("Three blocks placed!")
```

### Test 5: Loop - Vertical Tower
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

for y in range(5):
    game.set_block(Position(0, y + 1, -10), materials['brick'])

print("5-block tower built!")
```

### Test 6: Loop - Horizontal Line
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

for x in range(10):
    game.set_block(Position(x, 1, -10), materials['wool_red'])

print("10-block line built!")
```

### Test 7: Nested Loop - Wall
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

for x in range(5):
    for y in range(1, 4):
        game.set_block(Position(x, y, -10), materials['stone'])

print("5x3 wall built!")
```

### Test 8: List of Colors
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

colors = ['wool_red', 'wool_orange', 'wool_yellow', 'wool_green', 'wool_blue']

for i, color in enumerate(colors):
    game.set_block(Position(i, 1, -10), materials[color])

print(f"Rainbow with {len(colors)} colors!")
```

### Test 9: Conditional Logic
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

for x in range(10):
    if x % 2 == 0:
        material = materials['wool_white']
    else:
        material = materials['wool_black']

    game.set_block(Position(x, 1, -10), material)

print("Alternating pattern!")
```

### Test 10: Function Definition
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

def build_tower(x, z, height, material):
    for y in range(height):
        game.set_block(Position(x, y + 1, z), material)
    print(f"Tower at ({x}, {z}) - {height} blocks")

build_tower(0, -10, 5, materials['gold'])
build_tower(3, -10, 7, materials['diamond'])
```

## 📋 Command Cheat Sheet

### Basic Structure
```python
from codecraft import Game, Position  # Always import first

game = Game()                          # Create game instance
materials = game.materials             # Get materials dictionary

# Place a block
game.set_block(Position(x, y, z), materials['material_name'])

# Check if position is occupied (collision detection)
if game.is_position_occupied(Position(x, y, z)):
    print("Position is occupied!")

# Check if block can be placed
if game.can_place_block(Position(x, y, z)):
    game.set_block(Position(x, y, z), materials['material_name'])

# Print to console
print("Your message here")
```

### Coordinate Guidelines
- **X**: Horizontal, -10 to 10 recommended
- **Y**: Vertical, start at 1 (0 is ground)
- **Z**: Depth, -20 to -5 recommended (negative = away)

### Common Patterns

**Column (vertical):**
```python
for y in range(height):
    game.set_block(Position(x, y + 1, z), material)
```

**Row (horizontal X):**
```python
for x in range(width):
    game.set_block(Position(x, y, z), material)
```

**Line (depth Z):**
```python
for z in range(start, end):
    game.set_block(Position(x, y, z), material)
```

**Wall (X × Y):**
```python
for x in range(width):
    for y in range(1, height + 1):
        game.set_block(Position(x, y, z), material)
```

**Floor (X × Z):**
```python
for x in range(width):
    for z in range(depth):
        game.set_block(Position(x, y, z), material)
```

**Cube (X × Y × Z):**
```python
for x in range(size):
    for y in range(1, size + 1):
        for z in range(size):
            game.set_block(Position(x, y, z), material)
```

## 🛡️ Collision Detection

Collision detection prevents blocks from being placed at positions that are already occupied.

**Check if position is occupied:**
```python
pos = Position(0, 1, -10)
if game.is_position_occupied(pos):
    print("Position is occupied!")
else:
    print("Position is free!")
```

**Check before placing:**
```python
# Only place if position is free
if game.can_place_block(Position(x, y, z)):
    game.set_block(Position(x, y, z), materials['diamond'])
    print("Block placed successfully")
else:
    print("Cannot place block - position occupied")
```

**Skip occupied positions in loops:**
```python
# Place blocks only in free positions
for x in range(10):
    pos = Position(x, 1, -10)
    if game.can_place_block(pos):
        game.set_block(pos, materials['gold'])
        print(f"Placed block at x={x}")
    else:
        print(f"Skipped occupied position at x={x}")
```

**Count collisions:**
```python
placed = 0
skipped = 0

for x in range(10):
    pos = Position(x, 1, -10)
    if game.is_position_occupied(pos):
        skipped += 1
    else:
        game.set_block(pos, materials['brick'])
        placed += 1

print(f"Placed: {placed}, Skipped: {skipped}")
```

## 🎨 Popular Materials

### Basic Building
- `brick` - Brown bricks
- `stone` - Gray stone
- `cobblestone` - Textured gray
- `planks_oak` - Wood planks
- `dirt` - Brown earth
- `grass` - Green grass

### Precious
- `gold` - Gold blocks
- `diamond` - Cyan diamonds
- `emerald` - Green emeralds
- `iron` - Silver/gray iron
- `copper` - Orange copper

### Colorful Wool
- `wool_red`, `wool_blue`, `wool_green`, `wool_yellow`
- `wool_orange`, `wool_purple`, `wool_pink`, `wool_cyan`
- `wool_white`, `wool_black`, `wool_gray`

### Transparent
- `glass` - See-through glass
- `ice` - Blue ice

## 🔍 Debugging

**Print coordinates:**
```python
x, y, z = 5, 3, -10
print(f"Position: ({x}, {y}, {z})")
```

**Print material IDs:**
```python
print(f"Gold ID: {materials['gold']}")
```

**Count iterations:**
```python
count = 0
for x in range(10):
    count += 1
print(f"Placed {count} blocks")
```

**Verify materials exist:**
```python
if 'diamond' in materials:
    print("Diamond is available!")
```

## ⚡ Quick Tips

1. Start Y at 1, not 0 (ground is 0)
2. Use negative Z for visibility (-10 to -20)
3. Keep X centered around 0 (-5 to 5)
4. Test with 1 block before loops
5. Use print() liberally for debugging
6. Click "Clear World" between tests
7. Use WASD to fly around your creation
8. Drag mouse to rotate camera
9. Scroll to zoom in/out

## 🚫 Common Mistakes

**Wrong import:**
```python
# ❌ Wrong
import codecraft

# ✓ Correct
from codecraft import Game, Position
```

**Forgetting to add 1 to Y:**
```python
# ❌ Blocks at ground level (invisible)
for y in range(5):
    game.set_block(Position(0, y, -10), material)

# ✓ Blocks above ground
for y in range(5):
    game.set_block(Position(0, y + 1, -10), material)
```

**Positive Z values:**
```python
# ❌ Behind camera (hard to see)
game.set_block(Position(0, 1, 10), material)

# ✓ In front of camera
game.set_block(Position(0, 1, -10), material)
```

## 🎓 Learning Path

1. ✅ Run Test 1-3 (verify import, single blocks)
2. ✅ Run Test 4-6 (loops, lines)
3. ✅ Run Test 7 (nested loops, walls)
4. ✅ Run Test 8-9 (lists, conditionals)
5. ✅ Run Test 10 (functions)
6. ✅ Try Quick Examples in UI
7. ✅ Complete Lessons 1-6 (Volume 1)
8. ✅ Complete Lessons 7-14 (Volume 2)
9. ✅ Complete Lessons 15-20 (Volume 3)
10. ✅ Create your own structures!

---

**Ready to start?** Copy any example above into the editor and click "Run Code"! 🚀
