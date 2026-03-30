'use strict';

/**
 * Listings: fetch from cache and render.
 * Data is updated daily by GitHub Action (1 Realtor.com API call at noon).
 */

function formatPrice(n) {
  if (n == null || isNaN(n)) return '—';
  return '$' + n.toLocaleString();
}

function escapeHtml(s) {
  if (s == null || s === '') return '';
  var div = document.createElement('div');
  div.textContent = s;
  return div.innerHTML;
}

function renderListingCard(listing) {
  var id = escapeHtml(listing.id || '');
  var addr = escapeHtml(listing.formattedAddress || listing.addressLine1 || 'Address unavailable');
  var price = formatPrice(listing.price);
  var beds = listing.bedrooms != null ? listing.bedrooms + ' bd' : '';
  var baths = listing.bathrooms != null ? listing.bathrooms + ' ba' : '';
  var sqft = listing.squareFootage ? listing.squareFootage.toLocaleString() + ' sqft' : '';
  var type = escapeHtml(listing.propertyType || '');
  var status = escapeHtml(listing.status || '');
  var detailUrl = 'listing-detail.html?id=' + encodeURIComponent(id);
  var photoUrl = listing.primaryPhoto || listing.primary_photo;

  var imageContent = photoUrl
    ? '<img src="' + escapeHtml(photoUrl) + '" alt="' + escapeHtml(addr) + '" class="listing-card-img" loading="lazy" decoding="async">'
    : '<span class="listing-card-placeholder" aria-hidden="true">' + (type || 'Property') + '</span>';

  return (
    '<article class="listing-card">' +
      '<a href="' + detailUrl + '" class="listing-card-link">' +
        '<div class="listing-card-image">' +
          imageContent +
        '</div>' +
        '<div class="listing-card-body">' +
          '<span class="listing-card-price">' + price + '</span>' +
          '<h3 class="listing-card-address">' + addr + '</h3>' +
          '<p class="listing-card-meta">' +
            [beds, baths, sqft].filter(Boolean).join(' · ') +
          '</p>' +
          (status ? '<span class="listing-card-status">' + status + '</span>' : '') +
        '</div>' +
      '</a>' +
    '</article>'
  );
}

function renderListingGrid(listings, options) {
  if (!Array.isArray(listings) || listings.length === 0) {
    var msg = (options && options.emptyMessage) || 'No listings available. Listings are refreshed daily.';
    return '<p class="listings-empty">' + escapeHtml(msg) + '</p>';
  }
  return listings.map(function (l) { return renderListingCard(l); }).join('');
}

function renderListingDetail(listing) {
  var addr = escapeHtml(listing.formattedAddress || listing.addressLine1 || 'Address unavailable');
  var price = formatPrice(listing.price);
  var beds = listing.bedrooms != null ? listing.bedrooms : '—';
  var baths = listing.bathrooms != null ? listing.bathrooms : '—';
  var sqft = listing.squareFootage ? listing.squareFootage.toLocaleString() : '—';
  var lotSize = listing.lotSize ? listing.lotSize.toLocaleString() : '';
  var type = escapeHtml(listing.propertyType || '');
  var yearBuilt = listing.yearBuilt || '';
  var status = escapeHtml(listing.status || '');
  var daysOnMarket = listing.daysOnMarket != null ? listing.daysOnMarket : '';
  var mlsNum = escapeHtml(listing.mlsNumber || '');
  var agent = listing.listingAgent || {};
  var agentName = escapeHtml(agent.name || '');
  var agentPhone = agent.phone ? agent.phone.replace(/\D/g, '') : '';
  var agentEmail = escapeHtml(agent.email || '');
  var agentWebsite = escapeHtml(agent.website || '');
  var hoaFee = listing.hoa && listing.hoa.fee ? '$' + listing.hoa.fee + '/mo' : '';
  var contactMailto = 'mailto:tracy.banks@compass.com?subject=Inquiry%20about%20' + encodeURIComponent(addr);

  var rows = [
    ['Bedrooms', beds],
    ['Bathrooms', baths],
    ['Square feet', sqft],
    lotSize ? ['Lot size', lotSize + ' sqft'] : null,
    type ? ['Property type', type] : null,
    yearBuilt ? ['Year built', yearBuilt] : null,
    status ? ['Status', status] : null,
    daysOnMarket ? ['Days on market', daysOnMarket] : null,
    mlsNum ? ['MLS #', mlsNum] : null,
    hoaFee ? ['HOA', hoaFee] : null
  ].filter(Boolean);

  var agentBlock = '';
  if (agentName || agentPhone || agentEmail) {
    agentBlock =
      '<div class="listing-detail-agent">' +
        '<h3>Listing contact</h3>' +
        (agentName ? '<p class="listing-detail-agent-name">' + agentName + '</p>' : '') +
        (agentPhone ? '<p><a href="tel:' + agentPhone + '">' + escapeHtml(agent.phone || agentPhone) + '</a></p>' : '') +
        (agentEmail ? '<p><a href="mailto:' + agentEmail + '">' + agentEmail + '</a></p>' : '') +
        (agentWebsite ? '<p><a href="' + agentWebsite + '" rel="noopener noreferrer" target="_blank">View website</a></p>' : '') +
      '</div>';
  }

  var photoUrl = listing.primaryPhoto || listing.primary_photo;
  var detailImageContent = photoUrl
    ? '<img src="' + escapeHtml(photoUrl) + '" alt="' + addr + '" class="listing-detail-img" loading="lazy" decoding="async">'
    : '<span class="listing-card-placeholder" aria-hidden="true">' + (type || 'Property') + '</span>';

  return (
    '<div class="container">' +
      '<a href="listings.html" class="listing-detail-back">← Back to listings</a>' +
      '<div class="listing-detail-image">' +
        detailImageContent +
      '</div>' +
      '<div class="listing-detail-body">' +
        '<span class="listing-detail-price">' + price + '</span>' +
        '<h1 class="listing-detail-address">' + addr + '</h1>' +
        '<dl class="listing-detail-specs">' +
          rows.map(function (r) {
            return '<dt>' + escapeHtml(r[0]) + '</dt><dd>' + escapeHtml(String(r[1])) + '</dd>';
          }).join('') +
        '</dl>' +
        agentBlock +
        (listing.realtorUrl ? '<a href="' + escapeHtml(listing.realtorUrl) + '" class="btn btn-secondary listing-detail-realtor" rel="noopener noreferrer" target="_blank">' + (listing.realtorUrl.indexOf('compass.com') !== -1 ? 'View on Compass' : 'View photos &amp; details on Realtor.com') + '</a>' : '') +
        '<a href="' + contactMailto + '" class="btn btn-primary listing-detail-cta">Contact us about this property</a>' +
      '</div>' +
    '</div>'
  );
}

function fetchListings() {
  return fetch('listings-cache.json')
    .then(function (r) {
      if (!r.ok) throw new Error('Failed to load listings');
      return r.json();
    });
}

/**
 * Sorts sold listings: featured first, then by price (highest to lowest).
 */
function sortSoldListings(listings) {
  if (!Array.isArray(listings) || listings.length === 0) return listings;
  return listings.slice().sort(function (a, b) {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    var aPrice = a.price != null ? a.price : 0;
    var bPrice = b.price != null ? b.price : 0;
    if (aPrice !== bPrice) return bPrice - aPrice;
    var aSqft = a.squareFootage != null ? a.squareFootage : 0;
    var bSqft = b.squareFootage != null ? b.squareFootage : 0;
    return bSqft - aSqft;
  });
}

function fetchSoldListings() {
  return fetch('listings-sold-cache.json')
    .then(function (r) {
      if (!r.ok) return [];
      return r.json();
    })
    .then(function (listings) {
      return sortSoldListings(listings);
    })
    .catch(function () {
      return [];
    });
}
