#!/usr/bin/env node

/**
 * Setup script for fork management
 */

import { execSync } from 'child_process';

const UPSTREAM_REPO = 'https://github.com/google-gemini/gemini-cli.git';

function run(command) {
  console.log(`Running: ${command}`);
  try {
    return execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    throw error;
  }
}

function setupFork() {
  console.log('Setting up fork for upstream sync...');
  
  try {
    // Add upstream remote if it doesn't exist
    try {
      run('git remote get-url upstream');
      console.log('Upstream remote already exists.');
    } catch {
      console.log('Adding upstream remote...');
      run(`git remote add upstream ${UPSTREAM_REPO}`);
    }
    
    // Fetch upstream
    console.log('Fetching upstream...');
    run('git fetch upstream');
    
    console.log('✅ Fork setup completed!');
    console.log('You can now use "npm run sync-upstream" to sync with upstream.');
    
  } catch (error) {
    console.error('❌ Fork setup failed:', error.message);
    process.exit(1);
  }
}

setupFork();