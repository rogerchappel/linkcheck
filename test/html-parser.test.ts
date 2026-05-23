import { describe, it, expect } from 'vitest';
import { parseHtmlLinks } from '../src/html-parser.js';

describe('parseHtmlLinks', () => {
  it('extracts anchor links', () => {
    const content = '<a href="./page.html">Click here</a>';
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./page.html');
    expect(links[0].text).toBe('Click here');
    expect(links[0].type).toBe('link');
  });

  it('extracts image sources', () => {
    const content = '<img src="./logo.png" alt="Logo">';
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./logo.png');
    expect(links[0].text).toBe('Logo');
    expect(links[0].type).toBe('image');
  });

  it('handles multiple links on one line', () => {
    const content = '<a href="./a.html">A</a> and <a href="./b.html">B</a>';
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(2);
  });

  it('handles links on different lines', () => {
    const content = `<p>
  <a href="./first.html">First</a>
</p>
<p>
  <a href="./second.html">Second</a>
</p>`;
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(2);
    expect(links[0].line).toBe(2);
    expect(links[1].line).toBe(5);
  });

  it('handles self-closing img tags', () => {
    const content = '<img src="./pic.jpg" />';
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./pic.jpg');
  });

  it('handles external URLs in href', () => {
    const content = '<a href="https://example.com">External</a>';
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('https://example.com');
  });

  it('handles anchor links', () => {
    const content = '<a href="#section">Jump</a>';
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('#section');
  });

  it('handles double-quoted and single-quoted attributes', () => {
    const content = "<a href='./test.html'>Single quote</a>";
    const links = parseHtmlLinks(content);
    expect(links).toHaveLength(1);
    expect(links[0].url).toBe('./test.html');
  });
});
