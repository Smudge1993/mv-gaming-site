(() => {
  const config = window.MV_SITE || {};

  const isPlaceholder = (value) =>
    !value ||
    value.includes("YOUR-") ||
    value.includes("YOUR_") ||
    value.endsWith("/YOUR-PAGE");

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

  if (config.gameTitle) {
    document.querySelectorAll(".js-game-title").forEach((element) => {
      element.textContent = config.gameTitle;
    });
  }

  if (config.gameDescription) {
    document.querySelectorAll(".js-game-description").forEach((element) => {
      element.textContent = config.gameDescription;
    });
  }

  configureLinks(".js-discord-link", config.discordInvite);
  configureLinks(".js-star-citizen-link", config.starCitizenOrganisation);
  configureLinks(".js-torn-link", config.tornPage);

  const configNote = document.querySelector("[data-config-note]");
  if (configNote && !isPlaceholder(config.discordInvite)) {
    configNote.remove();
  }

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = new Date().getFullYear();
  });

  const header = document.querySelector("[data-header]");
  const setHeaderState = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  const closeMenu = () => {
    toggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
  };

  toggle?.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav?.classList.toggle("is-open", !isOpen);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 980) closeMenu();
  });

  const revealElements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  revealElements.forEach((element) => observer.observe(element));
})();
