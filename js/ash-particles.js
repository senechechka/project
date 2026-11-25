(function () {
  'use strict';

  function initAntiqueAsh() {
    if (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return;
    }

    var canvas = document.getElementById('antique-ash-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx) return;

    var w = window.innerWidth;
    var h = window.innerHeight;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }
    window.addEventListener('resize', resize);
    resize();

    var PARTICLE_COUNT = 58;
    var particles = [];

    function spawnParticle(randomY) {
      var layer = Math.random();
      var size = 0.95 + layer * 1.65;
      var shades = [
        'rgba(82, 86, 94, ',    // soft weathered charcoal
        'rgba(116, 120, 128, ', // muted marble slate
        'rgba(146, 140, 130, '  // subtle parchment stone
      ];
      var shade = shades[Math.floor(Math.random() * shades.length)];
      return {
        x: Math.random() * w,
        y: randomY ? Math.random() * h : -12 - Math.random() * 28,
        vx: (Math.random() - 0.35) * (0.18 + layer * 0.22),
        vy: 0.14 + layer * 0.28,
        parallax: 0.3 + layer * 0.56,
        size: size,
        aspect: 0.44 + Math.random() * 0.52,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.022,
        swayAmp: 0.14 + Math.random() * 0.32,
        swayFreq: 0.008 + Math.random() * 0.015,
        phase: Math.random() * Math.PI * 2,
        alpha: 0.10 + layer * 0.16,
        shade: shade
      };
    }

    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(spawnParticle(true));
    }

    var lastScrollY = window.scrollY || window.pageYOffset || 0;

    var frameCount = 0;
    function tick() {
      requestAnimationFrame(tick);
      frameCount += 1;

      var nowY = window.scrollY || window.pageYOffset || 0;
      var scrollDeltaY = nowY - lastScrollY;
      lastScrollY = nowY;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);

      var spanY = h + 40;
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        var sway = Math.sin(frameCount * p.swayFreq + p.phase) * p.swayAmp;

        p.x += p.vx + sway - scrollDeltaY * p.vx * 0.08;
        p.y += p.vy - scrollDeltaY * p.parallax;
        p.angle += p.spin + scrollDeltaY * p.spin * 0.08;

        if (p.y > h + 20 || p.y < -20) {
          p.y = ((((p.y + 20) % spanY) + spanY) % spanY) - 20;
        }
        if (p.x > w + 24) p.x = -14;
        if (p.x < -24) p.x = w + 14;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);
        ctx.fillStyle = p.shade + p.alpha.toFixed(2) + ')';

        ctx.beginPath();
        ctx.ellipse(
          0,
          0,
          p.size,
          p.size * p.aspect * (0.65 + 0.35 * Math.sin(frameCount * 0.03 + p.phase)),
          0,
          0,
          Math.PI * 2
        );
        ctx.fill();
        ctx.restore();
      }
    }

    requestAnimationFrame(tick);
  }

  window.addEventListener('DOMContentLoaded', initAntiqueAsh);
})();
