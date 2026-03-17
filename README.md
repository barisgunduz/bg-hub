<p align="center">
  <img src="logo.svg" width="128" height="128" alt="BG Hub (Appétit)">
</p>

<h1 align="center">BG Hub (Appétit)</h1>

<p align="center">
  <em>My precious apps.</em><br>
  An App Store-inspired catalog for your projects — powered by a single JSON file.
</p>

<p align="center">
  <a href="https://hub.barisgunduz.com">Live Demo</a> ·
  <a href="#quick-start">Quick Start</a> ·
  <a href="#make-it-yours">Make It Yours</a>
</p>

---

BG Hub (<a href="https://github.com/f/appetit">Originally Appétit</a>) is a beautiful, browsable app catalog that looks and feels like the Apple App Store. It's built entirely with vanilla HTML, CSS, and JS — no frameworks, no build step, no dependencies. Just edit `apps.json` and deploy.

## Features

- **App Store UI** — Sidebar navigation, featured carousel, app cards, detail pages with screenshots
- **Dark & Light themes** — System preference detection with manual toggle, persisted in localStorage
- **JSON-driven** — All apps, categories, and featured items defined in a single `apps.json`
- **Install modals** — `brew install` and `npx` commands with one-click copy to clipboard
- **Categories** — macOS, Web, CLI, Developer Tools, Productivity (or define your own)
- **Search** — Instant client-side filtering across names, descriptions, and features
- **GitHub stats** — Live star and fork counts, updatable with the included `update-stats.sh` script
- **Responsive** — Desktop sidebar collapses on mobile
- **Zero dependencies** — Pure HTML/CSS/JS, deploys anywhere as static files

## Quick Start

```bash
git clone https://github.com/barisgunduz/bg-hub.git
cd bg-hub
npx serve -s . -l 8080
```

Open [localhost:8080](http://localhost:8080) and you're running.

Use an SPA-aware static server so clean URLs like `/web` resolve correctly on refresh and direct visits.

## Make It Yours

### 1. Add your apps

Edit `apps.json`. Each app entry supports:

```jsonc
{
  "id": "my-app",
  "name": "My App",
  "subtitle": "A short tagline",
  "description": "One-liner for list views.",
  "longDescription": "Full description for the detail page.",
  "icon": "https://example.com/icon.png",   // or use iconEmoji: "🚀"
  "iconStyle": { "scale": 1.3, "objectFit": "cover", "borderRadius": "22%" },
  "category": ["macos", "cli"],
  "platform": "macOS",
  "price": "Free",
  "github": "https://github.com/you/my-app",
  "homepage": "https://my-app.dev",
  "language": "Swift",
  "stars": 42,
  "forks": 3,
  "brew": "brew install you/tap/my-app",    // shows install modal
  "installCommand": "npx my-app",           // alternative install modal
  "downloadUrl": "https://github.com/you/my-app/releases/latest",
  "requirements": "macOS 15+",
  "features": ["Feature one", "Feature two"],
  "screenshots": ["https://example.com/screenshot.png"]
}
```

### 2. Configure categories

```json
"categories": [
  { "id": "macos", "name": "macOS Apps" },
  { "id": "cli", "name": "CLI Tools" },
  { "id": "web", "name": "Web Apps" }
]
```

### 3. Set featured apps

```json
"featured": [
  {
    "id": "my-app",
    "headline": "NEW",
    "title": "A catchy headline.",
    "subtitle": "A longer description for the featured banner."
  }
]
```

### 4. Deploy

Push to GitHub and enable Pages — or drop the files on any static host (Netlify, Vercel, Cloudflare Pages, S3, etc).

## Update GitHub Stats

Fetch live star and fork counts from the GitHub API:

```bash
./update-stats.sh
```

For higher rate limits:

```bash
GITHUB_TOKEN=ghp_xxx ./update-stats.sh
```

## File Structure

```
├── index.html          Main HTML shell
├── style.css           All styles (dark + light themes)
├── app.js              Routing, rendering, carousel, modals
├── apps.json           All app data — edit this file
├── logo.svg            App icon / favicon
├── update-stats.sh     Fetches GitHub stars/forks into apps.json
├── CNAME               Custom domain for GitHub Pages
└── .nojekyll           Prevents Jekyll processing
```

## Deploy to GitHub Pages

1. Push to a GitHub repo
2. Settings → Pages → Source: branch `master`, folder `/`
3. *(Optional)* Add a `CNAME` file with your custom domain

## License

MIT
