# MiniApps Development Guidelines

## Scope and Context

- This file defines repository-wide rules. Before making changes, read this file,
  `context.md`, and any `AGENTS.md` files in affected directories.
- More specific instructions may refine the rules for an app. Explicit user
  instructions take precedence. If they conflict with outdated sections of
  `context.md`, follow the current decisions below and update the documentation.
- Communicate with the user in Russian. Use English for identifiers in code.
- Study the existing code first. Make small, task-scoped changes, preserve user
  edits, and do not rewrite working code without a good reason.

## Current Goal and Architecture

- MVP: the platform foundation and one complete MiniApp. The first planned app is
  a label maker for homemade preserves (`jar-labler`).
- `startpage/` is the shell: menu, language selector, footer, home page, and app
  registry. The root `package.json`, `angular.json`, and `tsconfig.json` serve the shell.
- The home page remains empty until its design is ready. Collection is a dropdown,
  not a link to a catalog page. The old `/tools` route redirects to `/`.
- `apps/<app-id>/` contains the full context for a MiniApp: code, translations,
  assets, tests, README, dependencies, lockfile, and build configuration.
- MiniApps may currently be regular folders in this repository. Separate
  repositories and Git submodules are deferred until an app needs to be split out.
- Every MiniApp must run and build from its own directory. To verify independence,
  copy the directory elsewhere, install its dependencies, then run and build it
  without `startpage/` or the platform's root configuration.
- Do not import shell source into a MiniApp, MiniApp source into the shell, or code
  from a neighboring MiniApp. For integration, the shell may consume only a built,
  public Angular package owned by the MiniApp. Do not use its source, relative
  paths, or TypeScript aliases for integration.
- The shell stores only app metadata and URLs in
  `startpage/src/app/catalog/tool-registry.ts`; each app owns its own behavior.
- Jar Labler is integrated through `@miniapps/jar-labler-ui`, built from
  `apps/jar-labler/` and used by both the standalone app and the shell route. The
  shell keeps its own menu and localization; it passes the language through a
  public component input. Do not use an iframe, Web Components, or Module
  Federation for this integration.
- Choose the simplest working approach. Extract a shared package only when there
  is a proven need for reuse, not just because components look similar.
- Do not add a backend, database, NgRx, Docker, CI/CD, or new libraries without a
  concrete task. The primary hosting target is static files on a VPS with nginx
  and an SPA fallback.

## Angular

- Use Angular 22+, standalone components, Angular Router, and modern APIs. Do not
  introduce an NgModule architecture just to split code into feature directories.
- Use signals for local state and `computed` for derived values. Do not duplicate
  derived state or replace `computed` with side effects.
- Use `inject()` in keeping with the existing style. Mark template-only members
  `protected`, implementation details `private`, and immutable references `readonly`.
- Use `@if` and `@for`; provide a stable `track` expression for lists.
- Separate domain logic from components and presentation. Keep templates simple;
  move substantial logic into functions or small services.
- Use RxJS when streams are needed, without unnecessary subscriptions or nested
  `subscribe` calls. Manage subscription lifetimes with the async pipe or
  `takeUntilDestroyed`.
- Use browser APIs deliberately. The UI must continue working when localStorage
  is unavailable. Prefer Angular bindings over direct DOM changes.
- Preserve responsive layouts, semantic HTML, visible focus, and keyboard
  interaction. Use links for navigation and buttons for actions. Dropdowns must
  work with touch, close on Escape and outside clicks, and handle focus correctly.

## TypeScript and Formatting

- Follow `.editorconfig` and `.prettierrc`: two-space indentation, single quotes
  in TypeScript, semicolons, and a target line width of 100 characters. Format
  changed files; do not reformat the whole project as a side effect.
- Use `kebab-case` for file and directory names; `PascalCase` for classes,
  interfaces, and types; and `camelCase` for variables, functions, and properties.
  Use `UPPER_SNAKE_CASE` for true global constants and injection tokens.
- Do not prefix interfaces with `I`. Prefer clear names over abbreviations; name
  booleans by meaning, for example `isValid`, `hasItems`, and `canSubmit`.
- Prefer `const`; use `let` only when reassignment is needed. Do not use `var`.
- Prefer inferred types for obvious local values. Explicitly describe data
  contracts and public API arguments and return types where it improves clarity.
- Use `interface` for object contracts and `type` for unions, aliases, and
  transformations. Do not change existing declarations solely to satisfy this rule.
- Avoid `any`: accept external data as `unknown`, then validate and narrow it.
  JSON from QR codes, URLs, storage, or the network requires runtime validation;
  `as SomeType` is not a substitute for validation.
- Do not suppress errors with `@ts-ignore`, double casts, or unjustified `!`.
  Handle `null` and `undefined` explicitly. Prefer `??` for defaults when `0`,
  `false`, or an empty string are valid values.
- Prefer string unions and `as const` for small fixed sets. Use `readonly` for
  data that should not be changed through that contract.
- Write small functions with explicit dependencies, early returns, and `===` /
  `!==`. Do not introduce abstractions for hypothetical needs.
- Handle Promises and asynchronous errors. An empty `catch` is allowed only for an
  expected safe fallback with an explanation, as in localStorage handling.
- Comments should explain reasons and constraints, not restate the code.
- Do not weaken TypeScript or Angular checks to make a build pass. Enable `strict`
  and `strictTemplates` for new standalone apps. Do not assume these flags are
  enabled in the shell; check the actual tsconfig.

## Localization

- Supported languages are Russian (`ru`), English (`en`), Lithuanian (`lt`), and
  Polish (`pl`).
- Language priority: saved manual choice, then the first supported browser
  language, then English. Handle regional tags such as `pl-PL`; update `html.lang`.
- All ordinary user-facing text must have translation keys. Proper names and an
  approved English quote in the footer may remain untranslated.
- Each MiniApp owns its translation package and must not import the shell's service.
- The shell currently uses typed dictionaries and its own signal-based
  `LanguageService`. It does not use built-in Angular i18n or Transloco.
- The discussed direction is key-value dictionaries per language and a library
  such as Transloco. Migration has not happened; do not include it in unrelated work.
- When adding translation keys, update all four languages. Check long labels and
  mobile layout; do not maintain duplicate lists of supported languages.

## First Tool and QR

- The generator creates readable UTF-8 JSON and encodes it directly in the QR
  code. Do not minify or compress the payload by default.
- The payload contains `type` and `version`; the schema version is independent of
  the app version.
- Validate input and payload size in bytes. Readability of printed QR codes is
  more important than maximum capacity. Do not claim successful phone scanning
  without verifying it.

## Checks and Completion

- Before changing architecture, explain significant options and tradeoffs. Do not
  introduce architectural changes silently.
- From the repository root: `npm ci` installs dependencies; `npm start` runs the
  shell and MiniApp; `npm test -- --watch=false` runs shell tests; `npm run build`
  creates a production build. The shell and package output is under
  `dist/startpage/browser/`.
- Run MiniApp commands from its own directory and document them in its README.
- After code changes, run relevant tests and a production build. For documentation-
  only changes, checking the text and links is sufficient.
- Test behavior: routes, user actions, localization, validation, and errors. Do
  not create tests that merely repeat the implementation or add separate tests
  for simple, reversible style/text changes.
- Do not present a successful build as visual verification or a phone test. Report
  the result, checks performed, and any remaining limitations.
- Preserve LICENSE, NOTICE, and third-party asset licenses. Update documentation
  when commands, structure, or architectural agreements change.
