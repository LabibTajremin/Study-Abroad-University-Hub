import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay, map } from 'rxjs';
import { Country, RegionGroup, SidebarNode } from '../models/country.model';

interface SidebarTreeRef {
  groupSlug?: string;
  slug?: string;
  label?: string;
  icon?: string;
  iso2?: string;
  materialIcon?: string;
  childGroupSlugs?: string[];
}

interface CountriesConfig {
  regionGroups: RegionGroup[];
  sidebarTree: SidebarTreeRef[];
  countryThemes: Record<string, string>;
}

/**
 * Loads the country taxonomy (regions, routes' valid slugs, accent colors) from
 * a runtime JSON file instead of hardcoded TypeScript, so the admin tool can add/
 * edit/delete countries by committing an updated JSON file — no rebuild-time
 * source changes required.
 */
@Injectable({ providedIn: 'root' })
export class CountryConfigService {
  private readonly http = inject(HttpClient);

  private readonly config$: Observable<CountriesConfig> = this.http
    .get<CountriesConfig>('data/countries-config.json')
    .pipe(shareReplay({ bufferSize: 1, refCount: false }));

  /** Flat list of every leaf region group — equivalent to the old static REGION_GROUPS. */
  readonly regionGroups$: Observable<RegionGroup[]> = this.config$.pipe(map((c) => c.regionGroups));

  /** Nested tree for the sidebar nav — equivalent to the old static SIDEBAR_TREE. */
  readonly sidebarTree$: Observable<SidebarNode[]> = this.config$.pipe(
    map((c) => c.sidebarTree.map((ref) => this.resolveSidebarNode(ref, c.regionGroups)))
  );

  readonly allCountries$: Observable<Country[]> = this.regionGroups$.pipe(
    map((groups) => groups.flatMap((g) => g.countries))
  );

  private resolveSidebarNode(ref: SidebarTreeRef, groups: RegionGroup[]): SidebarNode {
    if (ref.groupSlug) {
      const group = groups.find((g) => g.slug === ref.groupSlug);
      if (!group) {
        throw new Error(`countries-config.json: sidebarTree references unknown groupSlug "${ref.groupSlug}"`);
      }
      return group;
    }

    return {
      slug: ref.slug!,
      label: ref.label!,
      icon: ref.icon!,
      iso2: ref.iso2,
      materialIcon: ref.materialIcon,
      children: (ref.childGroupSlugs ?? []).map((slug) => {
        const group = groups.find((g) => g.slug === slug);
        if (!group) {
          throw new Error(`countries-config.json: childGroupSlugs references unknown group "${slug}"`);
        }
        return group;
      }),
    };
  }

  getTheme$(slug: string): Observable<string> {
    return this.config$.pipe(map((c) => c.countryThemes[slug] ?? '#3B82F6'));
  }

  findCountry$(slug: string): Observable<Country | null> {
    return this.allCountries$.pipe(map((countries) => countries.find((c) => c.slug === slug) ?? null));
  }

  isCountryAvailable$(slug: string): Observable<boolean> {
    return this.findCountry$(slug).pipe(map((c) => c !== null));
  }

  getAllCountrySlugs$(): Observable<string[]> {
    return this.allCountries$.pipe(map((countries) => countries.map((c) => c.slug)));
  }
}
