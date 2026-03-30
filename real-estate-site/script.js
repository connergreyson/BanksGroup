(function () {
  'use strict';

  // Hero video: slow playback
  var heroVideo = document.getElementById('hero-video');
  if (heroVideo) {
    heroVideo.addEventListener('loadedmetadata', function () {
      heroVideo.playbackRate = 0.75;
    });
    heroVideo.playbackRate = 0.75;
  }

  // Mobile menu
  var menuToggle = document.querySelector('.menu-toggle');
  var nav = document.querySelector('.nav');

  if (menuToggle && nav) {
    menuToggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    document.addEventListener('click', function (e) {
      if (nav.classList.contains('open') &&
          !nav.contains(e.target) &&
          !menuToggle.contains(e.target)) {
        nav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Hero form: redirect to contact or mailto
  var heroForm = document.getElementById('hero-form');
  if (heroForm) {
    heroForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = heroForm.querySelector('input[name="email"]');
      if (emailInput && emailInput.value.trim()) {
        window.location.href = '#contact';
      }
    });
  }

  // Testimonial carousel
  var dots = document.querySelectorAll('.carousel-dots .dot');
  var track = document.querySelector('.testimonial-track');
  var cards = document.querySelectorAll('.testimonial-card');
  var carousel = document.querySelector('.testimonials-carousel');

  if (dots.length && track && cards.length) {
    var currentIndex = 0;
    var autoAdvanceId = null;

    function goToSlide(index) {
      if (index < 0 || index >= cards.length) return;
      currentIndex = index;
      track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentIndex);
        dot.setAttribute('aria-current', i === currentIndex ? 'true' : 'false');
      });
      // Reset auto-advance when user interacts
      if (autoAdvanceId) {
        clearInterval(autoAdvanceId);
        autoAdvanceId = setInterval(function () {
          goToSlide((currentIndex + 1) % cards.length);
        }, 10000);
      }
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        goToSlide(i);
      });
    });

    // Touch swipe support
    if (carousel) {
      var touchStartX = 0;
      var touchStartY = 0;
      var SWIPE_THRESHOLD = 50;

      carousel.addEventListener('touchstart', function (e) {
        if (!e.touches || e.touches.length === 0) return;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }, { passive: true });

      carousel.addEventListener('touchend', function (e) {
        if (!e.changedTouches || e.changedTouches.length === 0) return;
        var touchEndX = e.changedTouches[0].clientX;
        var touchEndY = e.changedTouches[0].clientY;
        var deltaX = touchEndX - touchStartX;
        var deltaY = touchEndY - touchStartY;

        if (Math.abs(deltaX) > SWIPE_THRESHOLD && Math.abs(deltaX) > Math.abs(deltaY)) {
          if (deltaX < 0) {
            goToSlide(currentIndex + 1);
          } else {
            goToSlide(currentIndex - 1);
          }
        }
      }, { passive: true });

      // Mouse drag support for desktop
      carousel.addEventListener('mousedown', function (e) {
        var mouseStartX = e.clientX;
        function onMouseMove(ev) {
          var deltaX = ev.clientX - mouseStartX;
          if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
            if (deltaX < 0) {
              goToSlide(currentIndex + 1);
            } else {
              goToSlide(currentIndex - 1);
            }
            cleanup();
          }
        }
        function cleanup() {
          document.removeEventListener('mousemove', onMouseMove);
          document.removeEventListener('mouseup', cleanup);
        }
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', cleanup);
      });
    }

    // Auto-advance (optional)
    autoAdvanceId = setInterval(function () {
      goToSlide((currentIndex + 1) % cards.length);
    }, 10000);
  }

  // Stats counter: animate placeholder number (Slash-style ticker)
  var statsValue = document.getElementById('stats-value');
  if (statsValue) {
    var targetValue = '$25M+';
    statsValue.textContent = targetValue;
  }

  // Contact form: POST to Formspree, show success/error without leaving page
  var form = document.getElementById('contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var submitBtn = form.querySelector('button[type="submit"]');
      var existing = form.querySelector('.form-success, .form-error');
      if (existing) existing.remove();

      if (submitBtn) submitBtn.disabled = true;

      var formData = new FormData(form);

      fetch(form.action, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      })
        .then(function (response) {
          if (response.ok) {
            var success = document.createElement('p');
            success.className = 'form-success';
            success.textContent = 'Thanks for reaching out! We\'ll get back to you soon.';
            form.appendChild(success);
            form.reset();
          } else {
            throw new Error('Form submission failed');
          }
        })
        .catch(function (err) {
          console.error('Contact form error:', err);
          var error = document.createElement('p');
          error.className = 'form-error';
          error.textContent = 'Something went wrong. Please try again or email us directly.';
          form.appendChild(error);
        })
        .finally(function () {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }
})();
