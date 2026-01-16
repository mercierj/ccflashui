# Flash UI Code Generation

Generate UI code using Google AI Studio Flash UI.

## Usage

```
/flash-ui <prompt>
```

## Instructions

### Step 1: Build the Prompt

**For REDESIGNING existing code**, include the current code:

```
REDESIGN this component with [design direction]:

CURRENT CODE:
```[language]
[PASTE ACTUAL COMPONENT CODE]
```

CONTEXT:
- What it does: [functionality]
- Key features to keep: [list]

DESIGN:
- [Style preferences]
- [Colors]
- [Animations]

Keep all functionality, improve visuals.
```

**For NEW components**, be specific about layout:

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

### Step 2: Run Flash UI

```bash
node ~/.claude/skills/flash-ui-codegen/flash-ui.js "YOUR_PROMPT_HERE"
```

**What happens:**
1. Chrome opens with Flash UI
2. If login needed, you'll be prompted to press ENTER after logging in
3. Prompt is auto-filled and submitted
4. **You can iterate** using Flash UI's chat
5. Click **"SEND TO CLAUDE"** button when satisfied
6. Code is extracted and returned

### Step 3: Integrate the Code

After getting the generated code:
- Adapt to your project's conventions
- Place files in correct directories
- Run build commands if needed

## Output

Returns JSON:
```json
{
  "code": ["...code blocks..."],
  "files": ["file1.tsx", "file2.css"],
  "fullText": "full response"
}
```

Screenshot saved to: `/tmp/flash-ui-result.png`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Login required | Log in when prompted, press ENTER |
| Dependencies missing | Run: `cd ~/.claude/skills/flash-ui-codegen && npm install && npx playwright install chromium` |
