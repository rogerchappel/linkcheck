import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { validateAnchor } from '../src/anchor-validator.js';
import { textToSlug } from '../src/link-parser.js';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { tmpdir } from 'node:os';

describe('validateAnchor', () => {
  const tmpDir = resolve(tmpdir(), 'linkcheck-anchor-test');

  beforeAll(() => {
    mkdirSync(tmpDir, { recursive: true });
    writeFileSync(resolve(tmpDir, 'test.md'), `# Getting Started

## Installation

Steps to install.

### Advanced Setup

## Configuration

Config details.

## API Reference`);
  });

  afterAll(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns valid for existing anchor', () => {
    const result = validateAnchor(resolve(tmpDir, 'test.md'), 'installation');
    expect(result.valid).toBe(true);
  });

  it('returns valid for empty anchor (top of file)', () => {
    const result = validateAnchor(resolve(tmpDir, 'test.md'), '');
    expect(result.valid).toBe(true);
  });

  it('returns invalid for non-existent anchor', () => {
    const result = validateAnchor(resolve(tmpDir, 'test.md'), 'nonexistent-section');
    expect(result.valid).toBe(false);
  });

  it('returns available anchors for invalid anchor', () => {
    const result = validateAnchor(resolve(tmpDir, 'test.md'), 'nonexistent-section');
    expect(result.availableAnchors).toContain('getting-started');
    expect(result.availableAnchors).toContain('installation');
    expect(result.availableAnchors).toContain('configuration');
  });

  it('returns valid for non-existent file as invalid', () => {
    const result = validateAnchor(resolve(tmpDir, 'does-not-exist.md'), 'any');
    expect(result.valid).toBe(false);
    expect(result.availableAnchors).toHaveLength(0);
  });
});

describe('textToSlug', () => {
  it('converts markdown heading text to GitHub-style slugs', () => {
    expect(textToSlug('Getting Started')).toBe('getting-started');
    expect(textToSlug('What is LinkCheck?')).toBe('what-is-linkcheck');
    expect(textToSlug('API & Methods')).toBe('api-methods');
  });
});
