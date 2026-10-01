# ENTA

ENTA is an art-directed event-ticketing experience for creating, selling, and checking in tickets around meaningful moments.

This repository contains the complete static ENTA website:

- `dist/index.html` — page structure and ENTA event-ticketing content
- `dist/style.css` and `dist/refinement.css` — responsive visual system and motion styling
- `dist/app.js` — scroll motion, dashboard interactions, ticket tools, and local event-draft flow
- `dist/assets/` — ENTA brand marks, event imagery, fonts, QR artwork, and supporting visuals

## Run locally

No build step is required. Serve the `dist` directory with any static server:

```bash
python3 -m http.server 8000 --directory dist
```

Then open [http://localhost:8000](http://localhost:8000).

The site is designed for desktop, tablet, and mobile layouts. Dashboard values are representative product-demo data, and event creation saves a local draft JSON file in the browser; payment processing and a live ticket backend are not connected in this static demo.

## Deployment

Deploy the `dist` directory as the static site root.