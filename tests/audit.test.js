const { parseHtml } = require("../src/services/parser");
const { validateUrl } = require("../src/services/validator");

describe("parseHtml", () => {
  test("returns correct report fields from valid HTML", () => {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>My Test Page</title>
  <meta name="description" content="A test page for auditing">
</head>
<body>
  <h1>Main Heading</h1>
  <h1>Second H1</h1>
  <p>Hello world this is some text here</p>
  <img src="a.jpg" alt="good">
  <img src="b.jpg">
  <img src="c.jpg" alt="">
  <script>var x = 1;</script>
  <style>body { color: red; }</style>
</body>
</html>`;

    const result = parseHtml(html);

    expect(result.pageTitle).toBe("My Test Page");
    expect(result.metaDescription).toBe("A test page for auditing");
    expect(result.h1Count).toBe(2);
    expect(result.imagesMissingAlt).toBe(2);
    expect(result.approximateWordCount).toBe(11);
  });

  test("handles missing meta description", () => {
    const html = `<html><head><title>No Desc</title></head><body><p>Hello</p></body></html>`;
    const result = parseHtml(html);

    expect(result.pageTitle).toBe("No Desc");
    expect(result.metaDescription).toBe("");
  });

  test("handles empty HTML gracefully", () => {
    const result = parseHtml("");

    expect(result.pageTitle).toBe("");
    expect(result.metaDescription).toBe("");
    expect(result.h1Count).toBe(0);
    expect(result.imagesMissingAlt).toBe(0);
    expect(result.approximateWordCount).toBe(0);
  });
});

describe("validateUrl", () => {
  test("rejects missing url field", () => {
    const result = validateUrl(undefined);
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
  });

  test("rejects empty string", () => {
    const result = validateUrl("");
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
  });

  test("rejects malformed URL", () => {
    const result = validateUrl("not-a-url");
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
  });

  test("rejects non-http protocol", () => {
    const result = validateUrl("ftp://example.com");
    expect(result.valid).toBe(false);
    expect(result.status).toBe(400);
  });

  test("accepts valid http URL", () => {
    const result = validateUrl("http://example.com");
    expect(result.valid).toBe(true);
  });

  test("accepts valid https URL", () => {
    const result = validateUrl("https://example.com/page?q=1");
    expect(result.valid).toBe(true);
  });
});

describe("fetchPage (integration with mocks)", () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("throws 422 for non-HTML content type", async () => {
    const mockResponse = {
      headers: new Map([["content-type", "application/json"]]),
      text: async () => '{"ok":true}',
      status: 200,
    };
    global.fetch = jest.fn().mockResolvedValue(mockResponse);

    const { fetchPage } = require("../src/services/fetcher");

    await expect(fetchPage("https://example.com/data.json")).rejects.toMatchObject({
      statusCode: 422,
      message: expect.stringContaining("application/json"),
    });
  });

  test("throws 408 on timeout", async () => {
    jest.useFakeTimers();
    global.fetch = jest.fn((url, { signal }) => new Promise((_, reject) => {
      signal.addEventListener("abort", () => {
        const err = new Error("aborted");
        err.name = "AbortError";
        reject(err);
      });
    }));

    const { fetchPage } = require("../src/services/fetcher");

    const promise = fetchPage("https://example.com");
    jest.advanceTimersByTime(10000);
    await expect(promise).rejects.toMatchObject({
      statusCode: 408,
      message: expect.stringContaining("timed out"),
    });

    jest.useRealTimers();
  });
});