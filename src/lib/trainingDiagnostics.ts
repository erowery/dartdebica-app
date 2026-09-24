'use client';

import { SessionType } from '@/lib/sessionTraining';

export interface PhaseField {
  field: string;
  label: string;
  options: string[];
  /** true = pole jednokrotnego wyboru (stan/spektrum, nie da się być w dwóch stanach naraz) */
  spectrum?: boolean;
  /** dla pól wielokrotnego wyboru: ta opcja wyklucza wszystkie inne i odwrotnie */
  exclusiveOption?: string;
}

/** Pola formularza pokazywane po zakończeniu danego bloku (0-4) */
export function getPhaseFields(phaseIndex: number, type: SessionType): PhaseField[] {
  switch (phaseIndex) {
    case 0:
      return [
        {
          field: 'BODY_STATE',
          label: 'Jak czuło się ciało po rozgrzewce?',
          options: ['Mięśnie zimne/spięte', 'Rozgrzany w normie', 'Świetnie rozgrzany'],
          spectrum: true,
        },
        {
          field: 'RELEASE_FEEL',
          label: 'Jak wyglądało wypuszczenie lotki?',
          options: ['Ręka spięta / zrywanie', 'Nieregularny rytm', 'Luźny, płynny rzut'],
          spectrum: true,
        },
        {
          field: 'MENTAL_READINESS',
          label: 'Gotowość mentalna?',
          options: ['Brak skupienia', 'Średnia koncentracja', 'Pełna gotowość'],
          spectrum: true,
        },
      ];
    case 1:
      return [
        {
          field: 'HARD_SECTOR',
          label: 'Która sekwencja sprawiła najwięcej problemów?',
          options:
            type === 'double'
              ? ['D20/D10/D5', 'D16/D8/D4', 'Bullseye', 'Bez problemów']
              : ['T20', 'T19', 'Bullseye', 'Bez problemów'],
          exclusiveOption: 'Bez problemów',
        },
        {
          field: 'MECHANICS_ISSUE',
          label: 'Co najlepiej opisuje problem techniczny?',
          options: [
            'Poniżej celu (spadek łokcia / za wczesne wypuszczenie)',
            'Powyżej celu (przepchnięcie lotki)',
            'Ściąganie w lewo/prawo (uciekanie łokcia / obrót tułowia)',
            'Niestabilna postawa / utrata balansu',
            'Brak problemów / wysoka powtarzalność',
          ],
          exclusiveOption: 'Brak problemów / wysoka powtarzalność',
        },
      ];
    case 2:
      return type === 'double'
        ? [
            {
              field: 'FINISHING50_PROBLEM',
              label: 'Co sprawiało trudność w Finishing 50?',
              options: [
                'Trudność z wykonaniem podwójnego trafienia na start (50)',
                'Gubienie się w liczeniu aktualnego celu',
                'Frustracja przy cofaniu się (-1)',
                'Brak problemów',
              ],
              exclusiveOption: 'Brak problemów',
            },
            {
              field: 'DOUBLE_CLOCK_PROBLEM',
              label: 'Co sprawiało trudność w Zegarze na doublach?',
              options: [
                'Trudność z konkretnymi wysokimi wartościami (D16-D20)',
                'Utrata rytmu przy przejściu między wartościami',
                'Zbyt długi czas na pojedynczą wartość',
                'Brak problemów',
              ],
              exclusiveOption: 'Brak problemów',
            },
          ]
        : [
            {
              field: 'GAME170_PROBLEM',
              label: 'Co sprawiało trudność w Grze 170?',
              options: [
                'Trudność z trafieniem w triple pod presją zejścia',
                'Zbyt wolne tempo / dużo podejść',
                'Problem z wyliczeniem optymalnej kombinacji',
                'Brak problemów',
              ],
              exclusiveOption: 'Brak problemów',
            },
            {
              field: 'FINISHING50_PROBLEM',
              label: 'Co sprawiało trudność w Finishing 50?',
              options: [
                'Trudność z wykonaniem podwójnego trafienia na start (50)',
                'Gubienie się w liczeniu aktualnego celu',
                'Frustracja przy cofaniu się (-1)',
                'Brak problemów',
              ],
              exclusiveOption: 'Brak problemów',
            },
          ];
    case 3:
      return [
        {
          field: 'STRESS_SIMULATION',
          label: 'Jak poszła symulacja stresu?',
          options: ['Trudność z wyobrażeniem sytuacji', 'Odczuwalny realny stres/tętno', 'Pełny spokój / brak reakcji'],
          spectrum: true,
        },
        {
          field: 'BREATHING_EFFECT',
          label: 'Efekt ćwiczeń oddechowych?',
          options: ['Nadal spięty / ciało sztywne', 'Średnie wyciszenie', 'Pełny spokój i tętno w normie'],
          spectrum: true,
        },
      ];
    default:
      return [
        {
          field: 'FATIGUE',
          label: 'Jak się czujesz po treningu?',
          options: ['Ręka/bark zmęczony', 'Zmęczenie psychiczne / brak ostrości', 'Świeżość do końca'],
          spectrum: true,
        },
      ];
  }
}

export interface TrainingFormData {
  BODY_STATE?: string[];
  RELEASE_FEEL?: string[];
  MENTAL_READINESS?: string[];
  HARD_SECTOR?: string[];
  MECHANICS_ISSUE?: string[];
  FINISHING50_PROBLEM?: string[];
  DOUBLE_CLOCK_PROBLEM?: string[];
  GAME170_PROBLEM?: string[];
  STRESS_SIMULATION?: string[];
  BREATHING_EFFECT?: string[];
  FATIGUE?: string[];
  OVERALL_SCORE?: number;
}

export interface TrainingFeedback {
  score: number;
  summary_title: string;
  positives: string[];
  negatives: string[];
  coach_advice: string;
}

function has(arr: string[] | undefined, value: string): boolean {
  return !!arr && arr.includes(value);
}

export function generateTrainingFeedback(data: TrainingFormData): TrainingFeedback {
  const positives: string[] = [];
  const negatives: string[] = [];

  if (has(data.RELEASE_FEEL, 'Luźny, płynny rzut')) positives.push('Luźny i płynny rzut podczas rozgrzewki');
  if (has(data.RELEASE_FEEL, 'Ręka spięta / zrywanie')) negatives.push('Spięta ręka / zrywanie przy rzucie w rozgrzewce');

  if (has(data.BODY_STATE, 'Świetnie rozgrzany')) positives.push('Świetne rozgrzanie przed treningiem');
  if (has(data.BODY_STATE, 'Mięśnie zimne/spięte')) negatives.push('Zimne, spięte mięśnie na starcie treningu');

  if (has(data.MENTAL_READINESS, 'Pełna gotowość')) positives.push('Pełna gotowość mentalna od początku');
  if (has(data.MENTAL_READINESS, 'Brak skupienia')) negatives.push('Brak skupienia na starcie treningu');

  if (has(data.MECHANICS_ISSUE, 'Brak problemów / wysoka powtarzalność'))
    positives.push('Wysoka powtarzalność techniki rzutu');
  if (has(data.MECHANICS_ISSUE, 'Poniżej celu (spadek łokcia / za wczesne wypuszczenie)'))
    negatives.push('Opuszczanie łokcia przy rzutach poniżej celu');
  if (has(data.MECHANICS_ISSUE, 'Powyżej celu (przepchnięcie lotki)'))
    negatives.push('Przepchnięcie lotki przy rzutach powyżej celu');
  if (has(data.MECHANICS_ISSUE, 'Ściąganie w lewo/prawo (uciekanie łokcia / obrót tułowia)'))
    negatives.push('Ściąganie lotek w bok od celu');
  if (has(data.MECHANICS_ISSUE, 'Niestabilna postawa / utrata balansu'))
    negatives.push('Utrata balansu przy rzutach w skrajne sektory');

  if (has(data.FINISHING50_PROBLEM, 'Brak problemów')) positives.push('Finishing 50 bez większych problemów');
  if (has(data.FINISHING50_PROBLEM, 'Trudność z wykonaniem podwójnego trafienia na start (50)'))
    negatives.push('Trudność ze startowym podwójnym trafieniem w Finishing 50');
  if (has(data.FINISHING50_PROBLEM, 'Gubienie się w liczeniu aktualnego celu'))
    negatives.push('Gubienie się w liczeniu celu podczas Finishing 50');
  if (has(data.FINISHING50_PROBLEM, 'Frustracja przy cofaniu się (-1)'))
    negatives.push('Frustracja przy cofaniu wyniku w Finishing 50');

  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Brak problemów')) positives.push('Zegar na doublach bez większych problemów');
  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Trudność z konkretnymi wysokimi wartościami (D16-D20)'))
    negatives.push('Trudność z wysokimi wartościami (D16-D20) w Zegarze');
  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Utrata rytmu przy przejściu między wartościami'))
    negatives.push('Utrata rytmu przy przechodzeniu między wartościami w Zegarze');
  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Zbyt długi czas na pojedynczą wartość'))
    negatives.push('Zbyt długi czas na pojedynczą wartość w Zegarze');

  if (has(data.GAME170_PROBLEM, 'Brak problemów')) positives.push('Gra 170 bez większych problemów');
  if (has(data.GAME170_PROBLEM, 'Trudność z trafieniem w triple pod presją zejścia'))
    negatives.push('Trudność z celnością w triple pod presją w Grze 170');
  if (has(data.GAME170_PROBLEM, 'Zbyt wolne tempo / dużo podejść'))
    negatives.push('Zbyt wolne tempo / dużo podejść w Grze 170');
  if (has(data.GAME170_PROBLEM, 'Problem z wyliczeniem optymalnej kombinacji'))
    negatives.push('Trudność z wyliczeniem kombinacji w Grze 170');

  if (has(data.STRESS_SIMULATION, 'Pełny spokój / brak reakcji')) positives.push('Pełny spokój podczas symulacji stresu');
  if (has(data.STRESS_SIMULATION, 'Odczuwalny realny stres/tętno'))
    negatives.push('Realny stres podczas symulacji sytuacji stresowej');

  if (has(data.BREATHING_EFFECT, 'Pełny spokój i tętno w normie'))
    positives.push('Pełne wyciszenie po ćwiczeniach oddechowych');
  if (has(data.BREATHING_EFFECT, 'Nadal spięty / ciało sztywne'))
    negatives.push('Ciało wciąż spięte mimo ćwiczeń oddechowych');

  if (has(data.FATIGUE, 'Świeżość do końca')) positives.push('Świeżość fizyczna i mentalna do końca treningu');
  if (has(data.FATIGUE, 'Ręka/bark zmęczony')) negatives.push('Zmęczenie ręki/barku pod koniec treningu');
  if (has(data.FATIGUE, 'Zmęczenie psychiczne / brak ostrości')) negatives.push('Zmęczenie psychiczne pod koniec treningu');

  // Priorytet: Mechanika > Technika w grach > Presja/Psychika > Zmęczenie/Rytm > Sukces
  let summary_title = 'Solidna sesja treningowa';
  let coach_advice = 'Trening przebiegł bez większych zastrzeżeń - kontynuuj w tym stylu i stopniowo podnoś poprzeczkę.';

  if (has(data.MECHANICS_ISSUE, 'Poniżej celu (spadek łokcia / za wczesne wypuszczenie)')) {
    summary_title = 'Solidny trening z potrzebą korekty pozycji łokcia';
    coach_advice =
      'Rzucając w dolne sektory, nie obniżaj ręki w łokciu. Wysokość rzutu koryguj delikatnym pochyleniem tułowia w biodrze, zachowując stałą wysokość łokcia. Na kolejnym treningu skup się na stabilnym łokciu.';
  } else if (has(data.MECHANICS_ISSUE, 'Ściąganie w lewo/prawo (uciekanie łokcia / obrót tułowia)')) {
    summary_title = 'Solidny trening z potrzebą pracy nad osiowością';
    coach_advice =
      'Ściąganie lotek na zewnątrz sektora oznacza, że przedramię zbacza z toru rzutu lub obracasz barki. Dokończ ruch ręki tak, aby dłoń i palce po wyproście wskazywały dokładnie w cel. Upewnij się też, że stopa wykroczna stoi nieruchomo.';
  } else if (has(data.MECHANICS_ISSUE, 'Powyżej celu (przepchnięcie lotki)')) {
    summary_title = 'Solidny trening z potrzebą korekty wypuszczenia';
    coach_advice =
      'Rzucanie powyżej celu to efekt zbyt późnego otwarcia dłoni lub nadrabiania siłą z barku. Rozluźnij chwyt i pozwól lotce "wylecieć" z dłoni w najwyższym punkcie łuku rzutu, bez dodatkowego pchania.';
  } else if (has(data.MECHANICS_ISSUE, 'Niestabilna postawa / utrata balansu')) {
    summary_title = 'Solidny trening z potrzebą pracy nad stabilnością';
    coach_advice =
      'Utrata balansu destabilizuje każdy rzut. Zablokuj ciężar ciała na pięcie stopy wykrocznej i nie "nurkuj" do tarczy. Zmiana celu nie może wpływać na zmianę punktu ciężkości Twojej postawy.';
  } else if (has(data.FINISHING50_PROBLEM, 'Frustracja przy cofaniu się (-1)')) {
    summary_title = 'Dobra forma techniczna, odporność psychiczna do dopracowania';
    coach_advice =
      'Cofanie się o 1 punkt po nietrafieniu bywa frustrujące, ale to naturalna część tej gry - jej celem jest właśnie odporność psychiczna. Traktuj każde cofnięcie jako element treningu cierpliwości, nie porażkę.';
  } else if (has(data.FINISHING50_PROBLEM, 'Trudność z wykonaniem podwójnego trafienia na start (50)')) {
    summary_title = 'Dobra forma techniczna, start gry do dopracowania';
    coach_advice =
      'Start w Finishing 50 wymaga trafienia dokładnie D25 lub D20. Zanim zaczniesz grę, wykonaj 3-5 rzutów rozgrzewkowych czysto w ten jeden segment, żeby ustawić rękę na konkretną wysokość przed pierwszym podejściem.';
  } else if (has(data.FINISHING50_PROBLEM, 'Gubienie się w liczeniu aktualnego celu')) {
    summary_title = 'Dobra forma techniczna, koncentracja do dopracowania';
    coach_advice =
      'Przy dynamicznie zmieniającym się celu (+10/-1) łatwo stracić orientację. Przed każdym rzutem powtórz w myślach aktualny cel, zanim staniesz na linii oche - to eliminuje pomyłki wynikające z pośpiechu.';
  } else if (has(data.DOUBLE_CLOCK_PROBLEM, 'Trudność z konkretnymi wysokimi wartościami (D16-D20)')) {
    summary_title = 'Dobra forma techniczna, wysokie double do dopracowania';
    coach_advice =
      'Wysokie double (D16-D20) leżą blisko siebie na tarczy, co zwiększa ryzyko pomyłki celu. Zwolnij tempo właśnie przy tych wartościach i wydłuż moment celowania przed rzutem.';
  } else if (has(data.DOUBLE_CLOCK_PROBLEM, 'Utrata rytmu przy przejściu między wartościami')) {
    summary_title = 'Dobra forma techniczna, rytm do dopracowania';
    coach_advice =
      'Zegar na doublach wymaga płynnego przechodzenia między celami. Wypracuj stały, powtarzalny rytm złożenia (ta sama liczba kroków/oddechów) niezależnie od tego, w który double celujesz.';
  } else if (has(data.DOUBLE_CLOCK_PROBLEM, 'Zbyt długi czas na pojedynczą wartość')) {
    summary_title = 'Dobra forma techniczna, tempo ćwiczenia do dopracowania';
    coach_advice =
      'Jeśli utykasz długo na jednej wartości, warto rozbić trening na krótsze, częstsze sesje tego ćwiczenia zamiast jednej długiej - da to lepszy postęp niż forsowanie tego samego double bez końca.';
  } else if (has(data.GAME170_PROBLEM, 'Trudność z trafieniem w triple pod presją zejścia')) {
    summary_title = 'Dobra forma techniczna, celność pod presją do dopracowania';
    coach_advice =
      'W Grze 170 presja "zejścia jak najszybciej" może pogarszać celność w triple. Nie przyspieszaj rzutu - liczy się precyzja pojedynczego rzutu, a nie tempo całej gry.';
  } else if (has(data.GAME170_PROBLEM, 'Zbyt wolne tempo / dużo podejść')) {
    summary_title = 'Dobra forma techniczna, śmiałość rzutu do dopracowania';
    coach_advice =
      'Duża liczba podejść może wynikać z zbyt zachowawczego celowania. Śmielej celuj w triple zamiast bezpiecznych pojedynczych pól - to jedyny sposób, żeby realnie skrócić liczbę rund.';
  } else if (has(data.GAME170_PROBLEM, 'Problem z wyliczeniem optymalnej kombinacji')) {
    summary_title = 'Dobra forma techniczna, taktyka do dopracowania';
    coach_advice =
      'Zanim rzucisz pierwszą lotkę w rundzie, zaplanuj całą trójkę rzutów (np. T20-T20-T20) zamiast liczyć po każdym rzucie z osobna - to odciąży głowę podczas samego rzucania.';
  } else if (has(data.BODY_STATE, 'Mięśnie zimne/spięte') && has(data.RELEASE_FEEL, 'Ręka spięta / zrywanie')) {
    summary_title = 'Trening zaburzony niewystarczającą rozgrzewką';
    coach_advice =
      'Zrywanie rzutu na początku treningu wynika z niegotowych mięśni. Wydłuż rozgrzewkę o 5 minut i rzucaj luźno w środek tarczy, bez celowania w konkretne sektory, aż poczujesz pełną płynność w łokciu i barku.';
  } else if (has(data.FATIGUE, 'Ręka/bark zmęczony') || has(data.FATIGUE, 'Zmęczenie psychiczne / brak ostrości')) {
    summary_title = 'Solidny trening, uważaj na przetrenowanie';
    coach_advice =
      'Gdy dłoń i bark się męczą, zaczynasz nadrabiać siłą i utrwalasz złe nawyki. Następnym razem wybierz wariant krótki (75 min) lub zrób 3-minutową przerwę na rozciąganie i wodę w połowie sesji.';
  } else if (
    (data.OVERALL_SCORE ?? 0) >= 8 &&
    has(data.MECHANICS_ISSUE, 'Brak problemów / wysoka powtarzalność')
  ) {
    summary_title = 'Perfekcyjna jednostka treningowa!';
    coach_advice =
      'Doskonała jednostka treningowa! Wszystkie elementy - od płynności rzutu po kontrolę emocji - zagrały idealnie. Zapamiętaj to odczucie luzu w ręce i przenieś je na najbliższy mecz ligowy!';
  }

  return {
    score: data.OVERALL_SCORE ?? 0,
    summary_title,
    positives,
    negatives,
    coach_advice,
  };
}
