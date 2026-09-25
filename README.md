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

## Applications

The repository contains the Angular shell in `startpage/` and independent tools in
`apps/`. Jar Label Maker is available inside the shell at
`/tools/kitchen/jar-labler`. Each application has its own README with its commands
and requirements. See [apps/README.md](apps/README.md) for MiniApp conventions.

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

To enable deployment, open **Settings → Pages** and select **GitHub Actions** as
the build and deployment source.

## License

Apache-2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
