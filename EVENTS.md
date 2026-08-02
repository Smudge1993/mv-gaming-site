# Editing public events

Open `events-data.js` in GitHub and edit the `window.MV_EVENTS` array.

## One-day event

```js
{
  title: "Star Citizen Operations Night",
  game: "Star Citizen",
  date: "2026-08-14",
  time: "20:00",
  timezone: "BST",
  summary: "Crew up for a community operations evening in the ’verse.",
  url: "/star-citizen.html",
  published: true
}
```

## Multi-day event

Add `endDate`. Both the first and final dates are included:

```js
{
  title: "Minervan Vanguard Fleet Weekend",
  game: "Star Citizen",
  date: "2026-08-14",
  endDate: "2026-08-16",
  time: "20:00",
  timezone: "BST",
  summary: "A three-day programme of organisation operations and casual play.",
  url: "/star-citizen.html",
  published: true
}
```

This example runs on 14, 15 and 16 August.

Useful page links:

- `/starfarers.html`
- `/star-citizen.html`
- `/torn.html`

Dates must use `YYYY-MM-DD`.

Past one-day events leave the upcoming feed after their date. Multi-day events
remain in the upcoming feed until their `endDate` has passed.

Calendar days are clickable. Selecting any date during a multi-day event shows
that event in the panel.

Set `published: false` to hide an event without deleting it.
