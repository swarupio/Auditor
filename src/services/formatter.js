function buildReport(httpStatus, responseTimeMs, parsed) {
  return {
    httpStatus,
    responseTimeMs,
    pageTitle: parsed.pageTitle,
    metaDescription: parsed.metaDescription,
    h1Count: parsed.h1Count,
    imagesMissingAlt: parsed.imagesMissingAlt,
    approximateWordCount: parsed.approximateWordCount,
  };
}

module.exports = { buildReport };