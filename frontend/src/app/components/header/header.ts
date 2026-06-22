import { Component, inject } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { filter, map } from 'rxjs';
import { REGION_GROUPS } from '../../models/country.model';
import { FlagIcon } from '../flag-icon/flag-icon';

@Component({
  selector: 'app-header',
  imports: [MatToolbarModule, MatIconModule, FlagIcon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);

  private readonly allCountries = REGION_GROUPS.flatMap((g) => g.countries);

  /** Only set when the active route is actually a /country/:slug page — null elsewhere (dashboard, find, etc). */
  activeCountry: string | null = null;
  activeIso2: string | null = null;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => e.urlAfterRedirects.match(/\/country\/(.+)/)?.[1] ?? null)
      )
      .subscribe((slug) => {
        const found = slug ? this.allCountries.find((c) => c.slug === slug) : null;
        this.activeCountry = found?.name ?? null;
        this.activeIso2 = found?.iso2 ?? null;
      });
  }
}
