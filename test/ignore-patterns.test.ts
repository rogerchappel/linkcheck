import { describe, it, expect } from 'vitest';
import { createIgnoreMatcher } from '../src/ignore-patterns.js';

describe('createIgnoreMatcher', () => {
  it('matches substring patterns', () => {
    const matcher = createIgnoreMatcher(['example.com']);
    expect(matcher('https://example.com/page')).toBe(true);
    expect(matcher('https://other.com/page')).toBe(false);
  });

  it('matches glob patterns', () => {
    const matcher = createIgnoreMatcher(['*.example.com/*']);
    expect(matcher('https://api.example.com/v1')).toBe(true);
    expect(matcher('https://example.com/v1')).toBe(false);
  });

  it('matches regex patterns', () => {
    const matcher = createIgnoreMatcher(['/^https?://localhost/']);
    expect(matcher('http://localhost:3000')).toBe(true);
    expect(matcher('https://localhost:3000')).toBe(true);
    expect(matcher('https://example.com')).toBe(false);
  });

  it('handles multiple patterns', () => {
    const matcher = createIgnoreMatcher(['github.com', 'localhost']);
    expect(matcher('https://github.com/repo')).toBe(true);
    expect(matcher('http://localhost:8080')).toBe(true);
    expect(matcher('https://example.com')).toBe(false);
  });

  it('returns false for empty patterns', () => {
    const matcher = createIgnoreMatcher([]);
    expect(matcher('anything')).toBe(false);
  });

  it('handles glob with double star', () => {
    const matcher = createIgnoreMatcher(['**/node_modules/**']);
    expect(matcher('./node_modules/something/thing.js')).toBe(true);
    expect(matcher('./src/file.ts')).toBe(false);
  });

  it('matches local file paths', () => {
    const matcher = createIgnoreMatcher(['drafts/', '*.draft.md']);
    expect(matcher('./docs/drafts/proposal.md')).toBe(true);
    expect(matcher('./notes.todo.md')).toBe(false);
  });
});
