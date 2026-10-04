const intents = [
  {
    id: 'career',
    phrases: ['career', 'job', 'work', 'profession'],
    text: 'Saturn still favors steady effort in your career. The next stretch rewards work you finish, not work you start.',
    recommendation: {
      type: 'tarot',
      title: 'Career Tarot Reading',
      subtitle: 'A focused three-card spread',
    },
  },
  {
    id: 'love',
    phrases: ['love', 'marriage', 'relationship', 'partner'],
    text: 'Love this year asks for patience more than a grand gesture. A steady conversation with your partner matters more than a sudden change.',
    recommendation: {
      type: 'consultation',
      title: 'Love consultation',
      subtitle: 'One question, read with you',
    },
  },
  {
    id: 'health',
    phrases: ['health', 'healthy', 'illness'],
    text: 'Health holds if you keep an even pace and rest when Saturn asks. Strain builds when the week is packed, not from one bad day.',
    recommendation: {
      type: 'article',
      title: 'Health this year',
      subtitle: 'Pace and rest under Saturn',
    },
  },
  {
    id: 'money',
    phrases: ['money', 'finance', 'wealth', 'income'],
    text: 'Money this year looks steadier if you keep Saturn’s pace. Income follows the work you already have in motion.',
    recommendation: {
      type: 'article',
      title: 'Finances This Year',
      subtitle: 'A Saturn reading of income',
    },
  },
  {
    id: 'luck',
    phrases: ['luck', 'lucky', 'fortune'],
    text: 'Luck is quiet this season and shows up as timing, not a windfall. A planned step lands better than a leap.',
    recommendation: {
      type: 'tarot',
      title: 'Luck spread',
      subtitle: 'Timing, not a windfall',
    },
  },
  {
    id: 'family',
    phrases: ['family', 'children', 'parents'],
    text: 'Family matters settle when you speak early and keep the tone even. Parents and children both need a little more time than usual.',
    recommendation: {
      type: 'consultation',
      title: 'Family consultation',
      subtitle: 'Parents and children',
    },
  },
  {
    id: 'study',
    phrases: ['study', 'exam', 'education'],
    text: 'Study goes further in short, regular sittings than in one long push. Exams favor the work you repeat.',
    recommendation: {
      type: 'article',
      title: 'Study this season',
      subtitle: 'Short sittings, repeated',
    },
  },
  {
    id: 'travel',
    phrases: ['travel', 'abroad'],
    text: 'Travel is kinder after you fix the date and leave a margin. Abroad plans hold if you do not rush the departure.',
    recommendation: {
      type: 'panchang',
      title: 'Travel timing',
      subtitle: 'Leave a margin on the date',
    },
  },
  {
    id: 'gemstone',
    phrases: ['gemstone', 'sapphire', 'gem', 'stone'],
    text: 'A Saturn stone can steady this period. Blue Sapphire is the one I would look at first.',
    recommendation: {
      type: 'gemstone',
      title: 'Blue Sapphire',
      subtitle: 'Recommended for Saturn',
    },
  },
  {
    id: 'consultation',
    phrases: ['astrologer', 'consult', 'consultation', 'talk'],
    text: 'A short conversation with an astrologer would help you sort the next step. Bring one question, not the whole chart.',
    recommendation: {
      type: 'consultation',
      title: 'Talk to an Astrologer',
    },
  },
  {
    id: 'article',
    phrases: ['article', 'mahadasha', 'read', 'learn'],
    text: 'This article walks through the Saturn period without rushing the chart. Read it once, then sit with the one line that fits.',
    recommendation: {
      type: 'article',
      title: 'Understanding Saturn Mahadasha',
    },
  },
  {
    id: 'promotion',
    phrases: ['offer', 'discount', 'promotion', 'deal'],
    text: 'There is a first-consultation offer open this week if you want a person to read it with you. Bring one question to that sitting.',
    recommendation: {
      type: 'promotion',
      title: 'First consultation offer',
      subtitle: 'Valid this week',
    },
  },
  {
    id: 'panchang',
    phrases: ['panchang', 'timing', 'calendar', 'saturday'],
    text: 'Saturday timing is the kinder window for a Saturn step. Use that day for the one action you keep delaying.',
    recommendation: {
      type: 'panchang',
      title: 'Saturday Panchang',
      subtitle: 'Shani-friendly timing',
    },
  },
  {
    id: 'remedy',
    phrases: ['remedy', 'remedies', 'ritual'],
    text: 'A simple Saturday remedy is enough to start. Keep it small and repeat it.',
    recommendation: {
      type: 'remedy',
      title: 'Saturday Remedy',
      subtitle: 'Unregistered type, still shown',
    },
  },
  {
    id: 'today',
    phrases: ['horoscope', 'today', 'week', 'month', 'year'],
    text: 'This period is a Saturn stretch: slow, useful, and better taken one week at a time. The month rewards routine more than a new start.',
    recommendation: {
      type: 'panchang',
      title: 'This week',
      subtitle: 'One week at a time',
    },
  },
];

const fallback = {
  id: 'choose',
  text: 'Choose Career, Love, Health, or Money.',
};

const birthMonths = [
  'A January birth keeps the year slow and deliberate.',
  'A February birth asks you to finish what you already started.',
  'A March birth favors a clear decision over a new beginning.',
  'An April birth rewards patience more than speed.',
  'A May birth is steadier when you keep one promise.',
  'A June birth opens after you put the week in order.',
  'A July birth holds if you do not rush the result.',
  'An August birth suits work you can repeat.',
  'A September birth improves when you speak early.',
  'An October birth is kinder with a fixed date.',
  'A November birth asks for rest between efforts.',
  'A December birth closes the year better than it starts it.',
];

function withBirthMonth(text, birthDate) {
  const month = Number(String(birthDate).slice(5, 7)) - 1;
  const line = birthMonths[month] ?? birthMonths[0];
  return `${text} ${line}`;
}

const THRESHOLD = 0.8;

function normalize(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(left, right) {
  const rows = left.length + 1;
  const cols = right.length + 1;
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(0));
  for (let i = 0; i < rows; i += 1) {
    grid[i][0] = i;
  }
  for (let j = 0; j < cols; j += 1) {
    grid[0][j] = j;
  }
  for (let i = 1; i < rows; i += 1) {
    for (let j = 1; j < cols; j += 1) {
      const cost = left[i - 1] === right[j - 1] ? 0 : 1;
      grid[i][j] = Math.min(
        grid[i - 1][j] + 1,
        grid[i][j - 1] + 1,
        grid[i - 1][j - 1] + cost,
      );
    }
  }
  return grid[left.length][right.length];
}

function ratio(left, right) {
  if (!left || !right) {
    return 0;
  }
  if (left === right) {
    return 1;
  }
  const distance = levenshtein(left, right);
  return 1 - distance / Math.max(left.length, right.length);
}

function phraseScore(text, phrase) {
  const tokens = text.split(' ').filter(Boolean);
  if (tokens.includes(phrase)) {
    return 1;
  }
  let best = 0;
  for (const token of tokens) {
    best = Math.max(best, ratio(token, phrase));
  }
  return best;
}

function matchIntent(text) {
  const normalized = normalize(text);
  let best = null;
  let bestScore = 0;
  for (const intent of intents) {
    for (const phrase of intent.phrases) {
      const score = phraseScore(normalized, phrase);
      if (score > bestScore) {
        best = intent;
        bestScore = score;
      }
    }
  }
  if (!best || bestScore < THRESHOLD) {
    return fallback;
  }
  return best;
}

module.exports = { matchIntent, withBirthMonth };
