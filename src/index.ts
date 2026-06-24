export { checkExternalUrl } from "./external-checker.js";
export { fileExists, readFileSafe, resolveLinkPath } from "./file-resolver.js";
export { parseHtmlLinks } from "./html-parser.js";
export { createIgnoreMatcher } from "./ignore-patterns.js";
export { parseMarkdownLinks } from "./link-parser.js";
export { generateReport } from "./report-generator.js";
export { loadCachedReport, scanFiles } from "./scanner.js";
export type {
  HeadingInfo,
  LinkIssue,
  LinkReference,
  ScanOptions,
  ScanReport,
  UrlCheckResult
} from "./types.js";
