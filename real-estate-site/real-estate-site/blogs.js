(function () {
  'use strict';

  window.BLOGS = [];

  function formatBlogDate(dateStr) {
    var date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function getBlogById(id) {
    return BLOGS.find(function (blog) {
      return blog.id === id;
    }) || null;
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function defaultBlogImage(blog) {
    var images = {
      'Home Owner': 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
      'Buyer': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      'Seller': 'https://images.unsplash.com/photo-1605276374101-de7982db1739?w=800&q=80',
      'Investor': 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      'Education': 'https://images.unsplash.com/photo-1560520035-3a235ff2f517?w=800&q=80'
    };
    if (blog.image) {
      return blog.image;
    }
    return images[blog.category] || 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80';
  }

  function renderBlogCard(blog) {
    var href = 'blog-detail.html?id=' + encodeURIComponent(blog.id);
    var excerpt = escapeHtml(blog.excerpt).replace(/\s+$/, '');
    var image = escapeHtml(defaultBlogImage(blog));

    return (
      '<article class="blog-story-card">' +
        '<a href="' + href + '" class="blog-story-link" aria-label="Read: ' + escapeHtml(blog.title) + '">' +
          '<div class="blog-story-image">' +
            '<img src="' + image + '" alt="" width="400" height="250" loading="lazy">' +
          '</div>' +
          '<div class="blog-story-body">' +
            '<h2 class="blog-story-title">' + escapeHtml(blog.title) + '</h2>' +
            '<p class="blog-story-excerpt">' + excerpt + ' <span class="blog-story-more">...more</span></p>' +
            '<p class="blog-story-category">' + escapeHtml(blog.category) + '</p>' +
            '<p class="blog-story-meta">' +
              '<time datetime="' + escapeHtml(blog.date) + '">' + formatBlogDate(blog.date) + '</time>' +
              '<span aria-hidden="true"> • </span>' +
              '<span>' + blog.readTime + ' min read</span>' +
            '</p>' +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }

  function renderBlogDetail(blog) {
    var paragraphs = blog.content.map(function (p) {
      return '<p>' + escapeHtml(p) + '</p>';
    }).join('');
    var imageHtml = blog.image || defaultBlogImage(blog)
      ? '<div class="blog-detail-image"><img src="' + escapeHtml(defaultBlogImage(blog)) + '" alt="" class="blog-detail-img"></div>'
      : '';

    return (
      '<div class="container blog-detail-inner">' +
        '<a href="blog.html" class="blog-detail-back">← All stories</a>' +
        '<header class="blog-detail-header">' +
          '<p class="blog-story-category">' + escapeHtml(blog.category) + '</p>' +
          '<h1>' + escapeHtml(blog.title) + '</h1>' +
          '<p class="blog-detail-meta">' +
            '<time datetime="' + escapeHtml(blog.date) + '">' + formatBlogDate(blog.date) + '</time>' +
            '<span aria-hidden="true"> • </span>' +
            '<span>' + blog.readTime + ' min read</span>' +
          '</p>' +
        '</header>' +
        imageHtml +
        '<div class="blog-detail-content">' + paragraphs + '</div>' +
        '<div class="blog-detail-cta">' +
          '<p>Have questions about buying or selling in Austin?</p>' +
          '<a href="index.html#contact" class="btn btn-primary">Get in touch</a>' +
        '</div>' +
      '</div>'
    );
  }

  function loadBlogs() {
    if (window.__blogsLoadPromise) {
      return window.__blogsLoadPromise;
    }

    window.__blogsLoadPromise = fetch('blogs.json')
      .then(function (response) {
        if (!response.ok) {
          throw new Error('Unable to load blog posts.');
        }
        return response.json();
      })
      .then(function (blogs) {
        if (!Array.isArray(blogs)) {
          throw new Error('Blog data is invalid.');
        }
        window.BLOGS = blogs;
        return blogs;
      })
      .catch(function (err) {
        console.error('Blog load failed:', err);
        window.BLOGS = [];
        throw err;
      });

    return window.__blogsLoadPromise;
  }

  function renderBlogGrid(container, blogs) {
    if (!container) return;
    if (!blogs.length) {
      container.innerHTML = '<p class="blog-empty">No blog posts yet. Check back soon.</p>';
      return;
    }
    container.innerHTML = blogs.map(renderBlogCard).join('');
  }

  function filterBlogs(blogs, category, query) {
    var filtered = blogs.slice();

    if (category && category !== 'all') {
      filtered = filtered.filter(function (blog) {
        return blog.category === category;
      });
    }

    if (query) {
      var needle = query.toLowerCase();
      filtered = filtered.filter(function (blog) {
        return (
          blog.title.toLowerCase().indexOf(needle) !== -1 ||
          blog.excerpt.toLowerCase().indexOf(needle) !== -1 ||
          blog.category.toLowerCase().indexOf(needle) !== -1
        );
      });
    }

    return filtered;
  }

  function getBlogCategories(blogs) {
    var categories = [];
    blogs.forEach(function (blog) {
      if (categories.indexOf(blog.category) === -1) {
        categories.push(blog.category);
      }
    });
    return categories.sort();
  }

  window.loadBlogs = loadBlogs;
  window.getBlogById = getBlogById;
  window.renderBlogCard = renderBlogCard;
  window.renderBlogDetail = renderBlogDetail;
  window.renderBlogGrid = renderBlogGrid;
  window.filterBlogs = filterBlogs;
  window.getBlogCategories = getBlogCategories;
  window.formatBlogDate = formatBlogDate;
})();
