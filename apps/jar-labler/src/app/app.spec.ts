import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('Label editor', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['en-US']);
    TestBed.configureTestingModule({ imports: [App] });
  });
  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('creates a label, changes format, blocks incomplete rows, and prints only valid data', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const template = root.querySelector<HTMLSelectElement>('.template-select select')!;
    template.value = 'blank';
    template.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const print = root.querySelector<HTMLButtonElement>('.print-button')!;
    expect(print.disabled).toBe(true);
    const key = root.querySelector<HTMLInputElement>('.field-row input')!;
    const value = root.querySelector<HTMLTextAreaElement>('.field-row textarea')!;
    key.value = 'Product';
    key.dispatchEvent(new Event('input'));
    value.value = 'Cucumbers';
    value.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('.label-card dd')?.textContent).toBe('Cucumbers');
    expect(root.querySelector('.qr')?.getAttribute('src')).toContain('data:image/svg+xml');
    expect(print.disabled).toBe(false);
    for (const format of ['qr', 'large', 'compact']) {
      root.querySelector<HTMLInputElement>(`input[value="${format}"]`)!.click();
      await fixture.whenStable();
      expect(
        root.querySelector(`.label-card.${format === 'qr' ? 'qr-only' : format}`),
      ).not.toBeNull();
    }
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});
    print.click();
    expect(printSpy).toHaveBeenCalledOnce();
    root.querySelector<HTMLButtonElement>('.add-button')!.click();
    await fixture.whenStable();
    expect(root.querySelectorAll('.field-row').length).toBe(2);
    expect(print.disabled).toBe(true);
    expect(root.querySelector('.qr')).toBeNull();
    root.querySelectorAll<HTMLButtonElement>('.remove-button')[1]!.click();
    await fixture.whenStable();
    expect(print.disabled).toBe(false);
  });

  it('starts with the standard fields and allows switching to a blank template', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const rows = root.querySelectorAll<HTMLElement>('.field-row');
    expect(rows.length).toBe(5);
    expect(Array.from(rows, (row) => row.querySelector('input')?.value)).toEqual([
      'Product',
      'Packaging date',
      'Ingredients',
      'Recipe',
      'Storage conditions',
    ]);
    const dateValue = rows[1]?.querySelector('textarea')?.value ?? '';
    expect(dateValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);

    const template = root.querySelector<HTMLSelectElement>('.template-select select')!;
    template.value = 'blank';
    template.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelectorAll('.field-row').length).toBe(1);
    expect(root.querySelector<HTMLInputElement>('.field-row input')?.value).toBe('');
  });

  it('lays out the requested copies across A4 sheets for each print format', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const template = root.querySelector<HTMLSelectElement>('.template-select select')!;
    template.value = 'blank';
    template.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const key = root.querySelector<HTMLInputElement>('.field-row input')!;
    const value = root.querySelector<HTMLTextAreaElement>('.field-row textarea')!;
    key.value = 'Product';
    key.dispatchEvent(new Event('input'));
    value.value = 'Cucumbers';
    value.dispatchEvent(new Event('input'));
    const copies = root.querySelector<HTMLInputElement>('[name="label-copies"]')!;
    copies.value = '10';
    copies.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    expect(root.querySelectorAll('.print-label').length).toBe(10);
    expect(root.querySelectorAll('.print-sheet').length).toBe(2);
    root.querySelector<HTMLInputElement>('input[value="qr"]')!.click();
    await fixture.whenStable();
    expect(root.querySelectorAll('.print-sheet').length).toBe(1);
    root.querySelector<HTMLInputElement>('input[value="large"]')!.click();
    await fixture.whenStable();
    expect(root.querySelectorAll('.print-sheet').length).toBe(3);
  });

  it('offers image scanning while keeping the editor available', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    expect(root.querySelector<HTMLInputElement>('input[type="file"]')?.accept).toBe('image/*');
    expect(root.querySelector('.scan-button')?.textContent).toContain('Scan a label');
    expect(root.querySelector('.field-row input')).not.toBeNull();
  });

  it.each([
    ['ru', 'Этикетки для банок'],
    ['lt', 'Stiklainių etikečių kūrimas'],
    ['pl', 'Etykiety na słoiki'],
  ])('switches to %s without losing user input', async (language, title) => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const input = root.querySelector<HTMLInputElement>('.field-row input')!;
    input.value = 'My key';
    input.dispatchEvent(new Event('input'));
    const select = root.querySelector('select')!;
    select.value = language;
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelector('h1')?.textContent).toBe(title);
    expect(input.value).toBe('My key');
    expect(document.documentElement.lang).toBe(language);
  });

  it('translates default template keys but keeps edited keys and field values', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const rows = root.querySelectorAll<HTMLElement>('.field-row');
    const productKey = rows[0]!.querySelector<HTMLInputElement>('input')!;
    productKey.value = 'My custom name';
    productKey.dispatchEvent(new Event('input'));
    const packagingDate = rows[1]!.querySelector<HTMLTextAreaElement>('textarea')!;
    const dateValue = packagingDate.value;
    const languageSelect = root.querySelector<HTMLSelectElement>('.app-header select')!;
    languageSelect.value = 'ru';
    languageSelect.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(productKey.value).toBe('My custom name');
    expect(rows[1]!.querySelector<HTMLInputElement>('input')?.value).toBe('Дата упаковки');
    expect(packagingDate.value).toBe(dateValue);
    expect(rows[2]!.querySelector<HTMLInputElement>('input')?.value).toBe('Состав');
  });

  it('hides unchecked field text while keeping the field in the QR payload', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root = fixture.nativeElement as HTMLElement;
    const template = root.querySelector<HTMLSelectElement>('.template-select select')!;
    template.value = 'blank';
    template.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    const key = root.querySelector<HTMLInputElement>('.field-row input')!;
    const value = root.querySelector<HTMLTextAreaElement>('.field-row textarea')!;
    key.value = 'Secret note';
    key.dispatchEvent(new Event('input'));
    value.value = 'Keep chilled';
    value.dispatchEvent(new Event('input'));
    const showOnLabel = root.querySelector<HTMLInputElement>('.print-field-toggle input')!;
    showOnLabel.checked = false;
    showOnLabel.dispatchEvent(new Event('change'));
    await fixture.whenStable();

    expect(root.querySelector('.label-card .qr')).not.toBeNull();
    expect(root.querySelector('.label-card dd')).toBeNull();
    expect(root.querySelector('.print-label dd')).toBeNull();
    expect(root.querySelector('details pre')?.textContent).toContain('Keep chilled');
  });
});
