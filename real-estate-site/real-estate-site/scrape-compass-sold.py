#!/usr/bin/env python3
"""
Scrape sold listings from The Banks Group's Compass agent page.
Outputs to listings-sold-manual.json for use by fetch-listings.sh.

Compass loads content via JavaScript, so we use Playwright (headless browser).
Run: pip install playwright && playwright install chromium
"""

from __future__ import annotations

import json
import os
import re
import sys
from pathlib import Path

try:
    from playwright.sync_api import sync_playwright
except ImportError:
    print(
        "Error: playwright not installed. Run:\n"
        "  pip install playwright\n"
        "  playwright install chromium",
        file=sys.stderr,
    )
    sys.exit(1)

AGENT_URL = "https://www.compass.com/agents/the-banks-group/"
OUTPUT_FILE = Path(__file__).resolve().parent / "listings-sold-manual.json"


def parse_price(text: str | None) -> int | None:
    """Parse '$365,000' or '$1,500,000' from text. Only matches $ prefixed values."""
    if not text:
        return None
    m = re.search(r"\$\s*([\d,]+)", text)
    if not m:
        return None
    cleaned = re.sub(r"[^\d]", "", m.group(1))
    return int(cleaned) if cleaned else None


def parse_int(s: str | None) -> int | None:
    """Parse '4' or '1,919' to int."""
    if s is None:
        return None
    cleaned = re.sub(r"[^\d]", "", str(s))
    return int(cleaned) if cleaned else None


def parse_sqft(s: str | None) -> int | None:
    """Parse '1,919 Square Feet' or '912 sqft' to int."""
    return parse_int(s)


def parse_acres(s: str | None) -> int | None:
    """Parse '0.09 Acres' to sqft (approximate: acres * 43560)."""
    if not s:
        return None
    m = re.search(r"([\d.]+)\s*acres?", s, re.I)
    if not m:
        return None
    try:
        acres = float(m.group(1))
        return int(acres * 43560)
    except ValueError:
        return None


def extract_listing_id(url: str | None) -> str:
    """Extract listing ID from Compass URL for use as id field."""
    if not url:
        return str(hash(url) & 0x7FFFFFFF)
    # e.g. .../homedetails/529-Peace-Dr.../1978434789147057753_lid/ or /1GISO2_pid/
    m = re.search(r"/([A-Za-z0-9_]+)(?:_lid|_pid)?/?$", url)
    return m.group(1) if m else str(abs(hash(url)) % (10**15))


def scrape_sold_listings() -> list[dict]:
    """Load Compass agent page, switch to sold tab, extract all sold listings."""
    listings = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page = context.new_page()

        # Capture API responses that may contain listing URLs
        api_listing_urls = []

        def capture_response(response):
            try:
                url_str = response.url
                ctype = (response.headers.get("content-type") or "").lower()
                if response.status != 200 or "json" not in ctype:
                    return
                body = response.json()
                def extract_urls(obj, depth=0):
                    if depth > 15:
                        return
                    if isinstance(obj, dict):
                        for k, v in obj.items():
                            if k in ("permalink", "url", "href") and isinstance(v, str) and "homedetails" in v:
                                api_listing_urls.append(v if v.startswith("http") else "https://www.compass.com" + v)
                            extract_urls(v, depth + 1)
                    elif isinstance(obj, list):
                        for x in obj:
                            extract_urls(x, depth + 1)
                extract_urls(body)
            except Exception:
                pass

        page.on("response", capture_response)

        # Load agent page with sold tab
        try:
            page.goto(AGENT_URL + "?tab=sold", wait_until="networkidle", timeout=30000)
            page.wait_for_timeout(4000)
        except Exception as e:
            print(f"Warning: Load: {e}", file=sys.stderr)

        # Ensure we're on sold tab; try clicking if not
        if "tab=sold" not in page.url:
            sold_selectors = [
                'a[href*="tab=sold"]',
                'button:has-text("Sold")',
                '[role="tab"]:has-text("Sold")',
                'a:has-text("Sold")',
                'a:has-text("Past Sales")',
                'a:has-text("Past Listings")',
            ]
            for sel in sold_selectors:
                try:
                    el = page.locator(sel).first
                    if el.is_visible(timeout=2000):
                        el.click()
                        page.wait_for_timeout(2500)
                        break
                except Exception:
                    pass

        def collect_listing_urls():
            """Collect all homedetails URLs from current page DOM."""
            return page.evaluate("""() => {
                const links = Array.from(document.querySelectorAll('a[href*="/homedetails/"]'));
                return [...new Set(links.map(a => {
                    const h = a.getAttribute('href') || '';
                    return h.startsWith('http') ? h : 'https://www.compass.com' + (h.startsWith('/') ? h : '/' + h);
                }))];
            }""")

        # Phase 1a: Load page 1, scroll to get all listings (infinite scroll)
        prev_urls = set()
        for scroll_idx in range(80):
            page.evaluate("""
                () => {
                    window.scrollTo(0, document.body.scrollHeight);
                    document.querySelectorAll('[style*="overflow-y"]').forEach(el => {
                        if (el.scrollHeight > el.clientHeight) el.scrollTop = el.scrollHeight;
                    });
                }
            """)
            page.wait_for_timeout(1500)
            for sel in [
                'button:has-text("Load more")', 'a:has-text("Load more")',
                'button:has-text("Show more")', 'a:has-text("Show more")',
                'button:has-text("See all")', 'a:has-text("See all")',
                'button:has-text("View all")', 'a:has-text("View all")',
                '[aria-label*="Load more"]', '[aria-label*="Show more"]',
            ]:
                try:
                    el = page.locator(sel).first
                    if el.is_visible(timeout=400):
                        el.scroll_into_view_if_needed()
                        page.wait_for_timeout(300)
                        el.click()
                        page.wait_for_timeout(2500)
                        break
                except Exception:
                    pass
            urls = set(collect_listing_urls())
            if urls == prev_urls:
                if scroll_idx > 15:
                    break
            prev_urls = urls

        all_urls = set(collect_listing_urls())
        print(f"Page 1: {len(all_urls)} listing URLs", file=sys.stderr)

        # Phase 1b: Try pagination (Compass may use ?page=N or similar)
        for page_num in range(2, 11):
            try:
                page.goto(f"{AGENT_URL}?tab=sold&page={page_num}", wait_until="domcontentloaded", timeout=12000)
                page.wait_for_timeout(2000)
                for _ in range(8):
                    page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                    page.wait_for_timeout(700)
                urls = set(collect_listing_urls())
                before = len(all_urls)
                all_urls.update(urls)
                if len(all_urls) > before:
                    print(f"Page {page_num}: +{len(all_urls) - before} new URLs ({len(all_urls)} total)", file=sys.stderr)
            except Exception:
                pass

        all_urls.update(u for u in api_listing_urls if u and "homedetails" in u)
        print(f"Total: {len(all_urls)} unique listing URLs", file=sys.stderr)

        # Phase 2: Visit each listing detail page to extract full data + photo (skip rentals)
        print("Extracting sold listings (excluding rentals)...", file=sys.stderr)
        total = len(all_urls)
        skipped_rentals = 0
        for idx, full_url in enumerate(all_urls):
            try:
                page.goto(full_url, wait_until="domcontentloaded", timeout=15000)
                page.wait_for_timeout(2000)
                data = page.evaluate(
                    """() => {
                    const out = { addr: '', price: null, beds: null, baths: null, sqft: null, lot: null, photo: '', isRental: false };
                    const text = (document.body.innerText || '');
                    const textLower = text.toLowerCase();
                    const isRentalPhrase = (s) => textLower.includes(s);
                    if (isRentalPhrase('for rent') || isRentalPhrase('for lease') ||
                        isRentalPhrase('monthly rent') || isRentalPhrase('rent per month') ||
                        isRentalPhrase('available for lease')) {
                        out.isRental = true;
                        return out;
                    }
                    const priceMatch = text.match(/\\$\\s*([\\d,]+)\\s*(?:\\/|per)\\s*mo/);
                    if (priceMatch) { out.isRental = true; return out; }
                    const h1 = document.querySelector('h1');
                    if (h1) out.addr = h1.innerText.trim();
                    const priceEl = document.querySelector('[class*="price"], [data-testid*="price"]');
                    if (priceEl) {
                        const pt = priceEl.innerText || '';
                        if (/\\/\\s*mo|per\\s+month/i.test(pt)) { out.isRental = true; return out; }
                        const m = pt.match(/\\$\\s*([\\d,]+)/);
                        if (m) out.price = parseInt(m[1].replace(/\\D/g,''), 10);
                    }
                    const addrMatch = document.body.innerText.match(/(\\d+[\\w\\s]+(?:Street|St|Drive|Dr|Rd|Lane|Ln|Ave|Blvd|Way)[^\\n]+,[^\\n]+,\\s*TX\\s+\\d{5})/);
                    if (!out.addr && addrMatch) out.addr = addrMatch[1].trim();
                    const bedMatch = text.match(/(\\d+)\\s*(?:Bed|bd|Bedrooms?)/);
                    if (bedMatch) { const b = parseInt(bedMatch[1],10); if (b>=1 && b<=20) out.beds = b; }
                    const bathMatch = text.match(/(\\d+)\\s*(?:Bath|ba|Bathrooms?)/);
                    if (bathMatch) { const b = parseInt(bathMatch[1],10); if (b>=1 && b<=20) out.baths = b; }
                    const sqftMatch = text.match(/([\\d,]+)\\s*(?:square feet|sqft|sq ft)/);
                    if (sqftMatch) out.sqft = parseInt(sqftMatch[1].replace(/\\D/g,''), 10);
                    const imgs = document.querySelectorAll('img[src*="compass.com"], img[src*="cloudfront"]');
                    for (const img of imgs) {
                        const s = (img.src || '').toLowerCase();
                        if (s && (s.includes('/origin.') || s.includes('_img_')) && !s.includes('avatar') && !s.includes('logo'))
                            { out.photo = img.src; break; }
                    }
                    if (!out.photo && imgs.length) out.photo = imgs[0].src;
                    return out;
                }"""
                )
                if data.get("isRental"):
                    skipped_rentals += 1
                    continue
                listing_id = extract_listing_id(full_url)
                addr = re.sub(r"\s+", " ", (data.get("addr") or "").strip())
                addr_line1 = addr.split(",")[0].strip() if addr else "Address"
                listings.append({
                    "id": listing_id,
                    "formattedAddress": addr or "Address unavailable",
                    "addressLine1": addr_line1,
                    "price": data.get("price"),
                    "bedrooms": data.get("beds"),
                    "bathrooms": data.get("baths"),
                    "squareFootage": data.get("sqft"),
                    "lotSize": data.get("lot"),
                    "propertyType": "single_family",
                    "status": "Sold",
                    "sortOrder": len(listings) + 1,
                    "featured": False,
                    "primaryPhoto": data.get("photo") or "",
                    "realtorUrl": full_url,
                })
                if (idx + 1) % 10 == 0:
                    print(f"  Processed {idx + 1}/{total} listings...", file=sys.stderr)
                page.wait_for_timeout(400)
            except Exception:
                continue

        browser.close()
        if skipped_rentals:
            print(f"  Excluded {skipped_rentals} rental(s), kept {len(listings)} sales", file=sys.stderr)

    # Deduplicate by id (prefer _lid over _pid when same address to avoid duplicate cards)
    by_id = {}
    for L in listings:
        by_id[L["id"]] = L

    # Merge manual overrides (price, primaryPhoto, featured, sortOrder for specific listings)
    overrides_file = OUTPUT_FILE.parent / "listings-sold-overrides.json"
    if overrides_file.exists():
        try:
            with open(overrides_file) as f:
                overrides = json.load(f)
            for ov in overrides if isinstance(overrides, list) else [overrides]:
                oid = ov.get("id")
                if oid and oid in by_id:
                    for key in ("price", "primaryPhoto", "featured", "sortOrder", "formattedAddress", "bedrooms", "bathrooms", "squareFootage", "lotSize"):
                        if key in ov and ov[key] is not None:
                            by_id[oid][key] = ov[key]
        except Exception:
            pass

    return list(by_id.values())


def main() -> int:
    script_dir = Path(__file__).resolve().parent
    os.chdir(script_dir)
    print("Scraping sold listings from Compass...", file=sys.stderr)
    listings = scrape_sold_listings()
    if not listings:
        print("No listings found. Compass may have changed their page structure.", file=sys.stderr)
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w") as f:
        json.dump(listings, f, indent=2)
    print(f"Wrote {len(listings)} sold listings to {OUTPUT_FILE}", file=sys.stderr)
    return 0 if listings else 1


if __name__ == "__main__":
    sys.exit(main())
