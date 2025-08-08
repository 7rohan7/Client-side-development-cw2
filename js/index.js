// jQuery version of index.js
$(document).ready(function () {
  const $mobileMenuBtn = $('#mobileMenuBtn');
  const $mainNav = $('#mainNav ul');

  // Mobile menu toggle
  $mobileMenuBtn.on('click', function () {
    $mainNav.slideToggle(200);
    $(this).attr('aria-expanded', $mainNav.is(':visible'));
  });

  // Smooth scrolling
  $('a[href^="#"]').on('click', function (e) {
    const href = $(this).attr('href');
    if (href !== '#') {
      e.preventDefault();
      const $target = $(href);
      if ($target.length) {
        $('html, body').animate({
          scrollTop: $target.offset().top - 70
        }, 600);
      }
    }
  });

  // Feature card hover animation
  $('.feature-card').hover(
    function () {
      $(this).css({
        transform: 'translateY(-5px)',
        boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
      });
    },
    function () {
      $(this).css({
        transform: 'translateY(0)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
      });
    }
  );

  // Hero section fade-in
  $('.hero-content, .hero-image').css('opacity', 0);
  setTimeout(() => {
    $('.hero-content, .hero-image').css({
      transition: 'opacity 1s',
      opacity: 1
    });
  }, 100);

  // Feature card staggered fade-in
  $('.feature-card').each(function (index) {
    $(this).css('opacity', 0);
    setTimeout(() => {
      $(this).css({
        transition: 'opacity 0.5s',
        opacity: 1
      });
    }, index * 200);
  });

  // Tracking modal variables
  const $trackingModal = $('#trackingModal');
  const $pauseBtn = $('#pauseTrackingBtn');
  const $stopBtn = $('#stopTrackingBtn');
  const $time = $('#trackingTime');
  const $steps = $('#trackingSteps');
  const $calories = $('#trackingCalories');
  const $primaryButtons = $('.btn-primary');

  let timerInterval;
  let isTracking = false;
  let seconds = 0;

  function startTracking() {
    $trackingModal.removeClass('hidden');
    isTracking = true;

    timerInterval = setInterval(() => {
      seconds++;
      const timeStr = new Date(seconds * 1000).toISOString().substr(11, 8);
      $time.text(timeStr);
      $steps.text(Math.floor(seconds * 1.5));
      $calories.text(Math.floor(seconds * 0.2));
    }, 1000);
  }

  function stopTracking() {
    clearInterval(timerInterval);
    $trackingModal.addClass('hidden');
    $time.text('00:00:00');
    $steps.text('0');
    $calories.text('0');
    seconds = 0;
    isTracking = false;
    $pauseBtn.html('<i class="fas fa-pause"></i> Pause');
  }

  // Primary button click - start tracking and redirect
  $primaryButtons.on('click', function (e) {
    if (!isTracking) {
      e.preventDefault();
      const href = $(this).attr('href');
      startTracking();
      setTimeout(() => {
        window.location.href = href;
      }, 500);
    }
  });

  $pauseBtn.on('click', function () {
    if (isTracking) {
      clearInterval(timerInterval);
      isTracking = false;
      $(this).html('<i class="fas fa-play"></i> Resume');
    } else {
      startTracking();
      $(this).html('<i class="fas fa-pause"></i> Pause');
    }
  });

  $stopBtn.on('click', stopTracking);

  // Active link highlighting
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  $('.main-nav a').each(function () {
    const linkPage = $(this).attr('href');
    if (linkPage === currentPage) {
      $(this).addClass('active');
    } else {
      $(this).removeClass('active');
    }
  });
});
    $(document).ready(function () {
      const $mobileMenuBtn = $('#mobileMenuBtn');
      const $mainNav = $('#mainNav ul');

      $mobileMenuBtn.on('click', function () {
        $mainNav.slideToggle(200);
        $(this).attr('aria-expanded', $mainNav.is(':visible'));
      });

      $('a[href^="#"]').on('click', function (e) {
        const href = $(this).attr('href');
        if (href !== '#') {
          e.preventDefault();
          const $target = $(href);
          if ($target.length) {
            $('html, body').animate({
              scrollTop: $target.offset().top - 70
            }, 600);
          }
        }
      });

      $('.feature-card').hover(
        function () {
          $(this).css({
            transform: 'translateY(-5px)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
          });
        },
        function () {
          $(this).css({
            transform: 'translateY(0)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
          });
        }
      );

      $('.hero-content, .hero-image').css('opacity', 0);
      setTimeout(() => {
        $('.hero-content, .hero-image').css({
          transition: 'opacity 1s',
          opacity: 1
        });
      }, 100);

      $('.feature-card').each(function (index) {
        $(this).css('opacity', 0);
        setTimeout(() => {
          $(this).css({
            transition: 'opacity 0.5s',
            opacity: 1
          });
        }, index * 200);
      });

      const $trackingModal = $('#trackingModal');
      const $pauseBtn = $('#pauseTrackingBtn');
      const $stopBtn = $('#stopTrackingBtn');
      const $time = $('#trackingTime');
      const $steps = $('#trackingSteps');
      const $calories = $('#trackingCalories');
      const $primaryButtons = $('.btn-primary');

      let timerInterval;
      let isTracking = false;
      let seconds = 0;

      function startTracking() {
        $trackingModal.removeClass('hidden');
        isTracking = true;

        timerInterval = setInterval(() => {
          seconds++;
          const timeStr = new Date(seconds * 1000).toISOString().substr(11, 8);
          $time.text(timeStr);
          $steps.text(Math.floor(seconds * 1.5));
          $calories.text(Math.floor(seconds * 0.2));
        }, 1000);
      }

      function stopTracking() {
        clearInterval(timerInterval);
        $trackingModal.addClass('hidden');
        $time.text('00:00:00');
        $steps.text('0');
        $calories.text('0');
        seconds = 0;
        isTracking = false;
        $pauseBtn.html('<i class="fas fa-pause"></i> Pause');
      }

      $primaryButtons.on('click', function (e) {
        if (!isTracking) {
          e.preventDefault();
          const href = $(this).attr('href');
          startTracking();
          setTimeout(() => {
            window.location.href = href;
          }, 500);
        }
      });

      $pauseBtn.on('click', function () {
        if (isTracking) {
          clearInterval(timerInterval);
          isTracking = false;
          $(this).html('<i class="fas fa-play"></i> Resume');
        } else {
          startTracking();
          $(this).html('<i class="fas fa-pause"></i> Pause');
        }
      });

      $stopBtn.on('click', stopTracking);

      const currentPage = window.location.pathname.split('/').pop() || 'index.html';
      $('.main-nav a').each(function () {
        const linkPage = $(this).attr('href');
        $(this).toggleClass('active', linkPage === currentPage);
      });
    });