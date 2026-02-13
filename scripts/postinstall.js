#!/usr/bin/env node

const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

const schemaPath = 'prisma/schema.prisma';

if (!existsSync(schemaPath)) {
  console.log('Prisma schema not found, skipping generate');
  process.exit(0);
}

const isWindows = process.platform === 'win32';
const command = isWindows ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['prisma', 'generate', '--schema', schemaPath], {
  stdio: 'inherit',
  shell: isWindows,
  cwd: process.cwd(),
});

if (result.error) {
  console.error('Error running prisma generate:', result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
