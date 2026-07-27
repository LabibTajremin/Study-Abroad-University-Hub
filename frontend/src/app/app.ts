import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { Footer } from './components/footer/footer';
import { ThemeService } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Injecting ThemeService here ensures the saved/system theme is applied as early as possible on bootstrap.
  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  sidebarCollapsed = false;

  /** Off-canvas drawer state on mobile (independent from the desktop collapse). */
  mobileNavOpen = false;

  constructor() {
    // Any navigation closes the mobile drawer so it never lingers over a new page.
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe(() => (this.mobileNavOpen = false));
  }

  onSidebarToggled(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }
}
