# Getting Started with CodeCraft

## Testing the CodeCraft API

The `codecraft` module is now properly registered in Python and can be imported. Here are some working examples you can try:

### 1. Test Basic Import
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

print("CodeCraft initialized successfully!")
print(f"Total materials available: {len(materials)}")
```

### 2. List All Materials
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

print("Available materials:")
for name, id in list(materials.items())[:10]:
    print(f"  {name}: {id}")
```

### 3. Place a Single Block
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

# Place a diamond block
game.set_block(Position(0, 1, -10), materials['diamond'])
print("Diamond block placed at (0, 1, -10)")
```

### 4. Build a Tower
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

# Build a 10-block tall tower
for y in range(10):
    game.set_block(Position(0, y + 1, -10), materials['brick'])

print("Tower built!")
```

### 5. Create a Wall
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

# Build a 10x5 wall
for x in range(10):
    for y in range(1, 6):
        game.set_block(Position(x, y, -15), materials['brick'])

print(f"Wall complete! Used {10 * 5} blocks")
```

### 6. Rainbow Pattern
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

colors = ['wool_red', 'wool_orange', 'wool_yellow',
          'wool_green', 'wool_blue', 'wool_purple']

for i, color in enumerate(colors):
    for y in range(3):
        game.set_block(Position(i * 2, y + 1, -10), materials[color])

print("Rainbow pattern created!")
```

## Understanding the API

### Game Class
```python
game = Game()
```
- `game.materials` - Dictionary mapping material names to IDs
- `game.set_block(position, material)` - Place a block in the world
- `game.clear_console()` - Clear the console output

### Position Class
```python
pos = Position(x, y, z)
```
- `x` - Horizontal position (left/right)
- `y` - Vertical position (ground = 0, up = positive)
- `z` - Depth position (negative = away from camera)

### Materials Dictionary
Access materials by name:
```python
materials['brick']      # Brown brick blocks
materials['gold']       # Gold blocks
materials['diamond']    # Cyan diamond blocks
materials['wool_red']   # Red wool
materials['glass']      # Transparent glass
```

## Coordinate System

```
      Y (up)
      |
      |
      |________ X (right)
     /
    /
   Z (back)
```

- Origin: (0, 0, 0)
- Ground level: y = 0
- Typical building area: x = -10 to 10, z = -25 to 0

## Quick Examples in the UI

Click "Quick Examples" (below the console) to load pre-built code samples:

1. **Hello World** - Basic setup and single block
2. **List All Materials** - See all available materials
3. **Rainbow Tower** - Colorful vertical structure
4. **Checkerboard Pattern** - 2D pattern on ground
5. **Pyramid** - 3D structure with layers
6. **Simple House** - Complex multi-part build
7. **Spiral Staircase** - Mathematical curve
8. **Random Blocks** - Random placement demo

## Tips for Success

1. **Start Small** - Begin with single blocks, then move to loops
2. **Use Print** - Debug your code with print statements
3. **Check Coordinates** - Watch the camera position in the 3D view
4. **Experiment** - Modify lesson code to learn
5. **Clear Often** - Use "Clear World" to reset the scene
6. **Material Names** - Use the Materials Palette to see available blocks

## Common Patterns

### Build a Column
```python
for y in range(height):
    game.set_block(Position(x, y + 1, z), material)
```

### Build a Wall
```python
for x in range(width):
    for y in range(1, height + 1):
        game.set_block(Position(x, y, z), material)
```

### Build a Cube
```python
for x in range(size):
    for y in range(1, size + 1):
        for z in range(size):
            game.set_block(Position(x, y, z), material)
```

### Create Patterns
```python
if (x + z) % 2 == 0:
    material = materials['white']
else:
    material = materials['black']
```

## Troubleshooting

### Import Not Working?
Make sure you use the exact syntax:
```python
from codecraft import Game, Position
```

### Blocks Not Appearing?
- Check your coordinates (y should be > 0)
- Make sure the blocks aren't too far away
- Use the camera controls to look around

### Code Running Slow?
- Limit to 10,000 blocks maximum
- Use "Clear World" before building again
- Avoid infinite loops

## Next Steps

1. Complete all 20 lessons in order
2. Try the Quick Examples
3. Modify lesson code to experiment
4. Create your own structures
5. Share your creations!

Happy coding! 🎮
