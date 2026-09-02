(() => {
  const style = document.createElement('style');
  style.textContent = `
    .bs-hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;transform:scale(1.03)}
    .bs-story-video video,.bs-gallery video{width:100%;height:100%;object-fit:cover;display:block}
    .bs-story-row.is-visible .bs-story-video video{transform:scale(1.02)}
    .bs-story-video video{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
    .bs-detail-film{position:relative;min-height:78vh;display:grid;align-items:end;overflow:hidden;background:#17130f;color:#fff}
    .bs-detail-film>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover}
    .bs-detail-film-overlay{position:absolute;inset:0;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.18) 45%,rgba(0,0,0,.78))}
    .bs-detail-film-copy{position:relative;z-index:2;padding-top:180px;padding-bottom:64px}
    .bs-detail-film-copy h2{font-size:clamp(2.5rem,6vw,5.6rem);line-height:.95;letter-spacing:-.05em;max-width:850px;margin:16px 0}
    .bs-detail-film-copy p{max-width:650px;color:rgba(255,255,255,.75);font-size:1.04rem}
    .bs-gallery video{transition:transform .5s ease}
    .bs-gallery figure:hover video{transform:scale(1.035)}
    @media(max-width:560px){.bs-detail-film{min-height:62vh}.bs-detail-film-copy{padding-top:120px;padding-bottom:44px}}
  `;
  document.head.appendChild(style);

  const reveal = document.querySelectorAll('.bs-reveal, .bs-story-row');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
  reveal.forEach((el) => observer.observe(el));

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

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('video[autoplay]').forEach((video) => video.pause());
  }
})();