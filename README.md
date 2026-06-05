# MUTTCLIFFE CFL — live board

React (Vite) site that reads your CFL 2026 bet log straight from Google Sheets.
All files live at the root (no `src/` folder).

## Optional, not required to deploy
In `config.js`, set `HANDLE` and `LIVE_URL` to your real values. The board works
without this — they only change the footer/recap label. The spreadsheet ID is
already wired in.

## Deploy
This repo is connected to Vercel. Once these files are in the repo, Vercel
redeploys automatically. To run locally instead: `npm install` then `npm run dev`.

## Requirement
The sheet must stay shared **Anyone with the link → Viewer**.
