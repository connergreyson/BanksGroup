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
    print(f"Built blogs.json with {len(blogs)} post(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
