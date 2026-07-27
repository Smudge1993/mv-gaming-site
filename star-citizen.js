(() => {
  const config = window.MV_SITE || {};
  const isPlaceholder = (value) => !value || value.includes("YOUR-") || value.includes("YOUR_");

  const configureLinks = (selector, url) => {
    document.querySelectorAll(selector).forEach((link) => {
      if (isPlaceholder(url)) {
        link.classList.add("is-disabled");
        link.setAttribute("aria-disabled", "true");
        link.addEventListener("click", (event) => event.preventDefault());
        return;
      }
      link.href = url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    });
  };

  configureLinks(".js-discord-link", config.discordInvite);
  configureLinks(".js-star-citizen-link", config.starCitizenOrganisation);

  const note = document.querySelector("[data-config-note]");
  if (note && !isPlaceholder(config.discordInvite) && !isPlaceholder(config.starCitizenOrganisation)) {
    note.remove();
  }

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const header = document.querySelector("[data-header]");
  const updateHeader = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const menuToggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");
  const closeMenu = () => {
    menuToggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
  };
  menuToggle?.addEventListener("click", () => {
    const open = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!open));
    nav?.classList.toggle("is-open", !open);
  });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const soundtrack = document.querySelector("[data-soundtrack]");
  const soundButton = document.querySelector("[data-sound-toggle]");
  const soundLabel = document.querySelector("[data-sound-label]");
  if (soundtrack && soundButton && soundLabel) {
    soundtrack.volume = 0.32;
    soundButton.addEventListener("click", async () => {
      if (soundtrack.paused) {
        try {
          await soundtrack.play();
          soundButton.classList.add("is-playing");
          soundButton.setAttribute("aria-pressed", "true");
          soundLabel.textContent = "Pause soundtrack";
        } catch (error) {
          soundLabel.textContent = "Audio unavailable";
        }
      } else {
        soundtrack.pause();
        soundButton.classList.remove("is-playing");
        soundButton.setAttribute("aria-pressed", "false");
        soundLabel.textContent = "Play soundtrack";
      }
    });
  }

  const revealElements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealElements.forEach((element) => observer.observe(element));
  }
})();
