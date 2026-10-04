/* Lista członków i Silent Keys ładowana z data/czlonkowie.json.
   Wpis z "przyklad": true jest wyświetlany kursywą (wiersz zastępczy). */
(function () {
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function fill(id, rows, cols, empty) {
    const tbody = document.querySelector(`#${id} tbody`);
    if (!tbody) return;
    if (!rows || !rows.length) {
      tbody.innerHTML = `<tr><td colspan="${cols.length}">${empty}</td></tr>`;
      return;
    }
    tbody.innerHTML = rows.map(r =>
      `<tr${r.przyklad ? ' class="placeholder"' : ''}>` +
      cols.map(c => c === 'znak'
        ? `<td class="call">${esc(r.znak)}${id === 'silent-keys' ? ' sk' : ''}</td>`
        : `<td>${esc(r[c])}</td>`).join('') +
      '</tr>').join('');
  }

  fetch('data/czlonkowie.json', { cache: 'no-cache' })
    .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(d => {
      fill('members', d.czlonkowie, ['znak', 'imie', 'qth', 'uwagi'], 'Lista w przygotowaniu.');
      fill('silent-keys', d.silentKeys, ['znak', 'imie', 'uwagi'], 'Brak wpisów.');
      const sk = document.getElementById('silent-keys-section');
      if (sk) sk.hidden = !(d.silentKeys && d.silentKeys.length);
    })
    .catch(() => {
      ['members', 'silent-keys'].forEach(id => {
        const tbody = document.querySelector(`#${id} tbody`);
        if (tbody) tbody.innerHTML = '<tr><td colspan="4">Nie udało się wczytać listy. Spróbuj odświeżyć stronę.</td></tr>';
      });
    });
})();
