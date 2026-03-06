import { join } from 'path';
import { spawnSync } from 'child_process';

/**
 * Helper to update a user's profile in the database (Local or Remote)
 * Usage: 
 *   bun run scripts/update-user.ts --email=test@example.com --username=newname --name="New Name"
 *   bun run scripts/update-user.ts --remote --email=test@example.com --username=newname --name="New Name"
 */

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const BACKEND_ROOT = join(__dirname, '../server');

// Parse all arguments starting with --
const params = args
  .filter(a => a.startsWith('--') && a !== '--remote')
  .reduce((acc, a) => {
    const [key, value] = a.replace(/^--/, '').split('=');
    if (key && value !== undefined) {
      acc[key] = value;
    }
    return acc;
  }, {} as Record<string, string>);

const email = params.email;
const { email: _, ...updates } = params;

if (!email) {
  console.error('❌ Error: --email is required.');
  console.log('Usage: bun run scripts/update-user.ts --email=test@example.com [--anyField=value] [--remote]');
  console.log('Example: bun run scripts/update-user.ts --email=test@example.com --role=admin --banned=true');
  process.exit(1);
}

if (Object.keys(updates).length === 0) {
  console.error('❌ Error: At least one field to update must be provided.');
  process.exit(1);
}

console.log(`👤 Preparing to update user: ${email}`);
console.log(`📍 Target: ${isRemote ? '🌊 REMOTE (Cloudflare D1)' : '💻 LOCAL (SQLite)'}`);

const formatValue = (val: string) => {
  if (val === 'true') return '1';
  if (val === 'false') return '0';
  if (!isNaN(Number(val)) && val.trim() !== '') return val;
  return `'${val}'`;
};

const updateString = Object.entries(updates)
  .map(([key, value]) => `${key} = ${formatValue(value)}`)
  .join(', ');

const sql = `UPDATE users SET ${updateString} WHERE email = '${email}';`;

console.log(`\n📝 SQL Query: ${sql}`);

const wranglerArgs = [
  'wrangler',
  'd1',
  'execute',
  'progy',
  '--command',
  `"${sql}"`,
  ...(isRemote ? ['--remote'] : ['--local']),
  '--yes'
];

console.log(`\n🚀 Executing: npx ${wranglerArgs.join(' ')}`);

const result = spawnSync('npx', wranglerArgs, {
  stdio: 'inherit',
  shell: true,
  cwd: BACKEND_ROOT
});

if (result.status !== 0) {
  console.error(`\n❌ Failed to update user.`);
  process.exit(1);
}

console.log(`\n✨ User updated successfully!`);
