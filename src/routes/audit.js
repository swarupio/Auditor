const express = require("express");
const { validateUrl } = require("../services/validator");
const { fetchPage } = require("../services/fetcher");
const { parseHtml } = require("../services/parser");
const { buildReport } = require("../services/formatter");

const router = express.Router();

router.post("/audit", async (req, res) => {
  try {
    const validation = validateUrl(req.body?.url);
    if (!validation.valid) {
      return res.status(validation.status).json({ error: validation.error });
    }

    const fetched = await fetchPage(req.body.url);

    const parsed = parseHtml(fetched.html);
    const report = buildReport(fetched.httpStatus, fetched.responseTimeMs, parsed);

    return res.json(report);
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ error: err.message });
    }
    console.error("Unexpected error:", err);
    return res.status(502).json({ error: "Unexpected server error while fetching the page" });
  }
});

module.exports = router;