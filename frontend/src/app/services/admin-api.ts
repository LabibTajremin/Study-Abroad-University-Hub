import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { University } from '../models/university.model';

const TOKEN_KEY = 'sauh-admin-token';

export interface CountriesConfigPayload {
  regionGroups: unknown[];
  sidebarTree: unknown[];
  countryThemes: Record<string, string>;
}

/** Talks to the Vercel serverless functions under /api/admin — real server-side auth + GitHub-commit persistence. */
@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);

  get token(): string | null {
    return sessionStorage.getItem(TOKEN_KEY);
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  login(username: string, password: string): Observable<{ token: string }> {
    return this.http
      .post<{ token: string }>('/api/admin/login', { username, password })
      .pipe(tap((res) => sessionStorage.setItem(TOKEN_KEY, res.token)));
  }

  logout(): void {
    sessionStorage.removeItem(TOKEN_KEY);
  }

  private authHeaders() {
    return { headers: { Authorization: `Bearer ${this.token}` } };
  }

  saveUniversities(slug: string, universities: University[]): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      '/api/admin/save-data-file',
      { slug, universities },
      this.authHeaders()
    );
  }

  deleteUniversitiesFile(slug: string): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      '/api/admin/delete-data-file',
      { slug },
      this.authHeaders()
    );
  }

  saveCountryConfig(config: CountriesConfigPayload): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      '/api/admin/save-country-config',
      { config },
      this.authHeaders()
    );
  }
}
