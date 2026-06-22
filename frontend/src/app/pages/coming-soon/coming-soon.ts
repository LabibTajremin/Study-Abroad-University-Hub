import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';
import { REGION_GROUPS, Country } from '../../models/country.model';
import { FlagIcon } from '../../components/flag-icon/flag-icon';

@Component({
  selector: 'app-coming-soon',
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, FlagIcon],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
})
export class ComingSoon implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private sub!: Subscription;

  country: Country | null = null;
  countrySlug = '';

  ngOnInit(): void {
    this.sub = this.route.params.subscribe((params) => {
      this.countrySlug = params['country'];
      this.country =
        REGION_GROUPS.flatMap((g) => g.countries).find((c) => c.slug === this.countrySlug) || null;
    });
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
