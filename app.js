(function () {
  var saved = localStorage.getItem("theme");
  if (!saved) saved = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", saved);
})();

(function () {
  "use strict";

  let data = null;
  let currentView = "discover";
  let currentApp = null;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const icons = {
    discover: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    macos: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    web: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>`,
    "developer-tools": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`,
    "chrome-extensions": `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="2.5"/><path d="M12 4a8 8 0 0 1 6.93 4H12"/><path d="M5.07 8A8 8 0 0 0 12 20l3.46-6"/><path d="M12 4 8.54 10H1.61"/></svg>`,
    cli: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>`,
    games: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="2" y="6" width="20" height="12" rx="3"/><line x1="6" y1="10" x2="6" y2="14"/><line x1="4" y1="12" x2="8" y2="12"/><circle cx="16" cy="10" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>`,
    mobile: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="7" y="2" width="10" height="20" rx="2"/><line x1="11" y1="18" x2="13" y2="18"/></svg>`,
    content: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/><path d="M15.5 3v5l-2-1.4L11.5 8V3"/></svg>`,
    productivity: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>`,
    tribute: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-6.5-3.9-8.5-8.1C1.8 9.3 4 5.5 7.8 5.5c1.8 0 3.1.8 4.2 2.2 1.1-1.4 2.4-2.2 4.2-2.2 3.8 0 6 3.8 4.3 7.4C18.5 17.1 12 21 12 21z"/><path d="M9 4.5h6"/></svg>`,
    github: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>`,
  };

  function fallbackCategoryIcon() {
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="4" width="7" height="7" rx="1.5"/><rect x="13" y="4" width="7" height="7" rx="1.5"/><rect x="4" y="13" width="7" height="7" rx="1.5"/><rect x="13" y="13" width="7" height="7" rx="1.5"/></svg>`;
  }

  function getCategoryIcon(categoryId) {
    return icons[categoryId] || fallbackCategoryIcon();
  }

  const socialIcons = {
    github: icons.github,
    x: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.56 7.498L22.154 22H16.11l-4.734-6.797L5.43 22H2.67l7.015-8.017L2.308 2H8.51l4.28 6.16L18.244 2zm-2.12 18h1.527L7.68 3.894H6.042L16.124 20z"/></svg>`,
    twitter: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2H21l-6.56 7.498L22.154 22H16.11l-4.734-6.797L5.43 22H2.67l7.015-8.017L2.308 2H8.51l4.28 6.16L18.244 2zm-2.12 18h1.527L7.68 3.894H6.042L16.124 20z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>`,
    youtube: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23 12s0-3.1-.4-4.6a3 3 0 0 0-2.1-2.1C19 5 12 5 12 5s-7 0-8.5.4A3 3 0 0 0 1.4 7.4C1 8.9 1 12 1 12s0 3.1.4 4.6a3 3 0 0 0 2.1 2.1C5 19 12 19 12 19s7 0 8.5-.4a3 3 0 0 0 2.1-2.1C23 15.1 23 12 23 12z"/><path d="M10 15.5v-7l6 3.5-6 3.5z" fill="#fff"/></svg>`,
    tiktok: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 2c.4 1.9 1.5 3.4 3.5 4.1v3a7.2 7.2 0 0 1-3.5-1v6.1a6.1 6.1 0 1 1-6.1-6.1c.3 0 .7 0 1 .1v3.1a2.9 2.9 0 1 0 1.9 2.8V2h3.2z"/></svg>`,
    linkedin: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.94 8.5H3.56V20h3.38V8.5zM5.25 3A1.96 1.96 0 1 0 5.3 6.9 1.96 1.96 0 0 0 5.25 3zM20.44 13.04c0-3.46-1.85-5.07-4.31-5.07-1.99 0-2.88 1.1-3.38 1.87V8.5H9.38c.05.89 0 11.5 0 11.5h3.37v-6.42c0-.34.02-.68.13-.92.27-.67.9-1.36 1.95-1.36 1.38 0 1.93 1.02 1.93 2.52V20h3.38v-6.96z"/></svg>`,
    discord: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.3 4.37A16.9 16.9 0 0 0 16.1 3l-.2.4a15.5 15.5 0 0 1 3.8 1.8 12 12 0 0 0-3.5-1.7 11.8 11.8 0 0 0-4.2-.4 12 12 0 0 0-4.1.4A12 12 0 0 0 4.4 5.2 15.4 15.4 0 0 1 8.1 3.4L8 3A16.8 16.8 0 0 0 3.7 4.37C1.1 8.2.4 11.95.7 15.65A17 17 0 0 0 5.8 18l1.1-1.8c-.6-.2-1.2-.5-1.7-.8.1.1.3.2.4.2 3.2 1.5 6.8 1.5 10 0l.4-.2c-.5.3-1.1.6-1.7.8l1.1 1.8a17 17 0 0 0 5.1-2.35c.4-4.3-.7-8.02-2.2-11.28zM9.55 13.4c-.97 0-1.76-.9-1.76-2s.78-2 1.76-2c.98 0 1.77.9 1.76 2 0 1.1-.78 2-1.76 2zm4.9 0c-.97 0-1.76-.9-1.76-2s.78-2 1.76-2c.98 0 1.77.9 1.76 2 0 1.1-.78 2-1.76 2z"/></svg>`,
    twitch: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 2 2 6v14h5v3l3-3h4l8-8V2H4zm16 9-4 4h-4l-3 3v-3H5V4h15v7z"/><path d="M13 7h2v5h-2zM17 7h2v5h-2z" fill="#fff"/></svg>`,
  };

  function formatSocialLabel(type) {
    if (type === "x") return "X";
    return type.replace(/[-_]/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function getSocialEntries(app) {
    if (!app.socials) return [];

    if (Array.isArray(app.socials)) {
      return app.socials
        .map((social) => {
          if (!social || !social.url) return null;
          const type = (social.type || social.id || social.name || "").toLowerCase();
          return type ? { type, url: social.url, label: social.label || formatSocialLabel(type) } : null;
        })
        .filter(Boolean);
    }

    return Object.entries(app.socials)
      .filter(([, url]) => typeof url === "string" && url.trim())
      .map(([type, url]) => ({
        type: type.toLowerCase(),
        url,
        label: formatSocialLabel(type.toLowerCase()),
      }));
  }

  function renderSocials(app) {
    const entries = getSocialEntries(app);
    if (entries.length === 0) return "";

    return `
            <div class="info-item">
              <span class="info-label">Socials</span>
              <span class="info-value social-links">${entries.map((social) => `
                <a
                  href="${social.url}"
                  target="_blank"
                  rel="noopener"
                  class="social-link"
                  aria-label="${social.label}"
                  title="${social.label}"
                >
                  ${socialIcons[social.type] || fallbackCategoryIcon()}
                </a>
              `).join("")}</span>
            </div>`;
  }

  const cardGradientsDark = [
    ["#1a1a2e", "#16213e", "#0f3460"],
    ["#1a1a1a", "#2d132c", "#3a1c3f"],
    ["#0d1117", "#161b22", "#1a2332"],
    ["#1a1a2e", "#0a3d62", "#1e5f74"],
    ["#1a0a2e", "#2b1055", "#3c1053"],
    ["#0a2e1a", "#0b4228", "#165a3a"],
  ];

  const cardGradientsLight = [
    ["#d4e4f7", "#c5d8f0", "#a8c4e0"],
    ["#e8daf0", "#dcc8e8", "#ccb0dc"],
    ["#d6e2ef", "#c8d8e8", "#b8cade"],
    ["#d0e8ee", "#b8dce6", "#a0d0dc"],
    ["#ddd4f0", "#cec0e8", "#baa8dc"],
    ["#d0ead8", "#b8dcc4", "#a0d0b0"],
  ];

  function getCardGradients() {
    return document.documentElement.getAttribute("data-theme") === "light"
      ? cardGradientsLight
      : cardGradientsDark;
  }

  function formatNumber(n) {
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
    return String(n);
  }

  function getOwner(app) {
    return app.owner || app.developer || data.store.owner || data.store.developer || "";
  }

  function iconStyle(app) {
    const s = app.iconStyle || {};
    const parts = [];
    if (s.scale) parts.push(`transform:scale(${s.scale})`);
    if (s.objectFit) parts.push(`object-fit:${s.objectFit}`);
    if (s.padding) parts.push(`padding:${s.padding}`);
    return parts.join(";");
  }

  function iconContainerStyle(app) {
    const s = app.iconStyle || {};
    const parts = [];
    if (s.bgColor) parts.push(`background:${s.bgColor}`);
    if (s.borderRadius) parts.push(`border-radius:${s.borderRadius}`);
    return parts.length ? ` style="${parts.join(";")}"` : "";
  }

  function renderIcon(app) {
    if (app.icon) {
      const imgSt = iconStyle(app);
      const st = imgSt ? ` style="${imgSt}"` : "";
      return `<img src="${app.icon}" alt="${app.name}"${st} onerror="this.parentElement.innerHTML='${app.iconEmoji || "📦"}'">`;
    }
    return app.iconEmoji || "📦";
  }

  function starBadge(stars) {
    return `<span class="star-count"><svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>${formatNumber(stars)}</span>`;
  }

  function isPaidApp(app) {
    return app.price && app.price !== "Free" && app.price !== "free";
  }

  function getBuyUrl(app) {
    return app.buyUrl || app.homepage || app.github;
  }

  function getButtonLabel(app) {
    if (isPaidApp(app)) return app.price;
    if (app.brew || app.downloadUrl || app.installCommand) return "Get";
    return "View";
  }

  function appRow(app) {
    const owner = getOwner(app);
    return `
      <div class="app-row" data-app="${app.id}">
        <div class="app-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
        <div class="app-info">
          <div class="app-name-row">
            <div class="app-name">${app.name}</div>
            ${owner ? `<span class="app-meta-tag app-owner-tag">${owner}</span>` : ""}
          </div>
          <div class="app-subtitle">${app.subtitle}</div>
          <div class="app-meta">
            <span class="app-meta-tag">${app.platform}</span>
            ${app.stars ? starBadge(app.stars) : ""}
          </div>
        </div>
        <button class="get-btn${isPaidApp(app) ? " buy-btn" : ""}" data-action="get" data-app="${app.id}">${getButtonLabel(app)}</button>
      </div>`;
  }

  function appCard(app, index) {
    const grads = getCardGradients();
    const g = grads[index % grads.length];
    const hasScreenshot = app.screenshots && app.screenshots.length > 0;
    const screenshotImg = hasScreenshot
      ? `<img class="card-screenshot" src="${app.screenshots[0]}" alt="${app.name}" loading="lazy">`
      : "";
    return `
      <div class="card" data-app="${app.id}">
        <div class="card-image">
          <div class="card-image-bg" style="background:linear-gradient(135deg, ${g[0]}, ${g[1]}, ${g[2]})">
            ${screenshotImg}
            <div class="card-icon-fallback">${app.icon ? `<img src="${app.icon}" style="width:80px;height:80px;border-radius:18px;${iconStyle(app)}" onerror="this.outerHTML='📦'">` : (app.iconEmoji || "📦")}</div>
          </div>
        </div>
        <div class="card-body">
          <div class="card-label">${app.platform === "macOS" ? "macOS APP" : app.platform === "Web" ? "WEB APP" : "TOOL"}</div>
          <div class="card-title">${app.name}</div>
          <div class="card-subtitle">${app.subtitle}</div>
        </div>
      </div>`;
  }

  // Sidebar
  function buildSidebar() {
    const nav = $("#sidebarNav");
    const items = [
      { id: "discover", name: "Discover", icon: icons.discover },
    ];

    let html = "";
    items.forEach((item) => {
      html += `<div class="nav-item${currentView === item.id ? " active" : ""}" data-view="${item.id}">
        <span class="nav-icon">${item.icon}</span>${item.name}
      </div>`;
    });

    html += `<div class="nav-separator"></div>`;
    html += `<div class="nav-section-label">Categories</div>`;

    const categories = (data.categories || [])
      .filter((cat) => cat.id !== "all")
      .filter((cat) => data.apps.some((app) => app.category.includes(cat.id)))
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        icon: getCategoryIcon(cat.id),
      }));

    categories.forEach((cat) => {
      html += `<div class="nav-item${currentView === cat.id ? " active" : ""}" data-view="${cat.id}">
        <span class="nav-icon">${cat.icon}</span>${cat.name}
      </div>`;
    });

    html += `<div class="nav-separator"></div>`;
    html += `<div class="nav-item" data-view="github">
      <span class="nav-icon">${icons.github}</span>GitHub
    </div>`;

    nav.innerHTML = html;
  }

  function renderFeaturedBanner(f) {
    const app = data.apps.find((a) => a.id === f.id);
    return `
      <div class="featured-banner" data-app="${f.id}">
        <div class="featured-content">
          <div class="featured-label">${f.headline}</div>
          <div class="featured-title">${f.title}</div>
          <div class="featured-subtitle">${f.subtitle}</div>
          ${app ? `
          <div class="featured-app-row">
            <div class="featured-app-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
            <div class="featured-app-info">
              <div class="featured-app-name">${app.name}</div>
              <div class="featured-app-sub">${app.subtitle}</div>
            </div>
            <button class="featured-get-btn${isPaidApp(app) ? " buy-btn" : ""}" data-action="get" data-app="${app.id}">${getButtonLabel(app)}</button>
          </div>` : ""}
        </div>
      </div>`;
  }

  // Discover Page
  function renderDiscover() {
    const apps = data.apps;
    const featuredList = Array.isArray(data.featured) ? data.featured : [data.featured];

    const macosApps = apps.filter((a) => a.category.includes("macos"));
    const devApps = apps.filter((a) => a.category.includes("developer-tools"));
    const gameApps = apps.filter((a) => a.category.includes("games"));
    const tributeApps = apps.filter((a) => a.category.includes("tribute"));

    const dots = featuredList.length > 1
      ? `<div class="carousel-dots">${featuredList.map((_, i) => `<button class="carousel-dot${i === 0 ? " active" : ""}" data-slide="${i}"></button>`).join("")}</div>`
      : "";

    let html = `
      <div class="carousel">
        <div class="carousel-track">
          ${featuredList.map((f) => renderFeaturedBanner(f)).join("")}
        </div>
        ${dots}
      </div>

      <div class="section">
        <div class="section-header">
          <h2>Best New Apps and Updates</h2>
        </div>
        <div class="app-list">
          ${apps.slice(0, 6).map((a) => appRow(a)).join("")}
        </div>
      </div>

      ${(() => {
        const paidApps = apps.filter((a) => isPaidApp(a));
        if (paidApps.length === 0) return "";
        return `
      <div class="section">
        <div class="section-header">
          <h2>Best Paid Apps</h2>
        </div>
        <div class="app-list">
          ${paidApps.map((a) => appRow(a)).join("")}
        </div>
      </div>`;
      })()}

      <div class="section">
        <div class="section-header">
          <h2>The Latest Must-Try Apps</h2>
        </div>
        <div class="cards-grid">
          ${apps.slice(0, 4).map((a, i) => appCard(a, i)).join("")}
        </div>
      </div>

      ${macosApps.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <h2>macOS Apps</h2>
        </div>
        <div class="app-list">
          ${macosApps.map((a) => appRow(a)).join("")}
        </div>
      </div>` : ""}

      ${devApps.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <h2>Developer Tools</h2>
        </div>
        <div class="app-list">
          ${devApps.map((a) => appRow(a)).join("")}
        </div>
      </div>` : ""}

      ${gameApps.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <h2>Games</h2>
        </div>
        <div class="app-list">
          ${gameApps.map((a) => appRow(a)).join("")}
        </div>
      </div>` : ""}

      ${tributeApps.length > 0 ? `
      <div class="section">
        <div class="section-header">
          <h2>Tribute</h2>
        </div>
        <div class="app-list">
          ${tributeApps.map((a) => appRow(a)).join("")}
        </div>
      </div>` : ""}
    `;

    return html;
  }

  // Category Page
  function renderCategory(categoryId) {
    const cat = data.categories.find((c) => c.id === categoryId);
    const apps = data.apps.filter((a) => a.category.includes(categoryId));

    if (apps.length === 0) {
      return `
        <div class="page-header"><h1>${cat ? cat.name : "Category"}</h1></div>
        <div class="empty-state">
          <div class="empty-state-icon">📭</div>
          <h3>No apps yet</h3>
          <p>Check back later for new apps in this category.</p>
        </div>`;
    }

    return `
      <div class="page-header"><h1>${cat ? cat.name : "Category"}</h1></div>
      <div class="app-list">
        ${apps.map((a) => appRow(a)).join("")}
      </div>`;
  }

  // App Detail Page
  function renderAppDetail(appId) {
    const app = data.apps.find((a) => a.id === appId);
    if (!app) return `<div class="empty-state"><h3>App not found</h3></div>`;

    return `
      <div class="app-detail">
        <div class="back-btn" data-action="back">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
          Back
        </div>

        <div class="app-detail-header">
          <div class="app-detail-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
          <div class="app-detail-title-area">
            <div class="app-detail-title">${app.name}</div>
            <div class="app-detail-subtitle">${app.subtitle}</div>
            <div class="app-detail-actions">
              <button class="app-detail-get-btn${isPaidApp(app) ? " buy-btn" : ""}" data-action="get" data-app="${app.id}">
                ${getButtonLabel(app)}
              </button>
              ${app.github ? `
              <a href="${app.github}" target="_blank" rel="noopener" class="github-link">
                ${icons.github} View on GitHub
              </a>` : ""}
            </div>
          </div>
        </div>

        <div class="app-detail-stats">
          ${app.stars !== undefined ? `<div class="stat"><div class="stat-value">${formatNumber(app.stars)}</div><div class="stat-label">Stars</div></div>` : ""}
          ${app.forks !== undefined ? `<div class="stat"><div class="stat-value">${formatNumber(app.forks)}</div><div class="stat-label">Forks</div></div>` : ""}
          <div class="stat"><div class="stat-value">${app.price}</div><div class="stat-label">Price</div></div>
          <div class="stat"><div class="stat-value">${app.platform}</div><div class="stat-label">Platform</div></div>
          <div class="stat"><div class="stat-value">${app.language}</div><div class="stat-label">Language</div></div>
        </div>

        ${app.screenshots && app.screenshots.length > 0 ? `
        <div class="detail-section">
          <h3>Preview</h3>
          <div class="screenshots-scroll">
            ${app.screenshots.map((s) => `<img class="screenshot-img" src="${s}" alt="${app.name} screenshot" loading="lazy">`).join("")}
          </div>
        </div>` : ""}

        <div class="detail-section">
          <h3>Description</h3>
          <p>${app.longDescription || app.description}</p>
        </div>

        ${app.features && app.features.length > 0 ? `
        <div class="detail-section">
          <h3>What's New</h3>
          <ul class="features-list">
            ${app.features.map((f) => `<li>${f}</li>`).join("")}
          </ul>
        </div>` : ""}

        ${app.brew ? `
        <div class="detail-section">
          <div class="brew-section">
            <div class="brew-section-title">Install with Homebrew</div>
            <div class="brew-command" data-copy="${app.brew}">
              <span class="prompt">$</span>
              <span class="cmd">${app.brew}</span>
              <span class="copy-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
            </div>
          </div>
        </div>` : ""}

        ${app.installCommand ? `
        <div class="detail-section">
          <div class="brew-section">
            <div class="brew-section-title">Quick Install</div>
            <div class="brew-command" data-copy="${app.installCommand}">
              <span class="prompt">$</span>
              <span class="cmd">${app.installCommand}</span>
              <span class="copy-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
            </div>
          </div>
        </div>` : ""}

        <div class="detail-section">
          <h3>Information</h3>
          <div class="info-grid">
            <div class="info-item">
              <span class="info-label">Owner</span>
              <span class="info-value">${getOwner(app)}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Compatibility</span>
              <span class="info-value">${app.requirements}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Language</span>
              <span class="info-value">${app.language}</span>
            </div>
            <div class="info-item">
              <span class="info-label">Price</span>
              <span class="info-value">${app.price}</span>
            </div>
            ${renderSocials(app)}
            ${app.github ? `
            <div class="info-item">
              <span class="info-label">Source Code</span>
              <span class="info-value"><a href="${app.github}" target="_blank" rel="noopener">${app.github.replace("https://github.com/", "")}</a></span>
            </div>` : ""}
            ${app.homepage ? `
            <div class="info-item">
              <span class="info-label">Website</span>
              <span class="info-value"><a href="${app.homepage}" target="_blank" rel="noopener">${app.homepage.replace("https://", "")}</a></span>
            </div>` : ""}
          </div>
        </div>
      </div>`;
  }

  // Search results
  function renderSearch(query) {
    const q = query.toLowerCase();
    const results = data.apps.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        a.subtitle.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        (a.features && a.features.some((f) => f.toLowerCase().includes(q)))
    );

    if (results.length === 0) {
      return `
        <div class="page-header"><h1>Search: "${query}"</h1></div>
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3>No results</h3>
          <p>Try a different search term.</p>
        </div>`;
    }

    return `
      <div class="page-header"><h1>Search: "${query}"</h1></div>
      <div class="app-list">
        ${results.map((a) => appRow(a)).join("")}
      </div>`;
  }

  // Router
  let suppressHash = false;

  function buildHash(view, appId) {
    if (appId) return `#/${view}/${appId}`;
    if (view === "discover") return "#/";
    return `#/${view}`;
  }

  function parseHash() {
    const hash = location.hash.replace(/^#\/?/, "");
    if (!hash) return { view: "discover", appId: null };
    const parts = hash.split("/");
    if (parts.length >= 2) return { view: parts[0], appId: parts[1] };
    return { view: parts[0], appId: null };
  }

  function navigate(view, appId, fromHash) {
    if (carouselTimer) { clearInterval(carouselTimer); carouselTimer = null; }
    const scroll = $("#contentScroll");
    scroll.scrollTop = 0;

    if (view === "github") {
      window.open(data.store.github, "_blank");
      return;
    }

    if (appId) {
      currentApp = appId;
      currentView = view;
      scroll.innerHTML = renderAppDetail(appId);
    } else if (view === "discover") {
      currentApp = null;
      currentView = view;
      scroll.innerHTML = renderDiscover();
    } else {
      currentApp = null;
      currentView = view;
      scroll.innerHTML = renderCategory(view);
    }

    if (!fromHash) {
      suppressHash = true;
      location.hash = buildHash(currentView, currentApp);
      suppressHash = false;
    }

    buildSidebar();
    bindEvents();
    updateMobileTopbar();
  }

  function onHashChange() {
    if (suppressHash) return;
    const { view, appId } = parseHash();
    navigate(view || "discover", appId || null, true);
  }

  // Modal
  function showBrewModal(app) {
    const overlay = $("#modalOverlay");
    const modal = $("#modal");
    const command = app.brew || app.installCommand;

    modal.innerHTML = `
      <button class="modal-close" data-action="close-modal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="modal-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
      <h3>Install ${app.name}</h3>
      <p>${app.brew ? "Install via Homebrew with a single command. Make sure you have Homebrew installed on your Mac." : "Run this command to get started."}</p>
      <div class="modal-brew-command" data-copy="${command}">
        <span class="prompt">$</span>
        <span class="cmd">${command}</span>
        <span class="copy-icon"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
      </div>
      <div class="modal-actions">
        <button class="btn-primary" data-action="copy-and-close" data-copy="${command}">Copy Command</button>
        ${app.downloadUrl ? `<a class="btn-secondary" href="${app.downloadUrl}" target="_blank" rel="noopener">${app.downloadUrl.endsWith(".dmg") || app.downloadUrl.includes(".dmg") ? "Download .dmg" : "Download"}</a>` : ""}
      </div>
      ${app.downloadUrl && (app.downloadUrl.endsWith(".dmg") || app.downloadUrl.includes(".dmg")) ? `
      <div style="margin-top:14px;font-size:12px;color:var(--text-tertiary);line-height:1.5">
        If macOS blocks the app on first launch, run:
        <div class="brew-command" style="margin-top:8px;font-size:12px;padding:8px 12px" data-copy="xattr -cr /Applications/${app.name}.app">
          <span class="prompt">$</span>
          <span class="cmd">xattr -cr /Applications/${app.name}.app</span>
          <span class="copy-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg></span>
        </div>
      </div>` : ""}
    `;

    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("visible"));

    overlay.onclick = (e) => {
      if (e.target === overlay || e.target.closest("[data-action='close-modal']")) {
        closeModal();
      }
      if (e.target.closest("[data-copy]")) {
        const cmd = e.target.closest("[data-copy]").dataset.copy;
        copyToClipboard(cmd);
      }
      if (e.target.closest("[data-action='copy-and-close']")) {
        const cmd = e.target.closest("[data-action='copy-and-close']").dataset.copy;
        copyToClipboard(cmd);
        closeModal();
      }
    };
  }

  function showBuyModal(app) {
    const overlay = $("#modalOverlay");
    const modal = $("#modal");
    const url = getBuyUrl(app);
    const storeName = (data.store && data.store.name) || "This store";

    modal.innerHTML = `
      <button class="modal-close" data-action="close-modal">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
      <div class="modal-icon"${iconContainerStyle(app)}>${renderIcon(app)}</div>
      <h3>${app.name}</h3>
      <div class="buy-modal-price">${app.price}</div>
      <p>This is a paid app. You will be redirected to the developer's page to complete your purchase.</p>
      <div class="buy-modal-link">
        <a href="${url}" target="_blank" rel="noopener">${url}</a>
      </div>
      <div class="modal-actions">
        <a class="btn-primary buy-modal-btn" href="${url}" target="_blank" rel="noopener">Go to Purchase Page</a>
      </div>
      <div class="buy-modal-disclaimer">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        <span>${storeName} does not process payments or receive any commission from this purchase. All transactions occur directly on the developer's platform. Responsibility for the product, pricing, refunds, and support belongs entirely to the app owner.</span>
      </div>
    `;

    overlay.style.display = "flex";
    requestAnimationFrame(() => overlay.classList.add("visible"));

    overlay.onclick = (e) => {
      if (e.target === overlay || e.target.closest("[data-action='close-modal']")) {
        closeModal();
      }
    };
  }

  function closeModal() {
    const overlay = $("#modalOverlay");
    overlay.classList.remove("visible");
    setTimeout(() => {
      overlay.style.display = "none";
    }, 300);
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      showToast();
    });
  }

  function showToast() {
    const toast = $("#brewToast");
    toast.classList.add("visible");
    setTimeout(() => toast.classList.remove("visible"), 2000);
  }

  // Event binding
  function bindEvents() {
    $$("[data-app]").forEach((el) => {
      if (el.dataset.boundNav) return;
      el.dataset.boundNav = "1";
      el.addEventListener("click", (e) => {
        if (e.target.closest("[data-action='get']")) return;
        if (e.target.closest("a")) return;
        navigate(currentView, el.dataset.app);
      });
    });

    $$("[data-action='get']").forEach((btn) => {
      if (btn.dataset.boundGet) return;
      btn.dataset.boundGet = "1";
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const appId = btn.dataset.app;
        const app = data.apps.find((a) => a.id === appId);
        if (!app) return;
        if (isPaidApp(app)) {
          showBuyModal(app);
        } else if (app.brew || app.installCommand) {
          showBrewModal(app);
        } else if (app.homepage) {
          window.open(app.homepage, "_blank");
        } else {
          window.open(app.github, "_blank");
        }
      });
    });

    $$("[data-action='back']").forEach((btn) => {
      if (btn.dataset.boundBack) return;
      btn.dataset.boundBack = "1";
      btn.addEventListener("click", () => navigate(currentView));
    });

    $$("[data-copy]").forEach((el) => {
      if (el.dataset.boundCopy) return;
      el.dataset.boundCopy = "1";
      el.addEventListener("click", () => copyToClipboard(el.dataset.copy));
    });

    bindCarousel();
  }

  let carouselTimer = null;

  function bindCarousel() {
    const track = $(".carousel-track");
    if (!track) return;
    const slides = $$(".featured-banner", track);
    const dots = $$(".carousel-dot");
    if (slides.length <= 1) return;

    let current = 0;

    function goTo(i) {
      current = ((i % slides.length) + slides.length) % slides.length;
      track.style.transform = `translateX(-${current * 100}%)`;
      dots.forEach((d, j) => d.classList.toggle("active", j === current));
    }

    dots.forEach((d) => {
      d.addEventListener("click", (e) => {
        e.stopPropagation();
        goTo(parseInt(d.dataset.slide, 10));
        resetAutoplay();
      });
    });

    function resetAutoplay() {
      clearInterval(carouselTimer);
      carouselTimer = setInterval(() => goTo(current + 1), 5000);
    }
    resetAutoplay();

    let touchStartX = 0;
    let touchDeltaX = 0;
    let dragging = false;

    track.addEventListener("touchstart", (e) => {
      touchStartX = e.touches[0].clientX;
      touchDeltaX = 0;
      dragging = true;
      track.style.transition = "none";
    }, { passive: true });

    track.addEventListener("touchmove", (e) => {
      if (!dragging) return;
      touchDeltaX = e.touches[0].clientX - touchStartX;
      const offset = -(current * 100) + (touchDeltaX / track.offsetWidth) * 100;
      track.style.transform = `translateX(${offset}%)`;
    }, { passive: true });

    track.addEventListener("touchend", () => {
      if (!dragging) return;
      dragging = false;
      track.style.transition = "transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)";
      if (touchDeltaX < -50) goTo(current + 1);
      else if (touchDeltaX > 50) goTo(current - 1);
      else goTo(current);
      resetAutoplay();
    });
  }

  // Sidebar click
  function bindSidebar() {
    $("#sidebarNav").addEventListener("click", (e) => {
      const item = e.target.closest(".nav-item");
      if (!item) return;
      navigate(item.dataset.view);
      $("#sidebar").classList.remove("open");
      $("#sidebarOverlay").classList.remove("open");
    });
  }

  // Search
  function bindSearch() {
    const input = $("#searchInput");
    let timeout;
    input.addEventListener("input", () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        const q = input.value.trim();
        if (q.length > 0) {
          const scroll = $("#contentScroll");
          scroll.scrollTop = 0;
          scroll.innerHTML = renderSearch(q);
          currentApp = null;
          $$(".nav-item").forEach((n) => n.classList.remove("active"));
          bindEvents();
        } else {
          navigate(currentView);
        }
      }, 250);
    });
  }

  // Keyboard shortcuts
  function bindKeyboard() {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
        if (currentApp) navigate(currentView);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        $("#searchInput").focus();
      }
    });
  }

  // Init
  async function init() {
    try {
      const cacheBust = Date.now();
      const resp = await fetch("apps.json?v=" + cacheBust);
      data = await resp.json();
    } catch {
      $("#contentScroll").innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">⚠️</div>
          <h3>Failed to load apps</h3>
          <p>Could not fetch apps.json. Make sure the file exists.</p>
        </div>`;
      return;
    }

    buildSidebar();
    window.addEventListener("hashchange", onHashChange);
    const initial = parseHash();
    navigate(initial.view || "discover", initial.appId || null);
    bindSidebar();
    bindSearch();
    bindKeyboard();
    bindThemeToggle();
    bindMobileMenu();
  }

  function updateMobileTopbar() {
    const menuBtn = $("#mobileMenuBtn");
    const backBtn = $("#mobileBackBtn");
    if (!menuBtn || !backBtn) return;

    if (currentApp) {
      menuBtn.classList.add("hidden");
      backBtn.classList.remove("hidden");
    } else {
      menuBtn.classList.remove("hidden");
      backBtn.classList.add("hidden");
    }
  }

  function bindMobileMenu() {
    const menuBtn = $("#mobileMenuBtn");
    const backBtn = $("#mobileBackBtn");
    const sidebar = $("#sidebar");
    const overlay = $("#sidebarOverlay");
    const scroll = $("#contentScroll");
    if (!menuBtn || !sidebar || !overlay) return;

    menuBtn.addEventListener("click", () => {
      sidebar.classList.toggle("open");
      overlay.classList.toggle("open");
    });

    overlay.addEventListener("click", () => {
      sidebar.classList.remove("open");
      overlay.classList.remove("open");
    });

    backBtn.addEventListener("click", () => {
      navigate(currentView);
    });

    let lastScrollY = 0;
    let fadeTimer = null;
    scroll.addEventListener("scroll", () => {
      const y = scroll.scrollTop;
      if (y > lastScrollY && y > 60) {
        menuBtn.classList.add("faded");
        backBtn.classList.add("faded");
      } else {
        menuBtn.classList.remove("faded");
        backBtn.classList.remove("faded");
      }
      lastScrollY = y;
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(() => {
        menuBtn.classList.remove("faded");
        backBtn.classList.remove("faded");
      }, 1500);
    }, { passive: true });
  }

  function bindThemeToggle() {
    const btn = $("#themeToggle");
    const label = btn.querySelector(".theme-label");

    function updateLabel() {
      const current = document.documentElement.getAttribute("data-theme");
      label.textContent = current === "dark" ? "Light Mode" : "Dark Mode";
    }
    updateLabel();

    btn.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme");
      const next = current === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("theme", next);
      updateLabel();
      navigate(currentView, currentApp);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
