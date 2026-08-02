(() => {
  const root = document.querySelector("[data-events-widget]");
  if (!root) return;

  const monthLabel = root.querySelector("[data-calendar-month]");
  const grid = root.querySelector("[data-calendar-grid]");
  const list = root.querySelector("[data-events-list]");
  const previous = root.querySelector("[data-calendar-previous]");
  const next = root.querySelector("[data-calendar-next]");
  const kicker = root.querySelector("[data-events-kicker]");
  const title = root.querySelector("[data-events-title]");
  const reset = root.querySelector("[data-events-reset]");

  const parseDate = (value) => new Date(`${value}T12:00:00`);

  const dateKey = (date) => [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");

  const dateFromKey = (key) => parseDate(key);

  const addDays = (date, amount) => {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);
    return result;
  };

  const allEvents = (Array.isArray(window.MV_EVENTS) ? window.MV_EVENTS : [])
    .filter((event) => event && event.published !== false && event.date)
    .map((event, index) => {
      const startDate = parseDate(event.date);
      const suppliedEndDate = event.endDate ? parseDate(event.endDate) : startDate;
      const validEndDate = !Number.isNaN(suppliedEndDate.getTime()) && suppliedEndDate >= startDate
        ? suppliedEndDate
        : startDate;

      return {
        ...event,
        id: event.id || `mv-event-${index}`,
        dateObject: startDate,
        endDateObject: validEndDate,
        endDate: dateKey(validEndDate)
      };
    })
    .filter((event) =>
      !Number.isNaN(event.dateObject.getTime()) &&
      !Number.isNaN(event.endDateObject.getTime())
    )
    .sort((a, b) => a.dateObject - b.dateObject);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // An event remains upcoming while it is still running.
  const upcoming = allEvents.filter((event) => event.endDateObject >= today);
  const startingDate = upcoming[0]?.dateObject || today;
  let visibleMonth = new Date(startingDate.getFullYear(), startingDate.getMonth(), 1);
  let selectedDateKey = null;

  const escapeHtml = (value = "") => String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const formatDate = (date) => new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);

  const shortDate = (date, options = {}) => new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options
  }).format(date);

  const isMultiDay = (event) => event.endDateObject > event.dateObject;

  const eventRunsOn = (event, key) => {
    const selected = dateFromKey(key);
    return selected >= event.dateObject && selected <= event.endDateObject;
  };

  const eventDateLabel = (event) => {
    if (!isMultiDay(event)) return shortDate(event.dateObject);

    const sameYear = event.dateObject.getFullYear() === event.endDateObject.getFullYear();
    const sameMonth = sameYear && event.dateObject.getMonth() === event.endDateObject.getMonth();

    if (sameMonth) {
      const start = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric"
      }).format(event.dateObject);

      const end = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(event.endDateObject);

      return `${start} – ${end}`;
    }

    if (sameYear) {
      const start = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short"
      }).format(event.dateObject);

      const end = new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric"
      }).format(event.endDateObject);

      return `${start} – ${end}`;
    }

    return `${shortDate(event.dateObject)} – ${shortDate(event.endDateObject)}`;
  };

  const dateBlockDay = (event) => {
    if (
      isMultiDay(event) &&
      event.dateObject.getMonth() === event.endDateObject.getMonth() &&
      event.dateObject.getFullYear() === event.endDateObject.getFullYear()
    ) {
      return `${event.dateObject.getDate()}–${event.endDateObject.getDate()}`;
    }

    return String(event.dateObject.getDate()).padStart(2, "0");
  };

  const dateBlockMonth = (event) => event.dateObject
    .toLocaleDateString("en-GB", { month: "short" })
    .toUpperCase();

  const renderEventItems = (events) => events.map((event) => `
    <a class="event-item" href="${escapeHtml(event.url || "/")}">
      <div class="event-date-block${isMultiDay(event) ? " is-multiday" : ""}">
        <strong>${escapeHtml(dateBlockDay(event))}</strong>
        <span>${escapeHtml(dateBlockMonth(event))}</span>
      </div>
      <div class="event-copy">
        <span>${escapeHtml(event.game || "Community")}${isMultiDay(event) ? " · MULTI-DAY" : ""}</span>
        <h3>${escapeHtml(event.title || "Minervan Vanguard Event")}</h3>
        <p>${escapeHtml(event.summary || "")}</p>
        <small>${escapeHtml(eventDateLabel(event))}${event.time ? ` · ${escapeHtml(event.time)}` : ""}${event.timezone ? ` ${escapeHtml(event.timezone)}` : ""}</small>
      </div>
      <span class="event-arrow" aria-hidden="true">→</span>
    </a>
  `).join("");

  function renderList() {
    if (selectedDateKey) {
      const selectedDate = dateFromKey(selectedDateKey);
      const eventsForDate = allEvents.filter((event) => eventRunsOn(event, selectedDateKey));

      kicker.textContent = "SELECTED DATE";
      title.textContent = formatDate(selectedDate);
      reset.hidden = false;

      if (!eventsForDate.length) {
        list.innerHTML = `
          <div class="events-empty">
            <span>NO EVENTS SCHEDULED</span>
            <h3>Nothing is booked for this date.</h3>
            <p>${escapeHtml(formatDate(selectedDate))} is currently clear. Select another date or return to all upcoming events.</p>
          </div>`;
        return;
      }

      list.innerHTML = renderEventItems(eventsForDate);
      return;
    }

    kicker.textContent = "EVENT FEED";
    title.textContent = "Next on the network";
    reset.hidden = true;

    if (!upcoming.length) {
      list.innerHTML = `
        <div class="events-empty">
          <span>NO LIVE EVENTS</span>
          <h3>Nothing is on the board yet.</h3>
          <p>New operations, wars and community nights will appear here when they are announced. You can still select any calendar date to check it.</p>
        </div>`;
      return;
    }

    list.innerHTML = renderEventItems(upcoming.slice(0, 5));
  }

  const eventCountByDate = () => {
    const counts = {};

    allEvents.forEach((event) => {
      for (
        let current = new Date(event.dateObject);
        current <= event.endDateObject;
        current = addDays(current, 1)
      ) {
        const key = dateKey(current);
        counts[key] = (counts[key] || 0) + 1;
      }
    });

    return counts;
  };

  function renderCalendar() {
    monthLabel.textContent = visibleMonth.toLocaleDateString("en-GB", {
      month: "long",
      year: "numeric"
    });

    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const previousMonthDays = new Date(year, month, 0).getDate();
    const eventCounts = eventCountByDate();
    const cells = [];

    for (let index = 0; index < 42; index += 1) {
      const number = index - offset + 1;
      let cellDate;
      let outside = false;

      if (number < 1) {
        cellDate = new Date(year, month - 1, previousMonthDays + number);
        outside = true;
      } else if (number > daysInMonth) {
        cellDate = new Date(year, month + 1, number - daysInMonth);
        outside = true;
      } else {
        cellDate = new Date(year, month, number);
      }

      const key = dateKey(cellDate);
      const isToday = key === dateKey(today);
      const isSelected = key === selectedDateKey;
      const eventCount = eventCounts[key] || 0;

      cells.push(`
        <button type="button"
                class="calendar-day${outside ? " is-outside" : ""}${isToday ? " is-today" : ""}${isSelected ? " is-selected" : ""}${eventCount ? " has-event" : ""}"
                data-calendar-date="${key}"
                aria-pressed="${isSelected}"
                aria-label="${escapeHtml(formatDate(cellDate))}${eventCount ? `, ${eventCount} event${eventCount === 1 ? "" : "s"}` : ", no events"}">
          <span>${cellDate.getDate()}</span>
          ${eventCount ? `<small aria-hidden="true">${eventCount}</small>` : ""}
        </button>
      `);
    }

    grid.innerHTML = cells.join("");
  }

  function selectDate(key) {
    selectedDateKey = key;
    const selectedDate = dateFromKey(key);

    if (
      selectedDate.getFullYear() !== visibleMonth.getFullYear() ||
      selectedDate.getMonth() !== visibleMonth.getMonth()
    ) {
      visibleMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    }

    renderCalendar();
    renderList();

    if (window.innerWidth <= 900) {
      root.querySelector(".events-list-panel")?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  }

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-calendar-date]");
    if (!button) return;
    selectDate(button.dataset.calendarDate);
  });

  previous?.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1);
    renderCalendar();
  });

  next?.addEventListener("click", () => {
    visibleMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1);
    renderCalendar();
  });

  reset?.addEventListener("click", () => {
    selectedDateKey = null;
    renderCalendar();
    renderList();
  });

  renderCalendar();
  renderList();
})();
