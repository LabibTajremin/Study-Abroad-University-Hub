import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import {
  CountriesConfig,
  CountryConfigService,
  DEFAULT_SITE_SETTINGS,
} from '../../services/country-config';
import { AdminApiService } from '../../services/admin-api';

@Component({
  selector: 'app-admin-site-settings-tab',
  imports: [CommonModule, FormsModule, MatIconModule],
  templateUrl: './admin-site-settings-tab.html',
  styleUrl: './admin-site-settings-tab.scss',
})
export class AdminSiteSettingsTab implements OnInit {
  /** Bubbles up a 401 so the parent can force a re-login. */
  @Output() sessionExpired = new EventEmitter<void>();

  private readonly countryConfig = inject(CountryConfigService);
  private readonly adminApi = inject(AdminApiService);

  private config: CountriesConfig | null = null;

  showFooterMenu = DEFAULT_SITE_SETTINGS.showFooterMenu;
  loading = true;
  saving = false;
  savedOk = false;
  error = '';

  ngOnInit(): void {
    this.countryConfig.getRawConfig$().subscribe((config) => {
      // Clone so edits here never mutate the shared cached config.
      this.config = JSON.parse(JSON.stringify(config)) as CountriesConfig;
      this.showFooterMenu = this.config.siteSettings?.showFooterMenu ?? DEFAULT_SITE_SETTINGS.showFooterMenu;
      this.loading = false;
    });
  }

  save(): void {
    if (!this.config) return;
    this.saving = true;
    this.savedOk = false;
    this.error = '';

    this.config.siteSettings = { ...DEFAULT_SITE_SETTINGS, ...this.config.siteSettings, showFooterMenu: this.showFooterMenu };

    this.adminApi.saveCountryConfig(this.config).subscribe({
      next: () => {
        this.saving = false;
        this.savedOk = true;
      },
      error: (err) => {
        this.saving = false;
        if (err?.status === 401) {
          this.sessionExpired.emit();
          return;
        }
        this.error = err?.error?.error || 'Failed to save settings.';
      },
    });
  }
}
