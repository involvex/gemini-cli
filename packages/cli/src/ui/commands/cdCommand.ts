/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import type { SlashCommand, CommandContext } from './types.js';
import { CommandKind } from './types.js';
import { MessageType } from '../types.js';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

function expandPath(inputPath: string): string {
  if (!inputPath) return process.cwd();
  
  let expandedPath = inputPath;
  
  // Handle Windows %USERPROFILE%
  if (expandedPath.toLowerCase().startsWith('%userprofile%')) {
    expandedPath = os.homedir() + expandedPath.substring('%userprofile%'.length);
  }
  // Handle Unix-style ~
  else if (expandedPath === '~' || expandedPath.startsWith('~/')) {
    expandedPath = os.homedir() + expandedPath.substring(1);
  }
  
  // Resolve relative paths
  if (!path.isAbsolute(expandedPath)) {
    expandedPath = path.resolve(process.cwd(), expandedPath);
  }
  
  return path.normalize(expandedPath);
}

export const cdCommand: SlashCommand = {
  name: 'cd',
  description: 'Change the current working directory',
  kind: CommandKind.BUILT_IN,
  completion: async (context: CommandContext, partialArg: string) => {
    const { services: { config } } = context;
    if (!config) return [];

    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      
      let searchDir = process.cwd();
      let searchPattern = partialArg;
      
      // Handle paths with directory separators
      if (partialArg.includes('/') || partialArg.includes('\\')) {
        const lastSep = Math.max(partialArg.lastIndexOf('/'), partialArg.lastIndexOf('\\'));
        const dirPart = partialArg.substring(0, lastSep + 1);
        searchPattern = partialArg.substring(lastSep + 1);
        
        if (dirPart.startsWith('~')) {
          const os = await import('node:os');
          searchDir = path.resolve(os.homedir(), dirPart.substring(2));
        } else if (path.isAbsolute(dirPart)) {
          searchDir = dirPart;
        } else {
          searchDir = path.resolve(process.cwd(), dirPart);
        }
      }
      
      if (!fs.existsSync(searchDir)) return [];
      
      const entries = fs.readdirSync(searchDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory())
        .filter(entry => entry.name.toLowerCase().startsWith(searchPattern.toLowerCase()))
        .map(entry => {
          const basePath = partialArg.substring(0, partialArg.length - searchPattern.length);
          return basePath + entry.name;
        })
        .slice(0, 10); // Limit to 10 suggestions
      
      return entries;
    } catch {
      return [];
    }
  },
  action: async (context: CommandContext, args: string) => {
    const {
      ui: { addItem },
      services: { config },
    } = context;

    if (!config) {
      addItem(
        {
          type: MessageType.ERROR,
          text: 'Configuration is not available.',
        },
        Date.now(),
      );
      return;
    }

    const targetPath = args.trim() || os.homedir();
    const expandedPath = expandPath(targetPath);

    try {
      // Check if directory exists
      const stats = fs.statSync(expandedPath);
      if (!stats.isDirectory()) {
        addItem(
          {
            type: MessageType.ERROR,
            text: `'${expandedPath}' is not a directory.`,
          },
          Date.now(),
        );
        return;
      }

      // Change directory
      process.chdir(expandedPath);

      addItem(
        {
          type: MessageType.INFO,
          text: `Changed directory to: ${expandedPath}`,
        },
        Date.now(),
      );

    } catch (error) {
      const err = error as Error;
      addItem(
        {
          type: MessageType.ERROR,
          text: `Cannot change directory to '${expandedPath}': ${err.message}`,
        },
        Date.now(),
      );
    }
  },
};