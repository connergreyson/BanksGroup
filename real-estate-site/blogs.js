(function () {
  'use strict';

  var BLOGS = [
    {
      id: 'home-value-austin',
      title: 'How Do I Know What My Home Is Worth in Today\'s Market?',
      excerpt: 'What your home is worth in today\'s Austin market. Get a real, local valuation—not a guess. Start here.',
      category: 'Home Owner',
      date: '2026-08-10',
      readTime: 4,
      image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80',
      content: [
        'If you\'re thinking about selling, the first question is almost always: "What is my house worth?" Online estimates can be a starting point, but they often miss the nuances of your neighborhood, recent upgrades, and current buyer demand in Austin.',
        'A true market valuation looks at comparable sales within the last 90 days, active competition on the market, and the specific features that make your home stand out—lot size, school district, condition, and timing.',
        'At The Banks Group, we provide complimentary market analyses tailored to your property. We walk through your home, review recent comps in your area, and give you a clear picture of what buyers are paying today—not what the algorithm guessed.',
        'Whether you\'re ready to list now or just exploring your options, knowing your home\'s value is the foundation of every smart real estate decision. Reach out for a no-obligation conversation.'
      ]
    },
    {
      id: 'buyer-mistakes',
      title: 'What Are the Biggest Mistakes Home Buyers Make?',
      excerpt: 'The biggest mistakes home buyers make in Austin. Learn what to watch for before you buy and get a clear plan.',
      category: 'Buyer',
      date: '2026-08-05',
      readTime: 5,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      content: [
        'Buying a home is one of the biggest financial decisions you\'ll make. In a competitive market like Austin, small missteps can cost you the house—or cost you more than you needed to pay.',
        'One of the most common mistakes is starting the search before getting pre-approved. Sellers and their agents take pre-approved buyers seriously. Without it, your offer may not even be considered.',
        'Another pitfall is skipping the inspection to make an offer more competitive. While waiving contingencies can win a bidding war, it can also leave you with expensive surprises after closing. Know the risks before you decide.',
        'Buyers also underestimate the total cost of ownership—property taxes in Texas, HOA fees, insurance, and maintenance add up quickly. We help you build a realistic budget before you fall in love with a home outside your range.',
        'Working with experienced local agents who know the Austin market inside and out can help you avoid these traps and move forward with confidence.'
      ]
    },
    {
      id: 'questions-before-offer',
      title: 'What Questions Should I Ask Before Making an Offer?',
      excerpt: 'Questions to ask before making an offer in Austin. Know what to ask first for a smart, confident offer.',
      category: 'Buyer',
      date: '2026-07-28',
      readTime: 4,
      image: 'https://images.unsplash.com/photo-1605276374101-de7982db1739?w=800&q=80',
      content: [
        'You\'ve found a home you love. Before you write an offer, pause and ask the right questions. The answers will shape your strategy and protect your interests.',
        'How long has the property been on the market? A fresh listing may have multiple offers coming; a home that\'s sat for weeks might have room to negotiate.',
        'Why is the seller moving? Motivated sellers—relocating for work, downsizing, or facing a deadline—may be more flexible on price or terms.',
        'What\'s included in the sale? Fixtures, appliances, and even furniture can sometimes be negotiated. Clarify upfront so there are no surprises at closing.',
        'Are there any known issues with the property? Disclosure documents in Texas require sellers to share known defects. Read them carefully and follow up with your agent on anything unclear.',
        'What are comparable homes selling for nearby? Your agent should provide a comparative market analysis so your offer is competitive without overpaying.',
        'We guide our buyers through every one of these questions so you can make an offer you feel good about.'
      ]
    },
    {
      id: 'first-time-buyer-austin',
      title: 'A First-Time Buyer\'s Guide to Austin Neighborhoods',
      excerpt: 'From Round Rock to South Austin, a practical guide to finding the right neighborhood for your lifestyle and budget.',
      category: 'Buyer',
      date: '2026-07-15',
      readTime: 6,
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
      content: [
        'Austin is more than one city—it\'s a collection of distinct neighborhoods, each with its own character, price point, and commute profile. For first-time buyers, choosing the right area is just as important as choosing the right house.',
        'North Austin and the suburbs—Round Rock, Cedar Park, and Leander—offer newer construction, strong schools, and relative affordability compared to central Austin. Commutes to major employers can be manageable with planning.',
        'East Austin has seen significant growth and revitalization. Buyers here find a mix of historic charm and modern development, with easy access to downtown and the airport.',
        'South Austin appeals to those who want a laid-back vibe, live music, and outdoor access. Prices vary widely from more affordable pockets to premium lakefront communities.',
        'West Austin and the Hill Country offer scenic views and larger lots, often at higher price points. If space and nature are priorities, this corridor is worth exploring.',
        'We help first-time buyers match their priorities—schools, commute, nightlife, outdoor access—to the neighborhoods that fit. Schedule a consultation to start your search with clarity.'
      ]
    },
    {
      id: 'staging-tips-sellers',
      title: '5 Staging Tips That Help Homes Sell Faster',
      excerpt: 'Simple, high-impact staging strategies that make a strong first impression without breaking the bank.',
      category: 'Seller',
      date: '2026-07-01',
      readTime: 3,
      image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
      content: [
        'First impressions matter. Buyers decide within seconds whether a home feels like theirs. Strategic staging helps your property photograph well and show its best at every showing.',
        'Declutter ruthlessly. Clear countertops, tidy closets, and minimal furniture make rooms feel larger and allow buyers to imagine their own belongings in the space.',
        'Depersonalize without stripping character. Remove family photos and excess décor, but keep warm touches like fresh flowers or a neutral throw that make the home feel lived-in and inviting.',
        'Maximize natural light. Open blinds, clean windows, and add mirrors in darker rooms. Bright spaces feel more spacious and welcoming.',
        'Focus on curb appeal. Mow the lawn, trim hedges, and add a potted plant by the front door. Buyers often decide before they walk inside.',
        'Address small repairs. A dripping faucet, scuffed wall, or loose doorknob signals neglect. Fix the easy stuff before listing.',
        'The Banks Group helps sellers prepare their homes for market with practical staging advice and professional photography. Ask us about our listing prep process.'
      ]
    },
    {
      id: 'investment-property-austin',
      title: 'Is Austin Still a Good Market for Investment Properties?',
      excerpt: 'A look at rental demand, appreciation trends, and what investors should consider in Central Texas today.',
      category: 'Investor',
      date: '2026-06-20',
      readTime: 5,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
      content: [
        'Austin\'s rapid growth over the past decade has made it one of the most watched real estate markets in the country. For investors, the question is whether the fundamentals still support buying here.',
        'Population growth remains strong, driven by tech, healthcare, and university employment. People continue moving to the area, which supports both rental demand and long-term appreciation.',
        'Rental rates have stabilized after the post-pandemic surge, but vacancy rates in desirable submarkets remain low. Cash-flowing properties exist—you need to know where to look and what numbers to run.',
        'Investors should focus on total return: cash flow, appreciation potential, and tax benefits. Texas has no state income tax, which can improve net returns for out-of-state buyers.',
        'Commercial and multi-family opportunities also exist for those with larger capital. We work with investors on acquisitions across residential and commercial asset classes.',
        'Every investment is unique. We\'ll help you analyze the numbers, understand the local market, and find properties that align with your goals.'
      ]
    }
  ];

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

  window.BLOGS = BLOGS;
  window.getBlogById = getBlogById;
  window.renderBlogCard = renderBlogCard;
  window.renderBlogDetail = renderBlogDetail;
  window.formatBlogDate = formatBlogDate;
})();
