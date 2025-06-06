#!/usr/bin/env node

/**
 * Railway Environment Variable Setup Script
 * Use this if Railway dashboard is inaccessible
 */

const { execSync } = require('child_process');

console.log('🚂 Railway Environment Variable Setup');
console.log('====================================');

// Required environment variables for iCatalyst
const requiredVars = {
  'NODE_ENV': 'production',
  'JWT_SECRET': 'iCatalyst2024SecureKey!',
  'JWT_EXPIRES_IN': '24h',
  'NEXT_PUBLIC_API_URL': '${{RAILWAY_PUBLIC_DOMAIN}}'
};

function runCommand(command) {
  try {
    const output = execSync(command, { encoding: 'utf8', stdio: 'pipe' });
    return { success: true, output };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

function checkRailwayCLI() {
  console.log('🔍 Checking Railway CLI...');
  const result = runCommand('railway --version');
  if (result.success) {
    console.log('✅ Railway CLI found:', result.output.trim());
    return true;
  } else {
    console.log('❌ Railway CLI not found. Installing...');
    const installResult = runCommand('npm install -g @railway/cli');
    if (installResult.success) {
      console.log('✅ Railway CLI installed successfully');
      return true;
    } else {
      console.error('❌ Failed to install Railway CLI:', installResult.error);
      return false;
    }
  }
}

function loginToRailway() {
  console.log('🔐 Railway login required...');
  console.log('Please run: railway login');
  console.log('Then re-run this script');
  return false;
}

function setEnvironmentVariables() {
  console.log('🔧 Setting environment variables...');
  
  // Set DATABASE_URL to use PostgreSQL service reference
  const dbResult = runCommand('railway variables set DATABASE_URL="${{Postgres.DATABASE_URL}}"');
  if (dbResult.success) {
    console.log('✅ DATABASE_URL set successfully');
  } else {
    console.error('❌ Failed to set DATABASE_URL:', dbResult.error);
  }
  
  // Set other required variables
  for (const [key, value] of Object.entries(requiredVars)) {
    const result = runCommand(`railway variables set ${key}="${value}"`);
    if (result.success) {
      console.log(`✅ ${key} set successfully`);
    } else {
      console.error(`❌ Failed to set ${key}:`, result.error);
    }
  }
}

function checkCurrentVariables() {
  console.log('📋 Current Railway variables:');
  const result = runCommand('railway variables');
  if (result.success) {
    console.log(result.output);
  } else {
    console.error('❌ Failed to get variables:', result.error);
  }
}

function main() {
  console.log('Starting Railway setup...\n');
  
  // Check if Railway CLI is available
  if (!checkRailwayCLI()) {
    process.exit(1);
  }
  
  // Check if logged in
  const loginCheck = runCommand('railway whoami');
  if (!loginCheck.success) {
    loginToRailway();
    process.exit(1);
  }
  
  console.log('✅ Logged in as:', loginCheck.output.trim());
  
  // Set environment variables
  setEnvironmentVariables();
  
  // Show current variables
  checkCurrentVariables();
  
  console.log('\n🎉 Railway setup complete!');
  console.log('🔄 Triggering deployment...');
  
  const deployResult = runCommand('railway up');
  if (deployResult.success) {
    console.log('✅ Deployment triggered successfully');
  } else {
    console.log('ℹ️  Manual deployment trigger recommended');
  }
}

if (require.main === module) {
  main();
}

module.exports = { runCommand, setEnvironmentVariables }; 