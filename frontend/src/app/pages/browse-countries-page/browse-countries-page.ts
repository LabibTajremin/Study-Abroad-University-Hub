import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarNode } from '../../models/country.model';
import { CountryConfigService } from '../../services/country-config';
import { FlagIcon } from '../../components/flag-icon/flag-icon';

@Component({
  selector: 'app-browse-countries-page',
  imports: [CommonModule, RouterModule, MatIconModule, FlagIcon],
  templateUrl: './browse-countries-page.html',
  styleUrl: './browse-countries-page.scss',
})
export class BrowseCountriesPage implements OnInit {
  private readonly countryConfig = inject(CountryConfigService);

  // Europe expands into its nested sub-groups (Schengen/UK/Ireland); every
  // other region is rendered as its own flat section.
  sections: SidebarNode[] = [];

  ngOnInit(): void {
    this.countryConfig.sidebarTree$.subscribe((tree) => {
      this.sections = tree.flatMap((node) => node.children ?? [node]);
    });
  }
}
