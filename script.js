// script.js
(() => {
  document.addEventListener("DOMContentLoaded", () => {
    enhanceNavigation();
    enableSmoothScroll();
    setupProjectFilters();
    setupLightbox();
    setupContactFormValidation();
  });

  // -----------------------------
  // NAV: inject hamburger + toggle
  // -----------------------------
  function enhanceNavigation() {
    const header = document.querySelector("header");
    const nav = header?.querySelector("nav");
    const list = nav?.querySelector("ul");
    if (!header || !nav || !list) return;

    // Inject minimal CSS (only for small screens) to collapse/expand nav
    const style = document.createElement("style");
    style.textContent = `
      @media (max-width: 768px) {
        .hamburger {
          display: inline-flex; align-items: center; justify-content: center;
          width: 44px; height: 44px; border: 1px solid #cfd8dc; border-radius: 8px;
          background: #fff; cursor: pointer;
        }
        .hamburger:focus { outline: 2px solid #0078d4; outline-offset: 2px; }
        header .nav-wrap { display: flex; flex-direction: column; gap: 12px; align-items: center; }
        header nav[aria-expanded="false"] ul { display: none; }
      }
    `;
    document.head.appendChild(style);

    // Wrap header title + controls for layout
    let wrap = header.querySelector(".nav-wrap");
    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "nav-wrap";
      // Move existing children into wrapper
      while (header.firstChild) wrap.appendChild(header.firstChild);
      header.appendChild(wrap);
    }

    // Create hamburger button
    const btn = document.createElement("button");
    btn.className = "hamburger";
    btn.setAttribute("aria-label", "Toggle navigation");
    btn.setAttribute("aria-controls", "main-nav-list");
    btn.setAttribute("aria-expanded", "false");
    btn.innerHTML = `<span aria-hidden="true">☰</span>`;

    // Ensure UL has an id for aria-controls
    list.id = list.id || "main-nav-list";
    nav.setAttribute("role", "navigation");
    nav.setAttribute("aria-expanded", "false");

    // Insert button just before nav
    wrap.insertBefore(btn, nav);

    btn.addEventListener("click", () => {
      const expanded = nav.getAttribute("aria-expanded") === "true";
      nav.setAttribute("aria-expanded", String(!expanded));
      btn.setAttribute("aria-expanded", String(!expanded));
    });
  }

  // -----------------------------
  // Smooth scrolling for in-page nav
  // -----------------------------
  function enableSmoothScroll() {
    const navLinks = document.querySelectorAll("nav a[href^='#']");
    navLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        const rawHash = a.getAttribute("href");
        if (!rawHash) return;
        e.preventDefault();

        // Map #about -> #about-me if needed (HTML has id="about-me")
        // Fallback: use the hash as-is.
        const targetId = rawHash === "#about" ? "#about-me" : rawHash; // from your current HTML file
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          // If the nav is open on mobile, close it after navigating
          const nav = document.querySelector("header nav");
          if (nav?.getAttribute("aria-expanded") === "true") {
            nav.setAttribute("aria-expanded", "false");
            const btn = document.querySelector(".hamburger");
            btn?.setAttribute("aria-expanded", "false");
          }
        }
      });
    });
  }

  // ---------------------------------
  // Projects: filters (progressive)
  // ---------------------------------
  function setupProjectFilters() {
    const projectsSection = document.querySelector("#projects");
    if (!projectsSection) return;

    const articles = Array.from(projectsSection.querySelectorAll("article"));
    if (articles.length === 0) return;

    // Look for data-category on articles; if none found, skip creating UI
    const categories = new Set(
      articles
        .map((a) => a.getAttribute("data-category"))
        .filter(Boolean)
    );
    if (categories.size === 0) return;

    // Build filter UI
    const bar = document.createElement("div");
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", "Project filters");
    bar.style.display = "flex";
    bar.style.gap = "12px";
    bar.style.justifyContent = "center";
    bar.style.margin = "12px 0 20px";

    const makeBtn = (label, value) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = label;
      b.dataset.category = value; // '' means all
      b.setAttribute("aria-pressed", value === "" ? "true" : "false");
      b.style.padding = "8px 14px";
      b.style.borderRadius = "20px";
      b.style.border = "1px solid #cfd8dc";
      b.style.background = value === "" ? "#0078d4" : "#fff";
      b.style.color = value === "" ? "#fff" : "#2a3a4d";
      b.style.cursor = "pointer";
      b.addEventListener("click", () => {
        // toggle pressed state
        Array.from(bar.querySelectorAll("button")).forEach((btn) => {
          btn.setAttribute("aria-pressed", "false");
          btn.style.background = "#fff";
          btn.style.color = "#2a3a4d";
        });
        b.setAttribute("aria-pressed", "true");
        b.style.background = "#0078d4";
        b.style.color = "#fff";

        filterProjects(value);
      });
      return b;
    };

    bar.appendChild(makeBtn("All", ""));
    categories.forEach((cat) => bar.appendChild(makeBtn(cat, cat)));

    // Insert after the section heading (if present)
    const h2 = projectsSection.querySelector("h2");
    if (h2?.nextSibling) {
      projectsSection.insertBefore(bar, h2.nextSibling);
    } else {
      projectsSection.prepend(bar);
    }

    function filterProjects(category) {
      articles.forEach((a) => {
        const cat = a.getAttribute("data-category") || "";
        const show = !category || category === cat;
        a.style.display = show ? "" : "none";
      });
    }
  }

  // -----------------------------
  // Lightbox for project images
  // -----------------------------
  function setupLightbox() {
    const images = document.querySelectorAll("#projects img");
    if (!images.length) return;

    // Build modal elements
    const overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image preview");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.7)",
      display: "none",
      alignItems: "center",
      justifyContent: "center",
      zIndex: "2000",
      padding: "16px",
    });

    const figure = document.createElement("figure");
    figure.style.maxWidth = "min(900px, 95vw)";
    figure.style.maxHeight = "90vh";
    figure.style.margin = "0";

    const img = document.createElement("img");
    img.alt = "";
    Object.assign(img.style, {
      maxWidth: "100%",
      maxHeight: "80vh",
      display: "block",
      borderRadius: "12px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
      margin: "0 auto",
    });

    const caption = document.createElement("figcaption");
    caption.style.color = "#fff";
    caption.style.textAlign = "center";
    caption.style.marginTop = "12px";
    caption.style.fontSize = "1rem";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close image");
    closeBtn.textContent = "×";
    Object.assign(closeBtn.style, {
      position: "absolute",
      top: "16px",
      right: "16px",
      width: "44px",
      height: "44px",
      borderRadius: "22px",
      background: "#fff",
      color: "#2a3a4d",
      border: "1px solid #cfd8dc",
      fontSize: "28px",
      lineHeight: "40px",
      cursor: "pointer",
    });

    figure.appendChild(img);
    figure.appendChild(caption);
    overlay.appendChild(figure);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);

    const open = (src, alt, cap) => {
      img.src = src;
      img.alt = alt || "";
      caption.textContent = cap || alt || "";
      overlay.style.display = "flex";
      // prevent background scroll
      document.documentElement.style.overflow = "hidden";
      closeBtn.focus();
    };
    const close = () => {
      overlay.style.display = "none";
      document.documentElement.style.overflow = "";
    };

    images.forEach((el) => {
      el.style.cursor = "zoom-in";
      el.addEventListener("click", () => {
        const fig = el.closest("figure");
        const capText = fig?.querySelector("figcaption")?.textContent || "";
        open(el.src, el.alt, capText);
      });
    });

    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) close();
    });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => {
      if (overlay.style.display !== "flex") return;
      if (e.key === "Escape") close();
    });
  }

  // -----------------------------
  // Contact form validation (live)
  // -----------------------------
  function setupContactFormValidation() {
    const form = document.querySelector("#contact form");
    if (!form) return;

    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const messageInput = form.querySelector("#message");

    // Live region for feedback
    let live = form.querySelector("#form-live");
    if (!live) {
      live = document.createElement("div");
      live.id = "form-live";
      live.setAttribute("role", "status");
      live.setAttribute("aria-live", "polite");
      live.style.minHeight = "1em";
      live.style.marginTop = "8px";
      form.appendChild(live);
    }

    // Utility: show field error
    function setError(input, msg) {
      input.setAttribute("aria-invalid", "true");
      let err = form.querySelector(`#${input.id}-error`);
      if (!err) {
        err = document.createElement("span");
        err.id = `${input.id}-error`;
        err.style.color = "#b00020";
        err.style.fontSize = "0.95rem";
        err.style.display = "block";
        input.insertAdjacentElement("afterend", err);
        const existing = input.getAttribute("aria-describedby");
        input.setAttribute(
          "aria-describedby",
          [existing, err.id].filter(Boolean).join(" ")
        );
      }
      err.textContent = msg;
    }

    function clearError(input) {
      input.removeAttribute("aria-invalid");
      const err = form.querySelector(`#${input.id}-error`);
      if (err) err.textContent = "";
    }

    function validateName() {
      const v = (nameInput?.value || "").trim();
      if (!v) {
        setError(nameInput, "Please enter your name.");
        return false;
      }
      clearError(nameInput);
      return true;
    }

    function validateEmail() {
      const v = (emailInput?.value || "").trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!v) {
        setError(emailInput, "Please enter your email.");
        return false;
      }
      if (!ok) {
        setError(emailInput, "Please enter a valid email address.");
        return false;
      }
      clearError(emailInput);
      return true;
    }

    function validateMessage() {
      const v = (messageInput?.value || "").trim();
      if (!v) {
        setError(messageInput, "Please enter a message.");
        return false;
      }
      if (v.length < 10) {
        setError(messageInput, "Message should be at least 10 characters.");
        return false;
      }
      clearError(messageInput);
      return true;
    }

    // Real-time feedback
    nameInput?.addEventListener("input", validateName);
    emailInput?.addEventListener("input", validateEmail);
    messageInput?.addEventListener("input", validateMessage);

    form.addEventListener("submit", (e) => {
      const ok =
        validateName() & validateEmail() & validateMessage(); // bitwise trick to call all
      if (!ok) {
        e.preventDefault();
        live.textContent = "Please fix the highlighted fields and try again.";
      } else {
        // Optional: custom submit behavior; here we just announce success
        live.textContent = "Thanks! Your message looks good.";
        // Allow normal submission if form has an action/target, else prevent default
        if (!form.getAttribute("action")) {
          e.preventDefault();
          // Simulate a brief success state
          form.reset();
          setTimeout(() => (live.textContent = ""), 3000);
        }
      }
    });
  }
})();
// End of script.js
// This script enhances the navigation, adds smooth scrolling, sets up project filters,