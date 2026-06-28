import { Component, EventEmitter, OnInit, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CountryConfigService, CountriesConfig } from '../../services/country-config';
import { AdminApiService } from '../../services/admin-api';
import { Country } from '../../models/country.model';

interface CountryRow {
  country: Country;
  groupSlug: string;
  groupLabel: string;
}

const NEW_GROUP_VALUE = '__new__';

@Component({
  selector: 'app-admin-add-country-tab',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule, MatTooltipModule],
  templateUrl: './admin-add-country-tab.html',
  styleUrl: './admin-add-country-tab.scss',
})
export class AdminAddCountryTab implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly countryConfig = inject(CountryConfigService);
  private readonly adminApi = inject(AdminApiService);

  @Output() sessionExpired = new EventEmitter<void>();

  private config: CountriesConfig | null = null;
  rows: CountryRow[] = [];
  groupOptions: { slug: string; label: string }[] = [];
  loading = true;

  showForm = false;
  isAddingNew = false;
  /** The slug + group this row originally belonged to, so we know what to remove if the slug or group changes. */
  private editingOriginal: { slug: string; groupSlug: string } | null = null;

  saving = false;
  saveError = '';
  saveSuccess = '';

  readonly NEW_GROUP_VALUE = NEW_GROUP_VALUE;

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    iso2: ['', Validators.required],
    targetGroupSlug: ['', Validators.required],
    newGroupLabel: [''],
    newGroupIcon: ['🌍'],
    accentColor: ['#3B82F6', Validators.required],
  });

  ngOnInit(): void {
    this.loadConfig();
  }

  private loadConfig(): void {
    this.loading = true;
    this.countryConfig.getRawConfig$().subscribe((config) => {
      // Work on a deep copy so in-progress edits don't mutate the shared cached config.
      this.config = JSON.parse(JSON.stringify(config));
      this.rebuildRows();
      this.loading = false;
    });
  }

  private rebuildRows(): void {
    if (!this.config) return;
    this.groupOptions = this.config.regionGroups.map((g) => ({ slug: g.slug, label: g.label }));
    this.rows = this.config.regionGroups.flatMap((g) =>
      g.countries.map((c) => ({ country: c, groupSlug: g.slug, groupLabel: g.label }))
    );
    if (!this.form.get('targetGroupSlug')?.value && this.groupOptions.length) {
      this.form.get('targetGroupSlug')?.setValue(this.groupOptions[0].slug);
    }
  }

  onNameChange(name: string): void {
    if (!this.isAddingNew) return;
    const auto = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    this.form.get('slug')?.setValue(auto, { emitEvent: false });
  }

  addNew(): void {
    this.isAddingNew = true;
    this.editingOriginal = null;
    this.form.reset({
      name: '',
      slug: '',
      iso2: '',
      targetGroupSlug: this.groupOptions[0]?.slug ?? '',
      newGroupLabel: '',
      newGroupIcon: '🌍',
      accentColor: '#3B82F6',
    });
    this.showForm = true;
  }

  edit(row: CountryRow): void {
    this.isAddingNew = false;
    this.editingOriginal = { slug: row.country.slug, groupSlug: row.groupSlug };
    this.form.reset({
      name: row.country.name,
      slug: row.country.slug,
      iso2: row.country.iso2,
      targetGroupSlug: row.groupSlug,
      newGroupLabel: '',
      newGroupIcon: '🌍',
      accentColor: this.config?.countryThemes[row.country.slug] ?? '#3B82F6',
    });
    this.showForm = true;
  }

  cancelForm(): void {
    this.showForm = false;
    this.editingOriginal = null;
  }

  private ensureTargetGroup(slug: string): string {
    if (!this.config) return slug;
    if (slug !== NEW_GROUP_VALUE) return slug;

    const label = this.form.get('newGroupLabel')?.value || 'New Region';
    const icon = this.form.get('newGroupIcon')?.value || '🌍';
    const groupSlug = label
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');

    this.config.regionGroups.push({ slug: groupSlug, label, icon, countries: [] });
    this.config.sidebarTree.push({ groupSlug });
    return groupSlug;
  }

  submitForm(): void {
    if (this.form.invalid || !this.config) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, slug, iso2, accentColor } = this.form.getRawValue();
    const targetGroupSlug = this.ensureTargetGroup(this.form.get('targetGroupSlug')?.value);
    const newCountry: Country = { name, slug, iso2, flag: '', isActive: true };

    // Remove from the old location first (covers both edit-in-place and edit-with-group-change).
    if (this.editingOriginal) {
      const oldGroup = this.config.regionGroups.find((g) => g.slug === this.editingOriginal!.groupSlug);
      if (oldGroup) {
        oldGroup.countries = oldGroup.countries.filter((c) => c.slug !== this.editingOriginal!.slug);
      }
    }

    const targetGroup = this.config.regionGroups.find((g) => g.slug === targetGroupSlug);
    targetGroup?.countries.push(newCountry);
    this.config.countryThemes[slug] = accentColor;

    this.persist(this.isAddingNew ? { createDataFile: slug } : undefined);
  }

  delete(row: CountryRow): void {
    if (!this.config) return;
    if (!confirm(`Delete "${row.country.name}"? This removes it from the site and deletes its university data file.`)) {
      return;
    }

    const group = this.config.regionGroups.find((g) => g.slug === row.groupSlug);
    if (group) {
      group.countries = group.countries.filter((c) => c.slug !== row.country.slug);
    }
    delete this.config.countryThemes[row.country.slug];

    this.persist({ deleteDataFile: row.country.slug });
  }

  private persist(extra?: { createDataFile?: string; deleteDataFile?: string }): void {
    if (!this.config) return;
    this.saving = true;
    this.saveError = '';
    this.saveSuccess = '';

    this.adminApi.saveCountryConfig(this.config).subscribe({
      next: () => {
        if (extra?.createDataFile) {
          this.adminApi.saveUniversities(extra.createDataFile, []).subscribe();
        }
        if (extra?.deleteDataFile) {
          this.adminApi.deleteUniversitiesFile(extra.deleteDataFile).subscribe();
        }
        this.saving = false;
        this.showForm = false;
        this.rebuildRows();
        this.saveSuccess = 'Saved — Vercel is redeploying, changes will be live in about a minute.';
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
}
