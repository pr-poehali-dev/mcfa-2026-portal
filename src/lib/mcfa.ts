import func2url from '../../backend/func2url.json';

export const API = func2url.mcfa;

export const COUNTRIES = [
  { name: 'Россия', flag: '🇷🇺' },
  { name: 'КНДР', flag: '🇰🇵' },
  { name: 'Китай', flag: '🇨🇳' },
  { name: 'Индия', flag: '🇮🇳' },
  { name: 'Беларусь', flag: '🇧🇾' },
  { name: 'Казахстан', flag: '🇰🇿' },
  { name: 'Узбекистан', flag: '🇺🇿' },
  { name: 'Иран', flag: '🇮🇷' },
  { name: 'Египет', flag: '🇪🇬' },
  { name: 'Эфиопия', flag: '🇪🇹' },
  { name: 'ОАЭ', flag: '🇦🇪' },
  { name: 'Саудовская Аравия', flag: '🇸🇦' },
  { name: 'Индонезия', flag: '🇮🇩' },
  { name: 'Турция', flag: '🇹🇷' },
  { name: 'Сербия', flag: '🇷🇸' },
  { name: 'Армения', flag: '🇦🇲' },
];

export const flagOf = (name: string) =>
  COUNTRIES.find((c) => c.name === name)?.flag ?? '🏳️';

export type Applicant = {
  id: number;
  nick: string;
  country: string;
  role_wish: string;
  skin_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
};

export type Post = {
  id: number;
  title: string;
  tag: string;
  body: string;
  created_at: string;
};
