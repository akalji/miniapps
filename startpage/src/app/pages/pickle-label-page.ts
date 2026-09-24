import { Component, inject } from '@angular/core';
import { PickleLabelFeature } from '@miniapps/pickle-label-ui';
import { LanguageService } from '../core/i18n/language.service';

@Component({
  imports: [PickleLabelFeature],
  templateUrl: './pickle-label-page.html',
})
export class PickleLabelPage {
  protected readonly i18n = inject(LanguageService);
}
