import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { CountryConfigService } from '../../services/country-config';
import { JsonExportService } from '../../services/json-export';

@Component({
  selector: 'app-admin-add-country-tab',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './admin-add-country-tab.html',
  styleUrl: './admin-add-country-tab.scss',
})
export class AdminAddCountryTab implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly jsonExport = inject(JsonExportService);
  private readonly countryConfig = inject(CountryConfigService);

  existingGroups: { slug: string; label: string }[] = [];

  form: FormGroup = this.fb.group({
    name: ['', Validators.required],
    slug: ['', Validators.required],
    iso2: ['', Validators.required],
    targetGroupSlug: ['', Validators.required],
    accentColor: ['#3B82F6', Validators.required],
  });

  ngOnInit(): void {
    this.countryConfig.regionGroups$.subscribe((groups) => {
      this.existingGroups = groups.map((g) => ({ slug: g.slug, label: g.label }));
      if (this.existingGroups.length) {
        this.form.get('targetGroupSlug')?.setValue(this.existingGroups[0].slug);
      }
    });
  }

  snippet = '';

  onNameChange(name: string): void {
    const auto = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-');
    this.form.get('slug')?.setValue(auto, { emitEvent: false });
  }

  generate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, slug, iso2, targetGroupSlug, accentColor } = this.form.getRawValue();
    const groupLabel = this.existingGroups.find((g) => g.slug === targetGroupSlug)?.label ?? targetGroupSlug;

    this.snippet = `// 1) Add to the matching *_COUNTRIES array in country.model.ts (the array used by the "${groupLabel}" group):
{ name: '${name}', slug: '${slug}', flag: '', iso2: '${iso2}', isActive: true },

// 2) Add an accent color to COUNTRY_THEMES in country.model.ts:
${slug}: '${accentColor}',

// 3) Add a route in app.routes.ts (alongside the other countries in "${groupLabel}"):
{ path: 'country/${slug}', component: CountryPage },

// 4) Add a data-file mapping in services/university.ts's countryDataUrls:
${slug}: 'data/${slug}-universities.json',

// 5) After pasting the above, rebuild + redeploy. The country will then appear
//    in the "Manage Universities" tab here, where you can add its universities.`;
  }

  downloadStarterFile(): void {
    const slug = this.form.get('slug')?.value || 'new-country';
    this.jsonExport.download(`${slug}-universities.json`, []);
  }

  copySnippet(): void {
    navigator.clipboard?.writeText(this.snippet);
  }
}
