#!/bin/bash
set -e

echo "Installing Claude Code Flash UI Skills..."
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

# Create skills directory
SKILLS_DIR="$HOME/.claude/skills"
mkdir -p "$SKILLS_DIR"

# Clone or update repo
TEMP_DIR=$(mktemp -d)
echo "Downloading skills..."
git clone --quiet https://github.com/mercierj/ccflashui.git "$TEMP_DIR"

# Move skill folders
echo "Installing flash-ui-codegen..."
rm -rf "$SKILLS_DIR/flash-ui-codegen"
mv "$TEMP_DIR/flash-ui-codegen" "$SKILLS_DIR/"

echo "Installing website-redesign..."
rm -rf "$SKILLS_DIR/website-redesign"
mv "$TEMP_DIR/website-redesign" "$SKILLS_DIR/"

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
echo "Skills installed:"
echo "  - /flash-ui-codegen"
echo "  - /website-redesign"
echo ""
echo "Restart Claude Code to use the new skills."
echo ""
echo "On first run, you'll need to log into your"
echo "Google account for AI Studio access."
echo ""
