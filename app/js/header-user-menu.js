$(function () {
  const DESKTOP_MIN = 992;
  const $headerUser = $('.header-user');

  if (!$headerUser.length) {
    return;
  }

  const $toggle = $headerUser.find('.header__cabinet');
  const $dropdown = $('.header-user__dropdown');
  const $overlay = $('.header-user__overlay');

  function isDesktopTablet() {
    return window.innerWidth >= DESKTOP_MIN;
  }

  function positionDropdown() {
    const toggleEl = $toggle[0];

    if (!toggleEl) {
      return;
    }

    const rect = toggleEl.getBoundingClientRect();

    $dropdown.css({
      top: rect.bottom + 10,
      right: window.innerWidth - rect.right
    });
  }

  function openDropdown() {
    positionDropdown();
    $headerUser.addClass('header-user--open');
    $toggle.attr('aria-expanded', 'true');
    $dropdown.addClass('header-user__dropdown--visible').removeAttr('hidden');
    $overlay.addClass('header-user__overlay--visible').removeAttr('hidden');
  }

  function closeDropdown() {
    $headerUser.removeClass('header-user--open');
    $toggle.attr('aria-expanded', 'false');
    $dropdown.removeClass('header-user__dropdown--visible').attr('hidden', true);
    $overlay.removeClass('header-user__overlay--visible').attr('hidden', true);
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

  $overlay.on('click', function () {
    closeDropdown();
  });

  $(document).on('click', function (e) {
    if (!isDesktopTablet() || !isMenuOpen()) {
      return;
    }

    const isInsideMenu = $dropdown[0].contains(e.target);
    const isInsideToggle = $headerUser[0].contains(e.target);

    if (!isInsideMenu && !isInsideToggle) {
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
      return;
    }

    if (isMenuOpen()) {
      positionDropdown();
    }
  });
});
