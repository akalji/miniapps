import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { TOOL_REGISTRY, ToolDefinition } from '../catalog/tool-registry';
import { LanguageService } from '../core/i18n/language.service';

@Component({
  selector: 'app-collection-menu',
  templateUrl: './collection-menu.html',
  styleUrl: './collection-menu.scss',
  host: {
    '(document:click)': 'onDocumentClick($event)',
    '(document:keydown.escape)': 'onEscape()',
    '(focusout)': 'onFocusOut($event)',
  },
})
export class CollectionMenu {
  protected readonly i18n = inject(LanguageService);
  protected readonly tools = inject(TOOL_REGISTRY);
  protected readonly categories = ['kitchen'] as const;
  private readonly document = inject(DOCUMENT);
  protected readonly open = signal(false);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');

  protected toolUrl(tool: ToolDefinition): string {
    if (!tool.acceptsLanguage) return tool.url;
    const url = new URL(tool.url, this.document.baseURI);
    url.searchParams.set('lang', this.i18n.language());
    return url.href;
  }

  protected onDocumentClick(event: Event): void {
    if (!this.element.nativeElement.contains(event.target as Node)) this.open.set(false);
  }

  protected onEscape(): void {
    if (!this.open()) return;
    this.open.set(false);
    this.trigger()?.nativeElement.focus();
  }

  protected onFocusOut(event: FocusEvent): void {
    if (!this.element.nativeElement.contains(event.relatedTarget as Node | null)) {
      this.open.set(false);
    }
  }
}
