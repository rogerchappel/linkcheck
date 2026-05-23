/**
 * Scan command handler
 */

import { scanFiles } from '../scanner.js';
import { generateReport } from '../report-generator.js';

interface ScanOptions {
  checkExternal: boolean;
  ignore: string[];
  baseUrl?: string;
  timeout: string;
  format: string;
}

export async function scanCommand(path: string, opts: ScanOptions): Promise<void> {
  const format = (opts.format === 'json' ? 'json' : 'text') as 'text' | 'json';

  try {
    const report = await scanFiles(path, {
      checkExternal: opts.checkExternal,
      ignorePatterns: opts.ignore,
      baseUrl: opts.baseUrl,
      timeout: parseInt(opts.timeout, 10) || 15000,
    });

    const output = generateReport(report, format);
    console.log(output);

    // Exit non-zero if issues found (CI-friendly)
    if (report.issues.length > 0) {
      process.exit(1);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (format === 'json') {
      console.error(JSON.stringify({ error: message }));
    } else {
      console.error(`Error: ${message}`);
    }
    process.exit(2);
  }
}
