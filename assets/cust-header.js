/* =====================================================================
   HUCK STYLE HEADER  -  assets/cust-header.js
   Multiple mega menu panels + right pink menu + cart drawer + scroll state.
   Theme editor (section reload) me bhi kaam karta hai.
   ===================================================================== */
(function () {
  'use strict';

  function initHeader(root) {
    if (!root || root.dataset.hckxInit === 'true') return;
    root.dataset.hckxInit = 'true';

    var toggles = Array.prototype.slice.call(root.querySelectorAll('[data-hckx-shop-toggle]'));
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-hckx-mega]'));
    var burger = root.querySelector('[data-hckx-burger]');
    var side = root.querySelector('[data-hckx-side]');
    var scrollOffset = parseInt(root.getAttribute('data-hckx-scroll'), 10);

    /* "Continue Shopping" button ka link (header.liquid ke data-hckx-shop-url se) */
    var shopUrl = root.getAttribute('data-hckx-shop-url') || '/collections/all';

    /* ---- Cart drawer elements ---- */
    var cartToggle = root.querySelector('[data-hckx-cart-toggle]');
    var cartDrawer = root.querySelector('[data-hckx-cart]');
    var cartOverlay = root.querySelector('[data-hckx-cart-overlay]');
    var cartClose = root.querySelector('[data-hckx-cart-close]');
    var cartBody = root.querySelector('[data-hckx-cart-body]');
    var cartFoot = root.querySelector('[data-hckx-cart-foot]');
    var cartCounts = Array.prototype.slice.call(root.querySelectorAll('[data-hckx-cart-count], [data-hckx-cart-drawer-count]'));

    if (isNaN(scrollOffset)) scrollOffset = 60;

    function anyMegaOpen() {
      return toggles.some(function (t) {
        return t.getAttribute('aria-expanded') === 'true';
      });
    }

    function closeAllMega() {
      toggles.forEach(function (t) { t.setAttribute('aria-expanded', 'false'); });
      panels.forEach(function (p) { p.classList.remove('hckx-is-open'); });
      root.classList.remove('hckx-open-shop');
    }

    function openMega(id) {
      closeAllMega();
      var panel = document.getElementById(id);
      if (!panel) return;
      panel.classList.add('hckx-is-open');
      root.classList.add('hckx-open-shop');
      toggles.forEach(function (t) {
        if (t.getAttribute('data-hckx-target') === id) {
          t.setAttribute('aria-expanded', 'true');
        }
      });
    }

    function setSide(open) {
      if (!burger || !side) return;
      burger.setAttribute('aria-expanded', open);
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Menu');
      side.classList.toggle('hckx-is-open', open);
      root.classList.toggle('hckx-open-side', open);
    }

    /* ---------------------------------------------------------------
       CART DRAWER
       --------------------------------------------------------------- */
    function updateCartCounts(count) {
      cartCounts.forEach(function (el) { el.textContent = count; });
    }

    function renderCart(cartData) {
      if (!cartBody) return;

      updateCartCounts(cartData.item_count);

      /* ---- EMPTY CART ---- */
      if (!cartData.items || cartData.items.length === 0) {
        cartBody.innerHTML =
          '<div class="hckx-cart-empty-wrap" data-hckx-cart-empty>' +
            '<p class="hckx-cart-empty">Looks like you haven\u2019t added anything yet, let\u2019s get you started!</p>' +
            '<a class="hckx-cart-continue" href="' + shopUrl + '">Continue Shopping</a>' +
          '</div>';

        if (cartFoot) cartFoot.hidden = true;
        return;
      }

      if (cartFoot) cartFoot.hidden = false;

      /* ---- CART ITEMS ---- */
      var rows = cartData.items.map(function (item) {
        var imgSrc = item.image
          ? item.image.replace(/(\.[a-zA-Z0-9]+)(\?|$)/, '_200x$1$2')
          : '';
var optionLine = '';

/* "Default Title" wale (single variant) options ko hata do */
var realOptions = (item.options_with_values || []).filter(function (o) {
  return o.value !== 'Default Title';
});

if (realOptions.length) {
  optionLine =
    '<div class="hckx-cart-item-option">' +
    realOptions.map(function (o) {
      return o.name + ': <b>' + o.value + '</b>';
    }).join(' &nbsp; ') +
    '</div>';
}

        var currentPrice = (item.final_price || item.price || 0) / 100;

        var priceHtml =
          '<div class="hckx-cart-item-price">' +
            '<span class="hckx-cart-item-current-price">' +
              '$' + currentPrice.toFixed(2) +
            '</span>' +
          '</div>';

        return (
          '<div class="hckx-cart-item" data-hckx-cart-line="' + item.key + '">' +

            (imgSrc
              ? '<img class="hckx-cart-item-img" src="' + imgSrc + '" alt="" width="100" height="100" loading="lazy">'
              : '') +

            '<div class="hckx-cart-item-info">' +
'<a class="hckx-cart-item-title" href="' + item.url + '">' +
  item.product_title +
'</a>' +

              optionLine +

              priceHtml +

              '<div class="hckx-cart-item-row">' +

                '<span class="hckx-cart-item-qty-label">Quantity:</span>' +

                '<div class="hckx-cart-item-qty" data-hckx-qty-wrap>' +

                  '<button type="button" class="hckx-qty-btn" data-hckx-qty-minus aria-label="Decrease quantity">&minus;</button>' +

                  '<span class="hckx-qty-value">' +
                    item.quantity +
                  '</span>' +

                  '<button type="button" class="hckx-qty-btn" data-hckx-qty-plus aria-label="Increase quantity">&plus;</button>' +

                '</div>' +

              '</div>' +

            '</div>' +

          '</div>'
        );
      }).join('');

      cartBody.innerHTML = rows;

      /* ---- FOOTER: Total + View Cart + Check out ---- */
      if (cartFoot) {
        var total = (cartData.total_price || 0) / 100;

        cartFoot.innerHTML =
          '<div class="hckx-cart-total">' +
            '<span class="hckx-cart-total-label">Total</span>' +
            '<span class="hckx-cart-total-price">$' + total.toFixed(2) + '</span>' +
          '</div>' +
          '<a class="hckx-cart-viewcart" href="/cart">View Cart</a>' +
          '<a class="hckx-cart-checkout" href="/checkout" data-hckx-cart-checkout>Check out</a>';
      }
    }

    function fetchCart() {
      if (!cartBody) return;
      cartBody.setAttribute('aria-busy', 'true');
      fetch('/cart.js', { headers: { Accept: 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          renderCart(data);
        })
        .catch(function () {
          cartBody.innerHTML = '<p class="hckx-cart-empty">Could not load cart.</p>';
        })
        .finally(function () {
          cartBody.removeAttribute('aria-busy');
        });
    }

    function changeLineQuantity(key, quantity) {
      fetch('/cart/change.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: key, quantity: quantity })
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          renderCart(data);
          document.dispatchEvent(new CustomEvent('cart:updated', { detail: data }));
        })
        .catch(function () {});
    }

    function setCart(open) {
      if (!cartToggle || !cartDrawer) return;
      cartToggle.setAttribute('aria-expanded', open);
      cartDrawer.classList.toggle('hckx-is-open', open);
      cartDrawer.setAttribute('aria-hidden', !open);
      if (cartOverlay) cartOverlay.classList.toggle('hckx-is-open', open);
      document.documentElement.classList.toggle('hckx-cart-open-lock', open);

      if (open) {
        closeAllMega();
        setSide(false);
        fetchCart();
      }
    }

    if (cartToggle) {
      cartToggle.addEventListener('click', function () {
        var isOpen = cartToggle.getAttribute('aria-expanded') === 'true';
        setCart(!isOpen);
      });
    }

    if (cartClose) {
      cartClose.addEventListener('click', function () { setCart(false); });
    }

    if (cartOverlay) {
      cartOverlay.addEventListener('click', function () { setCart(false); });
    }

    if (cartBody) {
      cartBody.addEventListener('click', function (e) {
        var line = e.target.closest('[data-hckx-cart-line]');
        if (!line) return;
        var key = line.getAttribute('data-hckx-cart-line');
        var qtyEl = line.querySelector('.hckx-qty-value');
        var current = parseInt(qtyEl.textContent, 10) || 1;

        if (e.target.closest('[data-hckx-qty-plus]')) {
          changeLineQuantity(key, current + 1);
        } else if (e.target.closest('[data-hckx-qty-minus]')) {
          changeLineQuantity(key, Math.max(0, current - 1));
        }
      });
    }

    /* Featured collection (ya koi bhi section) 'cart:add' event bheje to drawer khulta hai
       aur fetchCart() se latest cart (naya add kiya product) load hota hai */
    document.addEventListener('cart:add', function () { setCart(true); });

    toggles.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var id = btn.getAttribute('data-hckx-target');
        var isOpen = btn.getAttribute('aria-expanded') === 'true';
        if (isOpen) {
          closeAllMega();
        } else {
          setSide(false);
          setCart(false);
          openMega(id);
        }
      });
    });

    if (burger) {
      burger.addEventListener('click', function () {
        var open = burger.getAttribute('aria-expanded') !== 'true';
        if (open) { closeAllMega(); setCart(false); }
        setSide(open);
      });
    }

    root.querySelectorAll('[data-hckx-open-shop]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        setSide(false);
        openMega(el.getAttribute('data-hckx-open-shop'));
      });
    });

    document.addEventListener('click', function (e) {
      if (!document.body.contains(root)) return;

      var inside = false;

      panels.forEach(function (p) { if (p.contains(e.target)) inside = true; });
      toggles.forEach(function (t) { if (t.contains(e.target)) inside = true; });
      if (side && side.contains(e.target)) inside = true;
      if (burger && burger.contains(e.target)) inside = true;
      if (cartDrawer && cartDrawer.contains(e.target)) inside = true;
      if (cartToggle && cartToggle.contains(e.target)) inside = true;

      if (inside) return;

      closeAllMega();
      setSide(false);
      setCart(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape' || !document.body.contains(root)) return;

      if (anyMegaOpen()) {
        var active = toggles.filter(function (t) {
          return t.getAttribute('aria-expanded') === 'true';
        })[0];
        closeAllMega();
        if (active) active.focus();
      }

      if (burger && burger.getAttribute('aria-expanded') === 'true') {
        setSide(false);
        burger.focus();
      }

      if (cartToggle && cartToggle.getAttribute('aria-expanded') === 'true') {
        setCart(false);
        cartToggle.focus();
      }
    });

    function onScroll() {
      root.classList.toggle('hckx-is-scrolled', window.scrollY > scrollOffset);
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  function initAll() {
    document.querySelectorAll('[data-hckx-header]').forEach(initHeader);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('shopify:section:load', initAll);
})();