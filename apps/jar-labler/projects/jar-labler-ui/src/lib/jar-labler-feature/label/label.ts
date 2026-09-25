import { create } from 'qrcode';

export interface LabelField {
  readonly id: number;
  readonly key: string;
  readonly value: string;
  readonly showInPrint?: boolean;
}
export interface LabelPayload {
  readonly type: 'jar-label';
  readonly version: 1;
  readonly fields: readonly { readonly key: string; readonly value: string }[];
}
export type LabelError = 'empty' | 'incomplete' | 'duplicate' | 'tooMany' | 'tooLarge' | 'qrError';
export type LabelResult =
  | { readonly error: LabelError }
  | {
      readonly payload: LabelPayload;
      readonly json: string;
      readonly bytes: number;
      readonly qrUrl: string;
      readonly dense: boolean;
    };
export const MAX_FIELDS = 20;
export const MAX_BYTES = 1500;

export function parseLabel(text: string): LabelPayload | null {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    return null;
  }
  if (!value || typeof value !== 'object') return null;
  const payload = value as Record<string, unknown>;
  if (
    (payload['type'] !== 'jar-label' && payload['type'] !== 'pickle') ||
    payload['version'] !== 1 ||
    !Array.isArray(payload['fields'])
  ) {
    return null;
  }
  const fields: { key: string; value: string }[] = [];
  for (const field of payload['fields']) {
    if (!field || typeof field !== 'object') return null;
    const candidate = field as Record<string, unknown>;
    if (typeof candidate['key'] !== 'string' || typeof candidate['value'] !== 'string') return null;
    fields.push({ key: candidate['key'], value: candidate['value'] });
  }
  if (fields.length === 0 || fields.length > MAX_FIELDS) return null;
  if (fields.some((field) => !field.key.trim() || !field.value.trim())) return null;
  const keys = fields.map((field) => field.key.trim().normalize('NFC').toLowerCase());
  if (new Set(keys).size !== keys.length || new TextEncoder().encode(text).length > MAX_BYTES)
    return null;
  return { type: 'jar-label', version: 1, fields };
}

export function buildLabel(rows: readonly LabelField[]): LabelResult {
  if (rows.length > MAX_FIELDS) return { error: 'tooMany' };
  const fields = rows.map(({ key, value }) => ({ key: key.trim(), value: value.trim() }));
  if (!fields.length || fields.every((field) => !field.key && !field.value))
    return { error: 'empty' };
  if (fields.some((field) => !field.key || !field.value)) return { error: 'incomplete' };
  const keys = fields.map((field) => field.key.normalize('NFC').toLowerCase());
  if (new Set(keys).size !== keys.length) return { error: 'duplicate' };
  const payload: LabelPayload = { type: 'jar-label', version: 1, fields };
  const json = JSON.stringify(payload, null, 2);
  const bytes = new TextEncoder().encode(json).length;
  if (bytes > MAX_BYTES) return { error: 'tooLarge' };
  try {
    return { payload, json, bytes, qrUrl: qrDataUrl(json), dense: bytes > 1000 };
  } catch {
    return { error: 'qrError' };
  }
}

export function qrDataUrl(text: string): string {
  const { modules } = create(text, { errorCorrectionLevel: 'Q' });
  const size = modules.size + 8;
  const paths: string[] = [];
  for (let y = 0; y < modules.size; y++) {
    for (let x = 0; x < modules.size; x++) {
      if (modules.get(y, x)) paths.push(`M${x + 4} ${y + 4}h1v1h-1z`);
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><path fill="#fff" d="M0 0h${size}v${size}H0z"/><path fill="#000" d="${paths.join('')}"/></svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
