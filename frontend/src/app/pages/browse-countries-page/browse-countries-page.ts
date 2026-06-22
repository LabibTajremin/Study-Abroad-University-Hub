import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { SidebarNode, SIDEBAR_TREE } from '../../models/country.model';
import { FlagIcon } from '../../components/flag-icon/flag-icon';

@Component({
  selector: 'app-browse-countries-page',
  imports: [CommonModule, RouterModule, MatIconModule, FlagIcon],
  templateUrl: './browse-countries-page.html',
  styleUrl: './browse-countries-page.scss',
})
export class BrowseCountriesPage {
  // Europe expands into its nested sub-groups (Schengen/UK/Ireland); every
  // other region is rendered as its own flat section.
  sections: SidebarNode[] = SIDEBAR_TREE.flatMap((node) => node.children ?? [node]);
}
