'use client';

import { ReactNode } from 'react';

// Ta sama treść jest w pliku INSTRUKCJA-LIGI.md w głównym folderze projektu na GitHubie.

function Step({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-ink-700 bg-ink-900 p-4 mb-4">
      <h2 className="flex items-center gap-3 text-[17px] font-extrabold text-white mb-3">
        <span className="shrink-0 w-8 h-8 rounded-full bg-brand text-ink-950 flex items-center justify-center text-[15px]">
          {n}
        </span>
        {title}
      </h2>
      <div className="space-y-3 text-[15px] text-slate-300 leading-relaxed">{children}</div>
    </section>
  );
}

function Code({ children }: { children: ReactNode }) {
  return (
    <pre className="whitespace-pre-wrap break-words rounded-xl bg-ink-950 border border-ink-700 px-3 py-2.5 text-[12.5px] leading-relaxed text-brand-light">
      <code>{children}</code>
    </pre>
  );
}

const B = ({ children }: { children: ReactNode }) => <strong className="text-white">{children}</strong>;
const C = ({ children }: { children: ReactNode }) => (
  <code className="px-1.5 py-0.5 rounded bg-ink-800 border border-ink-700 text-[13px] text-gold">{children}</code>
);

export default function AdminInstrukcja() {
  return (
    <div className="mx-auto max-w-[640px]">
      <div className="mb-5 px-1">
        <h1 className="text-[24px] font-extrabold text-white leading-tight">Jak zmienić ligi</h1>
        <p className="text-[15px] text-slate-400 mt-1">
          Wszystkie ligi są zapisane w jednym pliku: <C>src/config/leagues.ts</C>. Zmiana zajmuje kilka minut i nie
          wymaga wgrywania całego projektu.
        </p>
      </div>

      <Step n={1} title="Skopiuj identyfikator ligi z Nakka">
        <p>Otwórz ligę w Nakka i spójrz na pasek adresu, np.:</p>
        <p className="break-all text-[13px] rounded-xl bg-ink-950 border border-ink-700 px-3 py-2.5 text-slate-400">
          https://n01darts.com/n01/league/season.php?id=<span className="font-bold text-gold">t_iKfq_6965</span>
        </p>
        <p>
          Potrzebny jest tylko fragment <B>po id=</B>, czyli w tym przykładzie <C>t_iKfq_6965</C>. Skopiuj go dla każdej
          ligi.
        </p>
      </Step>

      <Step n={2} title="Otwórz plik z ligami na GitHubie">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            Wejdź na{' '}
            <a
              href="https://github.com/erowery/dartdebica-app"
              target="_blank"
              rel="noreferrer"
              className="text-brand underline"
            >
              github.com/erowery/dartdebica-app
            </a>
            .
          </li>
          <li>
            Kliknij kolejno folder <B>src</B>, potem <B>config</B>, a na końcu plik <B>leagues.ts</B>.
          </li>
          <li>
            Kliknij ikonę <B>ołówka</B> (Edit this file) w prawym górnym rogu pliku.
          </li>
        </ol>
      </Step>

      <Step n={3} title="Zmień ligi">
        <p>W pliku zobaczysz listę lig, każda w osobnej linijce:</p>
        <Code>{`{ id: 'lsdd1', name: 'I Liga LSDD', shortName: 'I Liga', nakkaId: 't_iKfq_6965' },
{ id: 'lsdd2', name: 'II Liga LSDD', shortName: 'II Liga', nakkaId: 't_pjgk_4087' },
{ id: 'lsdd3', name: 'III Liga LSDD', shortName: 'III Liga', nakkaId: 't_Hlu8_7788' },
{ id: 'lsdd4', name: 'IV Liga LSDD', shortName: 'IV Liga', nakkaId: 't_YOvw_3453' },`}</Code>

        <p className="font-semibold text-white">Co oznaczają pola:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            <B>id</B>: krótki kod ligi, widoczny m.in. na zakładkach panelu admina. Tylko małe litery i cyfry, bez spacji i
            polskich znaków. Każda liga musi mieć inny kod.
          </li>
          <li>
            <B>name</B>: pełna nazwa ligi, widoczna w aplikacji.
          </li>
          <li>
            <B>shortName</B>: skrócona nazwa.
          </li>
          <li>
            <B>nakkaId</B>: identyfikator skopiowany z Nakka w kroku 1.
          </li>
        </ul>

        <div className="rounded-xl border border-ink-700 bg-ink-800/50 p-3 space-y-3">
          <p>
            <B>A) Nowy sezon, ta sama liczba lig:</B> w każdej linijce podmień tylko <B>nakkaId</B> na nowy
            identyfikator.
          </p>
          <div>
            <p className="mb-2">
              <B>B) Dodanie ligi:</B> skopiuj ostatnią linijkę, wklej ją pod spodem i zmień wszystkie cztery pola, np.:
            </p>
            <Code>{`{ id: 'lsdd5', name: 'V Liga LSDD', shortName: 'V Liga', nakkaId: 't_ABCD_1234' },`}</Code>
          </div>
          <p>
            <B>C) Usunięcie ligi:</B> skasuj całą jej linijkę.
          </p>
          <div>
            <p className="mb-2">
              <B>D) Dwie grupy jednej ligi</B> (np. dwie III ligi jako osobne turnieje w Nakka): dodaj je jako dwie
              osobne linijki, np.:
            </p>
            <Code>{`{ id: 'lsdd3a', name: 'III Liga LSDD – grupa A', shortName: 'III Liga A', nakkaId: 't_AAAA_1111' },
{ id: 'lsdd3b', name: 'III Liga LSDD – grupa B', shortName: 'III Liga B', nakkaId: 't_BBBB_2222' },`}</Code>
          </div>
        </div>

        <p>Kolejność linijek to kolejność lig w aplikacji: pierwsza linijka to najwyższa liga.</p>
      </Step>

      <Step n={4} title="Zapisz zmiany">
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            Kliknij zielony przycisk <B>Commit changes…</B> w prawym górnym rogu.
          </li>
          <li>
            W okienku kliknij ponownie <B>Commit changes</B>.
          </li>
          <li>Odczekaj 1–2 minuty, aż Vercel zbuduje nową wersję. Potem odśwież aplikację.</li>
        </ol>
      </Step>

      <Step n={5} title="Po sezonie: archiwum (zakładka Historia)">
        <p>
          Zanim podmienisz ligi na nowy sezon, dopisz stare do archiwum. W aplikacji, w zakładce{' '}
          <B>Liga → Historia</B>, zostaną końcowe tabele i mistrzowie.
        </p>
        <ol className="list-decimal pl-5 space-y-1.5">
          <li>
            W tym samym pliku <C>leagues.ts</C> znajdź na dole listę <B>ARCHIVE_SEASONS</B>.
          </li>
          <li>Dopisz zakończony sezon na górze listy, np.:</li>
        </ol>
        <Code>{`{
  season: '2025/2026',
  leagues: [
    { name: 'I Liga LSDD', nakkaId: 't_iKfq_6965' },
    { name: 'II Liga LSDD', nakkaId: 't_pjgk_4087' },
  ],
},`}</Code>
        <p>
          Użyj <B>starych</B> identyfikatorów z kończącego się sezonu. Dopiero potem podmień ligi w głównej liście na
          nowe i zapisz zmiany jak w kroku 4. Zakładka Historia pojawi się sama, gdy w archiwum będzie choć jeden sezon.
        </p>
      </Step>

      <section className="rounded-2xl border border-gold/40 bg-gold/10 p-4 mb-4">
        <h2 className="text-[17px] font-extrabold text-gold mb-3">Na co uważać</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
          <li>
            Każda linijka zaczyna się od <C>{'{'}</C> i kończy na <C>{'},'}</C>, z przecinkiem na końcu.
          </li>
          <li>
            Teksty muszą być w <B>apostrofach</B>: <C>{"'...'"}</C>.
          </li>
          <li>
            Nie zmieniaj ani nie usuwaj linijek nad listą lig ani zamykającego nawiasu <C>];</C> pod nią.
          </li>
          <li>
            Jeśli coś pójdzie nie tak, strona się nie zepsuje. Vercel nie opublikuje błędnej wersji i zostawi poprzednią,
            a Ty poprawiasz plik i zapisujesz ponownie.
          </li>
        </ul>
      </section>

      <section className="rounded-2xl border border-ink-700 bg-ink-900 p-4">
        <h2 className="text-[17px] font-extrabold text-white mb-3">Co zobaczą zawodnicy</h2>
        <ul className="list-disc pl-5 space-y-1.5 text-[15px] text-slate-300 leading-relaxed">
          <li>
            Gdy zmienisz identyfikator ligi albo usuniesz ligę, jej zawodnicy przy następnym otwarciu aplikacji wybiorą
            ponownie ligę i swoje nazwisko.
          </li>
          <li>Gracze z niezmienionych lig niczego nie zauważą.</li>
          <li>Postęp w treningach zostaje zachowany.</li>
          <li>Tabele, Mecze tygodnia, Zaległe i Live same dostosują się do nowej liczby lig.</li>
        </ul>
      </section>
    </div>
  );
}
