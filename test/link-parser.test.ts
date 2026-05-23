import { describe, it, expect } from 'vitest';
import { parseMarkdownLinks, extractHeadings, textToSlug } from '../src/link-parser.js';

describe('parseMarkdownLinks', () => {
  it('extracts inline links', () => {
    const content = 'See [documentation](./docs/guide.md) for details.';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./docs/guide.md');
    expect(links[0].text).toBe('documentation');
    expect(links[0].line).toBe(1);
    expect(links[0].type).toBe('link');
  });

  it('extracts multiple links on same line', () => {
    const content = '[link1](./a.md) and [link2](./b.md)';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(2);
    expect(links[0].url).toBe('./a.md');
    expect(links[1].url).toBe('./b.md');
  });

  it('extracts images', () => {
    const content = '![logo](./images/logo.png)';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].type).toBe('image');
    expect(links[0].url).toBe('./images/logo.png');
    expect(links[0].text).toBe('logo');
  });

  it('extracts links on different line numbers', () => {
    const content = `# Title

[first](./a.md)

Some text.

[second](./b.md)
`;
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(2);
    expect(links[0].line).toBe(3);
    expect(links[1].line).toBe(7);
  });

  it('handles empty link text', () => {
    const content = '[](./empty.md)';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].text).toBe('');
  });

  it('handles links with query strings', () => {
    const content = '[search](./search?q=test)';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./search?q=test');
  });

  it('handles reference-style links', () => {
    const content = `[doc][myref]

[myref]: ./reference.md "Reference doc"`;
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./reference.md');
    expect(links[0].text).toBe('doc');
  });

  it('ignores reference definitions as links', () => {
    const content = `[myref]: ./reference.md`;
    const links = parseMarkdownLinks(content);
    // Reference definitions are NOT links themselves
    expect(links).toHaveLength(0);
  });

  it('handles links with titles', () => {
    const content = '[guide](./guide.md "The Guide")';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./guide.md');
  });

  it('does not confuse image link syntax with plain links', () => {
    const content = '![img](a.png) is an image, [link](b.md) is a link';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(2);
    expect(links[0].type).toBe('image');
    expect(links[1].type).toBe('link');
  });

  it('handles external URLs', () => {
    const content = '[Google](https://google.com)';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('https://google.com');
  });

  it('handles anchor-only links', () => {
    const content = '[See intro](#introduction)';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('#introduction');
  });

  it('handles encoded URLs', () => {
    const content = '[doc](./docs/my%20guide.md)';
    const links = parseMarkdownLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./docs/my%20guide.md');
  });
});

describe('extractHeadings', () => {
  it('extracts headings with correct levels', () => {
    const content = `# Title
## Subtitle
### Deep heading`;
    const headings = extractHeadings(content);
    expect(headings).toHaveLength(3);
    expect(headings[0].level).toBe(1);
    expect(headings[1].level).toBe(2);
    expect(headings[2].level).toBe(3);
  });

  it('generates correct slugs', () => {
    const content = `## Getting Started
### What is LinkCheck?
#### API & Methods`;
    const headings = extractHeadings(content);
    expect(headings[0].slug).toBe('getting-started');
    expect(headings[1].slug).toBe('what-is-linkcheck');
    expect(headings[2].slug).toBe('api-methods');
  });

  it('includes line numbers', () => {
    const content = `

# First Heading`;
    const headings = extractHeadings(content);
    expect(headings).toHaveLength(1);
    expect(headings[0].line).toBe(3);
  });
});

describe('textToSlug', () => {
  it('converts to lowercase', () => {
    expect(textToSlug('Hello World')).toBe('hello-world');
  });

  it('removes special characters', () => {
    expect(textToSlug('What is it?')).toBe('what-is-it');
  });

  it('collapses multiple spaces', () => {
    expect(textToSlug('Hello   World')).toBe('hello-world');
  });

  it('handles trailing spaces', () => {
    expect(textToSlug('  Title  ')).toBe('title');
  });
});
