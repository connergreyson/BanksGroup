#!/usr/bin/env python3
"""Build blogs.json from content/blogs/*.json (run from real-estate-site/)."""

from __future__ import annotations

import json
import re
import sys
from pathlib import Path

SITE_ROOT = Path(__file__).resolve().parent
BLOGS_DIR = SITE_ROOT / "content" / "blogs"
OUT_FILE = SITE_ROOT / "blogs.json"


def body_to_content(body: str) -> list[str]:
    if not body:
        return []
    return [part.strip() for part in re.split(r"\n\s*\n", body) if part.strip()]


def read_blog_file(path: Path) -> dict:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not data.get("id") or not data.get("title"):
        raise ValueError(f"Missing id/title: {path}")

    content = data.get("content")
    if not isinstance(content, list) or not content:
        content = body_to_content(data.get("body", ""))
    if not content:
        raise ValueError(f"No content: {path}")

    return {
        "id": str(data["id"]).strip(),
        "title": str(data["title"]).strip(),
        "excerpt": str(data.get("excerpt", "")).strip(),
        "category": str(data.get("category", "Buyer")).strip(),
        "date": str(data.get("date", ""))[:10],
        "readTime": int(data.get("readTime") or 4),
        "image": str(data.get("image", "")).strip(),
        "content": [str(p).strip() for p in content if str(p).strip()],
    }


def main() -> int:
    if not BLOGS_DIR.is_dir():
        print(f"No blog folder: {BLOGS_DIR}", file=sys.stderr)
        return 0

    blogs = [read_blog_file(path) for path in sorted(BLOGS_DIR.glob("*.json"))]
    blogs.sort(key=lambda b: b["date"], reverse=True)
    OUT_FILE.write_text(json.dumps(blogs, indent=2) + "\n", encoding="utf-8")
    print(f"Built blogs.json with {len(blogs)} post(s).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
