# Global Installation Guide

## Method 1: Direct Global Link (Recommended for Development)

```bash
# Clone the repository
git clone https://github.com/involvex/gemini-cli.git
cd gemini-cli

# Install dependencies
npm install

# Create global link (auto-updating)
npm run global-link
```

**Benefits:**
- ✅ Instant updates with `npm run update-global`
- ✅ Local development friendly
- ✅ Full control over updates

## Method 2: NPM Global Install

```bash
# Install directly from GitHub
npm install -g git+https://github.com/involvex/gemini-cli.git

# Or if published to NPM
npm install -g @google/gemini-cli-plus
```

## Usage After Installation

```bash
# Start Gemini CLI+ (dashboard auto-launches)
gemini-cli+

# Or use the original command
gemini

# Dashboard available at: http://localhost:3333
```

## Updating Your Installation

### Method 1 (Global Link):
```bash
# From anywhere
npm run update-global

# Or use the CLI command
gemini-cli+
/update
```

### Method 2 (NPM Global):
```bash
# Reinstall latest version
npm install -g git+https://github.com/involvex/gemini-cli.git
```

## Features Available Globally

- 🎯 **Enhanced Dashboard**: API keys, commands, MCP servers
- 🔄 **Auto-Updates**: `/update` command works globally
- 🔑 **API Key Management**: Multi-key rotation and balancing
- 📁 **Directory Navigation**: `/cd` with autocomplete
- 🛠️ **Custom Commands**: Build slash commands in dashboard
- 🔌 **MCP Integration**: Connect to MCP servers

## Troubleshooting

### Command Not Found
```bash
# Check if link exists
npm list -g --depth=0 | grep gemini

# Recreate link
cd /path/to/gemini-cli
npm run global-link
```

### Update Issues
```bash
# Force update
cd /path/to/gemini-cli
git pull origin main --force
npm run update-global
```

### Permission Issues (Linux/Mac)
```bash
# Use sudo if needed
sudo npm run global-link
```

## Verification

```bash
# Check installation
which gemini-cli+
gemini-cli+ --version

# Test dashboard
gemini-cli+
# Should auto-open http://localhost:3333
```

Ready to use Gemini CLI+ globally! 🚀