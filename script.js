(() => {
  document.addEventListener("DOMContentLoaded", () => {
    setupHamburger();
    closeMenuOnLinkClick();
    setupLightbox();
    setupContactFormValidation();
  });

  /* ========== Mobile nav toggle ========== */
  function setupHamburger() {
    const btn = document.querySelector(".hamburger");
    const nav = document.querySelector("header nav");
    if (!btn || !nav) return;

    btn.addEventListener("click", () => {
      const open = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!open));
      btn.setAttribute("aria-expanded", String(!open));
    });
  }

  /* ========== Close menu after clicking a link (mobile) ========== */
  function closeMenuOnLinkClick() {
    const nav = document.querySelector("header nav");
    if (!nav) return;

    nav.querySelectorAll("a[href^='#']").forEach((a) => {
      a.addEventListener("click", () => {
        if (nav.getAttribute("data-open") === "true") {
          nav.setAttribute("data-open", "false");
          const btn = document.querySelector(".hamburger");
          btn?.setAttribute("aria-expanded", "false");
        }
        // Smooth scroll (in addition to CSS)
        const id = a.getAttribute("href");
        const target = id ? document.querySelector(id) : null;
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
  }

  /* ========== Lightbox for project images ========== */
  function setupLightbox() {
    const images = document.querySelectorAll("#projects img");
    if (!images.length) return;

    const overlay = document.createElement("div");
    overlay.className = "lb-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "Image preview");

    const figure = document.createElement("figure");
    figure.className = "lb-figure";

    const img = document.createElement("img");
    img.className = "lb-img";
    img.alt = "";

    const caption = document.createElement("figcaption");
    caption.className = "lb-caption";

    const closeBtn = document.createElement("button");
    closeBtn.className = "lb-close";
    closeBtn.type = "button";
    closeBtn.setAttribute("aria-label", "Close image");
    closeBtn.textContent = "×";

    figure.append(img, caption);
    overlay.append(figure, closeBtn);
    document.body.appendChild(overlay);

    const open = (src, alt, cap) => {
      img.src = src;
      img.alt = alt || "";
      caption.textContent = cap || alt || "";
      overlay.style.display = "flex";
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
    overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
    closeBtn.addEventListener("click", close);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });
  }

  /* ========== Contact form validation ========== */
  function setupContactFormValidation() {
    const form = document.querySelector("#contact form");
    if (!form) return;
    const nameInput = form.querySelector("#name");
    const emailInput = form.querySelector("#email");
    const messageInput = form.querySelector("#message");
    const live = form.querySelector("#form-live");

    function setError(input, msg) {
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
    }
    function clearError(input) {
      input.removeAttribute("aria-invalid");
      const err = form.querySelector(`#${input.id}-error`);
      if (err) err.textContent = "";
    }
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
      const ok = validateName() & validateEmail() & validateMessage(); // forces all to run
      if (!ok) {
        e.preventDefault();
        live.textContent = "Please fix the highlighted fields and try again.";
      } else {
        // Demo success message if no action attribute is set
        if (!form.getAttribute("action")) {
          e.preventDefault();
          live.textContent = "Thanks! Your message looks good.";
          form.reset();
          setTimeout(() => (live.textContent = ""), 3000);
        }
      }
    });
  }
})();
