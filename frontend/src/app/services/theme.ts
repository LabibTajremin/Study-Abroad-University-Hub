import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'sauh-theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSubject = new BehaviorSubject<ThemeMode>(this.resolveInitialTheme());
  readonly theme$ = this.themeSubject.asObservable();

  constructor() {
    this.applyTheme(this.themeSubject.value);
  }

  get current(): ThemeMode {
    return this.themeSubject.value;
  }

  toggle(): void {
    this.setTheme(this.current === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: ThemeMode): void {
    this.themeSubject.next(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.applyTheme(theme);
  }

  private resolveInitialTheme(): ThemeMode {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  private applyTheme(theme: ThemeMode): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
  }
}
