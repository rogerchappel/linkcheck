# Configuration Guide

## Basic Config

Create `linkcheck.config.json` in your project root.

```json
{
  "checkExternal": false,
  "ignorePatterns": ["localhost", "example.com"]
}
```

## Advanced Options

### Timeout

Set a custom timeout for external URL checks.

### Base URL

Use `--base-url` for projects that link relative to the docs root.

## See Also

- [API Reference](../api/reference.md)
- [Getting Started](../getting-started.md)
- Broken image: ![Config Pic](../images/setup.png)
