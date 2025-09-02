# Upload to involvex/gemini-cli Fork

## 1. Initialize Git Repository

```bash
cd d:\repos\geminifork\gemini-cli
git init
git add .
git commit -m "Initial commit: Gemini CLI+ with enhanced features"
```

## 2. Add Remote and Push

```bash
# Add your fork as origin
git remote add origin https://github.com/involvex/gemini-cli.git

# Push to your fork
git branch -M main
git push -u origin main
```

## 3. Global Installation

```bash
# Install globally from your fork
npm install -g git+https://github.com/involvex/gemini-cli.git

# Or install locally and link
npm install
npm link

# Now you can use anywhere:
gemini-cli+
# or
gemini
```

## 4. Features Ready

✅ **Enhanced Dashboard** (localhost:3333)
- API Key management with usage tracking
- Quick command buttons (/cd, /dashboard, /update, etc.)
- Custom slash command builder
- MCP server connections
- Persistent settings in ~/.gemini-cli-plus/

✅ **Auto API Key Switching**
- Load balancing across multiple keys
- Automatic quota limit detection
- Usage statistics and rotation

✅ **Global Binary Access**
- `gemini-cli+` command available anywhere
- Auto-launches dashboard on startup

✅ **Smart Fork Management**
- Syncs with latest upstream (preview > nightly > main)
- Preserves all custom features

## 5. Usage After Upload

```bash
# Install from your fork
npm install -g git+https://github.com/involvex/gemini-cli.git

# Start anywhere
gemini-cli+

# Dashboard auto-opens at http://localhost:3333
# Add API keys: /apikey add YOUR_KEY
# Use quick commands from dashboard
# Create custom commands
# Connect MCP servers
```

## 6. Repository Structure

```
involvex/gemini-cli/
├── packages/
│   ├── cli/           # Enhanced CLI with new commands
│   ├── dashboard/     # Web dashboard server
│   ├── core/          # Core functionality
│   └── ...
├── scripts/
│   ├── sync-upstream.js    # Smart upstream sync
│   └── setup-fork.js       # Fork setup
└── GEMINI_CLI_PLUS_README.md  # Full documentation
```

Ready to upload! 🚀