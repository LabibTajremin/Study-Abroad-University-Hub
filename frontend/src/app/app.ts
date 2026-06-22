import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './components/header/header';
import { Sidebar } from './components/sidebar/sidebar';
import { ThemeService } from './services/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Sidebar],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  // Injecting ThemeService here ensures the saved/system theme is applied as early as possible on bootstrap.
  private readonly themeService = inject(ThemeService);

  sidebarCollapsed = false;

  onSidebarToggled(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}
