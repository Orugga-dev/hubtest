(function () {
  const HEADER_URL = "partials/header.html";
  const FOOTER_URL = "partials/footer.html";

  function norm(p) {
    return (p || "").split("#")[0].split("?")[0].toLowerCase();
  }

  function setActiveNav() {
    const current = norm((location.pathname.split("/").pop() || "index.html"));
    const links = document.querySelectorAll('a[data-nav="1"]');
    links.forEach(a => {
      const href = norm(a.getAttribute("href"));
      const isActive = href === current;
      a.classList.toggle("text-primary", isActive);
      a.classList.toggle("font-semibold", isActive);      a.classList.toggle("border-primary", isActive);      a.classList.toggle("opacity-90", !isActive);
    });
  }

  function initMobileMenu() {
    const btn = document.getElementById("mobileMenuBtn");
    const menu = document.getElementById("mobileMenu");
    if (!btn || !menu) return;

    const icon = btn.querySelector(".material-symbols-outlined");

    function closeMenu() {
      menu.classList.add("hidden");
      btn.setAttribute("aria-expanded", "false");
      if (icon) icon.textContent = "menu";
    }

    function openMenu() {
      menu.classList.remove("hidden");
      btn.setAttribute("aria-expanded", "true");
      if (icon) icon.textContent = "close";
    }

    btn.addEventListener("click", () => {
      const isOpen = btn.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu();
      else openMenu();
    });

    // Close on link click
    menu.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

    // Close on resize to desktop
    window.addEventListener("resize", () => {
      if (window.innerWidth >= 768) closeMenu();
    });

    // Close on Escape
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }

  function setFooterYear() {
    const y = document.getElementById("footerYear");
    if (y) y.textContent = String(new Date().getFullYear());
  }

  function initLangSwitcher() {
    const host = document.getElementById("langSwitcher");
    if (!host) return;

    function repoBase() {
      // GitHub Pages project site: https://<user>.github.io/<repo>/...
      const hn = (location.hostname || "").toLowerCase();
      if (!hn.endsWith("github.io")) return "";
      const parts = location.pathname.split("/").filter(Boolean);
      // ["AdIA-Orugga","en","index.html"]
      if (parts.length && parts[0] !== "en" && parts[0] !== "es") return "/" + parts[0];
      return "";
    }

    function relativePage() {
      let p = location.pathname;
      const base = repoBase();
      if (base && p.startsWith(base)) p = p.slice(base.length);
      // remove /en or /es
      p = p.replace(/^\/(en|es)/, "");
      return p === "" ? "/index.html" : p;
    }

    const base = repoBase();
    const page = relativePage();

    host.querySelectorAll("[data-lang]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const lang = btn.getAttribute("data-lang");
        location.href = base + "/" + lang + page;
      });
    });
  }

  async function inject() {
    const headerHost = document.getElementById("siteHeader");
    const footerHost = document.getElementById("siteFooter");

    // If hosts aren't present, do nothing (page might not use includes)
    if (!headerHost && !footerHost) return;

    try {
      if (headerHost) {
        const res = await fetch(HEADER_URL, { cache: "no-store" });
        headerHost.innerHTML = await res.text();
      }
      if (footerHost) {
        const res = await fetch(FOOTER_URL, { cache: "no-store" });
        footerHost.innerHTML = await res.text();
      }
    } catch (e) {
      // fail silently – page will still render without injected chrome
      return;
    }

    // Init behaviors after injection
    setActiveNav();
    initMobileMenu();
    setFooterYear();
    initLangSwitcher();
  }

  window.addEventListener("DOMContentLoaded", inject);
})();