import { DOCUMENT } from '@angular/common';
import { computed, inject, Injectable, signal } from '@angular/core';
import { en, Messages } from './en';
import { ru } from './ru';
import { lt } from './lt';
import { pl } from './pl';

export const languages = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'lt', label: 'Lietuvių' },
  { code: 'pl', label: 'Polski' },
] as const;
export type Language = (typeof languages)[number]['code'];
const messages: Record<Language, Messages> = { en, ru, lt, pl };
function isLanguage(value: unknown): value is Language {
  return languages.some((item) => item.code === value);
}

@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly document = inject(DOCUMENT);
  private readonly selected = signal<Language>(this.detect());
  readonly language = this.selected.asReadonly();
  readonly text = computed(() => messages[this.language()]);

  constructor() {
    this.document.documentElement.lang = this.language();
  }

  setLanguage(value: string): void {
    if (!isLanguage(value)) return;
    this.applyLanguage(value);
    try {
      this.document.defaultView?.localStorage.setItem('pickle-label.language', value);
    } catch {
      /* Switching works without persistent storage. */
    }
  }

  setHostLanguage(value: Language): void {
    this.applyLanguage(value);
  }

  private applyLanguage(value: Language): void {
    this.selected.set(value);
    this.document.documentElement.lang = value;
  }

  private detect(): Language {
    const window = this.document.defaultView;
    // An explicit launch language is the only integration contract with the host.
    const launchLanguage = new URLSearchParams(window?.location.search).get('lang');
    if (isLanguage(launchLanguage)) return launchLanguage;
    try {
      const stored = window?.localStorage.getItem('pickle-label.language');
      if (isLanguage(stored)) return stored;
    } catch {
      /* Fall back to browser preferences. */
    }
    const preferred = window?.navigator.languages?.length
      ? window.navigator.languages
      : [window?.navigator.language ?? ''];
    for (const locale of preferred) {
      const language = locale.toLowerCase().split('-')[0];
      if (isLanguage(language)) return language;
    }
    return 'en';
  }
}
