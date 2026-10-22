# Jak zmienić ligi w aplikacji Dart Dębica Zone

Wszystkie ligi są zapisane w **jednym pliku**: `src/config/leagues.ts`. Zmiana zajmuje kilka minut i nie wymaga wgrywania całego projektu.

## Krok 1. Skopiuj identyfikator ligi z Nakka

Otwórz ligę w Nakka i spójrz na pasek adresu, np.:

`https://n01darts.com/n01/league/season.php?id=`**`t_iKfq_6965`**

Potrzebny jest tylko fragment **po `id=`**, czyli w tym przykładzie `t_iKfq_6965`. Skopiuj go dla każdej ligi.

## Krok 2. Otwórz plik z ligami na GitHubie

1. Wejdź na **github.com/erowery/dartdebica-app**.
2. Kliknij kolejno folder **src**, potem **config**, a na końcu plik **leagues.ts**.
3. Kliknij ikonę **ołówka** (Edit this file) w prawym górnym rogu pliku.

## Krok 3. Zmień ligi

W pliku zobaczysz listę lig, każda w osobnej linijce:

```
{ id: 'lsdd1', name: 'I Liga LSDD', shortName: 'I Liga', nakkaId: 't_iKfq_6965' },
{ id: 'lsdd2', name: 'II Liga LSDD', shortName: 'II Liga', nakkaId: 't_pjgk_4087' },
{ id: 'lsdd3', name: 'III Liga LSDD', shortName: 'III Liga', nakkaId: 't_Hlu8_7788' },
{ id: 'lsdd4', name: 'IV Liga LSDD', shortName: 'IV Liga', nakkaId: 't_YOvw_3453' },
```

Co oznaczają pola:

- **id**: krótki kod ligi, widoczny m.in. na zakładkach panelu admina. Tylko małe litery i cyfry, bez spacji i polskich znaków. Każda liga musi mieć inny kod.
- **name**: pełna nazwa ligi, widoczna w aplikacji.
- **shortName**: skrócona nazwa.
- **nakkaId**: identyfikator skopiowany z Nakka w kroku 1.

**A) Nowy sezon, ta sama liczba lig:** w każdej linijce podmień tylko **nakkaId** na nowy identyfikator.

**B) Dodanie ligi:** skopiuj ostatnią linijkę, wklej ją pod spodem i zmień wszystkie cztery pola, np.:

```
{ id: 'lsdd5', name: 'V Liga LSDD', shortName: 'V Liga', nakkaId: 't_ABCD_1234' },
```

**C) Usunięcie ligi:** skasuj całą jej linijkę.

**D) Dwie grupy jednej ligi** (np. dwie III ligi jako osobne turnieje w Nakka): dodaj je jako dwie osobne linijki, np.:

```
{ id: 'lsdd3a', name: 'III Liga LSDD – grupa A', shortName: 'III Liga A', nakkaId: 't_AAAA_1111' },
{ id: 'lsdd3b', name: 'III Liga LSDD – grupa B', shortName: 'III Liga B', nakkaId: 't_BBBB_2222' },
```

Kolejność linijek to kolejność lig w aplikacji: pierwsza linijka to najwyższa liga.

## Krok 4. Zapisz zmiany

1. Kliknij zielony przycisk **Commit changes…** w prawym górnym rogu.
2. W okienku kliknij ponownie **Commit changes**.
3. Odczekaj 1–2 minuty, aż Vercel zbuduje nową wersję. Potem odśwież aplikację.

## Na co uważać

- Każda linijka zaczyna się od **`{`** i kończy na **`},`**, z przecinkiem na końcu.
- Teksty muszą być w **apostrofach**: `'...'`.
- Nie zmieniaj ani nie usuwaj linijek nad listą lig ani zamykającego nawiasu **`];`** pod nią.
- Jeśli coś pójdzie nie tak, strona się nie zepsuje. Vercel nie opublikuje błędnej wersji i zostawi poprzednią, a Ty poprawiasz plik i zapisujesz ponownie.

## Co zobaczą zawodnicy

- Gdy zmienisz identyfikator ligi albo usuniesz ligę, jej zawodnicy przy następnym otwarciu aplikacji wybiorą ponownie ligę i swoje nazwisko.
- Gracze z niezmienionych lig niczego nie zauważą.
- Postęp w treningach zostaje zachowany.
- Tabele, Mecze tygodnia, Zaległe i Live same dostosują się do nowej liczby lig.
