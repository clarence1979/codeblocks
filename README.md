# CodeCraft - Python Learning Platform

CodeCraft is an interactive web-based platform that teaches Python programming through 3D block building. Learn coding concepts by creating structures in a Minecraft-style voxel world! Export your creations as STL files for 3D printing or use in animation projects.

## Features

### 🎓 Interactive Learning
- **20 Progressive Lessons** organized into 3 volumes
- Volume 1: Python Introduction (print, loops, functions, coordinates)
- Volume 2: Python Basics (data types, lists, conditionals, modules)
- Volume 3: Building Structures (walls, cubes, patterns, complex builds)

### 💻 Code Editor
- Monaco Editor (VS Code) with Python syntax highlighting
- Real-time code execution using Pyodide (Python in WebAssembly)
- Console output for debugging and feedback

### 🎮 3D Visualization
- Three.js-powered 3D voxel world
- 88 different block materials (brick, gold, diamond, wool, concrete, etc.)
- Interactive camera controls:
  - Mouse drag to rotate
  - Scroll to zoom
  - WASD keys to move
- Real-time block placement as code runs
- Export to STL format for 3D printing and animation

### 🎨 Materials System
- 88 block types with unique colors and textures
- Materials palette showing all available blocks
- Easy material selection via dictionary

### 🔧 CodeCraft API
The `codecraft` module is fully registered in the Python environment and can be imported like any standard module:

```python
from codecraft import Game, Position

game = Game()
materials = game.materials

# Place a single block
game.set_block(Position(x, y, z), materials['diamond'])

# Access materials dictionary
print(f"Total materials: {len(materials)}")
for name, id in materials.items():
    print(f"{name}: {id}")

# Clear console output
game.clear_console()
```

### 📚 Quick Examples
The platform includes 8 ready-to-use code examples:
- Hello World
- List All Materials
- Rainbow Tower
- Checkerboard Pattern
- Pyramid
- Simple House
- Spiral Staircase
- Random Blocks

Access them via the "Quick Examples" panel below the console!

## Getting Started

1. **Start the Application**
   - The welcome modal explains the basics
   - Begin with Lesson 1

2. **Write Python Code**
   - Use the left panel code editor
   - Each lesson provides starter code

3. **Run Your Code**
   - Click "Run Code" to execute
   - Watch blocks appear in the 3D world
   - Check console for output

4. **Experiment and Learn**
   - Modify the code to see changes
   - Try different materials and positions
   - Build your own structures

## Coordinate System

- **X-axis**: Horizontal (left/right), positive = right
- **Y-axis**: Vertical (up/down), 0 = ground level
- **Z-axis**: Depth (forward/back), negative = away from camera
- **Origin**: (0, 0, 0)

## Example Code

### Build a Column
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

for y in range(10):
    game.set_block(Position(0, y + 1, -10), materials['brick'])
```

### Build a Wall
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

for x in range(10):
    for y in range(1, 6):
        game.set_block(Position(x, y, -15), materials['brick'])
```

### Build a Cube
```python
from codecraft import Game, Position

game = Game()
materials = game.materials

for x in range(5):
    for y in range(1, 6):
        for z in range(5):
            game.set_block(Position(x, y, z - 20), materials['diamond'])
```

## Technical Stack

- **Frontend**: React with TypeScript
- **3D Graphics**: Three.js
- **Code Editor**: Monaco Editor
- **Python Runtime**: Pyodide (Python in WebAssembly)
- **Styling**: Tailwind CSS
- **State Management**: Zustand

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Type checking
npm run typecheck
```

## Performance Notes

- Maximum 10,000 blocks for optimal performance
- Blocks render in real-time as code executes
- Use "Clear World" to reset the scene

## Learning Path

1. **Beginner** (Lessons 1-6): Learn Python basics and the CodeCraft interface
2. **Intermediate** (Lessons 7-14): Master Python data structures and control flow
3. **Advanced** (Lessons 15-20): Build complex structures like houses and bridges

## Credits

Built with modern web technologies to provide an engaging, educational coding experience for learners of all ages (10+).
