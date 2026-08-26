'use strict';

const fs = require('fs');
const path = require('path');

const blogsDir = path.join(__dirname, '../real-estate-site/content/blogs');
const outFile = path.join(__dirname, '../real-estate-site/blogs.json');

function normalizeDate(value) {
  if (!value) return '';
  const str = String(value);
  return str.length >= 10 ? str.slice(0, 10) : str;
}

function bodyToContent(body) {
  if (!body || typeof body !== 'string') return [];
  return body
    .split(/\n\s*\n/)
    .map(function (paragraph) {
      return paragraph.trim();
    })
    .filter(Boolean);
}

function readBlogFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const data = JSON.parse(raw);

  if (!data.id || !data.title) {
    throw new Error('Blog file missing required fields (id, title): ' + filePath);
  }

  const blog = {
    id: String(data.id).trim(),
    title: String(data.title).trim(),
    excerpt: String(data.excerpt || '').trim(),
    category: String(data.category || 'Buyer').trim(),
    date: normalizeDate(data.date),
    readTime: Number(data.readTime) || 4,
    image: String(data.image || '').trim(),
    content: Array.isArray(data.content) && data.content.length
      ? data.content.map(function (p) { return String(p).trim(); }).filter(Boolean)
      : bodyToContent(data.body)
  };

  if (!blog.content.length) {
    throw new Error('Blog file has no article content: ' + filePath);
  }

  return blog;
}

if (!fs.existsSync(blogsDir)) {
  console.error('Blog content directory not found:', blogsDir);
  process.exit(1);
}

const files = fs.readdirSync(blogsDir).filter(function (name) {
  return name.endsWith('.json');
});

if (!files.length) {
  console.warn('No blog JSON files found in', blogsDir);
}

const blogs = files
  .map(function (name) {
    return readBlogFile(path.join(blogsDir, name));
  })
  .sort(function (a, b) {
    return new Date(b.date) - new Date(a.date);
  });

fs.writeFileSync(outFile, JSON.stringify(blogs, null, 2) + '\n');
console.log('Built blogs.json with', blogs.length, 'post(s).');
