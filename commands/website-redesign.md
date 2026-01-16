# Website Redesign

Redesign any website with a modern look while preserving the exact original text content.

## Usage

```
/website-redesign <url>
```

## Example

```
/website-redesign https://example.com
```

## Instructions

### Step 1: Run the Redesign Script

```bash
node ~/.claude/skills/website-redesign/website-redesign.js "URL"
```

**What it does:**
1. Fetches the website HTML
2. Parses all text content (headings, paragraphs, navigation, buttons)
3. Builds a prompt that preserves exact text word-for-word
4. Opens Flash UI with the redesign prompt

### Step 2: Validate in Flash UI

1. Chrome opens with Flash UI
2. Review the generated design
3. **Iterate** using Flash UI's chat if needed
4. Click **"SEND TO CLAUDE"** when satisfied

### Step 3: Get the Code

Code is extracted and returned as JSON with:
- React TSX components
- Tailwind CSS styling
- Responsive design

## Key Features

- **Preserves exact text** - Word-for-word text reproduction
- **Design freedom** - Flash UI chooses colors, typography, animations
- **Modern stack** - Tailwind CSS, React TSX, responsive design
- **Automatic parsing** - No manual content extraction needed

## Output

- Prompt saved to: `/tmp/website-redesign-prompt.txt`
- Screenshot: `/tmp/flash-ui-result.png`
- Returns JSON with generated code

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dependencies missing | Run: `cd ~/.claude/skills/flash-ui-codegen && npm install && npx playwright install chromium` then `cd ~/.claude/skills/website-redesign && npm install` |
| Login required | Log in when prompted, press ENTER |
