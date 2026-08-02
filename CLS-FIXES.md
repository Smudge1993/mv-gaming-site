# CLS optimisation patch

Applied to the current live-site repository after Cloudflare Web Analytics was added.

Changes:
- added intrinsic width and height to every content image;
- marked hero imagery eager/high priority and below-fold imagery lazy/low priority;
- removed temporary configuration notices that JavaScript deleted after parsing;
- prefilled footer years;
- reserved fixed widths for Discord online counts and the soundtrack label;
- stabilised scrollbar width;
- explicitly reserved Starfarers, Star Citizen and 3D viewer media boxes;
- retained the Cloudflare Web Analytics beacon on every page.

The visual reveal and ticker animations remain because they use CSS transforms,
which do not trigger layout reflow.
