$(function () {
  const DESKTOP_MIN = 992;
  const $headerUser = $('.header-user');

  if (!$headerUser.length) {
    return;
  }

  const $toggle = $headerUser.find('.header__cabinet');
  const $dropdown = $headerUser.find('.header-user__dropdown');

  function isDesktopTablet() {
    return window.innerWidth >= DESKTOP_MIN;
  }

  function openDropdown() {
    $headerUser.addClass('header-user--open');
    $toggle.attr('aria-expanded', 'true');
    $dropdown.addClass('header-user__dropdown--visible').removeAttr('hidden');
  }

  function closeDropdown() {
    $headerUser.removeClass('header-user--open');
    $toggle.attr('aria-expanded', 'false');
    $dropdown.removeClass('header-user__dropdown--visible').attr('hidden', true);
  }

  function isMenuOpen() {
    return $headerUser.hasClass('header-user--open');
  }

  $headerUser.on('click', '.header__cabinet', function (e) {
    if (!isDesktopTablet()) {
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    if (isMenuOpen()) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  $(document).on('click', function (e) {
    if (!isDesktopTablet() || !isMenuOpen()) {
      return;
    }

    if (!$headerUser[0].contains(e.target)) {
      closeDropdown();
    }
  });

  $dropdown.on('click', function (e) {
    e.stopPropagation();
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  $(window).on('resize', function () {
    if (!isDesktopTablet()) {
      closeDropdown();
    }
  });
});
