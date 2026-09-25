import { cp, watch } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const libraryDist = resolve(appRoot, 'projects/jar-labler-ui/dist');
const packageName = '@miniapps/jar-labler-ui';
const targets = [
  resolve(appRoot, `node_modules/${packageName}`),
  resolve(appRoot, `../../node_modules/${packageName}`),
];

async function syncLibrary() {
  for (const target of targets) {
    await cp(libraryDist, target, { recursive: true, force: true });
  }
}

await syncLibrary();

if (process.argv.includes('--watch')) {
  let pending;
  for await (const event of watch(libraryDist, { recursive: true })) {
    clearTimeout(pending);
    pending = setTimeout(() => {
      void syncLibrary().catch((error) => console.error(error));
    }, 120);
  }
}
