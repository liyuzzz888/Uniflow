import { readdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = path.join(root, 'build', 'UniFlow-darwin-arm64', 'UniFlow.app');
const localeRoots = [
  path.join(app, 'Contents', 'Resources'),
  path.join(app, 'Contents', 'Frameworks', 'Electron Framework.framework', 'Versions', 'A', 'Resources')
];
const keptLocales = new Set(['Base.lproj', 'en.lproj', 'ja.lproj', 'zh_CN.lproj']);
let removed = 0;

for (const localeRoot of localeRoots) {
  const entries = await readdir(localeRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.name.endsWith('.lproj') || keptLocales.has(entry.name)) continue;
    await rm(path.join(localeRoot, entry.name), { recursive: true, force: true });
    removed += 1;
  }
}

console.log(`Removed ${removed} unused Electron locale resources; kept Chinese, English, and Japanese.`);
