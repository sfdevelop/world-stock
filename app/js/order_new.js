$(function () {
  const $items = $('.order-new__item');
  const DURATION = 420;
  const EASING = 'cubic-bezier(0.4, 0, 0.2, 1)';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resetBodyStyles($body) {
    $body.css({
      display: '',
      height: '',
      opacity: '',
      overflow: '',
      transition: '',
      paddingBottom: ''
    });
  }

  function nextAnimationId($body) {
    const id = Number($body.data('animationId') || 0) + 1;
    $body.data('animationId', id);
    return id;
  }

  function applyBodyTransition($body, animationId, targetStyles) {
    const el = $body[0];

    $body.css({ transition: 'none' });
    void el.offsetHeight;

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        if ($body.data('animationId') !== animationId) {
          return;
        }

        $body.css({
          transition: 'height ' + DURATION + 'ms ' + EASING + ', opacity ' + DURATION + 'ms ' + EASING + ', padding-bottom ' + DURATION + 'ms ' + EASING,
          height: targetStyles.height,
          opacity: targetStyles.opacity,
          paddingBottom: targetStyles.paddingBottom
        });
      });
    });
  }

  function measureBodyHeight($body) {
    const el = $body[0];

    $body.css({
      display: 'block',
      position: 'absolute',
      visibility: 'hidden',
      height: 'auto',
      overflow: 'hidden',
      paddingBottom: 12,
      opacity: 0,
      transition: 'none'
    });

    const height = el.scrollHeight;

    $body.css({
      position: '',
      visibility: '',
      height: 0,
      opacity: 0,
      paddingBottom: 0,
      overflow: 'hidden'
    });

    void el.offsetHeight;

    return height;
  }

  function openBody($body) {
    const el = $body[0];
    const animationId = nextAnimationId($body);

    if (prefersReducedMotion) {
      resetBodyStyles($body);
      $body.css({ display: 'block', paddingBottom: 12 });
      scheduleCommentEllipsis();
      return;
    }

    const height = measureBodyHeight($body);

    applyBodyTransition($body, animationId, {
      height: height + 'px',
      opacity: 1,
      paddingBottom: 12
    });

    el.addEventListener('transitionend', function onEnd(e) {
      if (e.target !== el || e.propertyName !== 'height' || $body.data('animationId') !== animationId) {
        return;
      }

      el.removeEventListener('transitionend', onEnd);
      resetBodyStyles($body);
      $body.css({ display: 'block', paddingBottom: 12 });
      scheduleCommentEllipsis();
    });
  }

  function closeBody($body) {
    const el = $body[0];
    const animationId = nextAnimationId($body);

    if (!$body.is(':visible') || prefersReducedMotion) {
      resetBodyStyles($body);
      $body.css({ display: 'none' });
      return;
    }

    const height = el.scrollHeight;

    $body.css({
      height: height + 'px',
      overflow: 'hidden',
      paddingBottom: 12,
      opacity: 1,
      transition: 'none'
    });

    void el.offsetHeight;

    applyBodyTransition($body, animationId, {
      height: 0,
      opacity: 0,
      paddingBottom: 0
    });

    el.addEventListener('transitionend', function onEnd(e) {
      if (e.target !== el || e.propertyName !== 'height' || $body.data('animationId') !== animationId) {
        return;
      }

      el.removeEventListener('transitionend', onEnd);
      resetBodyStyles($body);
      $body.css({ display: 'none' });
    });
  }

  function closeItemCommentTooltips($item) {
    $item.find('.order-new__comment-tooltip')
      .removeClass('order-new__comment-tooltip--visible')
      .attr('hidden', true);
    $item.find('.order-new__comment-info').attr('aria-expanded', 'false');
    $item.find('.order-new__comment-overlay')
      .removeClass('order-new__comment-overlay--visible')
      .attr('hidden', true);
  }

  function closeItem($item) {
    closeItemCommentTooltips($item);
    closeBody($item.find('.order-new__body'));
    $item.removeClass('order-new__item--open');
    $item.find('.order-new__head').attr('aria-expanded', 'false');
  }

  function openItem($item) {
    $item.addClass('order-new__item--open');
    $item.find('.order-new__head').attr('aria-expanded', 'true');
    openBody($item.find('.order-new__body'));
  }

  $('.order-new__head').on('click', function () {
    const $item = $(this).closest('.order-new__item');
    const isOpen = $item.hasClass('order-new__item--open');

    if (isOpen) {
      closeItem($item);
    } else {
      openItem($item);
    }
  });

  $('.order-new__copy').on('click', function (e) {
    e.stopPropagation();
    const text = $(this).closest('.order-new__invoice-ttn').find('span').first().text().replace('ТТН:', '').trim();

    if (navigator.clipboard && text) {
      navigator.clipboard.writeText(text);
    }
  });

  $('.order-new__tab').on('click', function (e) {
    e.preventDefault();
    $('.order-new__tab').removeClass('order-new__tab--active');
    $(this).addClass('order-new__tab--active');
  });

  const DESKTOP_MIN = 992;

  function isDesktopViewport() {
    return window.innerWidth >= DESKTOP_MIN;
  }

  function resetCommentTextStyle(textEl) {
    if (!textEl) {
      return;
    }

    textEl.style.removeProperty('display');
    textEl.style.removeProperty('-webkit-box-orient');
    textEl.style.removeProperty('-webkit-line-clamp');
    textEl.style.removeProperty('text-overflow');
    textEl.style.removeProperty('overflow');
    textEl.style.removeProperty('height');
  }

  function updateCommentEllipsis() {
    $('.order-new__item--open .order-new__comment').each(function () {
      const $comment = $(this);
      const $box = $comment.find('.order-new__comment-box');
      const $text = $box.find('p');
      const textEl = $text.get(0);
      const boxEl = $box.get(0);

      if (!textEl || !boxEl || !isDesktopViewport()) {
        resetCommentTextStyle(textEl);
        return;
      }

      resetCommentTextStyle(textEl);

      const boxStyles = window.getComputedStyle(boxEl);
      const paddingY = parseFloat(boxStyles.paddingTop) + parseFloat(boxStyles.paddingBottom);
      const availableHeight = boxEl.clientHeight - paddingY;
      const lineHeight = parseFloat(window.getComputedStyle(textEl).lineHeight) || 20;
      const isOverflowing = textEl.scrollHeight > availableHeight + 1;
      const maxLines = Math.max(1, Math.floor(availableHeight / lineHeight));

      if (isOverflowing) {
        textEl.style.display = '-webkit-box';
        textEl.style.webkitBoxOrient = 'vertical';
        textEl.style.webkitLineClamp = String(maxLines);
        textEl.style.textOverflow = 'ellipsis';
        textEl.style.overflow = 'hidden';
      }
    });
  }

  function scheduleCommentEllipsis() {
    requestAnimationFrame(function () {
      requestAnimationFrame(updateCommentEllipsis);
    });
  }

  function closeCommentTooltips() {
    $('.order-new__comment-tooltip')
      .removeClass('order-new__comment-tooltip--visible')
      .attr('hidden', true);
    $('.order-new__comment-info').attr('aria-expanded', 'false');
    $('.order-new__comment-overlay')
      .removeClass('order-new__comment-overlay--visible')
      .attr('hidden', true);
  }

  $('.order-new__comment-info').on('click', function (e) {
    e.stopPropagation();

    if (!isDesktopViewport()) {
      return;
    }

    const $button = $(this);
    const $tooltip = $button.siblings('.order-new__comment-tooltip');
    const $overlay = $button.closest('.order-new__item').find('.order-new__comment-overlay');
    const isOpen = $tooltip.hasClass('order-new__comment-tooltip--visible');

    closeCommentTooltips();

    if (!isOpen) {
      $overlay.addClass('order-new__comment-overlay--visible').removeAttr('hidden');
      $tooltip.addClass('order-new__comment-tooltip--visible').removeAttr('hidden');
      $button.attr('aria-expanded', 'true');
    }
  });

  $('.order-new__comment-tooltip').on('click', function (e) {
    e.stopPropagation();
  });

  $('.order-new__comment-overlay').on('click', function (e) {
    e.stopPropagation();
    closeCommentTooltips();
  });

  $(document).on('click', function () {
    closeCommentTooltips();
  });

  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') {
      closeCommentTooltips();
    }
  });

  $(window).on('resize', function () {
    if (!isDesktopViewport()) {
      closeCommentTooltips();
    }

    scheduleCommentEllipsis();
  });

  $items.filter('.order-new__item--open').find('.order-new__body').css({
    display: 'block',
    paddingBottom: 12
  });
  $items.not('.order-new__item--open').find('.order-new__body').css('display', 'none');
  scheduleCommentEllipsis();
});
