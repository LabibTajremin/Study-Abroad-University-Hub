import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, catchError, of, delay, tap } from 'rxjs';
import {
  University,
  UniversityFilters,
  FilterOptions,
  PaginationState,
  SortState,
} from '../models/university.model';
import { environment } from '../../environments/environment';
import { CountryConfigService } from './country-config';

@Injectable({ providedIn: 'root' })
export class UniversityService {
  private readonly http = inject(HttpClient);
  private readonly countryConfig = inject(CountryConfigService);

  private readonly loadingSubject = new BehaviorSubject<boolean>(false);
  readonly loading$ = this.loadingSubject.asObservable();

  private readonly errorSubject = new BehaviorSubject<string | null>(null);
  readonly error$ = this.errorSubject.asObservable();

  // Per-country cache
  private cache = new Map<string, University[]>();

  /**
   * Fetch universities for a specific country. The data file path is derived
   * directly from the slug (data/<slug>-universities.json) — every country's
   * data file follows this exact naming convention, which is what lets the
   * admin tool add a brand-new country without any source/rebuild changes.
   */
  fetchUniversities(country: string = 'germany'): Observable<University[]> {
    const cached = this.cache.get(country);
    if (cached) {
      return of(cached);
    }

    const path = `data/${country}-universities.json`;
    const url = environment.apiBaseUrl ? `${environment.apiBaseUrl}/${path}` : path;

    this.loadingSubject.next(true);
    this.errorSubject.next(null);

    return this.http.get<University[]>(url).pipe(
      delay(300),
      tap((data) => {
        this.cache.set(country, data);
        this.loadingSubject.next(false);
      }),
      catchError((err) => {
        this.loadingSubject.next(false);
        this.errorSubject.next(`Failed to load university data for ${country}. Please try again.`);
        console.error('UniversityService error:', err);
        return of([]);
      })
    );
  }

  getFilterOptions(universities: University[]): FilterOptions {
    return {
      cities: [...new Set(universities.map((u) => u.city))].sort(),
      states: [...new Set(universities.map((u) => u.state).filter(s => s))].sort(),
      types: [...new Set(universities.map((u) => u.type))].sort(),
      degreeTypes: [...new Set(universities.flatMap((u) => u.degreeTypes))].sort(),
      costCategories: ['Free', 'Low', 'Medium', 'High'],
    };
  }

  applyFilters(universities: University[], filters: UniversityFilters): University[] {
    return universities.filter((u) => {
      const matchCity = !filters.city || u.city === filters.city;
      const matchState = !filters.state || u.state === filters.state;
      const matchType = !filters.type || u.type === filters.type;
      const matchDegree = !filters.degreeType || u.degreeTypes.includes(filters.degreeType);
      const matchCost = !filters.costCategory || u.costCategory === filters.costCategory;
      const matchSearch =
        !filters.searchTerm ||
        u.name.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        u.localName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        u.city.toLowerCase().includes(filters.searchTerm.toLowerCase());

      // Advanced eligibility filters
      // Rule: if a university has NO data for a field → it always passes that filter
      // (we can't exclude what we don't know; only exclude when we have explicit data that fails)
      const matchBudget =
        !filters.budgetMax ||
        u.totalCostUSD == null ||
        u.totalCostUSD <= filters.budgetMax;

      // gpaMin = "my GPA" — show unis whose requirement is ≤ user's GPA, or have no requirement
      const matchGpa =
        !filters.gpaMin ||
        u.gpaRequirement == null ||
        u.gpaRequirement <= (filters.gpaMin ?? 0);

      // ieltsMin = "my IELTS" — show unis whose requirement is ≤ user's IELTS, or have no requirement
      const matchIelts =
        !filters.ieltsMin ||
        u.ieltsRequirement == null ||
        u.ieltsRequirement <= (filters.ieltsMin ?? 0);

      const matchDifficulty =
        !filters.admissionDifficulty || u.admissionDifficulty === filters.admissionDifficulty;

      // Scholarship: only exclude if explicitly marked false (unknown = include)
      const matchScholarship =
        !filters.scholarshipOnly || u.scholarshipAvailable !== false;

      // Study gap: only exclude if explicitly marked false (unknown = include)
      const matchStudyGap =
        !filters.studyGapAllowed ||
        u.studyGapAllowed == null ||
        u.studyGapAllowed === true ||
        u.studyGapAllowed === 'conditional';

      return (
        matchCity && matchState && matchType && matchDegree && matchCost && matchSearch &&
        matchBudget && matchGpa && matchIelts && matchDifficulty && matchScholarship && matchStudyGap
      );
    });
  }

  sortUniversities(universities: University[], sort: SortState): University[] {
    if (!sort.active || sort.direction === '') {
      return universities;
    }

    return [...universities].sort((a, b) => {
      const dir = sort.direction === 'asc' ? 1 : -1;
      const valA = (a as unknown as Record<string, unknown>)[sort.active];
      const valB = (b as unknown as Record<string, unknown>)[sort.active];

      if (valA == null) return 1;
      if (valB == null) return -1;

      if (typeof valA === 'number' && typeof valB === 'number') {
        return (valA - valB) * dir;
      }

      return String(valA).localeCompare(String(valB)) * dir;
    });
  }

  paginate(universities: University[], pagination: PaginationState): University[] {
    const start = pagination.pageIndex * pagination.pageSize;
    return universities.slice(start, start + pagination.pageSize);
  }

  clearCache(country?: string): void {
    if (country) {
      this.cache.delete(country);
    } else {
      this.cache.clear();
    }
  }

  isCountryAvailable$(slug: string): Observable<boolean> {
    return this.countryConfig.isCountryAvailable$(slug);
  }

  getAllCountrySlugs$(): Observable<string[]> {
    return this.countryConfig.getAllCountrySlugs$();
  }
}
