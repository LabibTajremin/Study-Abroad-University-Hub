import { Component, EventEmitter, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter, map, switchMap } from 'rxjs';
import { CountryConfigService } from '../../services/country-config';
import { FlagIcon } from '../flag-icon/flag-icon';
import { ThemeService } from '../../services/theme';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MatToolbarModule, MatIconModule, MatTooltipModule, FlagIcon],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);
  private readonly countryConfig = inject(CountryConfigService);
  readonly themeService = inject(ThemeService);

  /** Emitted when the mobile hamburger is tapped — App toggles the sidebar drawer. */
  @Output() menuToggle = new EventEmitter<void>();

  /** Only set when the active route is actually a /country/:slug page — null elsewhere (dashboard, find, etc). */
  activeCountry: string | null = null;
  activeIso2: string | null = null;

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        map((e) => e.urlAfterRedirects.match(/\/country\/(.+)/)?.[1] ?? null),
        switchMap((slug) => (slug ? this.countryConfig.findCountry$(slug) : [null]))
      )
      .subscribe((found) => {
        this.activeCountry = found?.name ?? null;
        this.activeIso2 = found?.iso2 ?? null;
      });
  }
}
