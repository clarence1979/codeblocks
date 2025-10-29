# CodeCraft Testing Guide

## ✅ Confirmed Working Examples

All of these code samples have been tested and work correctly with the CodeCraft API:

### 1. Test Import and Materials Dictionary
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

print("CodeCraft is working!")
print(f"Total materials: {len(materials)}")
print(f"Diamond ID: {materials['diamond']}")
print(f"Gold ID: {materials['gold']}")
```

**Expected Output:**
```
CodeCraft is working!
Total materials: 88
Diamond ID: 3
Gold ID: 6
```

### 2. List First 10 Materials
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

print("First 10 materials:")
count = 0
for name, id in materials.items():
    print(f"  {name}: {id}")
    count += 1
    if count >= 10:
        break
```

**Expected Output:** List of material names and their IDs

### 3. Place Single Block
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

game.set_block(Position(0, 1, -10), materials['diamond'])
print("Diamond block placed!")
```

**Expected Result:** Diamond block appears in 3D world

### 4. Build Simple Tower
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

height = 5
for y in range(height):
    game.set_block(Position(0, y + 1, -10), materials['brick'])

print(f"Tower {height} blocks tall built!")
```

**Expected Result:** 5-block tall brick tower

### 5. Create Colorful Row
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

colors = ['wool_red', 'wool_blue', 'wool_green', 'wool_yellow']

for i, color in enumerate(colors):
    game.set_block(Position(i, 1, -10), materials[color])
    print(f"Placed {color}")

print("Rainbow row complete!")
```

**Expected Result:** Row of colored wool blocks

## 🎯 API Reference

### Classes

**Game()**
- `materials` - Dictionary of all material names to IDs
- `set_block(position, material)` - Place a block
- `clear_console()` - Clear console output

**Position(x, y, z)**
- `x` - Integer X coordinate
- `y` - Integer Y coordinate (0 = ground)
- `z` - Integer Z coordinate (negative = away)

### Material Names (88 total)

**Basic Blocks:**
- `air`, `brick`, `cobblestone`, `diamond`, `dirt`, `glass`, `gold`, `grass`, `obsidian`, `planks_oak`, `quartz`, `redstone`, `sand`, `stone`, `tnt`, `wood`

**Wool Colors:**
- `wool_blue`, `wool_red`, `wool_green`, `wool_yellow`, `wool_orange`, `wool_purple`, `wool_pink`, `wool_cyan`, `wool_gray`, `wool_light_gray`, `wool_brown`, `wool_lime`, `wool_white`, `wool_black`

**Concrete Colors:**
- `concrete_white`, `concrete_orange`, `concrete_magenta`, `concrete_light_blue`, `concrete_yellow`, `concrete_lime`, `concrete_pink`, `concrete_gray`, `concrete_cyan`, `concrete_purple`, `concrete_blue`, `concrete_brown`, `concrete_green`, `concrete_red`, `concrete_black`

**Terracotta Colors:**
- `terracotta`, `terracotta_white`, `terracotta_orange`, `terracotta_magenta`, `terracotta_light_blue`, `terracotta_yellow`, `terracotta_lime`, `terracotta_pink`, `terracotta_gray`, `terracotta_cyan`, `terracotta_purple`, `terracotta_blue`, `terracotta_brown`, `terracotta_green`, `terracotta_red`, `terracotta_black`

**Special Blocks:**
- `emerald`, `lapis`, `copper`, `iron`, `coal`, `bookshelf`, `mossy_cobblestone`, `netherrack`, `soul_sand`, `glowstone`, `prismarine`, `sea_lantern`, `packed_ice`, `magma`, `nether_brick`, `end_stone`, `purpur`, `shulker_box`, `glazed_terracotta_cyan`, `glazed_terracotta_purple`

**Linen/Box:**
- `leaves`, `ice`, `linen_red`, `linen_blue`, `box_red`, `box_blue`, `box_lime`

## 🔧 Debugging Tips

### Import Errors
If you get "ModuleNotFoundError: No module named 'codecraft'":
- The module is registered automatically - just use `from codecraft import Game, Position`
- Make sure to include both `Game` and `Position` in the import

### Blocks Not Appearing
- Check Y coordinate is > 0 (ground is at y=0)
- Check Z coordinate is negative for visibility (e.g., -10 to -20)
- Use camera controls (drag, scroll, WASD) to look around

### Code Runs But No Output
- Add `print()` statements to verify code is running
- Check console panel for output
- Make sure blocks aren't placed at (0,0,0) which might be hard to see

### Materials Not Found
- Use exact material names from the list above
- Material names are case-sensitive
- Use underscores (e.g., `wool_red`, not `wool red`)

## 📝 Best Practices

1. **Always import at the top:**
   ```python
   from codecraft import Game, Position
   ```

2. **Initialize once:**
   ```python
   game = Game()
   materials = game.materials
   ```

3. **Use clear coordinates:**
   - X: -10 to 10 (horizontal)
   - Y: 1 to 20 (vertical, start at 1)
   - Z: -20 to -5 (depth, negative is away)

4. **Print for debugging:**
   ```python
   print(f"Building at ({x}, {y}, {z})")
   ```

5. **Test incrementally:**
   - Start with 1 block
   - Add a loop for multiple blocks
   - Build more complex structures

## 🚀 Quick Start Workflow

1. Load a lesson or example
2. Click "Run Code"
3. Observe output in console and 3D world
4. Modify the code
5. Click "Run Code" again
6. Use "Clear World" to reset

## ✨ Pro Tips

- Use the Materials Palette to see all block colors
- The Quick Examples panel has ready-to-run code
- Camera position is shown in the 3D view
- Block count is displayed in real-time
- Maximum 10,000 blocks for performance
- Use WASD to fly around your creation

Happy building! 🎮
