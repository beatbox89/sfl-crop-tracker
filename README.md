# 🌾 SFL Crop Tracker

Personal na daily price tracker para sa P2P marketplace prices ng crops sa Sunflower Land — kinukuha mula sa [sfl.world](https://sfl.world) API.

## Paano gumagana

1. **GitHub Actions** — tumatakbo araw-araw (o kahit kailan mo gustong i-trigger manually), tumatawag sa `sfl.world/api/v1/prices`, kinukuha yung crop prices, at ida-dagdag sa `data/crop-history.json`.
2. **GitHub Pages** — sina-serve ang `index.html`, na nagbabasa ng `crop-history.json` at nagpapakita ng chart + table.

Walang server na kailangan patakbuhin, walang babayaran — pareho itong libre sa GitHub.

## 🚀 Setup (isang beses lang)

### 1. I-upload sa GitHub
- Gumawa ng bagong repository (hal. `sfl-crop-tracker`) sa GitHub mo — **public** dapat para gumana ang libreng GitHub Pages.
- I-upload/i-push lahat ng files dito (kasama ang `.github` folder — importante ito, hindi nakikita minsan kapag drag-and-drop lang sa web UI, siguraduhing kasama).

Kung gagamit ka ng git command line:
```bash
cd sfl-crop-tracker
git init
git add .
git commit -m "initial setup"
git branch -M main
git remote add origin https://github.com/USERNAME/sfl-crop-tracker.git
git push -u origin main
```

### 2. I-enable ang GitHub Pages
- Sa repo mo → **Settings** → **Pages**
- Sa "Build and deployment" → Source: **Deploy from a branch**
- Branch: **main**, folder: **/ (root)**
- I-save. Makukuha mo yung URL (hal. `https://USERNAME.github.io/sfl-crop-tracker/`)

### 3. I-enable ang Actions permissions
- Settings → **Actions** → **General**
- Sa ilalim ng "Workflow permissions", piliin: **Read and write permissions**
- I-save (kailangan ito para maka-auto-commit yung script ng updated data)

### 4. I-test muna manually
- Pumunta sa **Actions** tab ng repo mo
- Piliin yung "Daily Crop Price Fetch" workflow
- Click **Run workflow** (manual trigger, hindi na kailangan hintayin yung schedule)
- Tignan kung successful — kung oo, may bagong commit sa `data/crop-history.json`

### 5. Tignan yung dashboard
- Buksan yung GitHub Pages URL mo — makikita mo na yung chart (kahit 1 araw pa lang ang data, lalago ito araw-araw)

## 🕒 Automation Schedule
Naka-set sa `0 0 * * *` (00:00 UTC = 8:00 AM Philippine time) — puwede mong baguhin sa `.github/workflows/daily-fetch.yml` kung gusto mo ng ibang oras.

## 🧪 Local Testing (opsyonal)
Kung gusto mong subukan muna sa sarili mong computer bago i-upload:
```bash
node scripts/fetch-crops.js
```
Kailangan ng Node.js v18+ (may built-in `fetch`).

## 📂 Structure
```
sfl-crop-tracker/
├── data/crop-history.json          ← daily records (auto-updated)
├── scripts/fetch-crops.js          ← fetch + append script
├── .github/workflows/daily-fetch.yml ← automation
├── index.html                       ← dashboard
└── README.md
```

## ⚠️ Disclaimer
Personal use lang ito, hindi opisyal na produkto ng Sunflower Land/Thought Farm. Ang mga presyo ay hango sa P2P marketplace listings, hindi ito financial advice.
