import { Routes } from '@angular/router';
import { unsavedChangesGuard } from './guards/unsaved-changes.guard';

export const routes: Routes = [
  // ── Dashboard (default landing) ──
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard-page/dashboard-page').then((m) => m.DashboardPage),
  },

  // ── Recommendation engine ──
  {
    path: 'find',
    loadComponent: () =>
      import('./pages/home-page/home-page').then((m) => m.HomePage),
  },

  // ── Browse all countries, grouped by region ──
  {
    path: 'browse-countries',
    loadComponent: () =>
      import('./pages/browse-countries-page/browse-countries-page').then(
        (m) => m.BrowseCountriesPage
      ),
  },

  // ── University Detail ──
  {
    path: 'university/:id',
    loadComponent: () =>
      import('./pages/university-detail-page/university-detail-page').then(
        (m) => m.UniversityDetailPage
      ),
  },

  // ── Admin (content-authoring tool, password-gated client-side) ──
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin-page/admin-page').then((m) => m.AdminPage),
    canDeactivate: [unsavedChangesGuard],
  },

  // ── Country page — single dynamic route, lazy-loaded (it pulls in the
  //    xlsx library for Excel export, which would otherwise bloat the main
  //    bundle). CountryPage looks up the slug against the runtime country
  //    config and shows a "Coming Soon" state for any slug that isn't
  //    registered, instead of a hardcoded route per country. ──
  {
    path: 'country/:country',
    loadComponent: () =>
      import('./pages/country-page/country-page').then((m) => m.CountryPage),
  },

  // Fallback
  { path: '**', redirectTo: '' },
];
