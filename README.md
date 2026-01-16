# Claude Code Flash UI

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Claude Code](https://img.shields.io/badge/Claude%20Code-Commands-purple.svg)](https://claude.ai/claude-code)

Slash commands for [Claude Code](https://claude.ai/claude-code) that integrate with Google AI Studio's Flash UI for automated UI code generation.

## Commands

| Command | Description |
|---------|-------------|
| `/flash-ui <prompt>` | Generate UI code using Google AI Studio Flash UI |
| `/website-redesign <url>` | Redesign any website while preserving exact text content |

## Quick Install

```bash
curl -fsSL https://raw.githubusercontent.com/mercierj/ccflashui/main/install.sh | bash
```

Or manually:

```bash
# Clone the repo
git clone https://github.com/mercierj/ccflashui.git
cd ccflashui

# Install skills (scripts)
mkdir -p ~/.claude/skills
cp -r flash-ui-codegen ~/.claude/skills/
cp -r website-redesign ~/.claude/skills/

# Install commands (slash commands)
mkdir -p ~/.claude/commands
cp commands/flash-ui.md ~/.claude/commands/
cp commands/website-redesign.md ~/.claude/commands/

# Install dependencies
cd ~/.claude/skills/flash-ui-codegen && npm install && npx playwright install chromium
cd ~/.claude/skills/website-redesign && npm install
```

## Usage

In Claude Code CLI:

```bash
# Generate UI from a prompt
/flash-ui "Create a modern dashboard with dark theme and sidebar"

# Redesign an existing website
/website-redesign https://example.com
```

## How It Works

### Flash UI

1. Opens Chrome with Google AI Studio's Flash UI
2. Pastes your prompt automatically
3. You can iterate and refine using Flash UI's chat
4. Click "SEND TO CLAUDE" when satisfied
5. Code is extracted and returned to Claude Code

### Website Redesign

1. Fetches the target URL
2. Parses text content (headings, paragraphs, navigation, buttons)
3. Builds a detailed prompt preserving exact text
4. Sends to Flash UI for modern redesign

## Project Structure

```
ccflashui/
├── commands/                    # Slash commands (user-invoked)
│   ├── flash-ui.md             # /flash-ui command
│   └── website-redesign.md     # /website-redesign command
├── flash-ui-codegen/           # Skill with scripts
│   ├── SKILL.md
│   ├── flash-ui.js
│   └── package.json
├── website-redesign/           # Skill with scripts
│   ├── SKILL.md
│   ├── website-redesign.js
│   └── package.json
├── install.sh
└── README.md
```

### Commands vs Skills

| | Commands | Skills |
|---|----------|--------|
| **Location** | `~/.claude/commands/` | `~/.claude/skills/` |
| **Format** | Single `.md` file | Folder with `SKILL.md` + scripts |
| **Invocation** | User types `/command` | Scripts called by commands |
| **Autocomplete** | Yes | No |

**Commands** are what you type (e.g., `/flash-ui`). **Skills** contain the actual scripts that commands use.

## Requirements

- **Node.js** 18+
- **Claude Code** CLI installed
- **Google Account** for AI Studio access

## First Run

On first use, you'll be prompted to log into your Google account. Your session is saved locally in `~/.claude/flash-ui-chrome-profile/` so you only need to log in once.

## Troubleshooting

If you see dependency errors:

```bash
cd ~/.claude/skills/flash-ui-codegen
npm install
npx playwright install chromium

cd ~/.claude/skills/website-redesign
npm install
```

## Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

[MIT](LICENSE) - feel free to use, modify, and distribute.

## Author

Created by [@mercierj](https://github.com/mercierj)
