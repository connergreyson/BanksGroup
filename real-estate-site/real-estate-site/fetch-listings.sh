#!/usr/bin/env bash
# Fetch agent listings from Realtor.com API (RapidAPI).
# The API expects fulfillment_id (numeric), not the MongoDB id from the profile URL.
#
# Two options:
# A) Set REALTOR_FULFILLMENT_ID in .env (find via --find-fulfillment-id)
# B) Set REALTOR_ADVERTISER_ID + REALTOR_AGENT_LOCATION to auto-lookup fulfillment_id

set -e
cd "$(dirname "$0")"

if [ -f .env ]; then
  RAPIDAPI_KEY=$(grep -E '^(RAPIDAPI_KEY|X_RAPIDAPI_KEY|X-RapidAPI-Key)=' .env | head -1 | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  REALTOR_FULFILLMENT_ID=$(grep -E '^REALTOR_FULFILLMENT_ID=' .env | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  REALTOR_ADVERTISER_ID=$(grep -E '^REALTOR_ADVERTISER_ID=' .env | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  REALTOR_AGENT_LOCATION=$(grep -E '^REALTOR_AGENT_LOCATION=' .env | cut -d= -f2- | tr -d '"' | tr -d "'" | tr -d '\r')
  export RAPIDAPI_KEY REALTOR_FULFILLMENT_ID REALTOR_ADVERTISER_ID REALTOR_AGENT_LOCATION
fi

# Mode: scrape Compass for sold listings, then update sold cache (no API key needed)
if [ "$1" = "--scrape-compass" ]; then
  echo "Scraping sold listings from Compass..."
  if python3 scrape-compass-sold.py 2>/dev/null; then
    echo "Scrape complete. Updating sold cache..."
  else
    echo "Warning: Scraper failed or playwright not installed. Using existing listings-sold-manual.json if present."
  fi
  exec "$0" --manual-only
fi

# Mode: update sold cache from manual JSON only (no API key needed)
if [ "$1" = "--manual-only" ]; then
  echo "Updating sold listings from listings-sold-manual.json..."
  python3 -c "
import json, os
sold_items = []
if os.path.isfile('listings-sold-manual.json'):
    with open('listings-sold-manual.json') as f:
        manual = json.load(f)
    if isinstance(manual, list):
        for m in manual:
            if isinstance(m, dict) and m.get('id'):
                m.setdefault('status', 'Sold')
                sold_items.append({
                    'id': m.get('id'),
                    'formattedAddress': m.get('formattedAddress') or m.get('address') or 'Address unavailable',
                    'addressLine1': m.get('addressLine1') or (m.get('formattedAddress') or '').split(',')[0].strip() or 'Address',
                    'price': m.get('price'),
                    'bedrooms': m.get('bedrooms'),
                    'bathrooms': m.get('bathrooms'),
                    'squareFootage': m.get('squareFootage'),
                    'lotSize': m.get('lotSize'),
                    'propertyType': m.get('propertyType'),
                    'status': m.get('status', 'Sold'),
                    'listingAgent': m.get('listingAgent', {'name': None, 'phone': None, 'email': None, 'website': None}),
                    'primaryPhoto': m.get('primaryPhoto') or m.get('primary_photo'),
                    'realtorUrl': m.get('realtorUrl') or m.get('realtor_url'),
                    'sortOrder': m.get('sortOrder'),
                    'featured': m.get('featured'),
                    'mlsNumber': m.get('mlsNumber'),
                    'yearBuilt': m.get('yearBuilt')
                })
with open('listings-sold-cache.json', 'w') as f:
    json.dump(sold_items, f, indent=2)
print('Cached', len(sold_items), 'sold listings to listings-sold-cache.json')
"
  exit 0
fi

if [ -z "$RAPIDAPI_KEY" ]; then
  echo "Error: RAPIDAPI_KEY not set. Add it to .env (or X-RapidAPI-Key)"
  exit 1
fi

API_HEADERS=(-H "x-rapidapi-key: $RAPIDAPI_KEY" -H "x-rapidapi-host: realtor16.p.rapidapi.com")

# Mode: find fulfillment_id from agent search (tries several locations)
if [ "$1" = "--find-fulfillment-id" ]; then
  if [ -z "$REALTOR_ADVERTISER_ID" ]; then
    echo "Error: Set REALTOR_ADVERTISER_ID (MongoDB id from profile URL) in .env"
    exit 1
  fi
  for LOC in "${REALTOR_AGENT_LOCATION:-salado, tx}" "liberty hill, tx" "georgetown, tx" "austin, tx" "temple, tx"; do
    echo "Trying: $LOC"
    ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$LOC'))")
    RESP=$(curl -s "${API_HEADERS[@]}" "https://realtor16.p.rapidapi.com/agent/search?location=${ENCODED}&sort=RELEVANT_AGENTS")
    FID=$(echo "$RESP" | python3 -c "
import json,sys
oid='$REALTOR_ADVERTISER_ID'
d=json.load(sys.stdin)
for a in d.get('data',{}).get('search_agents',{}).get('agents',[]):
    if a.get('id')==oid:
        print(a.get('fulfillment_id',''))
        sys.exit(0)
" 2>/dev/null)
    if [ -n "$FID" ]; then
      echo "FOUND! Add to .env:"
      echo "REALTOR_FULFILLMENT_ID=$FID"
      exit 0
    fi
    sleep 1
  done
  echo "Agent not found. Try adding REALTOR_FULFILLMENT_ID manually from Realtor.com profile (DevTools → Network)."
  exit 1
fi

# Resolve fulfillment_id
FID="$REALTOR_FULFILLMENT_ID"
if [ -z "$FID" ] && [ -n "$REALTOR_ADVERTISER_ID" ] && [ -n "$REALTOR_AGENT_LOCATION" ]; then
  echo "Looking up fulfillment_id from agent search..."
  ENCODED=$(python3 -c "import urllib.parse; print(urllib.parse.quote('$REALTOR_AGENT_LOCATION'))")
  SEARCH_RESP=$(curl -s "${API_HEADERS[@]}" "https://realtor16.p.rapidapi.com/agent/search?location=${ENCODED}&sort=RELEVANT_AGENTS")
  FID=$(echo "$SEARCH_RESP" | python3 -c "
import json,sys
oid='$REALTOR_ADVERTISER_ID'
d=json.load(sys.stdin)
for a in d.get('data',{}).get('search_agents',{}).get('agents',[]):
    if a.get('id')==oid:
        print(a.get('fulfillment_id',''))
        break
" 2>/dev/null)
  if [ -z "$FID" ]; then
    echo "Error: Could not find agent. Run ./fetch-listings.sh --find-fulfillment-id to debug."
    echo "Or add REALTOR_FULFILLMENT_ID manually (see README)."
    exit 1
  fi
  echo "Found fulfillment_id: $FID"
fi

if [ -z "$FID" ]; then
  echo "Error: Set REALTOR_FULFILLMENT_ID in .env, or REALTOR_ADVERTISER_ID + REALTOR_AGENT_LOCATION"
  exit 1
fi

echo "Fetching agent listings (fulfillment_id=$FID)..."
RESP=$(curl -s -w "\n%{http_code}" "${API_HEADERS[@]}" \
  "https://realtor16.p.rapidapi.com/agent/listings?advertiser_id=${FID}")

HTTP_CODE=$(echo "$RESP" | tail -n1)
BODY=$(echo "$RESP" | sed '$d')

if [ "$HTTP_CODE" != "200" ]; then
  echo "Error: Realtor API returned $HTTP_CODE"
  echo "$BODY"
  exit 1
fi

# Try sold-listings endpoint (Realtor16 may support this)
SOLD_FILE=$(mktemp)
trap "rm -f '$SOLD_FILE'" EXIT
SOLD_RAW="$(dirname "$0")/sold-raw.json"
SOLD_RESP=$(curl -s -w "\n%{http_code}" "${API_HEADERS[@]}" "https://realtor16.p.rapidapi.com/agent/sold-listings?advertiser_id=${FID}")
SOLD_HTTP=$(echo "$SOLD_RESP" | tail -n1)
SOLD_BODY=$(echo "$SOLD_RESP" | sed '$d')
echo "$SOLD_BODY" > "$SOLD_FILE"
echo "$SOLD_BODY" > "$SOLD_RAW"
echo "Sold endpoint HTTP $SOLD_HTTP (raw response saved to sold-raw.json)"

# Normalize Realtor16 response: forSale, forRent, openHouses (active) + sold/closed (past listings)
export SOLD_FILE
echo "$BODY" | python3 -c "
import json, sys, os

raw = json.load(sys.stdin)
sold_file = os.environ.get('SOLD_FILE', '')
if sold_file and os.path.isfile(sold_file):
    try:
        with open(sold_file) as f:
            sold_raw = json.load(f)
        sold_results = []
        # Handle various response structures from sold-listings endpoint
        for root in (sold_raw, sold_raw.get('data') or {}):
            if isinstance(root, list):
                sold_results = root
                break
            if not isinstance(root, dict):
                continue
            for key in ('sold', 'closed', 'soldListings', 'recentlySold', 'pastListings', 'listings'):
                val = root.get(key)
                if isinstance(val, list):
                    sold_results = val
                    break
                if isinstance(val, dict) and val.get('results'):
                    sold_results = val['results']
                    break
            if sold_results:
                break
            if root.get('results'):
                sold_results = root['results']
                break
        if sold_results:
            data = raw.get('data') or raw
            if isinstance(data, dict):
                data.setdefault('sold', {}).setdefault('results', []).extend(sold_results)
    except Exception:
        pass
active_items = []
sold_items = []
data = raw.get('data') or raw
SOLD_KEYS = ('sold', 'closed', 'soldListings', 'recentlySold', 'pastListings')
ACTIVE_KEYS = ('forSale', 'forRent', 'openHouses')

def extract_results(val):
    if isinstance(val, dict) and val.get('results'):
        return val['results']
    if isinstance(val, list):
        return val
    return []

def is_sold_listing(l, source_key):
    if source_key in SOLD_KEYS:
        return True
    status = (l.get('status') or '').lower()
    return status in ('sold', 'closed')

def get_primary_photo_url(l):
    '''Extract primary/first photo URL from various API structures.'''
    pp = l.get('primary_photo') or l.get('primaryPhoto')
    if isinstance(pp, dict):
        url = pp.get('href') or pp.get('url') or pp.get('small') or pp.get('medium')
        if url:
            return url
    if isinstance(pp, str):
        return pp
    photos = l.get('photos') or l.get('media') or l.get('images')
    if isinstance(photos, list) and photos:
        first = photos[0]
        if isinstance(first, dict):
            return first.get('href') or first.get('url') or first.get('small') or first.get('medium')
        if isinstance(first, str):
            return first
    return None

def norm(l):
    addr = l.get('location', {}).get('address') or {}
    if isinstance(addr, dict):
        line = addr.get('line') or addr.get('line_1') or ''
        city = addr.get('city') or ''
        state = addr.get('state') or addr.get('state_code') or ''
        zipcode = addr.get('postal_code') or addr.get('zip_code') or ''
        addr = ', '.join(filter(None, [line, city, state, zipcode]))
    addr = addr or l.get('address') or l.get('formatted_address') or 'Address unavailable'
    if isinstance(addr, dict):
        addr = ' '.join(str(v) for v in addr.values() if v)
    desc = l.get('description') or {}
    if not isinstance(desc, dict):
        desc = {}
    price = l.get('list_price') or l.get('price')
    photo = get_primary_photo_url(l)
    return {
        'id': l.get('listing_id') or l.get('property_id') or l.get('permalink') or str(abs(hash(json.dumps(l, default=str)))),
        'formattedAddress': addr,
        'addressLine1': (addr.split(',')[0] if ',' in str(addr) else addr).strip(),
        'price': price,
        'bedrooms': desc.get('beds') or l.get('bedrooms') or l.get('beds'),
        'bathrooms': desc.get('baths') or l.get('bathrooms') or l.get('baths'),
        'squareFootage': desc.get('sqft') or l.get('square_feet') or l.get('sqft'),
        'lotSize': desc.get('lot_sqft') or l.get('lot_size'),
        'propertyType': desc.get('type') or l.get('property_type') or l.get('type'),
        'status': l.get('status') or 'Active',
        'listingAgent': {'name': None, 'phone': None, 'email': None, 'website': None},
        'primaryPhoto': photo
    }

if isinstance(data, dict):
    for key, val in data.items():
        if not isinstance(val, (dict, list)):
            continue
        results = extract_results(val)
        if not results:
            continue
        for r in results:
            n = norm(r)
            if is_sold_listing(r, key):
                n['status'] = n.get('status') or 'Sold'
                sold_items.append(n)
            else:
                active_items.append(n)

# Merge manual sold listings (listings-sold-manual.json) when API returns nothing or in addition
if os.path.isfile('listings-sold-manual.json'):
    try:
        with open('listings-sold-manual.json') as f:
            manual_sold = json.load(f)
        if isinstance(manual_sold, list):
            seen = {n['id'] for n in sold_items}
            for m in manual_sold:
                if isinstance(m, dict) and m.get('id') and m['id'] not in seen:
                    m.setdefault('status', 'Sold')
                    manual_sold_norm = {
                        'id': m.get('id'),
                        'formattedAddress': m.get('formattedAddress') or m.get('address') or 'Address unavailable',
                        'addressLine1': m.get('addressLine1') or (m.get('formattedAddress') or '').split(',')[0].strip() or 'Address',
                        'price': m.get('price'),
                        'bedrooms': m.get('bedrooms'),
                        'bathrooms': m.get('bathrooms'),
                        'squareFootage': m.get('squareFootage'),
                        'lotSize': m.get('lotSize'),
                        'propertyType': m.get('propertyType'),
                        'status': m.get('status', 'Sold'),
                        'listingAgent': m.get('listingAgent', {'name': None, 'phone': None, 'email': None, 'website': None}),
                        'primaryPhoto': m.get('primaryPhoto') or m.get('primary_photo') or None,
                        'realtorUrl': m.get('realtorUrl') or m.get('realtor_url'),
                        'sortOrder': m.get('sortOrder'),
                        'featured': m.get('featured')
                    }
                    sold_items.append(manual_sold_norm)
                    seen.add(m['id'])
    except Exception:
        pass

with open('listings-cache.json', 'w') as f:
    json.dump(active_items, f, indent=2)
with open('listings-sold-cache.json', 'w') as f:
    json.dump(sold_items, f, indent=2)
print('Cached', len(active_items), 'active listings to listings-cache.json')
print('Cached', len(sold_items), 'sold listings to listings-sold-cache.json')
"
