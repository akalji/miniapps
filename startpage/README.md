# Startpage

The Angular application that hosts the MiniApps shell: navigation, language
selection, empty home page, and the Collection dropdown.

Run from the repository root:

```sh
npm ci
npm start
npm test -- --watch=false
npm run build
```

Angular workspace settings and dependencies are managed at the repository root.
Production output: `dist/startpage/browser/`.

Routes:

- `/`: home page
- `/tools/kitchen/jar-labler`: Jar Label Maker inside the shell
- `/tools/kitchen/` and the legacy `/tools/pickle-label`: redirect to the kitchen tool route
- `/tools` and other unmatched paths redirect to `/`.

The registry contains metadata and URLs, not MiniApp implementations.
The Collection button in the navigation opens a dropdown of registered apps
without navigating. It supports touch, keyboard focus, Escape, and outside-click dismissal.
There is no separate catalog page; entries come from `src/app/catalog/tool-registry.ts`.
Add a tool's ID, title and description in all supported languages, and its URL
to list it in the catalog. Jar Label Maker's route uses its built Angular library
package; the standalone app remains under `../apps/jar-labler/`.

Shell languages: Russian, English, Lithuanian, and Polish.
Startup priority: saved manual choice, first supported browser language, English.

Shell translations live in `src/app/core/i18n/translations.ts`.
MiniApps do not import this localization service. Jar Label Maker accepts the shell
language through the public library component inputs.

The footer quote stays in its original English across locales.
The GitHub icon is from [Primer Octicons](https://github.com/primer/octicons/blob/main/icons/mark-github-16.svg),
stored locally in `public/github-mark.svg`. Its MIT license is included in
`public/github-mark-LICENSE.txt`.
