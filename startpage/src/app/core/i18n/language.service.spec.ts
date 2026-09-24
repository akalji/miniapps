import { TestBed } from '@angular/core/testing';
import { LanguageService } from './language.service';

describe('LanguageService', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['fr-FR']);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('fr-FR');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it.each([
    { locales: ['ru-RU'], expected: 'ru' },
    { locales: ['en-US'], expected: 'en' },
    { locales: ['lt-LT'], expected: 'lt' },
    { locales: ['PL-pl'], expected: 'pl' },
    { locales: ['fr-FR', 'pl-PL', 'en-US'], expected: 'pl' },
    { locales: ['en-GB', 'lt-LT'], expected: 'en' },
    { locales: ['de-DE', 'fr-FR'], expected: 'en' },
    { locales: [], expected: 'en' },
  ])('detects $expected from $locales', ({ locales, expected }) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(locales);
    const service = TestBed.inject(LanguageService);
    expect(service.language()).toBe(expected);
    expect(document.documentElement.lang).toBe(expected);
    expect(localStorage.getItem('miniapps.language')).toBeNull();
  });

  it('uses navigator.language when the language list is empty', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('lt-LT');
    expect(TestBed.inject(LanguageService).language()).toBe('lt');
  });

  it('prefers a saved choice to browser preferences', () => {
    localStorage.setItem('miniapps.language', 'ru');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl-PL']);
    expect(TestBed.inject(LanguageService).language()).toBe('ru');
  });

  it('ignores unsupported saved values and detects the browser language', () => {
    localStorage.setItem('miniapps.language', 'fr');
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['lt-LT']);
    const service = TestBed.inject(LanguageService);
    expect(service.language()).toBe('lt');
    service.setLanguage('de');
    expect(service.language()).toBe('lt');
  });

  it('detects and switches language even when browser storage is blocked', () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['pl-PL']);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Blocked');
    });
    const service = TestBed.inject(LanguageService);
    expect(service.language()).toBe('pl');
    service.setLanguage('en');
    expect(service.text().home).toBe('Home');
    expect(document.documentElement.lang).toBe('en');
  });
});
