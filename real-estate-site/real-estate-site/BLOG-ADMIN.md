# Blog publishing for Marty & Tracy

Your parents can write and publish blog posts from a simple admin page—no code required. Posts appear on the **Blogs** page (same style as professional real estate sites like T. Kerr Property Group).

## What customers see

1. Click **Blogs** in the top menu
2. Browse posts with title, summary, category, and date
3. Click any post to read the full article

The homepage also shows the **3 latest posts** with a **More stories** button.

## One-time Netlify setup (you do this once)

Your site must be connected to Netlify from GitHub first. Then:

1. Open your site in [Netlify](https://app.netlify.com)
2. Go to **Project configuration → Identity** → **Enable Identity**
3. Under Identity, open **Services → Git Gateway** → **Enable Git Gateway**
4. Go to **Identity → Invite users** and invite Marty and Tracy’s emails

Admin URL (where Marty and Tracy write posts):

**https://thebanks.group/admin**

Public site (what customers see):

**https://thebanks.group**

## How Marty & Tracy publish each week

1. Go to **`/admin`** on the website
2. Log in with their invited email and password
3. Click **Blog Posts → New Blog Post**
4. Fill in:
   - **URL Slug** — short link name (example: `spring-market-update`)
   - **Title** — headline customers see
   - **Publish Date** — when the post should appear
   - **Category** — Buyer, Seller, Home Owner, Investor, or Education
   - **Short Summary** — 1–2 sentences shown on the card (like T. Kerr’s preview text)
   - **Cover Photo** — optional (shows on the full article page only)
   - **Read Time** — estimated minutes (usually 3–5)
   - **Article** — full blog text. Press **Enter twice** between paragraphs.
5. Click **Publish**
6. Wait 1–2 minutes for the site to rebuild — the post appears under **Blogs**

## Editing or deleting a post

1. Log in at `/admin`
2. Click **Blog Posts**
3. Select the post
4. Edit or delete, then click **Publish** again

## Tips for writing (like T. Kerr’s blog)

- Use question-style titles: “How Do I Know What My Home Is Worth?”
- Keep summaries short and local: mention Austin or Central Texas when relevant
- Pick the right category so customers can filter on the Blogs page
- Separate paragraphs with a blank line in the Article field

## Troubleshooting

**Admin page won’t load or login fails**  
Enable both Identity and Git Gateway in Netlify.

**Post published but not visible**  
Wait 2–3 minutes, then hard-refresh (`Cmd+Shift+R` on Mac).

**Need help adding a post manually**  
Send the title, summary, category, date, and article text — it can be added to `content/blogs/` as a JSON file.
