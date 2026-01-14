# Contributing

Thanks for your interest in contributing to Claude Code Flash UI Skills!

## How to Contribute

### Reporting Bugs

1. Check if the issue already exists in [GitHub Issues](https://github.com/mercierj/ccflashui/issues)
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Expected vs actual behavior
   - Your environment (OS, Node version, Claude Code version)

### Suggesting Features

Open an issue with the `enhancement` label describing:
- The use case
- Proposed solution
- Any alternatives you've considered

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test locally:
   ```bash
   cd ~/.claude/skills/flash-ui-codegen && npm install
   cd ~/.claude/skills/website-redesign && npm install
   ```
5. Commit with a clear message
6. Push to your fork
7. Open a Pull Request

## Code Style

- Use clear, descriptive variable names
- Add comments for non-obvious logic
- Keep functions focused and small
- Handle errors gracefully with helpful messages

## Testing

Before submitting:
1. Ensure `npm install` completes without errors
2. Test the skill with Claude Code
3. Verify dependency checks work (try running without node_modules)

## Questions?

Open an issue or start a discussion. We're happy to help!
