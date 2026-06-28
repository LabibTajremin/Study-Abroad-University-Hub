import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Country } from '../../models/country.model';
import { FlagIcon } from '../../components/flag-icon/flag-icon';

@Component({
  selector: 'app-coming-soon',
  imports: [CommonModule, RouterModule, MatIconModule, MatButtonModule, FlagIcon],
  templateUrl: './coming-soon.html',
  styleUrl: './coming-soon.scss',
})
export class ComingSoon {
  /** Pass the matched Country if one exists in the taxonomy but has no data file yet; null if the slug isn't registered at all. */
  @Input() country: Country | null = null;
}
