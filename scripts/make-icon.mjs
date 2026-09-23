import { access, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const exec = promisify(execFile);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'assets', 'UniFlow.svg');
const output = path.join(root, 'assets', 'UniFlow.iconset');
await mkdir(output, { recursive: true });

for (const size of [16, 32, 128, 256, 512]) {
  await sharp(source).resize(size, size).png().toFile(path.join(output, `icon_${size}x${size}.png`));
  await sharp(source).resize(size * 2, size * 2).png().toFile(path.join(output, `icon_${size}x${size}@2x.png`));
}
await sharp(source).resize(1024, 1024).png().toFile(path.join(root, 'assets', 'UniFlow-1024.png'));
const macIcon = path.join(root, 'assets', 'UniFlow.icns');
try {
  await exec('iconutil', ['-c', 'icns', output, '-o', macIcon]);
} catch (error) {
  // Some macOS releases reject otherwise valid iconsets. Keep the checked-in
  // ICNS so packaging remains reproducible when the artwork has not changed.
  await access(macIcon);
  console.warn('iconutil rejected the generated iconset; keeping the existing UniFlow.icns.');
}

const iosAssets = path.join(root, 'ios', 'App', 'App', 'Assets.xcassets');
try {
  await access(iosAssets);
  await sharp(source).resize(1024, 1024).flatten({ background: '#2866da' }).removeAlpha().png()
    .toFile(path.join(iosAssets, 'AppIcon.appiconset', 'AppIcon-512@2x.png'));

  const logo = await sharp(source).resize(760, 760).png().toBuffer();
  for (const name of ['splash-2732x2732.png', 'splash-2732x2732-1.png', 'splash-2732x2732-2.png']) {
    await sharp({ create: { width: 2732, height: 2732, channels: 3, background: '#19253b' } })
      .composite([{ input: logo, left: 986, top: 986 }]).png()
      .toFile(path.join(iosAssets, 'Splash.imageset', name));
  }
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
console.log('Mac and iPhone icons prepared.');
