/**
 * Pack shared packages for Firebase deployment using npm pack
 * This creates proper .tgz files that Cloud Build can install
 *
 * Run this before deploying functions:
 *   node copy-types.js
 *
 * This is needed because Firebase Cloud Build cannot resolve
 * pnpm workspace:* references.
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

try {
  console.log('Packing shared packages for deployment...');

  // Clean up old .tgz files
  const existingTgz = fs.readdirSync(__dirname).filter(f => f.endsWith('.tgz'));
  existingTgz.forEach(f => {
    fs.unlinkSync(path.join(__dirname, f));
    console.log(`Removed old ${f}`);
  });

  // Pack types package
  console.log('Packing types...');
  const typesDir = path.join(__dirname, '../../../packages/types');
  const typesOutput = execSync('npm pack', {
    cwd: typesDir,
    encoding: 'utf-8'
  }).trim();
  const typesTgz = typesOutput.split('\n').pop();
  fs.renameSync(
    path.join(typesDir, typesTgz),
    path.join(__dirname, typesTgz)
  );
  console.log(`✓ types packed successfully: ${typesTgz}`);

  console.log('✓ All packages packed successfully');
} catch (error) {
  console.error('Error packing packages:', error);
  process.exit(1);
}
