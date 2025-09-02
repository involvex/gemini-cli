# CD Command for Gemini CLI

I've successfully implemented a `cd` command for gemini-cli that allows users to change directories within the CLI session.

## Features

- **Basic directory navigation**: `/cd <path>` changes to the specified directory
- **Home directory shortcut**: `/cd` or `/cd ~` changes to the user's home directory  
- **Relative paths**: `/cd ../parent` works with relative paths
- **Path expansion**: Supports `~` for home directory and `%USERPROFILE%` on Windows
- **Error handling**: Shows helpful error messages for invalid paths or non-directories
- **Cross-platform**: Works on Windows, macOS, and Linux

## Usage Examples

```bash
# Change to home directory
/cd

# Change to home directory (explicit)
/cd ~

# Change to a specific directory
/cd /path/to/directory

# Change to relative directory
/cd ../parent-folder

# Change to subdirectory
/cd subfolder
```

## Implementation Details

### Files Created/Modified:

1. **`packages/cli/src/ui/commands/cdCommand.ts`** - Main command implementation
2. **`packages/cli/src/ui/commands/cdCommand.test.ts`** - Unit tests
3. **`packages/cli/src/services/BuiltinCommandLoader.ts`** - Added cd command to built-in commands

### Key Features:

- **Path Expansion**: Handles `~`, `%USERPROFILE%`, and relative paths
- **Validation**: Checks if target exists and is a directory
- **Error Handling**: Provides clear error messages for common issues
- **Integration**: Properly integrated with gemini-cli's command system

### Error Handling:

- Configuration not available
- Directory doesn't exist
- Target is not a directory
- Permission errors

The command is now fully integrated into gemini-cli and ready to use!