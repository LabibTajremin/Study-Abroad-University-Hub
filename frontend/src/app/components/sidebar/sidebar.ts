import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { filter } from 'rxjs/operators';
import { SidebarNode, SIDEBAR_TREE } from '../../models/country.model';
import { UniversityService } from '../../services/university';
import { FlagIcon } from '../flag-icon/flag-icon';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, RouterModule, MatIconModule, MatTooltipModule, FlagIcon],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class Sidebar implements OnInit {
  @Output() sidebarToggled = new EventEmitter<boolean>();

  private readonly router = inject(Router);
  private readonly universityService = inject(UniversityService);

  sidebarTree: SidebarNode[] = SIDEBAR_TREE;
  isCollapsed = false;
  countryCount = this.universityService.getAllCountrySlugs().length;

  // All nodes collapsed by default to keep the nav compact; whichever
  // node (and its ancestors) contains the active route auto-expands.
  expandedGroups: Record<string, boolean> = {};

  ngOnInit(): void {
    this.syncActiveGroup(this.router.url);
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => this.syncActiveGroup(e.urlAfterRedirects));
  }

  private syncActiveGroup(url: string): void {
    this.expandMatchingNodes(this.sidebarTree, url);
  }

  /** Recursively expands any node (or ancestor of a node) whose countries include the active route. */
  private expandMatchingNodes(nodes: SidebarNode[], url: string): boolean {
    let matchedAny = false;
    for (const node of nodes) {
      let matched = !!node.countries?.some((c) => url.includes(`/country/${c.slug}`));
      if (node.children && this.expandMatchingNodes(node.children, url)) {
        matched = true;
      }
      if (matched) {
        this.expandedGroups[node.slug] = true;
        matchedAny = true;
      }
    }
    return matchedAny;
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

  isSingleCountryGroup(node: SidebarNode): boolean {
    return !!node.countries && node.countries.length === 1;
  }
}
