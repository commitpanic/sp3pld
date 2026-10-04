/* Aktualności ładowane z data/aktualnosci.json (kolejność jak w pliku — najnowsze na górze).
   - #news-list                 — pełne wpisy (aktualnosci.html)
   - #news-latest[data-limit]   — karty z zajawką (strona główna)
   Zdjęcia: nazwa pliku względem assets/img/aktualnosci/ albo pełny adres https://...
   W treści: akapit = tekst, lista punktowana = tablica tekstów, **pogrubienie**,
   znaki wywoławcze (np. SP3IBM) formatowane automatycznie. */
(function () {
  const IMG_DIR = 'assets/img/aktualnosci/';
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const src = p => /^(https?:)?\/\//.test(p) || p.startsWith('assets/') ? p : IMG_DIR + p;
  const isExternal = u => /^(https?:)?\/\//.test(u);

  // tekst → HTML: escape, **pogrubienie**, znaki wywoławcze SP/SQ/SO/SN/SR/3Z/HF
  const rich = t => esc(t)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\b((?:S[N-R]|3Z|HF)\d[A-Z]{1,4})\b/g, '<span class="call">$1</span>');

  // akapit (tekst) albo lista punktowana (tablica tekstów)
  const block = p => Array.isArray(p)
    ? `<ul>${p.map(li => `<li>${rich(li)}</li>`).join('')}</ul>`
    : `<p>${rich(p)}</p>`;

  function dateHtml(w) {
    let txt = w.dataTekst;
    if (!txt && w.data) {
      const [y, m, d] = String(w.data).split('-');
      txt = d ? `${d}.${m}.${y}` : m ? `${m}.${y}` : y;
    }
    if (!txt) return '';
    return w.data ? `<time datetime="${esc(w.data)}">${esc(txt)}</time>` : `<time>${esc(txt)}</time>`;
  }

  const photo = (z, lazy = true) => {
    if (!z) return '';
    const o = typeof z === 'string' ? { plik: z } : z;
    return `<img src="${esc(src(o.plik))}" alt="${esc(o.opis || '')}"${lazy ? ' loading="lazy"' : ''}>`;
  };

  function post(w) {
    const gal = (w.galeria || []).map((g, i) => {
      const o = typeof g === 'string' ? { plik: g } : g;
      const alt = o.opis || `${w.tytul} — zdjęcie ${i + 1}`;
      return `<a href="${esc(src(o.plik))}"><img src="${esc(src(o.plik))}" alt="${esc(alt)}" loading="lazy"></a>`;
    }).join('');
    const links = (w.linki || []).map(l =>
      `<p><a href="${esc(l.url)}"${isExternal(l.url) ? ' rel="noopener"' : ''}>${esc(l.tekst || l.url)} →</a></p>`).join('');
    const main = w.zdjecie
      ? `<div class="post-photo" data-lightbox><a href="${esc(src(w.zdjecie.plik || w.zdjecie))}">${photo(w.zdjecie)}</a></div>`
      : '';
    const cls = ['post', w.wspomnienie && 'memoriam', !w.zdjecie && 'no-img'].filter(Boolean).join(' ');
    return `<article class="${cls}"${w.id ? ` id="${esc(w.id)}"` : ''}>
      ${main}
      <div>
        ${dateHtml(w)}
        <h2>${esc(w.tytul)}</h2>
        ${(w.tresc || []).map(block).join('')}
        ${links}
        ${w.autor ? `<p class="by">${rich(w.autor)}</p>` : ''}
        ${gal ? `<div class="thumbs" data-lightbox>${gal}</div>` : ''}
      </div>
    </article>`;
  }

  function card(w) {
    const lead = w.zajawka || (w.tresc || []).find(p => typeof p === 'string') || '';
    const href = 'aktualnosci.html' + (w.id ? '#' + encodeURIComponent(w.id) : '');
    return `<li>
      ${w.zdjecie ? photo(w.zdjecie) : '<div class="log-ph" aria-hidden="true">SP3PLD</div>'}
      <div class="body">
        ${dateHtml(w)}
        <h3>${esc(w.tytul)}</h3>
        <p>${rich(lead)}</p>
        <a class="more" href="${href}">Czytaj dalej →</a>
      </div>
    </li>`;
  }

  const list = document.getElementById('news-list');
  const latest = document.getElementById('news-latest');
  if (!list && !latest) return;

  fetch('data/aktualnosci.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => {
      const wpisy = (d.wpisy || []).filter(w => !w.ukryty);
      if (list) {
        list.innerHTML = wpisy.length ? wpisy.map(post).join('') : '<p class="note">Brak wpisów.</p>';
        // przewiń do wpisu z adresu (#id), bo treść doszła po załadowaniu strony
        if (location.hash) {
          const el = document.getElementById(decodeURIComponent(location.hash.slice(1)));
          if (el) el.scrollIntoView();
        }
      }
      if (latest) {
        const n = parseInt(latest.dataset.limit, 10) || 3;
        latest.innerHTML = wpisy.slice(0, n).map(card).join('');
      }
    })
    .catch(() => {
      const msg = '<p class="note">Nie udało się wczytać aktualności. Spróbuj odświeżyć stronę.</p>';
      if (list) list.innerHTML = msg;
      if (latest) latest.outerHTML = msg;
    });
})();
