(() => {
  document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    setupThemeToggle();
    setupHamburger();
    closeMenuOnLinkClick();
    setupContactFormValidation();
  });

  /* ---------- Theme (dark / light) ---------- */
  function initTheme() {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") document.documentElement.classList.add("dark");
  }
  function setupThemeToggle() {
    const btn = document.getElementById("theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", () => {
      const root = document.documentElement;
      const isDark = root.classList.toggle("dark");
      localStorage.setItem("theme", isDark ? "dark" : "light");
    });
  }

  /* ---------- Mobile nav ---------- */
  function setupHamburger() {
    const btn = document.querySelector(".hamburger");
    const nav = document.getElementById("main-nav");
    if (!btn || !nav) return;
    btn.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      btn.setAttribute("aria-expanded", String(!open));
    });
  }

  function closeMenuOnLinkClick() {
    const nav = document.getElementById("main-nav");
    if (!nav) return;
    nav.querySelectorAll("a[href^='#']").forEach((a) => {
      a.addEventListener("click", () => {
        if (nav.getAttribute("data-open") === "true") {
          nav.setAttribute("data-open", "false");
          const btn = document.querySelector(".hamburger");
          btn?.setAttribute("aria-expanded", "false");
        }
        const id = a.getAttribute("href");
        const target = id ? document.querySelector(id) : null;
        target?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ---------- Contact form validation ---------- */
  function setupContactFormValidation() {
    const form = document.querySelector(".contact-form");
    if (!form) return;
    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const messageInput = form.querySelector("#message");
    const live = form.querySelector("#form-live");

    const setError = (input, msg) => {
      input.setAttribute("aria-invalid", "true");
      let err = form.querySelector(`#${input.id}-error`);
      if (!err) {
        err = document.createElement("span");
        err.id = `${input.id}-error`;
        err.style.color = "#b00020";
        err.style.display = "block";
        input.insertAdjacentElement("afterend", err);
        const existing = input.getAttribute("aria-describedby");
        input.setAttribute("aria-describedby", [existing, err.id].filter(Boolean).join(" "));
      }
      err.textContent = msg;
    };
    const clearError = (input) => {
      input.removeAttribute("aria-invalid");
      const err = form.querySelector(`#${input.id}-error`);
      if (err) err.textContent = "";
    };

    const validateName = () => {
      const v = nameInput.value.trim();
      if (!v) { setError(nameInput, "Please enter your name."); return false; }
      clearError(nameInput); return true;
    };
    const validateEmail = () => {
      const v = emailInput.value.trim();
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      if (!v) { setError(emailInput, "Please enter your email."); return false; }
      if (!ok) { setError(emailInput, "Please enter a valid email address."); return false; }
      clearError(emailInput); return true;
    };
    const validateMessage = () => {
      const v = messageInput.value.trim();
      if (!v) { setError(messageInput, "Please enter a message."); return false; }
      if (v.length < 10) { setError(messageInput, "Message should be at least 10 characters."); return false; }
      clearError(messageInput); return true;
    };

    nameInput.addEventListener("input", validateName);
    emailInput.addEventListener("input", validateEmail);
    messageInput.addEventListener("input", validateMessage);

    form.addEventListener("submit", (e) => {
      const ok = validateName() & validateEmail() & validateMessage(); // force all to run
      if (!ok) {
        e.preventDefault();
        live.textContent = "Please fix the highlighted fields and try again.";
      } else if (!form.getAttribute("action")) {
        e.preventDefault();
        live.textContent = "Thanks! Your message looks good.";
        form.reset();
        setTimeout(() => (live.textContent = ""), 3000);
      }
    });
  }
})();
