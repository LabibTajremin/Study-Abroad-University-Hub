import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UniversityService } from '../../services/university';
import { JsonExportService } from '../../services/json-export';
import { CountryConfigService } from '../../services/country-config';
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

  countries: Country[] = [];
  selectedSlug = '';
  universities: University[] = [];
  loading = false;
  dirty = false;

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
    if (!confirm(`Remove "${u.name}" from this list? This only affects the exported file, not the live site.`)) {
      return;
    }
    this.universities = this.universities.filter((x) => x.id !== u.id);
    this.dirty = true;
  }

  exportJson(): void {
    this.jsonExport.download(`${this.selectedSlug}-universities.json`, this.universities);
    this.dirty = false;
  }
}
