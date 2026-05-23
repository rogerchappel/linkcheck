/**
 * External URL checker - fetch URLs with timeout and redirect following
 */

const USER_AGENT = 'linkcheck/1.0.0 (Link Checker CLI; +https://github.com/rogerchappel/linkcheck)';

export interface UrlCheckResult {
  url: string;
  status: number;
  redirected: boolean;
  ok: boolean;
  error: string | null;
}

export async function checkExternalUrl(
  url: string,
  timeoutMs: number = 15000,
  maxRedirects: number = 5,
): Promise<UrlCheckResult> {
  let currentUrl = url;
  let redirectCount = 0;
  let redirected = false;

  try {
    while (redirectCount <= maxRedirects) {
      const controller = new AbortController();
      const timerId = setTimeout(() => controller.abort(), timeoutMs);

      let response;
      try {
        response = await fetch(currentUrl, {
          method: 'HEAD',
          redirect: 'manual',
          signal: controller.signal,
          headers: {
            'User-Agent': USER_AGENT,
          },
        });
      } finally {
        clearTimeout(timerId);
      }

      // Handle redirects (301, 302, 307, 308)
      if ([301, 302, 307, 308].includes(response.status)) {
        const location = response.headers.get('location');
        if (location) {
          currentUrl = location;
          redirected = true;
          redirectCount++;
          continue;
        }
      }

      return {
        url,
        status: response.status,
        redirected,
        ok: response.ok,
        error: null,
      };
    }

    return {
      url,
      status: 0,
      redirected: true,
      ok: false,
      error: `Too many redirects (${redirectCount})`,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes('signal is aborted') || message.includes('AbortError')) {
      return {
        url,
        status: 0,
        redirected,
        ok: false,
        error: `Timeout after ${timeoutMs}ms`,
      };
    }
    return {
      url,
      status: 0,
      redirected,
      ok: false,
      error: message,
    };
  }
}
