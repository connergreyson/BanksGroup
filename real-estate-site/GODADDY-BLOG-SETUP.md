# Blog admin on GoDaddy (thebanks.group)

This package adds a **public Blogs page** and a **password-protected admin** that works on GoDaddy hosting (PHP). No Netlify required.

## What to upload

Upload these files/folders into GoDaddy **`public_html`** (merge with your existing site):

```
public_html/
  blog.html
  blog-detail.html
  blog.css
  blogs.js
  blogs.json
  data/
    blogs.json
    .htaccess
  admin/
    login.php
    index.php
    edit.php
    logout.php
    admin.css
    config.php          ← you create this (see below)
    includes/
    .htaccess
```

Also add to every page `<head>` if not already in `styles.css`:

```html
<link rel="stylesheet" href="blog.css">
```

Your **Blogs** menu link should point to `blog.html` (you already have this).

---

## One-time admin setup

### 1. Create admin password

On your computer, run:

```bash
php -r "echo password_hash('ChooseAStrongPassword', PASSWORD_DEFAULT), PHP_EOL;"
```

### 2. Create `admin/config.php`

Copy `admin/config.example.php` to `admin/config.php` and paste the hash:

```php
<?php
return [
    'username' => 'admin',
    'password_hash' => 'PASTE_HASH_HERE',
];
```

Upload `config.php` to GoDaddy **`public_html/admin/`**.

### 3. Set folder permissions (cPanel File Manager)

- `data/` folder → **755** (writable by PHP)
- `data/blogs.json` → **644** or **666** if saves fail
- `blogs.json` (site root) → **644** or **666** if saves fail

---

## Admin URLs

| Page | URL |
|------|-----|
| **Login** | https://thebanks.group/admin/login.php |
| **Manage posts** | https://thebanks.group/admin/ |
| **Public blog** | https://thebanks.group/blog.html |

Share the admin login only with Marty and Tracy.

---

## How your parents publish a post

1. Go to **https://thebanks.group/admin/login.php**
2. Sign in
3. Click **New post**
4. Fill in title, summary, category, and article
5. Click **Publish**

The post appears on **blog.html** immediately.

---

## Troubleshooting

**Blog page empty**  
Make sure `blogs.json` exists in `public_html` and is valid JSON.

**“Unable to save post”**  
Increase write permissions on `data/` and `blogs.json`.

**Admin shows blank page**  
GoDaddy must have **PHP enabled** (standard on cPanel hosting). Check PHP version is 7.4+.

**404 on admin/login.php**  
Confirm the `admin/` folder was uploaded to `public_html/admin/`, not nested incorrectly.

---

## Security tips

- Use a strong admin password
- Do not share `config.php`
- Delete `config.example.php` from the server after setup (optional)
- Bookmark `/admin/login.php` — do not link it from the public website
