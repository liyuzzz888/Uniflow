import { copyFile, mkdir, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const modules = path.join(root, 'node_modules');
const target = path.join(root, 'dist', 'vendor');

async function copy(source, destination) {
  await mkdir(path.dirname(destination), { recursive: true });
  await copyFile(source, destination);
}

await copy(path.join(modules, 'tesseract.js', 'dist', 'tesseract.min.js'), path.join(target, 'tesseract', 'tesseract.min.js'));
await copy(path.join(modules, 'tesseract.js', 'dist', 'worker.min.js'), path.join(target, 'tesseract', 'worker.min.js'));
await copy(path.join(modules, 'tesseract.js', 'dist', 'tesseract.min.js.LICENSE.txt'), path.join(target, 'licenses', 'tesseract-js.txt'));
await copy(path.join(modules, 'tesseract.js-core', 'LICENSE'), path.join(target, 'licenses', 'tesseract-core.txt'));

const core = path.join(modules, 'tesseract.js-core');
for (const name of await readdir(core)) {
  if (/^tesseract-core.*\.(?:wasm|wasm\.js)$/.test(name)) {
    await copy(path.join(core, name), path.join(target, 'tesseract-core', name));
  }
}

for (const language of ['chi_sim', 'eng']) {
  await copy(
    path.join(modules, '@tesseract.js-data', language, '4.0.0', `${language}.traineddata.gz`),
    path.join(target, 'tessdata', `${language}.traineddata.gz`)
  );
}

console.log('Offline OCR assets prepared in dist/vendor.');
