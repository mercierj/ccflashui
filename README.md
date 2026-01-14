# Claude Code Flash UI Skills

Custom skills for [Claude Code](https://claude.ai/claude-code) that integrate with Google AI Studio's Flash UI for automated UI code generation.

## Skills Included

### `/flash-ui-codegen`
Generate UI code using Google AI Studio Flash UI. Opens a browser, lets you interact with Flash UI, and extracts the generated code.

### `/website-redesign`
Redesign any website with a modern look. Fetches a website, extracts its text content, and generates a fresh design while preserving the exact original text.

## Installation

```bash
# 1. Clone this repo into your Claude skills directory
git clone git@github.com:mercierj/ccflashui.git ~/.claude/skills/ccflashui

# 2. Move skills to the correct location
mv ~/.claude/skills/ccflashui/* ~/.claude/skills/
rm -rf ~/.claude/skills/ccflashui

# 3. Install flash-ui-codegen dependencies
cd ~/.claude/skills/flash-ui-codegen
npm install
npx playwright install chromium

# 4. Install website-redesign dependencies
cd ~/.claude/skills/website-redesign
npm install
```

## Alternative Installation (Direct Clone)

```bash
# Clone directly into skills folder structure
cd ~/.claude/skills
git clone git@github.com:mercierj/ccflashui.git temp
mv temp/* .
rm -rf temp

# Install dependencies
cd flash-ui-codegen && npm install && npx playwright install chromium
cd ../website-redesign && npm install
```

## First Run

On first use, you'll be prompted to log into your Google account for AI Studio access. Your session is saved in `~/.claude/flash-ui-chrome-profile/` so you only need to log in once.

## Usage

In Claude Code:

```
/flash-ui-codegen "Create a modern dashboard with sidebar navigation"
```

```
/website-redesign https://example.com
```

## How It Works

1. **Flash UI Codegen**: Opens Chrome with Google AI Studio's Flash UI, pastes your prompt, waits for you to iterate and refine, then extracts the generated code when you click "SEND TO CLAUDE".

2. **Website Redesign**: Fetches the target URL, parses all text content (headings, paragraphs, navigation, buttons), analyzes the business context, builds a detailed prompt, and sends it to Flash UI for redesign.

## Requirements

- Node.js 18+
- Claude Code CLI
- Google account (for AI Studio access)

## License

MIT
