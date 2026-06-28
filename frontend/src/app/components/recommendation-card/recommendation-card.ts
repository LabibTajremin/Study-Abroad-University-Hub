import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { UniversityRecommendation } from '../../models/university.model';
import { CountryConfigService } from '../../services/country-config';
import { FlagIcon } from '../flag-icon/flag-icon';

@Component({
  selector: 'app-recommendation-card',
  imports: [CommonModule, RouterLink, MatIconModule, MatTooltipModule, FlagIcon],
  templateUrl: './recommendation-card.html',
  styleUrl: './recommendation-card.scss',
})
export class RecommendationCard implements OnInit {
  private readonly countryConfig = inject(CountryConfigService);

  @Input() recommendation!: UniversityRecommendation;
  @Input() rank = 1;

  flagIso2 = '';

  ngOnInit(): void {
    this.countryConfig.findCountry$(this.recommendation.countrySlug).subscribe((country) => {
      this.flagIso2 = country?.iso2 ?? '';
    });
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
