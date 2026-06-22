import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Renders a real flag image (via flagcdn.com) instead of a Unicode flag emoji.
 * Emoji flags render as plain two-letter codes on some Windows configurations,
 * so this guarantees a consistent flag image across all browsers/OSes.
 */
@Component({
  selector: 'app-flag-icon',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flag-icon.html',
  styleUrl: './flag-icon.scss',
})
export class FlagIcon {
  /** ISO 3166-1 alpha-2 code (lowercase), e.g. "de", "gb-wls". */
  @Input() code: string | null = '';
  /** Rendered width in px; height follows the flag's natural aspect ratio. */
  @Input() size = 20;

  get src(): string {
    return `https://flagcdn.com/h80/${(this.code ?? '').toLowerCase()}.png`;
  }
}
