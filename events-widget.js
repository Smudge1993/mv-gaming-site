(() => {
  const root = document.querySelector("[data-events-widget]");
  if (!root) return;

  const monthLabel = root.querySelector("[data-calendar-month]");
  const grid = root.querySelector("[data-calendar-grid]");
  const list = root.querySelector("[data-events-list]");
  const previous = root.querySelector("[data-calendar-previous]");
  const next = root.querySelector("[data-calendar-next]");

  const allEvents = (Array.isArray(window.MV_EVENTS) ? window.MV_EVENTS : [])
    .filter((event) => event && event.published !== false && event.date)
    .map((event, index) => ({ ...event, id: event.id || `mv-event-${index}`, dateObject: new Date(`${event.date}T12:00:00`) }))
    .filter((event) => !Number.isNaN(event.dateObject.getTime()))
    .sort((a, b) => a.dateObject - b.dateObject);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcoming = allEvents.filter((event) => event.dateObject >= today);
  const startingDate = upcoming[0]?.dateObject || today;
  let visibleMonth = new Date(startingDate.getFullYear(), startingDate.getMonth(), 1);

  const dateKey = (date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  const escapeHtml = (value = "") => String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
  const formatDate = (event) => new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" }).format(event.dateObject);

  function renderList() {
    if (!upcoming.length) {
      list.innerHTML = `<div class="events-empty"><span>NO LIVE EVENTS</span><h3>Nothing is on the board yet.</h3><p>New operations, wars and community nights will appear here when they are announced.</p></div>`;
      return;
    }
    list.innerHTML = upcoming.slice(0, 5).map((event) => `
      <a class="event-item" href="${escapeHtml(event.url || "/")}">
        <div class="event-date-block"><strong>${String(event.dateObject.getDate()).padStart(2, "0")}</strong><span>${event.dateObject.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}</span></div>
        <div class="event-copy"><span>${escapeHtml(event.game || "Community")}</span><h3>${escapeHtml(event.title || "Minervan Vanguard Event")}</h3><p>${escapeHtml(event.summary || "")}</p><small>${escapeHtml(formatDate(event))}${event.time ? ` · ${escapeHtml(event.time)}` : ""}${event.timezone ? ` ${escapeHtml(event.timezone)}` : ""}</small></div>
        <span class="event-arrow" aria-hidden="true">→</span>
      </a>`).join("");
  }

  function renderCalendar() {
    monthLabel.textContent = visibleMonth.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const eventKeys = new Set(allEvents.map((event) => event.date));
    const cells = [];

    for (let i = 0; i < 42; i += 1) {
      const number = i - offset + 1;
      let cellDate;
      let outside = false;
      if (number < 1) { cellDate = new Date(year, month - 1, previousMonthDays + number); outside = true; }
      else if (number > daysInMonth) { cellDate = new Date(year, month + 1, number - daysInMonth); outside = true; }
      else cellDate = new Date(year, month, number);

      const key = dateKey(cellDate);
      const isToday = key === dateKey(today);
      const hasEvent = eventKeys.has(key);
      cells.push(`<div class="calendar-day${outside ? " is-outside" : ""}${isToday ? " is-today" : ""}${hasEvent ? " has-event" : ""}" aria-label="${escapeHtml(cellDate.toLocaleDateString("en-GB"))}${hasEvent ? ", event scheduled" : ""}"><span>${cellDate.getDate()}</span></div>`);
    }
    grid.innerHTML = cells.join("");
  }

  previous?.addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1); renderCalendar(); });
  next?.addEventListener("click", () => { visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1); renderCalendar(); });
  renderList();
  renderCalendar();
})();
