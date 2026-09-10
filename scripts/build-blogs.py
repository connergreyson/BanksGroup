#!/usr/bin/env python3
"""Build blogs.json from content/blogs/*.json for the static site."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
BLOGS_DIR = ROOT / "real-estate-site" / "content" / "blogs"
OUT_FILE = ROOT / "real-estate-site" / "blogs.json"
SITEMAP_FILE = ROOT / "real-estate-site" / "sitemap.xml"
SITE_ORIGIN = "https://thebanks.group"


def write_sitemap(blogs: list[dict]) -> None:
    from datetime import date

    today = date.today().isoformat()
    pages = [
        ("/", "1.0", "weekly"),
        ("/georgetown.html", "0.9", "weekly"),
        ("/listings.html", "0.8", "daily"),
        ("/blog.html", "0.7", "weekly"),
    ]
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ]
    for path, priority, changefreq in pages:
        loc = SITE_ORIGIN + path
        lines.extend(
            [
                "  <url>",
                f"    <loc>{loc}</loc>",
                f"    <lastmod>{today}</lastmod>",
                f"    <changefreq>{changefreq}</changefreq>",
                f"    <priority>{priority}</priority>",
                "  </url>",
            ]
        )
    for blog in blogs:
        blog_id = blog.get("id", "").strip()
        if not blog_id:
            continue
        lastmod = blog.get("date") or today
        loc = f"{SITE_ORIGIN}/blog-detail.html?id={blog_id}"
        lines.extend(
            [
                "  <url>",
                f"    <loc>{loc}</loc>",
                f"    <lastmod>{lastmod}</lastmod>",
                "    <changefreq>monthly</changefreq>",
                "    <priority>0.6</priority>",
                "  </url>",
            ]
        )
    lines.append("</urlset>")
    lines.append("")
    SITEMAP_FILE.write_text("\n".join(lines), encoding="utf-8")


def body_to_content(body: str) -> list[str]:
    if not body:
        return []
    return [part.strip() for part in re.split(r"\n\s*\n", body) if part.strip()]


def read_blog_file(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))

    if not data.get("id") or not data.get("title"):
        raise ValueError(f"Blog file missing required fields (id, title): {path}")

    content = data.get("content")
    if not isinstance(content, list) or not content:
        content = body_to_content(data.get("body", ""))

    if not content:
        raise ValueError(f"Blog file has no article content: {path}")

    return {
        "id": str(data["id"]).strip(),
        "title": str(data["title"]).strip(),
        "excerpt": str(data.get("excerpt", "")).strip(),
        "category": str(data.get("category", "Buyer")).strip(),
        "date": str(data.get("date", ""))[:10],
        "readTime": int(data.get("readTime") or 4),
        "image": str(data.get("image", "")).strip(),
        "content": [str(paragraph).strip() for paragraph in content if str(paragraph).strip()],
    }


def main() -> int:
    if not BLOGS_DIR.is_dir():
        print(f"Blog content directory not found: {BLOGS_DIR}", file=sys.stderr)
        return 1

    files = sorted(BLOGS_DIR.glob("*.json"))
    if not files:
        print(f"No blog JSON files found in {BLOGS_DIR}")

    blogs = [read_blog_file(path) for path in files]
    blogs.sort(key=lambda blog: blog["date"], reverse=True)

    OUT_FILE.write_text(json.dumps(blogs, indent=2) + "\n", encoding="utf-8")
    write_sitemap(blogs)
    print(f"Built blogs.json with {len(blogs)} post(s).")
    print(f"Wrote sitemap.xml with {len(blogs) + 4} URL(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
