import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { isLanguage, Language, translations } from './translations';

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly selectedLanguage = signal<Language>(this.readLanguage());
  readonly language = this.selectedLanguage.asReadonly();
  readonly text = computed(() => translations[this.language()]);

  constructor() {
    this.document.documentElement.lang = this.language();
  }

  setLanguage(value: string): void {
    if (!isLanguage(value)) return;

    this.selectedLanguage.set(value);
    this.document.documentElement.lang = value;
    try {
      this.document.defaultView?.localStorage.setItem('miniapps.language', value);
    } catch {
      // Language switching still works when browser storage is unavailable.
    }
  }

  private readLanguage(): Language {
    try {
      const stored = this.document.defaultView?.localStorage.getItem('miniapps.language');
      if (isLanguage(stored)) return stored;
    } catch {
      // Browser preferences remain available when storage is blocked.
    }

    const navigator = this.document.defaultView?.navigator;
    const preferred = navigator?.languages?.length
      ? navigator.languages
      : [navigator?.language ?? ''];

    for (const locale of preferred) {
      const language = locale.toLowerCase().split('-')[0];
      if (isLanguage(language)) return language;
    }

    return 'en';
  }
}
