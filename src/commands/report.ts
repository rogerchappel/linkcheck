/**
 * Report command handler — show cached last scan report
 */

import { loadCachedReport } from '../scanner.js';
import { generateReport } from '../report-generator.js';

interface ReportOptions {
  format: string;
}

export function reportCommand(path: string, opts: ReportOptions): void {
  const format = (opts.format === 'json' ? 'json' : 'text') as 'text' | 'json';

  const report = loadCachedReport(path);

  if (!report) {
    console.error('No cached report found. Run "linkcheck scan <path>" first.');
    process.exit(1);
  }

  console.log(generateReport(report, format));
}
