import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarNode } from '../../models/country.model';
import { CountryConfigService } from '../../services/country-config';
import { SeoService } from '../../services/seo';
import { FlagIcon } from '../../components/flag-icon/flag-icon';

@Component({
  selector: 'app-browse-countries-page',
  imports: [CommonModule, RouterModule, MatIconModule, FlagIcon],
  templateUrl: './browse-countries-page.html',
  styleUrl: './browse-countries-page.scss',
})
export class BrowseCountriesPage implements OnInit {
  private readonly countryConfig = inject(CountryConfigService);
  private readonly seo = inject(SeoService);

  // Europe expands into its nested sub-groups (Schengen/UK/Ireland); every
  // other region is rendered as its own flat section.
  sections: SidebarNode[] = [];

  ngOnInit(): void {
    this.seo.update({
      title: 'Browse Countries',
      description:
        'Browse all study-abroad destinations by region — explore universities across Europe, the UK, the Americas, Asia and Oceania.',
      path: '/browse-countries',
    });

    this.countryConfig.sidebarTree$.subscribe((tree) => {
      this.sections = tree.flatMap((node) => node.children ?? [node]);
    });
  }
}
