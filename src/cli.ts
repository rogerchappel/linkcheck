#!/usr/bin/env node
/**
 * CLI entry point for linkcheck
 */

import { Command } from 'commander';
import { scanCommand } from './commands/scan.js';
import { reportCommand } from './commands/report.js';
import { doctorCommand } from './commands/doctor.js';
// Read version directly from package.json
import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const pkg = JSON.parse(readFileSync(resolve(__dirname, '..', 'package.json'), 'utf-8'));
const version = pkg.version as string;

const program = new Command();

program
  .name('linkcheck')
  .description('Local-first link checker for markdown & HTML documentation')
  .version(version);

program
  .command('scan')
  .description('Scan files for broken links')
  .argument('<path>', 'File or directory to scan')
  .option('--check-external', 'Also check external URLs (off by default)', false)
  .option('--ignore <patterns...>', 'URL/path patterns to ignore', [])
  .option('--base-url <url>', 'Base URL for resolving root-relative links')
  .option('--timeout <ms>', 'Timeout for external URL checks in milliseconds', '15000')
  .option('--format <format>', 'Output format: text or json', 'text')
  .action(scanCommand);

program
  .command('report')
  .description('Show the last scan report')
  .argument('[path]', 'Base path (default: current directory)', '.')
  .option('--format <format>', 'Output format: text or json', 'text')
  .action(reportCommand);

program
  .command('doctor')
  .description('Health check — verify installation and dependencies')
  .action(doctorCommand);

program.parse();
