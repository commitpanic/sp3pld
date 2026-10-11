(function () {
  const root = document.documentElement;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
  };

  // Pasek stacji: na wąskim ekranie informacje przewijają się w pętli (ticker)
  const ticker = document.querySelector('.ticker');
  const noMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function setupTicker() {
    if (!ticker) return;
    const track = ticker.querySelector('.ticker-track');
    const items = track.querySelector('.ticker-items');
    track.querySelectorAll('.ticker-clone').forEach(c => c.remove());
    ticker.classList.remove('is-scrolling');
    if (noMotion.matches || items.scrollWidth <= ticker.clientWidth) return;
    ticker.classList.add('is-scrolling');
    const clone = items.cloneNode(true);
    clone.classList.add('ticker-clone');
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
    // stała prędkość ok. 40 px/s niezależnie od długości treści
    ticker.style.setProperty('--ticker-dur', Math.max(8, items.offsetWidth / 40) + 's');
  }
  let tickerTimer;
  const refreshTicker = () => { clearTimeout(tickerTimer); tickerTimer = setTimeout(setupTicker, 150); };
  addEventListener('resize', refreshTicker);
  if (noMotion.addEventListener) noMotion.addEventListener('change', refreshTicker);

  // Zegar UTC — każdy krótkofalowiec loguje w UTC; status dnia klubowego (czas lokalny: piątek 18–20)
  const all = sel => document.querySelectorAll(sel);
  let lastStatus = '';
  function tick() {
    const d = new Date();
    all('[data-utc]').forEach(el => { el.textContent = d.toISOString().slice(11, 16); });
    const fri = d.getDay() === 5, h = d.getHours();
    const on = fri && h >= 18 && h < 20;
    const status = on ? 'Klub otwarty — zapraszamy!'
      : fri && h < 18 ? 'Dziś spotkanie o 18:00'
      : 'Spotkania: piątek 18:00–20:00';
    all('[data-club-led]').forEach(el => el.classList.toggle('on', on));
    all('[data-club-status]').forEach(el => { el.textContent = status; });
    if (status !== lastStatus) { lastStatus = status; setupTicker(); }
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
    applyFs(); store.set('fs', fs); refreshTicker();
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

  // Formularz kontaktowy — Web3Forms: wiadomości trafiają bezpośrednio na skrzynkę klubu.
  // Klucz dostępu: web3forms.com → „Create Access Key” na adres klubu (przychodzi mailem).
  // Klucz jest z założenia publiczny — pozwala tylko wysłać wiadomość na ten jeden adres.
  const WEB3FORMS_KEY = '';
  const form = document.getElementById('contact-form');
  if (form) {
    const status = form.querySelector('.form-status');
    const submit = form.querySelector('button[type="submit"]');
    const val = n => form.elements.namedItem(n).value.trim(); // uwaga: form.name to atrybut formularza, nie pole
    if (!WEB3FORMS_KEY) {
      status.textContent = 'Formularz jest w przygotowaniu — do tego czasu zapraszamy w piątek lub na 145.275 MHz.';
      submit.disabled = true;
    }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!WEB3FORMS_KEY) return;
      if (val('website')) return; // pułapka na boty (honeypot)
      if (!form.reportValidity()) return; // wymagane pola i zgoda RODO
      submit.disabled = true;
      status.textContent = 'Wysyłanie…';
      try {
        const r = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_KEY,
            subject: 'Wiadomość ze strony SP3PLD od ' + val('name'),
            from_name: 'Strona SP3PLD',
            name: val('name'),
            email: val('email'), // Web3Forms ustawia go jako adres do odpowiedzi
            message: val('message'),
            botcheck: '',
          }),
        });
        const res = await r.json().catch(() => ({}));
        if (!r.ok || !res.success) throw new Error(res.message || r.status);
        form.reset();
        status.textContent = 'Dziękujemy! Wiadomość została wysłana. 73!';
      } catch (err) {
        status.textContent = 'Nie udało się wysłać wiadomości. Spróbuj ponownie później albo odwiedź nas w piątek.';
      } finally {
        submit.disabled = false;
      }
    });
  }
})();
