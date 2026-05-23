import { describe, it, expect } from 'vitest';
import { generateTextReport, generateJsonReport } from '../src/report-generator.js';
import type { ScanReport } from '../src/types.js';

function makeReport(issues: ScanReport['issues'] = []): ScanReport {
  return {
    timestamp: '2025-01-01T00:00:00.000Z',
    basePath: '/test/project',
    filesScanned: 10,
    totalLinks: 20,
    issues,
    healthy: 20 - issues.length,
    summary: {
      broken: issues.filter(i => i.status === 'broken').length,
      missing_file: issues.filter(i => i.status === 'missing_file').length,
      missing_anchor: issues.filter(i => i.status === 'missing_anchor').length,
      timeout: issues.filter(i => i.status === 'timeout').length,
      error: issues.filter(i => i.status === 'error').length,
    },
  };
}

describe('generateTextReport', () => {
  it('generates a readable text report with issues', () => {
    const report = makeReport([
      {
        file: '/test/project/docs/index.md',
        line: 5,
        link: './missing.md',
        type: 'internal',
        status: 'missing_file',
        reason: 'File not found: /test/project/docs/missing.md',
      },
    ]);

    const output = generateTextReport(report);
    expect(output).toContain('linkcheck');
    expect(output).toContain('Scan Report');
    expect(output).toContain('Files scanned: 10');
    expect(output).toContain('Total links:   20');
    expect(output).toContain('Issues:        1');
    expect(output).toContain('missing_file');
    expect(output).toContain('File not found');
  });

  it('generates clean output for healthy scan', () => {
    const report = makeReport([]);
    const output = generateTextReport(report);
    expect(output).toContain('No issues found');
    expect(output).toContain('all links are healthy');
  });
});

describe('generateJsonReport', () => {
  it('generates valid JSON', () => {
    const report = makeReport();
    const output = generateJsonReport(report);
    const parsed = JSON.parse(output);
    expect(parsed.filesScanned).toBe(10);
    expect(parsed.totalLinks).toBe(20);
    expect(parsed.issues).toEqual([]);
  });

  it('includes all fields', () => {
    const report = makeReport([
      {
        file: '/a.md',
        line: 1,
        link: './b.md',
        type: 'internal',
        status: 'missing_file',
        reason: 'not found',
      },
    ]);
    const output = generateJsonReport(report);
    const parsed = JSON.parse(output);
    expect(parsed.issues).toHaveLength(1);
    expect(parsed.issues[0].file).toBe('/a.md');
    expect(parsed.issues[0].line).toBe(1);
  });
});
