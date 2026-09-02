(() => {
  const reveal = document.querySelectorAll('.bs-reveal, .bs-story-row');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  reveal.forEach((el) => observer.observe(el));

  const expandFilm = document.querySelector('[data-expand-film]');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const updateExpandFilm = () => {
    if (!expandFilm || reduceMotion) return;
    const rect = expandFilm.getBoundingClientRect();
    const travel = Math.max(1, expandFilm.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / travel));
    expandFilm.style.setProperty('--p', progress.toFixed(4));
  };

  if (expandFilm && !reduceMotion) {
    let ticking = false;
    const requestUpdate = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateExpandFilm();
        ticking = false;
      });
    };
    updateExpandFilm();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
  }

  const lazyVideos = document.querySelectorAll('video[preload="none"]');
  if ('IntersectionObserver' in window) {
    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target;
        if (entry.isIntersecting) {
          if (video.preload === 'none') video.preload = 'metadata';
          if (!reduceMotion) video.play().catch(() => {});
        } else if (!video.closest('.bs-hero')) {
          video.pause();
        }
      });
    }, { rootMargin: '30% 0px', threshold: 0.01 });
    lazyVideos.forEach((video) => videoObserver.observe(video));
  }

  const form = document.querySelector('.bs-form');
  if (form) {
    const params = new URLSearchParams(window.location.search);
    ['utm_source','utm_medium','utm_campaign','utm_content','utm_term','oppref'].forEach((key) => {
      const value = params.get(key);
      if (!value) return;
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });
  }

  if (reduceMotion) {
    document.querySelectorAll('video[autoplay]').forEach((video) => video.pause());
  }
})();