const { spawnSync } = require('node:child_process');
const path = require('node:path');

const [, , mode, ...restArgs] = process.argv;

if (!mode || !['dev', 'deploy'].includes(mode)) {
  console.error('Usage: node scripts/prisma-migrate-with-seed.js <dev|deploy> [...prisma args]');
  process.exit(1);
}

function runPrisma(args) {
  const prismaBin = require.resolve('prisma/build/index.js');
  return spawnSync(process.execPath, [prismaBin, ...args], {
    stdio: 'inherit',
    shell: false,
    cwd: path.resolve(__dirname, '..'),
    env: process.env,
  });
}

const migrateArgs = ['migrate', mode, ...restArgs];
const migrateResult = runPrisma(migrateArgs);

if (migrateResult.status !== 0) {
  process.exit(migrateResult.status ?? 1);
}

const seedResult = runPrisma(['db', 'seed']);
process.exit(seedResult.status ?? 1);
