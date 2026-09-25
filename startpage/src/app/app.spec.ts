import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { App } from './app';
import { routes } from './app.routes';
import { TOOL_REGISTRY } from './catalog/tool-registry';

describe('App navigation and localization', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['ru-RU']);
    TestBed.configureTestingModule({ imports: [App], providers: [provideRouter(routes)] });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('opens and translates Collection without navigating, then closes on Escape or outside click', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector<HTMLButtonElement>('app-collection-menu button')!;
    const dropdown = root.querySelector<HTMLElement>('#collection-items')!;
    expect(dropdown.hidden).toBe(true);
    trigger.click();
    await fixture.whenStable();
    expect(dropdown.hidden).toBe(false);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(router.url).toBe('/');

    const select = root.querySelector('select')!;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(trigger.textContent).toContain('Collection');
    expect(dropdown.textContent).toContain('Kitchen');
    const labelLink = dropdown.querySelector<HTMLAnchorElement>('a')!;
    expect(labelLink.textContent).toContain('Jar Label Maker');
    expect(new URL(labelLink.href).pathname).toBe('/tools/kitchen/jar-labler');
    expect(new URL(labelLink.href).searchParams.has('lang')).toBe(false);
    expect(router.url).toBe('/');

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    await fixture.whenStable();
    expect(dropdown.hidden).toBe(true);
    expect(document.activeElement).toBe(trigger);
    trigger.click();
    await fixture.whenStable();
    document.body.click();
    await fixture.whenStable();
    expect(dropdown.hidden).toBe(true);
  });

  it('renders the label tool inside the shell and synchronizes its language', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/tools/kitchen/jar-labler');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('header .brand')?.textContent).toContain('MiniApps');
    expect(root.querySelector('lib-jar-labler')).not.toBeNull();
    expect(root.querySelector('.app-header h1')?.textContent).toContain('Этикетки для банок');
    expect(root.querySelector('.app-header select')).toBeNull();
    await router.navigateByUrl('/tools/kitchen');
    await fixture.whenStable();
    expect(router.url).toBe('/tools/kitchen/jar-labler');

    const select = root.querySelector<HTMLSelectElement>('header select')!;
    select.value = 'en';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelector('.app-header h1')?.textContent).toContain('Jar Label Maker');
    expect(root.querySelectorAll<HTMLInputElement>('.field-row input[type="text"]')[1]?.value).toBe(
      'Packaging date',
    );
  });

  it('redirects the previous label routes to the current tool route', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    for (const oldRoute of ['/tools/pickle-label', '/tools/kitchen', '/tools/kitchen/']) {
      await router.navigateByUrl(oldRoute);
      await fixture.whenStable();
      expect(router.url).toBe('/tools/kitchen/jar-labler');
      expect(fixture.nativeElement.querySelector('lib-jar-labler')).not.toBeNull();
    }
  });
  it('lists registered apps and closes when focus leaves the collection', async () => {
    TestBed.overrideProvider(TOOL_REGISTRY, {
      useValue: [
        {
          id: 'example',
          category: 'kitchen',
          title: { ru: 'Пример', en: 'Example', lt: 'Pavyzdys', pl: 'Przykład' },
          description: { ru: '', en: '', lt: '', pl: '' },
          url: 'https://example.com/tool/',
        },
      ],
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const trigger = root.querySelector<HTMLButtonElement>('app-collection-menu button')!;
    trigger.click();
    await fixture.whenStable();
    const link = root.querySelector<HTMLAnchorElement>('#collection-items a')!;
    expect(link.textContent).toBe('Пример');
    expect(link.getAttribute('href')).toBe('https://example.com/tool/');
    link.focus();
    root.querySelector('select')!.focus();
    await fixture.whenStable();
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it.each([
    ['en', 'Collection'],
    ['lt', 'Kolekcija'],
    ['pl', 'Kolekcja'],
  ])('redirects /tools to the empty home page and restores %s', async (code, title) => {
    localStorage.setItem('miniapps.language', code);
    const fixture = TestBed.createComponent(App);
    await TestBed.inject(Router).navigateByUrl('/tools');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector('select')?.value).toBe(code);
    expect(TestBed.inject(Router).url).toBe('/');
    expect(root.querySelector('app-home')?.textContent).toBe('');
    expect(root.querySelector('app-collection-menu button')?.textContent).toContain(title);
    expect(document.documentElement.lang).toBe(code);
  });

  it.each([
    ['lt', 'Pradžia'],
    ['pl', 'Strona główna'],
  ])('switches to %s through the selector and saves the choice', async (code, home) => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const select = root.querySelector('select')!;
    select.value = code;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelector('nav a')?.textContent).toBe(home);
    expect(localStorage.getItem('miniapps.language')).toBe(code);
    expect(document.documentElement.lang).toBe(code);
    expect(router.url).toBe('/');
  });
});
