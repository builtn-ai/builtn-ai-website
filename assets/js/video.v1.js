/* Built-N-AI video additions (v1). Progressive enhancement only:
   every feature degrades to a plain link or a static poster without JS. */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = navigator.connection && navigator.connection.saveData;

  /* 1. Homepage hero ambient loop: desktop, motion allowed, data not saved */
  var hero = document.querySelector('[data-hero-video]');
  if (hero && !reduce && !saveData && window.matchMedia('(min-width: 860px)').matches) {
    var bg = document.createElement('video');
    bg.className = 'hero-bgvideo';
    bg.muted = true; bg.loop = true; bg.autoplay = true; bg.playsInline = true;
    bg.setAttribute('muted', ''); bg.setAttribute('playsinline', ''); bg.setAttribute('aria-hidden', 'true');
    bg.preload = 'auto';
    bg.src = hero.getAttribute('data-hero-video');
    bg.addEventListener('playing', function () { bg.classList.add('is-ready'); }, { once: true });
    hero.insertBefore(bg, hero.firstChild);
    var p = bg.play(); if (p && p.catch) p.catch(function () {});
  }

  /* 2. Overview dialog: any [data-video-modal] link opens the full video */
  var dialog = null, dvid = null;
  function openDialog(src, poster) {
    if (!dialog) {
      dialog = document.createElement('dialog');
      dialog.className = 'video-dialog';
      dialog.setAttribute('aria-label', 'Built-N-AI overview video');
      dialog.innerHTML = '<button class="video-dialog__close" type="button" aria-label="Close video">&times;</button>' +
        '<video controls playsinline preload="metadata"></video>';
      document.body.appendChild(dialog);
      dvid = dialog.querySelector('video');
      dialog.querySelector('.video-dialog__close').addEventListener('click', function () { dialog.close(); });
      dialog.addEventListener('click', function (e) { if (e.target === dialog) dialog.close(); });
      dialog.addEventListener('close', function () { dvid.pause(); dvid.currentTime = 0; });
    }
    if (dvid.getAttribute('src') !== src) { dvid.src = src; if (poster) dvid.poster = poster; }
    dialog.showModal();
    var p = dvid.play(); if (p && p.catch) p.catch(function () {});
  }
  document.querySelectorAll('[data-video-modal]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      if (typeof HTMLDialogElement === 'undefined') return; // old browser: follow the link
      e.preventDefault();
      openDialog(a.getAttribute('href'), a.getAttribute('data-poster'));
    });
  });

  /* 3. Page clips: play muted while on screen, pause when scrolled away */
  var clips = document.querySelectorAll('video[data-inview]');
  if (clips.length) {
    if (reduce || !('IntersectionObserver' in window)) {
      clips.forEach(function (v) { v.controls = true; });
    } else {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var v = en.target;
          if (en.isIntersecting) { var p = v.play(); if (p && p.catch) p.catch(function () {}); }
          else v.pause();
        });
      }, { threshold: 0.35 });
      clips.forEach(function (v) { io.observe(v); });
    }
  }
})();
