# JARC Academy — CHEM8+ Fill Challenge

A **static GitHub Pages game** built with plain HTML, CSS and JavaScript. There is no build step, no framework and no Google Apps Script requirement.

## Deploy to GitHub Pages
1. Create a new GitHub repository, such as `jarc-chem8-challenge`.
2. Upload all project files: `index.html`, `styles.css`, `script.js`, and the `assets` folder (including `chem8-cartridge.jpg`). Keep their folder paths unchanged.
3. In the repository, go to **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**, select `main` and `/ (root)`, then save.
5. Open the GitHub Pages URL displayed in Settings → Pages after deployment.

## Gameplay
- Click **Start Challenge**.
- Drag the syringe barrel until its **needle tip** is centered on the highlighted sample-port target.
- Drag the connected **plunger cap** downward, then release within the green fill band.
- Each good fill = 1 point. Underfill, overfill or an extremely fast push ends the run.
- The aiming zone starts generously at 26 SVG units and gradually tightens to 16 units. Fill target starts at 70–87% and gradually narrows to 76–84%. These are fictional gameplay values, **not clinical specimen volumes**.

## Leaderboard limitation
The Top 5 leaderboard and personal best are stored locally in that browser's `localStorage`. This does not sync across phones or computers. A public event-wide leaderboard needs an external database/serverless backend (such as Firebase or Supabase) with anti-cheat protections.

## Assets and rights
The cartridge photograph was supplied in the chat and is included in `assets/chem8-cartridge.jpg` so it loads reliably on GitHub Pages. Confirm reuse/redistribution rights for public publishing. The header is JARC-inspired styling, not a verified official logo asset. For official branding replace the text-based brand mark with your approved logo.

This is a recreational arcade simulation, not clinical training or instructions for real i-STAT cartridge handling.
