/* Osiągnięcia DXCC / WAZ ładowane z data/osiagniecia.json.
   - [data-stat="..."]   — liczniki (strona główna, osiągnięcia)
   - #stats-tables       — tabele według emisji i pasm (osiągnięcia)
   - [data-stat-date]    — data zestawienia
   Wartości wpisane w HTML zostają, jeśli plik się nie wczyta. */
(function () {
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const num = v => (v === null || v === undefined || v === '') ? '—' : esc(v);
  const plDate = iso => {
    const [y, m, d] = String(iso).split('-');
    return d && m ? `${d}.${m}.${y}` : esc(iso);
  };

  function table(caption, first, rows, max) {
    const tr = rows.map(r => {
      const has = typeof r.confirmed === 'number';
      const pct = has && max ? Math.max(1, Math.min(100, Math.round(r.confirmed / max * 100))) : 0;
      const total = /^mixed$/i.test(r.nazwa) ? ' class="total"' : '';
      return `<tr${total}><th scope="row">${esc(r.nazwa)}</th>` +
        `<td class="num">${num(r.worked)}</td><td class="num">${num(r.confirmed)}</td>` +
        `<td style="width:35%">${has ? `<span class="bar" style="width:${pct}%" aria-hidden="true"></span>` : ''}</td></tr>`;
    }).join('');
    return `<div class="table-wrap"><table><caption>${esc(caption)}</caption>` +
      `<thead><tr><th scope="col">${first}</th><th scope="col" class="num">Worked</th>` +
      `<th scope="col" class="num">Confirmed</th><th scope="col"><span class="sr-only">Wykres</span></th></tr></thead>` +
      `<tbody>${tr}</tbody></table></div>`;
  }

  const mixed = list => (list || []).find(r => /^mixed$/i.test(r.nazwa)) || {};

  fetch('data/osiagniecia.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => {
      const hr = d.honorRoll || {};
      const wazMax = (d.skala && d.skala.waz) || 40;
      const wazMixed = mixed(d.waz && d.waz.emisje);
      const bands = ((d.dxcc && d.dxcc.pasma) || []).filter(r => r.confirmed > 0).length;

      const stats = {
        'honor-roll': hr.potwierdzone,
        'honor-roll-full': hr.potwierdzone && hr.wszystkie ? `${hr.potwierdzone}/${hr.wszystkie}` : null,
        'dxcc-mixed': mixed(d.dxcc && d.dxcc.emisje).confirmed,
        'waz-mixed': typeof wazMixed.confirmed === 'number' ? `${wazMixed.confirmed}/${wazMax}` : null,
        'pasma': bands || null,
      };
      document.querySelectorAll('[data-stat]').forEach(el => {
        const v = stats[el.dataset.stat];
        if (v !== null && v !== undefined) el.textContent = v;
      });
      document.querySelectorAll('[data-stat-date]').forEach(el => {
        if (d.stanNa) el.textContent = 'Stan na ' + plDate(d.stanNa);
      });
      document.querySelectorAll('[data-stat-note]').forEach(el => {
        el.textContent = d.uwaga || '';
        el.hidden = !d.uwaga;
      });

      const box = document.getElementById('stats-tables');
      if (box) {
        const dx = d.skala && d.skala.dxcc || 340;
        box.innerHTML =
          table('DXCC — według emisji', 'Emisja', d.dxcc.emisje, dx) +
          table('WAZ — według emisji', 'Emisja', d.waz.emisje, wazMax) +
          table('DXCC — według pasm', 'Pasmo', d.dxcc.pasma, dx) +
          table('WAZ — według pasm', 'Pasmo', d.waz.pasma, wazMax);
      }
    })
    .catch(() => {
      const box = document.getElementById('stats-tables');
      if (box) box.innerHTML = '<p class="note">Nie udało się wczytać statystyk. Spróbuj odświeżyć stronę.</p>';
    });
})();
