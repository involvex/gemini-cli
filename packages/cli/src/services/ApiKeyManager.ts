/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { homedir } from 'node:os';

interface ApiKeyConfig {
  keys: string[];
  currentIndex: number;
  usage: Record<string, number>;
  lastReset: string;
}

export class ApiKeyManager {
  private configPath: string;
  private config!: ApiKeyConfig;

  constructor() {
    this.configPath = join(homedir(), '.gemini-cli-plus', 'api-keys.json');
    this.loadConfig();
  }

  private loadConfig() {
    if (existsSync(this.configPath)) {
      try {
        this.config = JSON.parse(readFileSync(this.configPath, 'utf8'));
      } catch {
        this.config = this.getDefaultConfig();
      }
    } else {
      this.config = this.getDefaultConfig();
    }
    
    // Reset daily usage
    const today = new Date().toDateString();
    if (this.config.lastReset !== today) {
      this.config.usage = {};
      this.config.lastReset = today;
      this.saveConfig();
    }
  }

  private getDefaultConfig(): ApiKeyConfig {
    return {
      keys: [],
      currentIndex: 0,
      usage: {},
      lastReset: new Date().toDateString()
    };
  }

  private saveConfig() {
    try {
      const dir = join(homedir(), '.gemini-cli-plus');
      if (!existsSync(dir)) {
        require('fs').mkdirSync(dir, { recursive: true });
      }
      writeFileSync(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.warn('Failed to save API key config:', error);
    }
  }

  addApiKey(key: string) {
    if (!this.config.keys.includes(key)) {
      this.config.keys.push(key);
      this.saveConfig();
    }
  }

  getCurrentApiKey(): string | null {
    if (this.config.keys.length === 0) return null;
    return this.config.keys[this.config.currentIndex] || null;
  }

  recordUsage(key: string) {
    this.config.usage[key] = (this.config.usage[key] || 0) + 1;
    this.saveConfig();
  }

  switchToNextKey(): string | null {
    if (this.config.keys.length <= 1) return this.getCurrentApiKey();
    
    // Find key with lowest usage
    let bestIndex = 0;
    let lowestUsage = Infinity;
    
    for (let i = 0; i < this.config.keys.length; i++) {
      const key = this.config.keys[i];
      const usage = this.config.usage[key] || 0;
      if (usage < lowestUsage) {
        lowestUsage = usage;
        bestIndex = i;
      }
    }
    
    this.config.currentIndex = bestIndex;
    this.saveConfig();
    return this.getCurrentApiKey();
  }

  shouldSwitchKey(currentKey: string): boolean {
    const currentUsage = this.config.usage[currentKey] || 0;
    
    // Switch if current key has 50+ requests and there's a key with <10 requests
    if (currentUsage >= 50) {
      for (const key of this.config.keys) {
        if (key !== currentKey && (this.config.usage[key] || 0) < 10) {
          return true;
        }
      }
    }
    
    return false;
  }

  getUsageStats() {
    return {
      keys: this.config.keys.length,
      currentKey: this.getCurrentApiKey()?.slice(-8) + '...',
      usage: this.config.usage,
      lastReset: this.config.lastReset
    };
  }
}