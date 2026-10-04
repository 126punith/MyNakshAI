function atHour(daysAgo, hour) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(hour, 15, 0, 0);
  return date.toISOString();
}

const seed = [
  {
    id: '1',
    type: 'system',
    text: 'Your session with AI Astrologer has started.',
    createdAt: atHour(1, 9),
    status: 'sent',
  },
  {
    id: '2',
    type: 'user',
    text: 'Can you tell me about my career this year?',
    createdAt: atHour(1, 9),
    status: 'sent',
  },
  {
    id: '5',
    type: 'user',
    text: 'Especially the next six months.',
    createdAt: atHour(1, 9),
    status: 'sent',
  },
  {
    id: '3',
    type: 'ai',
    text: 'I can already see a strong Saturn influence in your chart. Based on this, here are a few recommendations that may help you.',
    createdAt: atHour(0, 10),
    status: 'sent',
    recommendations: [
      {
        id: '1',
        type: 'gemstone',
        title: 'Blue Sapphire',
        subtitle: 'Recommended for Saturn',
      },
      {
        id: '2',
        type: 'tarot',
        title: 'Career Tarot Reading',
      },
      {
        id: '3',
        type: 'consultation',
        title: 'Talk to an Astrologer',
      },
      {
        id: '4',
        type: 'article',
        title: 'Understanding Saturn Mahadasha',
      },
      {
        id: '6',
        type: 'promotion',
        title: 'First consultation offer',
        subtitle: 'Valid this week',
      },
      {
        id: '7',
        type: 'panchang',
        title: 'Saturday Panchang',
        subtitle: 'Shani-friendly timing',
      },
      {
        id: '8',
        type: 'remedy',
        title: 'Saturday Remedy',
        subtitle: 'Unregistered type, still shown',
      },
    ],
  },
  {
    id: '4',
    type: 'human',
    text: 'I also recommend focusing on your upcoming Jupiter transit.',
    createdAt: atHour(0, 11),
    status: 'sent',
  },
];

module.exports = { seed };
