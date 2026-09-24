import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { LanguageService } from './core/i18n/language.service';
import { languages } from './core/i18n/translations';
import { CollectionMenu } from './layout/collection-menu';

@Component({
  imports: [CollectionMenu, FormsModule, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  protected readonly languages = languages;
  protected readonly i18n = inject(LanguageService);
}
