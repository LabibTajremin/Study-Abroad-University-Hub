import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CountryConfigService } from '../../services/country-config';
import { Country } from '../../models/country.model';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
  private readonly countryConfig = inject(CountryConfigService);

  readonly year = new Date().getFullYear();

  /** Toggled by the admin "Site & SEO" settings — controls the crawlable footer nav. */
  readonly showMenu$ = this.countryConfig.siteSettings$;

  /** A capped list of destinations rendered as crawlable internal links for SEO. */
  readonly footerCountries$ = this.countryConfig.allCountries$;

  trackBySlug(_: number, c: Country): string {
    return c.slug;
  }
}
