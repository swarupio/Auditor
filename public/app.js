document.getElementById("auditBtn").addEventListener("click", doAudit);
document.getElementById("urlInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") doAudit();
});

async function doAudit() {
  const url = document.getElementById("urlInput").value.trim();
  const loading = document.getElementById("loading");
  const errorBox = document.getElementById("errorBox");
  const report = document.getElementById("report");

  errorBox.classList.add("hidden");
  report.classList.add("hidden");
  loading.classList.remove("hidden");

  try {
    const res = await fetch("/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });

    const data = await res.json();

    if (!res.ok) {
      showError(data.error || `Server error (${res.status})`);
      return;
    }

    renderReport(data);
  } catch (err) {
    showError("Network error — could not reach the server");
  } finally {
    loading.classList.add("hidden");
  }
}

function showError(msg) {
  const el = document.getElementById("errorBox");
  el.textContent = msg;
  el.classList.remove("hidden");
}

function renderReport(data) {
  const fields = [
    ["HTTP Status", data.httpStatus],
    ["Response Time", data.responseTimeMs + " ms"],
    ["Page Title", data.pageTitle],
    ["Meta Description", data.metaDescription || "(empty)"],
    ["H1 Count", data.h1Count],
    ["Images Missing Alt", data.imagesMissingAlt],
    ["Approx. Word Count", data.approximateWordCount],
  ];

  const tbody = document.getElementById("reportBody");
  tbody.innerHTML = fields
    .map(([label, value]) => `<tr><td>${label}</td><td>${value}</td></tr>`)
    .join("");

  document.getElementById("report").classList.remove("hidden");
}