#!/usr/bin/env node

/**
 * Sync script to keep fork updated with upstream google/gemini-cli
 * while preserving custom changes
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const UPSTREAM_REPO = 'https://github.com/google-gemini/gemini-cli.git';
const FORK_REPO = 'https://github.com/involvex/gemini-cli.git';
const CUSTOM_BRANCH = 'custom-features';

function getLatestUpstreamBranch() {
  try {
    // Get all remote branches and their commit dates
    const branches = execSync('git ls-remote --heads upstream', { encoding: 'utf8' })
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        const [commit, ref] = line.split('\t');
        const branch = ref.replace('refs/heads/', '');
        return { branch, commit };
      });
    
    // Priority order: preview branches, nightly, main
    const previewBranch = branches.find(b => b.branch.includes('preview'));
    const nightlyBranch = branches.find(b => b.branch === 'nightly');
    const mainBranch = branches.find(b => b.branch === 'main');
    
    const latest = previewBranch || nightlyBranch || mainBranch;
    console.log(`Latest upstream branch: ${latest.branch}`);
    return latest.branch;
  } catch (error) {
    console.warn('Could not detect latest branch, using main');
    return 'main';
  }
}

// Files that contain custom changes - these will be preserved
const CUSTOM_FILES = [
  'packages/cli/src/ui/commands/cdCommand.ts',
  'packages/cli/src/ui/commands/cdCommand.test.ts',
  'packages/cli/src/ui/commands/dashboardCommand.ts',
  'packages/cli/src/ui/commands/updateCommand.ts',
  'packages/cli/src/ui/commands/apiKeyCommand.ts',
  'packages/cli/src/services/BuiltinCommandLoader.ts',
  'packages/cli/src/services/ApiKeyManager.ts',
  'packages/cli/src/services/AutoApiKeySwitch.ts',
  'packages/cli/src/gemini.tsx',
  'packages/dashboard/',
  'scripts/sync-upstream.js',
  'scripts/setup-fork.js',
  'FORK_README.md',
  'GEMINI_CLI_PLUS_README.md',
  'package.json'
];

function run(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    throw error;
  }
}

function backupCustomFiles() {
  console.log('Backing up custom files...');
  const backups = {};
  
  for (const file of CUSTOM_FILES) {
    if (existsSync(file)) {
      backups[file] = readFileSync(file, 'utf8');
      console.log(`Backed up: ${file}`);
    }
  }
  
  return backups;
}

function restoreCustomFiles(backups) {
  console.log('Restoring custom files...');
  
  for (const [file, content] of Object.entries(backups)) {
    writeFileSync(file, content);
    console.log(`Restored: ${file}`);
  }
}

function syncUpstream() {
  console.log('Starting upstream sync...');
  
  // Check if we have a clean working directory
  try {
    run('git diff --quiet');
    run('git diff --cached --quiet');
  } catch {
    console.error('Working directory is not clean. Please commit or stash changes first.');
    process.exit(1);
  }
  
  // Backup custom files
  const backups = backupCustomFiles();
  
  try {
    // Add upstream remote if it doesn't exist
    try {
      run('git remote get-url upstream');
    } catch {
      console.log('Adding upstream remote...');
      run(`git remote add upstream ${UPSTREAM_REPO}`);
    }
    
    // Fetch upstream changes
    console.log('Fetching upstream changes...');
    run('git fetch upstream');
    
    // Get latest upstream branch and merge
    const latestBranch = getLatestUpstreamBranch();
    console.log(`Merging upstream changes from ${latestBranch}...`);
    run(`git checkout main`);
    run(`git merge upstream/${latestBranch}`);
    
    // Restore custom files
    restoreCustomFiles(backups);
    
    // Commit restored files if there are changes
    try {
      run('git add .');
      run('git commit -m "Restore custom changes after upstream sync"');
      console.log('Custom changes restored and committed.');
    } catch {
      console.log('No changes to commit after restoration.');
    }
    
    console.log('✅ Upstream sync completed successfully!');
    console.log('Custom files have been preserved.');
    
  } catch (error) {
    console.error('❌ Sync failed. Restoring custom files...');
    restoreCustomFiles(backups);
    throw error;
  }
}

// Run the sync
syncUpstream();