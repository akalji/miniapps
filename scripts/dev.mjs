import { spawn, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const app = resolve(root, 'apps/jar-labler');
if (!existsSync(resolve(app, 'node_modules/@angular/cli/bin/ng.js'))) {
  console.error('Install app dependencies first: npm ci --prefix apps/jar-labler');
  process.exit(1);
}
const ng = resolve(app, 'node_modules/@angular/cli/bin/ng.js');
const libraryBuild = spawnSync(
  process.execPath,
  [ng, 'build', 'jar-labler-ui', '--configuration', 'development'],
  {
    cwd: app,
    stdio: 'inherit',
    windowsHide: true,
  },
);
if (libraryBuild.status !== 0) process.exit(libraryBuild.status ?? 1);
const librarySync = spawnSync(process.execPath, [resolve(app, 'scripts/sync-library.mjs')], {
  cwd: app,
  stdio: 'inherit',
  windowsHide: true,
});
if (librarySync.status !== 0) process.exit(librarySync.status ?? 1);

const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const { cwd, executable, args } of [
  {
    cwd: app,
    executable: process.execPath,
    args: [resolve(app, 'scripts/sync-library.mjs'), '--watch'],
  },
  {
    cwd: app,
    executable: process.execPath,
    args: [ng, 'build', 'jar-labler-ui', '--watch', '--configuration', 'development'],
  },
  {
    cwd: app,
    executable: process.execPath,
    args: [ng, 'serve', '--configuration', 'hosted', '--port', '4201'],
  },
  {
    cwd: root,
    executable: process.execPath,
    args: [resolve(root, 'node_modules/@angular/cli/bin/ng.js'), 'serve', 'startpage'],
  },
]) {
  const child = spawn(executable, args, {
    cwd,
    stdio: 'inherit',
    windowsHide: true,
  });
  children.push(child);
  child.on('error', (error) => {
    console.error(error);
    stop(1);
  });
  child.on('exit', (code) => stop(code ?? 0));
}
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
