export interface LinkIssue {
  file: string;
  line: number;
  link: string;
  type: 'internal' | 'external' | 'image' | 'anchor';
  status: 'broken' | 'missing_file' | 'missing_anchor' | 'timeout' | 'error' | 'ok';
  reason: string;
}

export interface LinkReference {
  line: number;
  url: string;
  text: string;
  type: 'link' | 'image' | 'anchor';
  raw: string;
}

export interface ScanOptions {
  path: string;
  checkExternal: boolean;
  ignorePatterns: string[];
  baseUrl: string | undefined;
  timeout: number;
}

export interface ScanReport {
  timestamp: string;
  basePath: string;
  filesScanned: number;
  totalLinks: number;
  issues: LinkIssue[];
  healthy: number;
  summary: {
    broken: number;
    missing_file: number;
    missing_anchor: number;
    timeout: number;
    error: number;
  };
}

export interface HeadingInfo {
  text: string;
  slug: string;
  line: number;
  level: number;
}

export interface UrlCheckResult {
  url: string;
  status: number;
  redirected: boolean;
  ok: boolean;
  error: string | null;
}
