export const SEARCH_LOCATIONS = [
  { name: 'United States', code: '2840' },
  { name: 'United Kingdom', code: '2826' },
  { name: 'Romania', code: '2642' },
  { name: 'Germany', code: '2276' },
  { name: 'France', code: '2250' },
  { name: 'Spain', code: '2724' },
];

export const SEARCH_ENGINES = {
  labs: {
    id: 'labs',
    label: 'Standard (Labs)',
    description: 'Fast, historical database research.',
    estCost: 0.01,
  },
  live: {
    id: 'live',
    label: 'Live (Google Ads)',
    description: 'Real-time accuracy & current bids.',
    estCost: 0.05,
  }
};