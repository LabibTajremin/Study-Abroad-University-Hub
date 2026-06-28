import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UniversityService } from '../../services/university';
import { JsonExportService } from '../../services/json-export';
import { CountryConfigService } from '../../services/country-config';
import { AdminApiService } from '../../services/admin-api';
import { UniversityImportExportService } from '../../services/university-import-export';
import { Country } from '../../models/country.model';
import { University } from '../../models/university.model';
import { AdminUniversityForm } from '../admin-university-form/admin-university-form';

@Component({
  selector: 'app-admin-universities-tab',
  imports: [CommonModule, FormsModule, MatIconModule, MatTooltipModule, AdminUniversityForm],
  templateUrl: './admin-universities-tab.html',
  styleUrl: './admin-universities-tab.scss',
})
export class AdminUniversitiesTab implements OnInit {
  private readonly universityService = inject(UniversityService);
  private readonly jsonExport = inject(JsonExportService);
  private readonly countryConfig = inject(CountryConfigService);
  private readonly adminApi = inject(AdminApiService);
  private readonly importExport = inject(UniversityImportExportService);

  @Output() sessionExpired = new EventEmitter<void>();

  countries: Country[] = [];
  selectedSlug = '';
  universities: University[] = [];
  loading = false;
  dirty = false;

  saving = false;
  saveError = '';
  saveSuccess = '';

  importError = '';
  importing = false;

  showForm = false;
  isAddingNew = false;
  editingUniversity: University | null = null;

  ngOnInit(): void {
    this.countryConfig.allCountries$.subscribe((countries) => {
      this.countries = countries;
      if (countries.length && !this.selectedSlug) {
        this.selectedSlug = countries[0].slug;
        this.onCountryChange();
      }
    });
  }

  get selectedCountryName(): string {
    return this.countries.find((c) => c.slug === this.selectedSlug)?.name ?? '';
  }

  onCountryChange(): void {
    if (!this.selectedSlug) return;
    this.loading = true;
    this.dirty = false;
    this.showForm = false;
    this.saveError = '';
    this.saveSuccess = '';
    this.universityService.clearCache(this.selectedSlug);
    this.universityService.fetchUniversities(this.selectedSlug).subscribe((data) => {
      this.universities = data.map((u) => ({ ...u }));
      this.loading = false;
    });
  }

  addNew(): void {
    this.isAddingNew = true;
    this.editingUniversity = null;
    this.showForm = true;
  }

  edit(u: University): void {
    this.isAddingNew = false;
    this.editingUniversity = u;
    this.showForm = true;
  }

  onSaved(result: University): void {
    if (this.isAddingNew) {
      const nextId = this.universities.reduce((max, u) => Math.max(max, u.id), 0) + 1;
      this.universities.push({ ...result, id: nextId });
    } else {
      const idx = this.universities.findIndex((u) => u.id === result.id);
      if (idx !== -1) {
        this.universities[idx] = result;
      }
    }
    this.dirty = true;
    this.showForm = false;
    this.editingUniversity = null;
  }

  onCancelForm(): void {
    this.showForm = false;
    this.editingUniversity = null;
  }

  delete(u: University): void {
    if (!confirm(`Remove "${u.name}"? This stages a removal — click Save to commit it.`)) {
      return;
    }
    this.universities = this.universities.filter((x) => x.id !== u.id);
    this.dirty = true;
  }

  /** Replaces the whole working list — used after a validated JSON/Excel upload. */
  replaceAll(universities: University[]): void {
    this.universities = universities;
    this.dirty = true;
    this.showForm = false;
  }

  save(): void {
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = '';

    this.adminApi.saveUniversities(this.selectedSlug, this.universities).subscribe({
      next: () => {
        this.saving = false;
        this.dirty = false;
        this.saveSuccess = 'Saved — Vercel is redeploying, changes will be live in about a minute.';
        this.universityService.clearCache(this.selectedSlug);
      },
      error: (err) => {
        this.saving = false;
        if (err?.status === 401) {
          this.sessionExpired.emit();
          return;
        }
        this.saveError = err?.error?.error || 'Failed to save — please try again.';
      },
    });
  }

  downloadBackup(): void {
    this.jsonExport.download(`${this.selectedSlug}-universities.json`, this.universities);
  }

  downloadExcelTemplate(): void {
    this.importExport.downloadTemplate(this.selectedSlug);
  }

  async onExcelFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.importError = '';
    this.importing = true;
    const result = await this.importExport.parseExcelFile(file);
    this.importing = false;

    if ('error' in result) {
      this.importError = result.error;
      return;
    }
    this.confirmReplaceFromImport(result.universities, file.name);
  }

  async onJsonFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.importError = '';
    this.importing = true;
    const result = await this.importExport.parseJsonFile(file);
    this.importing = false;

    if ('error' in result) {
      this.importError = result.error;
      return;
    }
    this.confirmReplaceFromImport(result.universities, file.name);
  }

  private confirmReplaceFromImport(universities: University[], fileName: string): void {
    const ok = confirm(
      `"${fileName}" contains ${universities.length} record(s). This will replace the current working list ` +
      `for ${this.selectedCountryName} (${this.universities.length} record(s)). Click Save afterward to commit. Continue?`
    );
    if (!ok) return;
    this.replaceAll(universities);
  }
}
