import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { RegionGroup, REGION_GROUPS } from '../../models/country.model';
import { UniversityService } from '../../services/university';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  private readonly router = inject(Router);
  private readonly universityService = inject(UniversityService);

  regionGroups: RegionGroup[] = REGION_GROUPS;
  isCollapsed = false;
  countryCount = this.universityService.getAllCountrySlugs().length;

  // All region groups collapsed by default to keep the nav compact;
  // whichever group contains the active route auto-expands on load/navigation.
  expandedGroups: Record<string, boolean> = {};

  ngOnInit(): void {
    this.syncActiveGroup(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncActiveGroup(e.urlAfterRedirects));
  }

  private syncActiveGroup(url: string): void {
    for (const group of this.regionGroups) {
      if (group.countries.some((c) => url.includes(`/country/${c.slug}`))) {
        this.expandedGroups[group.slug] = true;
      }
    }
  }

  toggleSidebar(): void {
    this.isCollapsed = !this.isCollapsed;
    this.sidebarToggled.emit(this.isCollapsed);
  }

  toggleGroup(slug: string): void {
    this.expandedGroups[slug] = !this.expandedGroups[slug];
  }

  isGroupExpanded(slug: string): boolean {
    return !!this.expandedGroups[slug];
  }

  isSingleCountryGroup(group: RegionGroup): boolean {
    return group.countries.length === 1;
  }
}
