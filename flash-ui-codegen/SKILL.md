# Flash UI Code Generation Skill

Automated UI code generation using Google AI Studio Flash UI.

## Installation (for new users)

```bash
cd ~/.claude/skills/flash-ui-codegen
npm install
npx playwright install chromium
```

**First run:** You'll be prompted to log into your Google account. The session is saved in `~/.claude/flash-ui-chrome-profile/` so you only need to log in once.

## Usage

```bash
node ~/.claude/skills/flash-ui-codegen/flash-ui.js "PROMPT"
```

## Building the Prompt

### For REDESIGNING Existing Code

Include the actual component code so Flash UI understands structure:

```
REDESIGN this component with [design direction]:

CURRENT CODE:
\`\`\`tsx
[PASTE ACTUAL COMPONENT CODE]
\`\`\`

CONTEXT:
- What it does: [functionality]
- Key features to keep: [list]

DESIGN:
- [Style preferences]
- [Colors]
- [Animations]

Keep all functionality, improve visuals.
```

### For NEW Components

Be specific about layout:

```
CREATE [component name]:

LAYOUT:
- [Structure]
- [Elements]
- [Positions]

FUNCTIONALITY:
- [What it does]
- [Interactions]

STYLE:
- [Colors with hex]
- [Typography]
- [Animations]
```

## Workflow

1. **Read relevant code** if redesigning existing pages
2. **Build comprehensive prompt** with code + context
3. **Run script** - opens Chrome with Flash UI
4. **User validates** - can iterate with Flash UI chat
5. **Click "SEND TO CLAUDE"** when satisfied
6. **Extract and implement** - adapt code to project

## Output

Returns JSON:
```json
{
  "code": ["...code blocks..."],
  "files": ["file1.tsx", "file2.css"],
  "fullText": "full response"
}
```

Screenshot: `/tmp/flash-ui-result.png`
