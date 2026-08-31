// fetch-nfts.js
// Kumukuha ng floor prices ng NFT collectibles at wearables mula sa sfl.world API
// at ina-append sa data/nft-history.json. Tumatakbo kasabay ng crop fetch
// (see .github/workflows/daily-fetch.yml)

const fs = require("fs");
const path = require("path");

const API_URL = "https://sfl.world/api/v1/nfts";
const DATA_FILE = path.join(__dirname, "..", "data", "nft-history.json");

async function main() {
  console.log(`[${new Date().toISOString()}] Fetching NFT prices from ${API_URL}...`);

  const res = await fetch(API_URL, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; SFL-Crop-Tracker/1.0; personal use)",
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`API request failed: ${res.status} ${res.statusText}`);
  }

  const raw = await res.json();
  // Puwedeng direktang array ang response, o naka-wrap sa "data"
  const items = Array.isArray(raw) ? raw : Array.isArray(raw?.data) ? raw.data : null;

  if (!items) {
    throw new Error("Unexpected API response shape — hindi array ang laman.");
  }

  // I-map, key by item name — floor price, last sale price, at collection type
  const snapshot = {};
  for (const it of items) {
    if (!it || !it.name) continue;
    snapshot[it.name] = {
      collection: it.collection || "unknown",
      floor: it.floor ?? null,
      lastSalePrice: it.lastSalePrice ?? null,
      supply: it.supply ?? null,
    };
  }

  const today = new Date().toISOString().slice(0, 10);

  let history = [];
  if (fs.existsSync(DATA_FILE)) {
    const fileRaw = fs.readFileSync(DATA_FILE, "utf-8").trim();
    if (fileRaw) history = JSON.parse(fileRaw);
  }

  const existingIndex = history.findIndex((entry) => entry.date === today);
  const entry = { date: today, fetchedAt: new Date().toISOString(), items: snapshot };

  if (existingIndex >= 0) {
    history[existingIndex] = entry;
    console.log(`Na-update ang NFT entry para sa ${today}.`);
  } else {
    history.push(entry);
    console.log(`Bagong NFT entry idinagdag para sa ${today}.`);
  }

  history.sort((a, b) => (a.date > b.date ? 1 : -1));

  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(history, null, 2) + "\n");

  console.log(`Nakuha: ${Object.keys(snapshot).length} NFT items mula sa API.`);
}

main().catch((err) => {
  console.error("❌ Error habang kumukuha ng NFT prices:", err.message);
  process.exit(1);
});
