export const QUICK_EXAMPLES = [
  {
    id: 'hello',
    title: 'Hello World',
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

print("Hello from Code Blocks!")
print(f"Available materials: {len(materials)}")

# Place a single block
game.set_block(Position(0, 1, -10), materials['diamond'])
print("Diamond block placed!")
`
  },
  {
    id: 'materials',
    title: 'List All Materials',
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

print("Available materials:")
for name, id in materials.items():
    print(f"  {name}: {id}")

print(f"\\nTotal: {len(materials)} materials")
`
  },
  {
    id: 'rainbow',
    title: 'Rainbow Tower',
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Rainbow colors
colors = ['wool_red', 'wool_orange', 'wool_yellow',
          'wool_green', 'wool_blue', 'wool_purple']

print("Building rainbow tower...")

for i, color in enumerate(colors):
    for y in range(5):
        game.set_block(Position(0, i * 5 + y + 1, -10), materials[color])

print("Rainbow tower complete!")
`
  },
  {
    id: 'checkerboard',
    title: 'Checkerboard Pattern',
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

size = 8
print(f"Creating {size}x{size} checkerboard...")

for x in range(size):
    for z in range(size):
        if (x + z) % 2 == 0:
            material = materials['wool_white']
        else:
            material = materials['wool_black']

        game.set_block(Position(x, 1, z - 15), material)

print("Checkerboard complete!")
`
  },
  {
    id: 'pyramid',
    title: 'Pyramid',
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

height = 7
print(f"Building pyramid (height: {height})...")

for y in range(height):
    size = height - y
    for x in range(-size, size + 1):
        for z in range(-size, size + 1):
            game.set_block(
                Position(x, y + 1, z - 15),
                materials['gold']
            )

print("Pyramid complete!")
`
  },
  {
    id: 'house',
    title: 'Simple House',
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

print("Building house...")

# Floor
for x in range(6):
    for z in range(-20, -14):
        game.set_block(Position(x, 0, z), materials['planks_oak'])

# Walls
for x in range(6):
    for z in range(-20, -14):
        for y in range(1, 4):
            # Only edges
            if x == 0 or x == 5 or z == -20 or z == -15:
                # Leave door space
                if not (x == 2 and z == -15 and y <= 2):
                    game.set_block(Position(x, y, z), materials['brick'])

# Roof
for x in range(6):
    for z in range(-20, -14):
        game.set_block(Position(x, 4, z), materials['planks_oak'])

print("House complete!")
`
  },
  {
    id: 'spiral',
    title: 'Spiral Staircase',
    code: `from codeblocks import Game, Position
import math

game = Game()
materials = game.materials

print("Building spiral staircase...")

height = 20
for y in range(height):
    angle = y * 30  # degrees
    radius = 3

    x = int(radius * math.cos(math.radians(angle)))
    z = int(radius * math.sin(math.radians(angle))) - 15

    game.set_block(Position(x, y + 1, z), materials['quartz'])

    if y % 5 == 0:
        print(f"Level {y}...")

print("Spiral staircase complete!")
`
  },
  {
    id: 'random',
    title: 'Random Blocks',
    code: `from codeblocks import Game, Position
import random

game = Game()
materials = game.materials

# Colorful materials
colors = ['brick', 'gold', 'diamond', 'emerald', 'lapis',
          'wool_red', 'wool_blue', 'wool_green', 'wool_yellow']

print("Placing 50 random blocks...")

for i in range(50):
    x = random.randint(-5, 5)
    y = random.randint(1, 10)
    z = random.randint(-20, -10)

    material_name = random.choice(colors)
    game.set_block(Position(x, y, z), materials[material_name])

print("Random art complete!")
`
  }
];
