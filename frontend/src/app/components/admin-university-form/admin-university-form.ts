import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { University } from '../../models/university.model';

const EMPTY_UNIVERSITY: Omit<University, 'id'> = {
  name: '',
  localName: '',
  country: '',
  city: '',
  state: '',
  type: 'Public',
  category: '',
  degreeTypes: ['Bachelor'],
  ranking: null,
  bachelorTuitionEUR: 0,
  bachelorTuitionBDT: 0,
  masterTuitionEUR: 0,
  masterTuitionBDT: 0,
  semesterbeitrag: 0,
  isTuitionFree: false,
  costCategory: 'Medium',
  tuitionNote: '',
  bachelorRequirements: '',
  masterRequirements: '',
  websiteUrl: '',
};

@Component({
  selector: 'app-admin-university-form',
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './admin-university-form.html',
  styleUrl: './admin-university-form.scss',
})
export class AdminUniversityForm implements OnChanges {
  /** Pass an existing record to edit it; omit (or pass null) to add a new one. */
  @Input() university: University | null = null;
  @Input() countryName = '';
  @Output() saved = new EventEmitter<University>();
  @Output() cancelled = new EventEmitter<void>();

  form: FormGroup;

  constructor(private readonly fb: FormBuilder) {
    this.form = this.buildForm(null);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['university'] || changes['countryName']) {
      this.form = this.buildForm(this.university);
    }
  }

  private buildForm(u: University | null): FormGroup {
    const base = u ?? { id: 0, ...EMPTY_UNIVERSITY, country: this.countryName };
    return this.fb.group({
      id: [base.id],
      name: [base.name, Validators.required],
      localName: [base.localName],
      country: [base.country || this.countryName, Validators.required],
      city: [base.city, Validators.required],
      state: [base.state],
      type: [base.type, Validators.required],
      category: [base.category],
      degreeTypes: [base.degreeTypes.join(', ')],
      ranking: [base.ranking],

      bachelorTuitionEUR: [base.bachelorTuitionEUR, Validators.required],
      bachelorTuitionBDT: [base.bachelorTuitionBDT, Validators.required],
      masterTuitionEUR: [base.masterTuitionEUR, Validators.required],
      masterTuitionBDT: [base.masterTuitionBDT, Validators.required],
      semesterbeitrag: [base.semesterbeitrag],
      isTuitionFree: [base.isTuitionFree],
      costCategory: [base.costCategory, Validators.required],
      tuitionNote: [base.tuitionNote],

      bachelorRequirements: [base.bachelorRequirements],
      masterRequirements: [base.masterRequirements],
      websiteUrl: [base.websiteUrl],

      // Phase 1 optional fields
      livingCostUSD: [base.livingCostUSD ?? null],
      totalCostUSD: [base.totalCostUSD ?? null],
      gpaRequirement: [base.gpaRequirement ?? null],
      ieltsRequirement: [base.ieltsRequirement ?? null],
      englishMediumAllowed: [base.englishMediumAllowed ?? false],
      studyGapAllowed: [base.studyGapAllowed ?? ''],
      admissionDifficulty: [base.admissionDifficulty ?? ''],
      intakeSessions: [(base.intakeSessions ?? []).join(', ')],
      applicationDeadline: [base.applicationDeadline ?? ''],
      scholarshipAvailable: [base.scholarshipAvailable ?? false],
      scholarshipDetails: [base.scholarshipDetails ?? ''],
      applicationUrl: [base.applicationUrl ?? ''],
    });
  }

  bdtFromEur(eurControlName: string, bdtControlName: string): void {
    const eur = Number(this.form.get(eurControlName)?.value) || 0;
    this.form.get(bdtControlName)?.setValue(Math.round(eur * 128));
  }

  onSave(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const studyGap = raw.studyGapAllowed === '' ? undefined : raw.studyGapAllowed === 'conditional' ? 'conditional' : raw.studyGapAllowed === 'true';

    const result: University = {
      id: raw.id,
      name: raw.name,
      localName: raw.localName || raw.name,
      country: raw.country,
      city: raw.city,
      state: raw.state,
      type: raw.type,
      category: raw.category,
      degreeTypes: String(raw.degreeTypes).split(',').map((s: string) => s.trim()).filter(Boolean),
      ranking: raw.ranking === '' || raw.ranking === null ? null : Number(raw.ranking),
      bachelorTuitionEUR: Number(raw.bachelorTuitionEUR),
      bachelorTuitionBDT: Number(raw.bachelorTuitionBDT),
      masterTuitionEUR: Number(raw.masterTuitionEUR),
      masterTuitionBDT: Number(raw.masterTuitionBDT),
      semesterbeitrag: Number(raw.semesterbeitrag) || 0,
      isTuitionFree: !!raw.isTuitionFree,
      costCategory: raw.costCategory,
      tuitionNote: raw.tuitionNote,
      bachelorRequirements: raw.bachelorRequirements,
      masterRequirements: raw.masterRequirements,
      websiteUrl: raw.websiteUrl,
      ...(raw.livingCostUSD !== null && raw.livingCostUSD !== '' ? { livingCostUSD: Number(raw.livingCostUSD) } : {}),
      ...(raw.totalCostUSD !== null && raw.totalCostUSD !== '' ? { totalCostUSD: Number(raw.totalCostUSD) } : {}),
      ...(raw.gpaRequirement !== null && raw.gpaRequirement !== '' ? { gpaRequirement: Number(raw.gpaRequirement) } : {}),
      ...(raw.ieltsRequirement !== null && raw.ieltsRequirement !== '' ? { ieltsRequirement: Number(raw.ieltsRequirement) } : {}),
      ...(raw.englishMediumAllowed ? { englishMediumAllowed: true } : {}),
      ...(studyGap !== undefined ? { studyGapAllowed: studyGap } : {}),
      ...(raw.admissionDifficulty ? { admissionDifficulty: raw.admissionDifficulty } : {}),
      ...(raw.intakeSessions ? { intakeSessions: String(raw.intakeSessions).split(',').map((s: string) => s.trim()).filter(Boolean) } : {}),
      ...(raw.applicationDeadline ? { applicationDeadline: raw.applicationDeadline } : {}),
      ...(raw.scholarshipAvailable ? { scholarshipAvailable: true } : {}),
      ...(raw.scholarshipDetails ? { scholarshipDetails: raw.scholarshipDetails } : {}),
      ...(raw.applicationUrl ? { applicationUrl: raw.applicationUrl } : {}),
    };

    this.saved.emit(result);
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
