import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminUniversitiesTab } from '../../components/admin-universities-tab/admin-universities-tab';
import { AdminAddCountryTab } from '../../components/admin-add-country-tab/admin-add-country-tab';
import { AdminApiService } from '../../services/admin-api';

type AdminTab = 'universities' | 'add-country';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule, MatIconModule, AdminUniversitiesTab, AdminAddCountryTab],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage {
  private readonly adminApi = inject(AdminApiService);

  authed = this.adminApi.isLoggedIn;
  username = '';
  password = '';
  loginError = '';
  loggingIn = false;

  activeTab: AdminTab = 'universities';

  submitLogin(): void {
    if (!this.username || !this.password) {
      this.loginError = 'Enter a username and password';
      return;
    }
    this.loggingIn = true;
    this.loginError = '';

    this.adminApi.login(this.username, this.password).subscribe({
      next: () => {
        this.authed = true;
        this.loggingIn = false;
      },
      error: (err) => {
        this.loggingIn = false;
        this.loginError = err?.error?.error || 'Login failed — check your credentials.';
      },
    });
  }

  logout(): void {
    this.adminApi.logout();
    this.authed = false;
    this.username = '';
    this.password = '';
  }

  /** Called by child tabs when a save/delete call comes back 401 (token expired/invalid). */
  onSessionExpired(): void {
    this.adminApi.logout();
    this.authed = false;
    this.loginError = 'Your session expired — please log in again.';
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
  }
}
