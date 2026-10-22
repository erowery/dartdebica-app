'use client';

import { SessionType } from '@/lib/sessionTraining';

export interface MainBlockResult {
  zoneShort: string;
  issueShort: string;
  diagnosis: string;
  advice: string;
}

type IssueCode = 'below' | 'above' | 'sideways' | 'unstable' | 'ladder' | 'tight';

const ISSUE_MAP: Record<string, IssueCode> = {
  'Poniżej celu': 'below',
  'Powyżej celu': 'above',
  'Ściąganie w lewo/prawo': 'sideways',
  'Niestabilna postawa': 'unstable',
  'Różna wysokość rzutów w jednej serii': 'ladder',
  'Ciasne rzuty, ale w pojedynczą wartość': 'tight',
};

interface Entry {
  diagnosis: string;
  advice: string;
}

function key(codes: IssueCode[]): string {
  return [...codes].sort().join('+');
}

// ---------- STREFA: D20 / D10 / D5 ----------
const ZONE_D20: Record<string, Entry> = {
  [key(['below'])]: {
    diagnosis: 'Opuszczanie łokcia przy przejściu na niższe sektory z tej samej serii (z D20 do D10/D5) lub zbyt wczesne opadanie przedramienia.',
    advice: 'Celując w D20, D10 i D5, utrzymuj łokieć w stałym punkcie. Przy przejściu z D20 niżej na D10 i D5 koryguj wysokość rzutu wyłącznie delikatnym obniżeniem tułowia w biodrze, a nie opuszczaniem ręki w łokciu.',
  },
  [key(['above'])]: {
    diagnosis: 'Zbyt mocne pchnięcie lotki z barku lub opóźnione otwarcie dłoni, najczęściej wynikające z próby "dociągnięcia" lotki na siłę do D20.',
    advice: 'Rzucanie powyżej D20/D10 oznacza przetrzymanie lotki w palcach lub nadrabianie siłą z barku. Rozluźnij chwyt, zredukuj dynamikę i pozwól lotce swobodnie wylecieć z dłoni w najwyższym punkcie łuku rzutu.',
  },
  [key(['sideways'])]: {
    diagnosis: 'Rotacja barków lub uciekanie przedramienia z pionowej osi przy przechodzeniu między prawą stroną a górą tarczy.',
    advice: 'Ściąganie lotek w bok przy D20/D10 oznacza zbaczanie przedramienia z toru rzutu. Po wypuszczeniu lotki dopilnuj, aby dłoń i wyprostowane palce zostawały skierowane pionowo w cel. Sprawdź, czy stopa na oche jest stabilna.',
  },
  [key(['unstable'])]: {
    diagnosis: 'Przenoszenie ciężaru ciała na palce stopy wykrocznej i "nurkowanie" do tarczy przy próbie sięgnięcia topów.',
    advice: 'Niestabilność na oche destabilizuje rzut w D20 i D10. Zablokuj ciężar ciała na pięcie stopy wykrocznej. Zmiana sekwencji z D20 na D5 nie może zmieniać punktu ciężkości Twojej postawy.',
  },
  [key(['ladder'])]: {
    diagnosis: 'Nierównomierny chwyt lub zmienna siła wypchnięcia lotki w kolejnych rzutach w tej samej serii.',
    advice: 'Drabinka na D20/D10/D5 to znak nierównej siły lub zmiennego chwytu. Przed każdym rzutem w serii wykonaj powtarzalny, identyczny zamach i upewnij się, że chwytasz lotkę dokładnie w tym samym miejscu.',
  },
  [key(['below', 'sideways'])]: {
    diagnosis: 'Złożony błąd biomechaniczny - opadanie łokcia połączone ze zbaczaniem przedramienia z osi rzutu.',
    advice: 'Twoja ręka traci zarówno wysokość, jak i pionową osiowość. Zwolnij tempo: zablokuj łokieć w miejscu i skup się na pełnym wyproście ręki aż do wyprostowania palców dokładnie w stronę celu.',
  },
  [key(['below', 'unstable'])]: {
    diagnosis: 'Opadanie tułowia i łokcia wywołane brakiem oparcia na pięcie stopy wykrocznej.',
    advice: 'Pudłowanie poniżej D20/D10 wynika z "nurkowania" do tarczy. Usztywnij postawę na pięcie, oprzyj tułów stabilnie i nie obniżaj łokcia przy rzucie w D5.',
  },
  [key(['below', 'ladder'])]: {
    diagnosis: 'Zmęczenie mięśniowe przedramienia powodujące stopniowe opadanie ręki z każdą kolejną lotką w serii.',
    advice: 'Z każdą lotką w serii Twoja ręka opada niżej. Wykonaj mikropauzę między drugą a trzecią lotką, zresetuj złożenie i utrzymaj łokieć na tej samej wysokości.',
  },
  [key(['above', 'sideways'])]: {
    diagnosis: 'Pchanie lotki z jednoczesną rotacją barków - gwałtowny, niekontrolowany wyrzut.',
    advice: 'Rzucasz zbyt agresywnie, co powoduje przepchnięcie i zbaczanie ręki w bok. Rozluźnij barki, zwolnij ruch i skup się na płynnym, lekkim wypuszczeniu lotki.',
  },
  [key(['above', 'unstable'])]: {
    diagnosis: 'Wyrzucanie tułowia do przodu w momencie wypchnięcia lotki z dłoni.',
    advice: 'Przepchanie lotki nad D20 wiąże się z gwałtownym ruchem całego ciała. Zablokuj biodra i stopy - rzut ma wykonywać wyłącznie przedramię, a nie cały tułów.',
  },
  [key(['sideways', 'unstable'])]: {
    diagnosis: 'Chwianie się na oche powodujące uciekanie przedramienia z pionowej osi rzutu.',
    advice: 'Utrata balansu zmusza Twoją rękę do szukania równowagi w powietrzu, co powoduje uciekanie lotek na boki. Wprowadź pełną stabilizację nóg przed wykonaniem zamachu.',
  },
  [key(['sideways', 'ladder'])]: {
    diagnosis: 'Brak powtarzalnego punktu wypuszczenia (release point) połączony z niestabilnym łokciem.',
    advice: 'Rozrzut w pionie i poziomie świadczy o zmiennym chwycie i niepewnym wyproście. Skup się na stałym punkcie otwarcia dłoni i dociągnięciu ręki do końca.',
  },
  [key(['below', 'sideways', 'unstable'])]: {
    diagnosis: 'Całkowite rozbalansowanie pozycji na oche połączone z za wczesnym opadaniem całej ręki.',
    advice: 'Twoja postawa straciła fundament. Najpierw zablokuj ciężar ciała na pięcie stopy wykrocznej. Dopiero ze stabilnej bazy pilnuj stałej wysokości łokcia i pionowego wyprostu ręki.',
  },
  [key(['below', 'sideways', 'ladder'])]: {
    diagnosis: 'Brak kontroli motorycznej - ręka zrywa rzut, opada i ucieka w boki w trakcie jednej serii.',
    advice: 'Brak powtarzalności rzutu. Zredukuj tempo - odłóż na chwilę celowanie w duble i zrób kilka serii płynnych rzutów w środek tarczy, aby odbudować osiowość i rytm.',
  },
  [key(['above', 'sideways', 'unstable'])]: {
    diagnosis: 'Przejęcie kontroli nad rzutem przez siłowe pchnięcie z tułowia i barku.',
    advice: 'Próbujesz "wepchnąć" lotkę w D20/D10 siłą ciała. Zatrzymaj się, zrób wydech, rozluźnij barki i rzucaj samą ręką bez dodawania siły z tułowia.',
  },
};
const ZONE_D20_CATCHALL: Entry = {
  diagnosis: 'Głębokie rozproszenie mechaniczne lub chaos motoryczny pod wpływem spięcia/zmęczenia.',
  advice: 'Doszło do nakładania się kilku błędów naraz. Nie koryguj wszystkiego jednocześnie. Na kolejnych 3 seriach skup się TYLKO na jednej rzeczy: stabilnym oparciu stóp na oche. Gdy wrócisz do balansu, reszta elementów zacznie się układać.',
};

// ---------- STREFA: D16 / D8 / D4 ----------
const ZONE_D16: Record<string, Entry> = {
  [key(['below'])]: {
    diagnosis: 'Opuszczanie łokcia przy przejściu na niższe sektory lewej strony (D8 → D4).',
    advice: 'Przechodząc z D16 na D8 i D4, nie obniżaj ręki. Zablokuj łokieć na stałej wysokości i obniżaj pozycję wyłącznie poprzez pochylenie w biodrze.',
  },
  [key(['sideways'])]: {
    diagnosis: 'Złe ustawienie kąta stopy/bioder względem lewej krawędzi tarczy, powodujące zamykanie ruchu ręki do środka.',
    advice: 'Ściąganie przy D16/D8/D4 wynika z braku korekty pozycji na oche. Przesuń się minimalnie w lewo na linii oche lub lekko otwórz biodro, aby ręka wypychała lotkę wprost na sektor bez załamywania w łokciu.',
  },
  [key(['above'])]: {
    diagnosis: 'Zbyt mocne pchnięcie lotki przy celowaniu w D16 spowodowane spięciem przedramienia.',
    advice: 'Rzuty powyżej D16 to efekt siłowego wyrzutu. Rozluźnij chwyt w dłoni i pozwól lotce swobodnie wylecieć z palców bez dodawania siły z barku.',
  },
  [key(['unstable'])]: {
    diagnosis: 'Przechylanie tułowia w lewo zamiast pełnego przestawienia pozycji stóp na oche.',
    advice: 'Celując w D16/D8/D4, nie przechylaj tułowia w bok. Skoryguj pozycję na nogach tak, aby ramiona pozostały stabilne i prostopadłe do celu.',
  },
  [key(['ladder'])]: {
    diagnosis: 'Nierównomierne wypuszczenie lotki przy kolejnych rzutach na lewej stronie tarczy.',
    advice: 'Nierówna wysokość na D16/D8 wskazuje na zmienny punkt otwarcia dłoni. Zadbaj o płynny, powtarzalny wyprost przedramienia przy każdej lotce.',
  },
  [key(['below', 'sideways'])]: {
    diagnosis: 'Uciekanie łokcia w bok połączone ze zbyt wczesnym opadaniem ręki przy lewej krawędzi tarczy.',
    advice: 'Na D16/D8 Twoja ręka ucieka po przekątnej. Przesuń się lekko na oche w lewo, zablokuj łokieć i dopilnuj, by dłoń po wypuszczeniu zostawała idealnie w pionie.',
  },
  [key(['sideways', 'unstable'])]: {
    diagnosis: 'Przechylanie się w stronę D16 na uniesionej pięcie, co niszczy osiowość rzutu.',
    advice: 'Nie sięgaj do D16 ciałem. Zablokuj stopę na oche, ustaw bark prostopadle do D16 i rzucaj czysto z przedramienia.',
  },
  [key(['below', 'ladder'])]: {
    diagnosis: 'Zmęczenie mięśniowe i opadanie łokcia w trakcie wykonywania serii na D16/D8/D4.',
    advice: 'Opadanie ręki w serii na D16/D8 wynika z usztywnienia mięśni. Rozluźnij bark i zrób mikropauzę przed ostatnią lotką.',
  },
};
const ZONE_D16_CATCHALL: Entry = {
  diagnosis: 'Błąd kąta ustawienia na oche rzutujący na całą biomechanikę (postawa, osiowość i wysokość).',
  advice: 'Lewa strona tarczy wyraźnie Ci nie leży ze względu na złe ustawienie na oche. Zamiast rzucać z ukosa, przesuń się o 10-15 cm w lewo na oche i ustaw stopę wprost na D16, odbudowując stabilność od podstaw.',
};

// ---------- STREFA: BULLSEYE ----------
const ZONE_BULL: Record<string, Entry> = {
  [key(['below'])]: {
    diagnosis: 'Zbyt wczesne opadanie łokcia lub asekuracyjny, niepewny wyrzut.',
    advice: 'Pudłowanie poniżej Bulla to efekt "skracania" rzutu. Dokończ wyprost ręki z pełną pewnością siebie, wypychając lotkę wprost w czerwony środek.',
  },
  [key(['sideways'])]: {
    diagnosis: 'Zbaczanie przedramienia z centralnej osi tarczy lub rotacja barków.',
    advice: 'Przy rzucie w Bullseye Twoje przedramię musi pracować jak tłok w jednej płaszczyźnie. Dopilnuj, by palce po wyproście wskazywały idealnie w środek tarczy.',
  },
  [key(['above'])]: {
    diagnosis: 'Przepchnięcie lotki spowodowane zbyt dużą siłą lub opóźnionym otwarciem dłoni.',
    advice: 'Wielu graczy "przedobrza" z siłą przy Bullseye. Rozluźnij chwyt i pozwól lotce wylecieć swobodnie w najwyższym punkcie toru rzutu.',
  },
  [key(['unstable'])]: {
    diagnosis: '"Nurkowanie" tułowiem do przodu w próbie skrócenia dystansu do środka tarczy.',
    advice: 'Nie pochylaj się gwałtownie do Bulla. Osadź ciężar na pięcie stopy wykrocznej i zachowaj nieruchomy tułów.',
  },
  [key(['ladder'])]: {
    diagnosis: 'Zmienna siła wyrzutu lub wahania rytmu przy rzutach w środek.',
    advice: 'Drabinka na Bullu wynika ze zmiennej siły. Prowadź rzut w tym samym, płynnym tempie dla każdej lotki.',
  },
  [key(['below', 'sideways'])]: {
    diagnosis: 'Zrywanie rzutu w środek tarczy z opadaniem łokcia i zbaczaniem przedramienia.',
    advice: 'Rzut w Bullseye stracił osiowość i płynność. Zablokuj łokieć na wysokości Bulla i dociągnij rękę idealnie do końca.',
  },
};
const ZONE_BULL_MULTI: Entry = {
  diagnosis: 'Brak czucia środka tarczy wywołany spięciem mięśniowym lub presją celu.',
  advice: 'Bullseye wywołuje u Ciebie niepotrzebną presję. Zrób głęboki wydech, rozluźnij dłoń i traktuj Bulla jak zwykły sektor, bez dodawania siły.',
};

// =====================================================================
// TRENING POTRÓJNYCH - osobne macierze (na wzór dubli).
// 'tight' = "Ciasne rzuty, ale w pojedynczą wartość": rzut powtarzalny, brakuje celności.
// =====================================================================

// ---------- STREFA: TRIPLE 20 ----------
const ZONE_T20: Record<string, Entry> = {
  [key(['below'])]: {
    diagnosis: 'Opuszczanie łokcia lub zbyt wczesne opadanie przedramienia - lotki lądują pod T20, w pojedynczej 20.',
    advice: 'Celując w T20, utrzymuj łokieć w stałym punkcie przez cały rzut. Jeśli musisz skorygować wysokość, zrób to delikatnym pochyleniem tułowia w biodrze, a nie opuszczaniem ręki w łokciu.',
  },
  [key(['above'])]: {
    diagnosis: 'Zbyt mocne pchnięcie lotki z barku lub opóźnione otwarcie dłoni, najczęściej wynikające z próby "dociągnięcia" lotki na siłę do T20.',
    advice: 'Rzucanie powyżej T20 oznacza przetrzymanie lotki w palcach lub nadrabianie siłą z barku. Rozluźnij chwyt, zredukuj dynamikę i pozwól lotce swobodnie wylecieć z dłoni w najwyższym punkcie łuku rzutu.',
  },
  [key(['sideways'])]: {
    diagnosis: 'Rotacja barków lub uciekanie przedramienia z pionowej osi - lotki trafiają w sąsiednie sektory 1 i 5.',
    advice: 'Ściąganie lotek w bok przy T20 oznacza zbaczanie przedramienia z toru rzutu, a obok 20 leżą 1 i 5, więc każdy błąd w poziomie kosztuje dużo punktów. Po wypuszczeniu lotki dopilnuj, aby dłoń i wyprostowane palce zostawały skierowane pionowo w cel. Sprawdź, czy stopa na oche jest stabilna.',
  },
  [key(['unstable'])]: {
    diagnosis: 'Przenoszenie ciężaru ciała na palce stopy wykrocznej i "nurkowanie" do tarczy przy próbie sięgnięcia T20.',
    advice: 'Niestabilność na oche destabilizuje rzut w T20. Zablokuj ciężar ciała na pięcie stopy wykrocznej. Kolejne lotki w serii nie mogą zmieniać punktu ciężkości Twojej postawy.',
  },
  [key(['tight'])]: {
    diagnosis: 'Dobre skupienie lotek, ale punkt celowania jest minimalnie przesunięty - grupa ląduje w pojedynczej 20 zamiast w T20.',
    advice: 'Twoje lotki trzymają się razem, więc rzut jest powtarzalny. Brakuje celności: skup wzrok na samym polu T20, a nie na całym sektorze 20, i koryguj punkt celowania minimalnie, bez zmiany rytmu rzutu.',
  },
  [key(['below', 'sideways'])]: {
    diagnosis: 'Złożony błąd biomechaniczny - opadanie łokcia połączone ze zbaczaniem przedramienia z osi rzutu.',
    advice: 'Twoja ręka traci zarówno wysokość, jak i pionową osiowość. Zwolnij tempo: zablokuj łokieć w miejscu i skup się na pełnym wyproście ręki aż do wyprostowania palców dokładnie w stronę T20.',
  },
  [key(['below', 'unstable'])]: {
    diagnosis: 'Opadanie tułowia i łokcia wywołane brakiem oparcia na pięcie stopy wykrocznej.',
    advice: 'Pudłowanie poniżej T20 wynika z "nurkowania" do tarczy. Usztywnij postawę na pięcie, oprzyj tułów stabilnie i nie obniżaj łokcia przy kolejnych lotkach w serii.',
  },
  [key(['below', 'tight'])]: {
    diagnosis: 'Zwarta grupa lotek ląduje stale pod T20 - rzut jest powtarzalny, ale punkt celowania jest ustawiony za nisko.',
    advice: 'Nie zmieniaj techniki, bo rzut jest powtarzalny. Przesuń punkt celowania minimalnie wyżej, na samo pole T20, i utrzymaj łokieć na stałej wysokości.',
  },
  [key(['above', 'sideways'])]: {
    diagnosis: 'Pchanie lotki z jednoczesną rotacją barków - gwałtowny, niekontrolowany wyrzut.',
    advice: 'Rzucasz zbyt agresywnie, co powoduje przepchnięcie i zbaczanie ręki w bok. Rozluźnij barki, zwolnij ruch i skup się na płynnym, lekkim wypuszczeniu lotki.',
  },
  [key(['above', 'unstable'])]: {
    diagnosis: 'Wyrzucanie tułowia do przodu w momencie wypchnięcia lotki z dłoni.',
    advice: 'Przepchanie lotki nad T20 wiąże się z gwałtownym ruchem całego ciała. Zablokuj biodra i stopy - rzut ma wykonywać wyłącznie przedramię, a nie cały tułów.',
  },
  [key(['sideways', 'unstable'])]: {
    diagnosis: 'Chwianie się na oche powodujące uciekanie przedramienia z pionowej osi rzutu.',
    advice: 'Utrata balansu zmusza Twoją rękę do szukania równowagi w powietrzu, co powoduje uciekanie lotek na boki, w 1 i 5. Wprowadź pełną stabilizację nóg przed wykonaniem zamachu.',
  },
  [key(['sideways', 'tight'])]: {
    diagnosis: 'Zwarta grupa lotek przesunięta w bok od T20 - w stronę 1 lub 5. Rzut jest powtarzalny, ale źle ustawiony względem celu.',
    advice: 'Nie poprawiaj ręki w trakcie rzutu. Sprawdź ustawienie stopy i barku względem T20 i przesuń się minimalnie na oche tak, aby ręka szła prosto w cel.',
  },
  [key(['below', 'sideways', 'unstable'])]: {
    diagnosis: 'Całkowite rozbalansowanie pozycji na oche połączone z za wczesnym opadaniem całej ręki.',
    advice: 'Twoja postawa straciła fundament. Najpierw zablokuj ciężar ciała na pięcie stopy wykrocznej. Dopiero ze stabilnej bazy pilnuj stałej wysokości łokcia i pionowego wyprostu ręki w stronę T20.',
  },
  [key(['below', 'sideways', 'tight'])]: {
    diagnosis: 'Zwarta grupa lotek stale przesunięta w dół i w bok od T20 - zły punkt celowania lub ustawienie na oche.',
    advice: 'Rzut jest powtarzalny, więc nie zmieniaj techniki. Popraw ustawienie stopy i barku względem T20, a punkt celowania przesuń minimalnie wyżej.',
  },
  [key(['above', 'sideways', 'unstable'])]: {
    diagnosis: 'Przejęcie kontroli nad rzutem przez siłowe pchnięcie z tułowia i barku.',
    advice: 'Próbujesz "wepchnąć" lotkę w T20 siłą ciała. Zatrzymaj się, zrób wydech, rozluźnij barki i rzucaj samą ręką bez dodawania siły z tułowia.',
  },
};
const ZONE_T20_CATCHALL: Entry = {
  diagnosis: 'Głębokie rozproszenie mechaniczne lub chaos motoryczny pod wpływem spięcia/zmęczenia.',
  advice: 'Doszło do nakładania się kilku błędów naraz. Nie koryguj wszystkiego jednocześnie. Na kolejnych 3 seriach w T20 skup się TYLKO na jednej rzeczy: stabilnym oparciu stóp na oche. Gdy wrócisz do balansu, reszta elementów zacznie się układać.',
};

// ---------- STREFA: TRIPLE 19 ----------
const ZONE_T19: Record<string, Entry> = {
  [key(['below'])]: {
    diagnosis: 'Opuszczanie łokcia przy rzucie w dolną część tarczy - lotki lądują pod T19, w pojedynczej 19.',
    advice: 'Celując w T19, nie obniżaj ręki w łokciu. Zablokuj łokieć na stałej wysokości i obniżaj pozycję wyłącznie poprzez pochylenie w biodrze.',
  },
  [key(['sideways'])]: {
    diagnosis: 'Złe ustawienie kąta stopy/bioder względem T19, powodujące zamykanie lub otwieranie ruchu ręki - lotki trafiają w sąsiednie 7 lub 3.',
    advice: 'Ściąganie przy T19 wynika z braku korekty pozycji na oche. Przesuń się minimalnie na linii oche lub lekko otwórz biodro, aby ręka wypychała lotkę wprost na T19 bez załamywania w łokciu.',
  },
  [key(['above'])]: {
    diagnosis: 'Zbyt mocne pchnięcie lotki przy celowaniu w T19 spowodowane spięciem przedramienia.',
    advice: 'Rzuty powyżej T19 to efekt siłowego wyrzutu. Rozluźnij chwyt w dłoni i pozwól lotce swobodnie wylecieć z palców bez dodawania siły z barku.',
  },
  [key(['unstable'])]: {
    diagnosis: 'Przechylanie tułowia zamiast pełnego przestawienia pozycji stóp na oche przy rzucie w dolną część tarczy.',
    advice: 'Celując w T19, nie przechylaj tułowia w bok ani do przodu. Skoryguj pozycję na nogach tak, aby ramiona pozostały stabilne i prostopadłe do celu.',
  },
  [key(['tight'])]: {
    diagnosis: 'Dobre skupienie lotek, ale grupa ląduje w pojedynczej 19 zamiast w T19.',
    advice: 'Twoje lotki trzymają się razem, więc rzut jest powtarzalny. Popracuj nad celnością: skup wzrok na samym polu T19 i koryguj punkt celowania minimalnie, bez zmiany rytmu rzutu.',
  },
  [key(['below', 'sideways'])]: {
    diagnosis: 'Uciekanie łokcia w bok połączone ze zbyt wczesnym opadaniem ręki przy T19.',
    advice: 'Na T19 Twoja ręka ucieka po przekątnej. Popraw ustawienie na oche, zablokuj łokieć i dopilnuj, by dłoń po wypuszczeniu zostawała idealnie w pionie.',
  },
  [key(['sideways', 'unstable'])]: {
    diagnosis: 'Przechylanie się w stronę T19 na uniesionej pięcie, co niszczy osiowość rzutu.',
    advice: 'Nie sięgaj do T19 ciałem. Zablokuj stopę na oche, ustaw bark w linii z T19 i rzucaj czysto z przedramienia.',
  },
  [key(['below', 'tight'])]: {
    diagnosis: 'Zwarta grupa lotek ląduje stale pod T19 - rzut jest powtarzalny, ale punkt celowania jest ustawiony za nisko.',
    advice: 'Nie zmieniaj techniki, bo rzut jest powtarzalny. Przesuń punkt celowania minimalnie wyżej, na samo pole T19, i utrzymaj łokieć na stałej wysokości.',
  },
};
const ZONE_T19_CATCHALL: Entry = {
  diagnosis: 'Błąd kąta ustawienia na oche rzutujący na całą biomechanikę (postawa, osiowość i wysokość).',
  advice: 'T19 wyraźnie Ci nie leży ze względu na ustawienie na oche. Zamiast rzucać z ukosa, przesuń się lekko na oche tak, aby stopa i bark były ustawione wprost na T19, i odbuduj stabilność od podstaw.',
};

// ---------- STREFA: BULLSEYE (Trening Potrójnych) ----------
const ZONE_BULL_TRIPLE: Record<string, Entry> = {
  [key(['below'])]: ZONE_BULL[key(['below'])],
  [key(['above'])]: ZONE_BULL[key(['above'])],
  [key(['sideways'])]: ZONE_BULL[key(['sideways'])],
  [key(['unstable'])]: ZONE_BULL[key(['unstable'])],
  [key(['below', 'sideways'])]: ZONE_BULL[key(['below', 'sideways'])],
  [key(['tight'])]: {
    diagnosis: 'Dobre skupienie lotek, ale grupa ląduje obok Bulla - w polu 25 lub w sąsiednich sektorach.',
    advice: 'Twoje lotki trzymają się razem, więc rzut jest powtarzalny. Popracuj nad celnością: skup wzrok na samym środku Bulla i koryguj punkt celowania minimalnie, bez zmiany rytmu rzutu.',
  },
};

function lookupZone(table: Record<string, Entry>, catchAll: Entry | null, codes: IssueCode[], catchAllMinCount: number): Entry {
  if (catchAll && codes.length >= catchAllMinCount) return catchAll;
  const exact = table[key(codes)];
  if (exact) return exact;
  // Brak dokładnie takiej kombinacji w macierzy - bierzemy najbardziej dotkliwy pojedynczy problem
  const priority: IssueCode[] = ['unstable', 'sideways', 'below', 'above', 'ladder', 'tight'];
  const fallbackCode = priority.find((p) => codes.includes(p));
  if (fallbackCode) return table[key([fallbackCode])];
  return catchAll || ZONE_D20_CATCHALL;
}

/**
 * Zwraca listę diagnoz - po jednej dla każdej zaznaczonej "trudnej" strefy (HARD_SECTOR),
 * na podstawie zaznaczonych problemów technicznych (MECHANICS_ISSUE).
 * Trening Potrójnych ma własne macierze: Triple 20, Triple 19 i Bullseye.
 */
export function getMainBlockFeedback(hardSectors: string[], mechanicsIssues: string[], type: SessionType): MainBlockResult[] {
  const noneIssue = 'Brak problemów / wysoka powtarzalność';
  if (mechanicsIssues.length === 0 || mechanicsIssues.includes(noneIssue)) return [];

  const codes = Array.from(new Set(mechanicsIssues.map((m) => ISSUE_MAP[m]).filter((c): c is IssueCode => !!c)));
  if (codes.length === 0) return [];

  const hardSectorNone = 'Bez problemów / wysoka skuteczność';
  const flaggedZones = hardSectors.filter((z) => z !== hardSectorNone);
  const zonesToUse = flaggedZones.length > 0 ? flaggedZones : hardSectors.slice(0, 1);
  if (zonesToUse.length === 0) return [];

  return zonesToUse.map((zone): MainBlockResult => {
    const isBull = zone.startsWith('Bullseye');
    let entry: Entry;

    if (type === 'triple') {
      if (zone.startsWith('Triple 19')) {
        entry = lookupZone(ZONE_T19, ZONE_T19_CATCHALL, codes, 3);
      } else if (isBull) {
        const exact = ZONE_BULL_TRIPLE[key(codes)];
        entry = exact ? exact : codes.length >= 2 ? ZONE_BULL_MULTI : lookupZone(ZONE_BULL_TRIPLE, ZONE_BULL_MULTI, codes, 99);
      } else {
        entry = lookupZone(ZONE_T20, ZONE_T20_CATCHALL, codes, 4);
      }
    } else if (zone.startsWith('D16')) {
      entry = lookupZone(ZONE_D16, ZONE_D16_CATCHALL, codes, 3);
    } else if (isBull) {
      const exact = ZONE_BULL[key(codes)];
      entry = exact ? exact : codes.length >= 2 ? ZONE_BULL_MULTI : lookupZone(ZONE_BULL, ZONE_BULL_MULTI, codes, 99);
    } else {
      entry = lookupZone(ZONE_D20, ZONE_D20_CATCHALL, codes, 4);
    }

    return {
      zoneShort: zone.split(' (')[0],
      issueShort: mechanicsIssues.map((m) => m.split(' (')[0]).join(', '),
      diagnosis: entry.diagnosis,
      advice: entry.advice,
    };
  });
}
