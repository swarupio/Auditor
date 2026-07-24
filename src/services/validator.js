function validateUrl(url) {
  if (!url || typeof url !== "string") {
    return { valid: false, status: 400, error: "Missing or invalid 'url' field in request body" };
  }
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, status: 400, error: "URL must use http or https protocol" };
    }
    return { valid: true };
  } catch {
    return { valid: false, status: 400, error: `Malformed URL: "${url}" is not a valid URL` };
  }
}

module.exports = { validateUrl };