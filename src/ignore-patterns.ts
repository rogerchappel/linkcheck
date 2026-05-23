/**
 * Ignore patterns — glob/pattern matching for URLs to skip
 */

export function createIgnoreMatcher(patterns: string[]): (url: string) => boolean {
  if (patterns.length === 0) {
    return () => false;
  }

  const compiled = patterns.map(compilePattern);

  return (url: string): boolean => {
    return compiled.some(p => p.test(url));
  };
}

type CompiledPattern = { test: (url: string) => boolean };

function compilePattern(pattern: string): CompiledPattern {
  // If it's a regex pattern (starts and ends with /)
  if (pattern.startsWith('/') && pattern.lastIndexOf('/') > 0) {
    const parts = pattern.slice(1).split('/');
    const flags = parts.pop() || '';
    const reSource = parts.join('/');
    try {
      const regex = new RegExp(reSource, flags);
      return { test: (url) => regex.test(url) };
    } catch {
      // Invalid regex, fall back to string match
      return compileStringPattern(pattern);
    }
  }

  return compileStringPattern(pattern);
}

function compileStringPattern(pattern: string): CompiledPattern {
  // Check for glob patterns
  if (pattern.includes('*')) {
    // Convert glob to regex
    const reSource = pattern
      .replace(/[.+?^${}()|[\]\\]/g, '\\$&')
      .replace(/\*\*/g, '__DOUBLESTAR__')
      .replace(/\*/g, '[^/]*')
      .replace(/__DOUBLESTAR__/g, '.*');
    const regex = new RegExp(reSource);
    return { test: (url) => regex.test(url) };
  }

  // Simple substring match — works for many common use cases
  return { test: (url) => url.includes(pattern) };
}
