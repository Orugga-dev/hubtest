/**
 * Simple static includes: loads /shared/partials/header.<lang>.html and footer.<lang>.html
 * Usage:
 *   <div data-include="header" data-lang="en"></div>
 *   <div data-include="footer" data-lang="en"></div>
 */
(function () {
  function getBasePath() {
    // Works for /en/* and /es/*. Returns "../" for those, "./" otherwise.
    const path = window.location.pathname;
    if (path.includes("/en/") || path.includes("/es/")) return "../";
    return "./";
  }

  async function loadInclude(el) {
    const include = el.getAttribute("data-include");
    const lang = el.getAttribute("data-lang") || "en";
    const base = getBasePath();
    const url = `${base}shared/partials/${include}.${lang}.html`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.warn("Include not found:", url);
      return;
    }
    const html = await res.text();
    el.outerHTML = html;
  }

  function setActiveNav() {
    const path = window.location.pathname.toLowerCase();
    const items = document.querySelectorAll("[data-nav]");
    items.forEach((a) => {
      const target = (a.getAttribute("href") || "").toLowerCase();
      if (!target) return;
      const isHome = target.endsWith("/index.html") || target.endsWith("/en/") || target.endsWith("/es/");
      const onHome = path.endsWith("/index.html") || path.endsWith("/en/") || path.endsWith("/es/") || path === "/" || path.endsWith("/en") || path.endsWith("/es");
      const match = (isHome && onHome) || (target && path.endsWith(target));
      if (match) a.classList.add("text-primary");
    });
  }

  function wireMobileMenu() {
    const btn = document.querySelector("[data-mobile-menu-button]");
    const panel = document.querySelector("[data-mobile-menu]");
    if (!btn || !panel) return;

    btn.addEventListener("click", () => {
      panel.classList.toggle("hidden");
      btn.setAttribute("aria-expanded", panel.classList.contains("hidden") ? "false" : "true");
    });
  }

  document.addEventListener("DOMContentLoaded", async () => {
    const includes = Array.from(document.querySelectorAll("[data-include]"));
    for (const el of includes) {
      try { await loadInclude(el); } catch (e) { console.error(e); }
    }
    setActiveNav();
    wireMobileMenu();

    // Footer year
    const y = document.querySelector("[data-year]");
    if (y) y.textContent = new Date().getFullYear();

    // Notify other scripts (e.g., motion/header polish) that the partials are ready
    try { document.dispatchEvent(new Event("hublat:includes-ready")); } catch (e) {}
  });
})();
