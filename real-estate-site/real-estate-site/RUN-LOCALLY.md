# Run the website without Netlify

The Banks Group site is a **static website** — plain HTML, CSS, and JavaScript. You do **not** need Netlify to view or host it.

## Quick start (on your computer)

From the project folder:

```bash
cd real-estate-site
chmod +x start.sh
./start.sh
```

Then open **http://localhost:8000** in your browser.

Or manually:

```bash
python3 -m http.server 8000
```

Open **http://localhost:8000** (run the command from inside `real-estate-site/`).

> **Important:** Do not open `index.html` by double-clicking it. Browsers block blog/listings data when using `file://`. Always use a local server.

---

## Host somewhere other than Netlify

Upload the **`real-estate-site`** folder to any static host:

| Platform | Notes |
|----------|--------|
| **Vercel** | Connect GitHub repo; set root directory to `real-estate-site` |
| **GitHub Pages** | Publish the `real-estate-site` folder |
| **Cloudflare Pages** | Same as Vercel — static deploy |
| **Any web host** | Upload files via FTP/cPanel to `public_html` |

Point **thebanks.group** DNS to whichever host you choose.

---

## Updating blogs without Netlify `/admin`

The `/admin` editor only works with Netlify Identity. Without Netlify, add posts by editing files:

1. Create a new file in `content/blogs/`, e.g. `my-new-post.json`:

```json
{
  "id": "my-new-post",
  "title": "Your Blog Title",
  "excerpt": "One or two sentence summary for the card.",
  "category": "Buyer",
  "date": "2026-08-25",
  "readTime": 4,
  "image": "",
  "body": "First paragraph.\n\nSecond paragraph.\n\nThird paragraph."
}
```

2. Rebuild the blog list:

```bash
cd real-estate-site
python3 build-blogs.py
```

3. Refresh the site (or re-upload files to your host).

Categories: `Buyer`, `Seller`, `Home Owner`, `Investor`, `Education`

---

## What Netlify was used for

| Feature | Without Netlify |
|---------|-----------------|
| Viewing the site | Local server or any static host |
| Blog pages | Works everywhere |
| `/admin` blog editor | Not available — edit JSON files instead |
| Auto deploy on git push | Use your host’s deploy (Vercel, etc.) |

---

## Troubleshooting

**Blogs page says “Unable to load”**  
Run `./start.sh` or `python3 scripts/build-blogs.py` so `blogs.json` exists.

**Listings empty**  
Listings use cached JSON files (`listings-cache.json`). Refresh them with `./fetch-listings.sh` if you have API keys in `.env`.
