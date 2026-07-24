const TIMEOUT_MS = 10000;

async function fetchPage(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": "PagePulse/1.0" },
    });

    const responseTimeMs = Date.now() - startTime;

    if (response.status >= 400 && response.status < 500) {
      throw Object.assign(
        new Error(`Page returned ${response.status} — the URL may not exist or is unreachable`),
        { statusCode: 404, code: "NOT_FOUND" }
      );
    }

    if (response.status >= 500) {
      throw Object.assign(
        new Error(`Page returned ${response.status} — the server encountered an error`),
        { statusCode: 502, code: "SERVER_ERROR" }
      );
    }

    const contentType = response.headers.get("content-type") || "";

    if (!contentType.includes("text/html")) {
      throw Object.assign(
        new Error(`Expected HTML but got "${contentType.split(";")[0].trim()}"`),
        { statusCode: 422, code: "NOT_HTML" }
      );
    }

    const html = await response.text();

    return {
      html,
      httpStatus: response.status,
      responseTimeMs,
    };
  } catch (err) {
    if (err.name === "AbortError") {
      throw Object.assign(
        new Error(`Request timed out after ${TIMEOUT_MS}ms`),
        { statusCode: 408, code: "TIMEOUT" }
      );
    }
    if (err.code === "NOT_HTML") throw err;
    if (err.code === "ENOTFOUND" || err.code === "ECONNREFUSED" || err.code === "ECONNRESET" || err.code === "EAI_AGAIN") {
      throw Object.assign(
        new Error(`Unable to reach host: ${err.message}`),
        { statusCode: 502, code: "UNREACHABLE" }
      );
    }
    if (err.type === "system" || err.cause) {
      throw Object.assign(
        new Error(`Connection error: unable to reach "${url}"`),
        { statusCode: 502, code: "CONNECTION_ERROR" }
      );
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

module.exports = { fetchPage };