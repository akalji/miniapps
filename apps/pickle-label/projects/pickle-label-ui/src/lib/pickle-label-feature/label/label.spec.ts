import jsQR from 'jsqr';
import { buildLabel, LabelField, MAX_BYTES, parseLabel } from './label';

const row = (key: string, value: string, id = 1): LabelField => ({ key, value, id });

describe('Label payload and QR', () => {
  it('accepts only supported, well-formed label payloads when scanning', () => {
    expect(
      parseLabel('{"type":"pickle","version":1,"fields":[{"key":"Product","value":"Cukes"}]}'),
    ).toEqual({ type: 'pickle', version: 1, fields: [{ key: 'Product', value: 'Cukes' }] });
    expect(parseLabel('not json')).toBeNull();
    expect(parseLabel('{"type":"pickle","version":2,"fields":[]}')).toBeNull();
    expect(parseLabel('{"type":"pickle","version":1,"fields":[{"key":1,"value":"x"}]}')).toBeNull();
  });

  it('keeps hidden display settings out of the payload while encoding every field', () => {
    const result = buildLabel([
      { id: 1, key: 'Secret note', value: 'Keep chilled', showInPrint: false },
    ]);

    expect('error' in result).toBe(false);
    if ('error' in result) return;
    expect(result.payload.fields).toEqual([{ key: 'Secret note', value: 'Keep chilled' }]);
    expect(result.json).toContain('Keep chilled');
    expect(result.json).not.toContain('showInPrint');
  });

  it('round-trips the generated QR SVG through an independent decoder with Unicode data', () => {
    const result = buildLabel([
      row('Продукт', 'Огурцы 🥒'),
      row('Skład', 'Sól, cukier\nKrapai', 2),
    ]);
    if ('error' in result) throw new Error(result.error);
    expect(result.payload).toEqual({
      type: 'pickle',
      version: 1,
      fields: [
        { key: 'Продукт', value: 'Огурцы 🥒' },
        { key: 'Skład', value: 'Sól, cukier\nKrapai' },
      ],
    });
    expect(result.json).toContain('\n  "type": "pickle"');
    expect(result.bytes).toBe(new TextEncoder().encode(result.json).length);
    expect(result.bytes).toBeGreaterThan(result.json.length);

    const svg = decodeURIComponent(result.qrUrl.split(',')[1] ?? '');
    const modules = Number(svg.match(/viewBox="0 0 (\d+)/)?.[1]);
    expect(modules).toBeGreaterThan(8);
    const scale = 5;
    const size = modules * scale;
    const pixels = new Uint8ClampedArray(size * size * 4).fill(255);
    for (const match of svg.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
      const x = Number(match[1]) * scale;
      const y = Number(match[2]) * scale;
      for (let dy = 0; dy < scale; dy++)
        for (let dx = 0; dx < scale; dx++) {
          const offset = ((y + dy) * size + x + dx) * 4;
          pixels[offset] = pixels[offset + 1] = pixels[offset + 2] = 0;
        }
    }
    expect(jsQR(pixels, size, size)?.data).toBe(result.json);
  });

  it('rejects empty, incomplete, and duplicate fields instead of printing stale data', () => {
    expect(buildLabel([])).toEqual({ error: 'empty' });
    expect(buildLabel([row(' ', ' ')])).toEqual({ error: 'empty' });
    expect(buildLabel([row('Продукт', '')])).toEqual({ error: 'incomplete' });
    expect(buildLabel([row(' A ', '1'), row('a', '2', 2)])).toEqual({ error: 'duplicate' });
  });

  it('enforces byte and field limits and warns about dense QR codes', () => {
    expect(buildLabel([row('key', 'я'.repeat(MAX_BYTES))])).toEqual({ error: 'tooLarge' });
    expect(buildLabel(Array.from({ length: 21 }, (_, id) => row(String(id), 'value', id)))).toEqual(
      { error: 'tooMany' },
    );
    const dense = buildLabel([row('key', 'a'.repeat(1100))]);
    if ('error' in dense) throw new Error(dense.error);
    expect(dense.dense).toBe(true);
    expect(dense.bytes).toBeLessThanOrEqual(MAX_BYTES);
  });

  it('keeps user keys as data, including special object property names', () => {
    const result = buildLabel([row('__proto__', '<script>alert(1)</script>')]);
    if ('error' in result) throw new Error(result.error);
    expect(JSON.parse(result.json).fields[0].key).toBe('__proto__');
  });
});
