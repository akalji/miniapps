import { InjectionToken } from '@angular/core';
import { Language } from '../core/i18n/translations';

export interface ToolDefinition {
  readonly id: string;
  readonly title: Readonly<Record<Language, string>>;
  readonly description: Readonly<Record<Language, string>>;
  readonly url: string;
  readonly category: 'kitchen';
  readonly acceptsLanguage?: boolean;
}

// Register tools here once they have a runnable URL. Keep implementations in apps/.
export const tools: readonly ToolDefinition[] = [
  {
    id: 'pickle-label',
    category: 'kitchen',
    url: '/tools/kitchen/jar-labler',
    title: {
      ru: 'Этикетки для банок',
      en: 'Jar Label Maker',
      lt: 'Stiklainių etikečių kūrimas',
      pl: 'Etykiety na słoiki',
    },
    description: {
      ru: 'Этикетки с QR-кодом для домашних заготовок.',
      en: 'QR labels for homemade preserves.',
      lt: 'QR etiketės naminiams konservams.',
      pl: 'Etykiety QR na domowe przetwory.',
    },
  },
];

export const TOOL_REGISTRY = new InjectionToken<readonly ToolDefinition[]>('Tool registry', {
  providedIn: 'root',
  factory: () => tools,
});
