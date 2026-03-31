#!/usr/bin/env node

/**
 * Setup script for creating upload directories
 * Run this on production server after deployment
 * Usage: node scripts/setup-uploads.js
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const uploadsDir = path.join(projectRoot, 'public', 'uploads');

const directories = [
  'products',
  'blogs',
  'banners',
  'testimonials'
];

console.log('🚀 Setting up upload directories...\n');

try {
  // Create main uploads directory if it doesn't exist
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('✓ Created main uploads directory');
  }

  // Create subdirectories
  directories.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✓ Created ${dir} directory`);
    } else {
      console.log(`✓ ${dir} directory already exists`);
    }
  });

  // Set permissions (Unix-like systems only)
  if (process.platform !== 'win32') {
    try {
      fs.chmodSync(uploadsDir, 0o775);
      directories.forEach(dir => {
        fs.chmodSync(path.join(uploadsDir, dir), 0o775);
      });
      console.log('\n✓ Permissions set to 775');
    } catch (permError) {
      console.warn('\n⚠ Could not set permissions. You may need to run with sudo or set permissions manually.');
    }
  }

  console.log('\n✅ Setup complete!\n');
  console.log('Upload directories:');
  directories.forEach(dir => {
    console.log(`   - public/uploads/${dir}`);
  });
  console.log('\n📝 Note: Ensure the Node.js process user has write permissions to these directories.');

} catch (error) {
  console.error('❌ Error setting up directories:', error.message);
  process.exit(1);
}
