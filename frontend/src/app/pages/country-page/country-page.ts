import { Component, inject, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Subscription } from 'rxjs';
import { Filter } from '../../components/filter/filter';
import { UniversityTable } from '../../components/university-table/university-table';
import { LoadingSpinner } from '../../components/loading-spinner/loading-spinner';
import { FlagIcon } from '../../components/flag-icon/flag-icon';
import { ComingSoon } from '../coming-soon/coming-soon';
import { UniversityService } from '../../services/university';
import { CountryConfigService } from '../../services/country-config';
import { SeoService } from '../../services/seo';
import { Country } from '../../models/country.model';
import {
  University,
  UniversityFilters,
  FilterOptions,
  PaginationState,
  SortState,
} from '../../models/university.model';

@Component({
  selector: 'app-country-page',
  imports: [CommonModule, MatIconModule, Filter, UniversityTable, LoadingSpinner, FlagIcon, ComingSoon],
  templateUrl: './country-page.html',
  styleUrl: './country-page.scss',
})
export class CountryPage implements OnInit, OnDestroy {
  private readonly universityService = inject(UniversityService);
  private readonly countryConfig = inject(CountryConfigService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private routeSub!: Subscription;

  // Country info
  countrySlug = '';  // empty so first load always triggers
  countryInfo: Country | null = null;
  /** True once we've confirmed this slug isn't a registered country — shows the Coming Soon state instead of attempting to load data. */
  notFound = false;
  private accentColorValue = '#3B82F6';

  /** Sets --country-accent on the host element so child components (table, filter)
   *  can pick up the per-country theme color via CSS variable inheritance. */
  @HostBinding('style.--country-accent')
  get accentColor(): string {
    return this.accentColorValue;
  }

  allUniversities: University[] = [];
  filteredUniversities: University[] = [];
  displayedUniversities: University[] = [];

  filterOptions: FilterOptions | null = null;
  loading = false;
  error: string | null = null;

  currentFilters: UniversityFilters = {
    country: '',
    city: '',
    state: '',
    type: '',
    degreeType: '',
    costCategory: '',
    searchTerm: '',
  };

  pagination: PaginationState = {
    pageIndex: 0,
    pageSize: 10,
    totalItems: 0,
  };

  currentSort: SortState = { active: 'ranking', direction: 'asc' };

  ngOnInit(): void {
    this.universityService.loading$.subscribe((l) => (this.loading = l));
    this.universityService.error$.subscribe((e) => (this.error = e));

    // Detect country from route
    this.routeSub = this.route.url.subscribe((segments) => {
      const slug = segments.length > 0 ? segments[segments.length - 1].path : 'germany';
      if (slug !== this.countrySlug) {
        this.countrySlug = slug;
        this.countryConfig.findCountry$(slug).subscribe((found) => {
          this.countryInfo = found;
          this.notFound = found === null;
          this.currentFilters.country = found?.name || 'Germany';
          if (found) {
            this.seo.update({
              title: `Universities in ${found.name}`,
              description: `Browse and compare top universities in ${found.name} — tuition, degree programs, cities and admission requirements for international students.`,
              path: `/country/${found.slug}`,
            });
            this.loadData();
          } else {
            this.seo.update({
              title: 'Coming Soon',
              description: 'University data for this destination is coming soon to Study Abroad University Hub.',
            });
          }
        });
        this.countryConfig.getTheme$(slug).subscribe((color) => {
          this.accentColorValue = color;
        });
      }
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
  }

  private loadData(): void {
    this.allUniversities = [];
    this.filteredUniversities = [];
    this.displayedUniversities = [];
    this.filterOptions = null;
    this.pagination.pageIndex = 0;

    this.universityService.fetchUniversities(this.countrySlug).subscribe((data) => {
      this.allUniversities = data;
      this.filterOptions = this.universityService.getFilterOptions(data);
      this.applyCurrentPipeline();
    });
  }

  onFiltersApplied(filters: UniversityFilters): void {
    this.currentFilters = filters;
    this.pagination.pageIndex = 0;
    this.applyCurrentPipeline();
  }

  onSortChanged(sort: SortState): void {
    this.currentSort = sort;
    this.applyCurrentPipeline();
  }

  onPageChanged(page: PaginationState): void {
    this.pagination = page;
    this.updateDisplayed();
  }

  private applyCurrentPipeline(): void {
    let result = this.universityService.applyFilters(this.allUniversities, this.currentFilters);
    result = this.universityService.sortUniversities(result, this.currentSort);
    this.filteredUniversities = result;
    this.pagination.totalItems = result.length;
    this.updateDisplayed();
  }

  private updateDisplayed(): void {
    this.displayedUniversities = this.universityService.paginate(
      this.filteredUniversities,
      this.pagination
    );
  }
}
