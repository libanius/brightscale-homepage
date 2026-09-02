(() => {
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
})();