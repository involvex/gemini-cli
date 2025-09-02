import express from 'express';
import { WebSocketServer } from 'ws';
import cors from 'cors';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { homedir } from 'os';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3333;
const CONFIG_DIR = join(homedir(), '.gemini-cli-plus');
const SETTINGS_FILE = join(CONFIG_DIR, 'dashboard-settings.json');
const API_KEYS_FILE = join(CONFIG_DIR, 'api-keys.json');

app.use(cors());
app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

// Ensure config directory exists
if (!existsSync(CONFIG_DIR)) {
  mkdirSync(CONFIG_DIR, { recursive: true });
}

// Load settings from file
function loadSettings() {
  if (existsSync(SETTINGS_FILE)) {
    try {
      return JSON.parse(readFileSync(SETTINGS_FILE, 'utf8'));
    } catch {}
  }
  return {
    model: 'gemini-2.5-pro',
    temperature: 0.7,
    maxTokens: 1000,
    apiKeys: [],
    mcpServers: [],
    customCommands: []
  };
}

function saveSettings(settings) {
  try {
    writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

function loadApiKeys() {
  if (existsSync(API_KEYS_FILE)) {
    try {
      return JSON.parse(readFileSync(API_KEYS_FILE, 'utf8'));
    } catch {}
  }
  return { keys: [], currentIndex: 0, usage: {}, lastReset: new Date().toDateString() };
}

let chatHistory = [];
let settings = loadSettings();
let apiKeyConfig = loadApiKeys();
let logs = [];

// API Routes
app.get('/api/chat', (req, res) => {
  res.json(chatHistory);
});

app.post('/api/chat', (req, res) => {
  const message = {
    id: Date.now(),
    text: req.body.text,
    timestamp: new Date().toISOString(),
    type: 'user'
  };
  chatHistory.push(message);
  
  // Simulate AI response
  setTimeout(() => {
    const response = {
      id: Date.now() + 1,
      text: `Response to: ${req.body.text}`,
      timestamp: new Date().toISOString(),
      type: 'ai'
    };
    chatHistory.push(response);
    wss.clients.forEach(client => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'chat', data: response }));
      }
    });
  }, 1000);
  
  res.json(message);
});

app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  saveSettings(settings);
  logs.push({
    timestamp: new Date().toISOString(),
    message: `Settings updated: ${JSON.stringify(req.body)}`
  });
  res.json(settings);
});

// API Keys endpoints
app.get('/api/apikeys', (req, res) => {
  res.json({
    keys: apiKeyConfig.keys.map(key => ({ id: key.slice(-8), key: key.slice(0, 8) + '...' + key.slice(-8) })),
    currentIndex: apiKeyConfig.currentIndex,
    usage: apiKeyConfig.usage
  });
});

app.post('/api/apikeys', (req, res) => {
  const { key } = req.body;
  if (key && !apiKeyConfig.keys.includes(key)) {
    apiKeyConfig.keys.push(key);
    writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeyConfig, null, 2));
    logs.push({ timestamp: new Date().toISOString(), message: `API key added: ...${key.slice(-8)}` });
  }
  res.json({ success: true });
});

app.delete('/api/apikeys/:index', (req, res) => {
  const index = parseInt(req.params.index);
  if (index >= 0 && index < apiKeyConfig.keys.length) {
    const removed = apiKeyConfig.keys.splice(index, 1)[0];
    if (apiKeyConfig.currentIndex >= index) apiKeyConfig.currentIndex = Math.max(0, apiKeyConfig.currentIndex - 1);
    writeFileSync(API_KEYS_FILE, JSON.stringify(apiKeyConfig, null, 2));
    logs.push({ timestamp: new Date().toISOString(), message: `API key removed: ...${removed.slice(-8)}` });
  }
  res.json({ success: true });
});

// Slash commands endpoint
app.post('/api/command', (req, res) => {
  const { command } = req.body;
  logs.push({ timestamp: new Date().toISOString(), message: `Command executed: ${command}` });
  
  // Simulate command execution
  const response = {
    success: true,
    output: `Executed: ${command}`,
    timestamp: new Date().toISOString()
  };
  
  res.json(response);
});

// MCP Servers endpoint
app.get('/api/mcp', (req, res) => {
  res.json(settings.mcpServers || []);
});

app.post('/api/mcp', (req, res) => {
  const { name, url, description } = req.body;
  if (!settings.mcpServers) settings.mcpServers = [];
  settings.mcpServers.push({ name, url, description, connected: false });
  saveSettings(settings);
  logs.push({ timestamp: new Date().toISOString(), message: `MCP server added: ${name}` });
  res.json({ success: true });
});

// Custom commands endpoint
app.get('/api/commands', (req, res) => {
  res.json(settings.customCommands || []);
});

app.post('/api/commands', (req, res) => {
  const { name, description, action } = req.body;
  if (!settings.customCommands) settings.customCommands = [];
  settings.customCommands.push({ name, description, action });
  saveSettings(settings);
  logs.push({ timestamp: new Date().toISOString(), message: `Custom command added: /${name}` });
  res.json({ success: true });
});

app.get('/api/logs', (req, res) => {
  res.json(logs);
});

app.get('/', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
    <title>Gemini CLI+ Dashboard</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #1a1a1a; color: #fff; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .tabs { display: flex; gap: 10px; margin-bottom: 20px; }
        .tab { padding: 10px 20px; background: #333; border: none; color: #fff; cursor: pointer; border-radius: 5px; }
        .tab.active { background: #007acc; }
        .panel { display: none; background: #2a2a2a; padding: 20px; border-radius: 10px; }
        .panel.active { display: block; }
        .chat-container { height: 400px; overflow-y: auto; border: 1px solid #444; padding: 10px; margin-bottom: 10px; }
        .message { margin-bottom: 10px; padding: 8px; border-radius: 5px; }
        .user { background: #007acc; text-align: right; }
        .ai { background: #333; }
        .input-group { display: flex; gap: 10px; }
        input, select, button { padding: 10px; border: 1px solid #444; background: #333; color: #fff; border-radius: 5px; }
        button { background: #007acc; cursor: pointer; }
        button:hover { background: #005a9e; }
        .settings-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 10px; align-items: center; }
        .logs { height: 300px; overflow-y: auto; background: #1a1a1a; padding: 10px; font-family: monospace; font-size: 12px; }
        .command-buttons { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 20px; }
        .command-buttons button { padding: 8px; font-size: 12px; }
        .api-key-item { display: flex; justify-content: space-between; align-items: center; padding: 8px; background: #333; margin: 5px 0; border-radius: 5px; }
        .api-stats { margin-top: 15px; padding: 10px; background: #333; border-radius: 5px; font-family: monospace; font-size: 12px; }
        .mcp-server { display: flex; justify-content: space-between; align-items: center; padding: 10px; background: #333; margin: 5px 0; border-radius: 5px; }
        .status-dot { width: 10px; height: 10px; border-radius: 50%; margin-right: 10px; }
        .connected { background: #4CAF50; }
        .disconnected { background: #f44336; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Gemini CLI+ Dashboard</h1>
            <p>Manage your AI assistant</p>
        </div>
        
        <div class="tabs">
            <button class="tab active" onclick="showTab('chat')">Chat</button>
            <button class="tab" onclick="showTab('commands')">Commands</button>
            <button class="tab" onclick="showTab('settings')">Settings</button>
            <button class="tab" onclick="showTab('apikeys')">API Keys</button>
            <button class="tab" onclick="showTab('mcp')">MCP Servers</button>
            <button class="tab" onclick="showTab('logs')">Logs</button>
        </div>
        
        <div id="chat" class="panel active">
            <div id="chatContainer" class="chat-container"></div>
            <div class="input-group">
                <input type="text" id="messageInput" placeholder="Type your message..." style="flex: 1;">
                <button onclick="sendMessage()">Send</button>
            </div>
        </div>
        
        <div id="commands" class="panel">
            <h3>Quick Commands</h3>
            <div class="command-buttons">
                <button onclick="executeCommand('/cd ~')">📁 /cd ~</button>
                <button onclick="executeCommand('/dashboard')">🚀 /dashboard</button>
                <button onclick="executeCommand('/update')">🔄 /update</button>
                <button onclick="executeCommand('/apikey status')">🔑 /apikey status</button>
                <button onclick="executeCommand('/help')">❓ /help</button>
            </div>
            
            <h3>Custom Commands</h3>
            <div id="customCommands"></div>
            
            <h3>Create Custom Command</h3>
            <div class="input-group">
                <input type="text" id="cmdName" placeholder="Command name">
                <input type="text" id="cmdDesc" placeholder="Description">
                <input type="text" id="cmdAction" placeholder="Action" style="flex: 2;">
                <button onclick="createCommand()">Create</button>
            </div>
        </div>
        
        <div id="settings" class="panel">
            <div class="settings-grid">
                <label>Model:</label>
                <select id="modelSelect">
                    <option value="gemini-2.5-pro">Gemini 2.5 Pro</option>
                    <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                </select>
                
                <label>Temperature:</label>
                <input type="range" id="temperatureSlider" min="0" max="1" step="0.1" value="0.7">
                
                <label>Max Tokens:</label>
                <input type="number" id="maxTokensInput" value="1000">
                
                <div></div>
                <button onclick="saveSettings()">Save Settings</button>
            </div>
        </div>
        
        <div id="apikeys" class="panel">
            <h3>API Key Management</h3>
            <div id="apiKeysList"></div>
            
            <h3>Add New API Key</h3>
            <div class="input-group">
                <input type="password" id="newApiKey" placeholder="Enter API key" style="flex: 1;">
                <button onclick="addApiKey()">Add Key</button>
            </div>
            
            <div class="api-stats" id="apiStats"></div>
        </div>
        
        <div id="mcp" class="panel">
            <h3>MCP Servers</h3>
            <div id="mcpServersList"></div>
            
            <h3>Add MCP Server</h3>
            <div class="input-group">
                <input type="text" id="mcpName" placeholder="Server name">
                <input type="text" id="mcpUrl" placeholder="Server URL" style="flex: 2;">
                <input type="text" id="mcpDesc" placeholder="Description">
                <button onclick="addMcpServer()">Add Server</button>
            </div>
        </div>
        
        <div id="logs" class="panel">
            <div id="logsContainer" class="logs"></div>
            <button onclick="clearLogs()">Clear Logs</button>
        </div>
    </div>

    <script>
        const ws = new WebSocket('ws://localhost:3333');
        
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'chat') {
                addMessage(data.data);
            }
        };
        
        function showTab(tabName) {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
            event.target.classList.add('active');
            document.getElementById(tabName).classList.add('active');
            
            if (tabName === 'logs') loadLogs();
            if (tabName === 'settings') loadSettings();
            if (tabName === 'apikeys') loadApiKeys();
            if (tabName === 'mcp') loadMcpServers();
            if (tabName === 'commands') loadCustomCommands();
        }
        
        function addMessage(message) {
            const container = document.getElementById('chatContainer');
            const div = document.createElement('div');
            div.className = 'message ' + message.type;
            div.textContent = message.text;
            container.appendChild(div);
            container.scrollTop = container.scrollHeight;
        }
        
        function sendMessage() {
            const input = document.getElementById('messageInput');
            const text = input.value.trim();
            if (!text) return;
            
            fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            }).then(r => r.json()).then(addMessage);
            
            input.value = '';
        }
        
        function loadSettings() {
            fetch('/api/settings').then(r => r.json()).then(settings => {
                document.getElementById('modelSelect').value = settings.model;
                document.getElementById('temperatureSlider').value = settings.temperature;
                document.getElementById('maxTokensInput').value = settings.maxTokens;
            });
        }
        
        function saveSettings() {
            const settings = {
                model: document.getElementById('modelSelect').value,
                temperature: parseFloat(document.getElementById('temperatureSlider').value),
                maxTokens: parseInt(document.getElementById('maxTokensInput').value)
            };
            
            fetch('/api/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            
            alert('Settings saved!');
        }
        
        function loadLogs() {
            fetch('/api/logs').then(r => r.json()).then(logs => {
                const container = document.getElementById('logsContainer');
                container.innerHTML = logs.map(log => 
                    '[' + log.timestamp + '] ' + log.message
                ).join('\\n');
            });
        }
        
        function clearLogs() {
            document.getElementById('logsContainer').innerHTML = '';
        }
        
        function executeCommand(cmd) {
            fetch('/api/command', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ command: cmd })
            }).then(r => r.json()).then(result => {
                addMessage({ text: 'Executed: ' + cmd, type: 'user', timestamp: new Date().toISOString() });
                addMessage({ text: result.output, type: 'ai', timestamp: result.timestamp });
            });
        }
        
        function loadApiKeys() {
            fetch('/api/apikeys').then(r => r.json()).then(data => {
                const container = document.getElementById('apiKeysList');
                container.innerHTML = data.keys.map((key, i) => 
                    '<div class="api-key-item"><span>' + key.key + '</span><button onclick="removeApiKey(' + i + ')">Remove</button></div>'
                ).join('');
                
                document.getElementById('apiStats').innerHTML = 
                    '<strong>Usage Statistics:</strong><br>' + JSON.stringify(data.usage, null, 2);
            });
        }
        
        function addApiKey() {
            const key = document.getElementById('newApiKey').value.trim();
            if (!key) return;
            
            fetch('/api/apikeys', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            }).then(() => {
                document.getElementById('newApiKey').value = '';
                loadApiKeys();
            });
        }
        
        function removeApiKey(index) {
            fetch('/api/apikeys/' + index, { method: 'DELETE' })
                .then(() => loadApiKeys());
        }
        
        function loadMcpServers() {
            fetch('/api/mcp').then(r => r.json()).then(servers => {
                const container = document.getElementById('mcpServersList');
                container.innerHTML = servers.map(server => 
                    '<div class="mcp-server"><div><span class="status-dot ' + (server.connected ? 'connected' : 'disconnected') + '"></span><strong>' + server.name + '</strong> - ' + server.description + '</div><div>' + server.url + '</div></div>'
                ).join('');
            });
        }
        
        function addMcpServer() {
            const name = document.getElementById('mcpName').value.trim();
            const url = document.getElementById('mcpUrl').value.trim();
            const description = document.getElementById('mcpDesc').value.trim();
            
            if (!name || !url) return;
            
            fetch('/api/mcp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, url, description })
            }).then(() => {
                document.getElementById('mcpName').value = '';
                document.getElementById('mcpUrl').value = '';
                document.getElementById('mcpDesc').value = '';
                loadMcpServers();
            });
        }
        
        function loadCustomCommands() {
            fetch('/api/commands').then(r => r.json()).then(commands => {
                const container = document.getElementById('customCommands');
                container.innerHTML = commands.map(cmd => 
                    '<button onclick="executeCommand(\\'/\\' + cmd.name + \\')\\" title="' + cmd.description + '">/' + cmd.name + '</button>'
                ).join('');
            });
        }
        
        function createCommand() {
            const name = document.getElementById('cmdName').value.trim();
            const description = document.getElementById('cmdDesc').value.trim();
            const action = document.getElementById('cmdAction').value.trim();
            
            if (!name || !action) return;
            
            fetch('/api/commands', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, description, action })
            }).then(() => {
                document.getElementById('cmdName').value = '';
                document.getElementById('cmdDesc').value = '';
                document.getElementById('cmdAction').value = '';
                loadCustomCommands();
            });
        }
        
        document.getElementById('messageInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
        
        // Load initial data
        fetch('/api/chat').then(r => r.json()).then(messages => {
            messages.forEach(addMessage);
        });
    </script>
</body>
</html>`;
  
  res.send(html);
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Gemini CLI+ Dashboard running on http://localhost:${PORT}`);
});

const wss = new WebSocketServer({ server });
wss.on('connection', (ws) => {
  console.log('Dashboard client connected');
  ws.on('close', () => console.log('Dashboard client disconnected'));
});