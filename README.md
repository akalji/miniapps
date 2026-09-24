# MiniApps

An open source collection of small, useful web applications.

This repository contains the startpage shell, built with Angular 22,
TypeScript, standalone components, Angular Router, and SCSS.

## Development

Use Node.js 24.15.0 or newer in the Node.js 24 LTS line and npm 11.

```sh
npm ci
npm start
```

Open http://localhost:4200/. The development server reloads when source files change.

## Verification

```sh
npm test -- --watch=false
npm run build
```

The production build is written to `dist/startpage/browser/`.
For interactive test development, run `npm test`.

## Architecture

`startpage/` contains the shell, menu, localization, home page (`/`), and
Collection dropdown. The home page is empty pending design; `/tools` redirects to `/`.
All independent MiniApps belong under `apps/`.
The root build compiles the MiniApp-owned `@miniapps/pickle-label-ui` library,
then the shell, and packages the standalone MiniApp for deployment.

```text
miniapps/
  startpage/
    src/app/
      catalog/       # Tool metadata and URLs
      core/i18n/     # Shell translations
      pages/         # Home and embedded Jar Label Maker route
      layout/        # Collection dropdown
    public/
    tsconfig.app.json
    tsconfig.spec.json
  apps/pickle-label/ # Standalone app and its public Angular library package
  angular.json       # startpage Angular project
  package.json       # Shell dependencies and commands
  tsconfig.json
```

Tools are listed from `startpage/src/app/catalog/tool-registry.ts` with
localized titles and descriptions. Add a tool once it has a runnable URL.
Jar Label Maker is listed in the registry and opens at `/tools/kitchen/` inside
the shell. Other registered tools may link to independently hosted applications.

## Languages

The master app supports Russian, English, Lithuanian, and Polish.
On startup it uses the saved manual choice, then the first supported language
in the browser's ordered preferences (`navigator.languages`, or `navigator.language`
when that list is empty), then English. Regional tags such as `pl-PL` map to `pl`.
Automatic detection is not saved, so browser preferences apply until a manual choice is made.
The language selector
updates navigation and page text without reloading, saves the choice in
`localStorage` under `miniapps.language`, and updates the document language.
Switching still works if browser storage is unavailable.

Translations are defined in `startpage/src/app/core/i18n/translations.ts` and accessed
through a small custom `LanguageService` using Angular signals, rather than Angular i18n.
The shared contract is `Translations`; TypeScript checks that every dictionary
contains all text keys. To add a language, extend the `languages` list and
supply its complete dictionary in `translations`. The selector and validation
use that list automatically. Tool metadata must also include the new language.
MiniApps remain independent and do not import this service. The shell passes its
current language to the embedded Jar Label Maker component through its package API.

## MiniApp integration

MiniApps initially live in ordinary folders under `apps/`. They can later be
extracted into separate repositories and connected as Git submodules.
Each MiniApp must remain independently buildable and deployable, without importing
code from the master application. Jar Label Maker owns an Angular library package;
the shell consumes that built public package for its nested route, while the
standalone app wraps the same component. Other catalog entries can point to
separate static deployments. See
[startpage/README.md](startpage/README.md) and [apps/README.md](apps/README.md).

See [AGENTS.md](AGENTS.md) for development rules and TypeScript conventions,
and [context.md](context.md) for project requirements and MVP priorities.

## Hosting

The application is a static SPA intended for an existing VPS with nginx.
Serve `dist/startpage/browser/` with an SPA fallback for Angular routes:

```nginx
location / {
    try_files $uri $uri/ /index.html;
}
```

MiniApps served as separate deployments also need an SPA fallback at their own base path.

### GitHub Pages

`.github/workflows/deploy-pages.yml` builds and deploys the site on pushes to
`main` and on manual runs. It tests both the shell and MiniApp, builds with the
Pages base path (including repository subpaths), and publishes Angular's output
with a fallback page for direct route links.

To enable the first deployment, open **Settings → Pages** and set the build and
deployment source to **GitHub Actions**. The workflow deploys the site after that
setting is enabled.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
