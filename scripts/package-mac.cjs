const { packager } = require('@electron/packager');
const path = require('node:path');
const pkg = require('../package.json');

const projectRoot = path.resolve(__dirname, '..');
packager({
  dir: projectRoot,
  name: 'UniFlow',
  appBundleId: 'app.uniflow.desktop',
  appVersion: pkg.version,
  buildVersion: String(pkg.uniflowBuildNumber),
  platform: 'darwin',
  arch: 'arm64',
  out: path.join(projectRoot, 'build'),
  electronZipDir: process.env.UNIFLOW_ELECTRON_ZIP_DIR || undefined,
  overwrite: true,
  asar: true,
  icon: path.join(projectRoot, 'assets', 'UniFlow.icns'),
  // Package from a strict allow-list so personal files added beside the source
  // can never be swept into a release build.
  ignore: /^\/(?!desktop(?:\/|$)|dist(?:\/|$)|package\.json$).*/
}).then(paths => console.log(paths.join('\n'))).catch(error => {
  console.error(error);
  process.exitCode = 1;
});
