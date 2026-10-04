(function () {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  // Zegar UTC — każdy krótkofalowiec loguje w UTC
  const clock = document.getElementById('utc-clock');
  function tick() {
    const d = new Date();
    if (clock) clock.textContent = d.toISOString().slice(11, 16);

    // Status dnia klubowego (czas lokalny: piątek 18–20)
    const led = document.getElementById('club-led');
    const st = document.getElementById('club-status');
    if (!led || !st) return;
    const fri = d.getDay() === 5, h = d.getHours();
    const on = fri && h >= 18 && h < 20;
    led.classList.toggle('on', on);
    st.textContent = on ? 'Klub otwarty — zapraszamy!'
      : fri && h < 18 ? 'Dziś spotkanie o 18:00'
      : 'Spotkania: piątek 18:00–20:00';
  }
  tick(); setInterval(tick, 15000);

  // Menu mobilne
  const btn = document.querySelector('.nav-toggle');
  const nav = document.getElementById('nav');
  if (btn && nav) btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });

  // Wielkość tekstu
  let fs = parseFloat(store.get('fs')) || 1;
  const applyFs = () => root.style.setProperty('--fs-scale', fs);
  applyFs();
  document.querySelectorAll('[data-fs]').forEach(b => b.addEventListener('click', () => {
    fs = Math.round(Math.min(1.3, Math.max(0.9, fs + 0.1 * Number(b.dataset.fs))) * 10) / 10;
    applyFs(); store.set('fs', fs);
  }));

  // Wysoki kontrast
  const cb = document.getElementById('contrast-btn');
  const setContrast = on => {
    if (on) root.dataset.contrast = 'high'; else delete root.dataset.contrast;
    if (cb) cb.setAttribute('aria-pressed', on);
  };
  setContrast(store.get('contrast') === 'high');
  if (cb) cb.addEventListener('click', () => {
    const on = root.dataset.contrast !== 'high';
    setContrast(on); store.set('contrast', on ? 'high' : '');
  });

  // Galeria: filtry kategorii
  const tabs = document.querySelectorAll('.tabs button[data-cat]');
  tabs.forEach(t => t.addEventListener('click', () => {
    tabs.forEach(x => x.setAttribute('aria-pressed', x === t));
    const cat = t.dataset.cat;
    document.querySelectorAll('[data-lightbox] > a').forEach(a => {
      a.hidden = cat !== 'all' && a.dataset.cat !== cat;
    });
  }));

  // Lightbox — linki do zdjęć w kontenerach [data-lightbox], także dodanych później (np. z JSON)
  let lb = null, lbImg, lbCount, items = [], idx = 0, opener = null;
  const lbShow = () => {
    const a = items[idx];
    lbImg.src = a.href;
    lbImg.alt = (a.querySelector('img') || {}).alt || '';
    lbCount.textContent = (idx + 1) + ' / ' + items.length;
  };
  const lbClose = () => { lb.classList.remove('open'); lbImg.src = ''; if (opener) opener.focus(); };
  const lbStep = d => { idx = (idx + d + items.length) % items.length; lbShow(); };
  function lbCreate() {
    lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', 'Podgląd zdjęcia');
    lb.innerHTML = '<img alt=""><button class="lb-close" aria-label="Zamknij">✕</button>' +
      '<button class="lb-prev" aria-label="Poprzednie">‹</button><button class="lb-next" aria-label="Następne">›</button>' +
      '<div class="lb-count"></div>';
    document.body.appendChild(lb);
    lbImg = lb.querySelector('img'); lbCount = lb.querySelector('.lb-count');
    lb.querySelector('.lb-close').addEventListener('click', lbClose);
    lb.querySelector('.lb-prev').addEventListener('click', () => lbStep(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => lbStep(1));
    lb.addEventListener('click', e => { if (e.target === lb) lbClose(); });
  }
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-lightbox] a');
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    if (!lb) lbCreate();
    items = [...a.closest('[data-lightbox]').querySelectorAll('a')].filter(x => !x.hidden);
    idx = items.indexOf(a); opener = a;
    lbShow(); lb.classList.add('open');
    lb.querySelector('.lb-close').focus();
  });
  document.addEventListener('keydown', e => {
    if (!lb || !lb.classList.contains('open')) return;
    if (e.key === 'Escape') lbClose();
    if (e.key === 'ArrowLeft') lbStep(-1);
    if (e.key === 'ArrowRight') lbStep(1);
  });

  // Mapa Google ładowana dopiero po kliknięciu (bez ciasteczek przed zgodą)
  const mapBtn = document.getElementById('map-load');
  if (mapBtn) mapBtn.addEventListener('click', () => {
    const box = mapBtn.closest('.map-box');
    box.innerHTML = '<iframe title="Mapa — Świebodziński Dom Kultury" loading="lazy" referrerpolicy="no-referrer-when-downgrade" ' +
      'src="https://www.google.com/maps?q=' + encodeURIComponent('Świebodziński Dom Kultury, Piłsudskiego 39, 66-200 Świebodzin') + '&output=embed"></iframe>';
  });

  // Formularz kontaktowy — EmailJS (uzupełnić klucze po założeniu konta klubu)
  const EMAILJS = { publicKey: '', serviceId: '', templateId: '' };
  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const ready = EMAILJS.publicKey && EMAILJS.serviceId && EMAILJS.templateId;
    if (!ready) {
      status.textContent = 'Formularz jest w przygotowaniu — do tego czasu zapraszamy w piątek lub na 145.275 MHz.';
      form.querySelector('button[type="submit"]').disabled = true;
    }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!ready) return;
      if (form.website.value) return; // honeypot
      status.textContent = 'Wysyłanie…';
      try {
        if (!window.emailjs) await new Promise((res, rej) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js';
          s.onload = res; s.onerror = rej; document.head.appendChild(s);
        });
        emailjs.init({ publicKey: EMAILJS.publicKey });
        await emailjs.sendForm(EMAILJS.serviceId, EMAILJS.templateId, form);
        form.reset();
        status.textContent = 'Dziękujemy! Wiadomość została wysłana. 73!';
      } catch (err) {
        status.textContent = 'Nie udało się wysłać wiadomości. Spróbuj ponownie później.';
      }
    });
  }
})();
