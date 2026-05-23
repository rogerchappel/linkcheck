/**
 * Scanner — full scan pipeline: discover files, parse links, validate, report
 */

import { glob } from 'glob';
import { readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname, basename } from 'node:path';
import type { LinkIssue, ScanReport, LinkReference } from './types.js';
import { parseMarkdownLinks } from './link-parser.js';
import { parseHtmlLinks } from './html-parser.js';
import { resolveLinkPath, fileExists, readFileSafe } from './file-resolver.js';
import { validateAnchor } from './anchor-validator.js';
import { checkExternalUrl } from './external-checker.js';
import { createIgnoreMatcher } from './ignore-patterns.js';

const GLOB_PATTERN = '**/*.{md,markdown,html,htm}';
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'coverage'];

export async function scanFiles(
  basePath: string,
  options: {
    checkExternal?: boolean;
    ignorePatterns?: string[];
    baseUrl?: string;
    timeout?: number;
  } = {},
): Promise<ScanReport> {
  const {
    checkExternal = false,
    ignorePatterns = [],
    baseUrl,
    timeout = 15000,
  } = options;

  const resolvedBase = resolve(basePath);
  const shouldIgnore = createIgnoreMatcher(ignorePatterns);

  // Discover files
  const searchPath = statSync(resolvedBase).isDirectory()
    ? resolvedBase
    : dirname(resolvedBase);

  const filePattern = statSync(resolvedBase).isDirectory()
    ? resolve(searchPath, GLOB_PATTERN)
    : resolvedBase;

  const files = await glob(filePattern, {
    ignore: IGNORE_DIRS.map(d => `**/${d}/**`),
    nodir: true,
  });

  const issues: LinkIssue[] = [];
  let totalLinks = 0;

  for (const filePath of files) {
    const absPath = resolve(filePath);
    const content = readFileSync(absPath, 'utf-8');
    const ext = basename(absPath).split('.').pop()?.toLowerCase() || '';
    const isHtml = ['html', 'htm'].includes(ext);

    // Parse links
    const links: LinkReference[] = isHtml
      ? parseHtmlLinks(content)
      : parseMarkdownLinks(content);

    for (const link of links) {
      totalLinks++;

      // Check ignore patterns
      if (shouldIgnore(link.url)) {
        continue;
      }

      // Handle mailto: and tel: links
      if (link.url.startsWith('mailto:') || link.url.startsWith('tel:')) {
        continue;
      }

      // Resolve the link path
      const resolved = resolveLinkPath(link.url, absPath, baseUrl);

      if (resolved.isExternal) {
        // External URL
        if (!checkExternal) {
          continue;
        }

        const result = await checkExternalUrl(link.url, timeout);
        if (!result.ok) {
          issues.push({
            file: absPath,
            line: link.line,
            link: link.url,
            type: 'external',
            status: result.error?.includes('Timeout') ? 'timeout' : 'broken',
            reason: result.error || `HTTP ${result.status}`,
          });
        }
      } else {
        // Internal link — check file exists
        if (resolved.resolved && !fileExists(resolved.resolved)) {
          const isImage = link.type === 'image';
          issues.push({
            file: absPath,
            line: link.line,
            link: link.url,
            type: isImage ? 'image' : 'internal',
            status: 'missing_file',
            reason: `File not found: ${resolved.resolved}`,
          });
        } else if (resolved.hasAnchor && resolved.resolved && fileExists(resolved.resolved)) {
          // Check anchor exists in target file
          const { valid, availableAnchors } = validateAnchor(resolved.resolved, resolved.anchor);
          if (!valid) {
            issues.push({
              file: absPath,
              line: link.line,
              link: link.url,
              type: 'anchor',
              status: 'missing_anchor',
              reason: `Anchor "${resolved.anchor}" not found in resolved file. Available: ${availableAnchors.join(', ') || '(none)'}`,
            });
          }
        }
      }
    }
  }

  const summary = {
    broken: issues.filter(i => i.status === 'broken').length,
    missing_file: issues.filter(i => i.status === 'missing_file').length,
    missing_anchor: issues.filter(i => i.status === 'missing_anchor').length,
    timeout: issues.filter(i => i.status === 'timeout').length,
    error: issues.filter(i => i.status === 'error').length,
  };

  const report: ScanReport = {
    timestamp: new Date().toISOString(),
    basePath: resolvedBase,
    filesScanned: files.length,
    totalLinks,
    issues,
    healthy: totalLinks - issues.length,
    summary,
  };

  // Cache report for `linkcheck report`
  cacheReport(report, resolvedBase);

  return report;
}

function cacheReport(report: ScanReport, basePath: string): void {
  const cacheDir = resolve(basePath, '.linkcheck-cache');
  try {
    mkdirSync(cacheDir, { recursive: true });
    writeFileSync(resolve(cacheDir, 'last-report.json'), JSON.stringify(report, null, 2));
  } catch {
    // Cache write is non-critical
  }
}

export function loadCachedReport(basePath: string): ScanReport | null {
  const cachePath = resolve(basePath, '.linkcheck-cache', 'last-report.json');
  const content = readFileSafe(cachePath);
  if (!content) return null;
  try {
    return JSON.parse(content) as ScanReport;
  } catch {
    return null;
  }
}
