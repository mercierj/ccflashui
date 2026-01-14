# Website Redesign Skill

Redesign any website with a modern look using Flash UI while preserving the EXACT original text content.

## Usage

```bash
node ~/.claude/skills/website-redesign/website-redesign.js "URL"
```

## Example

```bash
node ~/.claude/skills/website-redesign/website-redesign.js "https://example.com"
```

## What It Does

1. **Fetches the website** - Downloads the HTML content from the given URL
2. **Parses all text content** - Extracts:
   - Page title
   - Navigation links
   - Headings (h1-h6)
   - Paragraphs
   - List items
   - Button labels
3. **Builds a strict prompt** - Creates a prompt that:
   - INSISTS on using exact text word-for-word
   - Allows Flash UI to choose new colors and design
   - Requests modern Tailwind CSS + React TSX output
4. **Launches Flash UI** - Opens the flash-ui-codegen skill with the prompt
5. **User validates** - You can iterate with Flash UI chat
6. **Click "SEND TO CLAUDE"** - When satisfied with the design

## Output

- Prompt is saved to: `/tmp/website-redesign-prompt.txt`
- Flash UI screenshot: `/tmp/flash-ui-result.png`
- Returns JSON with generated code

## Key Features

- **Preserves exact text** - The prompt explicitly demands word-for-word text reproduction
- **Design freedom** - Flash UI chooses colors, typography, animations
- **Modern stack** - Tailwind CSS, React TSX, responsive design
- **Automatic parsing** - No manual content extraction needed

## Dependencies

- playwright
- node-fetch
- flash-ui-codegen skill (must be installed in `~/.claude/skills/flash-ui-codegen/`)

## Installation

```bash
# 1. Install flash-ui-codegen first (required dependency)
cd ~/.claude/skills/flash-ui-codegen
npm install
npx playwright install chromium

# 2. Install website-redesign
cd ~/.claude/skills/website-redesign
npm install
```

**First run:** You'll be prompted to log into your Google account for Flash UI access.
