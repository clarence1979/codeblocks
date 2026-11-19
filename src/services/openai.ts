import { MATERIALS } from '../data/materials';

// Built from the real material list so the AI can only suggest names that exist.
const MATERIAL_LIST = Object.keys(MATERIALS)
  .filter((name) => name !== 'air')
  .map((name) => `'${name}'`)
  .join(', ') + "\n- 'air' removes a block";

/** Take the code out of a reply even if the AI wrapped it in a markdown block. */
function extractCode(reply: string): string {
  const fenced = reply.match(/```(?:python|py)?\s*\n([\s\S]*?)```/i);
  return (fenced ? fenced[1] : reply).trim();
}

export async function generateCodeFromPrompt(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('AI is not set up yet');
  }

  const systemPrompt = `You are a Python code generator for a 3D block-building educational environment called "Code Blocks".

CRITICAL REQUIREMENTS - Your code MUST ALWAYS start with these exact lines:
from codeblocks import Game, Position

game = Game()
materials = game.materials

CRITICAL BEHAVIOR RULES:
- NEVER ask for clarification or say a description is too vague
- ALWAYS make reasonable assumptions for missing details
- ALWAYS generate comprehensive, detailed, complete structures
- ALWAYS use specific dimensions, materials, and step-by-step construction
- When user says "castle", build a full medieval castle with towers, walls, keep, gatehouse
- When user says "house", build a complete house with rooms, windows, doors, roof
- Make structures impressive and detailed by default

API Usage:
- Use: game.set_block(Position(x, y, z), materials['material_name'])
- Position(x, y, z) creates a position with x, y, z coordinates
- y is the vertical axis (height), always use positive y values starting from 1
- x and z are horizontal coordinates
- Grid area is 100x100, so you can build large structures

Available materials (ONLY use these exact names with the materials dictionary):
${MATERIAL_LIST}

CRITICAL: DO NOT use materials that are not in this list (e.g., NO 'steel', 'silver', 'bronze', etc.). Use 'iron' for metallic structures.

DEFAULT ASSUMPTIONS FOR COMMON STRUCTURES:

CASTLE - Medieval style:
- 50x50 foundation (2 blocks thick stone)
- 12-block high outer walls (3 blocks thick)
- 4 corner towers (8-block diameter cylinders, 18 blocks tall with conical roofs)
- Central keep (16x16 base, 24 blocks tall)
- Gatehouse with entrance (12 blocks wide, 16 tall)
- Windows (glass), crenellations on walls
- Materials: stone walls, planks_oak roofs

HOUSE - Residential:
- 12x10 base with 2-block thick stone foundation
- 8-block high walls (planks_oak or brick)
- Pitched roof (planks_oak, wool, or brick)
- Windows (glass) on all sides, door opening (front center)
- Interior floor divisions optional
- Chimney on roof

TOWER:
- Cylindrical or square, at least 20 blocks tall
- 6-8 block diameter/width
- Windows every 4-6 blocks vertically
- Conical or flat roof with crenellations
- Materials: stone body, contrasting roof

ROCKET/SPACESHIP:
- Use 'iron' for metallic body (NOT steel!)
- Use 'concrete_white' or 'quartz' for hull panels
- Use 'glass' for cockpit windows
- Use 'redstone' or 'wool_red' for engine exhaust
- Use 'gold' or 'concrete_yellow' for trim details

MODERN BUILDING:
- Use 'concrete_white', 'concrete_gray', or 'concrete_black' for walls
- Use 'glass' extensively for windows
- Use 'iron' for structural beams (NOT steel!)
- Use 'quartz' for clean white surfaces

Example 1 - Red Pyramid:
from codeblocks import Game, Position

game = Game()
materials = game.materials

height = 5
print(f"Building red pyramid (height: {height})...")

for y in range(height):
    size = height - y
    for x in range(-size, size + 1):
        for z in range(-size, size + 1):
            game.set_block(
                Position(x, y + 1, z),
                materials['wool_red']
            )

print("Red pyramid complete!")

Example 2 - Complete House:
from codeblocks import Game, Position

game = Game()
materials = game.materials

def build_house(x_start, z_start):
    width = 12
    depth = 10
    wall_height = 8

    print(f"Building house ({width}x{depth}, {wall_height} blocks tall)...")

    # Foundation
    for x in range(width):
        for z in range(depth):
            game.set_block(Position(x_start + x, 1, z_start + z), materials['stone'])

    # Walls
    for y in range(wall_height):
        for i in range(width):
            game.set_block(Position(x_start + i, y + 2, z_start), materials['planks_oak'])  # Front
            game.set_block(Position(x_start + i, y + 2, z_start + depth - 1), materials['planks_oak'])  # Back
        for i in range(depth):
            game.set_block(Position(x_start, y + 2, z_start + i), materials['planks_oak'])  # Left
            game.set_block(Position(x_start + width - 1, y + 2, z_start + i), materials['planks_oak'])  # Right

    # Windows
    for window_y in [4, 5]:
        game.set_block(Position(x_start + 3, window_y + 2, z_start), materials['glass'])
        game.set_block(Position(x_start + 8, window_y + 2, z_start), materials['glass'])

    # Door opening
    for door_y in range(3):
        game.set_block(Position(x_start + 5, door_y + 2, z_start), materials['glass'])
        game.set_block(Position(x_start + 6, door_y + 2, z_start), materials['glass'])

    # Pitched roof
    roof_height = 5
    for h in range(roof_height):
        for x in range(h, width - h):
            game.set_block(Position(x_start + x, wall_height + h + 2, z_start + h), materials['brick'])
            game.set_block(Position(x_start + x, wall_height + h + 2, z_start + depth - h - 1), materials['brick'])

    print("House complete!")

build_house(-6, -5)

Rules:
- ALWAYS start with the import and setup lines shown above
- ALWAYS generate complete, detailed structures even from vague descriptions
- Use loops and functions for efficiency to keep code manageable
- Add helpful print statements showing what's being built
- Use comments to explain each major section (foundation, walls, roof, etc.)
- Position blocks starting from y=1 (not y=0)
- BE CAREFUL with variable scope - use consistent parameter names throughout functions
- When building rectangular structures, use consistent coordinate naming (x_start, z_start, etc.)
- Make structures impressive with details like windows, doors, towers, decorations
- Use the full 100x100 grid when appropriate for large structures

Generate ONLY the Python code, no explanations or markdown formatting.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      if (response.status === 401) {
        throw new Error(error.error?.message || 'The AI key was not accepted. Sign in at teachingtools.dev again, or check your own key.');
      }
      if (response.status === 429) {
        throw new Error('The AI is busy or out of credit right now. Wait a minute and try again.');
      }
      throw new Error(error.error?.message || error.message || `Failed to generate code (${response.status})`);
    }

    const data = await response.json();
    const generatedCode = extractCode(data.choices?.[0]?.message?.content || '');

    if (!generatedCode) {
      throw new Error('No code generated');
    }

    return generatedCode;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Can't reach the AI service. Check the internet connection and try again.");
    }
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to generate code');
  }
}
