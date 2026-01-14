# Claude Code Flash UI Skills

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Skills-purple.svg)](https://claude.ai/claude-code)

Custom skills for [Claude Code](https://claude.ai/claude-code) that integrate with Google AI Studio's Flash UI for automated UI code generation.

## Features

| Skill | Description |
|-------|-------------|
| `/flash-ui-codegen` | Generate UI code using Google AI Studio Flash UI |
| `/website-redesign` | Redesign any website while preserving exact text content |

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/mercierj/ccflashui/main/install.sh | bash
```

Or manually:

```bash
# Clone into skills directory
mkdir -p ~/.claude/skills
cd ~/.claude/skills
git clone https://github.com/mercierj/ccflashui.git temp
mv temp/flash-ui-codegen temp/website-redesign .
rm -rf temp

# Install dependencies
cd flash-ui-codegen && npm install && npx playwright install chromium
cd ../website-redesign && npm install
```

## Usage

In Claude Code CLI:

```bash
# Generate UI from a prompt
/flash-ui-codegen "Create a modern dashboard with dark theme and sidebar"

# Redesign an existing website
/website-redesign https://example.com
```

## How It Works

### Flash UI Codegen

1. Opens Chrome with Google AI Studio's Flash UI
2. Pastes your prompt automatically
3. You can iterate and refine using Flash UI's chat
4. Click "SEND TO CLAUDE" when satisfied
5. Code is extracted and returned to Claude Code

### Website Redesign

1. Fetches the target URL
2. Parses text content (headings, paragraphs, navigation, buttons)
3. Analyzes business context (sector, audience, conversion goals)
4. Builds a detailed prompt preserving exact text
5. Sends to Flash UI for modern redesign

## Requirements

- **Node.js** 18+
- **Claude Code** CLI installed
- **Google Account** for AI Studio access

## First Run

On first use, you'll be prompted to log into your Google account. Your session is saved locally in `~/.claude/flash-ui-chrome-profile/` so you only need to log in once.

## Troubleshooting

If you see dependency errors, the skills will show exactly what's missing:

```
❌ Dependencies not installed!

Run these commands:
  cd ~/.claude/skills/flash-ui-codegen
  npm install
  npx playwright install chromium
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) - feel free to use, modify, and distribute.

## Author

Created by [@mercierj](https://github.com/mercierj)
