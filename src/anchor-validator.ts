/**
 * Anchor validator - verify section anchors exist in target files
 */

import { readFileSafe } from './file-resolver.js';

// Heading slug generation (duplicated from link-parser to avoid circular deps)
function textToSlugInternal(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export function validateAnchor(filePath: string, anchor: string): { valid: boolean; availableAnchors: string[] } {
  const content = readFileSafe(filePath);
  if (content === null) {
    return { valid: false, availableAnchors: [] };
  }

  // Extract headings from content
  const headingRegex = /^(#{1,6})\s+(.+)/gm;
  const slugs: string[] = [];
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    slugs.push(textToSlugInternal(match[2].trim()));
  }

  // Empty anchor is always valid (links to top of file)
  if (anchor === '') {
    return { valid: true, availableAnchors: slugs };
  }

  // Check for exact match
  if (slugs.includes(anchor)) {
    return { valid: true, availableAnchors: slugs };
  }

  // Try case-insensitive match with underscores
  const normalizedAnchor = anchor.replace(/-/g, '_').toLowerCase();
  for (const slug of slugs) {
    if (slug.replace(/-/g, '_').toLowerCase() === normalizedAnchor) {
      return { valid: true, availableAnchors: slugs };
    }
  }

  return { valid: false, availableAnchors: slugs };
}
