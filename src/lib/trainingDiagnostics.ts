'use client';

import { SessionType } from '@/lib/sessionTraining';

export interface PhaseField {
  field: string;
  label: string;
  options: string[];
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
        },
        {
          field: 'RELEASE_FEEL',
          label: 'Jak wyglądało wypuszczenie lotki?',
          options: ['Ręka spięta / zrywanie', 'Nieregularny rytm', 'Luźny, płynny rzut'],
        },
        {
          field: 'MENTAL_READINESS',
          label: 'Gotowość mentalna?',
          options: ['Brak skupienia', 'Średnia koncentracja', 'Pełna gotowość'],
        },
      ];
    case 1:
      return [
        {
          field: 'HARD_SECTOR',
          label: 'Który sektor sprawiał najwięcej problemów?',
          options:
            type === 'double'
              ? ['D20/D10/D5 (Góra/Prawo)', 'D16/D8/D4 (Lewo)', 'Bullseye', 'Wszystkie równo']
              : ['Triple 20', 'Triple 19', 'Bullseye', 'Brak problemów'],
        },
        {
          field: 'MECHANICS_ISSUE',
          label: 'Co najlepiej opisuje problem techniczny?',
          options: [
            'Brak problemów / wysoka powtarzalność',
            'Poniżej celu (spadek łokcia / za wczesne wypuszczenie)',
            'Powyżej celu (przepchnięcie lotki)',
            'Ściąganie w lewo/prawo (uciekanie łokcia / obrót tułowia)',
            'Niestabilna postawa / utrata balansu',
          ],
        },
      ];
    case 2:
      return [
        {
          field: 'SIMULATION_RESULT',
          label: 'Wynik symulacji?',
          options: ['Wygrana z CPU', 'Zacięty mecz (porażka)', 'Przegrana z dużą stratą'],
        },
        {
          field: 'SIMULATION_PROBLEM',
          label: 'Co było największym wyzwaniem?',
          options: [
            'Gra pod pełną kontrolą',
            'Spięcie/choke przy lotce na wygraną (dubel)',
            'Niska skuteczność scoringu (dużo 26 / 41)',
            'Trudności z szybkim liczeniem i taktyką',
            'Pośpiech i narzucone tempo przez CPU',
          ],
        },
      ];
    case 3:
      return [
        {
          field: 'STRESS_SIMULATION',
          label: 'Jak poszła symulacja stresu?',
          options: ['Trudność z wyobrażeniem sytuacji', 'Odczuwalny realny stres/tętno', 'Pełny spokój / brak reakcji'],
        },
        {
          field: 'BREATHING_EFFECT',
          label: 'Efekt ćwiczeń oddechowych?',
          options: ['Nadal spięty / ciało sztywne', 'Średnie wyciszenie', 'Pełny spokój i tętno w normie'],
        },
      ];
    default:
      return [
        {
          field: 'FATIGUE',
          label: 'Jak się czujesz po treningu?',
          options: ['Ręka/bark zmęczony', 'Zmęczenie psychiczne / brak ostrości', 'Świeżość do końca'],
        },
      ];
  }
}

export interface TrainingFormData {
  BODY_STATE?: string;
  RELEASE_FEEL?: string;
  MENTAL_READINESS?: string;
  HARD_SECTOR?: string;
  MECHANICS_ISSUE?: string;
  SIMULATION_RESULT?: string;
  SIMULATION_PROBLEM?: string;
  STRESS_SIMULATION?: string;
  BREATHING_EFFECT?: string;
  FATIGUE?: string;
  OVERALL_SCORE?: number;
}

export interface TrainingFeedback {
  score: number;
  summary_title: string;
  positives: string[];
  negatives: string[];
  coach_advice: string;
}

export function generateTrainingFeedback(data: TrainingFormData): TrainingFeedback {
  const positives: string[] = [];
  const negatives: string[] = [];

  if (data.RELEASE_FEEL === 'Luźny, płynny rzut') positives.push('Luźny i płynny rzut podczas rozgrzewki');
  if (data.RELEASE_FEEL === 'Ręka spięta / zrywanie') negatives.push('Spięta ręka / zrywanie przy rzucie w rozgrzewce');

  if (data.BODY_STATE === 'Świetnie rozgrzany') positives.push('Świetne rozgrzanie przed treningiem');
  if (data.BODY_STATE === 'Mięśnie zimne/spięte') negatives.push('Zimne, spięte mięśnie na starcie treningu');

  if (data.MENTAL_READINESS === 'Pełna gotowość') positives.push('Pełna gotowość mentalna od początku');
  if (data.MENTAL_READINESS === 'Brak skupienia') negatives.push('Brak skupienia na starcie treningu');

  if (data.MECHANICS_ISSUE === 'Brak problemów / wysoka powtarzalność') positives.push('Wysoka powtarzalność techniki rzutu');
  if (data.MECHANICS_ISSUE === 'Poniżej celu (spadek łokcia / za wczesne wypuszczenie)')
    negatives.push('Opuszczanie łokcia przy rzutach poniżej celu');
  if (data.MECHANICS_ISSUE === 'Powyżej celu (przepchnięcie lotki)') negatives.push('Przepchnięcie lotki przy rzutach powyżej celu');
  if (data.MECHANICS_ISSUE === 'Ściąganie w lewo/prawo (uciekanie łokcia / obrót tułowia)')
    negatives.push('Ściąganie lotek w bok od celu');
  if (data.MECHANICS_ISSUE === 'Niestabilna postawa / utrata balansu') negatives.push('Utrata balansu przy rzutach w skrajne sektory');

  if (data.SIMULATION_RESULT === 'Wygrana z CPU') positives.push('Wygrana symulacja meczu z CPU');
  if (data.SIMULATION_RESULT === 'Przegrana z dużą stratą') negatives.push('Wyraźna przegrana w symulacji meczu');

  if (data.SIMULATION_PROBLEM === 'Gra pod pełną kontrolą') positives.push('Pełna kontrola podczas symulacji meczu');
  if (data.SIMULATION_PROBLEM === 'Spięcie/choke przy lotce na wygraną (dubel)') negatives.push('Spięcie przy lotce na wygraną');
  if (data.SIMULATION_PROBLEM === 'Niska skuteczność scoringu (dużo 26 / 41)') negatives.push('Niska skuteczność scoringu w symulacji');
  if (data.SIMULATION_PROBLEM === 'Trudności z szybkim liczeniem i taktyką') negatives.push('Trudności z liczeniem i taktyką pod presją');
  if (data.SIMULATION_PROBLEM === 'Pośpiech i narzucone tempo przez CPU') negatives.push('Granie w narzuconym, zbyt szybkim tempie');

  if (data.STRESS_SIMULATION === 'Pełny spokój / brak reakcji') positives.push('Pełny spokój podczas symulacji stresu');
  if (data.STRESS_SIMULATION === 'Odczuwalny realny stres/tętno') negatives.push('Realny stres podczas symulacji sytuacji stresowej');

  if (data.BREATHING_EFFECT === 'Pełny spokój i tętno w normie') positives.push('Pełne wyciszenie po ćwiczeniach oddechowych');
  if (data.BREATHING_EFFECT === 'Nadal spięty / ciało sztywne') negatives.push('Ciało wciąż spięte mimo ćwiczeń oddechowych');

  if (data.FATIGUE === 'Świeżość do końca') positives.push('Świeżość fizyczna i mentalna do końca treningu');
  if (data.FATIGUE === 'Ręka/bark zmęczony') negatives.push('Zmęczenie ręki/barku pod koniec treningu');
  if (data.FATIGUE === 'Zmęczenie psychiczne / brak ostrości') negatives.push('Zmęczenie psychiczne pod koniec treningu');

  // Priorytet: Mechanika > Presja/Psychika > Zmęczenie/Rytm > Sukces
  let summary_title = 'Solidna sesja treningowa';
  let coach_advice = 'Trening przebiegł bez większych zastrzeżeń - kontynuuj w tym stylu i stopniowo podnoś poprzeczkę.';

  if (data.MECHANICS_ISSUE === 'Poniżej celu (spadek łokcia / za wczesne wypuszczenie)') {
    summary_title = 'Solidny trening z potrzebą korekty pozycji łokcia';
    coach_advice =
      'Rzucając w dolne sektory, nie obniżaj ręki w łokciu. Wysokość rzutu koryguj delikatnym pochyleniem tułowia w biodrze, zachowując stałą wysokość łokcia. Na kolejnym treningu skup się na stabilnym łokciu.';
  } else if (data.MECHANICS_ISSUE === 'Ściąganie w lewo/prawo (uciekanie łokcia / obrót tułowia)') {
    summary_title = 'Solidny trening z potrzebą pracy nad osiowością';
    coach_advice =
      'Ściąganie lotek na zewnątrz sektora oznacza, że przedramię zbacza z toru rzutu lub obracasz barki. Dokończ ruch ręki tak, aby dłoń i palce po wyproście wskazywały dokładnie w cel. Upewnij się też, że stopa wykroczna stoi nieruchomo.';
  } else if (data.MECHANICS_ISSUE === 'Powyżej celu (przepchnięcie lotki)') {
    summary_title = 'Solidny trening z potrzebą korekty wypuszczenia';
    coach_advice =
      'Rzucanie powyżej celu to efekt zbyt późnego otwarcia dłoni lub nadrabiania siłą z barku. Rozluźnij chwyt i pozwól lotce "wylecieć" z dłoni w najwyższym punkcie łuku rzutu, bez dodatkowego pchania.';
  } else if (data.MECHANICS_ISSUE === 'Niestabilna postawa / utrata balansu') {
    summary_title = 'Solidny trening z potrzebą pracy nad stabilnością';
    coach_advice =
      'Utrata balansu destabilizuje każdy rzut. Zablokuj ciężar ciała na pięcie stopy wykrocznej i nie "nurkuj" do tarczy. Zmiana celu nie może wpływać na zmianę punktu ciężkości Twojej postawy.';
  } else if (data.SIMULATION_PROBLEM === 'Spięcie/choke przy lotce na wygraną (dubel)') {
    summary_title = 'Dobra forma techniczna, presja wyniku do dopracowania';
    coach_advice =
      'Technicznie jesteś gotowy, ale blokuje Cię presja wyniku. Zastosuj "mikropauzę": gdy zostaje Ci ostatnia lotka na wygraną, odsuń się od oche, zrób spokojny, głęboki wydech, ułóż chwyt na nowo i rzuć dopiero po odzyskaniu pełnego spokoju.';
  } else if (data.SIMULATION_PROBLEM === 'Pośpiech i narzucone tempo przez CPU') {
    summary_title = 'Dobra forma techniczna, tempo gry do opanowania';
    coach_advice =
      'Graj w swoim własnym rytmie, a nie w rytmie CPU. Przed każdym podejściem zatrzymaj się na sekundę i wykonaj powtarzalną rutynę złożenia.';
  } else if (data.SIMULATION_PROBLEM === 'Trudności z szybkim liczeniem i taktyką') {
    summary_title = 'Dobra forma techniczna, taktyka do dopracowania';
    coach_advice =
      'Analityka odciąga uwagę od biomechaniki. Zawsze ustalaj cel i "drogowskaz" (co rzucasz i co zostaje) ZANIM staniesz na linii oche.';
  } else if (data.BODY_STATE === 'Mięśnie zimne/spięte' && data.RELEASE_FEEL === 'Ręka spięta / zrywanie') {
    summary_title = 'Trening zaburzony niewystarczającą rozgrzewką';
    coach_advice =
      'Zrywanie rzutu na początku treningu wynika z niegotowych mięśni. Wydłuż rozgrzewkę o 5 minut i rzucaj luźno w środek tarczy, bez celowania w konkretne sektory, aż poczujesz pełną płynność w łokciu i barku.';
  } else if (data.FATIGUE === 'Ręka/bark zmęczony' || data.FATIGUE === 'Zmęczenie psychiczne / brak ostrości') {
    summary_title = 'Solidny trening, uważaj na przetrenowanie';
    coach_advice =
      'Gdy dłoń i bark się męczą, zaczynasz nadrabiać siłą i utrwalasz złe nawyki. Następnym razem wybierz wariant krótki (75 min) lub zrób 3-minutową przerwę na rozciąganie i wodę w połowie sesji.';
  } else if (
    (data.OVERALL_SCORE ?? 0) >= 8 &&
    data.SIMULATION_RESULT === 'Wygrana z CPU' &&
    data.MECHANICS_ISSUE === 'Brak problemów / wysoka powtarzalność'
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
