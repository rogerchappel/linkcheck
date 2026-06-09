import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { resolveLinkPath, fileExists } from '../src/file-resolver.js';

const fixtureRoot = dirname(fileURLToPath(import.meta.url));

describe('resolveLinkPath', () => {
  it('identifies external URLs', () => {
    const result = resolveLinkPath('https://example.com', '/some/file.md');
    expect(result.isExternal).toBe(true);
    expect(result.resolved).toBe('https://example.com');
  });

  it('resolves relative paths from source file directory', () => {
    const result = resolveLinkPath('./other.md', '/project/docs/index.md');
    expect(result.isExternal).toBe(false);
    expect(result.resolved).toBe('/project/docs/other.md');
  });

  it('resolves parent directory paths', () => {
    const result = resolveLinkPath('../README.md', '/project/docs/guide.md');
    expect(result.resolved).toBe('/project/README.md');
  });

  it('strips anchors correctly', () => {
    const result = resolveLinkPath('./guide.md#intro', '/project/docs/index.md');
    expect(result.isExternal).toBe(false);
    expect(result.hasAnchor).toBe(true);
    expect(result.anchor).toBe('intro');
    expect(result.resolved).toBe('/project/docs/guide.md');
  });

  it('strips query strings', () => {
    const result = resolveLinkPath('./search?q=test', '/project/docs/index.md');
    expect(result.resolved).toBe('/project/docs/search');
    expect(result.hasAnchor).toBe(false);
  });

  it('handles anchor-only links', () => {
    const result = resolveLinkPath('#section', '/project/docs/index.md');
    expect(result.isExternal).toBe(false);
    expect(result.hasAnchor).toBe(true);
    expect(result.anchor).toBe('section');
    expect(result.resolved).toBe('/project/docs');
  });

  it('resolves root-relative paths', () => {
    const result = resolveLinkPath('/docs/api.md', '/project/docs/index.md');
    expect(result.resolved).toBe('/docs/api.md');
  });
});

describe('fileExists', () => {
  it('returns true for existing files', () => {
    expect(fileExists(join(fixtureRoot, '..', 'package.json'))).toBe(true);
  });

  it('returns false for non-existent files', () => {
    expect(fileExists('/nonexistent/file.md')).toBe(false);
  });
});
