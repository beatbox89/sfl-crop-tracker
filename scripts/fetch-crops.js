// fetch-crops.js
// Kumukuha ng P2P crop prices mula sa sfl.world API at ina-append sa data/crop-history.json
// Ginagamit ni GitHub Actions ito araw-araw (see .github/workflows/daily-fetch.yml)

const fs = require("fs");
const path = require("path");

const API_URL = "https://sfl.world/api/v1/prices";
const DATA_FILE = path.join(__dirname, "..", "data", "crop-history.json");

// Ito yung listahan ng crops na tra-track natin.
// Kunin lang natin ang mga ito mula sa buong "p2p" object (na may resources/animal products din).
const CROPS = [
  // Basic crops (crop plots)
  "Sunflower", "Potato", "Pumpkin", "Carrot", "Cabbage", "Beetroot",
  "Cauliflower", "Parsnip", "Radish", "Wheat", "Kale", "Barley",
  // Fruits (fruit patch)
  "Apple", "Blueberry", "Orange", "Banana", "Tomato", "Lemon",
  // Greenhouse crops
  "Rice", "Grape", "Olive", "Soybean",
  // Island / cave crops
  "Eggplant", "Corn", "Rhubarb", "Zucchini", "Yam", "Broccoli",
  "Pepper", "Onion", "Turnip", "Artichoke",
  // Mutant / special crops
  "Duskberry", "Lunara", "Celestine",
];

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

  // I-filter lang yung crops na nasa CROPS list natin
  const cropPrices = {};
  const missing = [];
  for (const crop of CROPS) {
    if (p2p[crop] !== undefined) {
      cropPrices[crop] = p2p[crop];
    } else {
      missing.push(crop);
    }
  }

  if (missing.length > 0) {
    console.warn(`⚠️  Hindi nakita sa API response: ${missing.join(", ")}`);
  }

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
  const entry = { date: today, fetchedAt: new Date().toISOString(), prices: cropPrices };

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

  console.log(`✅ Na-save sa ${DATA_FILE}. Total entries: ${history.length}`);
}

main().catch((err) => {
  console.error("❌ Error habang kumukuha ng crop prices:", err.message);
  process.exit(1);
});
