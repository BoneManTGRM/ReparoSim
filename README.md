# 🎮 ReparoSim — Interactive Reparodynamics Simulator (TGRM vs Retrain)

**Author:** Cody R. Jenkins — Open Science Reparodynamics Initiative  
**Version:** v1.0 (October 2025)  
**License:** MIT

ReparoSim is a **browser-based** demo of Reparodynamics. It shows how the **Targeted Gradient Repair Mechanism (TGRM)** restores a degraded system under an **energy budget**, compared to a heavier **retrain** baseline.

## ▶️ Run the Simulator (GitHub Pages)
**Live:** https://bonemantgrm.github.io/ReparoSim/simulator/

If the link 404s, wait a minute for Pages to build or see “Enable GitHub Pages” below.

## What you’ll see
- **Accuracy over time** (recovery)
- **Energy usage** (proxy)
- **BPI** (Bounded Power Index = performance gain / energy)
- **Final Accuracy vs Energy** (scatter)

## Controls
- **Steps** (simulation length)
- **Fault level** (amount of degradation/noise)
- **Top-K%** (fraction of parameters TGRM repairs)
- **k_repair** (repair pulse intensity)

## Enable GitHub Pages (once)
1. Repo → **Settings → Pages**
2. **Build and deployment:** “GitHub Actions”
3. Wait ~1 minute. Your simulator will be live at  
   `https://bonemantgrm.github.io/ReparoSim/simulator/`

*(This repo already includes a workflow in `.github/workflows/pages.yml` to auto-build Pages.)*

## Local preview (optional)
Just open `simulator/index.html` in a browser (no server needed).

## Theory (very short)
- **TGRM** targets the most salient components (top-K%) and applies **bounded** repair pulses with **diminishing returns**.  
- We track **energy** as a proxy (magnitude of updates/effort) and optimize **BPI** (stability gained per energy).

## Contributing
PRs welcome! Add new fault modes, visualizations, or export buttons (CSV/PNG).

© 2025 Cody R. Jenkins — Open Science Reparodynamics Initiative. MIT License.
