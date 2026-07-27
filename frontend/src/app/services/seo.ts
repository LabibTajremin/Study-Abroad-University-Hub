import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

const SITE_NAME = 'Study Abroad University Hub';
const BASE_URL = 'https://study-abroad-university-hub.vercel.app';
const DEFAULT_DESCRIPTION =
  'Discover, compare and shortlist universities across Europe, the UK, USA, Asia and beyond — built for international students.';

export interface SeoData {
  title?: string;
  description?: string;
  /** Path (e.g. "/country/germany") used to build the canonical URL. Defaults to the current location. */
  path?: string;
}

/**
 * Centralises per-route SEO metadata: document title, meta description and the
 * canonical/Open Graph tags. Pages call `update()` whenever their content
 * changes so search engines and social cards reflect the active view — without
 * any change to the visual UI.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  update(data: SeoData): void {
    const fullTitle = data.title ? `${data.title} — ${SITE_NAME}` : SITE_NAME;
    const description = data.description ?? DEFAULT_DESCRIPTION;
    const url = BASE_URL + (data.path ?? this.doc.location?.pathname ?? '/');

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: description });

    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:description', content: description });

    this.setCanonical(url);
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
