/*
  MINERVAN VANGUARD — PUBLIC EVENTS

  Edit only this file when adding or changing events.

  Fields:
  - title
  - game
  - date: first day, in YYYY-MM-DD format
  - endDate: optional final day, in YYYY-MM-DD format; the final day is included
  - time: for example "20:00"
  - timezone: for example "BST", "GMT", "UTC", or "ET"
  - summary
  - url: /starfarers.html, /star-citizen.html, or /torn.html
  - published: false hides an event without deleting it

  One-day example:

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

  Multi-day example:

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
*/

window.MV_EVENTS = [
  {
    title: "Torn Ranked war",
    game: "Torn",
    date: "2026-08-01",
    endDate: "2026-08-04",
    time: "20:00",
    timezone: "BST",
    summary: "Come fight alongside us as we battle to keep our gold rank!",
    url: "/torn.html",
    published: true
    
    title: "Star Citizen Foundation festival",
    game: "Star Citizen",
    date: "2026-07-29",
    endDate: "2026-08-10",
    time: "20:00",
    timezone: "BST",
    summary: "Free fly event in Star citizen, come join us and hop on a ship as we take on the Universe",
    url: "/star-citizen.html",
    published: true
  }
];
];
