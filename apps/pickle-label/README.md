# Jar Label Maker

Standalone Angular MiniApp that creates and prints QR labels for homemade preserves.
The same app opens by itself or is embedded in the MiniApps shell through the
`@miniapps/pickle-label-ui` Angular library owned by this folder.

Labels print on A4 sheets at 100% scale. Choose a label format and copy count;
the app arranges up to 15 QR-only, 9 small, or 4 large labels per sheet and adds
pages as needed. Disable browser headers and footers in the print dialog.

## Requirements

Use Node.js 24 LTS and npm 11.

## Run and verify independently

Run all commands from this folder:

```sh
npm ci
npm start
npm test -- --watch=false
npm run build
```

The standalone dev server opens at `http://localhost:4201/`. Tests cover both the
standalone app and reusable library. The build produces the independent app in
`dist/pickle-label/browser/` and the library in `projects/pickle-label-ui/dist/`.

## Shell integration

`projects/pickle-label-ui/` contains the public Angular package. It owns the label
editor, preview, QR generation and image scanning code. The shell consumes the
built package on `/tools/kitchen/`, passing its active language through the
component API. The shell build and dev scripts build and sync the package
automatically; do not import this app's source files into `startpage/`.
