import { Lesson } from '../types';

export const LESSONS: Lesson[] = [
  {
    id: 1,
    volume: 1,
    title: 'First Python Program',
    description: 'Print messages, comments, data types, and variables',
    instructions: `Let's look at some very basic Python statements!

**print() Function:**
- \`print()\` displays text on the screen
- Use quotes for text: \`print("Hello!")\`
- No quotes for numbers: \`print(28)\`

**Comments:**
- Start with # symbol
- Computer ignores them when running
- Use to explain your code

**Try it:**
1. Click "Run Code"
2. See the output in the console
3. Add your own print statement!`,
    code: `# Chapter 1: First Python Program
print('Hello, student!')
print()
print('Hello, Code Blocks!')

# Print a number
print(28)

# Try adding your own message:
`
  },
  {
    id: 2,
    volume: 1,
    title: 'Basic Data Types',
    description: 'Strings, integers, math, and variables',
    instructions: `Let's learn about the basic data types in Python!

**String:**
You've just learned how to call \`print()\` to display some text. The message inside the print() is a string:
\`\`\`
'Hello, Code Blocks!'
\`\`\`

String is one of the basic data types in Python. They can be enclosed in either single or double quotation marks.

**More string examples:**
- \`"I can write code"\` is a string in double quotes
- \`'Python is fun!'\` is a string in single quotes

**Integer:**
Another basic data type is the integer:
- \`8\` is an integer
- \`10588\` is another integer
- \`-75\` is a negative integer

There are no quotation marks around numbers. If you use quotation marks, then it becomes a string that contains digits.

**Simple Math:**
We all know that computers are good at math. Here is how we can use Python to calculate numbers:
\`\`\`
print(3 + 15)     # 18
print(10 - 2)     # 8
print(3 * 8)      # 24
print(25 / 5)     # 5
print((2 + 4) * (10 - 5))  # 30
\`\`\`

**Variables and Values:**
Computer can not only compute numbers, but also remember them. Variables work like containers that can hold values such as numbers, strings, and other types of data.

Simply put, a variable is a name that refers to a value.

**Assignment:**
You can create a new variable and assign any value to it like this:
\`\`\`
variable_name = value
\`\`\`

The variable is on the left of the equal sign. On the right is the value you want to assign to the variable, such as a number or a string.

Variable names can include letters, numbers, and underscores, such as \`y\`, \`a3\`, \`my_number\`, and \`_stuff\`. A variable name cannot start with a number. For example, \`1candy\` is not allowed.

**Try it:**
Run the code and experiment with different values!`,
    code: `# Chapter 2: Basic Data Types

# Strings - text in quotes
print("I can write code")
print('Python is fun!')
print()

# Integers - whole numbers without quotes
print(28)
print(10588)
print(-75)
print()

# Simple math
print(3 + 15)
print(10 - 2)
print(3 * 8)
print(25 / 5)
print((2 + 4) * (10 - 5))
print()

# Variables hold values
x = 10
print(x)

name = "Bob"
print(name)

# Try creating your own variables:
`
  },
  {
    id: 3,
    volume: 1,
    title: 'Code Blocks 3D Game',
    description: 'Set up Code Blocks and place your first block',
    instructions: `Now we're ready to build things in Code Blocks world!

**Setup Code (Always needed):**
\`\`\`
from codeblocks import Game, Position
game = Game()
materials = game.materials
\`\`\`

**Your First Block:**
Here's exactly how to place a block:
\`\`\`
# Step 1: Create a Position object with (x, y, z) coordinates
p = Position(0, 2, -10)

# Step 2: Place a block at that position
game.set_block(p, materials['brick'])
\`\`\`

The Position takes three numbers:
- **x**: 0 = center (left/right)
- **y**: 2 = above ground (up/down)
- **z**: -10 = away from you (forward/back)

**Try it:**
Run the code and see a brick block appear! Then try changing the numbers or material type.`,
    code: `# Chapter 3: Build blocks in Code Blocks
from codeblocks import Game, Position

game = Game()
materials = game.materials

# Print all available materials
print(materials)

# Place your first block!
p = Position(0, 2, -10)
game.set_block(p, materials['brick'])

print("Block placed at (0, 2, -10)")
`
  },
  {
    id: 4,
    volume: 1,
    title: '3D Coordinates',
    description: 'Understanding the Position system',
    instructions: `The Code Blocks world uses a 3D coordinate system:

**Axes:**
- **x-axis**: Horizontal left/right (positive = right)
- **y-axis**: Vertical up/down (y=0 is ground, y≥1 is above)
- **z-axis**: Horizontal forward/back (negative = away from you)

**Origin:** (0, 0, 0) is the center

**Example Positions:**
\`\`\`
p1 = Position(0, 1, -20)      # center, ground level, away
p_up = Position(0, 2, -20)    # one block higher
p_right = Position(3, 1, -20) # 3 blocks to the right
p_left = Position(-3, 1, -20) # 3 blocks to the left
\`\`\`

**Try it:**
Place blocks at different coordinates and observe!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Create various positions
p1 = Position(0, 1, -20)
p_up = Position(0, 2, -20)
p_right = Position(3, 1, -20)
p_left = Position(-3, 1, -20)
p_front = Position(0, 1, -18)
p_back = Position(0, 1, -22)

# Place blocks at these locations
game.set_block(p1, materials['brick'])
game.set_block(p_up, materials['brick'])
game.set_block(p_right, materials['gold'])
game.set_block(p_left, materials['diamond'])
game.set_block(p_front, materials['wool_red'])
game.set_block(p_back, materials['wool_blue'])

print("Blocks placed to show coordinate system!")
`
  },
  {
    id: 5,
    volume: 1,
    title: 'For Loop',
    description: 'Build horizontal rows with loops',
    instructions: `Loops let you repeat actions without writing the same code many times!

**For Loop Syntax:**
\`\`\`
for i in range(5):
    # code to repeat (indented)
\`\`\`

**What happens:**
- Repeats 5 times
- Variable \`i\` gets values: 0, 1, 2, 3, 4
- Must indent the code inside (4 spaces)

**Building with Loops:**
Use the loop variable for coordinates!

**Try it:**
Change range(5) to range(10) for a longer row!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Build a horizontal row (5 blocks)
for i in range(5):
    game.set_block(Position(i, 8, -20), materials['box_lime'])
    print(f"Placed block {i+1} at x={i}")

print("Horizontal row complete!")
`
  },
  {
    id: 6,
    volume: 1,
    title: 'Build Vertical Columns',
    description: 'Use loops with y-coordinate',
    instructions: `Just like horizontal rows, we can build vertical columns!

**Key Difference:**
- Horizontal row: Loop through **x** values
- Vertical column: Loop through **y** values

**Remember:**
- y = 0 is ground level
- Start at y = 1 to build above ground

**Try it:**
Build columns of different heights!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Build a vertical column (7 blocks tall)
for y in range(1, 8):
    game.set_block(Position(0, y, -20), materials['brick'])
    print(f"Placed block at height y={y}")

print("Column complete!")

# Try building more columns at different positions!
# Uncomment these lines:
# for y in range(1, 6):
#     game.set_block(Position(3, y, -20), materials['gold'])
`
  },
  {
    id: 7,
    volume: 1,
    title: 'Diagonals and Patterns',
    description: 'Change multiple coordinates in a loop',
    instructions: `Create diagonal lines by changing x AND y together!

**Face Diagonal:** Changes x and y
**Space Diagonal:** Changes x, y, and z

**Pattern Ideas:**
- Increment both x and y for diagonal
- Use \`i*2\` for spacing
- Try negative increments

**Challenge:**
Can you build a diagonal line going up and to the right?`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Build a face diagonal (x and y change together)
for i in range(6):
    game.set_block(Position(i, i+1, -20), materials['wool_purple'])

print("Face diagonal complete!")

# Space diagonal (x, y, z all change)
for i in range(6):
    game.set_block(Position(i+8, i+1, -20-i), materials['box_lime'])

print("Space diagonal complete!")
`
  },
  {
    id: 8,
    volume: 1,
    title: 'More About range()',
    description: 'Starting value, step size, and dotted lines',
    instructions: `The \`range()\` function has more options!

**range(start, stop):** Counts from start to stop-1
\`\`\`
for i in range(2, 7):  # gives: 2, 3, 4, 5, 6
\`\`\`

**range(start, stop, step):** Counts with custom step
\`\`\`
for i in range(0, 10, 2):  # gives: 0, 2, 4, 6, 8
\`\`\`

**Use Cases:**
- Step of 2: Create dotted lines (gaps between blocks)
- Step of 3: Even bigger gaps
- Negative step: Count backwards

**Try it:**
Experiment with different step values!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Solid line (step of 1, default)
for x in range(10):
    game.set_block(Position(x, 1, -15), materials['wool_white'])

# Dotted line (step of 2)
for x in range(0, 10, 2):
    game.set_block(Position(x, 3, -15), materials['wool_red'])

# Bigger gaps (step of 3)
for x in range(0, 15, 3):
    game.set_block(Position(x, 5, -15), materials['wool_blue'])

print("Different patterns created!")
`
  },
  {
    id: 9,
    volume: 1,
    title: 'Nested Loops - Wall',
    description: 'Build 2D structures with two loops',
    instructions: `Use nested loops to build walls and floors!

**Nested Loop Syntax:**
\`\`\`
for x in range(width):
    for y in range(height):
        # runs width × height times
\`\`\`

**Pattern:**
- Outer loop: Horizontal (x)
- Inner loop: Vertical (y)

**The Math:**
A 5×4 wall = 20 blocks total

**Try it:**
Build walls of different sizes!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Build a wall (width × height)
width = 8
height = 5

print(f"Building a {width}×{height} wall...")

for x in range(width):
    for y in range(1, height + 1):
        game.set_block(Position(x, y, -20), materials['brick'])

total_blocks = width * height
print(f"Wall complete! Used {total_blocks} blocks")
`
  },
  {
    id: 10,
    volume: 1,
    title: 'Nested Loops - Cube',
    description: 'Build 3D structures with three loops',
    instructions: `Create solid 3D cubes with THREE nested loops!

**Triple Nested Loops:**
\`\`\`
for x in range(size):
    for y in range(size):
        for z in range(size):
            # runs size³ times
\`\`\`

**The Math:**
A 5×5×5 cube = 125 blocks!

**Warning:**
Large cubes take time to build. Start small!

**Try it:**
Build cubes of different sizes and materials!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Build a solid cube
size = 4

print(f"Building a {size}×{size}×{size} cube...")

for x in range(size):
    for y in range(1, size + 1):
        for z in range(size):
            game.set_block(Position(x, y, z - 25), materials['diamond'])

total_blocks = size ** 3
print(f"Cube complete! Used {total_blocks} blocks")
`
  },
  {
    id: 11,
    volume: 1,
    title: 'Function Basics',
    description: 'Define and call functions',
    instructions: `Functions are reusable blocks of code!

**Define a Function:**
\`\`\`
def function_name(parameters):
    # code here
\`\`\`

**Call a Function:**
\`\`\`
function_name(value)
\`\`\`

**Why Functions?**
- Write once, use many times
- Make code organized and readable
- Easy to modify

**Try it:**
Define your own functions!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Define a function to build a tower
def build_tower(x, z, height, material):
    """Build a tower at position (x, z)"""
    for y in range(1, height + 1):
        game.set_block(Position(x, y, z), material)
    print(f"Tower at ({x}, {z}): {height} blocks tall")

# Call the function multiple times
build_tower(0, -20, 5, materials['brick'])
build_tower(3, -20, 8, materials['gold'])
build_tower(6, -20, 3, materials['diamond'])

print("Three towers built!")
`
  },
  {
    id: 12,
    volume: 1,
    title: 'Helper Functions in Code Blocks',
    description: 'block_m() and column_m() functions',
    instructions: `Let's create helper functions for common building tasks!

**block_m(x, y, z, m):** Place a single block
- Shorter than writing game.set_block every time
- m = material ID

**column_m(x, z, h, m):** Build a column
- h = height
- Builds from y=1 to y=h

**Benefits:**
- Cleaner, more readable code
- Less typing
- Easy to reuse

**Try it:**
Use these helpers to build quickly!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Define helper functions
def block_m(x, y, z, m):
    """Place a single block"""
    game.set_block(Position(x, y, z), m)

def column_m(x, z, h, m):
    """Build a column h blocks tall"""
    for y in range(1, h + 1):
        block_m(x, y, z, m)

# Use the helper functions
column_m(0, -20, 5, materials['brick'])
column_m(2, -20, 7, materials['gold'])
column_m(4, -20, 4, materials['diamond'])

# Place individual blocks on top
block_m(0, 6, -20, materials['wool_red'])
block_m(2, 8, -20, materials['wool_blue'])
block_m(4, 5, -20, materials['wool_green'])

print("Built columns using helper functions!")
`
  },
  {
    id: 13,
    volume: 2,
    title: 'Variables and Math',
    description: 'Store values and do calculations',
    instructions: `Variables store values. Do math with them!

**Variable Assignment:**
\`\`\`
x = 10
name = "Bob"
\`\`\`

**Math Operations:**
- Addition: \`3 + 5\`
- Subtraction: \`10 - 2\`
- Multiplication: \`4 * 7\`
- Division: \`20 / 4\`

**Use in Code Blocks:**
Calculate positions and dimensions!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Variables for building
tower_height = 6
tower_spacing = 3
num_towers = 4

print(f"Building {num_towers} towers...")

for i in range(num_towers):
    x_pos = i * tower_spacing

    for y in range(1, tower_height + 1):
        game.set_block(Position(x_pos, y, -20), materials['brick'])

    print(f"Tower {i+1} at x={x_pos}")

total_blocks = num_towers * tower_height
print(f"Total blocks used: {total_blocks}")
`
  },
  {
    id: 14,
    volume: 2,
    title: 'Strings',
    description: 'Text manipulation and f-strings',
    instructions: `Strings are sequences of characters.

**String Operations:**
- Concatenation: \`"Hello" + "World"\`
- Repetition: \`"Ha" * 3\` gives "HaHaHa"
- Length: \`len("Python")\` gives 6

**F-Strings:**
Embed variables in strings:
\`\`\`
name = "Alice"
print(f"Hello, {name}!")
\`\`\`

**Try it:**
Use strings to make informative messages!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# String manipulation
material_name = "diamond"
upper_name = material_name.upper()
length = len(material_name)

print(f"Building with: {upper_name}")
print(f"Material name has {length} letters")

# Build one block for each letter
for i in range(length):
    game.set_block(Position(i, 1, -20), materials[material_name])

# String repetition
message = "CodeCraft! " * 3
print(message)
`
  },
  {
    id: 15,
    volume: 2,
    title: 'Lists',
    description: 'Store multiple values in order',
    instructions: `Lists hold multiple items in order.

**Create a List:**
\`\`\`
colors = ['red', 'blue', 'green']
\`\`\`

**Access Items:**
- \`colors[0]\` gives first item
- \`colors[1]\` gives second item

**Loop Through:**
\`\`\`
for color in colors:
    print(color)
\`\`\`

**Perfect for building patterns!**`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# List of materials for rainbow
rainbow = ['wool_red', 'wool_orange', 'wool_yellow',
           'wool_green', 'wool_blue', 'wool_purple']

print(f"Building rainbow with {len(rainbow)} colors...")

# Build vertical rainbow
for i, color in enumerate(rainbow):
    for y in range(1, 4):
        game.set_block(Position(i * 2, y, -20), materials[color])
    print(f"Column {i+1}: {color}")

print("Rainbow complete!")
`
  },
  {
    id: 16,
    volume: 2,
    title: 'Dictionary - Materials',
    description: 'Key-value pairs and materials dictionary',
    instructions: `Dictionaries map keys to values!

**The materials dictionary:**
\`\`\`
materials['brick']    # gives ID for brick
materials['gold']     # gives ID for gold
\`\`\`

**Iterate Over Dictionary:**
\`\`\`
for name, id in materials.items():
    print(f"{name}: {id}")
\`\`\`

**Your Own Dictionary:**
\`\`\`
my_dict = {'key': 'value'}
\`\`\`

**Try it:**
Explore all available materials!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Create a custom dictionary
my_blocks = {
    'foundation': materials['stone'],
    'walls': materials['brick'],
    'roof': materials['planks_oak'],
    'decoration': materials['gold']
}

print("My building materials:")
for name, mat_id in my_blocks.items():
    print(f"  {name}: ID {mat_id}")

# Build with dictionary values
x = 0
for name, mat_id in my_blocks.items():
    game.set_block(Position(x, 1, -20), mat_id)
    x += 2

print("\\nBuilt blocks from dictionary!")
`
  },
  {
    id: 17,
    volume: 2,
    title: 'Conditionals',
    description: 'if/elif/else statements',
    instructions: `Make decisions with conditionals!

**if Statement:**
\`\`\`
if condition:
    # code runs if True
elif other_condition:
    # code runs if first is False
else:
    # code runs if all False
\`\`\`

**Comparison Operators:**
- \`==\` equal
- \`!=\` not equal
- \`<\` less than
- \`>\` greater than
- \`<=\` less than or equal
- \`>=\` greater than or equal`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

# Build different materials based on height
for x in range(10):
    # Choose material based on position
    if x < 3:
        material = materials['brick']
        color = "brick"
    elif x < 7:
        material = materials['gold']
        color = "gold"
    else:
        material = materials['diamond']
        color = "diamond"

    game.set_block(Position(x, 1, -20), material)
    print(f"Block {x+1}: {color}")

print("Conditional building complete!")
`
  },
  {
    id: 18,
    volume: 2,
    title: 'While Loop',
    description: 'Loop while condition is true',
    instructions: `While loops repeat as long as a condition is True.

**Syntax:**
\`\`\`
while condition:
    # code to repeat
    # MUST change condition eventually!
\`\`\`

**Warning:**
Make sure the loop can end, or it runs forever!

**Use Case:**
When you don't know how many times to loop ahead of time.`,
    code: `from codeblocks import Game, Position
import math

game = Game()
materials = game.materials

# Build a spiral using while loop
y = 1
angle = 0
radius = 3

print("Building spiral tower...")

while y <= 15:
    # Calculate spiral position
    x = int(radius * math.cos(math.radians(angle)))
    z = int(radius * math.sin(math.radians(angle))) - 20

    game.set_block(Position(x, y, z), materials['diamond'])

    y += 1
    angle += 30

    if y % 5 == 0:
        print(f"Height: {y}")

print("Spiral tower complete!")
`
  },
  {
    id: 19,
    volume: 2,
    title: 'Random Module',
    description: 'Generate random numbers',
    instructions: `The random module provides random numbers!

**Import:**
\`\`\`
import random
\`\`\`

**Functions:**
- \`random.randint(a, b)\`: Random integer from a to b
- \`random.choice(list)\`: Random item from list
- \`random.random()\`: Random float 0.0 to 1.0

**Use in Code Blocks:**
Create varied, unpredictable structures!`,
    code: `from codeblocks import Game, Position
import random

game = Game()
materials = game.materials

# Colorful materials list
colors = ['wool_red', 'wool_blue', 'wool_green',
          'wool_yellow', 'wool_orange', 'wool_purple']

print("Placing 30 random blocks...")

for i in range(30):
    x = random.randint(-5, 5)
    y = random.randint(1, 8)
    z = random.randint(-25, -15)

    color = random.choice(colors)

    game.set_block(Position(x, y, z), materials[color])

print("Random art complete!")
`
  },
  {
    id: 20,
    volume: 3,
    title: 'Build a House',
    description: 'Complex structure with multiple parts',
    instructions: `Combine everything you've learned to build a house!

**Components:**
- Foundation (floor)
- Walls (with door space)
- Windows (glass blocks)
- Roof

**Technique:**
Use conditionals to skip door/window positions!

**Try it:**
Customize the design!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

print("Building a house...")

# Foundation
for x in range(7):
    for z in range(-25, -18):
        game.set_block(Position(x, 0, z), materials['stone'])

# Walls (edges only, leave door space)
for x in range(7):
    for z in range(-25, -18):
        for y in range(1, 5):
            # Door at center front
            if x == 3 and z == -18 and y <= 2:
                continue
            # Only edges
            if x == 0 or x == 6 or z == -25 or z == -18:
                game.set_block(Position(x, y, z), materials['brick'])

# Windows
for y in [2, 3]:
    game.set_block(Position(0, y, -22), materials['glass'])
    game.set_block(Position(6, y, -22), materials['glass'])

# Flat roof
for x in range(7):
    for z in range(-25, -18):
        game.set_block(Position(x, 5, z), materials['planks_oak'])

print("House complete!")
`
  },
  {
    id: 21,
    volume: 3,
    title: 'Plant Trees',
    description: 'Build natural-looking trees',
    instructions: `Create trees with trunks and leafy tops!

**Tree Structure:**
- Trunk: Vertical column of wood
- Leaves: Sphere-ish shape of leaves on top

**Technique:**
Use math to create rounded leaf shape:
\`\`\`
if dx*dx + dy*dy + dz*dz <= radius*radius:
    # place leaf
\`\`\`

**Try it:**
Plant a forest!`,
    code: `from codeblocks import Game, Position

game = Game()
materials = game.materials

def plant_tree(x, z):
    """Plant a tree at position (x, z)"""
    # Trunk
    trunk_height = 5
    for y in range(1, trunk_height + 1):
        game.set_block(Position(x, y, z), materials['wood'])

    # Leaves (sphere shape)
    leaf_radius = 2
    for dx in range(-leaf_radius, leaf_radius + 1):
        for dy in range(leaf_radius):
            for dz in range(-leaf_radius, leaf_radius + 1):
                # Only place if within sphere
                if dx*dx + dy*dy + dz*dz <= leaf_radius * leaf_radius:
                    game.set_block(
                        Position(x + dx, trunk_height + dy, z + dz),
                        materials['leaves']
                    )

print("Planting forest...")
plant_tree(0, -20)
plant_tree(6, -20)
plant_tree(12, -20)
plant_tree(3, -26)
plant_tree(9, -26)

print("Forest complete!")
`
  }
];
