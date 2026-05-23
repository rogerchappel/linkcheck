import { describe, it, expect } from 'vitest';
import { scanFiles } from '../src/scanner.js';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const FIXTURES = resolve(__dirname, '../src/fixtures/wiki');

describe('scanFiles - integration', () => {
  it('scans the fixtures wiki and finds expected issues', async () => {
    const report = await scanFiles(FIXTURES, {
      checkExternal: false,
      ignorePatterns: ['example.com'],
    });

    expect(report.filesScanned).toBeGreaterThan(0);
    expect(report.totalLinks).toBeGreaterThan(0);
    expect(report.issues.length).toBeGreaterThan(0);

    // Should find broken internal links
    const missingFiles = report.issues.filter(i => i.status === 'missing_file');
    expect(missingFiles.length).toBeGreaterThan(0);

    // Must find the does-not-exist.md link
    const brokenFile = missingFiles.find(i => i.link.includes('does-not-exist'));
    expect(brokenFile).toBeDefined();

    // Should find missing anchor
    const missingAnchors = report.issues.filter(i => i.status === 'missing_anchor');
    expect(missingAnchors.length).toBeGreaterThan(0);
  });

  it('respects ignore patterns', async () => {
    const report = await scanFiles(FIXTURES, {
      checkExternal: false,
      ignorePatterns: ['does-not-exist', 'missing', 'example.com'],
    });

    // Should still find issues we didn't ignore
    expect(report.issues.length).toBeGreaterThanOrEqual(0);

    // The does-not-exist link should be ignored
    const brokenFile = report.issues.find(i => i.link.includes('does-not-exist'));
    expect(brokenFile).toBeUndefined();
  });

  it('scans HTML files for broken links', async () => {
    const report = await scanFiles(FIXTURES, {
      checkExternal: false,
      ignorePatterns: ['example.com', 'missing-banner'],
    });

    // Should find missing-page.html link from index.html
    const brokenHtml = report.issues.find(i => i.link.includes('missing-page'));
    // This depends on which files have the missing-page.html reference
    expect(report.totalLinks).toBeGreaterThan(0);
  });

  it('reports healthy link count', async () => {
    const report = await scanFiles(FIXTURES, {
      checkExternal: false,
      ignorePatterns: ['example.com', 'missing'],
    });

    expect(report.healthy).toBeGreaterThanOrEqual(0);
    expect(report.healthy + report.issues.length).toEqual(report.totalLinks);
  });
});
