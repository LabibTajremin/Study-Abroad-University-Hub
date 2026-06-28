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
  /** ISO 3166-1 alpha-2 code, or a region code like 'eu' — used for a real flag/logo image when this group represents one specific nation/union. */
  iso2?: string;
  /** Material icon name to use as a logo badge when no single flag applies (e.g. a multi-nation region like North America). */
  materialIcon?: string;
  countries: Country[];
}

/** A node in the sidebar's nested navigation tree — either a parent with `children`, or a leaf with `countries`. */
export interface SidebarNode {
  label: string;
  icon: string;
  slug: string;
  iso2?: string;
  materialIcon?: string;
  countries?: Country[];
  children?: SidebarNode[];
}

/**
 * NOTE: the actual taxonomy data (which countries exist, region groupings,
 * accent colors) used to live here as hardcoded arrays. It now lives in
 * frontend/public/data/countries-config.json, loaded at runtime via
 * CountryConfigService — this lets the admin tool add/edit/delete countries
 * by committing an updated JSON file, with no source/rebuild changes needed.
 */
