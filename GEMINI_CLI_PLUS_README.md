# 🚀 Gemini CLI+ 

Enhanced fork of Google's Gemini CLI with additional features and a web dashboard.

## ✨ New Features

### 1. Enhanced CD Command (`/cd`)
- Directory navigation with **Tab autocomplete**
- Cross-platform path handling (`~`, `%USERPROFILE%`)
- Smart directory suggestions

### 2. Web Dashboard (`/dashboard`)
- **URL**: http://localhost:3333
- **Auto-launches** with CLI startup
- Real-time chat interface
- Settings management (model, temperature, tokens)
- Live logs monitoring
- WebSocket real-time updates

### 3. Auto-Update (`/update`)
- Automatically detects latest upstream branch (preview > nightly > main)
- Syncs with upstream while preserving custom features
- One-command update process

### 4. Smart API Key Management (`/apikey`)
- **Auto-switching** based on usage quotas
- Multiple API key support
- Usage tracking and balancing
- Automatic quota limit handling

### 5. Smart Fork Management
- Dynamic branch detection (preview-2, nightly, main)
- Automatic custom file preservation
- Seamless upstream integration

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup fork management
npm run setup-fork

# Global install
npm install -g .

# Start CLI (dashboard auto-launches)
gemini-cli+
# or
gemini

# Add API keys for auto-switching
/apikey add YOUR_API_KEY_1
/apikey add YOUR_API_KEY_2

# Update to latest
/update
```

## 🎯 Commands

| Command | Description |
|---------|-------------|
| `/cd <path>` | Navigate directories with autocomplete |
| `/dashboard` | Start web dashboard on localhost:3333 |
| `/apikey add <key>` | Add API key for auto-switching |
| `/apikey status` | Show API key usage statistics |
| `/apikey switch` | Manually switch to next API key |
| `/update` | Update to latest upstream version |

## 🔑 API Key Management

```bash
# Add multiple API keys
/apikey add YOUR_FIRST_KEY
/apikey add YOUR_SECOND_KEY

# Check usage
/apikey status

# Manual switch
/apikey switch
```

**Auto-switching triggers:**
- Every 10 requests (load balancing)
- On quota/rate limit errors (429 status)
- When current key hits 50+ requests and others have <10

## 🔧 Dashboard Features

- **Chat Interface**: Direct communication with Gemini
- **Model Settings**: Switch between Gemini models
- **Temperature Control**: Adjust response creativity
- **Token Limits**: Configure response length
- **Live Logs**: Monitor system activity
- **Real-time Updates**: WebSocket-powered interface

## 🔄 Keeping Updated

```bash
# Manual update
npm run sync-upstream

# Or use the CLI command
/update
```

## 🏗️ Architecture

- **CLI Package**: Enhanced with custom commands
- **Dashboard Package**: Express + WebSocket server
- **Core Package**: Shared functionality
- **Smart Sync**: Preserves customizations during updates

## 🎨 Customization

The fork automatically preserves:
- Custom commands
- Dashboard server
- Configuration files
- Documentation
- Package.json modifications

## 📦 Installation

```bash
git clone <your-fork-url>
cd gemini-cli
npm install
npm run setup-fork
npm start
```

Access dashboard at: **http://localhost:3333**