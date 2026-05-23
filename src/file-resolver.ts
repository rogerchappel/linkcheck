/**
 * File resolver - resolves relative paths from file directories
 */

import { statSync, readFileSync } from 'node:fs';
import { resolve, dirname, isAbsolute } from 'node:path';

export function resolveLinkPath(
  linkUrl: string,
  sourceFile: string,
  baseUrl?: string,
): { resolved: string; isExternal: boolean; hasAnchor: boolean; anchor: string } {
  // External URLs
  if (/^https?:\/\//i.test(linkUrl) || linkUrl.startsWith('//')) {
    return { resolved: linkUrl, isExternal: true, hasAnchor: false, anchor: '' };
  }

  // Handle base URL (docs root relative)
  let url = linkUrl;
  if (baseUrl && url.startsWith('/')) {
    url = baseUrl + url;
    if (url.startsWith('http')) {
      return { resolved: url, isExternal: false, hasAnchor: false, anchor: '' };
    }
    // Remove base prefix to get local path
    try {
      const baseUrlObj = new URL(baseUrl);
      const localPath = url.replace(baseUrlObj.origin, '');
      url = localPath;
    } catch {
      // Not a valid URL, treat as path
      url = url.replace(baseUrl, '');
    }
  }

  // Strip anchor
  let anchor = '';
  if (url.includes('#')) {
    const parts = url.split('#');
    url = parts[0];
    anchor = parts[1] || '';
  }

  // Strip query string (common in docs)
  url = url.split('?')[0];

  // Resolve path
  let resolved: string;
  if (isAbsolute(url)) {
    resolved = url;
  } else {
    // Relative to source file's directory
    const sourceDir = dirname(sourceFile);
    resolved = resolve(sourceDir, decodeURIComponent(url));
  }

  const hasAnchor = anchor.length > 0;
  return { resolved, isExternal: false, hasAnchor, anchor };
}

export function fileExists(path: string): boolean {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

export function readFileSafe(path: string): string | null {
  try {
    return readFileSync(path, 'utf-8');
  } catch {
    return null;
  }
}
