'use client';

export type SessionType = 'double' | 'triple';
export type SessionMinutes = 75 | 115;

export interface SessionExercise {
  title: string;
  description: string;
  minutesFor75: number;
  minutesFor115: number;
}

export interface SessionPhase {
  name: string;
  exercises: SessionExercise[];
}

export function getSessionPlan(type: SessionType): SessionPhase[] {
  const rozgrzewka: SessionPhase = {
    name: 'Rozgrzewka',
    exercises: [
      {
        title: 'Rzuty rozgrzewkowe',
        description: 'Rzucaj luźno w dowolne sektory, zwracając uwagę na płynność ruchu.',
        minutesFor75: 10,
        minutesFor115: 10,
      },
    ],
  };

  const mentalny: SessionPhase = {
    name: 'Trening mentalny',
    exercises: [
      {
        title: 'Symulacja stresu',
        description:
          'Wyobraź sobie różne scenariusze, w których może pojawić się stres, np. ostatnia lotka w decydującym legu.',
        minutesFor75: 3,
        minutesFor115: 3,
      },
      {
        title: 'Ćwiczenia oddechowe',
        description: 'Przeznacz kilka minut na wyciszenie i kontrolę oddechu, żeby utrzymać spokój i koncentrację.',
        minutesFor75: 2,
        minutesFor115: 2,
      },
    ],
  };

  const coolDown: SessionPhase = {
    name: 'Cool down i analiza',
    exercises: [
      {
        title: 'Luźne rzuty',
        description: 'Kończ trening kilkoma luźnymi rzutami, bez konkretnego celu, aby zrelaksować mięśnie.',
        minutesFor75: 7,
        minutesFor115: 7,
      },
      {
        title: 'Analiza treningu',
        description: 'Przeanalizuj, co poszło dobrze, a co wymaga poprawy. Zapisz cele na następny trening.',
        minutesFor75: 3,
        minutesFor115: 3,
      },
    ],
  };

  if (type === 'double') {
    return [
      rozgrzewka,
      {
        name: 'Ćwiczenia główne',
        exercises: [
          {
            title: 'Rzuty w Double 20/10/5',
            description: 'Rzucamy kolejno (trafiona czy nie) w sektory D20, D10, D5 - każda lotka w inny double.',
            minutesFor75: 10,
            minutesFor115: 20,
          },
          {
            title: 'Rzuty w Double 16/8/4',
            description: 'Rzucamy kolejno (trafiona czy nie) w sektory D16, D8, D4 - każda lotka w inny double.',
            minutesFor75: 10,
            minutesFor115: 20,
          },
          {
            title: 'Rzuty w Bullseye',
            description: 'Zwróć uwagę na powtarzalność ruchu i pozycję ciała - pracuj nad maksymalną powtarzalnością.',
            minutesFor75: 10,
            minutesFor115: 10,
          },
        ],
      },
      {
        name: 'Strategia i symulacja',
        exercises: [
          {
            title: 'Symulacja gry 301',
            description: 'Graj pełną grę 301 przeciwko CPU. Dostosuj poziom tak, żeby komputer wygrywał 75% legów.',
            minutesFor75: 10,
            minutesFor115: 20,
          },
          {
            title: 'Zegar na doublach',
            description: 'Graj zegar na doublach, zwracając szczególną uwagę na te sektory, z którymi masz największy problem.',
            minutesFor75: 10,
            minutesFor115: 20,
          },
        ],
      },
      mentalny,
      coolDown,
    ];
  }

  // triple
  return [
    rozgrzewka,
    {
      name: 'Ćwiczenia główne',
      exercises: [
        {
          title: 'Rzuty w triple 20',
          description: 'Zwróć uwagę na powtarzalność ruchu i pozycję ciała - pracuj nad maksymalną powtarzalnością.',
          minutesFor75: 10,
          minutesFor115: 20,
        },
        {
          title: 'Rzuty w triple 19',
          description: 'Zwróć uwagę na powtarzalność ruchu i pozycję ciała - pracuj nad maksymalną powtarzalnością.',
          minutesFor75: 10,
          minutesFor115: 20,
        },
        {
          title: 'Rzuty w Bullseye',
          description: 'Zwróć uwagę na powtarzalność ruchu i pozycję ciała - pracuj nad maksymalną powtarzalnością.',
          minutesFor75: 10,
          minutesFor115: 10,
        },
      ],
    },
    {
      name: 'Strategia i symulacja',
      exercises: [
        {
          title: 'Symulacja gry 301',
          description: 'Graj pełną grę 301 przeciwko CPU. Dostosuj poziom tak, żeby komputer wygrywał 75% legów.',
          minutesFor75: 10,
          minutesFor115: 20,
        },
        {
          title: 'Finishing 50',
          description: 'Graj w Finishing 50 - dla początkujących na 6 lotek, dla średniozaawansowanych na 3 lotki.',
          minutesFor75: 10,
          minutesFor115: 20,
        },
      ],
    },
    mentalny,
    coolDown,
  ];
}

export interface FlatSessionExercise extends SessionExercise {
  phaseName: string;
  minutes: number; // rzeczywisty czas dla wybranego planu (75 lub 115)
}

export function flattenPlan(type: SessionType, totalMinutes: SessionMinutes): FlatSessionExercise[] {
  const plan = getSessionPlan(type);
  const flat: FlatSessionExercise[] = [];
  plan.forEach((phase) => {
    phase.exercises.forEach((ex) => {
      flat.push({
        ...ex,
        phaseName: phase.name,
        minutes: totalMinutes === 75 ? ex.minutesFor75 : ex.minutesFor115,
      });
    });
  });
  return flat;
}

export function phaseNames(type: SessionType): string[] {
  return getSessionPlan(type).map((p) => p.name);
}

export interface SessionLogEntry {
  date: string;
  type: SessionType;
  totalMinutes: SessionMinutes;
  formData: import('@/lib/trainingDiagnostics').TrainingFormData;
  feedback: import('@/lib/trainingDiagnostics').TrainingFeedback;
}

function sessionLogKey(tpid: string) {
  return `dartdebica_sessions_${tpid}`;
}

export function loadSessionLog(tpid: string): SessionLogEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(sessionLogKey(tpid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function appendSessionLog(tpid: string, entry: SessionLogEntry) {
  if (typeof window === 'undefined') return;
  try {
    const log = loadSessionLog(tpid);
    log.push(entry);
    window.localStorage.setItem(sessionLogKey(tpid), JSON.stringify(log));
  } catch {
    // ignore
  }
}
