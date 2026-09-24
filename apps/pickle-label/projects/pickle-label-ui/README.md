# Jar Label Maker UI package

This Angular library is the public integration API for Jar Label Maker. It owns the
standalone `PickleLabelFeature` component and its label, QR, scanning, translation,
and presentation logic.

The shell uses the package through the component's public inputs: `embedded` hides
the standalone language selector, and `hostLanguage` follows the shell's selected
language. Build it from `apps/pickle-label/` with `npm run build:lib`.

Keep the component usable by the standalone Jar Label Maker app. Do not add shell
imports or dependencies to this package.
