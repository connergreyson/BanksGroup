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

  function renderBlogCard(blog, options) {
    var opts = options || {};
    var cardClass = 'blog-story-card';
    if (opts.compact) cardClass += ' blog-story-card--compact';
    var href = 'blog-detail.html?id=' + encodeURIComponent(blog.id);
    var excerpt = escapeHtml(blog.excerpt).replace(/\s+$/, '');

    return (
      '<article class="' + cardClass + '">' +
        '<a href="' + href + '" class="blog-story-link" aria-label="Read: ' + escapeHtml(blog.title) + '">' +
          '<h3 class="blog-story-title">' + escapeHtml(blog.title) + '</h3>' +
          '<p class="blog-story-excerpt">' + excerpt + ' <span class="blog-story-more">...more</span></p>' +
          '<p class="blog-story-category">' + escapeHtml(blog.category) + '</p>' +
          '<p class="blog-story-meta">' +
            '<time datetime="' + escapeHtml(blog.date) + '">' + formatBlogDate(blog.date) + '</time>' +
            '<span aria-hidden="true"> • </span>' +
            '<span>' + blog.readTime + ' min read</span>' +
          '</p>' +
        '</a>' +
      '</article>'
    );
  }

  function renderBlogDetail(blog) {
    var paragraphs = blog.content.map(function (p) {
      return '<p>' + escapeHtml(p) + '</p>';
    }).join('');
    var imageHtml = blog.image
      ? '<div class="blog-detail-image">' +
          '<img src="' + escapeHtml(blog.image) + '" alt="" class="blog-detail-img" width="1120" height="560">' +
        '</div>'
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

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
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
    container.innerHTML = blogs.map(function (blog) {
      return renderBlogCard(blog);
    }).join('');
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

  function initBlogCarousel(blogCarousel, blogs, options) {
    var opts = options || {};
    var limit = opts.limit || blogs.length;
    var subset = blogs.slice(0, limit);

    if (!blogCarousel || !subset.length) return;

    blogCarousel.innerHTML = subset.map(function (blog) {
      return renderBlogCard(blog, { compact: true });
    }).join('');
  }

  window.loadBlogs = loadBlogs;
  window.getBlogById = getBlogById;
  window.renderBlogCard = renderBlogCard;
  window.renderBlogDetail = renderBlogDetail;
  window.renderBlogGrid = renderBlogGrid;
  window.initBlogCarousel = initBlogCarousel;
  window.filterBlogs = filterBlogs;
  window.getBlogCategories = getBlogCategories;
  window.formatBlogDate = formatBlogDate;
})();
