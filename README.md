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
kontakt.html             adres, mapa Google, formularz Web3Forms
polityka-prywatnosci.html
404.html
assets/css/style.css     motyw (tokeny kolorów w :root)
assets/js/components.js  pasek stacji, menu i stopka (wspólne dla wszystkich stron)
assets/js/main.js        pasek stacji (ticker, zegar UTC, status), A−/A+, kontrast, galeria, formularz
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
| `zdjecie` | nie | zdjęcie główne (`plik` + `opis` dla niewidomych); bez zdjęcia w jego miejscu wyświetla się zielony pas z napisem SP3PLD (na liście wpisów i na stronie głównej) |
| `galeria` | nie | dodatkowe zdjęcia — miniatury z podglądem po kliknięciu |
| `linki` | nie | linki pod treścią: artykuł, film, relacja, strona |
| `wspomnienie` | nie | `true` — wpis wspomnieniowy (ciemny pasek z boku) |
| `ukryty` | nie | `true` — wpis nie wyświetla się (szkic) |

**Zdjęcia:** wrzuć pliki do `assets/img/aktualnosci/` — najlepiej w podfolderze wpisu, np. `assets/img/aktualnosci/2026-spotkanie/1.jpg` — i w JSON-ie podaj ścieżkę od tego folderu (`"2026-spotkanie/1.jpg"`). Można też podać pełny adres `https://...`. Zalecany rozmiar: ok. 1600 px dłuższy bok, JPG, do ~400 KB.

### `data/osiagniecia.json`

- `stanNa` — data zestawienia (RRRR-MM-DD), wyświetlana nad tabelami,
- `uwaga` — notka pod tabelami (pusty tekst = brak notki),
- `honorRoll.potwierdzone` / `wszystkie` — aktualne podmioty DXCC: licznik „Honor Roll #1” (strona główna i Osiągnięcia) i zapis „340/340” w tekście,
- `skala.dxcc` / `skala.waz` — wartość odpowiadająca pełnemu paskowi (DXCC: najwyższy wynik, obecnie MIXED 346 — liczby obejmują podmioty usunięte; WAZ: 40 stref),
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

## Formularz kontaktowy (Web3Forms)

Wiadomości z formularza na stronie **Kontakt** trafiają bezpośrednio na skrzynkę klubu **sp3pld@vp.pl** przez [Web3Forms](https://web3forms.com) — bez pośredniego konta (np. Gmaila). Darmowy plan: 250 wiadomości miesięcznie.

**Stan na 11.10.2026:** kod jest gotowy i opublikowany, brakuje tylko klucza. Do tego czasu formularz jest wyłączony z komunikatem „Formularz jest w przygotowaniu…”.

### Konfiguracja — krok po kroku

1. **Utworzenie klucza** (potrzebny dostęp do skrzynki sp3pld@vp.pl)
   - wejść na https://web3forms.com → przycisk **„Create your Access Key”**,
   - wpisać adres **sp3pld@vp.pl** i zatwierdzić,
   - na skrzynkę sp3pld@vp.pl przyjdzie mail od Web3Forms z kluczem (*Access Key*) w postaci `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
     (jeśli nie ma — sprawdzić folder **Spam / Oferty**).

2. **Wklejenie klucza** w `assets/js/main.js` (sekcja „Formularz kontaktowy”):

   ```js
   const WEB3FORMS_KEY = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx';
   ```

   Nic więcej nie trzeba zmieniać — formularz włącza się automatycznie, gdy klucz nie jest pusty.

3. **Test lokalny**
   - `python -m http.server 8732` → http://localhost:8732/kontakt.html,
   - wypełnić formularz (imię, e-mail, wiadomość, zgoda RODO) i wysłać,
   - powinien pojawić się komunikat „Dziękujemy! Wiadomość została wysłana. 73!”,
   - sprawdzić, czy mail dotarł na sp3pld@vp.pl (temat: „Wiadomość ze strony SP3PLD od …”, także w Spamie),
   - kliknąć „Odpowiedz” — adresatem powinien być e-mail wpisany w formularzu.

4. **Publikacja** — commit + push na `main`; GitHub Pages przebuduje stronę w ok. minutę. Powtórzyć test na https://commitpanic.github.io/sp3pld/kontakt.html.

5. **Po teście** — w `TODO.md` odhaczyć punkt o kluczu Web3Forms; jeśli mail trafił do Spamu, oznaczyć go w skrzynce vp.pl jako „To nie spam”.

### Jak to działa

| Element | Opis |
|---|---|
| Kod | `assets/js/main.js` → `fetch('https://api.web3forms.com/submit', …)` z polami `access_key`, `subject`, `from_name`, `name`, `email`, `message` |
| Odbiorca | adres, dla którego wygenerowano klucz — zmiana adresu = nowy klucz |
| Odpowiedź | Web3Forms ustawia pole `email` jako *Reply-To* |
| Antyspam | ukryte pole `website` (honeypot) + walidacja wymaganych pól i zgody RODO przed wysłaniem; Web3Forms ma własne filtry |
| Bezpieczeństwo | klucz jest **jawny z założenia** (widoczny w kodzie strony) — pozwala tylko wysłać wiadomość na ten jeden adres, nie daje dostępu do skrzynki |
| RODO | Web3Forms opisany w `polityka-prywatnosci.html` jako podmiot przetwarzający; administrator danych — **do uzupełnienia** |

### Gdy coś nie działa

- **„Nie udało się wysłać wiadomości…”** — sprawdzić w konsoli przeglądarki (F12 → Console / Network → `submit`): błędny klucz zwraca 400, przekroczony limit 429.
- **Brak maila** — folder Spam; poprawność klucza (czy na pewno ten z maila dla sp3pld@vp.pl).
- **Zmiana adresu odbiorcy** — wygenerować nowy klucz dla nowego adresu i podmienić `WEB3FORMS_KEY`.
- **Limit 250/mies.** — przy normalnym ruchu klubu nieosiągalny; ewentualnie plan płatny lub drugi klucz.

## Publikacja

- DEV: GitHub Pages (gałąź `main`, katalog główny; plik `.nojekyll`).
- PROD: po decyzji o domenie — plik `CNAME` + rekordy DNS.

Created by [kubabuba.pl](https://kubabuba.pl)
