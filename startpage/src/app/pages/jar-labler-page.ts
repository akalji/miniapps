import { Component, inject } from '@angular/core';
import { JarLablerFeature } from '@miniapps/jar-labler-ui';
import { LanguageService } from '../core/i18n/language.service';

@Component({
  imports: [JarLablerFeature],
  templateUrl: './jar-labler-page.html',
})
export class JarLablerPage {
  protected readonly i18n = inject(LanguageService);
}
