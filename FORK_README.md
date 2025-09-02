# Gemini CLI Fork - Custom Features

This is a fork of [google/gemini-cli](https://github.com/google-gemini/gemini-cli) with additional custom features.

## Custom Features Added

### 1. CD Command (`/cd`)
- Navigate directories within the CLI session
- **Autocomplete support** for directory names (Tab completion)
- Cross-platform path handling
- Home directory shortcuts (`~`)
- Relative and absolute path support

**Usage:**
```bash
/cd                    # Go to home directory
/cd ~                  # Go to home directory (explicit)
/cd /path/to/dir      # Go to specific directory
/cd ../parent         # Go to relative directory
```

## Keeping Fork Updated

### Initial Setup

First, set up the fork for upstream syncing:

```bash
npm run setup-fork
```

### Automatic Sync Script

Use the provided sync script to update from upstream while preserving custom changes:

```bash
npm run sync-upstream
```

### Manual Sync Process

1. **Backup custom changes:**
   ```bash
   git stash push -m "Custom changes backup"
   ```

2. **Fetch and merge upstream:**
   ```bash
   git remote add upstream https://github.com/google-gemini/gemini-cli.git
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

3. **Restore custom changes:**
   ```bash
   git stash pop
   ```

4. **Resolve conflicts if any and commit:**
   ```bash
   git add .
   git commit -m "Merge upstream changes with custom features"
   ```

## Custom Files

The following files contain custom modifications:
- `packages/cli/src/ui/commands/cdCommand.ts` - CD command implementation
- `packages/cli/src/ui/commands/cdCommand.test.ts` - CD command tests
- `packages/cli/src/services/BuiltinCommandLoader.ts` - Added CD to built-in commands
- `scripts/sync-upstream.js` - Upstream sync script
- `FORK_README.md` - This documentation

## Development

### Building
```bash
npm run build
```

### Testing
```bash
npm test
```

### Testing CD Command Specifically
```bash
cd packages/cli && npm test -- cdCommand.test.ts
```

## Contributing Custom Features

1. Create feature branch: `git checkout -b feature/my-feature`
2. Implement changes
3. Add tests
4. Update `CUSTOM_FILES` array in `sync-upstream.js`
5. Update this README
6. Commit and push

## Upstream Compatibility

This fork is designed to stay compatible with the upstream repository. The sync script automatically preserves custom changes when updating from upstream.