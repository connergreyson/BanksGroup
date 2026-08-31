#!/usr/bin/env python3
"""Scrape current and sold sales from The Banks Group Compass page."""

from __future__ import annotations

import json
import re
from pathlib import Path

from playwright.sync_api import sync_playwright

AGENT_URL = "https://www.compass.com/agents/the-banks-group/"
ROOT = Path(__file__).resolve().parent

EXTRACT_CARDS_JS = """() => {
  function parsePrice(s) {
    if (!s) return null;
    const m = String(s).replace(/[^\\d]/g, '');
    return m ? Number(m) : null;
  }
  const links = [...document.querySelectorAll('a[href*="/homedetails/"]')];
  const seen = new Set();
  const out = [];
  for (const a of links) {
    if (seen.has(a.href)) continue;
    seen.add(a.href);
    const wrap = a.closest('[class*="card"], article, li') || a.parentElement;
    const text = ((wrap && wrap.innerText) || a.innerText || '').replace(/\\s+/g, ' ').trim();
    const imgs = [...(wrap ? wrap.querySelectorAll('img') : [])];
    const img = imgs.find(i => (i.currentSrc || i.src || '').includes('/m/')) || imgs[0];
    const priceM = text.match(/\\$[\\d,]+/);
    const beds = (text.match(/(\\d+)\\s*(?:bd|Bedrooms?|beds)/i) || [])[1];
    const baths = (text.match(/(\\d+(?:\\.\\d+)?)\\s*(?:ba|Bathrooms?|baths)/i) || [])[1];
    const sqft = (text.match(/([\\d,]+)\\s*(?:sqft|Square Feet)/i) || [])[1];
    const acres = (text.match(/([\\d.]+)\\s*Acres/i) || [])[1];
    const addrM = text.match(/(\\d+[^$]+?TX\\s+\\d{5})/);
    out.push({
      href: a.href,
      address: addrM ? addrM[1].replace(/\\s+/g, ' ').trim() : (a.innerText || '').trim(),
      price: parsePrice(priceM && priceM[0]),
      beds: beds ? Number(beds) : null,
      baths: baths ? Number(baths) : null,
      sqft: sqft ? Number(String(sqft).replace(/,/g, '')) : null,
      acres: acres ? Number(acres) : null,
      photo: img ? (img.currentSrc || img.src) : ''
    });
  }
  return out;
}"""


def upgrade_photo(url: str) -> str:
    if not url:
        return ""
    url = url.split("?")[0]
    url = re.sub(r"/(?:\d+x\d+)\.(webp|jpg|jpeg|png)$", r"/origin.\1", url, flags=re.I)
    url = re.sub(r"http://", "https://", url)
    return url


def listing_id(url: str) -> str:
    m = re.search(r"/([A-Za-z0-9_]+)(?:_lid|_pid)?/?$", url or "")
    return m.group(1) if m else str(abs(hash(url)) % (10**15))


STREET_TYPES = {
    "st", "street", "dr", "drive", "rd", "road", "ln", "lane", "ave", "avenue",
    "blvd", "way", "cv", "cove", "trl", "trail", "loop", "pl", "place", "ct",
    "court", "path", "cyn", "canyon", "pkwy", "parkway", "cir", "circle",
}

def address_from_url(url: str) -> str | None:
    m = re.search(r"/homedetails/([^/]+)/", url or "")
    if not m:
        return None
    parts = m.group(1).split("-")
    if len(parts) < 4 or parts[-2].upper() != "TX" or not parts[-1].isdigit():
        return None
    zipc = parts[-1]
    rest = parts[:-2]
    city: list[str] = []
    i = len(rest) - 1
    while i >= 0:
        token = rest[i]
        if token.lower() in STREET_TYPES or token.lower() == "unit" or token[:1].isdigit():
            break
        city.insert(0, token)
        i -= 1
        if len(city) >= 2:
            break
    street = " ".join(rest[: i + 1])
    city_s = " ".join(city)
    if not street or not city_s:
        return None
    return f"{street}, {city_s}, TX {zipc}"


def to_listing(card: dict, status: str, sort_order: int, featured: bool = False) -> dict:
    addr = address_from_url(card.get("href") or "") or re.sub(r"\s+", " ", (card.get("address") or "").strip())
    acres = card.get("acres")
    lot = int(acres * 43560) if acres else None
    photo = upgrade_photo(card.get("photo") or "")
    return {
        "id": listing_id(card.get("href") or ""),
        "formattedAddress": addr or "Address unavailable",
        "addressLine1": addr.split(",")[0].strip() if addr else "Address",
        "price": card.get("price"),
        "bedrooms": card.get("beds"),
        "bathrooms": card.get("baths"),
        "squareFootage": card.get("sqft"),
        "lotSize": lot,
        "propertyType": "single_family",
        "status": status,
        "listingAgent": {"name": None, "phone": None, "email": None, "website": None},
        "primaryPhoto": photo or None,
        "realtorUrl": card.get("href"),
        "sortOrder": sort_order,
        "featured": featured,
    }


def scrape() -> tuple[list[dict], list[dict]]:
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(
            user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
            )
        )
        page.goto(AGENT_URL, wait_until="domcontentloaded", timeout=45000)
        page.wait_for_timeout(4000)

        first = page.evaluate(EXTRACT_CARDS_JS)
        active_cards = []
        for card in first:
            price = card.get("price") or 0
            href = card.get("href") or ""
            if price >= 20000 and "_pid/" in href:
                active_cards.append(card)
            elif price >= 20000 and len(active_cards) < 5 and "Listed By Compass" in (card.get("address") or ""):
                active_cards.append(card)

        # Prefer the first five high-price cards with _pid (current listings)
        if len(active_cards) < 5:
            active_cards = [c for c in first if (c.get("price") or 0) >= 20000][:5]

        sold_by_href: dict[str, dict] = {}
        for card in first:
            price = card.get("price") or 0
            href = card.get("href") or ""
            if price >= 20000 and "_lid/" in href:
                sold_by_href[href] = card

        for _ in range(12):
            next_btn = page.locator('button[aria-label="Next Page"]:not([disabled])').first
            try:
                if not next_btn.is_visible(timeout=1500):
                    break
            except Exception:
                break
            next_btn.click()
            page.wait_for_timeout(2200)
            for card in page.evaluate(EXTRACT_CARDS_JS):
                price = card.get("price") or 0
                href = card.get("href") or ""
                if price >= 20000 and "_lid/" in href:
                    sold_by_href[href] = card

        browser.close()

    active = [to_listing(c, "For Sale", i + 1) for i, c in enumerate(active_cards[:8])]
    sold = [to_listing(c, "Sold", i + 1, featured=(i == 0)) for i, c in enumerate(sold_by_href.values())]
    sold.sort(key=lambda x: (x.get("price") or 0), reverse=True)
    for i, item in enumerate(sold, start=1):
        item["sortOrder"] = i
        item["featured"] = i == 1
    return active, sold


def add_confirmed_sold(sold: list[dict]) -> list[dict]:
    extras = [
        {
            "id": "1940-blue-river-dr",
            "formattedAddress": "1940 Blue River Dr, Leander, TX 78641",
            "addressLine1": "1940 Blue River Dr",
            "price": 385000,
            "bedrooms": 4,
            "bathrooms": 3,
            "squareFootage": 2248,
            "lotSize": 4400,
            "propertyType": "single_family",
            "status": "Sold",
            "listingAgent": {"name": None, "phone": None, "email": None, "website": None},
            "primaryPhoto": "https://ap.rdcpix.com/7319c68ce212f11ff2f0eb73b3b0e18fl-m3947893606rd-w960_h720.webp",
            "realtorUrl": None,
            "sortOrder": 90,
            "featured": False,
        },
        {
            "id": "529-peace-dr",
            "formattedAddress": "529 Peace Dr, Liberty Hill, TX 78642",
            "addressLine1": "529 Peace Dr",
            "price": 349500,
            "bedrooms": 4,
            "bathrooms": 3,
            "squareFootage": 1931,
            "lotSize": 3733,
            "propertyType": "townhomes",
            "status": "Sold",
            "listingAgent": {"name": None, "phone": None, "email": None, "website": None},
            "primaryPhoto": "https://ap.rdcpix.com/75c4c8c16dea66826be8819fff06e5a5l-m56381435rd-w960_h720.webp",
            "realtorUrl": None,
            "sortOrder": 91,
            "featured": False,
        },
    ]
    seen = {(item.get("formattedAddress") or "").lower() for item in sold}
    for extra in extras:
        key = extra["formattedAddress"].lower()
        if not any(extra["addressLine1"].lower() in addr for addr in seen):
            sold.append(extra)
            seen.add(key)
    return sold


def main() -> int:
    print("Scraping Compass agent page...", flush=True)
    active, sold = scrape()
    sold = add_confirmed_sold(sold)
    (ROOT / "listings-cache.json").write_text(json.dumps(active, indent=2) + "\n")
    (ROOT / "listings-sold-manual.json").write_text(json.dumps(sold, indent=2) + "\n")
    (ROOT / "listings-sold-cache.json").write_text(json.dumps(sold, indent=2) + "\n")
    print(f"Wrote {len(active)} active listings")
    for item in active:
        print(f"  {item['formattedAddress']}  ${item['price']:,}" if item.get("price") else f"  {item['formattedAddress']}")
    print(f"Wrote {len(sold)} sold listings")
    return 0 if active else 1


if __name__ == "__main__":
    raise SystemExit(main())
