# How to Find fulfillment_id Manually

Realtor.com blocks automated crawlers, so you need to get it from your browser.

## Method 1: Browser DevTools (Recommended)

1. Open the agent profile in Chrome:  
   https://www.realtor.com/realestateagents/5b1ae745b328d7001710fe3d

2. Open DevTools (F12 or Cmd+Option+I).

3. Go to the **Network** tab.

4. Filter by **Fetch/XHR** (or type `fulfillment` in the filter box).

5. **Refresh the page**.

6. Find a request that returns listing or agent JSON. Click it → **Preview** or **Response**.

7. In the JSON, search for `fulfillment_id` (Ctrl+F / Cmd+F). It will look like:
   ```json
   "fulfillment_id": "1234567"
   ```
   or inside `"advertisers": [{"fulfillment_id": "1234567"}]`.

8. Add to `.env`:
   ```
   REALTOR_FULFILLMENT_ID=1234567
   ```

## Method 2: Run the finder script

With `REALTOR_ADVERTISER_ID` and `REALTOR_AGENT_LOCATION` set in `.env`:

```bash
./fetch-listings.sh --find-fulfillment-id
```

This searches agent results by location. If Tracy shows up, it prints her `fulfillment_id`.

## Method 3: Check a listing page

1. Open one of Tracy’s listings (e.g. 1219 Logan Blvd, Salado).
2. DevTools → Network → Fetch/XHR.
3. Refresh and inspect the API responses.
4. Search for `fulfillment_id` in the JSON.
