/**
 * Report generator - text and JSON output formats
 */

import type { LinkIssue, ScanReport } from './types.js';

export function generateTextReport(report: ScanReport): string {
  const lines: string[] = [];

  lines.push('═'.repeat(60));
  lines.push('  linkcheck — Scan Report');
  lines.push('═'.repeat(60));
  lines.push('');
  lines.push(`  Files scanned: ${report.filesScanned}`);
  lines.push(`  Total links:   ${report.totalLinks}`);
  lines.push(`  Healthy:       ${report.healthy}`);
  lines.push(`  Issues:        ${report.issues.length}`);
  lines.push('');

  if (report.issues.length > 0) {
    lines.push('─'.repeat(60));
    lines.push('  ISSUES');
    lines.push('─'.repeat(60));
    lines.push('');

    for (const issue of report.issues) {
      lines.push(`  ${issue.file}:${issue.line}`);
      lines.push(`    ${issue.type.padEnd(10)} ${issue.link}`);
      lines.push(`    Status: ${issue.status}`);
      lines.push(`    Reason: ${issue.reason}`);
      lines.push('');
    }

    lines.push('─'.repeat(60));
    lines.push('  SUMMARY');
    lines.push('─'.repeat(60));
    lines.push(`  Broken files:     ${report.summary.broken}`);
    lines.push(`  Missing files:    ${report.summary.missing_file}`);
    lines.push(`  Missing anchors:  ${report.summary.missing_anchor}`);
    lines.push(`  Timeouts:         ${report.summary.timeout}`);
    lines.push(`  Errors:           ${report.summary.error}`);
    lines.push('');
  } else {
    lines.push('  ✓ No issues found — all links are healthy!');
    lines.push('');
  }

  lines.push(`  Timestamp: ${report.timestamp}`);
  lines.push(`  Base path: ${report.basePath}`);
  lines.push('═'.repeat(60));

  return lines.join('\n');
}

export function generateJsonReport(report: ScanReport): string {
  return JSON.stringify(report, null, 2);
}

export function generateReport(report: ScanReport, format: 'text' | 'json'): string {
  switch (format) {
    case 'json':
      return generateJsonReport(report);
    case 'text':
    default:
      return generateTextReport(report);
  }
}

export function formatIssueLine(issue: LinkIssue): string {
  return `${issue.file}:${issue.line} [${issue.type}] ${issue.link} → ${issue.status} (${issue.reason})`;
}
