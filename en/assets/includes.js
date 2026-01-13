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

  
  // ================= VIDEO CARDS (Showcase) =================
  function ensureVideoModal() {
    if (document.getElementById("adiaVideoModal")) return;

    const modal = document.createElement("div");
    modal.id = "adiaVideoModal";
    modal.className = "fixed inset-0 z-[9999] hidden items-center justify-center bg-black/70 p-4";
    modal.innerHTML = `
      <div class="relative w-full max-w-5xl">
        <button id="adiaVideoModalClose"
                class="absolute -top-10 right-0 text-white/80 hover:text-white text-sm font-semibold">
          Close ✕
        </button>

        <div class="rounded-2xl overflow-hidden border border-white/10 bg-black shadow-2xl">
          <div class="px-5 py-4 border-b border-white/10 flex items-center justify-between">
            <div class="text-white font-bold" id="adiaVideoModalTitle">Video</div>
            <div class="text-xs text-white/60">Press ESC to close</div>
          </div>

          <div class="aspect-video bg-black">
            <div id="adiaVideoModalBody" class="h-full w-full"></div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const close = () => {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
      document.body.classList.remove("modal-open");
      const body = document.getElementById("adiaVideoModalBody");
      if (body) body.innerHTML = "";
    };

    document.getElementById("adiaVideoModalClose")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => { if (e.target === modal) close(); });
    window.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

    // store closer for later
    modal._close = close;
  }

  function openVideoModal({ src, title, subtitlesVtt }) {
    ensureVideoModal();
    const modal = document.getElementById("adiaVideoModal");
    const body = document.getElementById("adiaVideoModalBody");
    const t = document.getElementById("adiaVideoModalTitle");
    if (!modal || !body) return;

    t.textContent = title || "Video";
    body.innerHTML = "";

    const v = document.createElement("video");
    v.className = "h-full w-full object-contain bg-black";
    v.controls = true;
    v.playsInline = true;
    v.autoplay = true;

    const s = document.createElement("source");
    s.src = src;
    s.type = "video/mp4";
    v.appendChild(s);

    if (subtitlesVtt) {
      const track = document.createElement("track");
      track.kind = "subtitles";
      track.srclang = "en";
      track.label = "English";
      track.src = subtitlesVtt;
      track.default = true;
      v.appendChild(track);

      // Some browsers need explicit showing
      v.addEventListener("loadedmetadata", () => {
        try { for (const tt of v.textTracks) tt.mode = "showing"; } catch (_) {}
      });
    }

    body.appendChild(v);

    modal.classList.remove("hidden");
    modal.classList.add("flex");
    document.body.classList.add("modal-open");

    // Autoplay might be blocked; controls still allow user to play.
    v.play().catch(() => {});
  }

  function initVideoCards() {
    const cards = document.querySelectorAll(".js-videoCard[data-video-src]");
    if (!cards.length) return;

    cards.forEach((card) => {
      // avoid double binding
      if (card.dataset.vbound === "1") return;
      card.dataset.vbound = "1";

      card.addEventListener("click", () => {
        const src = card.getAttribute("data-video-src");
        const title = card.getAttribute("data-video-title") || "Video";

        // If your VTT is present, enable it only for the hero reel
        const subtitlesVtt = (src === "hero-reel.mp4") ? "hero-reel.en.vtt" : "";

        if (src) openVideoModal({ src, title, subtitlesVtt });
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
    initVideoCards();
  }

  window.addEventListener("DOMContentLoaded", inject);
})();