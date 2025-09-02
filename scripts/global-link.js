#!/usr/bin/env node

/**
 * Global link system for automatic updates
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const packageRoot = join(__dirname, '..');

function run(command, options = {}) {
  console.log(`Running: ${command}`);
  try {
    return execSync(command, { stdio: 'inherit', ...options });
  } catch (error) {
    console.error(`Command failed: ${command}`);
    throw error;
  }
}

function createGlobalLink() {
  console.log('🔗 Creating global link for Gemini CLI+...');
  
  try {
    // Build the project first
    console.log('Building project...');
    run('npm run bundle', { cwd: packageRoot });
    
    // Create global link
    console.log('Creating global npm link...');
    run('npm link', { cwd: packageRoot });
    
    console.log('✅ Global link created successfully!');
    console.log('You can now use "gemini-cli+" or "gemini" from anywhere.');
    console.log('');
    console.log('To update in the future:');
    console.log('1. git pull origin main');
    console.log('2. npm run update-global');
    
  } catch (error) {
    console.error('❌ Failed to create global link:', error.message);
    process.exit(1);
  }
}

function updateGlobalLink() {
  console.log('🔄 Updating global Gemini CLI+...');
  
  try {
    // Pull latest changes
    console.log('Pulling latest changes...');
    run('git pull origin main', { cwd: packageRoot });
    
    // Rebuild
    console.log('Rebuilding project...');
    run('npm run bundle', { cwd: packageRoot });
    
    // Update global link
    console.log('Updating global link...');
    run('npm link', { cwd: packageRoot });
    
    console.log('✅ Global link updated successfully!');
    
  } catch (error) {
    console.error('❌ Failed to update global link:', error.message);
    process.exit(1);
  }
}

// Check command line arguments
const command = process.argv[2];

if (command === 'update') {
  updateGlobalLink();
} else {
  createGlobalLink();
}