'use client';

import { SessionType } from '@/lib/sessionTraining';
import { getMainBlockFeedback, MainBlockResult } from '@/lib/mainBlockDiagnostics';

export interface PhaseField {
  field: string;
  label: string;
  options: string[];
  /** true = pole jednokrotnego wyboru (stan/spektrum, nie da się być w dwóch stanach naraz) */
  spectrum?: boolean;
  /** dla pól wielokrotnego wyboru: ta opcja wyklucza wszystkie inne i odwrotnie */
  exclusiveOption?: string;
}

export const MECHANICS_NONE = 'Brak problemów / wysoka powtarzalność';
export const HARD_SECTOR_NONE = 'Bez problemów / wysoka skuteczność';

const FINISHING50_NONE = 'Brak problemów / płynne czyszczenie i zamykanie';
const DOUBLE_CLOCK_NONE = 'Brak problemów / płynne przechodzenie tarczy';
const GAME170_NONE = 'Brak problemów / szybkie zamykanie w niewielu podejściach';

const FINISHING50_OPTIONS = [
  'Brak trafienia w duży sektor na ustawienie dubla (np. pudło w duże pole zamiast S10/S16)',
  'Nietrafianie dubla w pierwszej serii (przez co wynik od razu spadał o -1)',
  'Przypadkowe trafienie w dubel/triple przy ustawianiu (popsucie licznika)',
  'Trudność z powrotem do skupienia po spadku punktowym (efekt "spalenia" serii)',
  FINISHING50_NONE,
];

/** Pola formularza pokazywane po zakończeniu danego bloku (0-4) */
export function getPhaseFields(phaseIndex: number, type: SessionType): PhaseField[] {
  switch (phaseIndex) {
    case 0:
      return [
        {
          field: 'BODY_STATE',
          label: 'Jak czuło się ciało po rozgrzewce?',
          options: ['Mięśnie zimne / spięte', 'Rozgrzany w normie', 'Świetnie rozgrzany'],
          spectrum: true,
        },
        {
          field: 'RELEASE_FEEL',
          label: 'Jak wyglądało wypuszczenie lotki?',
          options: ['Ręka spięta / zrywanie rzutu', 'Nieregularny rytm / falowanie płynności', 'Luźny, płynny rzut'],
          spectrum: true,
        },
        {
          field: 'MENTAL_READINESS',
          label: 'Gotowość mentalna?',
          options: ['Brak skupienia / rozproszenie', 'Średnia koncentracja', 'Pełna gotowość i ostrość'],
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
              ? ['D20 / D10 / D5', 'D16 / D8 / D4', 'Bullseye', HARD_SECTOR_NONE]
              : ['Triple 20', 'Triple 19', 'Bullseye', HARD_SECTOR_NONE],
          exclusiveOption: HARD_SECTOR_NONE,
        },
        {
          field: 'MECHANICS_ISSUE',
          label: 'Co najlepiej opisuje problem techniczny?',
          options: [
            'Poniżej celu',
            'Powyżej celu',
            'Ściąganie w lewo/prawo',
            'Niestabilna postawa',
            type === 'double' ? 'Różna wysokość rzutów w jednej serii' : 'Ciasne rzuty, ale w pojedynczą wartość',
            MECHANICS_NONE,
          ],
          exclusiveOption: MECHANICS_NONE,
        },
      ];
    case 2:
      return type === 'double'
        ? [
            {
              field: 'FINISHING50_PROBLEM',
              label: 'Co sprawiało trudność w Finishing 50?',
              options: FINISHING50_OPTIONS,
              exclusiveOption: FINISHING50_NONE,
            },
            {
              field: 'DOUBLE_CLOCK_PROBLEM',
              label: 'Co sprawiało trudność w Zegarze na doublach?',
              options: [
                'Seryjne pudła na zewnątrz tarczy (lotki tuż obok drutu w puste pole)',
                'Problem z dublami na dole tarczy (D3, D19, D7, D17) - spadek łokcia / złe pochylenie',
                'Zacinanie się na jednym dublu (strata wielu serii na jedną wartość)',
                'Trudność z płynnym przestawianiem się na oche po trafieniu (zmiana kąta rzutu)',
                DOUBLE_CLOCK_NONE,
              ],
              exclusiveOption: DOUBLE_CLOCK_NONE,
            },
          ]
        : [
            {
              field: 'GAME170_PROBLEM',
              label: 'Co sprawiało trudność w Grze 170?',
              options: [
                'Brak pierwszej lotki w T20 (trudność ze "wejściem" w serię potrójnym)',
                'Asekuracyjne rzuty w duże pola (brak ryzyka rzutu w potrójne pole)',
                'Gubienie się w optymalnej ścieżce wyjścia przy nietrafionym pierwszym potrójnym',
                'Spadek skuteczności na dublu kończącym po trafieniu potrójnych',
                GAME170_NONE,
              ],
              exclusiveOption: GAME170_NONE,
            },
            {
              field: 'FINISHING50_PROBLEM',
              label: 'Co sprawiało trudność w Finishing 50?',
              options: FINISHING50_OPTIONS,
              exclusiveOption: FINISHING50_NONE,
            },
          ];
    case 3:
      return [
        {
          field: 'STRESS_SIMULATION',
          label: 'Jak poszła symulacja stresu?',
          options: [
            'Trudność z wyobrażeniem sytuacji meczowej',
            'Odczuwalny realny stres / skok tętna',
            'Pełny spokój / brak reakcji emocjonalnej',
          ],
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
          options: ['Ręka / bark zmęczony', 'Zmęczenie psychiczne / spadek koncentracji', 'Świeżość do końca'],
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
  mainBlockDetails: MainBlockResult[];
  /** Osobne porady do bloku Trening mentalny - pokazywane zawsze, niezależnie od głównej rady */
  mental_advice: { title: string; text: string }[];
}

const MENTAL_ADVICE: Record<string, { title: string; text: string }> = {
  'Trudność z wyobrażeniem sytuacji meczowej': {
    title: 'Symulacja stresu',
    text: 'Wyobraźnia meczowa wymaga treningu jak każdy inny element. Przed symulacją przypomnij sobie konkretny mecz ligowy - rywala, wynik i salę - i rzucaj tak, jakby to była ostatnia lotka tamtego meczu. Pomaga też głośne wypowiedzenie wyniku, który zostało do zamknięcia.',
  },
  'Odczuwalny realny stres / skok tętna': {
    title: 'Symulacja stresu',
    text: 'Symulacja zadziałała - właśnie to odczucie trzeba oswajać. Przed rzutem pod presją wykonaj stały rytuał: jeden spokojny wydech, ustawienie stóp, ten sam chwyt. Powtarzalny rytuał daje ciału sygnał, że to zwykły rzut.',
  },
  'Pełny spokój / brak reakcji emocjonalnej': {
    title: 'Symulacja stresu',
    text: 'Pełny spokój to dobry znak, ale może też oznaczać, że scenariusz był za łatwy. Następnym razem podnieś stawkę: ustal sobie konkretną karę za nietrafienie (np. 10 przysiadów) albo symuluj decydującego lega przy stanie remisowym.',
  },
  'Nadal spięty / ciało sztywne': {
    title: 'Ćwiczenia oddechowe',
    text: 'Wydłuż wydech: wdech nosem na 4, wydech ustami na 6-8. Dodaj rozluźnienie barków - unieś je mocno na 3 sekundy i opuść. Powtórz 3-4 razy przed kolejną serią rzutów.',
  },
  'Średnie wyciszenie': {
    title: 'Ćwiczenia oddechowe',
    text: 'Wyciszenie było częściowe. Wydłuż ćwiczenie oddechowe o 1-2 minuty i skup się wyłącznie na liczeniu oddechów, odkładając na bok myśli o wyniku i błędach z treningu.',
  },
};

function has(arr: string[] | undefined, value: string): boolean {
  return !!arr && arr.includes(value);
}

export function generateTrainingFeedback(data: TrainingFormData, type: SessionType): TrainingFeedback {
  const positives: string[] = [];
  const negatives: string[] = [];

  if (has(data.RELEASE_FEEL, 'Luźny, płynny rzut')) positives.push('Luźny i płynny rzut podczas rozgrzewki');
  if (has(data.RELEASE_FEEL, 'Ręka spięta / zrywanie rzutu')) negatives.push('Spięta ręka / zrywanie przy rzucie w rozgrzewce');
  if (has(data.RELEASE_FEEL, 'Nieregularny rytm / falowanie płynności')) negatives.push('Nieregularny rytm rzutu w rozgrzewce');

  if (has(data.BODY_STATE, 'Świetnie rozgrzany')) positives.push('Świetne rozgrzanie przed treningiem');
  if (has(data.BODY_STATE, 'Mięśnie zimne / spięte')) negatives.push('Zimne, spięte mięśnie na starcie treningu');

  if (has(data.MENTAL_READINESS, 'Pełna gotowość i ostrość')) positives.push('Pełna gotowość mentalna od początku');
  if (has(data.MENTAL_READINESS, 'Brak skupienia / rozproszenie')) negatives.push('Brak skupienia na starcie treningu');

  // Blok Ćwiczenia główne - macierz diagnostyczna per strefa
  const mainBlockDetails = getMainBlockFeedback(data.HARD_SECTOR || [], data.MECHANICS_ISSUE || [], type);

  if (has(data.MECHANICS_ISSUE, MECHANICS_NONE)) positives.push('Wysoka powtarzalność techniki w ćwiczeniach głównych');
  mainBlockDetails.forEach((d) => negatives.push(`${d.zoneShort}: ${d.issueShort}`));

  if (has(data.FINISHING50_PROBLEM, FINISHING50_NONE)) positives.push('Finishing 50 bez większych problemów');
  if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[0])) negatives.push('Trudność z ustawieniem dubla na starcie Finishing 50');
  if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[1])) negatives.push('Nietrafianie dubla w pierwszej serii Finishing 50');
  if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[2])) negatives.push('Przypadkowe trafienia psujące licznik w Finishing 50');
  if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[3])) negatives.push('Trudność z powrotem do skupienia po spadku w Finishing 50');

  if (has(data.DOUBLE_CLOCK_PROBLEM, DOUBLE_CLOCK_NONE)) positives.push('Zegar na doublach bez większych problemów');
  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Seryjne pudła na zewnątrz tarczy (lotki tuż obok drutu w puste pole)'))
    negatives.push('Seryjne pudła tuż obok drutu w Zegarze na doublach');
  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Problem z dublami na dole tarczy (D3, D19, D7, D17) - spadek łokcia / złe pochylenie'))
    negatives.push('Problem z dublami na dole tarczy w Zegarze na doublach');
  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Zacinanie się na jednym dublu (strata wielu serii na jedną wartość)'))
    negatives.push('Zacinanie się na jednym dublu w Zegarze na doublach');
  if (has(data.DOUBLE_CLOCK_PROBLEM, 'Trudność z płynnym przestawianiem się na oche po trafieniu (zmiana kąta rzutu)'))
    negatives.push('Trudność z przestawianiem się na oche w Zegarze na doublach');

  if (has(data.GAME170_PROBLEM, GAME170_NONE)) positives.push('Gra 170 bez większych problemów');
  if (has(data.GAME170_PROBLEM, 'Brak pierwszej lotki w T20 (trudność ze "wejściem" w serię potrójnym)'))
    negatives.push('Trudność z wejściem w serię T20 w Grze 170');
  if (has(data.GAME170_PROBLEM, 'Asekuracyjne rzuty w duże pola (brak ryzyka rzutu w potrójne pole)'))
    negatives.push('Zbyt asekuracyjne rzuty w Grze 170');
  if (has(data.GAME170_PROBLEM, 'Gubienie się w optymalnej ścieżce wyjścia przy nietrafionym pierwszym potrójnym'))
    negatives.push('Gubienie się w ścieżce wyjścia w Grze 170');
  if (has(data.GAME170_PROBLEM, 'Spadek skuteczności na dublu kończącym po trafieniu potrójnych'))
    negatives.push('Spadek skuteczności na dublu kończącym w Grze 170');

  if (has(data.STRESS_SIMULATION, 'Pełny spokój / brak reakcji emocjonalnej')) positives.push('Pełny spokój podczas symulacji stresu');
  if (has(data.STRESS_SIMULATION, 'Odczuwalny realny stres / skok tętna'))
    negatives.push('Realny stres podczas symulacji sytuacji stresowej');

  if (has(data.BREATHING_EFFECT, 'Pełny spokój i tętno w normie')) positives.push('Pełne wyciszenie po ćwiczeniach oddechowych');
  if (has(data.BREATHING_EFFECT, 'Nadal spięty / ciało sztywne')) negatives.push('Ciało wciąż spięte mimo ćwiczeń oddechowych');

  if (has(data.FATIGUE, 'Świeżość do końca')) positives.push('Świeżość fizyczna i mentalna do końca treningu');
  if (has(data.FATIGUE, 'Ręka / bark zmęczony')) negatives.push('Zmęczenie ręki/barku pod koniec treningu');
  if (has(data.FATIGUE, 'Zmęczenie psychiczne / spadek koncentracji')) negatives.push('Zmęczenie psychiczne pod koniec treningu');

  // Priorytet: Mechanika (strefy) > Technika w grach > Presja/Psychika > Zmęczenie/Rytm > Sukces
  let summary_title = 'Solidna sesja treningowa';
  let coach_advice = 'Trening przebiegł bez większych zastrzeżeń - kontynuuj w tym stylu i stopniowo podnoś poprzeczkę.';

  if (mainBlockDetails.length > 0) {
    summary_title =
      mainBlockDetails.length === 1
        ? `Solidny trening - popracuj nad strefą ${mainBlockDetails[0].zoneShort}`
        : 'Solidny trening - kilka stref technicznych do dopracowania';
    coach_advice = mainBlockDetails.map((d) => `${d.zoneShort}: ${d.advice}`).join('\n\n');
  } else if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[3])) {
    summary_title = 'Dobra forma techniczna, odporność psychiczna do dopracowania';
    coach_advice =
      'Spadek punktowy w Finishing 50 potrafi "spalić" koncentrację na resztę serii. Po nietrafieniu zrób krótką mikropauzę - jeden spokojny oddech - zanim podejmiesz kolejną próbę, zamiast rzucać od razu pod wpływem frustracji.';
  } else if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[1])) {
    summary_title = 'Dobra forma techniczna, start gry do dopracowania';
    coach_advice =
      'Nietrafienie dubla w pierwszej serii Finishing 50 od razu cofa Cię o punkt. Zanim zaczniesz grę, wykonaj 3-5 rzutów rozgrzewkowych czysto w double, żeby ustawić rękę przed pierwszym podejściem.';
  } else if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[0])) {
    summary_title = 'Dobra forma techniczna, ustawienie dubla do dopracowania';
    coach_advice =
      'Zanim spróbujesz trafić double, musisz najpierw celnie "ustawić" wynik dużym polem. Potraktuj to jako osobny, równie ważny element gry - nie spiesz się z pierwszym rzutem serii.';
  } else if (has(data.FINISHING50_PROBLEM, FINISHING50_OPTIONS[2])) {
    summary_title = 'Dobra forma techniczna, kontrola nad ustawianiem do dopracowania';
    coach_advice =
      'Przypadkowe trafienia w double/triple podczas "ustawiania" wyniku psują licznik i wymuszają start od nowa. Celuj świadomie w konkretne pole dużego sektora, a nie ogólnie "w okolice" celu.';
  } else if (has(data.DOUBLE_CLOCK_PROBLEM, 'Problem z dublami na dole tarczy (D3, D19, D7, D17) - spadek łokcia / złe pochylenie')) {
    summary_title = 'Dobra forma techniczna, dolne double do dopracowania';
    coach_advice =
      'Dolne double (D3, D19, D7, D17) kuszą, żeby obniżyć łokieć. Zamiast tego koryguj wysokość rzutu pochyleniem tułowia w biodrze, trzymając łokieć na stałej wysokości.';
  } else if (has(data.DOUBLE_CLOCK_PROBLEM, 'Seryjne pudła na zewnątrz tarczy (lotki tuż obok drutu w puste pole)')) {
    summary_title = 'Dobra forma techniczna, precyzja do dopracowania';
    coach_advice =
      'Seryjne pudła tuż obok drutu to sygnał, że celujesz w sam drut zamiast w środek pola double. Mierz nieco głębiej w segment, żeby zostawić sobie margines błędu.';
  } else if (has(data.DOUBLE_CLOCK_PROBLEM, 'Zacinanie się na jednym dublu (strata wielu serii na jedną wartość)')) {
    summary_title = 'Dobra forma techniczna, tempo ćwiczenia do dopracowania';
    coach_advice =
      'Jeśli utykasz długo na jednej wartości, warto rozbić trening na krótsze, częstsze sesje tego ćwiczenia zamiast forsować to samo pole bez końca.';
  } else if (has(data.DOUBLE_CLOCK_PROBLEM, 'Trudność z płynnym przestawianiem się na oche po trafieniu (zmiana kąta rzutu)')) {
    summary_title = 'Dobra forma techniczna, płynność między celami do dopracowania';
    coach_advice =
      'Zegar na doublach wymaga płynnej zmiany kąta między kolejnymi wartościami. Wypracuj stały, powtarzalny rytm złożenia niezależny od tego, w który double celujesz.';
  } else if (has(data.GAME170_PROBLEM, 'Brak pierwszej lotki w T20 (trudność ze "wejściem" w serię potrójnym)')) {
    summary_title = 'Dobra forma techniczna, start rundy do dopracowania';
    coach_advice =
      'Trudność z pierwszym trafieniem w T20 blokuje całą rundę. Zanim zaczniesz grę, wykonaj kilka rzutów rozgrzewkowych czysto w ten segment, żeby ustawić rękę.';
  } else if (has(data.GAME170_PROBLEM, 'Asekuracyjne rzuty w duże pola (brak ryzyka rzutu w potrójne pole)')) {
    summary_title = 'Dobra forma techniczna, śmiałość rzutu do dopracowania';
    coach_advice =
      'Zbyt zachowawcze celowanie w duże pola wydłuża grę. Śmielej celuj w triple - to jedyny sposób, żeby realnie skrócić liczbę rund w Grze 170.';
  } else if (has(data.GAME170_PROBLEM, 'Gubienie się w optymalnej ścieżce wyjścia przy nietrafionym pierwszym potrójnym')) {
    summary_title = 'Dobra forma techniczna, taktyka do dopracowania';
    coach_advice =
      'Zanim rzucisz pierwszą lotkę w rundzie, zaplanuj z góry, co rzucasz przy trafieniu i co przy nietrafieniu pierwszego triple - to odciąży głowę w trakcie samego rzucania.';
  } else if (has(data.GAME170_PROBLEM, 'Spadek skuteczności na dublu kończącym po trafieniu potrójnych')) {
    summary_title = 'Dobra forma techniczna, wykończenie do dopracowania';
    coach_advice =
      'Po udanej serii w triple łatwo stracić koncentrację na samym końcu. Traktuj rzut w double kończący jako osobne zadanie, wymagające tej samej uwagi co trafienia w triple.';
  } else if (has(data.BODY_STATE, 'Mięśnie zimne / spięte') && has(data.RELEASE_FEEL, 'Ręka spięta / zrywanie rzutu')) {
    summary_title = 'Trening zaburzony niewystarczającą rozgrzewką';
    coach_advice =
      'Zrywanie rzutu na początku treningu wynika z niegotowych mięśni. Wydłuż rozgrzewkę o 5 minut i rzucaj luźno w środek tarczy, bez celowania w konkretne sektory, aż poczujesz pełną płynność w łokciu i barku.';
  } else if (has(data.FATIGUE, 'Ręka / bark zmęczony') || has(data.FATIGUE, 'Zmęczenie psychiczne / spadek koncentracji')) {
    summary_title = 'Solidny trening, uważaj na przetrenowanie';
    coach_advice =
      'Gdy dłoń i bark się męczą, zaczynasz nadrabiać siłą i utrwalasz złe nawyki. Następnym razem wybierz wariant krótki (75 min) lub zrób 3-minutową przerwę na rozciąganie i wodę w połowie sesji.';
  } else if ((data.OVERALL_SCORE ?? 0) >= 8 && has(data.MECHANICS_ISSUE, MECHANICS_NONE)) {
    summary_title = 'Perfekcyjna jednostka treningowa!';
    coach_advice =
      type === 'double'
        ? 'Świetna kontrola podwójnych! Twoja ręka pracuje płynnie, a łokieć utrzymuje stałą wysokość. Zapamiętaj ten stan czystego mechanizmu i przenieś go na symulacje meczowe!'
        : 'Doskonała jednostka treningowa! Wszystkie elementy - od płynności rzutu po kontrolę emocji - zagrały idealnie. Zapamiętaj to odczucie luzu w ręce i przenieś je na najbliższy mecz ligowy!';
  }

  return {
    score: data.OVERALL_SCORE ?? 0,
    summary_title,
    positives,
    negatives,
    coach_advice,
    mainBlockDetails,
    mental_advice: [...(data.STRESS_SIMULATION || []), ...(data.BREATHING_EFFECT || [])]
      .map((o) => MENTAL_ADVICE[o])
      .filter((x): x is { title: string; text: string } => !!x),
  };
}
