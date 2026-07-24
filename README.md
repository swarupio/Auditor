# Auditor

A URL auditing tool that fetches any web page and returns a structured report with SEO and structure metrics.

Built for the Digital Heroes Software Development internship qualification task.

## Setup

```bash
# Install dependencies
npm install

# Run locally
npm start

# Dev mode with auto-restart
npm run dev

# Run tests
npm test
```

The server starts on `http://localhost:3000` by default. Set the `PORT` environment variable to change it.

## API Contract

### `POST /api/audit`

**Example request:**

```json
{
  "url": "https://example.com"
}
```

**Example success response (200):**

```json
{
  "httpStatus": 200,
  "responseTimeMs": 342,
  "pageTitle": "Example Domain",
  "metaDescription": "",
  "h1Count": 1,
  "imagesMissingAlt": 0,
  "approximateWordCount": 28
}
```

**Error responses:**

| Status | Scenario | Example body |
|--------|----------|--------------|
| 400 | Missing or malformed URL | `{"error": "Malformed URL: \"not-a-url\" is not a valid URL"}` |
| 408 | Request timed out (>10s) | `{"error": "Request timed out after 10000ms"}` |
| 422 | Response is not HTML | `{"error": "Expected HTML but got \"application/json\""}` |
| 502 | Host unreachable / DNS failure | `{"error": "Unable to reach host: getaddrinfo ENOTFOUND nonexistent.example"}` |

## Deployment (Render)

1. Push this repo to GitHub.
2. On Render, create a **New Web Service** and connect your repo.
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. (Optional) Set environment variable `PORT` — Render sets this automatically.
5. Deploy. The `public/` folder is served as static files by Express, so no extra config is needed.

## Design Decisions

### Why I chose a 10-second timeout

I used an AbortController to enforce a 10 second timeout on all fetches to prevent my Express server from hanging on dead links. Ten seconds is enough grace period for cold starts on free tier hosts, but fails fast with a 408 Request Timeout if a site is unresponsive. This keeps the Node event loop free and guarantees the app won't crash.

### Why I defined word count this way

A naive split of raw <body> text includes inline CSS and JS variables, completely skewing the metric. To fix this efficiently, I explicitly strip non visible tags (<script>, <style>, <svg>, etc.) using Cheerio before extracting text. I then use Regex to normalize all whitespace and line breaks. It’s a fast, lightweight way to get an accurate count of actual human readable text.

### Why I handle Content-Type checking with a 422 instead of a 4xx or 5xx

I strictly check the target's Content Type header before passing anything to Cheerio. If someone submits a valid link to a heavy PDF or JSON API, trying to parse it as a DOM tree would cause memory spikes. I return a 422 Unprocessable Entity instead of a 400 or 500 because the URL syntax is perfectly valid and my server didn't fail, but the target's payload format is unprocessable.
