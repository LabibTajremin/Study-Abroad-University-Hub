import { Routes } from '@angular/router';
import { CountryPage } from './pages/country-page/country-page';

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
  },

  // ── Country page — single dynamic route. CountryPage looks up the slug
  //    against the runtime country config and shows a "Coming Soon" state
  //    for any slug that isn't registered, instead of a hardcoded route per
  //    country. This is what lets the admin tool add a brand-new country
  //    without needing a source/rebuild change for routing. ──
  { path: 'country/:country', component: CountryPage },

  // Fallback
  { path: '**', redirectTo: '' },
];
