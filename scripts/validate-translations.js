#!/usr/bin/env node

/**
 * Translation validation script
 * Checks for missing keys between en.json and ar.json
 */

const fs = require('fs');
const path = require('path');

const messagesDir = path.join(__dirname, '../messages');
const enPath = path.join(messagesDir, 'en.json');
const arPath = path.join(messagesDir, 'ar.json');

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const key in obj) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      keys = keys.concat(getAllKeys(obj[key], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

function validateTranslations() {
  console.log('🔍 Validating translations...\n');

  // Read translation files
  const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const arData = JSON.parse(fs.readFileSync(arPath, 'utf8'));

  // Get all keys
  const enKeys = getAllKeys(enData);
  const arKeys = getAllKeys(arData);

  // Find missing keys
  const missingInAr = enKeys.filter(key => !arKeys.includes(key));
  const missingInEn = arKeys.filter(key => !enKeys.includes(key));

  let hasErrors = false;

  if (missingInAr.length > 0) {
    console.error('❌ Missing keys in ar.json:');
    missingInAr.forEach(key => console.error(`   - ${key}`));
    console.error('');
    hasErrors = true;
  }

  if (missingInEn.length > 0) {
    console.error('❌ Missing keys in en.json:');
    missingInEn.forEach(key => console.error(`   - ${key}`));
    console.error('');
    hasErrors = true;
  }

  if (!hasErrors) {
    console.log('✅ All translations are in sync!');
    console.log(`   Total keys: ${enKeys.length}`);
  } else {
    process.exit(1);
  }
}

validateTranslations();
