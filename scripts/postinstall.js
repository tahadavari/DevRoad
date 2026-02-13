#!/usr/bin/env node

const { existsSync } = require('node:fs');
const { spawnSync } = require('node:child_process');

const schemaPath = 'prisma/schema.prisma';

if (!existsSync(schemaPath)) {
  console.log('Prisma schema not found, skipping generate');
  process.exit(0);
}

const command = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const result = spawnSync(command, ['prisma', 'generate', '--schema', schemaPath], {
  stdio: 'inherit',
});

process.exit(result.status ?? 1);
