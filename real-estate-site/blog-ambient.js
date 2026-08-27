(function () {
  'use strict';

  var ambient = document.querySelector('.blog-ambient');
  if (!ambient) return;

  var layers = ambient.querySelectorAll('[data-parallax]');
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || !layers.length) {
    ambient.classList.add('blog-ambient--static');
    return;
  }

  var scrollY = 0;
  var smoothY = 0;

  function tick() {
    smoothY += (scrollY - smoothY) * 0.075;

    layers.forEach(function (layer) {
      var speed = parseFloat(layer.getAttribute('data-parallax')) || 0.1;
      layer.style.setProperty('--parallax-x', smoothY * speed * 0.35 + 'px');
      layer.style.setProperty('--parallax-y', smoothY * speed + 'px');
    });

    requestAnimationFrame(tick);
  }

  window.addEventListener('scroll', function () {
    scrollY = window.scrollY;
  }, { passive: true });

  tick();
})();
