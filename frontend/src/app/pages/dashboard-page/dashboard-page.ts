import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { UniversityService } from '../../services/university';
import { RecommendationService } from '../../services/recommendation';
import { CountryConfigService } from '../../services/country-config';
import { SeoService } from '../../services/seo';
import { FlagIcon } from '../../components/flag-icon/flag-icon';

interface StatCard {
  icon: string;
  value: string;
  label: string;
  color: string;
}

interface FeatureItem {
  icon: string;
  label: string;
  description: string;
  route: string;
  accent: string;
}

interface RegionStat {
  flag: string;
  iso2?: string;
  materialIcon?: string;
  label: string;
  count: number;
  slug: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [CommonModule, RouterLink, MatIconModule, FlagIcon],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
})
export class DashboardPage implements OnInit {
  private readonly universityService = inject(UniversityService);
  private readonly recommendationService = inject(RecommendationService);
  private readonly countryConfig = inject(CountryConfigService);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  stats: StatCard[] = [
    { icon: 'school',     value: '...',  label: 'Universities',      color: '#3B82F6' },
    { icon: 'public',     value: '...',  label: 'Countries',         color: '#10B981' },
    { icon: 'map',        value: '...',  label: 'Regions',           color: '#8B5CF6' },
    { icon: 'payments',   value: 'Free',  label: 'Min Tuition',       color: '#F59E0B' },
  ];

  browseCategories: FeatureItem[] = [
    {
      icon: 'manage_search',
      label: 'Find Universities',
      description: 'Enter your GPA, IELTS & budget to get personalized ranked matches across all countries.',
      route: '/find',
      accent: '#2563EB',
    },
    {
      icon: 'account_balance_wallet',
      label: 'By Budget',
      description: 'Filter universities by your maximum annual budget including tuition and living costs.',
      route: '/find',
      accent: '#059669',
    },
    {
      icon: 'school',
      label: 'By GPA',
      description: 'Find universities where your GPA meets the admission requirement.',
      route: '/find',
      accent: '#7C3AED',
    },
    {
      icon: 'translate',
      label: 'By IELTS Score',
      description: 'Discover universities that match your English proficiency band score.',
      route: '/find',
      accent: '#0891B2',
    },
    {
      icon: 'emoji_events',
      label: 'Admission Difficulty',
      description: 'Browse by how competitive the admission process is — from easy to highly competitive.',
      route: '/find',
      accent: '#D97706',
    },
    {
      icon: 'card_giftcard',
      label: 'Scholarship Available',
      description: 'Show only universities that offer scholarships or financial aid for international students.',
      route: '/find',
      accent: '#DC2626',
    },
    {
      icon: 'event_available',
      label: 'Study Gap Allowed',
      description: 'Find universities that accept students with a study gap in their academic history.',
      route: '/find',
      accent: '#EA580C',
    },
  ];

  regionStats: RegionStat[] = [];

  ngOnInit(): void {
    this.seo.update({
      title: 'Dashboard',
      description:
        'Study Abroad University Hub — explore universities across the globe, compare tuition and requirements, and get personalised recommendations for studying abroad.',
      path: '/',
    });

    this.countryConfig.regionGroups$.subscribe((groups) => {
      this.regionStats = groups.map((g) => ({
        flag: g.icon,
        iso2: g.iso2,
        materialIcon: g.materialIcon,
        label: g.label,
        count: g.countries.length,
        slug: g.countries.length === 1 ? g.countries[0].slug : '',
      }));
      this.stats[2].value = String(groups.length);
    });

    this.universityService.getAllCountrySlugs$().subscribe((slugs) => {
      this.stats[1].value = String(slugs.length);
    });

    this.recommendationService.loadAllCountries().subscribe((unis) => {
      const rounded = Math.floor(unis.length / 100) * 100;
      this.stats[0].value = `${rounded}+`;
    });
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
  }
}
