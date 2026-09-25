import { cp } from 'node:fs/promises';

// Copy only compiled static assets; neither application imports the other's sources.
await cp(
  new URL('../apps/jar-labler/dist/jar-labler/browser/', import.meta.url),
  new URL('../dist/startpage/browser/apps/jar-labler/', import.meta.url),
  { recursive: true },
);
console.log('Standalone label app included in dist/startpage/browser/apps/jar-labler/');
