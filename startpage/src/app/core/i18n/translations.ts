export const ru = {
  navigation: 'Основная навигация',
  home: 'Главная',
  collection: 'Коллекция',
  kitchen: 'Кухня',
  collectionEmpty: 'Приложений пока нет.',
  language: 'Язык',
  skipToContent: 'Перейти к содержимому',
};

export type Translations = Record<keyof typeof ru, string>;
export const languages = [
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
  { code: 'lt', label: 'Lietuvių' },
  { code: 'pl', label: 'Polski' },
] as const;

export type Language = (typeof languages)[number]['code'];

export function isLanguage(value: unknown): value is Language {
  return languages.some((language) => language.code === value);
}

export const en: Translations = {
  navigation: 'Main navigation',
  home: 'Home',
  collection: 'Collection',
  kitchen: 'Kitchen',
  collectionEmpty: 'No apps yet.',
  language: 'Language',
  skipToContent: 'Skip to content',
};

export const lt: Translations = {
  navigation: 'Pagrindinė navigacija',
  home: 'Pradžia',
  collection: 'Kolekcija',
  kitchen: 'Virtuvė',
  collectionEmpty: 'Programėlių dar nėra.',
  language: 'Kalba',
  skipToContent: 'Pereiti prie turinio',
};

export const pl: Translations = {
  navigation: 'Nawigacja główna',
  home: 'Strona główna',
  collection: 'Kolekcja',
  kitchen: 'Kuchnia',
  collectionEmpty: 'Nie ma jeszcze aplikacji.',
  language: 'Język',
  skipToContent: 'Przejdź do treści',
};

export const translations: Record<Language, Translations> = { ru, en, lt, pl };
