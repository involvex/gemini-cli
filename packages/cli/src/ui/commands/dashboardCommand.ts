/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand, CommandContext } from './types.js';
import { CommandKind } from './types.js';
import { MessageType } from '../types.js';
import { spawn } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const dashboardCommand: SlashCommand = {
  name: 'dashboard',
  description: 'Start the Gemini CLI+ dashboard server',
  kind: CommandKind.BUILT_IN,
  action: async (context: CommandContext) => {
    const {
      ui: { addItem },
    } = context;

    try {
      const dashboardPath = join(__dirname, '../../../../../dashboard/src/server.js');
      
      addItem(
        {
          type: MessageType.INFO,
          text: 'Starting Gemini CLI+ Dashboard...',
        },
        Date.now(),
      );

      const child = spawn('node', [dashboardPath], {
        detached: true,
        stdio: 'ignore'
      });

      child.unref();

      addItem(
        {
          type: MessageType.INFO,
          text: '🚀 Dashboard started! Open http://localhost:3333 in your browser',
        },
        Date.now(),
      );

    } catch (error) {
      const err = error as Error;
      addItem(
        {
          type: MessageType.ERROR,
          text: `Failed to start dashboard: ${err.message}`,
        },
        Date.now(),
      );
    }
  },
};