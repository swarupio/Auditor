const cheerio = require("cheerio");

function parseHtml(html) {
  const $ = cheerio.load(html);

  const pageTitle = $("title").first().text().trim();

  const metaDescription = $('meta[name="description"]').attr("content") || "";

  const h1Count = $("h1").length;

  let imagesMissingAlt = 0;
  $("img").each((_, img) => {
    const alt = $(img).attr("alt");
    if (alt === undefined || alt.trim() === "") {
      imagesMissingAlt++;
    }
  });

  $("script, style, noscript, svg, code, pre").remove();
  const bodyText = $("body").text();
  const words = bodyText
    .replace(/[\r\n\t]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(w => w.length > 0);
  const approximateWordCount = words.length;

  return {
    pageTitle,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    approximateWordCount,
  };
}

module.exports = { parseHtml };