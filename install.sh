#!/bin/bash
set -e

echo "Installing Claude Code Flash UI Skills & Commands..."
echo ""

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required but not installed."
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18+ required. You have $(node -v)"
    exit 1
fi

# Create directories
SKILLS_DIR="$HOME/.claude/skills"
COMMANDS_DIR="$HOME/.claude/commands"
mkdir -p "$SKILLS_DIR"
mkdir -p "$COMMANDS_DIR"

# Clone or update repo
TEMP_DIR=$(mktemp -d)
echo "Downloading..."
git clone --quiet https://github.com/mercierj/ccflashui.git "$TEMP_DIR"

# Install skills (folders with scripts)
echo ""
echo "Installing skills (scripts)..."
rm -rf "$SKILLS_DIR/flash-ui-codegen"
mv "$TEMP_DIR/flash-ui-codegen" "$SKILLS_DIR/"
echo "  - ~/.claude/skills/flash-ui-codegen/"

rm -rf "$SKILLS_DIR/website-redesign"
mv "$TEMP_DIR/website-redesign" "$SKILLS_DIR/"
echo "  - ~/.claude/skills/website-redesign/"

# Install commands (slash commands)
echo ""
echo "Installing commands (slash commands)..."
cp "$TEMP_DIR/commands/flash-ui.md" "$COMMANDS_DIR/"
echo "  - ~/.claude/commands/flash-ui.md -> /flash-ui"

cp "$TEMP_DIR/commands/website-redesign.md" "$COMMANDS_DIR/"
echo "  - ~/.claude/commands/website-redesign.md -> /website-redesign"

# Cleanup
rm -rf "$TEMP_DIR"

# Install dependencies
echo ""
echo "Installing dependencies for flash-ui-codegen..."
cd "$SKILLS_DIR/flash-ui-codegen"
npm install --silent

echo "Installing Playwright Chromium browser..."
npx playwright install chromium

echo ""
echo "Installing dependencies for website-redesign..."
cd "$SKILLS_DIR/website-redesign"
npm install --silent

echo ""
echo "============================================"
echo "  Installation complete!"
echo "============================================"
echo ""
echo "Slash commands installed (type these in Claude Code):"
echo "  /flash-ui <prompt>      - Generate UI code"
echo "  /website-redesign <url> - Redesign a website"
echo ""
echo "Skills installed (scripts used by commands):"
echo "  ~/.claude/skills/flash-ui-codegen/"
echo "  ~/.claude/skills/website-redesign/"
echo ""
echo "Restart Claude Code to use the new commands."
echo ""
echo "On first run, you'll need to log into your"
echo "Google account for AI Studio access."
echo ""
