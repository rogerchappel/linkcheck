/**
 * HTML link parser
 * Extracts links and images from HTML files using tag-based parsing
 */

import type { LinkReference } from './types.js';

export function parseHtmlLinks(content: string): LinkReference[] {
  const lines = content.split('\n');
  const refs: LinkReference[] = [];

  // Match <a> tags with href
  const anchorRegex = /<a\s[^>]*href\s*=\s*["']([^"']*)["'][^>]*>/gi;
  // Match <img> tags with src
  const imgRegex = /<img\s[^>]*src\s*=\s*["']([^"']*)["'][^>]*\/?>/gi;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Extract anchor links
    const anchorMatches = [...line.matchAll(anchorRegex)];
    for (const match of anchorMatches) {
      // Get text content between tags if on same line
      const closingRegex = new RegExp(match[0].replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^<]*)</a>', 'i');
      const closingMatch = line.match(closingRegex);
      const text = closingMatch ? closingMatch[1].trim() : '';

      refs.push({
        line: lineNum,
        url: match[1],
        text,
        type: 'link',
        raw: match[0],
      });
    }

    // Extract image sources
    const imgMatches = [...line.matchAll(imgRegex)];
    for (const match of imgMatches) {
      const altRegex = /alt\s*=\s*["']([^"']*)["']/i;
      const altMatch = line.match(altRegex);
      const alt = altMatch ? altMatch[1] : '';

      refs.push({
        line: lineNum,
        url: match[1],
        text: alt,
        type: 'image',
        raw: match[0],
      });
    }
  }

  return refs;
}
