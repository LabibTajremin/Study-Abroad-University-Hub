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

  activeCountry = 'Germany';
  activeIso2 = 'de';

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => {
          const match = e.urlAfterRedirects.match(/\/country\/(.+)/);
          return match ? match[1] : 'germany';
        })
      )
      .subscribe((slug) => {
        const found = this.allCountries.find((c) => c.slug === slug);
        this.activeCountry = found?.name || 'Germany';
        this.activeIso2 = found?.iso2 || 'de';
      });
  }
}
