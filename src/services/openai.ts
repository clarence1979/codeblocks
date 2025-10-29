export async function generateCodeFromPrompt(prompt: string, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const systemPrompt = `You are a Python code generator for a 3D block-building educational environment called "Code Blocks".

CRITICAL REQUIREMENTS - Your code MUST ALWAYS start with these exact lines:
from codeblocks import Game, Position

game = Game()
materials = game.materials

After these lines, you can write the rest of your code.

API Usage:
- Use: game.set_block(Position(x, y, z), materials['material_name'])
- Position(x, y, z) creates a position with x, y, z coordinates
- y is the vertical axis (height), always use positive y values starting from 1
- x and z are horizontal coordinates

Available materials (use the string names with materials dictionary):
- 'stone', 'dirt', 'grass', 'planks_oak', 'glass', 'brick', 'gold', 'diamond', 'emerald'
- 'sand', 'gravel', 'clay', 'wool_white', 'wool_black', 'wool_red', 'wool_orange'
- 'wool_yellow', 'wool_green', 'wool_blue', 'wool_purple', 'quartz', 'lapis', 'coal'

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

Example 2 - Castle with Walls:
from codeblocks import Game, Position

game = Game()
materials = game.materials

def build_castle(x_start, z_start, height, width):
    print(f"Building castle (height: {height}, width: {width})...")

    # Build walls
    for y in range(height):
        for i in range(width):
            # Front and back walls
            game.set_block(Position(x_start + i, y + 1, z_start), materials['stone'])
            game.set_block(Position(x_start + i, y + 1, z_start + width - 1), materials['stone'])
            # Left and right walls
            game.set_block(Position(x_start, y + 1, z_start + i), materials['stone'])
            game.set_block(Position(x_start + width - 1, y + 1, z_start + i), materials['stone'])

    # Build roof
    for x in range(width):
        for z in range(width):
            game.set_block(Position(x_start + x, height + 1, z_start + z), materials['planks_oak'])

    print("Castle complete!")

build_castle(-5, -5, 5, 10)

Rules:
- ALWAYS start with the import and setup lines shown above
- Use loops and functions for efficiency
- Keep code simple and educational
- Add helpful print statements
- Use comments to explain logic
- Position blocks starting from y=1 (not y=0)
- BE CAREFUL with variable scope - use consistent parameter names throughout functions
- When building rectangular structures, use consistent coordinate naming (x_start, z_start, etc.)

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
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to generate code');
    }

    const data = await response.json();
    const generatedCode = data.choices[0]?.message?.content?.trim();

    if (!generatedCode) {
      throw new Error('No code generated');
    }

    return generatedCode;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw new Error('Failed to generate code');
  }
}

export async function transcribeSpeech(audioBlob: Blob, apiKey: string): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API key is required');
  }

  const formData = new FormData();
  formData.append('file', audioBlob, 'audio.webm');
  formData.append('model', 'whisper-1');

  try {
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || 'Failed to transcribe audio');
    }

    const data = await response.json();
    return data.text;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`OpenAI API Error: ${error.message}`);
    }
    throw new Error('Failed to transcribe audio');
  }
}
