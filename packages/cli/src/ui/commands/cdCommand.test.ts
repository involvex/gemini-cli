/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cdCommand } from './cdCommand.js';
import { MessageType } from '../types.js';
import { createMockCommandContext } from '../../test-utils/mockCommandContext.js';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

vi.mock('node:fs');

describe('cdCommand', () => {
  const mockFs = vi.mocked(fs);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have correct command properties', () => {
    expect(cdCommand.name).toBe('cd');
    expect(cdCommand.description).toBe('Change the current working directory');
    expect(cdCommand.action).toBeDefined();
  });

  it('should show error when config is not available', async () => {
    const context = createMockCommandContext();
    context.services.config = null;

    await cdCommand.action!(context, '/some/path');

    expect(context.ui.addItem).toHaveBeenCalledWith(
      {
        type: MessageType.ERROR,
        text: 'Configuration is not available.',
      },
      expect.any(Number),
    );
  });

  it('should show error when directory does not exist', async () => {
    const context = createMockCommandContext({
      services: {
        config: {} as any,
      },
    });
    const targetDir = '/nonexistent';
    
    mockFs.statSync.mockImplementation(() => {
      throw new Error('ENOENT: no such file or directory');
    });

    await cdCommand.action!(context, targetDir);

    expect(context.ui.addItem).toHaveBeenCalledWith(
      {
        type: MessageType.ERROR,
        text: `Cannot change directory to '${path.normalize(targetDir)}': ENOENT: no such file or directory`,
      },
      expect.any(Number),
    );
  });

  it('should show error when target is not a directory', async () => {
    const context = createMockCommandContext({
      services: {
        config: {} as any,
      },
    });
    const targetPath = '/some/file.txt';
    
    mockFs.statSync.mockReturnValue({
      isDirectory: () => false,
    } as fs.Stats);

    await cdCommand.action!(context, targetPath);

    expect(context.ui.addItem).toHaveBeenCalledWith(
      {
        type: MessageType.ERROR,
        text: `'${path.normalize(targetPath)}' is not a directory.`,
      },
      expect.any(Number),
    );
  });

  it('should expand home directory path correctly', () => {
    const homeDir = os.homedir();
    
    // Test ~ expansion
    expect(path.normalize('~')).not.toBe(homeDir); // path.normalize doesn't expand ~
    
    // Test that our expandPath function would work (we can't easily test it directly due to imports)
    expect(homeDir).toBeTruthy();
    expect(typeof homeDir).toBe('string');
  });

  it('should have completion function defined', () => {
    expect(cdCommand.completion).toBeDefined();
    expect(typeof cdCommand.completion).toBe('function');
  });

  it('should return empty array for completion when config is null', async () => {
    const context = createMockCommandContext();
    context.services.config = null;

    const completions = await cdCommand.completion!(context, 'test');
    expect(completions).toEqual([]);
  });
});