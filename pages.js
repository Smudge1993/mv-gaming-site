(() => {
  const config = window.MV_SITE || {};
  const invalid = (value) => !value || value.includes("YOUR-") || value.includes("YOUR_");
  const setLinks = (selector, value) => document.querySelectorAll(selector).forEach((link) => { if (invalid(value)) { link.classList.add("is-disabled"); link.addEventListener("click", (event) => event.preventDefault()); } else { link.href=value; link.target="_blank"; link.rel="noopener noreferrer"; } });
  setLinks(".js-discord-link", config.discordInvite); setLinks(".js-torn-link", config.tornPage); setLinks(".js-star-citizen-link", config.starCitizenOrganisation);
  document.querySelectorAll("[data-current-year]").forEach((el) => el.textContent = new Date().getFullYear());
  const header=document.querySelector("[data-header]"); const onScroll=()=>header?.classList.toggle("is-scrolled",window.scrollY>24); onScroll(); window.addEventListener("scroll",onScroll,{passive:true});
  const nav=document.querySelector("[data-nav]"), toggle=document.querySelector("[data-nav-toggle]"), dropdown=document.querySelector("[data-nav-dropdown]"), dropdownToggle=document.querySelector("[data-dropdown-toggle]");
  const close=()=>{toggle?.setAttribute("aria-expanded","false");nav?.classList.remove("is-open");dropdown?.classList.remove("is-open");dropdownToggle?.setAttribute("aria-expanded","false")};
  toggle?.addEventListener("click",()=>{const open=toggle.getAttribute("aria-expanded")==="true";toggle.setAttribute("aria-expanded",String(!open));nav?.classList.toggle("is-open",!open)});
  dropdownToggle?.addEventListener("click",()=>{const open=dropdownToggle.getAttribute("aria-expanded")==="true";dropdownToggle.setAttribute("aria-expanded",String(!open));dropdown?.classList.toggle("is-open",!open)});
  nav?.querySelectorAll("a").forEach((link)=>link.addEventListener("click",close));
  const reveals=document.querySelectorAll(".reveal"); if(!("IntersectionObserver" in window)) reveals.forEach(el=>el.classList.add("is-visible")); else {const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target)}}),{threshold:.1});reveals.forEach(el=>observer.observe(el));}
})();
