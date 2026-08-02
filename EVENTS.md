# Editing public events

Open `events-data.js` in GitHub and edit the `window.MV_EVENTS` array.

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

Useful links: `/starfarers.html`, `/star-citizen.html`, `/torn.html`.

Dates must use `YYYY-MM-DD`. Past events leave the upcoming feed automatically.
Set `published: false` to hide an event without deleting it.
