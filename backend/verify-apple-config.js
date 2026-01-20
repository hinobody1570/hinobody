/**
 * Apple Sign In Configuration Verifier
 * Run this script to verify your Apple OAuth configuration
 * 
 * Usage: node verify-apple-config.js
 */

require('dotenv').config({ path: '.env' });
const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Apple Sign In Configuration...\n');

const config = {
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  callbackURL: process.env.APPLE_CALLBACK_URL || 'http://localhost:3001/auth/apple/callback',
};

let hasErrors = false;

// Check Client ID
console.log('1. APPLE_CLIENT_ID:');
if (!config.clientID || config.clientID === 'your-apple-client-id') {
  console.log('   ❌ Missing or not configured');
  hasErrors = true;
} else {
  console.log(`   ✓ Set: ${config.clientID}`);
  
  // Check if it looks like a Service ID (should not be just an App ID)
  if (!config.clientID.includes('.') || config.clientID.split('.').length < 2) {
    console.log('   ⚠️  Warning: This doesn\'t look like a valid Service ID format');
    console.log('      Service IDs usually have format: com.company.app.service');
  }
  
  // Warn if it might be an App ID instead of Service ID
  if (config.clientID.split('.').length === 3 && !config.clientID.includes('service')) {
    console.log('   ⚠️  Warning: This might be an App ID, not a Service ID');
    console.log('      For web authentication, you need a SERVICE ID');
    console.log('      Service IDs are different from App IDs');
  }
}

// Check Team ID
console.log('\n2. APPLE_TEAM_ID:');
if (!config.teamID) {
  console.log('   ❌ Missing');
  hasErrors = true;
} else {
  console.log(`   ✓ Set: ${config.teamID}`);
  if (config.teamID.length < 10) {
    console.log('   ⚠️  Warning: Team ID might be too short');
  }
}

// Check Key ID
console.log('\n3. APPLE_KEY_ID:');
if (!config.keyID) {
  console.log('   ❌ Missing');
  hasErrors = true;
} else {
  console.log(`   ✓ Set: ${config.keyID}`);
}

// Check Private Key
console.log('\n4. APPLE_PRIVATE_KEY:');
if (!config.privateKey) {
  console.log('   ❌ Missing');
  hasErrors = true;
} else {
  console.log(`   ✓ Set (length: ${config.privateKey.length} characters)`);
  
  // Check format
  if (!config.privateKey.includes('BEGIN PRIVATE KEY')) {
    console.log('   ⚠️  Warning: Private key format might be incorrect');
    console.log('      Should start with: -----BEGIN PRIVATE KEY-----');
  }
  
  if (!config.privateKey.includes('END PRIVATE KEY')) {
    console.log('   ⚠️  Warning: Private key format might be incorrect');
    console.log('      Should end with: -----END PRIVATE KEY-----');
  }
  
  // Check for newlines
  const hasNewlines = config.privateKey.includes('\n');
  const hasEscapedNewlines = config.privateKey.includes('\\n');
  
  if (!hasNewlines && !hasEscapedNewlines) {
    console.log('   ⚠️  Warning: Private key appears to be on a single line');
    console.log('      Make sure newlines are either actual newlines or \\n escape sequences');
  } else if (hasEscapedNewlines) {
    console.log('   ✓ Using escaped newlines (\\n) - will be normalized automatically');
  } else {
    console.log('   ✓ Using actual newlines');
  }
}

// Check Callback URL
console.log('\n5. APPLE_CALLBACK_URL:');
console.log(`   ✓ Using: ${config.callbackURL}`);

// Validate callback URL format
if (!config.callbackURL.startsWith('http://localhost') && !config.callbackURL.startsWith('https://')) {
  console.log('   ⚠️  Warning: Callback URL should start with http://localhost or https://');
}

if (config.callbackURL.endsWith('/')) {
  console.log('   ⚠️  Warning: Callback URL has trailing slash - will be removed automatically');
  console.log('      Make sure this matches exactly in Apple Developer Portal');
}

if (!config.callbackURL.includes('/auth/apple/callback')) {
  console.log('   ⚠️  Warning: Callback URL should end with /auth/apple/callback');
}

// Summary
console.log('\n' + '='.repeat(60));
console.log('📋 SUMMARY');
console.log('='.repeat(60));

if (hasErrors) {
  console.log('\n❌ Configuration has errors. Please fix the issues above.');
  console.log('\n📝 Next Steps:');
  console.log('   1. Update your .env file with the missing values');
  console.log('   2. Make sure you\'re using a SERVICE ID (not App ID)');
  console.log('   3. Verify your Service ID is configured in Apple Developer Portal');
  console.log('   4. Check that the callback URL matches in Apple Developer Portal');
  process.exit(1);
} else {
  console.log('\n✅ All environment variables are set!');
  console.log('\n📝 Important Checklist for Apple Developer Portal:');
  console.log('\n   1. Go to https://developer.apple.com/account/');
  console.log('   2. Navigate to: Certificates, Identifiers & Profiles → Identifiers');
  console.log('   3. Find your Service ID:', config.clientID);
  console.log('   4. Verify the following:');
  console.log('      ✓ "Sign in with Apple" capability is ENABLED');
  console.log('      ✓ Primary App ID is configured');
  console.log('      ✓ Domains includes: localhost');
  console.log(`      ✓ Return URLs includes EXACTLY: ${config.callbackURL.replace(/\/$/, '')}`);
  console.log('\n   5. Wait 5-15 minutes after making changes in Apple Developer Portal');
  console.log('   6. Clear your browser cache for appleid.apple.com');
  console.log('   7. Restart your backend server');
  console.log('\n💡 If you still get "invalid_client" error:');
  console.log('   - Double-check the Service ID matches exactly');
  console.log('   - Verify the callback URL matches exactly (no trailing slash)');
  console.log('   - Make sure you\'re using a Service ID, not an App ID');
  console.log('   - Wait a few more minutes for Apple\'s changes to propagate');
  process.exit(0);
}

