/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand, CommandContext } from './types.js';
import { CommandKind } from './types.js';
import { MessageType } from '../types.js';
import { ApiKeyManager } from '../../services/ApiKeyManager.js';

export const apiKeyCommand: SlashCommand = {
  name: 'apikey',
  description: 'Manage API keys for auto-switching',
  kind: CommandKind.BUILT_IN,
  subCommands: [
    {
      name: 'add',
      description: 'Add an API key',
      kind: CommandKind.BUILT_IN,
      action: async (context: CommandContext, args: string) => {
        const { ui: { addItem } } = context;
        const key = args.trim();
        
        if (!key) {
          addItem({
            type: MessageType.ERROR,
            text: 'Please provide an API key: /apikey add YOUR_KEY'
          }, Date.now());
          return;
        }
        
        const manager = new ApiKeyManager();
        manager.addApiKey(key);
        
        addItem({
          type: MessageType.INFO,
          text: `✅ API key added (ending in ...${key.slice(-8)})`
        }, Date.now());
      }
    },
    {
      name: 'status',
      description: 'Show API key usage status',
      kind: CommandKind.BUILT_IN,
      action: async (context: CommandContext) => {
        const { ui: { addItem } } = context;
        const manager = new ApiKeyManager();
        const stats = manager.getUsageStats();
        
        addItem({
          type: MessageType.INFO,
          text: `📊 API Key Status:
• Keys configured: ${stats.keys}
• Current key: ${stats.currentKey}
• Usage today: ${JSON.stringify(stats.usage, null, 2)}
• Last reset: ${stats.lastReset}`
        }, Date.now());
      }
    },
    {
      name: 'switch',
      description: 'Switch to next available API key',
      kind: CommandKind.BUILT_IN,
      action: async (context: CommandContext) => {
        const { ui: { addItem } } = context;
        const manager = new ApiKeyManager();
        const newKey = manager.switchToNextKey();
        
        if (newKey) {
          process.env['GEMINI_API_KEY'] = newKey;
          addItem({
            type: MessageType.INFO,
            text: `🔄 Switched to API key ending in ...${newKey.slice(-8)}`
          }, Date.now());
        } else {
          addItem({
            type: MessageType.ERROR,
            text: 'No API keys configured. Use /apikey add YOUR_KEY first.'
          }, Date.now());
        }
      }
    }
  ]
};