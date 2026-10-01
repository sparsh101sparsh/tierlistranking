export interface TierItem {
  id: string;
  title: string;
  subtitle?: string;
  tierId: string | null; // null if unranked (in Mac fan stack)
  createdAt: number;
}

export interface TierDefinition {
  id: string;
  label: string;
  color: string;
  textColor: string;
}

export const DEFAULT_TIERS: TierDefinition[] = [
  { id: 'goated', label: 'GOATED', color: '#ff7f7f', textColor: '#2b2b2b' },
  { id: 'good', label: 'GOOD', color: '#ffbf7f', textColor: '#2b2b2b' },
  { id: 'mid', label: 'MID', color: '#ffdf7f', textColor: '#2b2b2b' },
  { id: 'bad', label: 'BAD', color: '#d4e176', textColor: '#2b2b2b' },
  { id: 'remove_it', label: 'REMOVE IT', color: '#8fe388', textColor: '#2b2b2b' },
];

export const PRESETS = [
  {
    id: 'original-rhymes',
    name: 'Original Image Viral Quotes',
    description: 'Exact funny quotes from the reference image',
    items: [
      'UDTA HAI\nPARINDA\nMARD JAAT HAI\nDARINDAA',
      '1 PLATE HALWA\n2 PLATE KHEER\nMARD JAAT\nBAWASIR',
      'TEL LAGA KE\nSARSO KA\nNAAM MITADO\nMARDO KA',
      '1 PIZZA 2 SLICE\nMARDON PE\nTRUST??\nTHINK TWICE',
      'MARDO KO DEKH\nKAR AURTO KO\nAYA BHUKAR\nAYEE MARD APNI\nCHAVI SUDHAR',
      '1 ALOO 2 PARATHE\nMARD JAAT MEIN\nBAJADO CHAANTE',
      'DIL DIYA GALLAN\nKARANGE ROJ\nMARD JAAT SE\nRAHO KHOJ',
      'CHAI MEIN CHINI KAM\nMARD JAAT HAI GHAM',
      'SUBAH KI CHAI\nSHAM KI MAGGI\nMARD JAAT DAGGABAAZ',
      'DO DOONI CHAR\nMARD JAAT PE\nNA KAR EITBAAR',
    ],
  },
  {
    id: 'dev-tech',
    name: 'Dev Tech Stacks',
    description: 'Frameworks, languages and dev tools',
    items: [
      'REACT',
      'TYPESCRIPT',
      'TAILWIND CSS',
      'RUST',
      'PYTHON',
      'DOCKER',
      'POSTGRESQL',
      'VITE',
      'NEXT.JS',
      'LINUX',
    ],
  },
  {
    id: 'fast-food',
    name: 'Fast Food & Snacks',
    description: 'Favorite food chains & snacks',
    items: [
      'PIZZA HUT',
      'MCDONALD\'S',
      'TACO BELL',
      'KFC',
      'DOMINO\'S',
      'SUBWAY',
      'BURGER KING',
      'WENDY\'S',
    ],
  },
  {
    id: 'movies',
    name: 'Legendary Movies',
    description: 'Iconic cinematic blockbusters',
    items: [
      'INTERSTELLAR',
      'THE DARK KNIGHT',
      'INCEPTION',
      'PULP FICTION',
      'AVENGERS: ENDGAME',
      'THE MATRIX',
      'FIGHT CLUB',
    ],
  },
];
