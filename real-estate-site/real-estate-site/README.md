# Real Estate Website

A single-page website that directs clients **directly** to your parents’ real estate business. It covers residential sales, commercial sales, and other services with clear contact options.

## What’s included

- **Hero** – Headline and prominent **Call** / **Get in Touch** buttons
- **Services** – Residential sales, commercial sales, other services (each with a “Contact us” link)
- **About** – Short story about the business and direct, personal service
- **Contact** – Phone, email, office address, and a form that opens the visitor’s email client with a pre-filled message to you

All CTAs point clients to your parents (phone, email, contact form).

## Customize for your parents

Replace these placeholders so the site reflects their business:

| Placeholder | Where to change it |
|------------|---------------------|
| **Your Name Real Estate** | `index.html`: header logo, footer brand, `<title>` |
| **(555) 123-4567** | `index.html`: hero CTA, contact section, footer. Also in `script.js`: no phone in mailto, but form still works |
| **hello@yourname.com** | `index.html`: contact section and footer only (the form uses this email from the page) |
| **Your Office Address Here** | `index.html`: contact section only |

**Quick steps:**

1. Open `index.html` and use Find & Replace:
   - `Your Name Real Estate` → their business name
   - `(555) 123-4567` → their phone (use same format everywhere for consistency)
   - `hello@yourname.com` → their email
   - `Your Office Address Here` → their office address

2. Optional: Adjust the hero headline (“Your Home & Business Goals, *Personally* Guided”) and the “About” copy to match their voice.

## Run locally

No build step. Open `index.html` in a browser, or serve the folder:

```bash
# Python
python3 -m http.server 8000

# Node (npx)
npx serve .
```

Then visit `http://localhost:8000` (or the port shown).

## Hosting

- Upload the whole folder to any static host (Netlify, Vercel, GitHub Pages, etc.).
- Or drag the folder into Netlify Drop: https://app.netlify.com/drop

**Git-connected deploys:** If the repository root contains both `.github/` and `real-estate-site/`, use the repo root as the Netlify/Vercel project and point the **publish directory** / **site folder** at `real-estate-site`. A [`netlify.toml`](../netlify.toml) at the repo root sets `publish = "real-estate-site"` so each push (including automated listing-cache commits) deploys the site. On **Vercel**, set **Root Directory** to `real-estate-site` in project settings.

No server required; the contact form uses a `mailto:` link so submissions go straight to their email. For a future upgrade, you could add a form backend (e.g. Formspree, Netlify Forms) and keep the same “direct to them” flow.

## Listings (Realtor.com API)

Listings are fetched from the [Realtor.com API on RapidAPI](https://rapidapi.com/s.mahmoud97/api/realtor16) **once per day at noon UTC**. The API requires **fulfillment_id** (numeric), not the MongoDB id from the profile URL.

**Setup:**

1. Add `RAPIDAPI_KEY` to `.env` (or `X-RapidAPI-Key`).
2. **Find fulfillment_id**: Run `./fetch-listings.sh --find-fulfillment-id`. It searches agents by location and prints the fulfillment_id if found. Add it to `.env` as `REALTOR_FULFILLMENT_ID=...`
3. Or: set `REALTOR_ADVERTISER_ID` + `REALTOR_AGENT_LOCATION` (e.g. `salado, tx`) for auto-lookup.
4. Run `./fetch-listings.sh` to populate the cache.

**GitHub Actions (daily refresh on the hosted repo):** Commit [`.github/workflows/refresh-listings.yml`](../.github/workflows/refresh-listings.yml) on your **default branch** (`main` or `master`). Enable **Actions** under repo Settings. Add these **repository secrets** (same values as `.env`, but stored only in GitHub):

| Name | Required for active listings in CI |
|------|-------------------------------------|
| `RAPIDAPI_KEY` | Yes |
| `REALTOR_FULFILLMENT_ID` | Yes, unless you set advertiser + location lookup |
| `REALTOR_ADVERTISER_ID` | Optional (used with search if fulfillment id missing) |

Optional **variable** (not a secret): `REALTOR_AGENT_LOCATION` (defaults to `salado, tx` in the workflow).

**Test the workflow:** In GitHub: **Actions** → **Refresh Listings Cache** → **Run workflow**. After it succeeds, confirm a new commit touching `listings-cache.json` / `listings-sold-cache.json`. From a clone with [GitHub CLI](https://cli.github.com/) authenticated, run `./scripts/trigger-listings-refresh.sh` from the repository root.

**Manual fallback:** Open the agent's Realtor.com profile, DevTools → Network, filter XHR, reload. Look for API responses containing `fulfillment_id` in the listing/agent data.

### Past Listings (Sold Properties)

Sold listings are **automatically scraped from [The Banks Group's Compass profile](https://www.compass.com/agents/the-banks-group/)** and synced to your site. The GitHub Action runs daily at noon UTC.

**Automatic sync from Compass:** Run the scraper to pull all sold listings (address, price, beds, baths, sqft, photos):

```bash
cd real-estate-site
pip install playwright && playwright install chromium
./fetch-listings.sh --scrape-compass
```

This writes `listings-sold-manual.json` and updates `listings-sold-cache.json`. New properties added to Compass will appear after the next run.

**Manual overrides:** To enhance specific listings (e.g. add photos, correct price, feature them), create `listings-sold-overrides.json` with entries matching scraped `id`. Example: `[{"id": "1907468925998728641_lid", "price": 2089999, "primaryPhoto": "https://...", "featured": true}]`. The scraper merges these after each run.

## File structure

```
repository root/
  .github/workflows/      # refresh-listings.yml (daily), validate-workflows.yml
  netlify.toml              # publish = real-estate-site (git deploys)
  scripts/trigger-listings-refresh.sh  # optional: gh workflow run helper
real-estate-site/
  index.html               # All content and structure
  listings-cache.json      # Cached active listings (updated daily by GitHub Action)
  listings-sold-cache.json # Cached sold listings (past listings tab)
  listings-sold-manual.json     # Scraped past listings (Compass scraper writes here)
  listings-sold-overrides.json  # Optional: manual enhancements per listing id
  scrape-compass-sold.py  # Playwright scraper for Compass sold listings
  requirements.txt       # Python deps (playwright) for scraper
  styles.css              # Layout and styling
  script.js               # Mobile menu + contact form (mailto)
  README.md               # This file
```

---

After replacing the placeholders above, the site is ready to direct clients straight to your parents for residential sales, commercial sales, and other services.
