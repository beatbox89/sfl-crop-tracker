// fetch-crops.js
// Kumukuha ng LAHAT ng P2P item prices mula sa sfl.world API at ina-append sa data/crop-history.json
// (crops, resources, animal products — buong laman ng "p2p" object)
// Ginagamit ni GitHub Actions ito araw-araw (see .github/workflows/daily-fetch.yml)

const fs = require("fs");
const path = require("path");

const API_URL = "https://sfl.world/api/v1/prices";
const DATA_FILE = path.join(__dirname, "..", "data", "crop-history.json");

async function main() {
  console.log(`[${new Date().toISOString()}] Fetching prices from ${API_URL}...`);

  const res = await fetch(API_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SFL-Crop-Tracker/1.0; personal use)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const json = await res.json();
  const p2p = json?.data?.p2p;

  if (!p2p) {
    throw new Error("Unexpected API response shape — walang data.p2p field.");
  }

  // Kunin lahat ng items sa p2p object (crops, resources, animal products, atbp.)
  const allPrices = { ...p2p };

  // Petsa base sa UTC (para consistent yung "araw" kahit saan tumakbo yung Action)
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // I-load yung existing history, o gumawa ng bago kung wala pa
  let history = [];
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, "utf-8").trim();
    if (raw) {
      history = JSON.parse(raw);
    }
  }

  // Kung may entry na para sa araw na ito, i-overwrite (idempotent — safe mag-rerun)
  const existingIndex = history.findIndex((entry) => entry.date === today);
  const entry = { date: today, fetchedAt: new Date().toISOString(), prices: allPrices };

  if (existingIndex >= 0) {
    history[existingIndex] = entry;
    console.log(`Na-update ang entry para sa ${today}.`);
  } else {
    history.push(entry);
    console.log(`Bagong entry idinagdag para sa ${today}.`);
  }

  // Siguraduhing pataas ang pagkakasunod-sunod base sa petsa
  history.sort((a, b) => (a.date > b.date ? 1 : -1));

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(history, null, 2) + "\n");

  console.log(`Nakuha: ${Object.keys(allPrices).length} items mula sa API.`);
}

main().catch((err) => {
  console.error("❌ Error habang kumukuha ng crop prices:", err.message);
  process.exit(1);
});
