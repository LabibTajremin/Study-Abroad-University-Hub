import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UniversityRecommendation } from '../../models/university.model';
import { REGION_GROUPS } from '../../models/country.model';
import { FlagIcon } from '../flag-icon/flag-icon';

@Component({
  selector: 'app-recommendation-card',
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule, FlagIcon],
  templateUrl: './recommendation-card.html',
  styleUrl: './recommendation-card.scss',
})
export class RecommendationCard {
  @Input() recommendation!: UniversityRecommendation;
  @Input() rank = 1;

  private readonly iso2Map = Object.fromEntries(
    REGION_GROUPS.flatMap((g) => g.countries.map((c) => [c.slug, c.iso2]))
  );

  get flagIso2(): string {
    return this.iso2Map[this.recommendation.countrySlug] ?? '';
  }

  get difficultyLabel(): string {
    const map: Record<string, string> = {
      easy: 'Easy',
      moderate: 'Moderate',
      competitive: 'Competitive',
      highly_competitive: 'Highly Competitive',
    };
    return map[this.recommendation.university.admissionDifficulty ?? ''] ?? 'N/A';
  }

  get difficultyClass(): string {
    const map: Record<string, string> = {
      easy: 'diff-easy',
      moderate: 'diff-moderate',
      competitive: 'diff-competitive',
      highly_competitive: 'diff-high',
    };
    return map[this.recommendation.university.admissionDifficulty ?? ''] ?? '';
  }

  formatCost(usd: number | undefined): string {
    if (usd == null) return 'N/A';
    return '$' + usd.toLocaleString() + '/yr';
  }
}
