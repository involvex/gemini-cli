/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiKeyManager } from './ApiKeyManager.js';

export class AutoApiKeySwitch {
  private manager: ApiKeyManager;
  private requestCount = 0;

  constructor() {
    this.manager = new ApiKeyManager();
    this.initializeCurrentKey();
  }

  private initializeCurrentKey() {
    const currentKey = this.manager.getCurrentApiKey();
    if (currentKey && !process.env['GEMINI_API_KEY']) {
      process.env['GEMINI_API_KEY'] = currentKey;
    }
  }

  onRequestStart() {
    this.requestCount++;
    const currentKey = process.env['GEMINI_API_KEY'];
    
    if (currentKey) {
      this.manager.recordUsage(currentKey);
      
      // Check if we should switch (every 10 requests)
      if (this.requestCount % 10 === 0 && this.manager.shouldSwitchKey(currentKey)) {
        const newKey = this.manager.switchToNextKey();
        if (newKey && newKey !== currentKey) {
          process.env['GEMINI_API_KEY'] = newKey;
          console.log(`🔄 Auto-switched to API key ending in ...${newKey.slice(-8)}`);
        }
      }
    }
  }

  onRequestError(error: any) {
    // Switch on quota/rate limit errors
    if (error?.message?.includes('quota') || 
        error?.message?.includes('rate limit') ||
        error?.status === 429) {
      const newKey = this.manager.switchToNextKey();
      if (newKey) {
        process.env['GEMINI_API_KEY'] = newKey;
        console.log(`⚡ Auto-switched API key due to quota limit`);
      }
    }
  }
}

// Global instance
export const autoApiKeySwitch = new AutoApiKeySwitch();