name: Daily Crop Price Fetch

on:
  schedule:
    # 00:00 UTC = 8:00 AM Philippine time. Baguhin kung gusto mo ng ibang oras.
    - cron: "0 0 * * *"
  workflow_dispatch: {} # para ma-trigger manually sa Actions tab (for testing)

permissions:
  contents: write

jobs:
  fetch-prices:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20"

      - name: Fetch crop prices
        run: node scripts/fetch-crops.js

      - name: Fetch NFT prices
        run: node scripts/fetch-nfts.js

      - name: Commit and push updated data
        run: |
          git config user.name "sfl-crop-tracker-bot"
          git config user.email "actions@github.com"
          git add data/crop-history.json data/nft-history.json
          git diff --staged --quiet && echo "Walang pagbabago, skip commit." || (git commit -m "chore: daily price update $(date -u +'%Y-%m-%d')" && git push)
