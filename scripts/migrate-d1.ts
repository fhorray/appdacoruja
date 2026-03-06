import { readdirSync } from 'fs';
import { join } from 'path';
import { spawnSync } from 'child_process';

const args = process.argv.slice(2);
const isRemote = args.includes('--remote');
const migrationDir = join(__dirname, '../server/database/migrations');

// Extract any wrangler flags like --env dev
const extraArgs = args.filter(arg => arg !== '--remote' && arg !== '--local');

// Find all .sql files in the drizzle directory
const migrations = readdirSync(migrationDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Ensure 0000, 0001 order

if (migrations.length === 0) {
  console.log('No migrations found.');
  process.exit(0);
}

console.log(`🚀 Found ${migrations.length} migrations. Applying to ${isRemote ? '🌊 REMOTE (Cloudflare D1)' : '💻 LOCAL (SQLite)'}...`);

for (const migration of migrations) {
  const filePath = join(migrationDir, migration);
  console.log(`\n📦 Applying: ${migration}...`);

  const wranglerArgs = [
    'd1',
    'execute',
    'DB', // Use binding name instead of hardcoded 'progy'
    '--file',
    filePath,
    isRemote ? '--remote' : '--local',
    '--yes',
    ...extraArgs
  ];

  const result = spawnSync('npx', ['wrangler', ...wranglerArgs], {
    stdio: 'inherit',
    shell: true,
    cwd: join(__dirname, '..') // Run from project root
  });

  if (result.status !== 0) {
    console.error(`❌ Failed to apply migration: ${migration}`);
    console.error(result.stderr.toString());
    console.error(result.stdout.toString());
    console.error(`   (This might happen if the migration was already applied. Check D1 dashboard if unsure.)`);
    // Optional: break; if you want to stop on first error
  } else {
    console.log(`✅ Success: ${migration}`);
  }
}

console.log('\n✨ Database migration process completed!');
