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

## Dane w plikach JSON

Statystyki i lista członków są w katalogu `data/` — wystarczy edytować plik i wypchnąć zmiany, HTML zostaje bez zmian.

### `data/osiagniecia.json`

- `stanNa` — data zestawienia (RRRR-MM-DD), wyświetlana nad tabelami,
- `uwaga` — notka pod tabelami (pusty tekst = brak notki),
- `honorRoll.potwierdzone` / `wszystkie` — licznik „DXCC Mixed” (strona główna i Osiągnięcia),
- `skala.dxcc` / `skala.waz` — maksimum dla pasków (aktualna liczba podmiotów DXCC, 40 stref WAZ),
- `dxcc.emisje`, `dxcc.pasma`, `waz.emisje`, `waz.pasma` — wiersze tabel: `{ "nazwa": "20 m", "worked": 298, "confirmed": 286 }`.
  Brak danych: `null`. Wiersz `MIXED` jest wyróżniony i zasila licznik „Strefy WAZ”.

### `data/czlonkowie.json`

```json
{
  "czlonkowie": [
    { "znak": "SP3XYZ", "imie": "Jan", "qth": "Świebodzin", "uwagi": "" }
  ],
  "silentKeys": [
    { "znak": "SP3ABC", "imie": "Jan", "uwagi": "założyciel klubu" }
  ]
}
```

Wpisy wyświetlają się w kolejności z pliku; przy Silent Keys dopisywane jest „sk”. Pusta tablica `silentKeys` ukrywa całą sekcję. Wpisy przykładowe (`"przyklad": true`) usuń po dodaniu prawdziwych. Publikujemy tylko znak, imię i miejscowość — za zgodą członka.

> Po edycji sprawdź poprawność JSON-a (np. https://jsonlint.com) — jeden brakujący przecinek blokuje wczytanie danych.
> Podgląd lokalny wymaga serwera (`python -m http.server`), bo przeglądarka nie wczyta JSON-a z `file://`.

## Publikacja

- DEV: GitHub Pages (gałąź `main`, katalog główny; plik `.nojekyll`).
- PROD: po decyzji o domenie — plik `CNAME` + rekordy DNS.

Created by [kubabuba.pl](https://kubabuba.pl)
