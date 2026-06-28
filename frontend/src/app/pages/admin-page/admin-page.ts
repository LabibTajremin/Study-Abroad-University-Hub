import { Component, HostListener, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AdminUniversitiesTab } from '../../components/admin-universities-tab/admin-universities-tab';
import { AdminAddCountryTab } from '../../components/admin-add-country-tab/admin-add-country-tab';
import { AdminApiService } from '../../services/admin-api';

type AdminTab = 'universities' | 'add-country';

@Component({
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, AdminUniversitiesTab, AdminAddCountryTab],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.scss',
})
export class AdminPage {
  private readonly adminApi = inject(AdminApiService);

  @ViewChild(AdminUniversitiesTab) universitiesTabRef?: AdminUniversitiesTab;

  authed = this.adminApi.isLoggedIn;
  username = '';
  password = '';
  loginError = '';
  loggingIn = false;

  activeTab: AdminTab = 'universities';

  /** True while Manage Universities has staged-but-unsaved changes. */
  isDirty = false;

  /** Shown instead of switching tabs / logging out while isDirty — offers Save/Discard/Cancel. */
  showUnsavedModal = false;
  private pendingTabTarget: AdminTab | null = null;
  private pendingLogout = false;
  savingFromModal = false;

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

  requestLogout(): void {
    if (this.isDirty) {
      this.pendingLogout = true;
      this.pendingTabTarget = null;
      this.showUnsavedModal = true;
      return;
    }
    this.doLogout();
  }

  private doLogout(): void {
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

  onUniversitiesDirtyChanged(dirty: boolean): void {
    this.isDirty = dirty;
  }

  setTab(tab: AdminTab): void {
    if (tab === this.activeTab) return;
    if (this.isDirty) {
      this.pendingTabTarget = tab;
      this.pendingLogout = false;
      this.showUnsavedModal = true;
      return;
    }
    this.activeTab = tab;
  }

  modalSaveAndContinue(): void {
    this.savingFromModal = true;
    this.universitiesTabRef?.performSave().subscribe((ok) => {
      this.savingFromModal = false;
      if (ok) this.proceedPendingAction();
    });
  }

  modalDiscardAndContinue(): void {
    this.universitiesTabRef?.discardChanges();
    this.proceedPendingAction();
  }

  modalCancel(): void {
    this.showUnsavedModal = false;
    this.pendingTabTarget = null;
    this.pendingLogout = false;
  }

  private proceedPendingAction(): void {
    this.showUnsavedModal = false;
    if (this.pendingTabTarget) {
      this.activeTab = this.pendingTabTarget;
    } else if (this.pendingLogout) {
      this.doLogout();
    }
    this.pendingTabTarget = null;
    this.pendingLogout = false;
  }

  /** Used by the CanDeactivate route guard when navigating away from /admin entirely. */
  hasUnsavedChanges(): boolean {
    return this.isDirty;
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.isDirty) {
      event.preventDefault();
      event.returnValue = true;
    }
  }
}
