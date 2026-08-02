(() => {
  const config = window.MV_SITE || {};
  const isPlaceholder = (value) => !value || value.includes("YOUR-") || value.includes("YOUR_") || value.endsWith("/YOUR-PAGE");

  const configureLinks = (selector, url) => {
    document.querySelectorAll(selector).forEach((link) => {
      if (isPlaceholder(url)) {
        link.classList.add("is-disabled"); link.setAttribute("aria-disabled", "true"); link.addEventListener("click", (event) => event.preventDefault()); return;
      }
      link.href = url; link.target = "_blank"; link.rel = "noopener noreferrer";
    });
  };
  configureLinks(".js-discord-link", config.discordInvite);
  configureLinks(".js-star-citizen-link", config.starCitizenOrganisation);
  configureLinks(".js-torn-link", config.tornPage);
  document.querySelectorAll("[data-current-year]").forEach((element) => { element.textContent = new Date().getFullYear(); });

  const header = document.querySelector("[data-header]");
  const setHeaderState = () => header?.classList.toggle("is-scrolled", window.scrollY > 24);
  setHeaderState(); window.addEventListener("scroll", setHeaderState, { passive: true });

  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");
  const dropdown = document.querySelector("[data-nav-dropdown]");
  const dropdownToggle = document.querySelector("[data-dropdown-toggle]");
  const closeMenu = () => { toggle?.setAttribute("aria-expanded", "false"); nav?.classList.remove("is-open"); dropdown?.classList.remove("is-open"); dropdownToggle?.setAttribute("aria-expanded", "false"); };
  toggle?.addEventListener("click", () => { const open = toggle.getAttribute("aria-expanded") === "true"; toggle.setAttribute("aria-expanded", String(!open)); nav?.classList.toggle("is-open", !open); });
  dropdownToggle?.addEventListener("click", () => { const open = dropdownToggle.getAttribute("aria-expanded") === "true"; dropdownToggle.setAttribute("aria-expanded", String(!open)); dropdown?.classList.toggle("is-open", !open); });
  nav?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("click", (event) => { if (dropdown && !dropdown.contains(event.target)) { dropdown.classList.remove("is-open"); dropdownToggle?.setAttribute("aria-expanded", "false"); } });
  // Keep the desktop Games menu open while the pointer moves into it.
  let dropdownCloseTimer = null;

  const openDropdownOnHover = () => {
    if (window.innerWidth <= 980 || !dropdown) return;
    window.clearTimeout(dropdownCloseTimer);
    dropdown.classList.add("is-hover-open");
  };

  const closeDropdownAfterDelay = () => {
    if (window.innerWidth <= 980 || !dropdown) return;
    window.clearTimeout(dropdownCloseTimer);
    dropdownCloseTimer = window.setTimeout(() => {
      dropdown.classList.remove("is-hover-open");
    }, 360);
  };

  dropdown?.addEventListener("pointerenter", openDropdownOnHover);
  dropdown?.addEventListener("pointerleave", closeDropdownAfterDelay);

  window.addEventListener("resize", () => { if (window.innerWidth > 980) closeMenu(); });

  const updateDiscordCount = async () => {
    const targets = document.querySelectorAll("[data-discord-count]");
    if (!targets.length || !config.discordGuildId) return;
    try {
      const response = await fetch(`https://discord.com/api/guilds/${encodeURIComponent(config.discordGuildId)}/widget.json`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Discord widget returned ${response.status}`);
      const widget = await response.json();
      const count = Number(widget.presence_count);
      if (!Number.isFinite(count)) throw new Error("Discord widget count missing");
      targets.forEach((target) => { target.textContent = `${count.toLocaleString("en-GB")} ONLINE`; });
    } catch (error) {
      console.warn("Discord presence unavailable", error);
      targets.forEach((target) => { target.textContent = "COMMUNITY ONLINE"; });
    }
  };
  updateDiscordCount(); window.setInterval(updateDiscordCount, 60000);

  document.querySelectorAll("[data-news-target]").forEach((button) => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.newsTarget;
      document.querySelectorAll("[data-news-target]").forEach((item) => { const selected = item === button; item.classList.toggle("is-active", selected); item.setAttribute("aria-selected", String(selected)); });
      document.querySelectorAll(".news-detail").forEach((panel) => { const selected = panel.id === targetId; panel.hidden = !selected; panel.classList.toggle("is-active", selected); });
      if (window.innerWidth <= 720) document.getElementById(targetId)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  });

  const revealElements = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) revealElements.forEach((element) => element.classList.add("is-visible"));
  else { const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } }), { threshold: .12 }); revealElements.forEach((element) => observer.observe(element)); }

  const originalTitle = document.title;
  document.addEventListener("visibilitychange", () => { document.title = document.hidden ? "The Vanguard is still here" : originalTitle; });
})();
