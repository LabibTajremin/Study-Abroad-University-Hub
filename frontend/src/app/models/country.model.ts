export interface Country {
  name: string;
  slug: string;
  flag: string;
  /** ISO 3166-1 alpha-2 code (lowercase), used to render a real flag image instead of an emoji glyph. */
  iso2: string;
  isActive: boolean;
}

export interface RegionGroup {
  label: string;
  icon: string;
  slug: string;
  countries: Country[];
}

export const SCHENGEN_COUNTRIES: Country[] = [
  { name: 'Germany', slug: 'germany', flag: '🇩🇪', iso2: 'de', isActive: true },
  { name: 'Austria', slug: 'austria', flag: '🇦🇹', iso2: 'at', isActive: true },
  { name: 'Belgium', slug: 'belgium', flag: '🇧🇪', iso2: 'be', isActive: true },
  { name: 'Bulgaria', slug: 'bulgaria', flag: '🇧🇬', iso2: 'bg', isActive: true },
  { name: 'Croatia', slug: 'croatia', flag: '🇭🇷', iso2: 'hr', isActive: true },
  { name: 'Czech Republic', slug: 'czech-republic', flag: '🇨🇿', iso2: 'cz', isActive: true },
  { name: 'Denmark', slug: 'denmark', flag: '🇩🇰', iso2: 'dk', isActive: true },
  { name: 'Estonia', slug: 'estonia', flag: '🇪🇪', iso2: 'ee', isActive: true },
  { name: 'Finland', slug: 'finland', flag: '🇫🇮', iso2: 'fi', isActive: true },
  { name: 'France', slug: 'france', flag: '🇫🇷', iso2: 'fr', isActive: true },
  { name: 'Greece', slug: 'greece', flag: '🇬🇷', iso2: 'gr', isActive: true },
  { name: 'Hungary', slug: 'hungary', flag: '🇭🇺', iso2: 'hu', isActive: true },
  { name: 'Iceland', slug: 'iceland', flag: '🇮🇸', iso2: 'is', isActive: true },
  { name: 'Italy', slug: 'italy', flag: '🇮🇹', iso2: 'it', isActive: true },
  { name: 'Latvia', slug: 'latvia', flag: '🇱🇻', iso2: 'lv', isActive: true },
  { name: 'Liechtenstein', slug: 'liechtenstein', flag: '🇱🇮', iso2: 'li', isActive: true },
  { name: 'Lithuania', slug: 'lithuania', flag: '🇱🇹', iso2: 'lt', isActive: true },
  { name: 'Luxembourg', slug: 'luxembourg', flag: '🇱🇺', iso2: 'lu', isActive: true },
  { name: 'Malta', slug: 'malta', flag: '🇲🇹', iso2: 'mt', isActive: true },
  { name: 'Netherlands', slug: 'netherlands', flag: '🇳🇱', iso2: 'nl', isActive: true },
  { name: 'Norway', slug: 'norway', flag: '🇳🇴', iso2: 'no', isActive: true },
  { name: 'Poland', slug: 'poland', flag: '🇵🇱', iso2: 'pl', isActive: true },
  { name: 'Portugal', slug: 'portugal', flag: '🇵🇹', iso2: 'pt', isActive: true },
  { name: 'Romania', slug: 'romania', flag: '🇷🇴', iso2: 'ro', isActive: true },
  { name: 'Slovakia', slug: 'slovakia', flag: '🇸🇰', iso2: 'sk', isActive: true },
  { name: 'Slovenia', slug: 'slovenia', flag: '🇸🇮', iso2: 'si', isActive: true },
  { name: 'Spain', slug: 'spain', flag: '🇪🇸', iso2: 'es', isActive: true },
  { name: 'Sweden', slug: 'sweden', flag: '🇸🇪', iso2: 'se', isActive: true },
  { name: 'Switzerland', slug: 'switzerland', flag: '🇨🇭', iso2: 'ch', isActive: true },
];

export const UK_COUNTRIES: Country[] = [
  { name: 'United Kingdom', slug: 'uk',    flag: '🇬🇧', iso2: 'gb',     isActive: true },
  { name: 'Wales',          slug: 'wales', flag: '🏴󠁧󠁢󠁷󠁬󠁳󠁿', iso2: 'gb-wls', isActive: true },
];

export const NORTH_AMERICA_COUNTRIES: Country[] = [
  { name: 'United States', slug: 'usa',    flag: '🇺🇸', iso2: 'us', isActive: true },
  { name: 'Canada',        slug: 'canada', flag: '🇨🇦', iso2: 'ca', isActive: true },
];

export const OCEANIA_COUNTRIES: Country[] = [
  { name: 'Australia',    slug: 'australia',    flag: '🇦🇺', iso2: 'au', isActive: true },
  { name: 'New Zealand',  slug: 'new-zealand',  flag: '🇳🇿', iso2: 'nz', isActive: true },
];

export const ASIA_COUNTRIES: Country[] = [
  { name: 'Malaysia',    slug: 'malaysia',     flag: '🇲🇾', iso2: 'my', isActive: true },
  { name: 'Japan',       slug: 'japan',        flag: '🇯🇵', iso2: 'jp', isActive: true },
  { name: 'South Korea', slug: 'south-korea',  flag: '🇰🇷', iso2: 'kr', isActive: true },
  { name: 'China',       slug: 'china',        flag: '🇨🇳', iso2: 'cn', isActive: true },
  { name: 'India',       slug: 'india',        flag: '🇮🇳', iso2: 'in', isActive: true },
  { name: 'Singapore',   slug: 'singapore',    flag: '🇸🇬', iso2: 'sg', isActive: true },
];

export const MIDDLE_EAST_COUNTRIES: Country[] = [
  { name: 'United Arab Emirates', slug: 'uae',    flag: '🇦🇪', iso2: 'ae', isActive: true },
  { name: 'Turkey',               slug: 'turkey', flag: '🇹🇷', iso2: 'tr', isActive: true },
];

export const REGION_GROUPS: RegionGroup[] = [
  {
    label: 'Europe (Schengen)',
    icon: '🇪🇺',
    slug: 'schengen',
    countries: SCHENGEN_COUNTRIES,
  },
  {
    label: 'United Kingdom',
    icon: '🇬🇧',
    slug: 'uk-group',
    countries: UK_COUNTRIES,
  },
  {
    label: 'Ireland',
    icon: '🇮🇪',
    slug: 'ireland',
    countries: [{ name: 'Ireland', slug: 'ireland', flag: '🇮🇪', iso2: 'ie', isActive: true }],
  },
  {
    label: 'North America',
    icon: '🇺🇸',
    slug: 'north-america',
    countries: NORTH_AMERICA_COUNTRIES,
  },
  {
    label: 'Oceania',
    icon: '🏝️',
    slug: 'oceania',
    countries: OCEANIA_COUNTRIES,
  },
  {
    label: 'Asia',
    icon: '🌏',
    slug: 'asia',
    countries: ASIA_COUNTRIES,
  },
  {
    label: 'Middle East',
    icon: '🕌',
    slug: 'middle-east',
    countries: MIDDLE_EAST_COUNTRIES,
  },
];

/**
 * Per-country accent color (derived from each nation's flag) used to give the
 * country page a subtle themed look. Keyed by country slug; falls back to the
 * app's default blue (#3B82F6) for any slug not listed here.
 */
export const COUNTRY_THEMES: Record<string, string> = {
  germany: '#CC0000',
  austria: '#ED2939',
  belgium: '#EF3340',
  bulgaria: '#00966E',
  croatia: '#FF0000',
  'czech-republic': '#D7141A',
  denmark: '#C8102E',
  estonia: '#0072CE',
  finland: '#003580',
  france: '#0055A4',
  greece: '#0D5EAF',
  hungary: '#CD2A3E',
  iceland: '#02529C',
  italy: '#009246',
  latvia: '#9E1B32',
  liechtenstein: '#002B7F',
  lithuania: '#006A44',
  luxembourg: '#00A1DE',
  malta: '#CF142B',
  netherlands: '#FF6F00',
  norway: '#BA0C2F',
  poland: '#DC143C',
  portugal: '#006600',
  romania: '#002B7F',
  slovakia: '#0B4EA2',
  slovenia: '#0046AD',
  spain: '#AA151B',
  sweden: '#006AA7',
  switzerland: '#D52B1E',
  uk: '#012169',
  wales: '#C8102E',
  ireland: '#169B62',
  usa: '#3C3B6E',
  canada: '#FF0000',
  australia: '#00008B',
  'new-zealand': '#003087',
  malaysia: '#FFC72C',
  japan: '#BC002D',
  'south-korea': '#003478',
  china: '#DE2910',
  india: '#FF9933',
  singapore: '#ED2939',
  uae: '#00732F',
  turkey: '#E30A17',
};
