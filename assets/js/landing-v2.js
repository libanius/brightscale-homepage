(() => {
  const style = document.createElement('style');
  style.textContent = `
    .bs-hero-video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;transform:scale(1.03);background:#17130f url('/assets/images/wood-grain-hero-poster.jpg') center/cover no-repeat}
    .bs-story-video{background:#17130f url('/assets/images/wood-grain-hatch-poster.jpg') center/cover no-repeat}
    .bs-story-video video,.bs-gallery video{width:100%;height:100%;object-fit:cover;object-position:center center;display:block}
    .bs-story-row.is-visible .bs-story-video video{transform:scale(1.02)}
    .bs-story-video video{transition:transform .8s cubic-bezier(.2,.7,.2,1)}
    .bs-detail-film{position:relative;min-height:78vh;display:grid;align-items:end;overflow:hidden;background:#17130f url('/assets/images/wood-grain-detail-poster.jpg') center/cover no-repeat;color:#fff}
    .bs-detail-film:before{content:"";position:absolute;inset:-18px;background:url('/assets/images/wood-grain-detail-poster.jpg') center/cover no-repeat;filter:blur(16px);transform:scale(1.04);opacity:.55}
    .bs-detail-film>video{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:center center;z-index:1;background:#17130f url('/assets/images/wood-grain-detail-poster.jpg') center/cover no-repeat}
    .bs-detail-film-overlay{position:absolute;inset:0;z-index:2;background:linear-gradient(180deg,rgba(0,0,0,.08),rgba(0,0,0,.18) 45%,rgba(0,0,0,.78))}
    .bs-detail-film-copy{position:relative;z-index:3;padding-top:180px;padding-bottom:64px}
    .bs-detail-film-copy h2{font-size:clamp(2.5rem,6vw,5.6rem);line-height:.95;letter-spacing:-.05em;max-width:850px;margin:16px 0}
    .bs-detail-film-copy p{max-width:650px;color:rgba(255,255,255,.82);font-size:1.04rem;margin:18px 0 0}
    .bs-gallery video{transition:transform .5s ease}
    .bs-gallery figure:hover video{transform:scale(1.035)}

    /* Scroll expansion opening — vanilla adaptation of the supplied React concept */
    .bs-hero.bs-expand-hero{--p:0;min-height:100dvh;height:100dvh;display:block;overflow:hidden;background:#17130f url('/assets/images/wood-grain-hero-poster.jpg') center/cover no-repeat;isolation:isolate}
    .bs-hero.bs-expand-hero:before{content:"";position:absolute;inset:0;z-index:0;background:rgba(0,0,0,calc(.18 + var(--p)*.18));opacity:calc(1 - var(--p)*.8);transition:opacity .06s linear}
    .bs-hero.bs-expand-hero:after{background:linear-gradient(180deg,rgba(0,0,0,.12),rgba(0,0,0,.22) 52%,rgba(0,0,0,.58));z-index:2;pointer-events:none}
    .bs-hero.bs-expand-hero .bs-hero-video{z-index:1;inset:auto;left:50%;top:50%;width:calc(300px + var(--p) * (min(95vw,1550px) - 300px));height:calc(400px + var(--p) * (min(85vh,800px) - 400px));max-width:95vw;max-height:85vh;transform:translate(-50%,-50%);border-radius:calc(22px - var(--p)*12px);box-shadow:0 0 50px rgba(0,0,0,.34);transition:none;background:#231c16 url('/assets/images/wood-grain-hero-poster.jpg') center/cover no-repeat}
    .bs-hero.bs-expand-hero .bs-hero-content{position:absolute;inset:0;z-index:3;width:100%;max-width:none;padding:0;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;pointer-events:none}
    .bs-hero.bs-expand-hero .bs-kicker{position:absolute;top:calc(50% + 225px);left:50%;transform:translateX(-50%);white-space:nowrap;color:rgba(255,255,255,.82);opacity:calc(1 - var(--p)*1.35);transition:none}
    .bs-hero.bs-expand-hero h1{width:min(1180px,94vw);max-width:none;margin:0;display:flex;flex-direction:column;align-items:center;gap:3px;font-size:clamp(2.8rem,7vw,6.8rem);line-height:.92;text-shadow:0 2px 24px rgba(0,0,0,.3);mix-blend-mode:difference}
    .bs-hero.bs-expand-hero .bs-title-half{display:block;will-change:transform;transition:none}
    .bs-hero.bs-expand-hero .bs-title-left{transform:translateX(calc(var(--p) * -150vw))}
    .bs-hero.bs-expand-hero .bs-title-right{transform:translateX(calc(var(--p) * 150vw))}
    .bs-hero.bs-expand-hero .bs-hero-content>p,.bs-hero.bs-expand-hero .bs-hero-actions{position:absolute;left:50%;transform:translateX(-50%);opacity:0;pointer-events:none;transition:opacity .35s ease}
    .bs-hero.bs-expand-hero .bs-hero-content>p{bottom:106px;width:min(720px,88vw);margin:0;color:#fff;text-shadow:0 2px 18px rgba(0,0,0,.5)}
    .bs-hero.bs-expand-hero .bs-hero-actions{bottom:42px;margin:0;justify-content:center}
    .bs-hero.bs-expand-hero.bs-expanded .bs-hero-content>p,.bs-hero.bs-expand-hero.bs-expanded .bs-hero-actions{opacity:1;pointer-events:auto}
    .bs-scroll-cue{position:absolute;z-index:4;left:50%;bottom:22px;transform:translateX(-50%);font-size:.76rem;font-weight:800;letter-spacing:.14em;text-transform:uppercase;color:rgba(255,255,255,.88);display:flex;align-items:center;gap:9px;opacity:calc(1 - var(--p)*1.2);pointer-events:none}
    .bs-scroll-cue:after{content:"↓";font-size:1rem;animation:bsCue 1.4s ease-in-out infinite}
    @keyframes bsCue{0%,100%{transform:translateY(0)}50%{transform:translateY(5px)}}

    @media(max-width:767px){
      .bs-hero.bs-expand-hero .bs-hero-video{width:calc(280px + var(--p) * (95vw - 280px));height:calc(390px + var(--p) * (72vh - 390px))}
      .bs-hero.bs-expand-hero .bs-title-left{transform:translateX(calc(var(--p) * -180vw))}
      .bs-hero.bs-expand-hero .bs-title-right{transform:translateX(calc(var(--p) * 180vw))}
      .bs-hero.bs-expand-hero .bs-kicker{top:calc(50% + 220px);font-size:.68rem}
      .bs-hero.bs-expand-hero .bs-hero-content>p{bottom:112px;font-size:.92rem}
      .bs-hero.bs-expand-hero .bs-hero-actions{bottom:50px;width:92%;gap:8px}
      .bs-hero.bs-expand-hero .bs-hero-actions .bs-btn{min-height:44px;padding:0 14px;font-size:.82rem}
    }
    @media(prefers-reduced-motion:reduce){
      .bs-hero.bs-expand-hero{--p:1!important;height:auto;min-height:100dvh}
      .bs-hero.bs-expand-hero .bs-hero-video{width:100%;height:100%;max-width:none;max-height:none;border-radius:0}
      .bs-hero.bs-expand-hero .bs-title-half{transform:none!important}
      .bs-hero.bs-expand-hero .bs-kicker,.bs-scroll-cue{display:none}
    }
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

  const hero = document.querySelector('.bs-hero');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hero && !reduceMotion) {
    hero.classList.add('bs-expand-hero');
    const h1 = hero.querySelector('h1');
    if (h1) {
      h1.innerHTML = '<span class="bs-title-half bs-title-left">Make the surface</span><span class="bs-title-half bs-title-right">read like real wood.</span>';
    }
    const cue = document.createElement('div');
    cue.className = 'bs-scroll-cue';
    cue.textContent = 'Scroll to reveal the finish';
    hero.appendChild(cue);

    let progress = 0;
    let expanded = false;
    let touchY = 0;

    const paint = () => {
      hero.style.setProperty('--p', progress.toFixed(4));
      if (progress >= .995) {
        expanded = true;
        hero.classList.add('bs-expanded');
      } else if (progress < .75) {
        hero.classList.remove('bs-expanded');
      }
    };
    paint();

    const update = (delta) => {
      progress = Math.min(1, Math.max(0, progress + delta));
      paint();
    };

    const onWheel = (e) => {
      if (expanded && e.deltaY < 0 && window.scrollY <= 5) {
        expanded = false;
        hero.classList.remove('bs-expanded');
        e.preventDefault();
        update(e.deltaY * .0009);
        return;
      }
      if (!expanded && window.scrollY <= 5) {
        e.preventDefault();
        update(e.deltaY * .0009);
      }
    };

    const onTouchStart = (e) => { touchY = e.touches[0]?.clientY || 0; };
    const onTouchMove = (e) => {
      if (!touchY) return;
      const nextY = e.touches[0]?.clientY || touchY;
      const deltaY = touchY - nextY;
      if (expanded && deltaY < -20 && window.scrollY <= 5) {
        expanded = false;
        hero.classList.remove('bs-expanded');
        e.preventDefault();
        update(deltaY * .008);
      } else if (!expanded && window.scrollY <= 5) {
        e.preventDefault();
        update(deltaY * (deltaY < 0 ? .008 : .005));
      }
      touchY = nextY;
    };
    const onTouchEnd = () => { touchY = 0; };
    const onScroll = () => {
      if (!expanded && window.scrollY > 0) window.scrollTo(0, 0);
    };

    window.addEventListener('wheel', onWheel, { passive:false });
    window.addEventListener('touchstart', onTouchStart, { passive:false });
    window.addEventListener('touchmove', onTouchMove, { passive:false });
    window.addEventListener('touchend', onTouchEnd, { passive:false });
    window.addEventListener('scroll', onScroll, { passive:true });
  }

  if (reduceMotion) {
    document.querySelectorAll('video[autoplay]').forEach((video) => video.pause());
  }
})();
