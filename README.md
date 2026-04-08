[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/hl3jCjv_)
# CDF AI Engineering Hackathon

**Live URL:** `TBD - add Vercel deployment URL`

Welcome! This is your personal repository for the CDF AI Engineering Hackathon. The problem statement is included in this repo - read it carefully before you start.

---

## 📋 Problem Statement

See [`PROBLEM_STATEMENT.md`](./PROBLEM_STATEMENT.md) for the full brief.

---

## 🗂️ Repo Structure

```
├── README.md               # This file — live URL and submission checklist
├── PROBLEM_STATEMENT.md    # Full hackathon brief
├── planning/
│   └── PLANNING.md         # Your planning document (fill this out first)
├── src/                    # Your application code goes here
└── docs/
    ├── walkthrough.md      # Link to your 5-minute walkthrough video
    ├── architecture.md     # Your architecture overview
    └── reflection.md       # What you built, tradeoffs, AI tools used
```

---

## 🚀 Getting Started

1. Install dependencies:
   - `npm install`
2. Create `.env.local` with:
   - `VITE_EIA_API_KEY=...`
   - `VITE_NREL_API_KEY=...`
   - `VITE_GEMINI_API_KEY=...`
   - `VITE_MAPBOX_TOKEN=...`
3. Run locally:
   - `npm run dev`
4. Build for production:
   - `npm run build`
5. Preview production build:
   - `npm run preview`

## ☁️ Vercel Deployment

1. Import this repo into Vercel.
2. Set Framework Preset to `Vite` (auto-detected in most cases).
3. Add the same environment variables from `.env.local` in Vercel Project Settings.
4. Deploy and verify all four tabs load with live API data.
5. Replace the `Live URL` line at the top of this README with the deployed URL.

---

## 📦 Submission Checklist

Push to your GitHub Classroom repository before **April 12, 2026 at 1:00 PM EST**. Your repo state at the deadline is your submission.

- [ ] Live deployment URL added at the top of this README — **mandatory**
- [ ] Completed planning document in `planning/PLANNING.md`
- [ ] Working application in `src/`
- [ ] `docs/walkthrough.md` — walkthrough video link filled in
- [ ] `docs/architecture.md` — architecture overview filled in
- [ ] `docs/reflection.md` — reflection filled in
- [ ] Clean commit history — see note below

---

## 📝 A Note on Commit History

Your git commit history is part of the evaluation. Here is what a clean history looks like:

- **Commit regularly** — at least once per meaningful chunk of work (e.g. "Add IRR calculation", "Integrate EIA API", "Build map tab")
- **Write descriptive messages** — not "fix", "update", or "asdf". A good message tells someone what changed and why
- **Do not squash everything into one commit** at the end — we should be able to follow your progress through the history
- **Do not commit API keys, `.env` files, or `node_modules`** — use `.gitignore`

Think of your commit history as a log of how you think and work, not just a save button.

---
