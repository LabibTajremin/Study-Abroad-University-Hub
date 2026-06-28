import { Injectable } from '@angular/core';
import * as XLSX from 'xlsx';
import { University } from '../models/university.model';

/**
 * Canonical column schema for Excel import/export — the exact header row the
 * template download produces, and the exact header row an uploaded file must
 * match (by name, any order) or it's rejected outright rather than partially
 * parsed.
 */
export const UNIVERSITY_COLUMNS: { key: string; header: string }[] = [
  { key: 'id', header: 'Id' },
  { key: 'name', header: 'Name' },
  { key: 'localName', header: 'LocalName' },
  { key: 'country', header: 'Country' },
  { key: 'city', header: 'City' },
  { key: 'state', header: 'Area' },
  { key: 'type', header: 'Type' },
  { key: 'category', header: 'Category' },
  { key: 'degreeTypes', header: 'DegreeTypes' },
  { key: 'ranking', header: 'Ranking' },
  { key: 'bachelorTuitionEUR', header: 'BachelorTuitionEUR' },
  { key: 'bachelorTuitionBDT', header: 'BachelorTuitionBDT' },
  { key: 'masterTuitionEUR', header: 'MasterTuitionEUR' },
  { key: 'masterTuitionBDT', header: 'MasterTuitionBDT' },
  { key: 'semesterbeitrag', header: 'Semesterbeitrag' },
  { key: 'isTuitionFree', header: 'IsTuitionFree' },
  { key: 'costCategory', header: 'CostCategory' },
  { key: 'tuitionNote', header: 'TuitionNote' },
  { key: 'bachelorRequirements', header: 'BachelorRequirements' },
  { key: 'masterRequirements', header: 'MasterRequirements' },
  { key: 'websiteUrl', header: 'WebsiteUrl' },
  { key: 'livingCostUSD', header: 'LivingCostUSD' },
  { key: 'totalCostUSD', header: 'TotalCostUSD' },
  { key: 'gpaRequirement', header: 'GpaRequirement' },
  { key: 'ieltsRequirement', header: 'IeltsRequirement' },
  { key: 'englishMediumAllowed', header: 'EnglishMediumAllowed' },
  { key: 'studyGapAllowed', header: 'StudyGapAllowed' },
  { key: 'admissionDifficulty', header: 'AdmissionDifficulty' },
  { key: 'intakeSessions', header: 'IntakeSessions' },
  { key: 'applicationDeadline', header: 'ApplicationDeadline' },
  { key: 'scholarshipAvailable', header: 'ScholarshipAvailable' },
  { key: 'scholarshipDetails', header: 'ScholarshipDetails' },
  { key: 'applicationUrl', header: 'ApplicationUrl' },
];

const REQUIRED_HEADERS = UNIVERSITY_COLUMNS.map((c) => c.header);
const BOOLEAN_HEADERS = new Set(['IsTuitionFree', 'EnglishMediumAllowed', 'ScholarshipAvailable']);
const NUMBER_HEADERS = new Set([
  'Id', 'Ranking', 'BachelorTuitionEUR', 'BachelorTuitionBDT', 'MasterTuitionEUR',
  'MasterTuitionBDT', 'Semesterbeitrag', 'LivingCostUSD', 'TotalCostUSD', 'GpaRequirement', 'IeltsRequirement',
]);
const ARRAY_HEADERS = new Set(['DegreeTypes', 'IntakeSessions']);

export type ImportResult = { universities: University[] } | { error: string };

@Injectable({ providedIn: 'root' })
export class UniversityImportExportService {
  /** Downloads a blank .xlsx with exactly the expected header row, for the given country (optional — informational only). */
  downloadTemplate(countrySlug = 'country'): void {
    const ws = XLSX.utils.aoa_to_sheet([REQUIRED_HEADERS]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Universities');
    XLSX.writeFile(wb, `${countrySlug}-universities-template.xlsx`);
  }

  async parseExcelFile(file: File): Promise<ImportResult> {
    let rows: unknown[][];
    try {
      const buffer = await file.arrayBuffer();
      const wb = XLSX.read(buffer, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
    } catch {
      return { error: 'Could not read this file as an Excel spreadsheet. Make sure it is a valid .xlsx file.' };
    }

    if (rows.length === 0) {
      return { error: 'The spreadsheet is empty.' };
    }

    const headerRow = (rows[0] as unknown[]).map((h) => String(h).trim());
    const headerError = this.validateHeaders(headerRow);
    if (headerError) return { error: headerError };

    const dataRows = rows.slice(1).filter((r) => r.some((cell) => String(cell ?? '').trim() !== ''));
    return this.rowsToUniversities(headerRow, dataRows);
  }

  async parseJsonFile(file: File): Promise<ImportResult> {
    let text: string;
    try {
      text = await file.text();
    } catch {
      return { error: 'Could not read this file.' };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      return { error: 'This file is not valid JSON.' };
    }

    if (!Array.isArray(parsed)) {
      return { error: 'The JSON file must contain an array of university records.' };
    }

    const required: (keyof University)[] = ['name', 'city', 'type', 'bachelorTuitionEUR', 'masterTuitionEUR'];
    for (let i = 0; i < parsed.length; i++) {
      const rec = parsed[i];
      if (typeof rec !== 'object' || rec === null) {
        return { error: `Record ${i + 1} is not an object.` };
      }
      for (const field of required) {
        if (!(field in rec)) {
          return { error: `Record ${i + 1} (${(rec as Record<string, unknown>)['name'] ?? 'unnamed'}) is missing required field "${field}".` };
        }
      }
    }

    return { universities: parsed as University[] };
  }

  /** Exact-match validation: every expected header must be present, with no unexpected extras — anything else is rejected, not partially parsed. */
  private validateHeaders(headerRow: string[]): string | null {
    const present = new Set(headerRow);
    const missing = REQUIRED_HEADERS.filter((h) => !present.has(h));
    const expected = new Set(REQUIRED_HEADERS);
    const unexpected = headerRow.filter((h) => h && !expected.has(h));

    if (missing.length > 0 || unexpected.length > 0) {
      const parts: string[] = [];
      if (missing.length) parts.push(`missing column(s): ${missing.join(', ')}`);
      if (unexpected.length) parts.push(`unexpected column(s): ${unexpected.join(', ')}`);
      return `This file doesn't match the required template (${parts.join('; ')}). Download the template and use it as-is — don't rename, reorder, add, or remove columns.`;
    }
    return null;
  }

  private rowsToUniversities(headerRow: string[], dataRows: unknown[][]): ImportResult {
    const colIndex = new Map(headerRow.map((h, i) => [h, i]));
    const universities: University[] = [];

    for (let r = 0; r < dataRows.length; r++) {
      const row = dataRows[r];
      const rec: Record<string, unknown> = {};

      for (const { key, header } of UNIVERSITY_COLUMNS) {
        const idx = colIndex.get(header)!;
        const raw = row[idx];
        const value = typeof raw === 'string' ? raw.trim() : raw;

        if (value === '' || value === undefined || value === null) {
          continue; // leave optional fields unset; required-field gaps are caught below
        }

        if (BOOLEAN_HEADERS.has(header)) {
          rec[key] = value === true || String(value).toLowerCase() === 'true';
        } else if (NUMBER_HEADERS.has(header)) {
          const num = Number(value);
          if (Number.isNaN(num)) {
            return { error: `Row ${r + 2}: "${header}" must be a number (got "${value}").` };
          }
          rec[key] = num;
        } else if (ARRAY_HEADERS.has(header)) {
          rec[key] = String(value).split(',').map((s) => s.trim()).filter(Boolean);
        } else {
          rec[key] = value;
        }
      }

      if (!rec['name'] || !rec['city'] || !rec['type']) {
        return { error: `Row ${r + 2}: Name, City and Type are required.` };
      }
      if (rec['isTuitionFree'] !== true && (rec['bachelorTuitionEUR'] == null || rec['masterTuitionEUR'] == null)) {
        return { error: `Row ${r + 2} (${rec['name']}): BachelorTuitionEUR and MasterTuitionEUR are required unless IsTuitionFree is true.` };
      }

      rec['localName'] = rec['localName'] || rec['name'];
      rec['degreeTypes'] = rec['degreeTypes'] || ['Bachelor'];
      rec['ranking'] = rec['ranking'] ?? null;
      rec['bachelorTuitionEUR'] = rec['bachelorTuitionEUR'] ?? 0;
      rec['bachelorTuitionBDT'] = rec['bachelorTuitionBDT'] ?? 0;
      rec['masterTuitionEUR'] = rec['masterTuitionEUR'] ?? 0;
      rec['masterTuitionBDT'] = rec['masterTuitionBDT'] ?? 0;
      rec['semesterbeitrag'] = rec['semesterbeitrag'] ?? 0;
      rec['isTuitionFree'] = rec['isTuitionFree'] ?? false;
      rec['costCategory'] = rec['costCategory'] || 'Medium';
      rec['tuitionNote'] = rec['tuitionNote'] || '';
      rec['bachelorRequirements'] = rec['bachelorRequirements'] || '';
      rec['masterRequirements'] = rec['masterRequirements'] || '';
      rec['websiteUrl'] = rec['websiteUrl'] || '';

      universities.push(rec as unknown as University);
    }

    // Re-number ids sequentially so an uploaded sheet with blank/duplicate Id cells still gets a clean, unique set.
    universities.forEach((u, i) => (u.id = i + 1));

    return { universities };
  }
}
