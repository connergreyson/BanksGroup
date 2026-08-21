# Blog publishing for Marty & Tracy

Your parents can write and publish blog posts from a simple admin page—no code required. Published posts appear automatically on the **Blogs** page that customers reach from the top menu.

## Customer experience

1. Visitor clicks **Blogs** in the top navigation
2. They see all published posts on `blog.html`
3. Clicking a post opens the full article

## One-time setup (you do this once in Netlify)

These steps connect the admin login to your website:

1. Open [Netlify](https://app.netlify.com) and select the Banks Group site
2. Go to **Site configuration → Identity** and click **Enable Identity**
3. Under Identity, open **Services → Git Gateway** and click **Enable Git Gateway**
4. Go to **Identity → Invite users** and invite Marty and Tracy’s email addresses
5. They will receive an email to set a password

After this, the admin page is ready at:

**`https://YOUR-SITE-URL/admin`**

Replace `YOUR-SITE-URL` with your live Netlify domain (for example `banksgroup.netlify.app` or your custom domain).

## How Marty & Tracy publish a weekly blog

1. Go to **`https://YOUR-SITE-URL/admin`**
2. Log in with the email and password from the invite
3. Click **Blog Posts → New Blog Post**
4. Fill in the form:
   - **URL Slug** — short name for the link (example: `spring-market-update`)
   - **Title** — headline customers will see
   - **Publish Date** — when the post should show
   - **Category** — Buyer, Seller, Home Owner, or Investor
   - **Short Summary** — one or two sentences for the preview card
   - **Cover Photo** — optional; upload a photo or leave blank
   - **Read Time** — estimated minutes to read (usually 3–5)
   - **Article** — the full blog text (press Enter twice between paragraphs)
5. Click **Publish**
6. Wait about 1–2 minutes for the site to rebuild; the new post will appear on the Blogs page

## Editing or removing a post

1. Log in at `/admin`
2. Click **Blog Posts**
3. Select the post to edit or delete
4. Click **Publish** again after saving changes

## Where content is stored

| What | Location |
|------|----------|
| Blog source files (what the CMS edits) | `real-estate-site/content/blogs/*.json` |
| Built file the website reads | `real-estate-site/blogs.json` (auto-generated on deploy) |
| Uploaded photos | `real-estate-site/assets/images/blog/` |
| Admin editor | `real-estate-site/admin/` |

When a post is published in the admin, Netlify saves the JSON file to GitHub and runs the build script, which updates `blogs.json` on the live site.

## Tips for writing posts

- Use a clear, helpful title (questions work well, e.g. “What Should I Know Before Making an Offer?”)
- Keep the summary to 1–2 sentences
- Separate paragraphs with a blank line in the Article field
- Use categories consistently so readers can scan by topic

## Troubleshooting

**“Failed to load” on the admin page**  
Make sure Identity and Git Gateway are both enabled in Netlify.

**Post published but not on the website**  
Wait 2–3 minutes for the deploy to finish, then hard-refresh the page (`Cmd+Shift+R` on Mac).

**Need help adding a post manually**  
Send the title, summary, category, date, and article text; it can be added to `content/blogs/` as a JSON file.
