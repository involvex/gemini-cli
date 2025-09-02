/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand, CommandContext } from './types.js';
import { CommandKind } from './types.js';
import { MessageType } from '../types.js';
import { execSync } from 'node:child_process';

export const updateCommand: SlashCommand = {
  name: 'update',
  description: 'Update Gemini CLI+ to the latest version',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext) => {
    const {
      ui: { addItem },
    } = context;

    addItem(
      {
        type: MessageType.INFO,
        text: '🔄 Checking for updates...',
      },
      Date.now(),
    );

    try {
      // Check if we're in a linked global installation
      const isGlobalLink = process.env['npm_config_global'] || process.argv[0].includes('node_modules/.bin');
      
      if (isGlobalLink) {
        // Update global link
        execSync('npm run update-global', { 
          stdio: 'pipe',
          cwd: process.cwd()
        });
        
        addItem(
          {
            type: MessageType.INFO,
            text: '✅ Global installation updated! Changes are immediately available.',
          },
          Date.now(),
        );
      } else {
        // Run the sync script for local development
        execSync('npm run sync-upstream', { 
          stdio: 'pipe',
          cwd: process.cwd()
        });

        addItem(
          {
            type: MessageType.INFO,
            text: '✅ Updated to latest version! Restart the CLI to use new features.',
          },
          Date.now(),
        );
      }

    } catch (error) {
      const err = error as Error;
      addItem(
        {
          type: MessageType.ERROR,
          text: `Update failed: ${err.message}. Try running 'npm run sync-upstream' manually.`,
        },
        Date.now(),
      );
    }
  },
};