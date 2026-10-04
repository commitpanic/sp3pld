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

## Dane w plikach JSON

Aktualności, statystyki i lista członków są w katalogu `data/` — wystarczy edytować plik i wypchnąć zmiany, HTML zostaje bez zmian.

### `data/aktualnosci.json` — aktualności

Wpisy wyświetlają się w kolejności z pliku — **nowy wpis dodaj na górze** listy `wpisy`. Trzy pierwsze trafiają też na stronę główną.

```json
{
  "id": "spotkanie-2026",
  "data": "2026-10-09",
  "tytul": "Spotkanie klubowe",
  "zajawka": "Krótki opis na kartę na stronie głównej.",
  "tresc": [
    "Pierwszy akapit. Znaki jak SP3IBM formatują się same.",
    "Drugi akapit z **pogrubieniem**."
  ],
  "autor": "opracował Czesław SP3IBM",
  "zdjecie": { "plik": "2026-spotkanie/1.jpg", "opis": "Członkowie klubu przy stacji" },
  "galeria": ["2026-spotkanie/2.jpg", "2026-spotkanie/3.jpg"],
  "linki": [
    { "tekst": "Relacja na stronie OT 32", "url": "https://ot32.pzk.org.pl/" }
  ]
}
```

| Pole | Wymagane | Opis |
|---|---|---|
| `id` | zalecane | krótki identyfikator bez spacji i polskich znaków — adres wpisu to `aktualnosci.html#id` |
| `data` | nie | `RRRR-MM-DD` lub `RRRR-MM`; wyświetla się jako 09.10.2026 |
| `dataTekst` | nie | dowolny tekst zamiast daty, np. „z archiwum” |
| `tytul` | tak | tytuł wpisu |
| `zajawka` | nie | tekst karty na stronie głównej (domyślnie pierwszy akapit) |
| `tresc` | tak | lista akapitów; `**tekst**` = pogrubienie; lista punktowana = tablica w tablicy: `["punkt 1", "punkt 2"]` |
| `autor` | nie | podpis pod wpisem |
| `zdjecie` | nie | zdjęcie główne (`plik` + `opis` dla niewidomych); bez zdjęcia wpis jest na całą szerokość, a karta na stronie głównej dostaje zielony pas z napisem SP3PLD |
| `galeria` | nie | dodatkowe zdjęcia — miniatury z podglądem po kliknięciu |
| `linki` | nie | linki pod treścią: artykuł, film, relacja, strona |
| `wspomnienie` | nie | `true` — wpis wspomnieniowy (ciemny pasek z boku) |
| `ukryty` | nie | `true` — wpis nie wyświetla się (szkic) |

**Zdjęcia:** wrzuć pliki do `assets/img/aktualnosci/` — najlepiej w podfolderze wpisu, np. `assets/img/aktualnosci/2026-spotkanie/1.jpg` — i w JSON-ie podaj ścieżkę od tego folderu (`"2026-spotkanie/1.jpg"`). Można też podać pełny adres `https://...`. Zalecany rozmiar: ok. 1600 px dłuższy bok, JPG, do ~400 KB.

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
