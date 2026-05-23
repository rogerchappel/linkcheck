/**
 * Markdown link parser
 * Extracts links, images, and anchors from markdown content with line numbers
 */

import type { LinkReference } from './types.js';

export function parseMarkdownLinks(content: string): LinkReference[] {
  const lines = content.split('\n');
  const refs: LinkReference[] = [];

  // Collect reference-style definitions first: [id]: url
  const refLinks = new Map<string, { url: string }>();
  const refLinkRegex = /^\s*\[([^\]]+)\]:\s*(\S+)/;
  for (const line of lines) {
    const m = line.match(refLinkRegex);
    if (m) {
      refLinks.set(m[1].toLowerCase(), { url: m[2] });
    }
  }

  // Regex patterns
  const inlineLinkRegex = /\[([^\]]*)\]\(([^)]+)\)/g;
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
  // Match [text][ref] where ref is NOT a reference definition (must appear on same line without ':')
  const refLinkUsageRegex = /\[([^\]]+)\]\[([^\]]+)\]/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip reference definitions
    if (refLinkRegex.test(line.trim())) continue;

    // Inline images
    const imgMatches = [...line.matchAll(imageRegex)];
    for (const match of imgMatches) {
      refs.push({
        line: lineNum,
        url: match[2] || '',
        text: match[1] || '',
        type: 'image',
        raw: match[0],
      });
    }

    // Inline links (that aren't images)
    const cleanedLine = line.replace(imageRegex, '');
    const linkMatches = [...cleanedLine.matchAll(inlineLinkRegex)];
    for (const match of linkMatches) {
      const [urlPart] = match[2].split(/\s+/); // handle title like "url "title""
      refs.push({
        line: lineNum,
        url: urlPart || '',
        text: match[1] || '',
        type: 'link',
        raw: match[0],
      });
    }

    // Reference-style link usage: [text][ref]
    const refUsageMatches = [...line.matchAll(refLinkUsageRegex)];
    for (const match of refUsageMatches) {
      const refKey = match[2].toLowerCase();
      const refUrl = refLinks.get(refKey);
      if (refUrl) {
        refs.push({
          line: lineNum,
          url: refUrl.url,
          text: match[1] || '',
          type: 'link',
          raw: match[0],
        });
      }
    }
  }

  return refs;
}

/**
 * Extract heading info from markdown content
 */
export function extractHeadings(content: string): import('./types.js').HeadingInfo[] {
  const lines = content.split('\n');
  const headings: import('./types.js').HeadingInfo[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)/;

  for (let i = 0; i < lines.length; i++) {
    const match = lines[i].match(headingRegex);
    if (match) {
      const text = match[2].trim();
      const slug = textToSlug(text);
      headings.push({
        text,
        slug,
        line: i + 1,
        level: match[1].length,
      });
    }
  }

  return headings;
}

/**
 * Convert heading text to GitHub-style slug
 */
export function textToSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}
