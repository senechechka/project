(function () {
  'use strict';

  window.initKitsmanGoogleStreetView = function () {
    var iframe = document.getElementById('gsv-iframe');
    var addressPill = document.getElementById('gsv-address-pill');
    var modeBtns = document.querySelectorAll('[data-gsv-mode]');

    if (!iframe) return;

    var data = window.KITSMAN_DATA;
    var startSpot = data && data.landmarks && data.landmarks[0];
    if (!startSpot) return;

    var state = {
      mode: 'sv',
      activeSpot: startSpot
    };

    function buildEmbedUrl(spot, mode) {
      var lat = spot.gps.lat;
      var lng = spot.gps.lng;
      var heading = spot.gps.heading || 0;
      if (mode === 'map') {
        return (
          'https://maps.google.com/maps?q=' +
          lat +
          ',' +
          lng +
          '&z=17&hl=uk&output=embed'
        );
      }
      return (
        'https://maps.google.com/maps?layer=c&cbll=' +
        lat +
        ',' +
        lng +
        '&cbp=12,' +
        heading +
        ',0,0,0&hl=uk&output=svembed'
      );
    }

    // Release iframe drag lock if mouse is released outside iframe
    window.addEventListener('mouseup', function () {
      if (document.activeElement === iframe) {
        try {
          iframe.blur();
          window.focus();
        } catch (err) {}
      }
    });

    function loadSpot(spot) {
      state.activeSpot = spot;
      if (addressPill) {
        addressPill.textContent = spot.address + ' · м. Кіцмань';
      }
      iframe.src = buildEmbedUrl(spot, state.mode);
    }

    modeBtns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var nextMode = btn.getAttribute('data-gsv-mode');
        if (nextMode === state.mode) return;
        state.mode = nextMode;
        modeBtns.forEach(function (b) {
          b.classList.toggle('is-active', b === btn);
        });
        if (state.activeSpot) {
          iframe.src = buildEmbedUrl(state.activeSpot, state.mode);
        }
      });
    });

    loadSpot(startSpot);
  };
})();
