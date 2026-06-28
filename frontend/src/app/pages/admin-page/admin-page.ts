import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { AdminUniversitiesTab } from '../../components/admin-universities-tab/admin-universities-tab';
import { AdminAddCountryTab } from '../../components/admin-add-country-tab/admin-add-country-tab';

/**
 * NOTE ON SECURITY: this app has no backend, so this is a soft friction
 * gate only — anyone who reads the bundled JS can see this password. It
 * keeps the page out of casual reach, it does NOT protect against a
 * determined visitor. Don't rely on it to guard anything sensitive.
 */
const ADMIN_PASSWORD = 'sauh-admin-2026';
const SESSION_KEY = 'sauh-admin-authed';

type AdminTab = 'universities' | 'add-country';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule, MatIconModule, AdminUniversitiesTab, AdminAddCountryTab],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage {
  authed = sessionStorage.getItem(SESSION_KEY) === 'true';
  passwordInput = '';
  passwordError = false;

  activeTab: AdminTab = 'universities';

  submitPassword(): void {
    if (this.passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      this.authed = true;
      this.passwordError = false;
    } else {
      this.passwordError = true;
    }
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this.authed = false;
    this.passwordInput = '';
  }

  setTab(tab: AdminTab): void {
    this.activeTab = tab;
  }
}
