import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const version = pkg.version;
const build = pkg.uniflowBuildNumber;
const checkOnly = process.argv.includes('--check');

if (!/^\d+\.\d+\.\d+$/.test(version) || !Number.isSafeInteger(build) || build < 1) {
  throw new Error('Set a numeric x.y.z version and positive uniflowBuildNumber in package.json.');
}

const versionFile = path.join(root, 'dist', 'version.js');
const versionSource = `window.UNIFLOW_VERSION = Object.freeze({ version: ${JSON.stringify(version)}, build: ${build} });\n`;
const indexFile = path.join(root, 'dist', 'index.html');
const iosProject = path.join(root, 'ios', 'App', 'App.xcodeproj', 'project.pbxproj');

async function syncFile(filename, expected) {
  if (checkOnly) {
    const actual = await readFile(filename, 'utf8');
    if (actual !== expected) throw new Error(`Version is out of sync: ${filename}`);
  } else {
    await writeFile(filename, expected);
  }
}

await syncFile(versionFile, versionSource);

const indexSource = await readFile(indexFile, 'utf8');
const versionedIndexSource = indexSource.replace(
  /(src="\.\/(?:version|schedule|history|app)\.js)(?:\?v=[^"]*)?"/g,
  `$1?v=${build}"`
);
if (checkOnly) {
  if (indexSource !== versionedIndexSource) throw new Error(`Version is out of sync: ${indexFile}`);
} else if (indexSource !== versionedIndexSource) {
  await writeFile(indexFile, versionedIndexSource);
}

let project;
try {
  project = await readFile(iosProject, 'utf8');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}

if (project) {
  const marketing = project.match(/MARKETING_VERSION = [^;]+;/g) || [];
  const builds = project.match(/CURRENT_PROJECT_VERSION = [^;]+;/g) || [];
  if (marketing.length !== 2 || builds.length !== 2) {
    throw new Error('Could not find both iOS version settings.');
  }
  const updated = project
    .replace(/MARKETING_VERSION = [^;]+;/g, `MARKETING_VERSION = ${version};`)
    .replace(/CURRENT_PROJECT_VERSION = [^;]+;/g, `CURRENT_PROJECT_VERSION = ${build};`);
  await syncFile(iosProject, updated);
}

console.log(`UniFlow ${version} (${build}) ${checkOnly ? 'verified' : 'synchronized'}.`);
