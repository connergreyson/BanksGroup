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
    var cardClass = 'blog-card' + (opts.featured ? ' blog-card--featured' : '');
    var href = 'blog-detail.html?id=' + encodeURIComponent(blog.id);

    return (
      '<article class="' + cardClass + '">' +
        '<a href="' + href + '" class="blog-card-link" aria-label="Read: ' + escapeHtml(blog.title) + '">' +
          '<div class="blog-card-image">' +
            '<img src="' + escapeHtml(blog.image) + '" alt="" class="blog-card-img" width="400" height="260" loading="lazy">' +
          '</div>' +
          '<div class="blog-card-body">' +
            '<span class="blog-card-category">' + escapeHtml(blog.category) + '</span>' +
            '<h3 class="blog-card-title">' + escapeHtml(blog.title) + '</h3>' +
            '<p class="blog-card-excerpt">' + escapeHtml(blog.excerpt) + '</p>' +
            '<p class="blog-card-meta">' +
              '<time datetime="' + escapeHtml(blog.date) + '">' + formatBlogDate(blog.date) + '</time>' +
              '<span aria-hidden="true"> · </span>' +
              '<span>' + blog.readTime + ' min read</span>' +
            '</p>' +
            '<span class="blog-card-more">Read more</span>' +
          '</div>' +
        '</a>' +
      '</article>'
    );
  }

  function renderBlogDetail(blog) {
    var paragraphs = blog.content.map(function (p) {
      return '<p>' + escapeHtml(p) + '</p>';
    }).join('');

    return (
      '<div class="container blog-detail-inner">' +
        '<a href="blog.html" class="blog-detail-back">← All stories</a>' +
        '<header class="blog-detail-header">' +
          '<span class="blog-card-category">' + escapeHtml(blog.category) + '</span>' +
          '<h1>' + escapeHtml(blog.title) + '</h1>' +
          '<p class="blog-detail-meta">' +
            '<time datetime="' + escapeHtml(blog.date) + '">' + formatBlogDate(blog.date) + '</time>' +
            '<span aria-hidden="true"> · </span>' +
            '<span>' + blog.readTime + ' min read</span>' +
          '</p>' +
        '</header>' +
        '<div class="blog-detail-image">' +
          '<img src="' + escapeHtml(blog.image) + '" alt="" class="blog-detail-img" width="1120" height="560">' +
        '</div>' +
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

  function initBlogCarousel(blogCarousel, blogPrev, blogNext, blogs) {
    if (!blogCarousel || !blogs.length) return;

    blogCarousel.innerHTML = blogs.map(function (blog) {
      return renderBlogCard(blog);
    }).join('');

    function updateBlogNavButtons() {
      if (!blogPrev || !blogNext) return;
      var maxScroll = blogCarousel.scrollWidth - blogCarousel.clientWidth;
      blogPrev.disabled = blogCarousel.scrollLeft <= 4;
      blogNext.disabled = blogCarousel.scrollLeft >= maxScroll - 4;
    }

    function scrollBlogCarousel(direction) {
      var card = blogCarousel.querySelector('.blog-card');
      var scrollAmount = card ? card.offsetWidth + 24 : 360;
      blogCarousel.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
    }

    if (blogPrev) {
      blogPrev.addEventListener('click', function () {
        scrollBlogCarousel(-1);
      });
    }

    if (blogNext) {
      blogNext.addEventListener('click', function () {
        scrollBlogCarousel(1);
      });
    }

    blogCarousel.addEventListener('scroll', updateBlogNavButtons, { passive: true });
    window.addEventListener('resize', updateBlogNavButtons);
    updateBlogNavButtons();
  }

  window.loadBlogs = loadBlogs;
  window.getBlogById = getBlogById;
  window.renderBlogCard = renderBlogCard;
  window.renderBlogDetail = renderBlogDetail;
  window.renderBlogGrid = renderBlogGrid;
  window.initBlogCarousel = initBlogCarousel;
  window.formatBlogDate = formatBlogDate;
})();
