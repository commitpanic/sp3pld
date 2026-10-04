# SP3PLD — strona Klubu Krótkofalowców PZK w Świebodzinie

Statyczna strona (HTML + CSS + Vanilla JS), bez frameworków i CMS. Motyw „Karta QSL” — jasny, wzorowany na historycznej karcie QSL klubu.

## Struktura

```
index.html               strona główna
o-klubie.html            historia, stacja, siedziba, karty QSL klubu
aktualnosci.html         log klubowy (wpisy archiwalne + nowe)
osiagniecia.html         DXCC Honor Roll, tabele DXCC/WAZ, dyplomy
czlonkowie.html          lista członków i Silent Keys
galeria.html             galeria z filtrami i podglądem
linki.html               linkownia
kontakt.html             adres, mapa (po kliknięciu), formularz EmailJS
polityka-prywatnosci.html
404.html
assets/css/style.css     motyw (tokeny kolorów w :root)
assets/js/components.js  pasek stacji, menu i stopka (wspólne dla wszystkich stron)
assets/js/main.js        zegar UTC, status dnia klubowego, A−/A+, kontrast, galeria, mapa, formularz
assets/img/              zdjęcia (archiwum starej strony), logotypy PZK / ŚDK / herb Gminy
```

`_zrodla/` — materiały źródłowe (kopia starej strony, logotypy PZK, pliki od klubu). Nie jest publikowany (`.gitignore`).

## Podgląd lokalny

```bash
python -m http.server 8732
```

## Jak dodać aktualność

W `aktualnosci.html` skopiuj blok `<article class="post" id="...">` i wklej na górze listy. Zdjęcia wrzuć do `assets/img/aktualnosci/`. Na stronie głównej (`index.html`, sekcja „Aktualności”) podmień jedną z trzech kart.

## Jak dodać członka

W `czlonkowie.html` dodaj wiersz do tabeli i usuń wiersz przykładowy `SP3ABC`:

```html
<tr><td class="call">SP3XYZ</td><td>Imię</td><td>Świebodzin</td><td></td></tr>
```

## Publikacja

- DEV: GitHub Pages (gałąź `main`, katalog główny; plik `.nojekyll`).
- PROD: po decyzji o domenie — plik `CNAME` + rekordy DNS.

Created by [kubabuba.pl](https://kubabuba.pl)
